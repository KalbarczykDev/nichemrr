import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { StartupCache } from "@/lib/models/StartupCache";
import { fetchAllStartupsFromAPI } from "@/lib/trustmrr";
import { fetchStatus } from "@/lib/fetchStatus";
import { Startup } from "@/lib/types";

export const dynamic = "force-dynamic";

const TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

// Use global so the mutex survives Next.js hot-reloads in dev mode.
// Without this, each hot-reload resets the module and concurrent requests
// each start their own TrustMrr pagination loop, exhausting the rate limit.
declare global {
  var _fetchInflight: Promise<Startup[]> | null;
}
global._fetchInflight ??= null;

async function fetchAndCache(apiKey: string): Promise<Startup[]> {
  if (global._fetchInflight) return global._fetchInflight;

  global._fetchInflight = (async () => {
    fetchStatus.active = true;
    fetchStatus.page = 0;
    fetchStatus.loaded = 0;
    fetchStatus.retrying = false;
    try {
      const startups = await fetchAllStartupsFromAPI(apiKey, (page, loaded, retrying) => {
        fetchStatus.page = page;
        fetchStatus.loaded = loaded;
        fetchStatus.retrying = retrying;
      });
      await StartupCache.findOneAndUpdate(
        { filter: "all" },
        { $set: { startups, cachedAt: new Date(), count: startups.length } },
        { upsert: true, new: true }
      );
      return startups;
    } finally {
      fetchStatus.active = false;
      fetchStatus.retrying = false;
      global._fetchInflight = null;
    }
  })();

  return global._fetchInflight;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const bust = searchParams.get("bust") === "1";

  if (filter !== "all" && filter !== "onSale") {
    return NextResponse.json({ error: "Invalid filter. Must be 'all' or 'onSale'." }, { status: 400 });
  }

  await connectToDatabase();

  const cached = await StartupCache.findOne({ filter: "all" }).lean();
  const age = cached ? Date.now() - new Date(cached.cachedAt).getTime() : Infinity;

  // Stale-while-revalidate: if we have any cached data, serve it immediately
  // and kick off a background refresh if the TTL has expired.
  if (cached) {
    if (age >= TTL_MS) {
      const apiKey = process.env.TRUSTMRR_API_KEY;
      if (apiKey) fetchAndCache(apiKey).catch(console.error); // background, don't await
    }
    const data = filter === "onSale" ? cached.startups.filter((s) => s.onSale) : cached.startups;
    return NextResponse.json({
      data,
      meta: { count: data.length, cachedAt: cached.cachedAt, fresh: age < TTL_MS },
    });
  }

  // No cache at all — must wait for the first fetch
  const apiKey = process.env.TRUSTMRR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured: TRUSTMRR_API_KEY is missing." }, { status: 503 });
  }
  const allStartups = await fetchAndCache(apiKey);

  const data = filter === "onSale" ? allStartups.filter((s) => s.onSale) : allStartups;
  const cachedAt = new Date();
  const fresh = false;

  return NextResponse.json({
    data,
    meta: { count: data.length, cachedAt, fresh },
  });
}
