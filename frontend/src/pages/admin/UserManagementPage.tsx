import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useAdminUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteUser,
} from '../../features/admin/hooks/useAdminQueries';
import { UserFilters } from '../../features/admin/components/UserFilters';
import { UserTable } from '../../features/admin/components/UserTable';
import type { AdminUserFilters, UserRoleType, UserStatusType } from '../../features/admin/types/admin.types';

export const UserManagementPage: React.FC = () => {
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useAdminUsers(filters);
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();

  const handleReset = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const handleUpdateRole = async (id: string, role: UserRoleType) => {
    await updateRoleMutation.mutateAsync({ id, role });
  };

  const handleUpdateStatus = async (id: string, status: UserStatusType) => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to soft delete this user account?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">User Management Portal</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage platform accounts, role privileges, suspension statuses, and soft deletes.
        </p>
      </div>

      <UserFilters filters={filters} onChange={setFilters} onReset={handleReset} />

      {isLoading ? (
        <div className="h-64 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
          <p className="text-xs font-semibold text-slate-400">Loading user accounts...</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No user accounts found matching your filter criteria.
        </div>
      ) : (
        <UserTable
          users={data.data}
          onUpdateRole={handleUpdateRole}
          onUpdateStatus={handleUpdateStatus}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* Pagination */}
      {data && data.total > (filters.limit || 10) && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
          <span>
            Showing page {data.page} of {data.totalPages || 1} ({data.total} total accounts)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={filters.page === (data.totalPages || 1)}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
