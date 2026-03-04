"use client";

import { useState, useEffect, useCallback } from "react";
import { NicheGroup } from "@/lib/types";
import { groupByCategory } from "@/lib/analysis";
import { fetchAllStartups } from "@/lib/trustmrr";
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
import { Button } from "@/components/ui/button";
import { Flame, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type SortBy = "opportunityScore" | "avgMrr" | "count";

interface NicheOpportunityTabProps {
  apiKey: string;
}

export function NicheOpportunityTab({ apiKey }: NicheOpportunityTabProps) {
  const [groups, setGroups] = useState<NicheGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ loaded: number; total: number | null }>({
    loaded: 0,
    total: null,
  });
  const [sortBy, setSortBy] = useState<SortBy>("opportunityScore");
  const [initialized, setInitialized] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setProgress({ loaded: 0, total: null });
    try {
      const startups = await fetchAllStartups(apiKey, {}, (loaded, total) => {
        setProgress({ loaded, total });
      });
      const grouped = groupByCategory(startups);
      setGroups(grouped);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg === "RATE_LIMITED") {
        toast.error("Rate limit reached. Please wait a moment and try again.");
      } else if (msg === "UNAUTHORIZED") {
        toast.error("Invalid API key. Please refresh the page and re-enter your key.");
      } else {
        toast.error("Failed to load data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      load();
    }
  }, [initialized, load]);

  const sorted = [...groups].sort((a, b) => {
    if (sortBy === "opportunityScore") return b.opportunityScore - a.opportunityScore;
    if (sortBy === "avgMrr") return b.avgMrr - a.avgMrr;
    return b.count - a.count;
  });

  const topCategory = groups.length
    ? groups.reduce((best, g) => (g.avgMrr > best.avgMrr ? g : best), groups[0])
    : null;

  const maxScore = Math.max(...groups.map((g) => g.opportunityScore), 1);

  if (loading && groups.length === 0) {
    return <LoadingSkeleton progress={progress} />;
  }

  return (
    <div className="space-y-6">
      {/* Stat bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Startups" value={groups.reduce((s, g) => s + g.count, 0)} />
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
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
                      <Badge variant="amber" className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        Hot Opportunity
                      </Badge>
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
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Opportunity Score
                    </span>
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

      {groups.length === 0 && !loading && (
        <div className="py-16 text-center text-muted-foreground">
          No data found. Try refreshing.
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  small,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`font-bold mt-1 ${small ? "text-lg" : "text-3xl"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton({ progress }: { progress: { loaded: number; total: number | null } }) {
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
      {progress.total !== null && (
        <div className="text-center text-sm text-muted-foreground">
          Loading {progress.loaded} / {progress.total} startups…
        </div>
      )}
      {progress.total === null && progress.loaded > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Loaded {progress.loaded} startups…
        </div>
      )}
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
