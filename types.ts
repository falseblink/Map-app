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

export type RootStackParamList = {
  index: number;
  'marker/[id]': { id: string };
};
