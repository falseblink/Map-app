import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import ImageList from "../../components/ImageList";
import { useDatabase } from "@/contexts/DatabaseContext"; // Только из контекста!

export default function MarkerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { markers, addImage, deleteImage, deleteMarker } = useDatabase();

  const marker = markers.find(m => m.id === id) || null;

  const handleDelete = async () => {
    Alert.alert(
      "Удаление маркера",
      "Вы уверены, что хотите удалить этот маркер?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            await deleteMarker(id);
            router.back();
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets.length > 0 && marker) {
        const asset = result.assets[0];
        await addImage(
          marker.id,
          asset.uri,
          asset.fileName ?? asset.uri.split("/").pop() ?? ""
        );
      }
    } catch {
      setError("Ошибка выбора изображения");
    }
  };

  const removeImage = async (imageId: string) => {
    await deleteImage(imageId);
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
      <Button title="Удалить маркер" color="red" onPress={handleDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  error: { color: "red", marginBottom: 10 },
  text: { marginVertical: 5, fontSize: 16 },
});
