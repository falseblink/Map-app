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
    throw new Error("useMarkers должен использоваться в рамках MarkerProvider");
  }
  return context;
};
