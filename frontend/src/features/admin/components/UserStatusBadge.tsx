import React from 'react';
import type { UserStatusType } from '../types/admin.types';

interface UserStatusBadgeProps {
  status: UserStatusType;
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  const config: Record<UserStatusType, { label: string; style: string }> = {
    active: { label: 'Active', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    inactive: { label: 'Inactive', style: 'bg-slate-100 text-slate-600 border-slate-200' },
    suspended: { label: 'Suspended', style: 'bg-rose-100 text-rose-800 border-rose-200' },
  };

  const current = config[status] || { label: status, style: 'bg-slate-100 text-slate-600 border-slate-200' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${current.style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {current.label}
    </span>
  );
};
