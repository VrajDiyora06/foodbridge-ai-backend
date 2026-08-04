import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, Calendar, Megaphone, ShoppingBag, Utensils } from 'lucide-react';
import type { NotificationItem as NotificationItemType } from '../types/notification.types';
import { NotificationBadge } from './NotificationBadge';

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCloseDrawer?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onDelete,
  onCloseDrawer,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'system_broadcast':
        return <Megaphone className="w-4 h-4 text-amber-500" />;
      case 'food_created':
      case 'food_updated':
        return <Utensils className="w-4 h-4 text-emerald-500" />;
      case 'reservation_created':
      case 'reservation_accepted':
      case 'reservation_completed':
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const formattedTime = new Date(notification.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        notification.isRead
          ? 'bg-white border-slate-200 opacity-80'
          : 'bg-emerald-50/40 border-emerald-200 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Link
              to={`/notifications/${notification._id}`}
              onClick={onCloseDrawer}
              className="font-bold text-xs text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1"
            >
              {notification.title}
            </Link>

            <NotificationBadge priority={notification.priority} />
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{notification.message}</p>

          <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100/60 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formattedTime}
            </span>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              {!notification.isRead && onMarkRead && (
                <button
                  type="button"
                  onClick={() => onMarkRead(notification._id)}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-0.5 font-semibold text-[10px]"
                  title="Mark as read"
                >
                  <Check className="w-3 h-3" />
                  Read
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(notification._id)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
