"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface NicheStat {
  _id: string;
  avgMrr: number;
}

interface Props {
  niches: NicheStat[];
  maxMrr: number;
  total: number;
  categories: number;
  onSale: number;
}

const BAR_DURATION = 8000;
const NUM_DURATION = 4000;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function fmtCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  return String(Math.round(n));
}

function fmtMrr(dollars: number) {
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`;
  return `$${Math.round(dollars)}`;
}

export function NicheIndexWidget({ niches, maxMrr, total, categories, onSale }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // bar widths 0 → target %
  const [barWidths, setBarWidths] = useState(() => niches.map(() => 0));
  // MRR numbers
  const [mrrValues, setMrrValues] = useState(() => niches.map(() => 0));
  // bottom stats
  const [statsValues, setStatsValues] = useState({ total: 0, categories: 0, onSale: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const mrrTargets = niches.map((n) => n.avgMrr);
        const barTargets = niches.map((n) => Math.round((n.avgMrr / maxMrr) * 100));

        const barStart = performance.now();
        const numStart = performance.now();

        function animateBars(now: number) {
          const t = easeOut(Math.min((now - barStart) / BAR_DURATION, 1));
          setBarWidths(barTargets.map((w) => w * t));
          if (t < 1) rafRef.current = requestAnimationFrame(animateBars);
        }

        function animateNumbers(now: number) {
          const t = easeOut(Math.min((now - numStart) / NUM_DURATION, 1));
          setMrrValues(mrrTargets.map((v) => v * t));
          setStatsValues({
            total: total * t,
            categories: categories * t,
            onSale: onSale * t,
          });
          if (t < 1) requestAnimationFrame(animateNumbers);
        }

        // Double rAF so browser paints width:0 before bars start moving
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(animateBars);
            requestAnimationFrame(animateNumbers);
          });
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [niches, maxMrr, total, categories, onSale]);

  return (
    <div ref={containerRef}>
      {/* Bars */}
      <div className="space-y-3.5">
        {niches.map((n, i) => (
          <div key={n._id} className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 w-24 shrink-0 truncate">{n._id}</span>
            <div className="flex-1 bg-zinc-800 dark:bg-zinc-700 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full"
                style={{ width: `${barWidths[i]}%` }}
              />
            </div>
            <div className="flex items-center gap-1 w-16 justify-end">
              <span className="text-xs text-zinc-300 tabular-nums">
                {fmtMrr(mrrValues[i])}
              </span>
              <ArrowUpRight className="h-3 w-3 text-emerald-400 shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom stats */}
      <div className="mt-6 pt-5 border-t border-zinc-800 dark:border-zinc-700 grid grid-cols-3 gap-4">
        {[
          { label: "Startups", value: fmtCount(statsValues.total) },
          { label: "Categories", value: String(Math.round(statsValues.categories)) },
          { label: "On sale", value: String(Math.round(statsValues.onSale)) },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-lg font-bold text-white tabular-nums">{s.value}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
