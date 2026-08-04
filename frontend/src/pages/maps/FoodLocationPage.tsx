import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useFoodDetail } from '../../features/receiver/hooks/useReceiverQueries';
import { FoodMap } from '../../features/maps/components/FoodMap';

export const FoodLocationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: food, isLoading } = useFoodDetail(id || '');

  if (isLoading) {
    return (
      <div className="h-96 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
        <p className="text-xs font-semibold text-slate-400">Loading location map...</p>
      </div>
    );
  }

  if (!food) return null;

  const coords = {
    latitude: food.location.latitude || 37.7749,
    longitude: food.location.longitude || -122.4194,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-emerald-600" />
          Pickup Location Map: {food.title}
        </h1>
        <p className="text-xs text-slate-500 mt-1">{food.location.address}, {food.location.city}</p>
      </div>

      <FoodMap center={coords} foods={[food]} height="h-[500px]" zoom={15} />
    </div>
  );
};
