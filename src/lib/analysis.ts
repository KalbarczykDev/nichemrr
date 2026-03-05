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
    const mrrItems = items.filter((s) => s.mrr != null);
    const avgMrr =
      mrrItems.length > 0
        ? mrrItems.reduce((sum, s) => sum + s.mrr!, 0) / mrrItems.length
        : 0;

    const growthItems = items.filter((s) => s.growth != null);
    const avgGrowth =
      growthItems.length > 0
        ? growthItems.reduce((sum, s) => sum + s.growth!, 0) / growthItems.length
        : null;

    const marginItems = items.filter((s) => s.profitMarginLast30Days != null);
    const avgProfitMargin =
      marginItems.length > 0
        ? marginItems.reduce((sum, s) => sum + s.profitMarginLast30Days!, 0) / marginItems.length
        : null;

    const totalCustomers = items.reduce((sum, s) => sum + (s.customers ?? 0), 0);

    const topStartups = [...items]
      .sort((a, b) => (b.mrr ?? 0) - (a.mrr ?? 0))
      .slice(0, 3);

    groups.push({ category, count: items.length, avgMrr, avgGrowth, avgProfitMargin, totalCustomers, topStartups });
  }

  const globalMaxAvgMrr = Math.max(...groups.map((g) => g.avgMrr), 1);

  return groups.map((g) => ({
    ...g,
    opportunityScore: computeOpportunityScore(g.avgMrr, g.count, globalMaxAvgMrr, g.avgGrowth, g.avgProfitMargin),
  }));
}

export function computeOpportunityScore(
  avgMrr: number,
  count: number,
  globalMaxAvgMrr: number,
  avgGrowth: number | null,
  avgProfitMargin: number | null,
): number {
  const mrrScore = avgMrr / globalMaxAvgMrr;          // 0–1
  const competition = 1 - Math.min(count, 20) / 20;  // 0–1, fewer = better
  // Growth bonus: up to +20% for 100% growth
  const growthBonus = avgGrowth != null ? Math.min(Math.max(avgGrowth, 0), 1) * 0.2 : 0;
  // Margin bonus: up to +10% for 100% profit margin
  const marginBonus = avgProfitMargin != null ? Math.min(avgProfitMargin / 100, 1) * 0.1 : 0;
  return mrrScore * competition * (1 + growthBonus + marginBonus);
}

export function computeDealScores(startups: Startup[]): DealStartup[] {
  const categoryMultiples = new Map<string, number[]>();

  for (const s of startups) {
    if (s.multiple === null) continue;
    const key = s.category ?? "Uncategorized";
    if (!categoryMultiples.has(key)) categoryMultiples.set(key, []);
    categoryMultiples.get(key)!.push(s.multiple);
  }

  const categoryAvgMultipleMap = new Map<string, number>();
  for (const [cat, multiples] of categoryMultiples.entries()) {
    categoryAvgMultipleMap.set(
      cat,
      multiples.reduce((sum, m) => sum + m, 0) / multiples.length
    );
  }

  const globalAvgMultiple =
    startups.filter((s) => s.multiple !== null).reduce((sum, s) => sum + s.multiple!, 0) /
    Math.max(startups.filter((s) => s.multiple !== null).length, 1);

  return startups.map((s) => {
    const key = s.category ?? "Uncategorized";
    const categoryAvgMultiple = categoryAvgMultipleMap.get(key) ?? globalAvgMultiple;

    // Base score: how far below category avg the multiple is
    const multipleScore =
      s.multiple !== null && categoryAvgMultiple > 0
        ? ((categoryAvgMultiple - s.multiple) / categoryAvgMultiple) * 100
        : 0;

    // Margin bonus: each % above 50 adds 0.2 points (up to +10 at 100% margin)
    const marginBonus =
      s.profitMarginLast30Days != null
        ? Math.max(0, (s.profitMarginLast30Days - 50) * 0.2)
        : 0;

    const dealScore = multipleScore + marginBonus;

    return {
      ...s,
      categoryAvgMultiple,
      dealScore,
      isHotDeal: dealScore > 20,
    };
  });
}
