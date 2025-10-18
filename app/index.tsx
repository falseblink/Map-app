import React from "react";
import { useRouter } from "expo-router";
import Map from "../components/Map";
import { useMarkers } from "../components/MarkerContext";
import { MarkerData } from "../types";

export default function Index() {
  const { markers, setMarkers } = useMarkers();
  const router = useRouter();

  const handleAddMarker = (marker: MarkerData) => {
    setMarkers(prev => [...prev, marker]);
  };

  const handleMarkerPress = (id: string) => {
    router.push(`/marker/${id}`);
  };

  return (
    <Map
      markers={markers}
      loading={false}
      onAddMarker={handleAddMarker}
      onMarkerPress={handleMarkerPress}
    />
  );
}
