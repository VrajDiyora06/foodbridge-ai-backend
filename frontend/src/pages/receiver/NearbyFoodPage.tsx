import React, { useState, useEffect } from 'react';
import { Navigation, Compass } from 'lucide-react';
import {
  useNearbyFood,
  useCreateReservation,
} from '../../features/receiver/hooks/useReceiverQueries';
import { NearbyFoodMapPlaceholder } from '../../features/receiver/components/NearbyFoodMapPlaceholder';
import { FoodCard } from '../../features/receiver/components/FoodCard';
import { ConfirmReservationDialog } from '../../features/receiver/components/ConfirmReservationDialog';
import type { FoodItem } from '../../features/donor/types/donor.types';

export const NearbyFoodPage: React.FC = () => {
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const { data: nearbyFoods, isLoading } = useNearbyFood({
    latitude: coords.latitude,
    longitude: coords.longitude,
    radiusKm,
  });

  const createReservationMutation = useCreateReservation();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Fallback location if permission denied
          setCoords({ latitude: 37.7749, longitude: -122.4194 });
        }
      );
    }
  }, []);

  const handleConfirmReservation = async (notes?: string, pickupTime?: string) => {
    if (selectedFood) {
      await createReservationMutation.mutateAsync({
        foodId: selectedFood._id,
        notes,
        pickupTime,
      });
      setSelectedFood(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" />
            Nearby Food Radius
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover active food donations close to your physical location.
          </p>
        </div>

        {/* Radius selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
          <Navigation className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">Search Radius:</span>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="text-xs font-bold text-emerald-700 bg-transparent outline-none cursor-pointer"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>
      </div>

      {/* Map Mockup */}
      <NearbyFoodMapPlaceholder
        foods={nearbyFoods || []}
        userLat={coords.latitude}
        userLng={coords.longitude}
        radiusKm={radiusKm}
        onSelectFood={(item) => setSelectedFood(item)}
      />

      {/* Food Listings */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Available Listings Within {radiusKm} km ({nearbyFoods?.length || 0})
        </h2>

        {isLoading ? (
          <div className="h-48 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse flex items-center justify-center">
            <p className="text-xs font-semibold text-slate-400">Scanning nearby food listings...</p>
          </div>
        ) : !nearbyFoods || nearbyFoods.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            No active food listings found within {radiusKm} km radius. Try expanding your search radius!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyFoods.map((food) => (
              <FoodCard key={food._id} food={food} onReserve={(item) => setSelectedFood(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Confirm Reservation Modal */}
      <ConfirmReservationDialog
        isOpen={Boolean(selectedFood)}
        food={selectedFood}
        isSubmitting={createReservationMutation.isPending}
        onConfirm={handleConfirmReservation}
        onCancel={() => setSelectedFood(null)}
      />
    </div>
  );
};
