import * as Location from 'expo-location';

export const PROXIMITY_THRESHOLD = 100;

export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Доступ к местоположению не предоставлен');
    }
    
    const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus.status !== 'granted') {
      console.warn('Фоновое отслеживание местоположения недоступно');
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка запроса разрешений на местоположение:', error);
    throw error;
  }
};

export const getCurrentLocation = async (): Promise<Location.LocationObject> => {
  try {
    await requestLocationPermissions();
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: 4, 
      timeInterval: 5000,
      distanceInterval: 10,
    });
    
    return location;
  } catch (error) {
    console.error('Ошибка получения текущего местоположения:', error);
    throw error;
  }
};

export const startLocationUpdates = async (
  onLocation: (location: Location.LocationObject) => void
): Promise<Location.LocationSubscription> => {
  try {
    await requestLocationPermissions();
    
    return await Location.watchPositionAsync(
      {
        accuracy: 4, 
        timeInterval: 5000,
        distanceInterval: 5,
      },
      onLocation
    );
  } catch (error) {
    console.error('Ошибка запуска отслеживания местоположения:', error);
    throw error;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; 
  const b1 = (lat1 * Math.PI) / 180;
  const b2 = (lat2 * Math.PI) / 180;
  const b3 = ((lat2 - lat1) * Math.PI) / 180;
  const b4 = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(b3 / 2) * Math.sin(b3 / 2) +
    Math.cos(b1) * Math.cos(b2) * Math.sin(b4 / 2) * Math.sin(b4 / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

export const isCloseToMarker = (
  userLocation: Location.LocationObject,
  marker: { latitude: number; longitude: number },
  threshold: number = PROXIMITY_THRESHOLD
): boolean => {
  const distance = calculateDistance(
    userLocation.coords.latitude,
    userLocation.coords.longitude,
    marker.latitude,
    marker.longitude
  );
  
  return distance <= threshold;
};

export const checkProximityToMarkers = (
  userLocation: Location.LocationObject,
  markers: Array<{ id: string; latitude: number; longitude: number }>,
  threshold: number = PROXIMITY_THRESHOLD
): string[] => {
  const nearbyMarkers: string[] = [];
  
  markers.forEach(marker => {
    if (isCloseToMarker(userLocation, marker, threshold)) {
      nearbyMarkers.push(marker.id);
    }
  });
  
  return nearbyMarkers;
};

export const formatCoordinates = (coords: Location.LocationObjectCoords): string => {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
};