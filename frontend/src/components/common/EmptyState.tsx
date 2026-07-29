import React from 'react';
import type { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';
import { Card } from '../ui/Card';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <Card className="text-center py-12 px-6 flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        {icon || <PackageOpen className="w-7 h-7 text-slate-400" />}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action}
    </Card>
  );
};
