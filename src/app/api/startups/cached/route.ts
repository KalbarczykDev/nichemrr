import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { StartupCache } from "@/lib/models/StartupCache";
import { fetchAllStartupsFromAPI } from "@/lib/trustmrr";
import { fetchStatus } from "@/lib/fetchStatus";
import { Startup } from "@/lib/types";

export const dynamic = "force-dynamic";

const TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

// Use global so the mutex survives Next.js hot-reloads in dev mode.
declare global {
  var _fetchInflight: Promise<Startup[]> | null;
}
global._fetchInflight ??= null;

async function writeToCache(startups: Startup[]): Promise<void> {
  const cachedAt = new Date();
  const ops = startups.map((s) => ({
    updateOne: {
      filter: { id: s.id },
      update: { $set: { ...s, cachedAt } },
      upsert: true,
    },
  }));
  await StartupCache.bulkWrite(ops, { ordered: false });

  // Remove startups that no longer exist in TrustMrr
  const freshIds = startups.map((s) => s.id);
  await StartupCache.deleteMany({ id: { $nin: freshIds } });
}

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
      await writeToCache(startups);
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

  if (filter !== "all" && filter !== "onSale") {
    return NextResponse.json({ error: "Invalid filter. Must be 'all' or 'onSale'." }, { status: 400 });
  }

  await connectToDatabase();

  // Freshness = age of the oldest document in the cache
  const oldest = await StartupCache.findOne({}).sort({ cachedAt: 1 }).select("cachedAt").lean();
  const age = oldest ? Date.now() - new Date(oldest.cachedAt).getTime() : Infinity;
  const hasCache = !!oldest;

  // Stale-while-revalidate: serve existing data immediately, refresh in background
  if (hasCache) {
    if (age >= TTL_MS) {
      const apiKey = process.env.TRUSTMRR_API_KEY;
      if (apiKey) fetchAndCache(apiKey).catch(console.error);
    }
    const query = filter === "onSale" ? { onSale: true } : {};
    const data = await StartupCache.find(query).lean();
    return NextResponse.json({
      data,
      meta: { count: data.length, cachedAt: oldest.cachedAt, fresh: age < TTL_MS },
    });
  }

  // No cache at all — must wait for the first fetch
  const apiKey = process.env.TRUSTMRR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured: TRUSTMRR_API_KEY is missing." }, { status: 503 });
  }
  const allStartups = await fetchAndCache(apiKey);

  const data = filter === "onSale" ? allStartups.filter((s) => s.onSale) : allStartups;
  return NextResponse.json({
    data,
    meta: { count: data.length, cachedAt: new Date(), fresh: false },
  });
}
