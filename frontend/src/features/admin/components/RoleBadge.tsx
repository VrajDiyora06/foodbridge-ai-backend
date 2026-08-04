import React from 'react';
import type { UserRoleType } from '../types/admin.types';

interface RoleBadgeProps {
  role: UserRoleType;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const config: Record<UserRoleType, { label: string; style: string }> = {
    admin: { label: 'Admin', style: 'bg-purple-100 text-purple-800 border-purple-200' },
    donor: { label: 'Donor', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    ngo: { label: 'NGO', style: 'bg-teal-100 text-teal-800 border-teal-200' },
    volunteer: { label: 'Volunteer', style: 'bg-blue-100 text-blue-800 border-blue-200' },
    user: { label: 'Regular User', style: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const current = config[role] || { label: role, style: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${current.style}`}
    >
      {current.label}
    </span>
  );
};
