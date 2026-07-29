import React from 'react';
import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'teal' | 'amber' | 'purple' | 'rose' | 'slate' | 'blue';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'sm',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center gap-1 font-semibold rounded-full border';

  const variants = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    teal: 'bg-teal-100 text-teal-800 border-teal-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200',
    slate: 'bg-slate-100 text-slate-800 border-slate-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
