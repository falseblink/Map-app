import React from "react";
import { useRouter } from "expo-router";
import Map from "../components/Map";
import { MarkerData } from "../types";
import { useDatabase } from "@/contexts/DatabaseContext";

export default function Index() {
  const { markers, addMarker, isLoading } = useDatabase();
  const router = useRouter();

  // const handleAddMarker = (marker: MarkerData) => {
  //   addMarker(marker.latitude, marker.longitude, marker.title, marker.description);
  // }

  const handleMarkerPress = (id: string) => {
    router.push(`/marker/${id}`);
  };

  return (
    <Map
      onMarkerPress={handleMarkerPress}
    />
  );
}
