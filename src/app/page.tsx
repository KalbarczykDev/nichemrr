"use client";

import { useState, useEffect } from "react";
import { ApiKeyGate } from "@/components/ApiKeyGate";
import { NicheOpportunityTab } from "@/components/NicheOpportunityTab";
import { ValuationTab } from "@/components/ValuationTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart2, Tag } from "lucide-react";

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("trustmrr_api_key");
    if (stored) setApiKey(stored);
    setHydrated(true);
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("trustmrr_api_key");
    setApiKey(null);
  }

  if (!hydrated) return null;

  if (!apiKey) {
    return <ApiKeyGate onKeySubmit={setApiKey} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">NicheMRR</h1>
            <p className="text-xs text-muted-foreground">Powered by TrustMrr</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="niches">
          <TabsList className="mb-6">
            <TabsTrigger value="niches" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Niche Opportunity Finder
            </TabsTrigger>
            <TabsTrigger value="valuation" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Startup Valuation / Deal Score
            </TabsTrigger>
          </TabsList>
          <TabsContent value="niches">
            <NicheOpportunityTab apiKey={apiKey} />
          </TabsContent>
          <TabsContent value="valuation">
            <ValuationTab apiKey={apiKey} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
