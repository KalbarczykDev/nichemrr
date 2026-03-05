"use client";

import { useState, useEffect } from "react";
import { Startup } from "@/lib/types";
import { NicheOpportunityTab } from "@/components/NicheOpportunityTab";
import { ValuationTab } from "@/components/ValuationTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DataState {
  startups: Startup[] | null;
  loading: boolean;
}

const initial: DataState = { startups: null, loading: false };

async function fetchCached(
  filter: "all" | "onSale",
): Promise<{ data: Startup[]; cachedAt: string }> {
  const res = await fetch(`/api/startups/cached?filter=${filter}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return { data: json.data, cachedAt: json.meta.cachedAt };
}

function formatCachedAt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardContent() {
  const [nicheData, setNicheData] = useState<DataState>(initial);
  const [saleData, setSaleData] = useState<DataState>(initial);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  const isLoading = nicheData.loading || saleData.loading;

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setNicheData({ startups: null, loading: true });
    setSaleData({ startups: null, loading: true });
    try {
      const [niche, sale] = await Promise.all([
        fetchCached("all"),
        fetchCached("onSale"),
      ]);
      setNicheData({ startups: niche.data, loading: false });
      setSaleData({ startups: sale.data, loading: false });
      setCachedAt(niche.cachedAt);
    } catch {
      toast.error("Failed to load data. Please refresh the page.");
      setNicheData((d) => ({ ...d, loading: false }));
      setSaleData((d) => ({ ...d, loading: false }));
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {isLoading && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          <span>Loading…</span>
        </div>
      )}

      <Tabs defaultValue="niches">
        <div className="mb-6 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="niches" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Niche Opportunity Finder
            </TabsTrigger>
            <TabsTrigger value="valuation" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Startup Valuation / Deal Score
            </TabsTrigger>
          </TabsList>
          {cachedAt && (
            <p className="text-xs text-muted-foreground">
              Updated {formatCachedAt(cachedAt)}
            </p>
          )}
        </div>
        <TabsContent value="niches">
          <NicheOpportunityTab
            startups={nicheData.startups}
            loading={nicheData.loading}
          />
        </TabsContent>
        <TabsContent value="valuation">
          <ValuationTab
            startups={saleData.startups}
            loading={saleData.loading}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
