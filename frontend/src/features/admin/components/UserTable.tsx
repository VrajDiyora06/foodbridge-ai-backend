import React from 'react';
import { Calendar, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import type { AdminUser, UserRoleType, UserStatusType } from '../types/admin.types';
import { RoleBadge } from './RoleBadge';
import { UserStatusBadge } from './UserStatusBadge';

interface UserTableProps {
  users: AdminUser[];
  onUpdateRole: (id: string, role: UserRoleType) => void;
  onUpdateStatus: (id: string, status: UserStatusType) => void;
  onDeleteUser: (id: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onUpdateRole,
  onUpdateStatus,
  onDeleteUser,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">User Details</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <div>
                    <span className="font-bold text-slate-900 block">{user.name}</span>
                    <span className="text-[11px] text-slate-500 block">{user.email}</span>
                    {user.organizationName && (
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                        Org: {user.organizationName}
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <RoleBadge role={user.role} />
                    <select
                      value={user.role}
                      onChange={(e) => onUpdateRole(user._id, e.target.value as UserRoleType)}
                      className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5 outline-none cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="donor">Donor</option>
                      <option value="ngo">NGO</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <UserStatusBadge status={user.status} />
                </td>

                <td className="py-3.5 px-4 text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {user.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(user._id, 'suspended')}
                        className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-[11px] font-semibold border border-amber-200 transition-colors flex items-center gap-1"
                        title="Suspend User"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Suspend
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(user._id, 'active')}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold border border-emerald-200 transition-colors flex items-center gap-1"
                        title="Activate User"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Activate
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteUser(user._id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Soft Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
