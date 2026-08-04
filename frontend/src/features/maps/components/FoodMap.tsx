import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FoodItem } from '../../donor/types/donor.types';
import type { LocationCoordinates } from '../types/map.types';
import { FoodMarker } from './FoodMarker';
import { CurrentLocationButton } from './CurrentLocationButton';

interface FoodMapProps {
  center: LocationCoordinates;
  foods: FoodItem[];
  userLocation?: LocationCoordinates;
  height?: string;
  zoom?: number;
  onLocateUser?: () => void;
}

const UserMarkerIcon = L.divIcon({
  className: 'user-leaflet-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #2563eb;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.25);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to dynamically re-center map view
const MapRecenter: React.FC<{ center: LocationCoordinates; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.latitude, center.longitude], zoom);
  }, [center, zoom, map]);
  return null;
};

export const FoodMap: React.FC<FoodMapProps> = ({
  center,
  foods,
  userLocation,
  height = 'h-96',
  zoom = 13,
  onLocateUser,
}) => {
  return (
    <div className={`relative w-full ${height} rounded-3xl overflow-hidden shadow-lg border border-slate-200`}>
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <MapRecenter center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={UserMarkerIcon}>
            <Popup>
              <div className="text-xs font-bold text-slate-800">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {/* Food Donation Markers */}
        {foods.map((food) => (
          <FoodMarker key={food._id} food={food} />
        ))}
      </MapContainer>

      {/* Locate button overlay */}
      {onLocateUser && (
        <div className="absolute bottom-4 right-4 z-10">
          <CurrentLocationButton onLocate={onLocateUser} />
        </div>
      )}
    </div>
  );
};
