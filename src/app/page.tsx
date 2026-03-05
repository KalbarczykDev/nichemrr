import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Tag,
  TrendingUp,
  Search,
  Zap,
  ArrowRight,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  description:
    "Discover high-opportunity SaaS niches and score acquisition deals using real TrustMrr data.",
};

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const loggedIn = !!session;
  return (
    <div className="flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-6">
          <Zap className="h-3 w-3" />
          Powered by TrustMrr data
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          Find niche for your next SaaS.
          <br />
          Or acquire it.
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          NicheMRR analyses thousands of real startups to surface
          high-opportunity niches and flag undervalued acquisitions.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {loggedIn ? (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Go to dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-b bg-muted/30">
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-2xl font-bold text-center mb-12">
            Everything you need to find your next move
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Niche Opportunity Finder</h3>
              <p className="text-sm text-muted-foreground">
                Startups grouped by category with opportunity scores based on
                MRR, growth, and market saturation.
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Deal Score</h3>
              <p className="text-sm text-muted-foreground">
                Every startup for sale gets a deal score factoring in asking
                multiple, MRR, and growth trajectory.
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Real Data</h3>
              <p className="text-sm text-muted-foreground">
                Sourced directly from TrustMrr and refreshed regularly — not
                scraped estimates, actual MRR figures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20 max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="space-y-8">
          {[
            {
              icon: Search,
              step: "1",
              title: "Browse niches",
              desc: "See every SaaS category ranked by opportunity score. Spot which niches are underserved and growing.",
            },
            {
              icon: BarChart2,
              step: "2",
              title: "Review deals",
              desc: "Filter startups for sale by MRR and deal score. Find acquisitions priced below their real value.",
            },
            {
              icon: TrendingUp,
              step: "3",
              title: "Move fast",
              desc: "Good deals go quickly. NicheMRR gives you the analysis instantly so you can act before others.",
            },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex gap-5">
              <div className="h-9 w-9 shrink-0 rounded-full border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
                {step}
              </div>
              <div className="space-y-1 pt-1">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20 text-center max-w-xl">
          <h2 className="text-2xl font-bold mb-4">Ready to find your niche?</h2>
          <p className="text-muted-foreground mb-8">
            Create a free account and get access to the full dashboard in
            seconds.
          </p>
          <Link href={loggedIn ? "/dashboard" : "/register"}>
            <Button size="lg" className="gap-2">
              {loggedIn ? "Go to dashboard" : "Get started"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
