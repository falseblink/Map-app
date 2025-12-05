import { useDatabase } from "@/contexts/DatabaseContext";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Map from "../components/Map";

export default function Index() {
  const { markers, addMarker, isLoading } = useDatabase();
  const router = useRouter();

  const handleMarkerPress = (id: string) => {
    router.push(`/marker/${id}`);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <Map
      markers={markers}
      onAddMarker={addMarker}
      onMarkerPress={handleMarkerPress}
    />
  );
}
