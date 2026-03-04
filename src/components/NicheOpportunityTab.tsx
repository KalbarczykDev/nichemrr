"use client";

import { useState } from "react";
import { Startup, NicheGroup } from "@/lib/types";
import { groupByCategory } from "@/lib/analysis";
import { formatMrr, formatGrowth } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Flame, HelpCircle, TrendingUp } from "lucide-react";

type SortBy = "opportunityScore" | "avgMrr" | "count";

interface NicheOpportunityTabProps {
  startups: Startup[] | null;
  loading: boolean;
}

export function NicheOpportunityTab({ startups, loading }: NicheOpportunityTabProps) {
  const [sortBy, setSortBy] = useState<SortBy>("opportunityScore");

  const groups: NicheGroup[] = startups ? groupByCategory(startups) : [];

  const sorted = [...groups].sort((a, b) => {
    if (sortBy === "opportunityScore") return b.opportunityScore - a.opportunityScore;
    if (sortBy === "avgMrr") return b.avgMrr - a.avgMrr;
    return b.count - a.count;
  });

  const topCategory = groups.length
    ? groups.reduce((best, g) => (g.avgMrr > best.avgMrr ? g : best), groups[0])
    : null;

  const maxScore = Math.max(...groups.map((g) => g.opportunityScore), 1);

  if (loading && !startups) {
    return <LoadingSkeleton />;
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
      {/* Stat bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Startups" value={startups?.length ?? 0} />
        <StatCard label="Categories Found" value={groups.length} />
        <StatCard
          label="Highest Avg MRR Category"
          value={topCategory ? topCategory.category : "—"}
          small
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opportunityScore">Opportunity Score</SelectItem>
              <SelectItem value="avgMrr">Avg MRR</SelectItem>
              <SelectItem value="count">Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Niche cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((group, i) => {
          const isHot = i < 3 && sortBy === "opportunityScore";
          const scorePercent = (group.opportunityScore / maxScore) * 100;

          return (
            <Card
              key={group.category}
              className={isHot ? "border-amber-400 shadow-amber-100 shadow-md" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isHot && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="amber" className="flex items-center gap-1 cursor-help">
                            <Flame className="h-3 w-3" />
                            Hot Opportunity
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Top 3 niches by Opportunity Score — high average MRR with few competitors.
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Badge variant="secondary">{group.category}</Badge>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground bg-muted rounded px-2 py-0.5">
                    {group.count} startup{group.count !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Avg MRR</p>
                    <p className="font-semibold">{formatMrr(group.avgMrr)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Avg Growth</p>
                    <p className="font-semibold">{formatGrowth(group.avgGrowth)}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 cursor-help">
                          <TrendingUp className="h-3 w-3" />
                          Opportunity Score
                          <HelpCircle className="h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64">
                        <p className="font-semibold mb-1">How it&apos;s calculated</p>
                        <p className="text-muted-foreground mb-2">
                          (Avg MRR ÷ highest niche MRR) × (1 − competition penalty)
                        </p>
                        <p>
                          Rewards niches with <strong>high revenue</strong> and <strong>low competition</strong>.
                          A niche with 20+ startups gets a 0 competition score. Fewer startups = bigger multiplier.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="font-medium text-foreground">
                      {(group.opportunityScore * 100).toFixed(0)}
                    </span>
                  </div>
                  <Progress value={scorePercent} className="h-2" />
                </div>

                {group.topStartups.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Top startups</p>
                    <ul className="space-y-0.5">
                      {group.topStartups.map((s) => (
                        <li key={s.id} className="flex items-center justify-between text-xs">
                          <span className="truncate max-w-[60%]">{s.name}</span>
                          <span className="text-muted-foreground">{formatMrr(s.mrr)}/mo</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {startups && groups.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          No data found. Try refreshing.
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}

function StatCard({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`font-bold mt-1 ${small ? "text-lg" : "text-3xl"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center text-sm text-muted-foreground">Loading startups…</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
