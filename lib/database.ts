import * as SQLite from 'expo-sqlite';
import { Document, Folder, Tag, AppSettings } from '@/types';
import { STORAGE_KEYS } from '@/constants';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('docnest.db');
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      color TEXT,
      icon TEXT,
      FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER NOT NULL,
      uri TEXT NOT NULL,
      thumbnail_uri TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      is_favorite INTEGER DEFAULT 0,
      folder_id TEXT,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS document_tags (
      document_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (document_id, tag_id),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_id);
    CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_documents_name ON documents(name);
    CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);

    CREATE TABLE IF NOT EXISTS reading_history (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      scroll_position REAL NOT NULL DEFAULT 0,
      total_height REAL NOT NULL DEFAULT 0,
      progress REAL NOT NULL DEFAULT 0,
      font_size TEXT NOT NULL DEFAULT 'medium',
      line_spacing REAL NOT NULL DEFAULT 1.5,
      font_family TEXT NOT NULL DEFAULT 'system',
      theme TEXT NOT NULL DEFAULT 'system',
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reading_history_document ON reading_history(document_id);
  `);

  await insertDefaultSettings(database);
}

async function insertDefaultSettings(database: SQLite.SQLiteDatabase): Promise<void> {
  const defaultSettings: AppSettings = {
    theme: 'system',
    defaultSort: 'date',
    sortOrder: 'desc',
    showThumbnails: true,
    autoBackup: false,
  };

  await database.runAsync(
    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
    [STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings)]
  );
}

export function rowToDocument(row: any): Document {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    size: row.size,
    uri: row.uri,
    thumbnailUri: row.thumbnail_uri,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    tags: [],
    isFavorite: Boolean(row.is_favorite),
    folderId: row.folder_id,
  };
}

export function rowToFolder(row: any): Folder {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    color: row.color,
    icon: row.icon,
  };
}

export function rowToTag(row: any): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: new Date(row.created_at),
  };
}

export function rowToSettings(row: any): AppSettings {
  return JSON.parse(row.value);
}