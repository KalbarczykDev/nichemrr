#!/usr/bin/env tsx
/**
 * Fetches all startups from TrustMrr and upserts them into MongoDB Atlas.
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Reads TRUSTMRR_API_KEY and MONGODB_URI from .env.local
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as mongoose from "mongoose";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const TRUSTMRR_API_BASE = "https://trustmrr.com/api/v1";
const DELAY_MS = 5000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── inline types (avoid Next.js path aliases) ────────────────────────────────

interface TrustMrrStartup {
  slug: string;
  name: string;
  category: string | null;
  revenue: { mrr: number | null } | null;
  growth30d: number | null;
  customers: number | null;
  askingPrice: number | null;
  multiple: number | null;
  onSale: boolean;
  description: string | null;
  createdAt: string | null;
}

interface TrustMrrResponse {
  data: TrustMrrStartup[];
  meta: { hasMore: boolean; total: number };
}

interface Startup {
  id: string;
  name: string;
  category: string | null;
  mrr: number | null;
  growth: number | null;
  customers: number | null;
  askingPrice: number | null;
  multiple: number | null;
  onSale: boolean;
  url: string;
  description: string | null;
  createdAt: string | null;
}

function normalise(raw: TrustMrrStartup): Startup {
  return {
    id: raw.slug,
    name: raw.name,
    category: raw.category,
    mrr: raw.revenue?.mrr != null ? raw.revenue.mrr / 100 : null,
    growth: raw.growth30d,
    customers: raw.customers,
    askingPrice: raw.askingPrice != null ? raw.askingPrice / 100 : null,
    multiple: raw.multiple,
    onSale: raw.onSale,
    url: `https://trustmrr.com/startup/${raw.slug}`,
    description: raw.description,
    createdAt: raw.createdAt,
  };
}

// ── fetch ────────────────────────────────────────────────────────────────────

async function fetchAll(apiKey: string): Promise<Startup[]> {
  const all: Startup[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    let res: Response | null = null;

    for (let attempt = 0; attempt <= 3; attempt++) {
      res = await fetch(`${TRUSTMRR_API_BASE}/startups?${params}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.status !== 429 && res.status !== 500) break;
      if (attempt === 3) throw new Error("RATE_LIMITED after 3 retries");
      console.log(`  rate limited — waiting 65s before retry...`);
      await sleep(65_000);
    }

    if (!res!.ok) throw new Error(`API error: ${res!.status}`);

    const json: TrustMrrResponse = await res!.json();
    all.push(...json.data.map(normalise));
    hasMore = json.meta.hasMore;
    console.log(`  page ${page} — ${all.length} / ${json.meta.total} loaded`);

    page++;
    if (hasMore) await sleep(DELAY_MS);
  }

  return all;
}

// ── mongoose model (inline) ──────────────────────────────────────────────────

const { Schema } = mongoose;

const startupCacheSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    category: Schema.Types.Mixed,
    mrr: Schema.Types.Mixed,
    growth: Schema.Types.Mixed,
    customers: Schema.Types.Mixed,
    askingPrice: Schema.Types.Mixed,
    multiple: Schema.Types.Mixed,
    onSale: Boolean,
    url: String,
    description: Schema.Types.Mixed,
    createdAt: Schema.Types.Mixed,
    cachedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const StartupCache =
  (mongoose.models?.StartupCache as mongoose.Model<typeof startupCacheSchema>) ||
  mongoose.model("StartupCache", startupCacheSchema);

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.TRUSTMRR_API_KEY;
  const mongoUri = process.env.MONGODB_URI;

  if (!apiKey) throw new Error("TRUSTMRR_API_KEY is not set in .env.local");
  if (!mongoUri) throw new Error("MONGODB_URI is not set in .env.local");

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri, { bufferCommands: false });
  console.log("Connected.\n");

  console.log("Fetching startups from TrustMrr...");
  const startups = await fetchAll(apiKey);
  console.log(`\nFetched ${startups.length} startups. Writing to MongoDB...`);

  const cachedAt = new Date();
  const ops = startups.map((s) => ({
    updateOne: {
      filter: { id: s.id },
      update: { $set: { ...s, cachedAt } },
      upsert: true,
    },
  }));

  const result = await StartupCache.bulkWrite(ops, { ordered: false });
  console.log(`  upserted: ${result.upsertedCount}, modified: ${result.modifiedCount}`);

  // Remove stale startups no longer in TrustMrr
  const freshIds = startups.map((s) => s.id);
  const deleted = await StartupCache.deleteMany({ id: { $nin: freshIds } });
  if (deleted.deletedCount > 0) console.log(`  removed ${deleted.deletedCount} stale startups`);

  console.log("\nDone.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
