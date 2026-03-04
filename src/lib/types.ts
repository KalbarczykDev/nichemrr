// Raw shape returned by the TrustMrr API
export interface TrustMrrStartup {
  slug: string;
  name: string;
  category: string | null;
  revenue: {
    mrr: number | null;        // cents
    last30Days: number | null; // cents
    total: number | null;      // cents
  } | null;
  growth30d: number | null;    // percentage
  customers: number | null;
  askingPrice: number | null;  // cents
  multiple: number | null;
  onSale: boolean;
  description: string | null;
  createdAt: string | null;
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
  category: string | null;
  mrr: number | null;          // dollars
  growth: number | null;       // percentage
  customers: number | null;
  askingPrice: number | null;  // dollars
  multiple: number | null;
  onSale: boolean;
  url: string;
  description: string | null;
  createdAt: string | null;
}

export interface NicheGroup {
  category: string;
  count: number;
  avgMrr: number;
  avgGrowth: number | null;
  totalCustomers: number;
  topStartups: Startup[];
  opportunityScore: number;
}

export interface DealStartup extends Startup {
  categoryAvgMultiple: number;
  dealScore: number;
  isHotDeal: boolean;
}
