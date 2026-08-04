import React, { useState } from 'react';
import { List, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useReservations,
  useCancelReservation,
} from '../../features/receiver/hooks/useReceiverQueries';
import { ReservationCard } from '../../features/receiver/components/ReservationCard';
import { ReservationTable } from '../../features/receiver/components/ReservationTable';
import type { ReservationFilters, ReservationStatus } from '../../features/receiver/types/receiver.types';

export const MyReservationsPage: React.FC = () => {
  const [filters, setFilters] = useState<ReservationFilters>({
    page: 1,
    limit: 10,
  });

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const { data, isLoading } = useReservations(filters);
  const cancelMutation = useCancelReservation();

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation claim?')) {
      await cancelMutation.mutateAsync({ id });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Reservations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your active claim requests, donor approvals, and pickup schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: (e.target.value as ReservationStatus) || undefined,
                page: 1,
              })
            }
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Approved</option>
            <option value="picked_up">Picked Up</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Render */}
      {isLoading ? (
        <div className="h-64 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
          <p className="text-xs font-semibold text-slate-400">Loading your reservations...</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No food claim reservations found.
        </div>
      ) : viewMode === 'table' ? (
        <ReservationTable reservations={data.data} onCancel={handleCancel} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((res) => (
            <ReservationCard key={res._id} reservation={res} onCancel={handleCancel} />
          ))}
        </div>
      )}

      {/* Pagination */}
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
    </div>
  );
};
