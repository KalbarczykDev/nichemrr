import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart2, Tag, TrendingUp, Search, Zap, ArrowRight } from "lucide-react";
import { NicheIndexWidget } from "@/components/NicheIndexWidget";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SiteHeader from "@/components/SiteHeader";
import { connectToDatabase } from "@/lib/mongoose";
import { StartupCache } from "@/lib/models/StartupCache";

export const metadata = {
  description:
    "Discover high-opportunity SaaS niches and score acquisition deals using real TrustMrr data.",
};

interface NicheStat {
  _id: string;
  avgMrr: number;
  count: number;
}

async function getLandingStats(): Promise<{
  total: number;
  onSale: number;
  categories: number;
  topNiches: NicheStat[];
} | null> {
  try {
    await connectToDatabase();
    const [total, onSale, rawCategories, topNiches] = await Promise.all([
      StartupCache.countDocuments({}),
      StartupCache.countDocuments({ onSale: true }),
      StartupCache.distinct("category"),
      StartupCache.aggregate<NicheStat>([
        { $match: { category: { $ne: null }, mrr: { $gt: 0 } } },
        { $group: { _id: "$category", avgMrr: { $avg: "$mrr" }, count: { $sum: 1 } } },
        { $match: { count: { $gte: 3 } } },
        { $sort: { avgMrr: -1 } },
        { $limit: 5 },
      ]),
    ]);
    return { total, onSale, categories: rawCategories.filter(Boolean).length, topNiches };
  } catch {
    return null;
  }
}

function fmtCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  return String(n);
}

