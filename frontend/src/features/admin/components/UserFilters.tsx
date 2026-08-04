import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import type { AdminUserFilters, UserRoleType, UserStatusType } from '../types/admin.types';

interface UserFiltersProps {
  filters: AdminUserFilters;
  onChange: (filters: AdminUserFilters) => void;
  onReset: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({ filters, onChange, onReset }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search user name, email, or organization..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={filters.role || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                role: (e.target.value as UserRoleType) || undefined,
                page: 1,
              })
            }
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:border-emerald-500 transition-all"
          >
            <option value="">All Roles</option>
            <option value="donor">Donor</option>
            <option value="ngo">NGO</option>
            <option value="volunteer">Volunteer</option>
            <option value="user">Regular User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) =>
            onChange({
              ...filters,
              status: (e.target.value as UserStatusType) || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:border-emerald-500 transition-all"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="sm:hidden lg:inline">Reset</span>
        </button>
      </div>
    </div>
  );
};
