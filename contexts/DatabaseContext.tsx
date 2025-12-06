import { initDatabase } from "@/database/schema";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import {
  addImage as dbAddImage,
  addMarker as dbAddMarker,
  deleteImage as dbDeleteImage,
  deleteMarker as dbDeleteMarker,
  getMarkerImages as dbGetMarkerImages,
  getMarkers as dbGetMarkers,
} from "../database/operations";
import { MarkerData } from "../types";

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
      console.log(' DatabaseContext: Загрузка маркеров из базы данных...');
      const loadedMarkers = await dbGetMarkers();
      console.log(' DatabaseContext: Загруженные маркеры:', loadedMarkers);
      
      for (const marker of loadedMarkers) {
        marker.images = await dbGetMarkerImages(Number(marker.id));
      }
      
      setMarkers(loadedMarkers);
      console.log('DatabaseContext: Маркеры успешно загружены и обновлены:', loadedMarkers.length);
    } catch (err) {
      console.error(' DatabaseContext: Ошибка загрузки маркеров:', err);
      setError(err as Error);
    }
  };

  const refreshMarkers = async () => {
    console.log(' DatabaseContext: Начинаем обновление маркеров');
    setIsLoading(true);
    await loadMarkersWithImages();
    setIsLoading(false);
    console.log(' DatabaseContext: Обновление маркеров завершено');
  };

  useEffect(() => {
    console.log('🚀 DatabaseContext: Инициализация контекста');
    initDatabase()
      .then(() => {
        console.log('🚀 DatabaseContext: База данных инициализирована, загружаем маркеры');
        refreshMarkers();
      })
      .catch(err => {
        console.error('🚀 DatabaseContext: Ошибка инициализации базы данных:', err);
        setError(err as Error);
        setIsLoading(false);
      });
  }, []);

  const addMarker = async (latitude: number, longitude: number, title?: string, description?: string) => {
    try {
      console.log(' DatabaseContext: Попытка добавления маркера:', { latitude, longitude, title, description });
      await dbAddMarker(latitude, longitude, title, description);
      console.log(' DatabaseContext: Маркер добавлен в базу данных');
      await refreshMarkers();
      console.log(' DatabaseContext: Маркеры обновлены после добавления');
    } catch (err) {
      console.error(' DatabaseContext: Ошибка добавления маркера:', err);
      setError(err as Error);
      throw err; 
    }
  };

  const deleteMarker = async (id: string) => {
    try {
      console.log(' DatabaseContext: Попытка удаления маркера:', id);
      await dbDeleteMarker(id);
      console.log(' DatabaseContext: Маркер удален из базы данных');
      await refreshMarkers();
      console.log(' DatabaseContext: Маркеры обновлены после удаления');
    } catch (err) {
      console.error(' DatabaseContext: Ошибка удаления маркера:', err);
      setError(err as Error);
      throw err; 
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
