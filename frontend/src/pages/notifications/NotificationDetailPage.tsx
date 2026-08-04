import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Trash2, CheckCircle2 } from 'lucide-react';
import {
  useNotification,
  useMarkNotificationRead,
  useDeleteNotification,
} from '../../features/notifications/hooks/useNotificationQueries';
import { NotificationBadge } from '../../features/notifications/components/NotificationBadge';

export const NotificationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: notification, isLoading } = useNotification(id || '');
  const markReadMutation = useMarkNotificationRead();
  const deleteMutation = useDeleteNotification();

  // Auto-mark as read on open
  useEffect(() => {
    if (notification && !notification.isRead && id) {
      markReadMutation.mutate(id);
    }
  }, [notification, id, markReadMutation]);

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this notification?')) {
      await deleteMutation.mutateAsync(id);
      navigate('/notifications');
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
        <p className="text-xs font-semibold text-slate-400">Loading notification details...</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
        <p className="text-sm font-bold text-slate-900">Notification not found.</p>
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
        >
          Back to Center
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notifications
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl text-xs transition-colors border border-rose-200"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <NotificationBadge priority={notification.priority} />
              <NotificationBadge type={notification.type} />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">{notification.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Notification Content
          </h3>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-700 leading-relaxed">
            {notification.message}
          </div>
        </div>

        {notification.relatedEntityId && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Linked Entity: {notification.relatedEntityType || 'System Object'}
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-800">
              #{notification.relatedEntityId.slice(-8)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
