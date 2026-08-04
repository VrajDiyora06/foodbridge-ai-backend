import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'bg-emerald-50 text-emerald-600 border-emerald-200',
}) => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <span className="text-2xl font-black text-slate-900 block">{value}</span>
        {subtext && <span className="text-[11px] font-medium text-slate-500">{subtext}</span>}
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
