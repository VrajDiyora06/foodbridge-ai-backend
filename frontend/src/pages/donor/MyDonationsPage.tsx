import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDonations, useDeleteDonation } from '../../features/donor/hooks/useDonorQueries';
import { DonationFilters } from '../../features/donor/components/DonationFilters';
import { DonationCard } from '../../features/donor/components/DonationCard';
import { DonationTable } from '../../features/donor/components/DonationTable';
import { DeleteDialog } from '../../features/donor/components/DeleteDialog';
import type { FoodFilters } from '../../features/donor/types/donor.types';

export const MyDonationsPage: React.FC = () => {
  const [filters, setFilters] = useState<FoodFilters>({
    page: 1,
    limit: 10,
  });

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useDonations(filters);
  const deleteMutation = useDeleteDonation();

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Food Donations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your food donation listings, monitor reservations, and update status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/donor/donate"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Donation
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <DonationFilters filters={filters} onChange={setFilters} onReset={handleResetFilters} />

      {/* Data Rendering */}
      {isLoading ? (
        <div className="h-64 bg-white rounded-2xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
          <p className="text-xs font-semibold text-slate-400">Loading food donations...</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-900">No donations match your filter criteria.</p>
          <p className="text-xs text-slate-500">Try adjusting your search terms or clearing filters.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <DonationTable donations={data.data} onDelete={(id) => setDeleteId(id)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((food) => (
            <DonationCard key={food._id} food={food} onDelete={(id) => setDeleteId(id)} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {data && data.total > (filters.limit || 10) && (
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

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={Boolean(deleteId)}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
