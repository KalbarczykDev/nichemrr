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
        : null;

    const growthItems = items.filter((s) => s.growth != null);
    const avgGrowth =
      growthItems.length > 0
        ? growthItems.reduce((sum, s) => sum + s.growth!, 0) /
          growthItems.length
        : null;

    const marginItems = items.filter((s) => s.profitMarginLast30Days != null);
    const avgProfitMargin =
      marginItems.length > 0
        ? marginItems.reduce((sum, s) => sum + s.profitMarginLast30Days!, 0) /
          marginItems.length
        : null;

    const totalCustomers = items.reduce(
      (sum, s) => sum + (s.customers ?? 0),
      0,
    );

    const topStartups = [...items]
      .sort((a, b) => (b.mrr ?? 0) - (a.mrr ?? 0))
      .slice(0, 3);

    groups.push({
      category,
      count: items.length,
      avgMrr,
      avgGrowth,
      avgProfitMargin,
      totalCustomers,
      topStartups,
    });
  }

  const globalMaxAvgMrr = Math.max(...groups.map((g) => g.avgMrr ?? 0), 1);
  const globalMaxCount = Math.max(...groups.map((g) => g.count), 1);

  return groups.map((g) => ({
    ...g,
    opportunityScore: computeOpportunityScore(
      g.avgMrr,
      g.count,
      globalMaxAvgMrr,
      globalMaxCount,
      g.avgGrowth,
      g.avgProfitMargin,
    ),
  }));
}

export function computeOpportunityScore(
  avgMrr: number | null,
  count: number,
  globalMaxAvgMrr: number,
  globalMaxCount: number,
  avgGrowth: number | null,
  avgProfitMargin: number | null,
): number {
  // Log-normalized MRR: 0–1, compresses outliers
  const mrrScore =
    avgMrr != null && globalMaxAvgMrr > 1
      ? Math.log(avgMrr + 1) / Math.log(globalMaxAvgMrr + 1)
      : 0;

  // Log-normalized competition relative to dataset max: 0–1, fewer = better
  const competition =
    globalMaxCount > 1
      ? 1 - Math.log(count + 1) / Math.log(globalMaxCount + 1)
      : 1;

  // Growth bonus: up to +0.15 for 100% growth
  const growthBonus =
    avgGrowth != null ? Math.min(Math.max(avgGrowth, 0), 1) * 0.15 : 0;

  // Margin bonus: up to +0.1 for 100% profit margin
  const marginBonus =
    avgProfitMargin != null ? Math.min(avgProfitMargin / 100, 1) * 0.1 : 0;

  // Weighted additive: MRR is primary signal, competition secondary
  // No factor can zero out the score entirely
  return mrrScore * 0.65 + competition * 0.35 + growthBonus + marginBonus;
}

export function computeDealScores(startups: Startup[]): DealStartup[] {
  const categoryMultiples = new Map<string, number[]>();

  for (const s of startups) {
    if (s.multiple == null) continue;
    const key = s.category ?? "Uncategorized";
    if (!categoryMultiples.has(key)) categoryMultiples.set(key, []);
    categoryMultiples.get(key)!.push(s.multiple);
  }

  function median(values: number[]) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  const categoryMedianMap = new Map<string, number>();

  for (const [cat, multiples] of categoryMultiples.entries()) {
    categoryMedianMap.set(cat, median(multiples));
  }

  const globalMedian = median(
    startups.filter((s) => s.multiple != null).map((s) => s.multiple!),
  );

  return startups.map((s) => {
    const key = s.category ?? "Uncategorized";
    const categoryMedian = categoryMedianMap.get(key) ?? globalMedian;

    let valueScore = 0;

    if (s.multiple != null && categoryMedian > 0) {
      const discount = (categoryMedian - s.multiple) / categoryMedian;
      valueScore = Math.max(-1, Math.min(1, discount)) * 100;
    }

    let marginScore = 0;

    if (s.profitMarginLast30Days != null) {
      const margin = s.profitMarginLast30Days;

      if (margin >= 50) {
        marginScore = (margin - 50) * 0.3;
      } else {
        marginScore = -(50 - margin) * 0.2;
      }
    }

    const dealScore = valueScore + marginScore;

    return {
      ...s,
      categoryAvgMultiple: categoryMedian,
      dealScore,
      isHotDeal: dealScore >= 80,
    };
  });
}
