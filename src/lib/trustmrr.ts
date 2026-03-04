import { Startup, TrustMrrResponse } from "./types";

const DELAY_MS = 300; // ~20 req/min safe zone

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAllStartups(
  apiKey: string,
  params: Record<string, string> = {},
  onProgress?: (loaded: number, total: number | null) => void
): Promise<Startup[]> {
  const all: Startup[] = [];
  let page = 1;
  let hasMore = true;
  let total: number | null = null;

  while (hasMore) {
    const searchParams = new URLSearchParams({
      ...params,
      page: String(page),
      limit: "50",
    });

    const res = await fetch(`/api/startups?${searchParams}`, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("RATE_LIMITED");
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error("UNAUTHORIZED");
      }
      throw new Error(`API error: ${res.status}`);
    }

    const json: TrustMrrResponse = await res.json();

    all.push(...json.data);
    hasMore = json.hasMore;
    total = json.total ?? null;
    onProgress?.(all.length, total);

    page++;
    if (hasMore) await sleep(DELAY_MS);
  }

  return all;
}
