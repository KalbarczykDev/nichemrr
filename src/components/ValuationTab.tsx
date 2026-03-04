"use client";

import { useState } from "react";
import { Startup, DealStartup } from "@/lib/types";
import { computeDealScores } from "@/lib/analysis";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink, Flame, HelpCircle } from "lucide-react";

type SortKey = "dealScore" | "mrr" | "multiple" | "askingPrice";
type SortDir = "asc" | "desc";

interface ValuationTabProps {
  startups: Startup[] | null;
  loading: boolean;
}

const PAGE_SIZE = 50;

export function ValuationTab({ startups, loading }: ValuationTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>("dealScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const deals: DealStartup[] = startups ? computeDealScores(startups) : [];

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  }

  const sorted = [...deals].sort((a, b) => {
    const mul = sortDir === "desc" ? -1 : 1;
    if (sortKey === "dealScore") return mul * (a.dealScore - b.dealScore);
    if (sortKey === "mrr") return mul * ((a.mrr ?? 0) - (b.mrr ?? 0));
    if (sortKey === "multiple") return mul * ((a.multiple ?? 0) - (b.multiple ?? 0));
    if (sortKey === "askingPrice") return mul * ((a.askingPrice ?? 0) - (b.askingPrice ?? 0));
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hotDeals = deals.filter((d) => d.isHotDeal).length;
  const avgMultiple =
    deals.filter((d) => d.multiple !== null).length > 0
      ? deals.filter((d) => d.multiple !== null).reduce((sum, d) => sum + d.multiple!, 0) /
        deals.filter((d) => d.multiple !== null).length
      : null;
  const bestDeal = deals.length
    ? deals.reduce((best, d) => (d.dealScore > best.dealScore ? d : best), deals[0])
    : null;

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>;
  }

  if (loading && !startups) {
    return <ValuationSkeleton />;
  }

  return (
    <TooltipProvider>
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

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("mrr")}>
                MRR <SortIcon col="mrr" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("askingPrice")}>
                Asking Price <SortIcon col="askingPrice" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("multiple")}>
                Multiple <SortIcon col="multiple" />
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 cursor-help">
                    Cat Avg <HelpCircle className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Average asking multiple for startups in the same category. Used as the baseline to calculate the Deal Score.
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("dealScore")}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1">
                      Deal Score <HelpCircle className="h-3 w-3 text-muted-foreground" /> <SortIcon col="dealScore" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64">
                    <p className="font-semibold mb-1">How it&apos;s calculated</p>
                    <p className="text-muted-foreground mb-2">
                      (Category avg multiple − this multiple) ÷ category avg × 100
                    </p>
                    <p>
                      <strong className="text-amber-400">Golden</strong> = Hot Deal, 20%+ below avg.<br />
                      <strong className="text-green-400">Green</strong> = below category average.<br />
                      <strong className="text-red-400">Red</strong> = above average → overpriced.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((s) => (
              <TableRow
                key={s.id}
                className="cursor-pointer"
                onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}
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
                <TableCell>{s.askingPrice !== null ? formatMrr(s.askingPrice) : "—"}</TableCell>
                <TableCell>{s.multiple !== null ? formatMultiple(s.multiple) : "—"}</TableCell>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              Previous
            </Button>
            <span className="px-1">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}

function DealScoreBadge({ score, isHot }: { score: number; isHot: boolean }) {
  if (isHot) {
    return (
      <Badge variant="amber" className="flex items-center gap-1 w-fit">
        <Flame className="h-3 w-3" />
        {score.toFixed(0)}% below avg
      </Badge>
    );
  }
  if (score >= 0) {
    return (
      <Badge variant="success" className="w-fit">
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

function ValuationSkeleton() {
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
