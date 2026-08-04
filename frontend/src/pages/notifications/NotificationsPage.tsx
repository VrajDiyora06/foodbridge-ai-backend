import React, { useState } from 'react';
import { CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
} from '../../features/notifications/hooks/useNotificationQueries';
import { NotificationItem } from '../../features/notifications/components/NotificationItem';
import type { NotificationFilters, NotificationType } from '../../features/notifications/types/notification.types';

export const NotificationsPage: React.FC = () => {
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useNotifications(filters);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllRead();
  const deleteMutation = useDeleteNotification();

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notifications Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business events, system notices, and reservation updates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => markAllReadMutation.mutate()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs border border-emerald-200 transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          Mark All Read
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.unreadOnly || false}
              onChange={(e) => setFilters({ ...filters, unreadOnly: e.target.checked, page: 1 })}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            Unread Only
          </label>

          <select
            value={filters.type || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                type: (e.target.value as NotificationType) || undefined,
                page: 1,
              })
            }
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Event Types</option>
            <option value="food_created">Food Listed</option>
            <option value="reservation_created">Claim Created</option>
            <option value="reservation_accepted">Claim Approved</option>
            <option value="reservation_completed">Delivered</option>
            <option value="system_broadcast">System Broadcast</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {data?.unreadCount || 0} unread items remaining
        </span>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No notifications match your current filter settings.
        </div>
      ) : (
        <div className="space-y-3">
          {data.data.map((item) => (
            <NotificationItem
              key={item._id}
              notification={item}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > (filters.limit || 10) && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
          <span>
            Showing page {data.page} of {data.totalPages || 1} ({data.total} total notifications)
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
