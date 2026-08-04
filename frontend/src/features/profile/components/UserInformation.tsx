import React from 'react';
import { User, Mail, Phone, MapPin, Building2, Shield } from 'lucide-react';
import type { UserProfile } from '../types/profile.types';

interface UserInformationProps {
  user: UserProfile;
}

export const UserInformation: React.FC<UserInformationProps> = ({ user }) => {
  const fields = [
    { label: 'Full Name', value: user.name, icon: User },
    { label: 'Email Address', value: user.email, icon: Mail },
    { label: 'Phone Number', value: user.phone || 'Not provided', icon: Phone },
    { label: 'Organization Name', value: user.organizationName || 'N/A', icon: Building2 },
    { label: 'Physical Address', value: user.address || 'Not provided', icon: MapPin },
    { label: 'Account Role', value: user.role.toUpperCase(), icon: Shield },
    { label: 'Verification Status', value: user.isVerified ? 'Verified Email' : 'Pending Verification', icon: Shield },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        Account Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.label} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 bg-white rounded-xl text-emerald-600 border border-slate-200 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {field.label}
                </span>
                <span className="text-xs font-semibold text-slate-900 mt-0.5 block">
                  {field.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
