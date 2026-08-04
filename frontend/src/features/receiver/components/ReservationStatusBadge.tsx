import React from 'react';
import type { ReservationStatus } from '../types/receiver.types';

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  size?: 'sm' | 'md';
}

export const ReservationStatusBadge: React.FC<ReservationStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  const config: Record<ReservationStatus, { label: string; styles: string }> = {
    pending: {
      label: 'Pending Approval',
      styles: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    accepted: {
      label: 'Claim Approved',
      styles: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    rejected: {
      label: 'Claim Rejected',
      styles: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    cancelled: {
      label: 'Cancelled',
      styles: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    picked_up: {
      label: 'Picked Up',
      styles: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    completed: {
      label: 'Completed',
      styles: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    expired: {
      label: 'Expired',
      styles: 'bg-slate-100 text-slate-500 border-slate-200',
    },
  };

  const current = config[status] || {
    label: status,
    styles: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border uppercase tracking-wider ${sizeClasses} ${current.styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {current.label}
    </span>
  );
};
