import React from "react";
import { View, Image, Button, FlatList, StyleSheet, Text, Alert } from "react-native";
import { ImageData } from "../types";

interface ImageListProps {
  images: ImageData[];
  onRemove: (id: string) => void;
}

export default function ImageList({ images, onRemove }: ImageListProps) {
  const confirmRemove = (id: string) => {
    Alert.alert(
      "Подтверждение удаления",
      "Вы уверены, что хотите удалить это изображение?",
      [
        { text: "Отмена", style: "cancel" },
        { text: "Удалить", style: "destructive", onPress: () => onRemove(id) },
      ],
      { cancelable: true }
    );
  };

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>Нет изображений</Text>}
      renderItem={({ item }) => (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.uri }} style={styles.image} />
          <Button title="Удалить" onPress={() => confirmRemove(item.id)} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
});
