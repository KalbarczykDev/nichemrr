#!/usr/bin/env tsx
/**
 * Fetches all startups from TrustMrr and upserts them into MongoDB Atlas.
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Reads TRUSTMRR_API_KEY and MONGODB_URI from .env.local
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
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
  icon: string | null;
  description: string | null;
  website: string | null;
  country: string | null;
  foundedDate: string | null;
  category: string | null;
  paymentProvider: string | null;
  targetAudience: string | null;
  revenue: {
    last30Days: number | null;
    mrr: number | null;
    total: number | null;
  } | null;
  customers: number | null;
  activeSubscriptions: number | null;
  askingPrice: number | null;
  profitMarginLast30Days: number | null;
  growth30d: number | null;
  multiple: number | null;
  onSale: boolean;
  firstListedForSaleAt: string | null;
  xHandle: string | null;
}

interface TrustMrrResponse {
  data: TrustMrrStartup[];
  meta: { hasMore: boolean; total: number };
}

interface Startup {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  website: string | null;
  url: string;
  country: string | null;
  foundedDate: string | null;
  category: string | null;
  paymentProvider: string | null;
  targetAudience: string | null;
  mrr: number | null;
  revenueLastMonth: number | null;
  revenueTotal: number | null;
  customers: number | null;
  activeSubscriptions: number | null;
  askingPrice: number | null;
  profitMarginLast30Days: number | null;
  growth: number | null;
  multiple: number | null;
  onSale: boolean;
  firstListedForSaleAt: string | null;
  xHandle: string | null;
}

function normalise(raw: TrustMrrStartup): Startup {
  return {
    id: raw.slug,
    name: raw.name,
    icon: raw.icon ?? null,
    description: raw.description ?? null,
    website: raw.website ?? null,
    url: `https://trustmrr.com/startup/${raw.slug}`,
    country: raw.country ?? null,
    foundedDate: raw.foundedDate ?? null,
    category: raw.category,
    paymentProvider: raw.paymentProvider ?? null,
    targetAudience: raw.targetAudience ?? null,
    mrr: raw.revenue?.mrr || null,
    revenueLastMonth: raw.revenue?.last30Days || null,
    revenueTotal: raw.revenue?.total || null,
    customers: raw.customers || null,
    activeSubscriptions: raw.activeSubscriptions || null,
    askingPrice: raw.askingPrice || null,
    profitMarginLast30Days: raw.profitMarginLast30Days ?? null,
    growth: raw.growth30d,
    multiple: raw.multiple,
    onSale: raw.onSale,
    firstListedForSaleAt: raw.firstListedForSaleAt ?? null,
    xHandle: raw.xHandle ?? null,
  };
}

// ── fetch ────────────────────────────────────────────────────────────────────

async function fetchAll(apiKey: string, onPage: (batch: Startup[]) => void): Promise<Startup[]> {
  const all: Startup[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    let res: Response | null = null;

    for (let attempt = 0; attempt <= 3; attempt++) {
      try {
        res = await fetch(`${TRUSTMRR_API_BASE}/startups?${params}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
      } catch (err) {
        // Network error (ECONNRESET, ETIMEDOUT, etc.)
        if (attempt === 3) throw err;
        const wait = (attempt + 1) * 10_000;
        console.log(`  network error (attempt ${attempt + 1}) — retrying in ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      if (res.status !== 429 && res.status !== 500) break;
      if (attempt === 3) throw new Error("RATE_LIMITED after 3 retries");
      console.log(`  rate limited — waiting 65s before retry...`);
      await sleep(65_000);
    }

    if (!res!.ok) throw new Error(`API error: ${res!.status}`);

    const json: TrustMrrResponse = await res!.json();
    const batch = json.data.map(normalise);
    all.push(...batch);
    hasMore = json.meta.hasMore;
    console.log(`  page ${page} — ${all.length} / ${json.meta.total} loaded`);
    onPage(batch);

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
    icon: Schema.Types.Mixed,
    description: Schema.Types.Mixed,
    website: Schema.Types.Mixed,
    url: String,
    country: Schema.Types.Mixed,
    foundedDate: Schema.Types.Mixed,
    category: Schema.Types.Mixed,
    paymentProvider: Schema.Types.Mixed,
    targetAudience: Schema.Types.Mixed,
    mrr: Schema.Types.Mixed,
    revenueLastMonth: Schema.Types.Mixed,
    revenueTotal: Schema.Types.Mixed,
    customers: Schema.Types.Mixed,
    activeSubscriptions: Schema.Types.Mixed,
    askingPrice: Schema.Types.Mixed,
    profitMarginLast30Days: Schema.Types.Mixed,
    growth: Schema.Types.Mixed,
    multiple: Schema.Types.Mixed,
    onSale: Boolean,
    firstListedForSaleAt: Schema.Types.Mixed,
    xHandle: Schema.Types.Mixed,
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

  const dataDir = path.resolve(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const outPath = path.join(dataDir, "startups.json");

  const cachedAt = new Date();
  const accumulated: (Startup & { cachedAt: Date })[] = [];
  function writeBatch(batch: Startup[]) {
    accumulated.push(...batch.map((s) => ({ ...s, cachedAt })));
    fs.writeFileSync(outPath, JSON.stringify(accumulated, null, 2));
  }

  console.log("Fetching startups from TrustMrr...");
  const startups = await fetchAll(apiKey, writeBatch);
  console.log(`\nFetched ${startups.length} startups. Writing to MongoDB...`);

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
  const freshIds = new Set(startups.map((s) => s.id));
  const deleted = await StartupCache.deleteMany({ id: { $nin: [...freshIds] } });
  if (deleted.deletedCount > 0) console.log(`  removed ${deleted.deletedCount} stale startups`);

  console.log(`Data written to ${outPath}`);
  console.log("Done.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
