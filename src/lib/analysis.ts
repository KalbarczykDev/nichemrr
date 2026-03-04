import { Startup, NicheGroup, DealStartup } from "./types";

export function groupByCategory(startups: Startup[]): NicheGroup[] {
  const map = new Map<string, Startup[]>();

  for (const s of startups) {
    const key = s.category ?? "Uncategorized";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }

  const groups: Omit<NicheGroup, "opportunityScore">[] = [];

  for (const [category, items] of map.entries()) {
    const avgMrr = items.reduce((sum, s) => sum + s.mrr, 0) / items.length;

    const growthItems = items.filter((s) => s.growth !== null);
    const avgGrowth =
      growthItems.length > 0
        ? growthItems.reduce((sum, s) => sum + s.growth!, 0) / growthItems.length
        : null;

    const totalCustomers = items.reduce((sum, s) => sum + (s.customers ?? 0), 0);

    const topStartups = [...items]
      .sort((a, b) => b.mrr - a.mrr)
      .slice(0, 3);

    groups.push({ category, count: items.length, avgMrr, avgGrowth, totalCustomers, topStartups });
  }

  const globalMaxAvgMrr = Math.max(...groups.map((g) => g.avgMrr), 1);

  return groups.map((g) => ({
    ...g,
    opportunityScore: computeOpportunityScore(g.avgMrr, g.count, globalMaxAvgMrr),
  }));
}

export function computeOpportunityScore(
  avgMrr: number,
  count: number,
  globalMaxAvgMrr: number
): number {
  return (avgMrr / globalMaxAvgMrr) * (1 - Math.min(count, 20) / 20);
}

export function computeDealScores(startups: Startup[]): DealStartup[] {
  // Group by category to get category avg multiples
  const categoryMultiples = new Map<string, number[]>();

  for (const s of startups) {
    if (s.multiple === null) continue;
    const key = s.category ?? "Uncategorized";
    if (!categoryMultiples.has(key)) categoryMultiples.set(key, []);
    categoryMultiples.get(key)!.push(s.multiple);
  }

  const categoryAvgMultipleMap = new Map<string, number>();
  for (const [cat, multiples] of categoryMultiples.entries()) {
    const avg = multiples.reduce((sum, m) => sum + m, 0) / multiples.length;
    categoryAvgMultipleMap.set(cat, avg);
  }

  const globalAvgMultiple =
    startups.filter((s) => s.multiple !== null).reduce((sum, s) => sum + s.multiple!, 0) /
    Math.max(startups.filter((s) => s.multiple !== null).length, 1);

  return startups.map((s) => {
    const key = s.category ?? "Uncategorized";
    const categoryAvgMultiple = categoryAvgMultipleMap.get(key) ?? globalAvgMultiple;
    const dealScore =
      s.multiple !== null && categoryAvgMultiple > 0
        ? ((categoryAvgMultiple - s.multiple) / categoryAvgMultiple) * 100
        : 0;

    return {
      ...s,
      categoryAvgMultiple,
      dealScore,
      isHotDeal: dealScore > 20,
    };
  });
}
