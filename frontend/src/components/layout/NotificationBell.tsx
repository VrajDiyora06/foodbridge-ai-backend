import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '../../features/notifications/hooks/useNotificationQueries';
import { NotificationDrawer } from '../../features/notifications/components/NotificationDrawer';

export const NotificationBell: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
        aria-label="View Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
