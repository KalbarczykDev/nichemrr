import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMrr(mrr: number | null | undefined): string {
  if (mrr == null) return "—";
  if (mrr >= 1_000_000) return `$${(mrr / 1_000_000).toFixed(1)}M`;
  if (mrr >= 1_000) return `$${(mrr / 1_000).toFixed(1)}K`;
  return `$${mrr.toFixed(0)}`;
}

export function formatMultiple(multiple: number | null | undefined): string {
  if (multiple == null) return "—";
  return `${multiple.toFixed(1)}x`;
}

export function formatGrowth(growth: number | null): string {
  if (growth === null) return "—";
  return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
}

export function formatScore(score: number): string {
  return `${(score * 100).toFixed(0)}`;
}
