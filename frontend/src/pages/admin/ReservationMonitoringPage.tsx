import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminReservations } from '../../features/admin/hooks/useAdminQueries';
import { ReservationTable } from '../../features/admin/components/ReservationTable';
import type { AdminReservationFilters } from '../../features/admin/types/admin.types';

export const ReservationMonitoringPage: React.FC = () => {
  const [filters, setFilters] = useState<AdminReservationFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useAdminReservations(filters);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Reservation Claim Monitoring</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all food reservation claims, NGO pickups, and fulfillment statuses across the platform.
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
          <p className="text-xs font-semibold text-slate-400">Loading reservation claims feed...</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No reservation claims found.
        </div>
      ) : (
        <ReservationTable reservations={data.data} />
      )}

      {/* Pagination */}
      {data && data.total > (filters.limit || 10) && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
          <span>
            Showing page {data.page} of {data.totalPages || 1} ({data.total} total claims)
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
