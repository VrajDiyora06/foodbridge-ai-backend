import { useState, useEffect } from 'react';
import type { LocationCoordinates } from '../types/map.types';

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<LocationCoordinates>({
    latitude: 37.7749, // Default fallback (San Francisco)
    longitude: -122.4194,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const requestLocation = () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message || 'Permission denied or unable to fetch location.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { location, error, isLoading, requestLocation };
};
