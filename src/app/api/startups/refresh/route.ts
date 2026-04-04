import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { StartupCache } from "@/lib/models/StartupCache";
import { fetchPageFromAPI } from "@/lib/trustmrr";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { apiKey?: unknown; page?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (!apiKey) {
    return NextResponse.json({ error: "apiKey is required" }, { status: 400 });
  }

  const page = typeof body.page === "number" && body.page >= 1 ? body.page : 1;

  // On the first page, check if a refresh is already in progress or was done recently.
  // This prevents multiple users from hammering TrustMrr simultaneously.
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
  if (page === 1) {
    await connectToDatabase();
    const newest = await StartupCache.findOne({}).sort({ cachedAt: -1 }).select("cachedAt").lean();
    if (newest) {
      const ageMs = Date.now() - new Date(newest.cachedAt).getTime();
      if (ageMs < COOLDOWN_MS) {
        const remainingSec = Math.ceil((COOLDOWN_MS - ageMs) / 1000);
        return NextResponse.json(
          { error: `Data was just refreshed. Try again in ${remainingSec}s.`, cooldown: true },
          { status: 429 }
        );
      }
    }
  }

  let result;
  try {
    result = await fetchPageFromAPI(apiKey, page);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
    if (msg === "RATE_LIMITED") {
      return NextResponse.json(
        { error: "TrustMrr rate limit hit. Try again later." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: `Fetch failed: ${msg}` }, { status: 502 });
  }

  const { startups, hasMore, totalPages } = result;

  if (page > 1) await connectToDatabase();
  const refreshedAt = new Date();
  if (startups.length > 0) {
    // upsert on id — handles duplicates and updates existing records
    const ops = startups.map((s) => ({
      updateOne: {
        filter: { id: s.id },
        update: { $set: { ...s, cachedAt: refreshedAt } },
        upsert: true,
      },
    }));
    await StartupCache.bulkWrite(ops, { ordered: false });
  }

  return NextResponse.json({
    count: startups.length,
    hasMore,
    nextPage: hasMore ? page + 1 : null,
    totalPages,
  });
}
