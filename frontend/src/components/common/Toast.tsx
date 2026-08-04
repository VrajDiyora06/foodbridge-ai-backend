import React from 'react';
import { Bell, CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconConfig = {
          success: { icon: CheckCircle2, style: 'bg-emerald-500 text-white' },
          error: { icon: AlertCircle, style: 'bg-rose-500 text-white' },
          warning: { icon: AlertCircle, style: 'bg-amber-500 text-white' },
          info: { icon: Bell, style: 'bg-emerald-600 text-white' },
        };

        const config = iconConfig[toast.type || 'info'];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
          >
            <div className={`p-2 rounded-xl shrink-0 ${config.style}`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs font-bold text-slate-100 truncate">{toast.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{toast.message}</p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
