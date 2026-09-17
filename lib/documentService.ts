import { getDatabase, rowToDocument, rowToFolder, rowToTag } from './database';
import { Document, Folder, Tag } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from 'expo-file-system';
import { DOCUMENT_TYPES } from '@/constants';

export interface DocumentWithTags extends Document {
  tags: Tag[];
}

export interface FolderWithCount extends Folder {
  documentCount: number;
  subfolderCount: number;
}

class DocumentService {
  private async getDb() {
    return getDatabase();
  }

  async getAllDocuments(folderId?: string): Promise<DocumentWithTags[]> {
    const db = await this.getDb();
    let query = `
      SELECT d.*, 
        GROUP_CONCAT(t.id) as tag_ids,
        GROUP_CONCAT(t.name) as tag_names,
        GROUP_CONCAT(t.color) as tag_colors
      FROM documents d
      LEFT JOIN document_tags dt ON d.id = dt.document_id
      LEFT JOIN tags t ON dt.tag_id = t.id
    `;
    const params: any[] = [];
    
    if (folderId) {
      query += ' WHERE d.folder_id = ?';
      params.push(folderId);
    } else {
      query += ' WHERE d.folder_id IS NULL';
    }
    
    query += ' GROUP BY d.id ORDER BY d.created_at DESC';
    
    const rows = await db.getAllAsync(query, params);
    return rows.map((row: any) => ({
      ...rowToDocument(row),
      tags: row.tag_ids ? row.tag_ids.split(',').map((id: string, i: number) => ({
        id,
        name: row.tag_names.split(',')[i],
        color: row.tag_colors.split(',')[i],
        createdAt: new Date(),
      })) : [],
    }));
  }

  async getDocumentById(id: string): Promise<DocumentWithTags | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync(`
      SELECT d.*, 
        GROUP_CONCAT(t.id) as tag_ids,
        GROUP_CONCAT(t.name) as tag_names,
        GROUP_CONCAT(t.color) as tag_colors
      FROM documents d
      LEFT JOIN document_tags dt ON d.id = dt.document_id
      LEFT JOIN tags t ON dt.tag_id = t.id
      WHERE d.id = ?
      GROUP BY d.id
    `, [id]);
    
    if (!row) return null;
    
