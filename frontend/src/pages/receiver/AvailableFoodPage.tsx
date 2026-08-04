import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useAvailableFood,
  useCreateReservation,
} from '../../features/receiver/hooks/useReceiverQueries';
import { FoodFilters } from '../../features/receiver/components/FoodFilters';
import { FoodGrid } from '../../features/receiver/components/FoodGrid';
import { ConfirmReservationDialog } from '../../features/receiver/components/ConfirmReservationDialog';
import type { FoodItem, FoodFilters as FoodFilterType } from '../../features/donor/types/donor.types';

export const AvailableFoodPage: React.FC = () => {
  const [filters, setFilters] = useState<FoodFilterType>({
    page: 1,
    limit: 9,
    status: 'available',
  });

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const { data, isLoading } = useAvailableFood(filters);
  const createReservationMutation = useCreateReservation();

  const handleReset = () => {
    setFilters({ page: 1, limit: 9, status: 'available' });
  };

  const handleConfirmReservation = async (notes?: string, pickupTime?: string) => {
    if (selectedFood) {
      await createReservationMutation.mutateAsync({
        foodId: selectedFood._id,
        notes,
        pickupTime,
      });
      setSelectedFood(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Available Food Catalog</h1>
        <p className="text-xs text-slate-500 mt-1">
          Browse fresh surplus food donations available for immediate claim across your region.
        </p>
      </div>

      {/* Filter Bar */}
      <FoodFilters filters={filters} onChange={setFilters} onReset={handleReset} />

      {/* Food Grid / Loading */}
      {isLoading ? (
        <div className="h-64 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
          <p className="text-xs font-semibold text-slate-400">Loading food catalog...</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-900">No food listings match your filter criteria.</p>
          <p className="text-xs text-slate-500">Try adjusting your category or search query.</p>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <FoodGrid foods={data.data} onReserve={(item) => setSelectedFood(item)} />
      )}

      {/* Pagination */}
      {data && data.total > (filters.limit || 9) && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
          <span>
            Showing page {data.page} of {data.totalPages || 1} ({data.total} total items)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={filters.page === (data.totalPages || 1)}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Reservation Modal */}
      <ConfirmReservationDialog
        isOpen={Boolean(selectedFood)}
        food={selectedFood}
        isSubmitting={createReservationMutation.isPending}
        onConfirm={handleConfirmReservation}
        onCancel={() => setSelectedFood(null)}
      />
    </div>
  );
};
