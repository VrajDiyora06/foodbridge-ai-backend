import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import type { FoodCategory, FoodFilters as DonorFoodFilters } from '../../donor/types/donor.types';

interface ReceiverFoodFiltersProps {
  filters: DonorFoodFilters;
  onChange: (filters: DonorFoodFilters) => void;
  onReset: () => void;
}

export const FoodFilters: React.FC<ReceiverFoodFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search food title, city, or keywords..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={filters.category || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                category: (e.target.value as FoodCategory) || undefined,
                page: 1,
              })
            }
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:border-emerald-500 transition-all"
          >
            <option value="">All Categories</option>
            <option value="cooked_meals">Cooked Meals</option>
            <option value="fresh_produce">Fresh Produce</option>
            <option value="bakery">Bakery</option>
            <option value="packaged_food">Packaged Food</option>
            <option value="beverages">Beverages</option>
            <option value="dairy">Dairy</option>
            <option value="canned_goods">Canned Goods</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 flex items-center justify-center gap-1.5 text-xs font-medium"
          title="Reset Filters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="sm:hidden lg:inline">Reset</span>
        </button>
      </div>
    </div>
  );
};
