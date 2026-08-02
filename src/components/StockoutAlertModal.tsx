import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Package,
  PackageX,
  X,
} from 'lucide-react';
import { aggregateStockoutRisk, formatCurrency, formatNumber } from '../utils/analytics';
import { MergedSalesRecord } from '../types/retail';

interface StockoutAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MergedSalesRecord[];
}

export const StockoutAlertModal: React.FC<StockoutAlertModalProps> = ({
  isOpen,
  onClose,
  records,
}) => {
  if (!isOpen) return null;

  const stockoutStores = aggregateStockoutRisk(records);
  const highRisk = stockoutStores.filter((s) => s.risk_level === 'High');
  const mediumRisk = stockoutStores.filter((s) => s.risk_level === 'Medium');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-rose-600/30 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <PackageX className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Stockout & Inventory Risk Monitor</h2>
              <p className="text-xs text-slate-400">Stores requiring immediate inventory replenishment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Risk Summary Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                High Risk Stores
              </div>
              <div className="text-2xl font-black text-rose-700 mt-0.5">
                {highRisk.length}
              </div>
              <p className="text-[11px] text-rose-600 mt-0.5">Stockouts &gt; 20 or critically low stock</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Medium Risk Stores
              </div>
              <div className="text-2xl font-black text-amber-700 mt-0.5">
                {mediumRisk.length}
              </div>
              <p className="text-[11px] text-amber-600 mt-0.5">Moderate stockout occurrences</p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Normal Stores
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                {stockoutStores.length - highRisk.length - mediumRisk.length}
              </div>
              <p className="text-[11px] text-emerald-600 mt-0.5">Sufficient inventory buffer</p>
            </div>
          </div>

          {/* List of Affected Stores */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Affected Store Inventory Details
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {stockoutStores.slice(0, 10).map((st) => {
                const isHigh = st.risk_level === 'High';
                const isMed = st.risk_level === 'Medium';

                return (
                  <div
                    key={st.store_id}
                    className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isHigh ? 'bg-rose-50/40' : isMed ? 'bg-amber-50/20' : 'bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{st.store_name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({st.store_id})</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800'
                              : isMed
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {st.risk_level} Risk
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {st.region} Region • {st.city} • Net Sales: {formatCurrency(st.net_sales)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          Stockouts
                        </span>
                        <span
                          className={`font-mono font-black ${
                            isHigh ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {st.stockouts}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          On Hand
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          {formatNumber(st.inventory_on_hand)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Close Risk Monitor
          </button>
        </div>

      </div>
    </div>
  );
};
