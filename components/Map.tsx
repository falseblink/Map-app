import * as Location from 'expo-location';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { LongPressEvent, Marker, Region } from "react-native-maps";
import {
  checkProximityToMarkers,
  formatCoordinates,
  requestLocationPermissions,
  startLocationUpdates
} from "../services/location";
import { notificationManager } from "../services/notifications";
import { MarkerData } from "../types";

interface MapProps {
  markers: MarkerData[];
  onAddMarker: (latitude: number, longitude: number, title?: string, description?: string) => Promise<void>;
  onMarkerPress: (id: string) => void;
}

export default function Map({ markers, onAddMarker, onMarkerPress }: MapProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [newMarkerCoords, setNewMarkerCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Location tracking states
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 58.009368,
    longitude: 56.207857,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [nearbyMarkers, setNearbyMarkers] = useState<string[]>([]);

  useEffect(() => {
    requestLocationPermissions()
      .then((granted) => {
        setLocationPermission(granted);
        if (granted) {
          startLocationTracking();
        }
      })
      .catch((error) => {
        setLocationError(error.message);
        setLocationPermission(false);
      });
  }, []);

  const startLocationTracking = async () => {
    try {
      setIsLocationLoading(true);
      const locationSubscription = await startLocationUpdates((location) => {
        setUserLocation(location);
        setLocationError(null);
        
        setMapRegion(prev => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));

        const nearby = checkProximityToMarkers(location, markers);
        handleProximityChange(nearby);
      });

      setIsLocationLoading(false);
      return () => locationSubscription?.remove();
    } catch (error: any) {
      setIsLocationLoading(false);
      setLocationError(error.message);
      console.error('Ошибка отслеживания местоположения:', error);
    }
  };

  const handleProximityChange = async (newNearbyMarkers: string[]) => {
    setNearbyMarkers(newNearbyMarkers);

    for (const markerId of newNearbyMarkers) {
      if (!nearbyMarkers.includes(markerId)) {
        const marker = markers.find(m => m.id === markerId);
        if (marker) {
          try {
            await notificationManager.showNotification(marker);
            console.log(`Уведомление отправлено для маркера: ${marker.title}`);
          } catch (error) {
            console.error('Ошибка показа уведомления:', error);
          }
        }
      }
    }

    for (const markerId of nearbyMarkers) {
      if (!newNearbyMarkers.includes(markerId)) {
        try {
          await notificationManager.removeNotification(markerId);
        } catch (error) {
          console.error('Ошибка удаления уведомления:', error);
        }
      }
    }
  };

  const handleLongPress = (e: LongPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setNewMarkerCoords(coords);
    setTitle("");
    setDescription("");
    setModalVisible(true);
  };

  const saveMarker = async () => {
    if (!newMarkerCoords) return;
    
    try {
      await onAddMarker(
        newMarkerCoords.latitude,
        newMarkerCoords.longitude,
        title.trim() === "" ? "Без названия" : title.trim(),
        description.trim() === "" ? "Без описания" : description.trim()
      );
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить маркер');
    }
  };

  const cancel = () => setModalVisible(false);

  const getLocationStatusText = () => {
    if (locationError) return 'Ошибка определения местоположения';
    if (isLocationLoading) return 'Определение местоположения...';
    if (locationPermission && userLocation) {
      return `Местоположение: ${formatCoordinates(userLocation.coords)}`;
    }
    if (!locationPermission) return 'Местоположение отключено';
    return 'Местоположение недоступно';
  };

  return (
    <View style={styles.container}>
      <View style={styles.locationStatus}>
        <Text style={styles.locationStatusText}>
          {getLocationStatusText()}
        </Text>
        {isLocationLoading && <ActivityIndicator size="small" color="#007AFF" />}
      </View>

      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        onLongPress={handleLongPress}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={false}
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
          >
            {nearbyMarkers.includes(marker.id) ? (
              <View style={[styles.marker, styles.nearbyMarker]}>
                <Text style={styles.nearbyMarkerText}>📍</Text>
              </View>
            ) : (
              <View style={styles.marker}>
                <Text style={styles.markerText}>📍</Text>
              </View>
            )}
          </Marker>
        ))}
      </MapView>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={cancel}>
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

      {nearbyMarkers.length > 0 && (
        <View style={styles.nearbyIndicator}>
          <Text style={styles.nearbyText}>
            📍 Рядом с вами: {nearbyMarkers.length} маркер{nearbyMarkers.length === 1 ? '' : nearbyMarkers.length < 5 ? 'а' : 'ов'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  locationStatus: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  locationStatusText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  marker: {
    width: 30,
    height: 30,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    fontSize: 16,
  },
  nearbyMarker: {
    backgroundColor: '#FF3B30',
    transform: [{ scale: 1.2 }],
  },
  nearbyMarkerText: {
    fontSize: 16,
  },
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
  nearbyIndicator: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1000,
  },
  nearbyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
