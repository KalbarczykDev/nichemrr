// Raw shape returned by the TrustMrr API
export interface TrustMrrStartup {
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
  website: string | null;
  country: string | null;
  foundedDate: string | null;
  category: string | null;
  paymentProvider: string | null;
  targetAudience: string | null;
  revenue: {
    last30Days: number | null; // cents
    mrr: number | null;        // cents
    total: number | null;      // cents
  } | null;
  customers: number | null;
  activeSubscriptions: number | null;
  askingPrice: number | null;        // cents
  profitMarginLast30Days: number | null; // percentage 0–100
  growth30d: number | null;          // decimal e.g. 0.12 = 12%
  multiple: number | null;
  onSale: boolean;
  firstListedForSaleAt: string | null;
  xHandle: string | null;
}

export interface TrustMrrResponse {
  data: TrustMrrStartup[];
  meta: {
    hasMore: boolean;
    total: number;
    page: number;
    limit: number;
  };
}

// Normalised shape used throughout the app (dollars, not cents)
export interface Startup {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  website: string | null;
  url: string;              // TrustMrr listing URL
  country: string | null;
  foundedDate: string | null;
  category: string | null;
  paymentProvider: string | null;
  targetAudience: string | null;
  mrr: number | null;          // dollars
  revenueLastMonth: number | null; // dollars (last30Days)
  revenueTotal: number | null;     // dollars
  customers: number | null;
  activeSubscriptions: number | null;
  askingPrice: number | null;  // dollars
  profitMarginLast30Days: number | null; // percentage
  growth: number | null;       // decimal
  multiple: number | null;
  onSale: boolean;
  firstListedForSaleAt: string | null;
  xHandle: string | null;
}

export interface NicheGroup {
  category: string;
  count: number;
  avgMrr: number;
  avgGrowth: number | null;
  avgProfitMargin: number | null;
  totalCustomers: number;
  topStartups: Startup[];
  opportunityScore: number;
}

export interface DealStartup extends Startup {
  categoryAvgMultiple: number;
  dealScore: number;
  isHotDeal: boolean;
}
