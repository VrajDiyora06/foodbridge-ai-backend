import React, { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import type { BroadcastNotificationInput, UserRoleType } from '../types/admin.types';

interface BroadcastFormProps {
  isSubmitting?: boolean;
  onSubmit: (data: BroadcastNotificationInput) => Promise<void>;
}

export const BroadcastForm: React.FC<BroadcastFormProps> = ({
  isSubmitting = false,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [selectedRoles, setSelectedRoles] = useState<UserRoleType[]>([]);

  const handleRoleToggle = (role: UserRoleType) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    onSubmit({
      title,
      message,
      priority,
      targetRoles: selectedRoles.length > 0 ? selectedRoles : undefined,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Broadcast Platform Announcement</h2>
          <p className="text-xs text-slate-500">
            Send real-time system notifications to connected users via Socket.IO
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Announcement Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Scheduled Platform Maintenance Notice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Notification Message *
          </label>
          <textarea
            rows={4}
            required
            placeholder="Write clear notice text..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Target User Roles (Leave empty for ALL)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {(['donor', 'ngo', 'volunteer', 'user'] as UserRoleType[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all ${
                    selectedRoles.includes(role)
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-1 mt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
            Live Banner Preview
          </span>
          <p className="text-xs font-bold text-slate-100">{title || 'Announcement Title'}</p>
          <p className="text-[11px] text-slate-400">{message || 'Message preview text will render here...'}</p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !message.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 text-xs transition-all disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Broadcasting...' : 'Broadcast Announcement'}
          </button>
        </div>
      </form>
    </div>
  );
};
