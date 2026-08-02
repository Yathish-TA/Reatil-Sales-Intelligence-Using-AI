import {
  AiBusinessInsights,
  KpiMetrics,
  MergedSalesRecord,
  RetailFilterState,
  StockoutRiskStore,
} from '../types/retail';

// Format currency numbers cleanly (e.g. $1,245,800 or $1.2M)
export function formatCurrency(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(val: number, decimals = 1): string {
  if (isNaN(val) || !isFinite(val)) return '0.0%';
  return `${val.toFixed(decimals)}%`;
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(val));
}

// Main Filter Function
export function filterSalesRecords(
  records: MergedSalesRecord[],
  filters: RetailFilterState
): MergedSalesRecord[] {
  return records.filter((r) => {
    // Week filter
    if (filters.weeks.length > 0 && !filters.weeks.includes(r.week_start_date)) {
      return false;
    }
    // Region filter
    if (filters.regions.length > 0 && !filters.regions.includes(r.region)) {
      return false;
    }
    // Store filter
    if (
      filters.stores.length > 0 &&
      !filters.stores.includes(r.store_id) &&
      !filters.stores.includes(r.store_name)
    ) {
      return false;
    }
    // City filter
    if (filters.cities.length > 0 && !filters.cities.includes(r.city)) {
      return false;
    }
    // Store format filter
    if (filters.storeFormats.length > 0 && !filters.storeFormats.includes(r.store_format)) {
      return false;
    }
    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(r.product_category)
    ) {
      return false;
    }
    // Search query
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchName = r.store_name.toLowerCase().includes(q);
      const matchId = r.store_id.toLowerCase().includes(q);
      const matchCity = r.city.toLowerCase().includes(q);
      const matchCat = r.product_category.toLowerCase().includes(q);
      const matchRegion = r.region.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchCity && !matchCat && !matchRegion) {
        return false;
      }
    }
    return true;
  });
}

// Compute aggregate KPIs
export function calculateKpis(records: MergedSalesRecord[]): KpiMetrics {
  if (records.length === 0) {
    return {
      netSales: 0,
      grossSales: 0,
      salesTarget: 0,
      targetAchievementPct: 0,
      avgTransactionValue: 0,
      returnRatePct: 0,
      discountRatePct: 0,
      totalFootfall: 0,
      totalTransactions: 0,
      totalUnitsSold: 0,
      totalReturns: 0,
      totalDiscount: 0,
      totalStockouts: 0,
      totalInventoryOnHand: 0,
      avgCustomerRating: 0,
      totalMarketingSpend: 0,
      highStockoutStoresCount: 0,
      conversionRatePct: 0,
    };
  }

  const netSales = records.reduce((sum, r) => sum + r.net_sales, 0);
  const grossSales = records.reduce((sum, r) => sum + r.gross_sales, 0);
  const salesTarget = records.reduce((sum, r) => sum + r.sales_target, 0);
  const transactions = records.reduce((sum, r) => sum + r.transactions, 0);
  const footfall = records.reduce((sum, r) => sum + r.footfall, 0);
  const unitsSold = records.reduce((sum, r) => sum + r.units_sold, 0);
  const returnsAmount = records.reduce((sum, r) => sum + r.returns_amount, 0);
  const discountAmount = records.reduce((sum, r) => sum + r.discount_amount, 0);
  const stockouts = records.reduce((sum, r) => sum + r.stockouts, 0);
  const inventoryOnHand = records.reduce((sum, r) => sum + r.inventory_on_hand, 0);
  const marketingSpend = records.reduce((sum, r) => sum + r.marketing_spend, 0);

  const ratingSum = records.reduce((sum, r) => sum + r.customer_rating, 0);
  const avgCustomerRating = records.length > 0 ? ratingSum / records.length : 0;

  // Exact formulas specified in requirements
  const targetAchievementPct = salesTarget > 0 ? (netSales / salesTarget) * 100 : 0;
  const avgTransactionValue = transactions > 0 ? netSales / transactions : 0;
  const returnRatePct = netSales > 0 ? (returnsAmount / netSales) * 100 : 0;
  const discountRatePct = grossSales > 0 ? (discountAmount / grossSales) * 100 : 0;
  const conversionRatePct = footfall > 0 ? (transactions / footfall) * 100 : 0;

  // Identify high stockout stores
  const storeStockoutsMap = new Map<string, { stockouts: number; inventory: number }>();
  records.forEach((r) => {
    const cur = storeStockoutsMap.get(r.store_id) || { stockouts: 0, inventory: 0 };
    cur.stockouts += r.stockouts;
    cur.inventory += r.inventory_on_hand;
    storeStockoutsMap.set(r.store_id, cur);
  });

  let highStockoutStoresCount = 0;
  storeStockoutsMap.forEach((val) => {
    if (val.stockouts > 25 || (val.stockouts > 12 && val.inventory < 40)) {
      highStockoutStoresCount++;
    }
  });

  return {
    netSales,
    grossSales,
    salesTarget,
    targetAchievementPct,
    avgTransactionValue,
    returnRatePct,
    discountRatePct,
    totalFootfall: footfall,
    totalTransactions: transactions,
    totalUnitsSold: unitsSold,
    totalReturns: returnsAmount,
    totalDiscount: discountAmount,
    totalStockouts: stockouts,
    totalInventoryOnHand: inventoryOnHand,
    avgCustomerRating,
    totalMarketingSpend: marketingSpend,
    highStockoutStoresCount,
    conversionRatePct,
  };
}