function fmtMrr(dollars: number) {
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`;
  return `$${Math.round(dollars)}`;
}

export default async function LandingPage() {
  const [session, stats] = await Promise.all([
    getServerSession(authOptions),
    getLandingStats(),
  ]);
  const loggedIn = !!session;
  const maxMrr = stats?.topNiches.length
    ? Math.max(...stats.topNiches.map((n) => n.avgMrr))
    : 1;

  return (
    <div className="flex flex-col">
      <SiteHeader />

      {/* ── Hero — always dark, stand-out section ── */}
      <section className="relative bg-zinc-950 dark:bg-zinc-900 text-white overflow-hidden border-b dark:border-zinc-800">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 pt-24 pb-20 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300 mb-8">
                <Zap className="h-3 w-3 text-white" />
                Powered by TrustMrr data
              </div>

              <h1 className="text-[40px] sm:text-[56px] xl:text-[72px] font-black tracking-[-0.02em] leading-[1] mb-5 max-w-2xl">
                Find the niche for
                <br />
                your next <span className="text-emerald-400">SaaS.</span>
                <br />
                <span className="text-zinc-500">Or acquire it.</span>
              </h1>

              <p className="text-lg text-zinc-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                NicheMRR analyses thousands of real startups listed on TrustMRR
                to surface high-opportunity niches and flag undervalued
                acquisitions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                {loggedIn ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-2 h-12 px-8 bg-white text-zinc-950 hover:bg-zinc-100">
                      Go to dashboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="gap-2 h-12 px-8 bg-white text-zinc-950 hover:bg-zinc-100">
                        Start for free <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="ghost" className="h-12 px-8 text-zinc-300 hover:text-white hover:bg-white/10">
                        Sign in
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="flex-1 w-full max-w-md lg:max-w-none">
              <div className="bg-zinc-900 dark:bg-zinc-800 rounded-2xl border border-zinc-700/50 p-6 shadow-2xl shadow-black/60">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                    Niche Opportunity Index
                  </p>
                  <span className="text-[11px] text-zinc-500">Live</span>
                </div>

                {stats?.topNiches.length ? (
                  <NicheIndexWidget
                    niches={stats.topNiches}
                    maxMrr={maxMrr}
                    total={stats.total}
                    categories={stats.categories}
                    onSale={stats.onSale}
                  />
                ) : (
                  <p className="text-xs text-zinc-500 py-4">Loading market data…</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (bento) ── */}
      <section className="bg-muted/30 border-t py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              What you get
            </p>
            <h2 className="text-[32px] sm:text-[40px] lg:text-5xl font-black tracking-[-0.02em] leading-[1.1] text-zinc-900 dark:text-zinc-50 mb-5 max-w-xl">
              Everything you need to find your{" "}
              <span className="text-primary">next move</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
            {/* Large card */}
            <div className="md:col-span-2 bg-card rounded-2xl border p-8 flex flex-col justify-between min-h-52">
              <div className="h-12 w-12 rounded-xl bg-foreground flex items-center justify-center mb-6">
                <Tag className="h-5 w-5 text-background" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Niche Opportunity Finder</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                  Startups grouped by category with opportunity scores based on
                  MRR, growth, and market saturation.
                </p>
              </div>
            </div>

            {/* Dark accent card — inverts on dark mode */}
            <div className="bg-foreground rounded-2xl border border-foreground/20 p-8 flex flex-col justify-between min-h-52">
              <div className="h-12 w-12 rounded-xl bg-background/10 flex items-center justify-center mb-6">
                <BarChart2 className="h-5 w-5 text-background" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-background">Deal Score</h3>
                <p className="text-background/60 text-sm leading-relaxed">
                  Every startup for sale gets a deal score factoring in asking
                  multiple, MRR, and growth trajectory.
                </p>
              </div>
            </div>

            {/* Small card */}
            <div className="bg-card rounded-2xl border p-8 flex flex-col justify-between min-h-52">
              <div className="h-12 w-12 rounded-xl bg-foreground flex items-center justify-center mb-6">
                <TrendingUp className="h-5 w-5 text-background" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Real Data</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sourced directly from TrustMrr and refreshed regularly — not
                  scraped estimates, actual MRR figures.
                </p>
              </div>
            </div>

            {/* Stats card */}
            <div className="md:col-span-2 bg-muted rounded-2xl border p-8 flex items-center gap-6 min-h-52">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Live market data
                </p>
                <p className="text-2xl font-extrabold text-foreground mb-1">
                  {stats ? `${fmtCount(stats.total)} startups` : "Live startups"}
                </p>
                <p className="text-sm text-muted-foreground">
                  across {stats ? stats.categories : "50+"} categories, updated continuously from TrustMrr.
                </p>
              </div>
              {stats?.topNiches.length ? (
                <div className="hidden sm:flex flex-col gap-2">
                  {stats.topNiches.slice(0, 4).map((n) => (
                    <span key={n._id} className="text-xs bg-card border rounded-full px-3 py-1 text-foreground font-medium">
                      {n._id}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-background border-t py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              How it works
            </p>
            <h2 className="text-[32px] sm:text-[40px] lg:text-5xl font-black tracking-[-0.02em] leading-[1.1] text-zinc-900 dark:text-zinc-50 mb-5 max-w-xl">
              <span className="text-primary">Three steps.</span> That&apos;s it.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl">
            {[
              {
                icon: Search,
                step: "01",
                title: "Browse niches",
                desc: "See every SaaS category ranked by opportunity score. Spot which niches are underserved and growing.",
              },
              {
                icon: BarChart2,
                step: "02",
                title: "Review deals",
                desc: "Filter startups for sale by MRR and deal score. Find acquisitions priced below their real value.",
              },
              {
                icon: TrendingUp,
                step: "03",
                title: "Move fast",
                desc: "Good deals go quickly. NicheMRR gives you the analysis instantly so you can act before others.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step}>
                <p className="text-7xl font-black text-foreground/20 dark:text-foreground/30 mb-4 select-none leading-none">
                  {step}
                </p>
                <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center mb-4">
                  <Icon className="h-4 w-4 text-background" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — always dark ── */}
      <section className="bg-zinc-950 dark:bg-zinc-900 border-t dark:border-zinc-800 py-28">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
            Get started
          </p>
          <h2 className="text-[40px] sm:text-5xl font-black tracking-[-0.02em] leading-[1.1] text-white mb-5 max-w-lg mx-auto">
            Ready to find your <span className="text-emerald-400">niche?</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto">
            Create a free account and get access to the full dashboard in
            seconds.
          </p>
          <Link href={loggedIn ? "/dashboard" : "/register"}>
            <Button
              size="lg"
              className="gap-2 h-12 px-10 bg-white text-zinc-950 hover:bg-zinc-100 text-base"
            >
              {loggedIn ? "Go to dashboard" : "Get started"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
