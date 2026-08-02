export interface WeeklySalesRecord {
  id?: string;
  week_start_date: string; // YYYY-MM-DD
  region: string;
  store_id: string;
  store_name: string;
  city: string;
  store_format: string;
  product_category: string;
  footfall: number;
  transactions: number;
  units_sold: number;
  gross_sales: number;
  discount_amount: number;
  net_sales: number;
  sales_target: number;
  inventory_on_hand: number;
  stockouts: number;
  returns_amount: number;
  customer_rating: number;
  marketing_spend: number;
}

export interface StoreMasterRecord {
  store_id: string;
  store_name: string;
  region: string;
  city: string;
  store_format: string;
}

export interface MergedSalesRecord extends WeeklySalesRecord {
  // Joined fields from store_master if available
  master_store_name?: string;
  master_region?: string;
  master_city?: string;
  master_store_format?: string;
  stockout_risk_score?: number; // Calculated risk index
  stockout_risk_level?: 'High' | 'Medium' | 'Low';
}

export interface RetailFilterState {
  weeks: string[];
  regions: string[];
  stores: string[];
  cities: string[];
  storeFormats: string[];
  categories: string[];
  searchQuery: string;
}

export interface KpiMetrics {
  netSales: number;
  grossSales: number;
  salesTarget: number;
  targetAchievementPct: number;
  avgTransactionValue: number;
  returnRatePct: number;
  discountRatePct: number;
  totalFootfall: number;
  totalTransactions: number;
  totalUnitsSold: number;
  totalReturns: number;
  totalDiscount: number;
  totalStockouts: number;
  totalInventoryOnHand: number;
  avgCustomerRating: number;
  totalMarketingSpend: number;
  highStockoutStoresCount: number;
  conversionRatePct: number;
}

export interface StockoutRiskStore {
  store_id: string;
  store_name: string;
  region: string;
  city: string;
  stockouts: number;
  inventory_on_hand: number;
  net_sales: number;
  sales_target: number;
  target_achievement: number;
  risk_level: 'High' | 'Medium' | 'Low';
  risk_score: number;
}

export interface AiBusinessInsights {
  bestPerformingRegion: { name: string; sales: number; targetAchievement: number };
  worstPerformingRegion: { name: string; sales: number; targetAchievement: number };
  topPerformingStore: { name: string; region: string; sales: number; achievement: number };
  bottomPerformingStore: { name: string; region: string; sales: number; achievement: number };
  storesBelowTarget: Array<{ store_id: string; name: string; sales: number; target: number; gapPct: number }>;
  categoryWithHighestReturn: { category: string; returnAmount: number; returnRatePct: number };
  categoryWithHighestDiscount: { category: string; discountAmount: number; discountRatePct: number };
  stockoutObservations: Array<{ text: string; severity: 'high' | 'medium' | 'info' }>;
  overallRecommendations: string[];
  executiveSummary: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  salesCount: number;
  storesCount: number;
}
