import React from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgePercent,
  CheckCircle2,
  DollarSign,
  PackageX,
  Receipt,
  RotateCcw,
  Target,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../utils/analytics';
import { KpiMetrics } from '../types/retail';

interface KpiCardsProps {
  kpis: KpiMetrics;
  onViewStockoutRisk?: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis, onViewStockoutRisk }) => {
  // Color indicator logic for Target Achievement
  const getTargetColor = (pct: number) => {
    if (pct >= 100) {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800',
        icon: ArrowUpRight,
        label: 'Target Exceeded',
      };
    }
    if (pct >= 88) {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800',
        icon: TrendingUp,
        label: 'Near Target',
      };
    }
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800',
      icon: ArrowDownRight,
      label: 'Below Target',
    };
  };

  // Color indicator logic for Return Rate % (lower is better)
  const getReturnRateColor = (pct: number) => {
    if (pct <= 3.5) {
      return {
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-800',
        label: 'Healthy Return Rate',
      };
    }
    if (pct <= 6.0) {
      return {
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-800',
        label: 'Moderate Returns',
      };
    }
    return {
      text: 'text-rose-700',
      badge: 'bg-rose-100 text-rose-800',
      label: 'Elevated Returns',
    };
  };

  const targetStatus = getTargetColor(kpis.targetAchievementPct);
  const returnStatus = getReturnRateColor(kpis.returnRatePct);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      
      {/* 1. Net Sales KPI */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Net Sales
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(kpis.netSales)}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Gross: {formatCurrency(kpis.grossSales, true)}</span>
          <span className="font-medium text-slate-700">{formatNumber(kpis.totalUnitsSold)} units</span>
        </div>
      </div>

      {/* 2. Target Achievement % KPI */}
      <div className={`bg-white rounded-2xl p-4 border ${targetStatus.border} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Target Achievement
            </span>
            <div className={`h-8 w-8 rounded-xl ${targetStatus.bg} ${targetStatus.text} flex items-center justify-center`}>
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black tracking-tight ${targetStatus.text}`}>
              {formatPercent(kpis.targetAchievementPct)}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${targetStatus.badge}`}>
              {targetStatus.label}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Target: {formatCurrency(kpis.salesTarget, true)}</span>
          <span className="font-semibold text-slate-700">
            Gap: {formatCurrency(Math.abs(kpis.netSales - kpis.salesTarget), true)}
          </span>
        </div>
      </div>

      {/* 3. Average Transaction Value KPI */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Transaction (ATV)
            </span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(kpis.avgTransactionValue)}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{formatNumber(kpis.totalTransactions)} Orders</span>
          <span className="font-semibold text-indigo-600">
            {formatPercent(kpis.conversionRatePct)} Conv.
          </span>
        </div>
      </div>

      {/* 4. Return Rate % KPI */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Return Rate %
            </span>
            <div className="h-8 w-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black tracking-tight ${returnStatus.text}`}>
              {formatPercent(kpis.returnRatePct)}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${returnStatus.badge}`}>
              {returnStatus.label}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Returns Vol:</span>
          <span className="font-semibold text-rose-600">{formatCurrency(kpis.totalReturns)}</span>
        </div>
      </div>

      {/* 5. Discount Rate % KPI */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Discount Rate %
            </span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BadgePercent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatPercent(kpis.discountRatePct)}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total Markdowns:</span>
          <span className="font-semibold text-purple-700">{formatCurrency(kpis.totalDiscount)}</span>
        </div>
      </div>

      {/* 6. Stockout Risk Alert KPI */}
      <div
        onClick={onViewStockoutRisk}
        className={`bg-white rounded-2xl p-4 border ${
          kpis.highStockoutStoresCount > 0 ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200/80'
        } shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stockout Risk
            </span>
            <div className={`h-8 w-8 rounded-xl ${
              kpis.highStockoutStoresCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            } flex items-center justify-center group-hover:scale-105 transition-transform`}>
              {kpis.highStockoutStoresCount > 0 ? (
                <PackageX className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black tracking-tight ${
              kpis.highStockoutStoresCount > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {kpis.highStockoutStoresCount} Stores
            </span>
            {kpis.highStockoutStoresCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Action Needed
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Stockouts: {formatNumber(kpis.totalStockouts)}</span>
          <span className="font-medium text-slate-700">Inv: {formatNumber(kpis.totalInventoryOnHand)}</span>
        </div>
      </div>

    </div>
  );
};
