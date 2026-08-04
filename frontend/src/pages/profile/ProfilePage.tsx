import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Shield, Settings } from 'lucide-react';
import { useProfile } from '../../features/profile/hooks/useProfileQueries';
import { ProfileHeader } from '../../features/profile/components/ProfileHeader';
import { UserInformation } from '../../features/profile/components/UserInformation';

export const ProfilePage: React.FC = () => {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="h-96 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
        <p className="text-xs font-semibold text-slate-400">Loading user profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">User Profile</h1>

        <div className="flex items-center gap-2">
          <Link
            to="/profile/edit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Link>

          <Link
            to="/profile/security"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors"
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            Security
          </Link>

          <Link
            to="/profile/settings"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            Settings
          </Link>
        </div>
      </div>

      <ProfileHeader user={profile} />
      <UserInformation user={profile} />
    </div>
  );
};
