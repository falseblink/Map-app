import * as SQLite from 'expo-sqlite';

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  console.log(' getDatabase: Открываем базу данных markers');
  const db = await SQLite.openDatabaseAsync('markers');
  console.log(' getDatabase: База данных открыта успешно');
  return db;
};

export const initDatabase = async (): Promise<void> => {
  try {
    console.log(' initDatabase: Начинаем инициализацию базы данных');
    const db = await getDatabase();
    console.log(' initDatabase: База данных открыта');
    
    const sqlCommands = `
      CREATE TABLE IF NOT EXISTS markers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        title TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS marker_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marker_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (marker_id) REFERENCES markers(id) ON DELETE CASCADE
      );
    `;
    
    console.log(' initDatabase: Выполняем SQL:', sqlCommands);
    
    await db.execAsync(sqlCommands);
    
    console.log(' initDatabase: Таблицы созданы успешно');
    
    const tables = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table'");
    console.log(' initDatabase: Созданные таблицы:', tables);
    
  } catch (err) {
    console.error(' initDatabase: Ошибка инициализации базы данных', err);
    throw err;
  }
};
