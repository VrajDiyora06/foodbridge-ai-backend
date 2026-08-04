import React from 'react';
import { Compass } from 'lucide-react';
import { useCurrentLocation } from '../../features/maps/hooks/useCurrentLocation';
import { useNearbyFoodMap } from '../../features/maps/hooks/useNearbyFoodMap';
import { useMapFilters } from '../../features/maps/hooks/useMapFilters';
import { FoodMap } from '../../features/maps/components/FoodMap';
import { MapFilters } from '../../features/maps/components/MapFilters';
import { MapLegend } from '../../features/maps/components/MapLegend';
import { FoodCard } from '../../features/receiver/components/FoodCard';

export const NearbyMapPage: React.FC = () => {
  const { location, requestLocation, isLoading: isGeoLoading } = useCurrentLocation();
  const { filters, setFilters, resetFilters } = useMapFilters(10);
  const { data: nearbyFoods, isLoading: isFoodLoading } = useNearbyFoodMap(location, filters);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" />
            Interactive Nearby Food Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geolocation map displaying active surplus food donations.
          </p>
        </div>

        <MapLegend />
      </div>

      <MapFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

      {/* Live React Leaflet Map */}
      <FoodMap
        center={location}
        userLocation={location}
        foods={nearbyFoods || []}
        height="h-[500px]"
        onLocateUser={requestLocation}
      />

      {/* Listings List */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-bold text-slate-900">
          Listings On Map ({nearbyFoods?.length || 0})
        </h2>

        {isFoodLoading || isGeoLoading ? (
          <div className="h-48 bg-white rounded-3xl border border-slate-200 animate-pulse flex items-center justify-center">
            <p className="text-xs font-semibold text-slate-400">Loading nearby markers...</p>
          </div>
        ) : !nearbyFoods || nearbyFoods.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No active food listings within {filters.radiusKm} km radius.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nearbyFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
