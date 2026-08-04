import React from 'react';
import { ShieldCheck, Mail, Building2, Calendar } from 'lucide-react';
import type { UserProfile } from '../types/profile.types';
import { ProfileAvatar } from './ProfileAvatar';
import { RoleBadge } from '../../admin/components/RoleBadge';

interface ProfileHeaderProps {
  user: UserProfile;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Cover Banner Gradient */}
      <div className="h-32 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700" />

      <div className="px-6 sm:px-8 pb-6 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <ProfileAvatar name={user.name} avatarUrl={user.avatar} size="xl" />

          <div className="space-y-1 sm:mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
              <RoleBadge role={user.role as any} />
              {user.isVerified && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user.email}
              {user.organizationName && (
                <>
                  <span>•</span>
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-emerald-700">{user.organizationName}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 self-end">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
