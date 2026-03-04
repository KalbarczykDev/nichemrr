export interface Startup {
  id: string;
  name: string;
  category: string | null;
  mrr: number;
  growth: number | null;
  customers: number | null;
  askingPrice: number | null;
  multiple: number | null;
  onSale: boolean;
  url: string | null;
  description: string | null;
  createdAt: string | null;
}

export interface TrustMrrResponse {
  data: Startup[];
  hasMore: boolean;
  total: number;
  page: number;
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
