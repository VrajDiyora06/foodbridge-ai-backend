import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCheck, Bell, ExternalLink } from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
} from '../hooks/useNotificationQueries';
import { NotificationItem } from './NotificationItem';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  const { data: notificationsData, isLoading } = useNotifications({ limit: 15 });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllRead();
  const deleteMutation = useDeleteNotification();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        ref={drawerRef}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Notifications Center</h2>
              <p className="text-[11px] text-slate-500">
                {notificationsData?.unreadCount || 0} unread updates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>

          <Link
            to="/notifications"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
          >
            Full View
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !notificationsData?.data || notificationsData.data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
              <Bell className="w-10 h-10 stroke-1 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
              <p className="text-[11px] text-slate-400">Live alerts will automatically appear here.</p>
            </div>
          ) : (
            notificationsData.data.map((item) => (
              <NotificationItem
                key={item._id}
                notification={item}
                onMarkRead={(id) => markReadMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
                onCloseDrawer={onClose}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <Link
            to="/notifications"
            onClick={onClose}
            className="block w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            View All Notifications Page
          </Link>
        </div>
      </div>
    </div>
  );
};
