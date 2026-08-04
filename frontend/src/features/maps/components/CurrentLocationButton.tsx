import React from 'react';
import { Navigation } from 'lucide-react';

interface CurrentLocationButtonProps {
  onLocate: () => void;
  isLoading?: boolean;
}

export const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onLocate,
  isLoading = false,
}) => {
  return (
    <button
      type="button"
      onClick={onLocate}
      disabled={isLoading}
      className="p-2.5 bg-white text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-2xl shadow-lg border border-slate-200 transition-all cursor-pointer flex items-center justify-center"
      title="Recenter to my position"
    >
      <Navigation className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
    </button>
  );
};
