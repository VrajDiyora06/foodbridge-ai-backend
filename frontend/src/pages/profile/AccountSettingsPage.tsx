import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sliders } from 'lucide-react';
import { DangerZone } from '../../features/profile/components/DangerZone';

export const AccountSettingsPage: React.FC = () => {
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-extrabold text-slate-900">Account Preferences & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage system preferences, notification subscriptions, and danger zone actions.
        </p>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          Notification & Alert Preferences
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Email Push Notifications</span>
              <span className="text-[11px] text-slate-500 block">Receive emails when new claims or status updates occur</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded" />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Real-time Socket Chimes</span>
              <span className="text-[11px] text-slate-500 block">Play sound pop-up alert on live Socket.IO events</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded" />
          </label>
        </div>
      </div>

      <DangerZone />
    </div>
  );
};
