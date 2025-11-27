import React, { createContext, useState, useEffect, ReactNode } from "react";
import {
  addMarker as dbAddMarker,
  deleteMarker as dbDeleteMarker,
  getMarkers as dbGetMarkers,
  addImage as dbAddImage,
  deleteImage as dbDeleteImage,
  getMarkerImages as dbGetMarkerImages,
} from "../database/operations";
import { MarkerData, ImageData } from "../types";
import { initDatabase } from "@/database/schema";

interface DatabaseContextType {
  markers: MarkerData[];
  isLoading: boolean;
  error: Error | null;
  addMarker: (latitude: number, longitude: number, title?: string, description?: string) => Promise<void>;
  deleteMarker: (id: string) => Promise<void>;
  addImage: (markerId: string, uri: string, name?: string) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  refreshMarkers: () => Promise<void>;
}

export const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMarkersWithImages = async () => {
    try {
      const loadedMarkers = await dbGetMarkers();
      for (const marker of loadedMarkers) {
        marker.images = await dbGetMarkerImages(Number(marker.id));
      }
      setMarkers(loadedMarkers);
    } catch (err) {
      setError(err as Error);
    }
  };

  const refreshMarkers = async () => {
    setIsLoading(true);
    await loadMarkersWithImages();
    setIsLoading(false);
  };

  useEffect(() => {
    initDatabase()
      .then(() => refreshMarkers())
      .catch(err => setError(err as Error));
  }, []);

  const addMarker = async (latitude: number, longitude: number, title?: string, description?: string) => {
    try {
      await dbAddMarker(latitude, longitude, title, description);
      await refreshMarkers();
    } catch (err) {
      setError(err as Error);
    }
  };

  const deleteMarker = async (id: string) => {
    try {
      await dbDeleteMarker(id);
      await refreshMarkers();
    } catch (err) {
      setError(err as Error);
    }
  };

  const addImage = async (markerId: string, uri: string, name?: string) => {
    try {
      await dbAddImage(Number(markerId), uri, name);
      await refreshMarkers();
    } catch (err) {
      setError(err as Error);
    }
  };

  const deleteImage = async (id: string) => {
    try {
      await dbDeleteImage(Number(id));
      await refreshMarkers();
    } catch (err) {
      setError(err as Error);
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        markers,
        isLoading,
        error,
        addMarker,
        deleteMarker,
        addImage,
        deleteImage,
        refreshMarkers,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = React.useContext(DatabaseContext);
  if (!context) {
    throw new Error("Хук useDatabase должен использоваться только внутри DatabaseProvider");
  }
  return context;
};
