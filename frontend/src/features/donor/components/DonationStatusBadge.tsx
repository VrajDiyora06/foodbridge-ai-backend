import React from 'react';
import type { FoodStatus } from '../types/donor.types';

interface DonationStatusBadgeProps {
  status: FoodStatus;
  size?: 'sm' | 'md';
}

export const DonationStatusBadge: React.FC<DonationStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  const config: Record<FoodStatus, { label: string; styles: string }> = {
    available: {
      label: 'Available',
      styles: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    reserved: {
      label: 'Reserved',
      styles: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    picked_up: {
      label: 'Picked Up',
      styles: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    completed: {
      label: 'Delivered',
      styles: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    expired: {
      label: 'Expired',
      styles: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    cancelled: {
      label: 'Cancelled',
      styles: 'bg-rose-100 text-rose-800 border-rose-200',
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
