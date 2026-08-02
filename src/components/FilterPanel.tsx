import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Filter,
  Layers,
  MapPin,
  RotateCcw,
  Search,
  Store,
  Tag,
  X,
} from 'lucide-react';
import { RetailFilterState } from '../types/retail';

interface FilterPanelProps {
  filters: RetailFilterState;
  onFilterChange: (newFilters: RetailFilterState) => void;
  availableWeeks: string[];
  availableRegions: string[];
  availableStores: Array<{ id: string; name: string }>;
  availableCities: string[];
  availableFormats: string[];
  availableCategories: string[];
  totalRecordsCount: number;
  filteredRecordsCount: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  availableWeeks,
  availableRegions,
  availableStores,
  availableCities,
  availableFormats,
  availableCategories,
  totalRecordsCount,
  filteredRecordsCount,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Count active filters
  const activeFiltersCount =
    filters.weeks.length +
    filters.regions.length +
    filters.stores.length +
    filters.cities.length +
    filters.storeFormats.length +
    filters.categories.length +
    (filters.searchQuery ? 1 : 0);

  const handleToggleArrayItem = (
    key: keyof Omit<RetailFilterState, 'searchQuery'>,
    item: string
  ) => {
    const currentList = filters[key] as string[];
    const exists = currentList.includes(item);
    const updated = exists
      ? currentList.filter((i) => i !== item)
      : [...currentList, item];

    onFilterChange({
      ...filters,
      [key]: updated,
    });
  };

  const handleResetFilters = () => {
    onFilterChange({
      weeks: [],
      regions: [],
      stores: [],
      cities: [],
      storeFormats: [],
      categories: [],
      searchQuery: '',
    });
    setActiveDropdown(null);
  };

  const handleSelectLatestFourWeeks = () => {
    const sortedWeeks = [...availableWeeks].sort((a, b) => b.localeCompare(a));
    const latest4 = sortedWeeks.slice(0, 4);
    onFilterChange({
      ...filters,
      weeks: latest4,
    });
    setActiveDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Data Filter Panel
              </h2>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                  {activeFiltersCount} Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Showing <strong className="text-slate-900">{filteredRecordsCount}</strong> of{' '}
              {totalRecordsCount} records
            </p>
          </div>
        </div>

        {/* Quick Actions & Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSelectLatestFourWeeks}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Latest 4 Weeks
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        
        {/* 1. Week Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('weeks')}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              filters.weeks.length > 0
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="truncate">
                {filters.weeks.length === 0
                  ? 'All Weeks'
                  : `${filters.weeks.length} Week${filters.weeks.length > 1 ? 's' : ''}`}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
          </button>

          {activeDropdown === 'weeks' && (
            <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-40 max-h-60 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-100 flex justify-between">
                <span>Select Week Start</span>
                {filters.weeks.length > 0 && (
                  <button
                    onClick={() => onFilterChange({ ...filters, weeks: [] })}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {availableWeeks.map((week) => {
                const isSelected = filters.weeks.includes(week);
                return (
                  <label
                    key={week}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleArrayItem('weeks', week)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={isSelected ? 'font-semibold text-slate-900' : ''}>
                      Week of {week}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Region Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('regions')}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              filters.regions.length > 0
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">
                {filters.regions.length === 0
                  ? 'All Regions'
                  : `${filters.regions.length} Region${filters.regions.length > 1 ? 's' : ''}`}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
          </button>

          {activeDropdown === 'regions' && (
            <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-40 max-h-60 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-100 flex justify-between">
                <span>Select Region</span>
                {filters.regions.length > 0 && (
                  <button
                    onClick={() => onFilterChange({ ...filters, regions: [] })}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {availableRegions.map((region) => {
                const isSelected = filters.regions.includes(region);
                return (
                  <label
                    key={region}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleArrayItem('regions', region)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={isSelected ? 'font-semibold text-slate-900' : ''}>
                      {region}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Store Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('stores')}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              filters.stores.length > 0
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Store className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
              <span className="truncate">
                {filters.stores.length === 0
                  ? 'All Stores'
                  : `${filters.stores.length} Store${filters.stores.length > 1 ? 's' : ''}`}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
          </button>

          {activeDropdown === 'stores' && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-40 max-h-64 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-100 flex justify-between">
                <span>Select Store</span>
                {filters.stores.length > 0 && (
                  <button
                    onClick={() => onFilterChange({ ...filters, stores: [] })}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {availableStores.map((st) => {
                const isSelected = filters.stores.includes(st.id);
                return (
                  <label
                    key={st.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleArrayItem('stores', st.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="truncate">
                      <span className={isSelected ? 'font-semibold text-slate-900' : ''}>
                        {st.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {st.id}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. City Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('cities')}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              filters.cities.length > 0
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">
                {filters.cities.length === 0
                  ? 'All Cities'
                  : `${filters.cities.length} Cit${filters.cities.length > 1 ? 'ies' : 'y'}`}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
          </button>

          {activeDropdown === 'cities' && (
            <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-40 max-h-60 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-100 flex justify-between">
                <span>Select City</span>
                {filters.cities.length > 0 && (
                  <button
                    onClick={() => onFilterChange({ ...filters, cities: [] })}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {availableCities.map((city) => {
                const isSelected = filters.cities.includes(city);
                return (
                  <label
                    key={city}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleArrayItem('cities', city)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={isSelected ? 'font-semibold text-slate-900' : ''}>
                      {city}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Store Format Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('storeFormats')}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              filters.storeFormats.length > 0
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Layers className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              <span className="truncate">
                {filters.storeFormats.length === 0
                  ? 'All Formats'
                  : `${filters.storeFormats.length} Format${filters.storeFormats.length > 1 ? 's' : ''}`}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
          </button>

          {activeDropdown === 'storeFormats' && (
            <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-40 max-h-60 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-100 flex justify-between">
                <span>Select Format</span>
                {filters.storeFormats.length > 0 && (
                  <button
                    onClick={() => onFilterChange({ ...filters, storeFormats: [] })}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {availableFormats.map((fmt) => {
                const isSelected = filters.storeFormats.includes(fmt);
                return (
                  <label
                    key={fmt}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleArrayItem('storeFormats', fmt)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={isSelected ? 'font-semibold text-slate-900' : ''}>
                      {fmt}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Product Category Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('categories')}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              filters.categories.length > 0
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Tag className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="truncate">
                {filters.categories.length === 0
                  ? 'All Categories'
                  : `${filters.categories.length} Categor${filters.categories.length > 1 ? 'ies' : 'y'}`}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
          </button>

          {activeDropdown === 'categories' && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-40 max-h-60 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-100 flex justify-between">
                <span>Select Category</span>
                {filters.categories.length > 0 && (
                  <button
                    onClick={() => onFilterChange({ ...filters, categories: [] })}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {availableCategories.map((cat) => {
                const isSelected = filters.categories.includes(cat);
                return (
                  <label
                    key={cat}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleArrayItem('categories', cat)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={isSelected ? 'font-semibold text-slate-900' : ''}>
                      {cat}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Search by store name, store ID, city, or product category..."
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

    </div>
  );
};
