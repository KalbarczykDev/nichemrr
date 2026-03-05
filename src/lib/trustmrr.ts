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
