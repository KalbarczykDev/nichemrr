"use client";

import { useState, useEffect, useRef } from "react";
import { Startup } from "@/lib/types";
import { NicheOpportunityTab } from "@/components/NicheOpportunityTab";
import { ValuationTab } from "@/components/ValuationTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Tag, Loader2, RefreshCw, ChevronDown, Square } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DataState {
  startups: Startup[] | null;
  loading: boolean;
}

const initial: DataState = { startups: null, loading: false };

async function fetchCached(
  filter: "all" | "onSale",
): Promise<{ data: Startup[]; cachedAt: string }> {
  const res = await fetch(`/api/startups/cached?filter=${filter}`, { cache: "no-store" });
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
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("trustmrr_api_key");
    if (saved) setApiKey(saved);
  }, []);

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

  function handleStop() {
    abortRef.current?.abort();
  }

  async function handleRefresh() {
    if (!apiKey.trim()) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setRefreshing(true);
    let page = 1;
    let total = 0;
    let totalPages: number | null = null;
    try {
      while (true) {
        setRefreshProgress(
          totalPages
            ? `Page ${page} / ${totalPages} (${total} startups)`
            : `Page ${page}… (${total} startups)`
        );
        const res = await fetch("/api/startups/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: apiKey.trim(), page }),
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) {
          if (json.cooldown) {
            toast.info(json.error);
          } else {
            toast.error(json.error ?? "Refresh failed.");
          }
          return;
        }
        total += json.count;
        totalPages = json.totalPages;
        if (!json.hasMore) break;
        page = json.nextPage;
        // 5s delay between pages to stay under TrustMrr rate limit
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 5000);
          controller.signal.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      }
      toast.success(`Refreshed ${total} startups.`);
      setRefreshOpen(false);
      await loadAll();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.info(`Stopped after ${total} startups.`);
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      abortRef.current = null;
      setRefreshing(false);
      setRefreshProgress(null);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 rounded-lg border bg-muted/30">
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setRefreshOpen((v) => !v)}
          aria-expanded={refreshOpen}
        >
          <span className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh data for everyone
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${refreshOpen ? "rotate-180" : ""}`}
          />
        </button>
        {refreshOpen && (
          <div className="border-t px-4 pb-4 pt-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Paste your TrustMrr API key to pull fresh data and update the cache for all users. Your key is saved in your browser only and never sent to our servers.
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="TrustMrr API key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem("trustmrr_api_key", e.target.value);
                }}
                className="flex-1 font-mono text-sm"
                disabled={refreshing}
                onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
              />
              {refreshing ? (
                <Button onClick={handleStop} variant="destructive" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={handleRefresh}
                  disabled={!apiKey.trim()}
                  size="sm"
                >
                  Refresh
                </Button>
              )}
            </div>
            {refreshing && refreshProgress && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {refreshProgress}
              </p>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          <span>Loading…</span>
        </div>
      )}

      <Tabs defaultValue="niches">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="niches" className="flex flex-1 items-center gap-2 sm:flex-none">
              <Tag className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Niche Opportunity Finder</span>
              <span className="sm:hidden">Niches</span>
            </TabsTrigger>
            <TabsTrigger value="valuation" className="flex flex-1 items-center gap-2 sm:flex-none">
              <BarChart2 className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Startup Valuation / Deal Score</span>
              <span className="sm:hidden">Deals</span>
            </TabsTrigger>
          </TabsList>
          {cachedAt && (
            <p className="text-xs text-muted-foreground sm:text-right">
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
