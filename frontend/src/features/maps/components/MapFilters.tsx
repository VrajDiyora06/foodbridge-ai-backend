import React from 'react';
import { Filter, RefreshCw, Compass } from 'lucide-react';
import type { FoodCategory } from '../../donor/types/donor.types';
import type { MapFilterState } from '../types/map.types';

interface MapFiltersProps {
  filters: MapFilterState;
  onChange: (filters: MapFilterState) => void;
  onReset: () => void;
}

export const MapFilters: React.FC<MapFiltersProps> = ({ filters, onChange, onReset }) => {
  return (
    <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Radius Selector */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>Radius:</span>
          <select
            value={filters.radiusKm}
            onChange={(e) => onChange({ ...filters, radiusKm: Number(e.target.value) })}
            className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-emerald-700 outline-none"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filters.category || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                category: (e.target.value as FoodCategory) || undefined,
              })
            }
            className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="">All Categories</option>
            <option value="cooked_meals">Cooked Meals</option>
            <option value="fresh_produce">Fresh Produce</option>
            <option value="bakery">Bakery</option>
            <option value="packaged_food">Packaged Food</option>
            <option value="beverages">Beverages</option>
          </select>
        </div>

        {/* Veg Filter */}
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isVegetarian || false}
            onChange={(e) => onChange({ ...filters, isVegetarian: e.target.checked })}
            className="w-3.5 h-3.5 accent-emerald-600 rounded"
          />
          🌱 Veg Only
        </label>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-xs font-medium flex items-center gap-1"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reset
      </button>
    </div>
  );
};
