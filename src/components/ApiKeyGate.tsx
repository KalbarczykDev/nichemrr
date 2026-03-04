"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Loader2 } from "lucide-react";

interface ApiKeyGateProps {
  onKeySubmit: (key: string) => void;
}

export function ApiKeyGate({ onKeySubmit }: ApiKeyGateProps) {
  const [key, setKey] = useState(
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_TRUSTMRR_KEY ?? "")
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      // Validate key with a test request
      const res = await fetch("/api/startups?limit=1&page=1", {
        headers: { "x-api-key": trimmed },
      });

      if (res.status === 401 || res.status === 403) {
        setError("Invalid API key. Please check and try again.");
        return;
      }

      if (!res.ok) {
        setError(`Unexpected error (${res.status}). Please try again.`);
        return;
      }

      sessionStorage.setItem("trustmrr_api_key", trimmed);
      onKeySubmit(trimmed);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">NicheMRR</CardTitle>
          <CardDescription>
            Enter your TrustMrr API key to start analyzing startup niches and deal scores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="tmrr_..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                autoFocus
                className="font-mono"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !key.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Connect to TrustMrr"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Your key is stored only in session storage and never sent to our servers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
