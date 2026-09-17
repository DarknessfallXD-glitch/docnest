export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'image' | 'other';
  size: number;
  uri: string;
  thumbnailUri?: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isFavorite: boolean;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  icon?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultSort: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  showThumbnails: boolean;
  autoBackup: boolean;
}

export interface DatabaseSchema {
  documents: Document;
  folders: Folder;
  tags: Tag;
  settings: AppSettings;
  documentTags: { documentId: string; tagId: string };
}