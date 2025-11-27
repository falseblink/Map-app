import { getDatabase } from "./schema";
import { MarkerData, ImageData } from "../types";

export const addMarker = async (
  latitude: number,
  longitude: number,
  title?: string,
  description?: string
) => {
  const db = await getDatabase();
  const res = await db.runAsync(
    `INSERT INTO markers (latitude, longitude, title, description) VALUES (?, ?, ?, ?)`,
    [latitude, longitude, title || null, description || null]
  );
  return res.lastInsertRowId;
};

export const deleteMarker = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM markers WHERE id = ?`, [id]);
};

export const getMarkers = async () => {
  const db = await getDatabase();
  const result = await db.getAllAsync(`SELECT * FROM markers`);
  return (result as MarkerData[]).map(row => ({
    id: row.id.toString(),
    latitude: row.latitude,
    longitude: row.longitude,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    images: [] as ImageData[],
  }));
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
    `SELECT * FROM marker_images WHERE marker_id = ?`, [markerId]
  );
  return (result as ImageData[]).map(row => ({
    id: row.id.toString(),
    uri: row.uri,
    name: row.name || "",
  }));
};