// Chart Aggregators

// 1. Weekly Sales Trend
export function aggregateWeeklySalesTrend(records: MergedSalesRecord[]) {
  const map = new Map<string, { week: string; netSales: number; salesTarget: number }>();

  records.forEach((r) => {
    const cur = map.get(r.week_start_date) || { week: r.week_start_date, netSales: 0, salesTarget: 0 };
    cur.netSales += r.net_sales;
    cur.salesTarget += r.sales_target;
    map.set(r.week_start_date, cur);
  });

  return Array.from(map.values()).sort((a, b) => a.week.localeCompare(b.week));
}

// 2. Sales by Region
export function aggregateSalesByRegion(records: MergedSalesRecord[]) {
  const map = new Map<
    string,
    { region: string; netSales: number; salesTarget: number; targetAchievement: number }
  >();

  records.forEach((r) => {
    const cur = map.get(r.region) || {
      region: r.region || 'Unknown',
      netSales: 0,
      salesTarget: 0,
      targetAchievement: 0,
    };
    cur.netSales += r.net_sales;
    cur.salesTarget += r.sales_target;
    map.set(r.region, cur);
  });

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      targetAchievement: item.salesTarget > 0 ? (item.netSales / item.salesTarget) * 100 : 0,
    }))
    .sort((a, b) => b.netSales - a.netSales);
}

// 3. Category Performance
export function aggregateCategoryPerformance(records: MergedSalesRecord[]) {
  const map = new Map<
    string,
    {
      category: string;
      netSales: number;
      grossSales: number;
      returnsAmount: number;
      discountAmount: number;
      returnRatePct: number;
      discountRatePct: number;
    }
  >();

  records.forEach((r) => {
    const cat = r.product_category || 'General';
    const cur = map.get(cat) || {
      category: cat,
      netSales: 0,
      grossSales: 0,
      returnsAmount: 0,
      discountAmount: 0,
      returnRatePct: 0,
      discountRatePct: 0,
    };
    cur.netSales += r.net_sales;
    cur.grossSales += r.gross_sales;
    cur.returnsAmount += r.returns_amount;
    cur.discountAmount += r.discount_amount;
    map.set(cat, cur);
  });

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      returnRatePct: item.netSales > 0 ? (item.returnsAmount / item.netSales) * 100 : 0,
      discountRatePct: item.grossSales > 0 ? (item.discountAmount / item.grossSales) * 100 : 0,
    }))
    .sort((a, b) => b.netSales - a.netSales);
}

// 4. Store Leaderboard
export function aggregateStoreLeaderboard(records: MergedSalesRecord[]) {
  const map = new Map<
    string,
    {
      store_id: string;
      store_name: string;
      region: string;
      city: string;
      store_format: string;
      netSales: number;
      salesTarget: number;
      transactions: number;
      footfall: number;
      stockouts: number;
      inventory: number;
    }
  >();

  records.forEach((r) => {
    const cur = map.get(r.store_id) || {
      store_id: r.store_id,
      store_name: r.store_name,
      region: r.region,
      city: r.city,
      store_format: r.store_format,
      netSales: 0,
      salesTarget: 0,
      transactions: 0,
      footfall: 0,
      stockouts: 0,
      inventory: 0,
    };
    cur.netSales += r.net_sales;
    cur.salesTarget += r.sales_target;
    cur.transactions += r.transactions;
    cur.footfall += r.footfall;
    cur.stockouts += r.stockouts;
    cur.inventory += r.inventory_on_hand;
    map.set(r.store_id, cur);
  });

  return Array.from(map.values())
    .map((s) => {
      const achievementPct = s.salesTarget > 0 ? (s.netSales / s.salesTarget) * 100 : 0;
      const atv = s.transactions > 0 ? s.netSales / s.transactions : 0;
      const convRate = s.footfall > 0 ? (s.transactions / s.footfall) * 100 : 0;
      return {
        ...s,
        achievementPct,
        atv,
        convRate,
      };
    })
    .sort((a, b) => b.netSales - a.netSales);
}

