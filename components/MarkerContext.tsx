import React, { createContext, useState, ReactNode, useContext } from "react";
import { MarkerData, ImageData } from "../types";

interface MarkerContextType {
  markers: MarkerData[];
  setMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>;
  updateMarkerImages: (markerId: string, images: ImageData[]) => void;
  updateMarkerInfo: (markerId: string, info: Partial<MarkerData>) => void;
}

const MarkerContext = createContext<MarkerContextType | undefined>(undefined);

export const MarkerProvider = ({ children }: { children: ReactNode }) => {
  const [markers, setMarkers] = useState<MarkerData[]>([
    // {
    //   id: "1",
    //   latitude: 58.00675,
    //   longitude: 56.18576,
    //   title: "Ботанический сад",
    //   description: "Ботанический сад ПГНИУ",
    //   images: [],
    // },
    // {
    //   id: "2",
    //   latitude: 58.00858,
    //   longitude: 56.19081,
    //   title: "Корпус 5",
    //   description: "ПГНИУ, корпус №5",
    //   images: [],
    // },
  ]);

  const updateMarkerImages = (markerId: string, images: ImageData[]) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === markerId ? { ...marker, images } : marker
      )
    );
  };

  const updateMarkerInfo = (markerId: string, info: Partial<MarkerData>) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === markerId ? { ...marker, ...info } : marker
      )
    );
  };

  return (
    <MarkerContext.Provider value={{ markers, setMarkers, updateMarkerImages, updateMarkerInfo }}>
      {children}
    </MarkerContext.Provider>
  );
};

export const useMarkers = () => {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("useMarkers must be used within MarkerProvider");
  }
  return context;
};
