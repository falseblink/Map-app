import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ImageData } from "../../types";
import ImageList from "../../components/ImageList";
import { useMarkers } from "../../components/MarkerContext";

export default function MarkerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { markers, updateMarkerImages } = useMarkers();
  
  const marker = markers.find(m => m.id === id) || null;

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets.length > 0 && marker) {
        const image: ImageData = {
          uri: result.assets[0].uri,
          name: result.assets[0].fileName ?? result.assets[0].uri.split("/").pop() ?? "",
          id: Date.now().toString(),
        };
        updateMarkerImages(marker.id, [...marker.images, image]);
      }
    } catch {
      setError("Ошибка выбора изображения");
    }
  };

  const removeImage = (imageId: string) => {
    if (!marker) return;
    const newImages = marker.images.filter(img => img.id !== imageId);
    updateMarkerImages(marker.id, newImages);
  };

  if (!id) return <Text>Маркер не найден</Text>;
  if (!marker) return <Text>Загрузка данных маркера...</Text>;

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.text}> {marker.title}</Text>
      <Text style={styles.text}> Описание: {marker.description}</Text>
      <Text style={styles.text}>
        Координаты: {marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}
      </Text>
      <Button title="Добавить изображение" onPress={pickImage} />
      <ImageList images={marker.images} onRemove={removeImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  error: { color: "red", marginBottom: 10 },
  text: { marginVertical: 5, fontSize: 16 },
});