// 5. Stockout Risk Analysis
export function aggregateStockoutRisk(records: MergedSalesRecord[]): StockoutRiskStore[] {
  const map = new Map<
    string,
    {
      store_id: string;
      store_name: string;
      region: string;
      city: string;
      stockouts: number;
      inventory_on_hand: number;
      net_sales: number;
      sales_target: number;
    }
  >();

  records.forEach((r) => {
    const cur = map.get(r.store_id) || {
      store_id: r.store_id,
      store_name: r.store_name,
      region: r.region,
      city: r.city,
      stockouts: 0,
      inventory_on_hand: 0,
      net_sales: 0,
      sales_target: 0,
    };
    cur.stockouts += r.stockouts;
    cur.inventory_on_hand += r.inventory_on_hand;
    cur.net_sales += r.net_sales;
    cur.sales_target += r.sales_target;
    map.set(r.store_id, cur);
  });

  return Array.from(map.values())
    .map((s) => {
      const target_achievement =
        s.sales_target > 0 ? (s.net_sales / s.sales_target) * 100 : 0;
      
      // Risk score algorithm based on stockouts vs inventory depth
      let risk_level: 'High' | 'Medium' | 'Low' = 'Low';
      const risk_score = s.stockouts * 2.5 + Math.max(0, 100 - s.inventory_on_hand) * 0.5;

      if (s.stockouts >= 25 || (s.stockouts >= 15 && s.inventory_on_hand < 50)) {
        risk_level = 'High';
      } else if (s.stockouts >= 10 || (s.stockouts >= 5 && s.inventory_on_hand < 100)) {
        risk_level = 'Medium';
      }

      return {
        ...s,
        target_achievement,
        risk_level,
        risk_score,
      };
    })
    .sort((a, b) => b.stockouts - a.stockouts);
}

