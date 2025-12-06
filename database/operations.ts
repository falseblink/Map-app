import { ImageData, MarkerData } from "../types";
import { getDatabase } from "./schema";

export const addMarker = async (
  latitude: number,
  longitude: number,
  title?: string,
  description?: string
) => {
  try {
    console.log(' addMarker: Начинаем добавление маркера', { latitude, longitude, title, description });
    const db = await getDatabase();
    console.log(' addMarker: База данных открыта');
    
    const res = await db.runAsync(
      `INSERT INTO markers (latitude, longitude, title, description) VALUES (?, ?, ?, ?)`,
      [latitude, longitude, title || null, description || null]
    );
    console.log(' addMarker: Маркер добавлен, ID:', res.lastInsertRowId);
    return res.lastInsertRowId;
  } catch (error) {
    console.error(' addMarker: Ошибка при добавлении маркера:', error);
    throw error;
  }
};

export const deleteMarker = async (id: string): Promise<void> => {
  try {
    console.log(' deleteMarker: Начинаем удаление маркера', id);
    const db = await getDatabase();
    console.log(' deleteMarker: База данных открыта');
    
    await db.runAsync(`DELETE FROM markers WHERE id = ?`, [id]);
    console.log(' deleteMarker: Маркер удален');
  } catch (error) {
    console.error(' deleteMarker: Ошибка при удалении маркера:', error);
    throw error;
  }
};

export const getMarkers = async () => {
  try {
    console.log(' getMarkers: Начинаем получение маркеров');
    const db = await getDatabase();
    console.log(' getMarkers: База данных открыта');
    
    const result = await db.getAllAsync(`SELECT * FROM markers`);
    console.log(' getMarkers: Результат запроса:', result);
    
    const markers = (result as MarkerData[]).map(row => ({
      id: row.id.toString(),
      latitude: row.latitude,
      longitude: row.longitude,
      title: row.title ?? undefined,
      description: row.description ?? undefined,
      images: [] as ImageData[],
    }));
    
    console.log(' getMarkers: Обработанные маркеры:', markers);
    return markers;
  } catch (error) {
    console.error(' getMarkers: Ошибка при получении маркеров:', error);
    throw error;
  }
};

export const addImage = async (
  markerId: number,
  uri: string,
  name?: string
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO marker_images (marker_id, uri, name) VALUES (?, ?, ?)`,
    [markerId, uri, name || null]
  );
};

export const deleteImage = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM marker_images WHERE id = ?`, [id]);
};

export const getMarkerImages = async (markerId: number) => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    `SELECT id, uri, name FROM marker_images WHERE marker_id = ?`, [markerId]
  );
  return (result as ImageData[]).map(row => ({
    id: row.id.toString(),
    uri: row.uri,
    name: row.name || "",
  }));
};
