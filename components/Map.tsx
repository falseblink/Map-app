import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TextInput,
  Button,
  Platform,
} from "react-native";
import MapView, { Marker, LongPressEvent } from "react-native-maps";
import { useMarkers } from "../components/MarkerContext";
import { MarkerData } from "@/types";

interface MapProps {
  markers: MarkerData[];
  loading?: boolean;
  onAddMarker: (marker: MarkerData) => void;
  onMarkerPress: (id: string) => void;
}

export default function Map({ onMarkerPress }: MapProps) {
  const { markers, setMarkers} = useMarkers();

  const [modalVisible, setModalVisible] = useState(false);
  const [newMarkerCoords, setNewMarkerCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleLongPress = (e: LongPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setNewMarkerCoords(coords);
    setTitle("");
    setDescription("");
    setModalVisible(true);
  };

  const saveMarker = () => {
    if (!newMarkerCoords) return;
    const newMarker = {
      id: Date.now().toString(),
      latitude: newMarkerCoords.latitude,
      longitude: newMarkerCoords.longitude,
      title: title.trim() === "" ? "Без названия" : title.trim(),
      description: description.trim() === "" ? "Без описания" : description.trim(),
      images: [],
    };
    setMarkers((prev) => [...prev, newMarker]);
    setModalVisible(false);
  };

  const cancel = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 58.009368, 
          longitude: 56.207857,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onLongPress={handleLongPress}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            onPress={() => onMarkerPress(marker.id)}
          />
        ))}
      </MapView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={cancel} 
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Новый маркер</Text>

            <TextInput
              placeholder="Название"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            <TextInput
              placeholder="Описание"
              style={[styles.input, { height: 80 }]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.buttonRow}>
              <Button title="Отмена" onPress={cancel} color="#888" />
              <Button title="Сохранить" onPress={saveMarker} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  modalOverlay: {
    flex: 1,
    backgroundColor: Platform.OS === "ios" ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