    return {
      ...rowToDocument(row),
      tags: row.tag_ids ? row.tag_ids.split(',').map((id: string, i: number) => ({
        id,
        name: row.tag_names.split(',')[i],
        color: row.tag_colors.split(',')[i],
        createdAt: new Date(),
      })) : [],
    };
  }

  async createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'tags'>): Promise<Document> {
    const db = await this.getDb();
    const now = Date.now();
    const id = uuidv4();
    
    await db.runAsync(`
      INSERT INTO documents (id, name, type, size, uri, thumbnail_uri, created_at, updated_at, is_favorite, folder_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      document.name,
      document.type,
      document.size,
      document.uri,
      document.thumbnailUri || null,
      now,
      now,
      document.isFavorite ? 1 : 0,
      document.folderId || null,
    ]);
    
    return {
      ...document,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      tags: [],
    };
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    const db = await this.getDb();
    const now = Date.now();
    const fields: string[] = [];
    const params: any[] = [];
    
    if (updates.name !== undefined) { fields.push('name = ?'); params.push(updates.name); }
    if (updates.type !== undefined) { fields.push('type = ?'); params.push(updates.type); }
    if (updates.size !== undefined) { fields.push('size = ?'); params.push(updates.size); }
    if (updates.uri !== undefined) { fields.push('uri = ?'); params.push(updates.uri); }
    if (updates.thumbnailUri !== undefined) { fields.push('thumbnail_uri = ?'); params.push(updates.thumbnailUri); }
    if (updates.isFavorite !== undefined) { fields.push('is_favorite = ?'); params.push(updates.isFavorite ? 1 : 0); }
    if (updates.folderId !== undefined) { fields.push('folder_id = ?'); params.push(updates.folderId); }
    
    if (fields.length === 0) return;
    
    fields.push('updated_at = ?');
    params.push(now);
    params.push(id);
    
    await db.runAsync(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  async deleteDocument(id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM documents WHERE id = ?', [id]);
  }

  async getAllFolders(parentId?: string): Promise<FolderWithCount[]> {
    const db = await this.getDb();
    let query = `
      SELECT f.*,
        (SELECT COUNT(*) FROM documents WHERE folder_id = f.id) as document_count,
        (SELECT COUNT(*) FROM folders WHERE parent_id = f.id) as subfolder_count
      FROM folders f
    `;
    const params: any[] = [];
    
    if (parentId) {
      query += ' WHERE f.parent_id = ?';
      params.push(parentId);
    } else {
      query += ' WHERE f.parent_id IS NULL';
    }
    
    query += ' ORDER BY f.name ASC';
    
    const rows = await db.getAllAsync(query, params);
    return rows.map((row: any) => ({
      ...rowToFolder(row),
      documentCount: row.document_count,
      subfolderCount: row.subfolder_count,
    }));
  }

  async getFolderById(id: string): Promise<Folder | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync('SELECT * FROM folders WHERE id = ?', [id]);
    return row ? rowToFolder(row) : null;
  }

  async createFolder(folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Folder> {
    const db = await this.getDb();
    const now = Date.now();
    const id = uuidv4();
    
    await db.runAsync(`
      INSERT INTO folders (id, name, parent_id, created_at, updated_at, color, icon)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, folder.name, folder.parentId || null, now, now, folder.color || null, folder.icon || null]);
    
    return { ...folder, id, createdAt: new Date(now), updatedAt: new Date(now) };
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<void> {
    const db = await this.getDb();
    const now = Date.now();
    const fields: string[] = [];
    const params: any[] = [];
    
    if (updates.name !== undefined) { fields.push('name = ?'); params.push(updates.name); }
    if (updates.parentId !== undefined) { fields.push('parent_id = ?'); params.push(updates.parentId); }
    if (updates.color !== undefined) { fields.push('color = ?'); params.push(updates.color); }
    if (updates.icon !== undefined) { fields.push('icon = ?'); params.push(updates.icon); }
    
    if (fields.length === 0) return;
    
    fields.push('updated_at = ?');
    params.push(now);
    params.push(id);
    
    await db.runAsync(`UPDATE folders SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  async deleteFolder(id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM folders WHERE id = ?', [id]);
  }

  async getAllTags(): Promise<Tag[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync('SELECT * FROM tags ORDER BY name ASC');
    return rows.map(rowToTag);
  }

  async createTag(tag: Omit<Tag, 'id' | 'createdAt'>): Promise<Tag> {
    const db = await this.getDb();
    const now = Date.now();
    const id = uuidv4();
    
    await db.runAsync(
      'INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)',
      [id, tag.name, tag.color, now]
    );
    
    return { ...tag, id, createdAt: new Date(now) };
  }

  async addTagToDocument(documentId: string, tagId: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'INSERT OR IGNORE INTO document_tags (document_id, tag_id) VALUES (?, ?)',
      [documentId, tagId]
    );
  }

  async removeTagFromDocument(documentId: string, tagId: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'DELETE FROM document_tags WHERE document_id = ? AND tag_id = ?',
      [documentId, tagId]
    );
  }

  async getDocumentTags(documentId: string): Promise<Tag[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync(`
      SELECT t.* FROM tags t
      JOIN document_tags dt ON t.id = dt.tag_id
      WHERE dt.document_id = ?
    `, [documentId]);
    return rows.map(rowToTag);
  }

  async searchDocuments(query: string, folderId?: string): Promise<DocumentWithTags[]> {
    const db = await this.getDb();
    let sql = `
      SELECT d.*, 
        GROUP_CONCAT(t.id) as tag_ids,
        GROUP_CONCAT(t.name) as tag_names,
        GROUP_CONCAT(t.color) as tag_colors
      FROM documents d
      LEFT JOIN document_tags dt ON d.id = dt.document_id
      LEFT JOIN tags t ON dt.tag_id = t.id
      WHERE d.name LIKE ?
    `;
    const params = [`%${query}%`];
    
    if (folderId) {
      sql += ' AND d.folder_id = ?';
      params.push(folderId);
    } else {
      sql += ' AND d.folder_id IS NULL';
    }
    
    sql += ' GROUP BY d.id ORDER BY d.created_at DESC';
    
    const rows = await db.getAllAsync(sql, params);
    return rows.map((row: any) => ({
      ...rowToDocument(row),
      tags: row.tag_ids ? row.tag_ids.split(',').map((id: string, i: number) => ({
        id,
        name: row.tag_names.split(',')[i],
        color: row.tag_colors.split(',')[i],
        createdAt: new Date(),
      })) : [],
    }));
  }

  detectDocumentType(uri: string, mimeType?: string): Document['type'] {
    if (mimeType) {
      if (mimeType === 'application/pdf') return DOCUMENT_TYPES.PDF;
      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return DOCUMENT_TYPES.DOCX;
      if (mimeType.startsWith('text/')) return DOCUMENT_TYPES.TXT;
      if (mimeType.startsWith('image/')) return DOCUMENT_TYPES.IMAGE;
    }
    
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return DOCUMENT_TYPES.PDF;
      case 'docx': return DOCUMENT_TYPES.DOCX;
      case 'txt': return DOCUMENT_TYPES.TXT;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return DOCUMENT_TYPES.IMAGE;
      default: return DOCUMENT_TYPES.OTHER;
    }
  }

  async copyFileToAppDirectory(uri: string, fileName: string): Promise<string> {
    const appDir = FileSystem.documentDirectory!;
    const destUri = `${appDir}${fileName}`;
    await FileSystem.copyAsync({ from: uri, to: destUri });
    return destUri;
  }

  async deleteFile(uri: string): Promise<void> {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri);
    }
  }
}

export const documentService = new DocumentService();