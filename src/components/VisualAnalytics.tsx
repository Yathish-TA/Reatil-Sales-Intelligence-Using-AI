import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  BarChart2,
  Building2,
  LineChart as LineChartIcon,
  PackageX,
  PieChart,
  Trophy,
} from 'lucide-react';
import {
  aggregateCategoryPerformance,
  aggregateSalesByRegion,
  aggregateStockoutRisk,
  aggregateStoreLeaderboard,
  aggregateWeeklySalesTrend,
  formatCurrency,
  formatNumber,
  formatPercent,
} from '../utils/analytics';
import { MergedSalesRecord } from '../types/retail';

interface VisualAnalyticsProps {
  records: MergedSalesRecord[];
}

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({ records }) => {
  const [leaderboardCount, setLeaderboardCount] = useState<number>(5);

  const weeklyTrendData = aggregateWeeklySalesTrend(records);
  const regionData = aggregateSalesByRegion(records);
  const categoryData = aggregateCategoryPerformance(records);
  const storeLeaderboardData = aggregateStoreLeaderboard(records).slice(0, leaderboardCount);
  const stockoutRiskData = aggregateStockoutRisk(records).slice(0, 8);

  // Custom Tooltip Formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            const isCurrency =
              entry.name.toLowerCase().includes('sales') ||
              entry.name.toLowerCase().includes('target') ||
              entry.name.toLowerCase().includes('discount') ||
              entry.name.toLowerCase().includes('returns');
            const valFormatted = isCurrency
              ? formatCurrency(entry.value)
              : formatNumber(entry.value);

            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-mono font-semibold">{valFormatted}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Chart Row 1: Weekly Sales Trend & Sales by Region */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Weekly Sales Trend (Line Chart) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LineChartIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">1. Weekly Sales Trend</h3>
                  <p className="text-xs text-slate-500">Net Sales vs Revenue Target over time</p>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => formatCurrency(v, true)}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="netSales"
                    name="Net Sales"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#2563eb' }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="salesTarget"
                    name="Sales Target"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Sales by Region (Bar Chart) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">2. Sales by Region</h3>
                  <p className="text-xs text-slate-500">Regional revenue contribution</p>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => formatCurrency(v, true)}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="netSales" name="Net Sales" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="salesTarget" name="Sales Target" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Chart Row 2: Category Performance & Stockout Risk Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Chart 3: Category Performance (Horizontal Bar Chart) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">3. Category Performance</h3>
                <p className="text-xs text-slate-500">Product Category revenue breakdown</p>
              </div>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoryData}
                margin={{ top: 10, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  width={110}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="netSales" name="Net Sales" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Stockout Risk Bar Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <PackageX className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">5. Stockout Risk Monitor</h3>
                <p className="text-xs text-slate-500">Stockout occurrences by store (Color = Risk Level)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-rose-600">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> High Risk
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Medium
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Normal
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockoutRiskData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="store_id" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="stockouts" name="Stockouts Count">
                  {stockoutRiskData.map((entry, index) => {
                    let fill = '#10b981'; // Green
                    if (entry.risk_level === 'High') fill = '#ef4444'; // Red
                    if (entry.risk_level === 'Medium') fill = '#f59e0b'; // Amber
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Chart 4: Store Leaderboard (Top Performing Stores) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">4. Store Leaderboard</h3>
              <p className="text-xs text-slate-500">Stores ranked by Net Sales and Target Achievement</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Show Top:</span>
            {[5, 10].map((cnt) => (
              <button
                key={cnt}
                onClick={() => setLeaderboardCount(cnt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  leaderboardCount === cnt
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Top {cnt}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank & Store</th>
                <th className="py-3 px-4">Region / City</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4 text-right">Net Sales</th>
                <th className="py-3 px-4 text-right">Target</th>
                <th className="py-3 px-4 text-center">Achievement %</th>
                <th className="py-3 px-4 text-right">Avg Tx Value</th>
                <th className="py-3 px-4 text-center">Stockouts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {storeLeaderboardData.map((st, idx) => {
                const isTop1 = idx === 0;
                const isTop3 = idx < 3;
                return (
                  <tr key={st.store_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                      <span className={`h-6 w-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                        isTop1
                          ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                          : isTop3
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold block text-slate-900">{st.store_name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{st.store_id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span>{st.region}</span>
                      <span className="text-[10px] text-slate-400 block">{st.city}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {st.store_format}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {formatCurrency(st.netSales)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-medium">
                      {formatCurrency(st.salesTarget)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        st.achievementPct >= 100
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.achievementPct >= 85
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {formatPercent(st.achievementPct)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {formatCurrency(st.atv)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold ${
                        st.stockouts > 20 ? 'text-rose-600' : 'text-slate-600'
                      }`}>
                        {st.stockouts}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
