import React from 'react';
import type { NotificationPriority, NotificationType } from '../types/notification.types';

interface NotificationBadgeProps {
  type?: NotificationType;
  priority?: NotificationPriority;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ type, priority }) => {
  if (priority) {
    const priorityStyles: Record<NotificationPriority, string> = {
      low: 'bg-slate-100 text-slate-600 border-slate-200',
      medium: 'bg-blue-50 text-blue-700 border-blue-200',
      high: 'bg-amber-50 text-amber-700 border-amber-200',
      urgent: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityStyles[priority]}`}
      >
        {priority}
      </span>
    );
  }

  if (type) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
        {type.replace('_', ' ')}
      </span>
    );
  }

  return null;
};