// Generate Dynamic AI Business Insights
export function generateAiBusinessInsights(records: MergedSalesRecord[]): AiBusinessInsights {
  if (records.length === 0) {
    return {
      bestPerformingRegion: { name: 'N/A', sales: 0, targetAchievement: 0 },
      worstPerformingRegion: { name: 'N/A', sales: 0, targetAchievement: 0 },
      topPerformingStore: { name: 'N/A', region: 'N/A', sales: 0, achievement: 0 },
      bottomPerformingStore: { name: 'N/A', region: 'N/A', sales: 0, achievement: 0 },
      storesBelowTarget: [],
      categoryWithHighestReturn: { category: 'N/A', returnAmount: 0, returnRatePct: 0 },
      categoryWithHighestDiscount: { category: 'N/A', discountAmount: 0, discountRatePct: 0 },
      stockoutObservations: [{ text: 'No sales data available for stockout analysis.', severity: 'info' }],
      overallRecommendations: ['Upload sales data or reset filters to view AI business recommendations.'],
      executiveSummary: 'No data selected.',
    };
  }

  const kpis = calculateKpis(records);
  const regionAgg = aggregateSalesByRegion(records);
  const catAgg = aggregateCategoryPerformance(records);
  const storeAgg = aggregateStoreLeaderboard(records);
  const stockoutRiskStores = aggregateStockoutRisk(records);

  // Best & Worst Regions
  const bestRegion = regionAgg[0] || { region: 'N/A', netSales: 0, targetAchievement: 0 };
  const worstRegion = regionAgg[regionAgg.length - 1] || { region: 'N/A', netSales: 0, targetAchievement: 0 };

  // Best & Worst Stores
  const topStore = storeAgg[0] || { store_name: 'N/A', region: 'N/A', netSales: 0, achievementPct: 0 };
  const bottomStore = storeAgg[storeAgg.length - 1] || { store_name: 'N/A', region: 'N/A', netSales: 0, achievementPct: 0 };

  // Stores below target (achievement < 100%)
  const storesBelowTarget = storeAgg
    .filter((s) => s.achievementPct < 100)
    .map((s) => ({
      store_id: s.store_id,
      name: s.store_name,
      sales: s.netSales,
      target: s.salesTarget,
      gapPct: 100 - s.achievementPct,
    }))
    .sort((a, b) => b.gapPct - a.gapPct);

  // Category with highest return rate
  const sortedByReturns = [...catAgg].sort((a, b) => b.returnRatePct - a.returnRatePct);
  const highestReturnCat = sortedByReturns[0] || {
    category: 'N/A',
    returnsAmount: 0,
    returnRatePct: 0,
  };

  // Category with highest discount rate
  const sortedByDiscounts = [...catAgg].sort((a, b) => b.discountRatePct - a.discountRatePct);
  const highestDiscountCat = sortedByDiscounts[0] || {
    category: 'N/A',
    discountAmount: 0,
    discountRatePct: 0,
  };

  // Stockout Observations
  const highRiskStockoutStores = stockoutRiskStores.filter((s) => s.risk_level === 'High');
  const stockoutObservations: Array<{ text: string; severity: 'high' | 'medium' | 'info' }> = [];

  if (highRiskStockoutStores.length > 0) {
    const names = highRiskStockoutStores.slice(0, 3).map((s) => `${s.store_name} (${s.stockouts} stockouts)`).join(', ');
    stockoutObservations.push({
      text: `${highRiskStockoutStores.length} stores identified at High Stockout Risk: ${names}. Inventory levels are dangerously low relative to demand.`,
      severity: 'high',
    });
  } else {
    stockoutObservations.push({
      text: 'Inventory replenishment across active stores is operating within normal safety stock thresholds.',
      severity: 'info',
    });
  }

  // Recommendations
  const recommendations: string[] = [];

  // Rec 1: Target achievement strategy
  if (kpis.targetAchievementPct >= 100) {
    recommendations.push(
      `Strong Overall Target Performance: Net sales achieved ${formatPercent(kpis.targetAchievementPct)} of sales target. Capitalize on high-converting categories like ${catAgg[0]?.category || 'top products'}.`
    );
  } else {
    recommendations.push(
      `Target Shortfall Alert: Current sales achievement is at ${formatPercent(kpis.targetAchievementPct)} (${formatCurrency(kpis.salesTarget - kpis.netSales)} target gap). Prioritize re-engagement initiatives in ${worstRegion.region} region.`
    );
  }

  // Rec 2: Discount & Margin optimization
  if (kpis.discountRatePct > 10) {
    recommendations.push(
      `Discount Leakage Optimization: Discount rate is elevated at ${formatPercent(kpis.discountRatePct)} (${formatCurrency(kpis.totalDiscount)} total markdown). Audit promo strategies specifically in ${highestDiscountCat.category}.`
    );
  } else {
    recommendations.push(
      `Disciplined Price Realization: Maintain present discount guardrails (${formatPercent(kpis.discountRatePct)} markdown rate) to safeguard gross margin.`
    );
  }

  // Rec 3: Returns mitigation
  if (highestReturnCat.returnRatePct > 5) {
    recommendations.push(
      `Quality & Returns Audit: ${highestReturnCat.category} exhibits a high return rate of ${formatPercent(highestReturnCat.returnRatePct)} (${formatCurrency(highestReturnCat.returnsAmount)}). Inspect sizing, vendor specifications, or product descriptions.`
    );
  }

  // Rec 4: Inventory & Stockout balancing
  if (highRiskStockoutStores.length > 0) {
    recommendations.push(
      `Supply Chain Rebalancing: Immediately reallocate safety inventory to high-footfall locations experiencing stockouts to prevent lost conversion.`
    );
  }

  // Executive summary paragraph
  const executiveSummary = `During the selected period, total net sales reached ${formatCurrency(
    kpis.netSales
  )} across ${storeAgg.length} active stores, achieving ${formatPercent(
    kpis.targetAchievementPct
  )} of the revenue target. ${bestRegion.region} emerged as the top-performing region generating ${formatCurrency(
    bestRegion.netSales
  )}, led by ${topStore.store_name}. ${
    storesBelowTarget.length > 0
      ? `${storesBelowTarget.length} stores are currently trailing target expectations.`
      : 'All stores are performing at or above target levels.'
  }`;

  return {
    bestPerformingRegion: {
      name: bestRegion.region,
      sales: bestRegion.netSales,
      targetAchievement: bestRegion.targetAchievement,
    },
    worstPerformingRegion: {
      name: worstRegion.region,
      sales: worstRegion.netSales,
      targetAchievement: worstRegion.targetAchievement,
    },
    topPerformingStore: {
      name: topStore.store_name,
      region: topStore.region,
      sales: topStore.netSales,
      achievement: topStore.achievementPct,
    },
    bottomPerformingStore: {
      name: bottomStore.store_name,
      region: bottomStore.region,
      sales: bottomStore.netSales,
      achievement: bottomStore.achievementPct,
    },
    storesBelowTarget,
    categoryWithHighestReturn: {
      category: highestReturnCat.category,
      returnAmount: highestReturnCat.returnsAmount,
      returnRatePct: highestReturnCat.returnRatePct,
    },
    categoryWithHighestDiscount: {
      category: highestDiscountCat.category,
      discountAmount: highestDiscountCat.discountAmount,
      discountRatePct: highestDiscountCat.discountRatePct,
    },
    stockoutObservations,
    overallRecommendations: recommendations,
    executiveSummary,
  };
}
