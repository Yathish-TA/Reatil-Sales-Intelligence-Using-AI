import React, { useState } from 'react';
import {
  BarChart3,
  Building2,
  Calendar,
  Download,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/analytics';

interface HeaderProps {
  salesCount: number;
  storesCount: number;
  weeksCount: number;
  dateRange: { start: string; end: string };
  totalNetSales: number;
  onOpenUpload: () => void;
  onLoadSampleData: () => void;
  onExportFilteredExcel: () => void;
  onExportSummaryText: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  salesCount,
  storesCount,
  weeksCount,
  dateRange,
  totalNetSales,
  onOpenUpload,
  onLoadSampleData,
  onExportFilteredExcel,
  onExportSummaryText,
}) => {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Retail Sales Intelligence
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="h-3 w-3" />
                  Enterprise Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive Sales Analytics, Inventory Risk & Performance Insights
              </p>
            </div>
          </div>

          {/* Dataset Status Badges */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3.5 py-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
              <span>
                <strong className="text-white font-semibold">{storesCount}</strong> Stores
              </span>
            </div>
            <div className="h-3.5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>
                <strong className="text-white font-semibold">{weeksCount}</strong> Weeks ({dateRange.start || 'N/A'} - {dateRange.end || 'N/A'})
              </span>
            </div>
            <div className="h-3.5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                <strong className="text-white font-semibold">{formatNumber(salesCount)}</strong> Records
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            
            {/* Load Sample Data Button */}
            <button
              onClick={onLoadSampleData}
              title="Load realistic sample retail datasets"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              <span>Sample Data</span>
            </button>

            {/* Upload Excel Files Button */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Excel</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-slate-300" />
                <span>Export</span>
              </button>

              {exportOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setExportOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1.5 z-20 text-xs">
                    <button
                      onClick={() => {
                        onExportFilteredExcel();
                        setExportOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-700/70 text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                      <div>
                        <div className="font-medium">Export Filtered Excel</div>
                        <div className="text-[10px] text-slate-400">Download .xlsx dataset</div>
                      </div>
                    </button>
                    <div className="h-px bg-slate-700 my-1" />
                    <button
                      onClick={() => {
                        onExportSummaryText();
                        setExportOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-700/70 text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <div>
                        <div className="font-medium">Export Executive Insights</div>
                        <div className="text-[10px] text-slate-400">Download AI business summary</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
