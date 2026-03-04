"use client";

import { useState, useEffect, useCallback } from "react";
import { DealStartup } from "@/lib/types";
import { computeDealScores } from "@/lib/analysis";
import { fetchAllStartups } from "@/lib/trustmrr";
import { formatMrr, formatMultiple } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Flame, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type SortKey = "dealScore" | "mrr" | "multiple" | "askingPrice";
type SortDir = "asc" | "desc";

interface ValuationTabProps {
  apiKey: string;
}

export function ValuationTab({ apiKey }: ValuationTabProps) {
  const [deals, setDeals] = useState<DealStartup[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ loaded: number; total: number | null }>({
    loaded: 0,
    total: null,
  });
  const [sortKey, setSortKey] = useState<SortKey>("dealScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [initialized, setInitialized] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setProgress({ loaded: 0, total: null });
    try {
      const startups = await fetchAllStartups(apiKey, { onSale: "true" }, (loaded, total) => {
        setProgress({ loaded, total });
      });
      const scored = computeDealScores(startups);
      setDeals(scored);
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

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...deals].sort((a, b) => {
    const mul = sortDir === "desc" ? -1 : 1;
    if (sortKey === "dealScore") return mul * (a.dealScore - b.dealScore);
    if (sortKey === "mrr") return mul * (a.mrr - b.mrr);
    if (sortKey === "multiple") return mul * ((a.multiple ?? 0) - (b.multiple ?? 0));
    if (sortKey === "askingPrice") return mul * ((a.askingPrice ?? 0) - (b.askingPrice ?? 0));
    return 0;
  });

  const hotDeals = deals.filter((d) => d.isHotDeal).length;
  const avgMultiple =
    deals.filter((d) => d.multiple !== null).length > 0
      ? deals
          .filter((d) => d.multiple !== null)
          .reduce((sum, d) => sum + d.multiple!, 0) /
        deals.filter((d) => d.multiple !== null).length
      : null;
  const bestDeal = deals.length
    ? deals.reduce((best, d) => (d.dealScore > best.dealScore ? d : best), deals[0])
    : null;

  if (loading && deals.length === 0) {
    return <ValuationSkeleton progress={progress} />;
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>;
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">For Sale</p>
            <p className="text-3xl font-bold mt-1">{deals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Multiple</p>
            <p className="text-3xl font-bold mt-1">
              {avgMultiple !== null ? formatMultiple(avgMultiple) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Hot Deals</p>
            <p className="text-3xl font-bold mt-1 text-green-600">{hotDeals}</p>
            {bestDeal && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Best: {bestDeal.name} ({bestDeal.dealScore.toFixed(0)}% below avg)
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("mrr")}
              >
                MRR <SortIcon col="mrr" />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("askingPrice")}
              >
                Asking Price <SortIcon col="askingPrice" />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("multiple")}
              >
                Multiple <SortIcon col="multiple" />
              </TableHead>
              <TableHead>Cat Avg</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("dealScore")}
              >
                Deal Score <SortIcon col="dealScore" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((s) => (
              <TableRow
                key={s.id}
                className="cursor-pointer"
                onClick={() => {
                  const url = s.url ?? `https://trustmrr.com/startups/${s.id}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    {s.name}
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {s.category ?? "Uncategorized"}
                  </Badge>
                </TableCell>
                <TableCell>{formatMrr(s.mrr)}</TableCell>
                <TableCell>
                  {s.askingPrice !== null ? formatMrr(s.askingPrice) : "—"}
                </TableCell>
                <TableCell>
                  {s.multiple !== null ? formatMultiple(s.multiple) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatMultiple(s.categoryAvgMultiple)}
                </TableCell>
                <TableCell>
                  <DealScoreBadge score={s.dealScore} isHot={s.isHotDeal} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {deals.length === 0 && !loading && (
          <div className="py-16 text-center text-muted-foreground">
            No startups for sale found.
          </div>
        )}
      </Card>
    </div>
  );
}

function DealScoreBadge({ score, isHot }: { score: number; isHot: boolean }) {
  if (isHot) {
    return (
      <Badge variant="success" className="flex items-center gap-1 w-fit">
        <Flame className="h-3 w-3" />
        {score.toFixed(0)}% below avg
      </Badge>
    );
  }
  if (score >= 0) {
    return (
      <Badge variant="warning" className="w-fit">
        {score.toFixed(0)}% below avg
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="w-fit">
      {Math.abs(score).toFixed(0)}% above avg
    </Badge>
  );
}

function ValuationSkeleton({ progress }: { progress: { loaded: number; total: number | null } }) {
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
      {progress.loaded > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Loading {progress.loaded}
          {progress.total ? ` / ${progress.total}` : ""} startups…
        </div>
      )}
      <Card>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
