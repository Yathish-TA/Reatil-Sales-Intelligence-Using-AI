import React, { useMemo, useState } from 'react';
import {
  calculateKpis,
  filterSalesRecords,
  formatCurrency,
  formatPercent,
  generateAiBusinessInsights,
} from './utils/analytics';
import {
  downloadExcelFile,
  SAMPLE_STORE_MASTER,
  SAMPLE_WEEKLY_SALES,
} from './utils/sampleData';
import {
  joinSalesWithStoreMaster,
} from './utils/excelParser';
import {
  MergedSalesRecord,
  RetailFilterState,
  StoreMasterRecord,
  WeeklySalesRecord,
} from './types/retail';
import { Header } from './components/Header';
import { FileUploadModal } from './components/FileUploadModal';
import { FilterPanel } from './components/FilterPanel';
import { KpiCards } from './components/KpiCards';
import { VisualAnalytics } from './components/VisualAnalytics';
import { AiInsightsPanel } from './components/AiInsightsPanel';
import { DataTableView } from './components/DataTableView';
import { StockoutAlertModal } from './components/StockoutAlertModal';

export default function App() {
  // Primary Datasets State
  const [weeklySalesData, setWeeklySalesData] = useState<WeeklySalesRecord[]>(SAMPLE_WEEKLY_SALES);
  const [storeMasterData, setStoreMasterData] = useState<StoreMasterRecord[]>(SAMPLE_STORE_MASTER);

  // Joined records memoized
  const mergedRecords: MergedSalesRecord[] = useMemo(() => {
    return joinSalesWithStoreMaster(weeklySalesData, storeMasterData);
  }, [weeklySalesData, storeMasterData]);

  // Filter State
  const [filters, setFilters] = useState<RetailFilterState>({
    weeks: [],
    regions: [],
    stores: [],
    cities: [],
    storeFormats: [],
    categories: [],
    searchQuery: '',
  });

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isStockoutModalOpen, setIsStockoutModalOpen] = useState<boolean>(false);

  // Available Filter Options Memoized
  const availableWeeks = useMemo(() => {
    const set = new Set<string>();
    mergedRecords.forEach((r) => r.week_start_date && set.add(r.week_start_date));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [mergedRecords]);

  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    mergedRecords.forEach((r) => r.region && set.add(r.region));
    return Array.from(set).sort();
  }, [mergedRecords]);

  const availableStores = useMemo(() => {
    const map = new Map<string, string>();
    mergedRecords.forEach((r) => {
      if (r.store_id) {
        map.set(r.store_id, r.store_name || r.store_id);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [mergedRecords]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    mergedRecords.forEach((r) => r.city && set.add(r.city));
    return Array.from(set).sort();
  }, [mergedRecords]);

  const availableFormats = useMemo(() => {
    const set = new Set<string>();
    mergedRecords.forEach((r) => r.store_format && set.add(r.store_format));
    return Array.from(set).sort();
  }, [mergedRecords]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    mergedRecords.forEach((r) => r.product_category && set.add(r.product_category));
    return Array.from(set).sort();
  }, [mergedRecords]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return filterSalesRecords(mergedRecords, filters);
  }, [mergedRecords, filters]);

  // KPIs memoized
  const kpis = useMemo(() => {
    return calculateKpis(filteredRecords);
  }, [filteredRecords]);

  // Date Range string
  const dateRange = useMemo(() => {
    if (availableWeeks.length === 0) return { start: '', end: '' };
    const sorted = [...availableWeeks].sort((a, b) => a.localeCompare(b));
    return {
      start: sorted[0],
      end: sorted[sorted.length - 1],
    };
  }, [availableWeeks]);

  // Handlers
  const handleDataUploaded = (
    sales: WeeklySalesRecord[],
    master: StoreMasterRecord[]
  ) => {
    if (sales.length > 0) {
      setWeeklySalesData(sales);
    }
    if (master.length > 0) {
      setStoreMasterData(master);
    }
    // Reset active filters
    setFilters({
      weeks: [],
      regions: [],
      stores: [],
      cities: [],
      storeFormats: [],
      categories: [],
      searchQuery: '',
    });
  };

  const handleLoadSampleData = () => {
    setWeeklySalesData(SAMPLE_WEEKLY_SALES);
    setStoreMasterData(SAMPLE_STORE_MASTER);
    setFilters({
      weeks: [],
      regions: [],
      stores: [],
      cities: [],
      storeFormats: [],
      categories: [],
      searchQuery: '',
    });
  };

  const handleExportFilteredExcel = () => {
    if (filteredRecords.length === 0) return;
    const exportRows = filteredRecords.map((r) => ({
      Week_Start_Date: r.week_start_date,
      Store_ID: r.store_id,
      Store_Name: r.store_name,
      Region: r.region,
      City: r.city,
      Store_Format: r.store_format,
      Product_Category: r.product_category,
      Footfall: r.footfall,
      Transactions: r.transactions,
      Units_Sold: r.units_sold,
      Gross_Sales: r.gross_sales,
      Discount_Amount: r.discount_amount,
      Net_Sales: r.net_sales,
      Sales_Target: r.sales_target,
      Target_Achievement_Pct: r.sales_target > 0 ? ((r.net_sales / r.sales_target) * 100).toFixed(1) + '%' : '0%',
      Inventory_On_Hand: r.inventory_on_hand,
      Stockouts: r.stockouts,
      Returns_Amount: r.returns_amount,
      Customer_Rating: r.customer_rating,
      Marketing_Spend: r.marketing_spend,
    }));

    downloadExcelFile(exportRows, `Retail_Sales_Export_${new Date().toISOString().slice(0, 10)}.xlsx`, 'Filtered Sales');
  };

  const handleExportSummaryText = () => {
    const insights = generateAiBusinessInsights(filteredRecords);
    const content = `===========================================================
RETAIL SALES INTELLIGENCE - EXECUTIVE REPORT
Generated On: ${new Date().toLocaleString()}
Records Included: ${filteredRecords.length}
===========================================================

EXECUTIVE SUMMARY:
${insights.executiveSummary}

KEY PERFORMANCE INDICATORS:
- Total Net Sales: ${formatCurrency(kpis.netSales)}
- Target Achievement: ${formatPercent(kpis.targetAchievementPct)} (Target: ${formatCurrency(kpis.salesTarget)})
- Avg Transaction Value: ${formatCurrency(kpis.avgTransactionValue)}
- Return Rate: ${formatPercent(kpis.returnRatePct)} (${formatCurrency(kpis.totalReturns)})
- Discount Rate: ${formatPercent(kpis.discountRatePct)} (${formatCurrency(kpis.totalDiscount)})
- High Stockout Risk Stores: ${kpis.highStockoutStoresCount}

REGIONAL & STORE PERFORMANCE:
- Best Performing Region: ${insights.bestPerformingRegion.name} (${formatCurrency(insights.bestPerformingRegion.sales)}, ${formatPercent(insights.bestPerformingRegion.targetAchievement)} target)
- Worst Performing Region: ${insights.worstPerformingRegion.name} (${formatCurrency(insights.worstPerformingRegion.sales)}, ${formatPercent(insights.worstPerformingRegion.targetAchievement)} target)
- Top Store: ${insights.topPerformingStore.name} (${insights.topPerformingStore.region}) - ${formatCurrency(insights.topPerformingStore.sales)}

ACTIONABLE STRATEGIC RECOMMENDATIONS:
${insights.overallRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Executive_Retail_Insights_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* App Header */}
      <Header
        salesCount={filteredRecords.length}
        storesCount={availableStores.length}
        weeksCount={availableWeeks.length}
        dateRange={dateRange}
        totalNetSales={kpis.netSales}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadSampleData={handleLoadSampleData}
        onExportFilteredExcel={handleExportFilteredExcel}
        onExportSummaryText={handleExportSummaryText}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          availableWeeks={availableWeeks}
          availableRegions={availableRegions}
          availableStores={availableStores}
          availableCities={availableCities}
          availableFormats={availableFormats}
          availableCategories={availableCategories}
          totalRecordsCount={mergedRecords.length}
          filteredRecordsCount={filteredRecords.length}
        />

        {/* KPI Cards */}
        <KpiCards
          kpis={kpis}
          onViewStockoutRisk={() => setIsStockoutModalOpen(true)}
        />

        {/* Visual Analytics Section */}
        <VisualAnalytics records={filteredRecords} />

        {/* AI Business Insight Panel */}
        <AiInsightsPanel
          records={filteredRecords}
          onExportSummaryText={handleExportSummaryText}
        />

        {/* Data Table View */}
        <DataTableView
          records={filteredRecords}
          onExportExcel={handleExportFilteredExcel}
        />

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs">
        <p>© 2026 Retail Sales Intelligence. Confidential & Enterprise Internal Use.</p>
      </footer>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataUploaded={handleDataUploaded}
        currentSalesCount={mergedRecords.length}
      />

      {/* Stockout Risk Alert Modal */}
      <StockoutAlertModal
        isOpen={isStockoutModalOpen}
        onClose={() => setIsStockoutModalOpen(false)}
        records={filteredRecords}
      />

    </div>
  );
}
