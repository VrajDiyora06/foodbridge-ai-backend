import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useChangePassword } from '../../features/profile/hooks/useProfileQueries';
import { PasswordForm } from '../../features/profile/components/PasswordForm';
import type { ChangePasswordInput } from '../../features/profile/types/profile.types';

export const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const changePasswordMutation = useChangePassword();

  const handlePasswordChange = async (data: ChangePasswordInput) => {
    await changePasswordMutation.mutateAsync(data);
    alert('Password updated successfully!');
    navigate('/profile');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Security & Password</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage authentication credentials and account security settings.
        </p>
      </div>

      <PasswordForm
        isSubmitting={changePasswordMutation.isPending}
        onSubmit={handlePasswordChange}
      />
    </div>
  );
};
