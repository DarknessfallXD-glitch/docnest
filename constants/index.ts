export const APP_NAME = 'DocNest';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  SETTINGS: '@docnest:settings',
  RECENT_DOCUMENTS: '@docnest:recent',
  LAST_OPENED_FOLDER: '@docnest:lastFolder',
} as const;

export const DOCUMENT_TYPES = {
  PDF: 'pdf',
  DOCX: 'docx',
  TXT: 'txt',
  IMAGE: 'image',
  OTHER: 'other',
} as const;

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const DEFAULT_FOLDER_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#22C55E', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

export const TAG_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#22C55E', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#6366F1', // indigo
];

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'size', label: 'Size' },
  { value: 'type', label: 'Type' },
] as const;

export const SORT_ORDERS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
] as const;