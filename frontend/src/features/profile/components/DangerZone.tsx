import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const DangerZone: React.FC = () => {
  const { logout } = useAuth();

  const handleDeactivate = () => {
    if (window.confirm('Are you sure you want to deactivate your account? You will be logged out immediately.')) {
      logout();
    }
  };

  return (
    <div className="bg-rose-50/60 rounded-3xl border border-rose-200 p-6 sm:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-rose-900">Danger Zone</h3>
          <p className="text-xs text-rose-700/80">Irreversible account management actions</p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900">Deactivate Account Session</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Revoke active sessions and request account deactivation.</p>
        </div>

        <button
          type="button"
          onClick={handleDeactivate}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all shrink-0 flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Deactivate Account
        </button>
      </div>
    </div>
  );
};
