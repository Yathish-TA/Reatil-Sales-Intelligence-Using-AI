import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Search,
  Table as TableIcon,
} from 'lucide-react';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '../utils/analytics';
import { MergedSalesRecord } from '../types/retail';

interface DataTableViewProps {
  records: MergedSalesRecord[];
  onExportExcel: () => void;
}

type SortField =
  | 'week_start_date'
  | 'region'
  | 'store_name'
  | 'city'
  | 'store_format'
  | 'product_category'
  | 'net_sales'
  | 'sales_target'
  | 'discount_amount'
  | 'returns_amount'
  | 'stockouts'
  | 'footfall';

export const DataTableView: React.FC<DataTableViewProps> = ({
  records,
  onExportExcel,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<SortField>('net_sales');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [tableSearch, setTableSearch] = useState('');

  // Local table search
  const filtered = records.filter((r) => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    return (
      r.store_name.toLowerCase().includes(q) ||
      r.store_id.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.region.toLowerCase().includes(q) ||
      r.product_category.toLowerCase().includes(q)
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      const cmp = (aVal as string).localeCompare(bVal as string);
      return sortOrder === 'asc' ? cmp : -cmp;
    }

    const numA = (aVal as number) || 0;
    const numB = (bVal as number) || 0;
    return sortOrder === 'asc' ? numA - numB : numB - numA;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIdx = (validPage - 1) * pageSize;
  const paginatedRows = sorted.slice(startIdx, startIdx + pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <TableIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Filtered Weekly Sales Records</h3>
            <p className="text-xs text-slate-500">
              Showing {sorted.length} detailed row entries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search in table..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 select-none">
            <tr>
              <th
                onClick={() => handleSort('week_start_date')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Week Date
                  {sortField === 'week_start_date' && (
                    sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('store_name')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Store Name
                  {sortField === 'store_name' && (
                    sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('region')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Region / City
              </th>

              <th
                onClick={() => handleSort('product_category')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Category
              </th>

              <th
                onClick={() => handleSort('footfall')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Footfall
              </th>

              <th
                onClick={() => handleSort('net_sales')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  Net Sales
                  {sortField === 'net_sales' && (
                    sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSort('sales_target')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Target
              </th>

              <th
                onClick={() => handleSort('discount_amount')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Discount
              </th>

              <th
                onClick={() => handleSort('returns_amount')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Returns
              </th>

              <th
                onClick={() => handleSort('stockouts')}
                className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Stockouts
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No records match current filter or search criteria.
                </td>
              </tr>
            ) : (
              paginatedRows.map((r, i) => {
                const targetAchieved = r.sales_target > 0 && r.net_sales >= r.sales_target;
                return (
                  <tr key={r.id || i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      {r.week_start_date}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900 block">{r.store_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{r.store_id}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{r.region}</span>
                      <span className="text-[10px] text-slate-400 block">{r.city}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]">
                        {r.product_category}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {formatNumber(r.footfall)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                      {formatCurrency(r.net_sales)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-500 whitespace-nowrap">
                      <span className={targetAchieved ? 'text-emerald-700 font-bold' : ''}>
                        {formatCurrency(r.sales_target)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right text-purple-700 font-medium whitespace-nowrap">
                      {formatCurrency(r.discount_amount)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-rose-600 font-medium whitespace-nowrap">
                      {formatCurrency(r.returns_amount)}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-mono font-bold ${
                        r.stockouts > 15 ? 'text-rose-600' : 'text-slate-600'
                      }`}>
                        {r.stockouts}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          {[20, 50, 100].map((size) => (
            <button
              key={size}
              onClick={() => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                pageSize === size ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span>
            Page <strong>{validPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={validPage <= 1}
              onClick={() => setCurrentPage(validPage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={validPage >= totalPages}
              onClick={() => setCurrentPage(validPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
