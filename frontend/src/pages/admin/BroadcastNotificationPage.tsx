import React from 'react';
import { useBroadcastNotification } from '../../features/admin/hooks/useAdminQueries';
import { BroadcastForm } from '../../features/admin/components/BroadcastForm';
import type { BroadcastNotificationInput } from '../../features/admin/types/admin.types';

export const BroadcastNotificationPage: React.FC = () => {
  const broadcastMutation = useBroadcastNotification();

  const handleBroadcast = async (data: BroadcastNotificationInput) => {
    if (window.confirm('Are you sure you want to send this broadcast announcement to connected users?')) {
      await broadcastMutation.mutateAsync(data);
      alert('Broadcast notification sent successfully!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Broadcast Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Compose platform-wide or role-targeted announcements delivered instantly via Socket.IO.
        </p>
      </div>

      <BroadcastForm
        isSubmitting={broadcastMutation.isPending}
        onSubmit={handleBroadcast}
      />
    </div>
  );
};
