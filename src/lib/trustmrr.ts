import { Startup, TrustMrrResponse, TrustMrrStartup } from "./types";

const DELAY_MS = 5000; // 12 req/min — well under the 20 req/min limit
const TRUSTMRR_API_BASE = "https://trustmrr.com/api/v1";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

export async function fetchPageFromAPI(
  apiKey: string,
  page: number
): Promise<{ startups: Startup[]; hasMore: boolean; totalPages: number }> {
  const searchParams = new URLSearchParams({ page: String(page), limit: "50" });
  const res = await fetch(`${TRUSTMRR_API_BASE}/startups?${searchParams}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 0 },
  });

  if (res.status === 401 || res.status === 403) throw new Error("UNAUTHORIZED");
  if (res.status === 429 || res.status === 500) throw new Error("RATE_LIMITED");
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const json: TrustMrrResponse = await res.json();
  const totalPages = Math.ceil(json.meta.total / json.meta.limit);
  return { startups: json.data.map(normalise), hasMore: json.meta.hasMore, totalPages };
}

export async function fetchAllStartupsFromAPI(
  apiKey: string,
  onProgress?: (page: number, loaded: number, retrying: boolean) => void
): Promise<Startup[]> {
  const all: Startup[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const searchParams = new URLSearchParams({ page: String(page), limit: "50" });

    let res: Response | null = null;
    for (let attempt = 0; attempt <= 3; attempt++) {
      res = await fetch(`${TRUSTMRR_API_BASE}/startups?${searchParams}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 0 },
      });
      // 429 = explicit rate limit; 500 = TrustMrr sometimes returns this when throttled
      if (res.status !== 429 && res.status !== 500) break;
      if (attempt === 3) throw new Error("RATE_LIMITED");
      onProgress?.(page, all.length, true);
      await sleep(65_000); // wait for rate limit window to reset
    }

    if (!res!.ok) {
      if (res!.status === 401 || res!.status === 403) throw new Error("UNAUTHORIZED");
      throw new Error(`API error: ${res!.status}`);
    }

    const json: TrustMrrResponse = await res!.json();

    all.push(...json.data.map(normalise));
    hasMore = json.meta.hasMore;
    onProgress?.(page, all.length, false);

    page++;
    if (hasMore) await sleep(DELAY_MS);
  }

  return all;
}
