import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { FoodItem } from '../../donor/types/donor.types';
import { FoodPopup } from './FoodPopup';

interface FoodMarkerProps {
  food: FoodItem;
}

const createCustomIcon = (status: string) => {
  const colorMap: Record<string, string> = {
    available: '#10b981', // emerald
    reserved: '#f59e0b', // amber
    completed: '#8b5cf6', // purple
    expired: '#ef4444', // rose
  };

  const bg = colorMap[status] || '#10b981';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${bg};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        🍲
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const FoodMarker: React.FC<FoodMarkerProps> = ({ food }) => {
  const lat = food.location.latitude;
  const lng = food.location.longitude;

  if (!lat || !lng) return null;

  return (
    <Marker position={[lat, lng]} icon={createCustomIcon(food.status)}>
      <Popup className="food-map-popup">
        <FoodPopup food={food} />
      </Popup>
    </Marker>
  );
};
