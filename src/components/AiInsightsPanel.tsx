import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  Download,
  Lightbulb,
  Sparkles,
  Store,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { generateAiBusinessInsights, formatCurrency, formatPercent } from '../utils/analytics';
import { MergedSalesRecord } from '../types/retail';

interface AiInsightsPanelProps {
  records: MergedSalesRecord[];
  onExportSummaryText: () => void;
}

export const AiInsightsPanel: React.FC<AiInsightsPanelProps> = ({
  records,
  onExportSummaryText,
}) => {
  const [copied, setCopied] = useState(false);
  const insights = generateAiBusinessInsights(records);

  const handleCopySummary = () => {
    const textToCopy = `RETAIL SALES INTELLIGENCE - EXECUTIVE SUMMARY
--------------------------------------------------
${insights.executiveSummary}

KEY PERFORMANCE HIGHLIGHTS:
- Best Performing Region: ${insights.bestPerformingRegion.name} (${formatCurrency(insights.bestPerformingRegion.sales)}, ${formatPercent(insights.bestPerformingRegion.targetAchievement)} target achievement)
- Worst Performing Region: ${insights.worstPerformingRegion.name} (${formatCurrency(insights.worstPerformingRegion.sales)}, ${formatPercent(insights.worstPerformingRegion.targetAchievement)} target achievement)
- Top Store: ${insights.topPerformingStore.name} (${insights.topPerformingStore.region}) - ${formatCurrency(insights.topPerformingStore.sales)}
- Lowest Store: ${insights.bottomPerformingStore.name} (${insights.bottomPerformingStore.region}) - ${formatCurrency(insights.bottomPerformingStore.sales)}

OPERATIONAL WATCHLIST:
- Highest Return Category: ${insights.categoryWithHighestReturn.category} (${formatPercent(insights.categoryWithHighestReturn.returnRatePct)} return rate, ${formatCurrency(insights.categoryWithHighestReturn.returnAmount)})
- Highest Discount Category: ${insights.categoryWithHighestDiscount.category} (${formatPercent(insights.categoryWithHighestDiscount.discountRatePct)} discount rate, ${formatCurrency(insights.categoryWithHighestDiscount.discountAmount)})
- Stores Below Target: ${insights.storesBelowTarget.length} store(s) trailing target

RECOMMENDATIONS:
${insights.overallRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">AI Business Insight Engine</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                Real-Time AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automated executive summary based on active filter parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onExportSummaryText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Executive Narrative Paragraph */}
      <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 text-slate-200 text-xs leading-relaxed">
        <p className="font-medium text-slate-300">{insights.executiveSummary}</p>
      </div>

      {/* Structured Executive Bullet Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Best Performing Region */}
        <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Best Region</span>
          </div>
          <div className="text-base font-extrabold text-white">
            {insights.bestPerformingRegion.name}
          </div>
          <p className="text-xs text-emerald-400 font-medium mt-1">
            {formatCurrency(insights.bestPerformingRegion.sales)} ({formatPercent(insights.bestPerformingRegion.targetAchievement)} target)
          </p>
        </div>

        {/* 2. Worst Performing Region */}
        <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <TrendingDown className="h-4 w-4 text-rose-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Worst Region</span>
          </div>
          <div className="text-base font-extrabold text-white">
            {insights.worstPerformingRegion.name}
          </div>
          <p className="text-xs text-rose-400 font-medium mt-1">
            {formatCurrency(insights.worstPerformingRegion.sales)} ({formatPercent(insights.worstPerformingRegion.targetAchievement)} target)
          </p>
        </div>

        {/* 3. Top Performing Store */}
        <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Store className="h-4 w-4 text-blue-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Top Store</span>
          </div>
          <div className="text-sm font-extrabold text-white truncate" title={insights.topPerformingStore.name}>
            {insights.topPerformingStore.name}
          </div>
          <p className="text-xs text-blue-400 font-medium mt-1">
            {formatCurrency(insights.topPerformingStore.sales)} ({insights.topPerformingStore.region})
          </p>
        </div>

        {/* 4. Stores Below Target */}
        <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Stores Below Target</span>
          </div>
          <div className="text-base font-extrabold text-white">
            {insights.storesBelowTarget.length} Store{insights.storesBelowTarget.length === 1 ? '' : 's'}
          </div>
          <p className="text-xs text-amber-400 font-medium mt-1">
            {insights.storesBelowTarget.length > 0
              ? `Max gap: ${formatPercent(insights.storesBelowTarget[0]?.gapPct || 0)}`
              : 'All stores meeting target'}
          </p>
        </div>

      </div>

      {/* Categories & Stockout Observations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Category Return & Discount Highlights */}
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            Category Risk Observations
          </h4>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>
                <strong>Highest Return Category:</strong> {insights.categoryWithHighestReturn.category} with{' '}
                <strong className="text-rose-400">{formatPercent(insights.categoryWithHighestReturn.returnRatePct)}</strong> return rate ({formatCurrency(insights.categoryWithHighestReturn.returnAmount)} returned).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>
                <strong>Highest Discount Category:</strong> {insights.categoryWithHighestDiscount.category} with{' '}
                <strong className="text-purple-300">{formatPercent(insights.categoryWithHighestDiscount.discountRatePct)}</strong> discount rate ({formatCurrency(insights.categoryWithHighestDiscount.discountAmount)} markdown).
              </span>
            </li>
          </ul>
        </div>

        {/* Stockout Risk Observations */}
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Stockout & Inventory Observations
          </h4>
          <div className="space-y-2 text-xs">
            {insights.stockoutObservations.map((obs, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 font-bold">•</span>
                <span>{obs.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Overall Business Recommendations */}
      <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/80 space-y-3">
        <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          Overall Actionable Business Recommendations
        </h3>
        <div className="space-y-2">
          {insights.overallRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
              <span className="h-5 w-5 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                {i + 1}
              </span>
              <p className="leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
