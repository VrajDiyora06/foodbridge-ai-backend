import React from 'react';

export const MapLegend: React.FC = () => {
  const items = [
    { label: 'Available', color: 'bg-emerald-500' },
    { label: 'Reserved', color: 'bg-amber-500' },
    { label: 'Completed', color: 'bg-purple-500' },
    { label: 'User Location', color: 'bg-blue-600' },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 shadow-md flex items-center gap-4 text-xs font-semibold text-slate-700">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
