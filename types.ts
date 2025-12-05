export interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  images: ImageData[];
}

export interface ImageData {
  uri: string;
  name: string;
  id: string;
}

export interface LocationConfig {
  accuracy: number;
  timeInterval: number; 
  distanceInterval: number; 
}

export interface LocationState {
  location: any; 
  errorMsg: string | null;
}

export interface ActiveNotification {
  markerId: string; 
  notificationId: string;
  timestamp: number;
}

export type RootStackParamList = {
  index: number;
  'marker/[id]': { id: string };
};
