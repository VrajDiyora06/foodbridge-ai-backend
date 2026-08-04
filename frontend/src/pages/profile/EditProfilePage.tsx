import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  useProfile,
  useUpdateProfile,
} from '../../features/profile/hooks/useProfileQueries';
import { ProfileForm } from '../../features/profile/components/ProfileForm';
import type { UpdateProfileInput } from '../../features/profile/types/profile.types';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const handleSave = async (data: UpdateProfileInput) => {
    await updateMutation.mutateAsync(data);
    navigate('/profile');
  };

  if (isLoading) {
    return (
      <div className="h-96 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
        <p className="text-xs font-semibold text-slate-400">Loading editor...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Edit Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update your public profile information and contact details.
        </p>
      </div>

      <ProfileForm
        user={profile}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleSave}
      />
    </div>
  );
};
