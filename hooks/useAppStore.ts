import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppSettings, Document, Folder, Tag } from '@/types';
import { settingsService } from '@/lib/settingsService';
import { documentService } from '@/lib/documentService';

interface AppState {
  settings: AppSettings;
  setSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  
  currentFolderId: string | null;
  setCurrentFolderId: (folderId: string | null) => void;
  
  selectedDocuments: Set<string>;
  toggleDocumentSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: (documents: Document[]) => void;
  
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  
  sortBy: AppSettings['defaultSort'];
  sortOrder: AppSettings['sortOrder'];
  setSort: (by: AppSettings['defaultSort'], order?: AppSettings['sortOrder']) => Promise<void>;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: {
        theme: 'system',
        defaultSort: 'date',
        sortOrder: 'desc',
        showThumbnails: true,
        autoBackup: false,
      },
      
      setSettings: async (newSettings) => {
        const updated = await settingsService.updateSettings(newSettings);
        set({ settings: updated });
      },
      
      loadSettings: async () => {
        const settings = await settingsService.getSettings();
        set({ 
          settings,
          sortBy: settings.defaultSort,
          sortOrder: settings.sortOrder,
        });
      },
      
      currentFolderId: null,
      setCurrentFolderId: (folderId) => set({ currentFolderId: folderId }),
      
      selectedDocuments: new Set(),
      toggleDocumentSelection: (id) => set((state) => {
        const newSelection = new Set(state.selectedDocuments);
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
        return { selectedDocuments: newSelection };
      }),
      clearSelection: () => set({ selectedDocuments: new Set() }),
      selectAll: (documents) => set({ 
        selectedDocuments: new Set(documents.map(d => d.id)) 
      }),
      
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
      
      sortBy: 'date',
      sortOrder: 'desc',
      setSort: async (by, order) => {
        await settingsService.updateSettings({ defaultSort: by, sortOrder: order || get().sortOrder });
        set({ sortBy: by, sortOrder: order || get().sortOrder });
      },
      
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'docnest-app-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (state) => ({
        settings: state.settings,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);

interface DocumentState {
  documents: Document[];
  folders: Folder[];
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  
  loadDocuments: (folderId?: string) => Promise<void>;
  loadFolders: (parentId?: string) => Promise<void>;
  loadTags: () => Promise<void>;
  refreshAll: (folderId?: string) => Promise<void>;
  
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  removeFolder: (id: string) => void;
  
  addTag: (tag: Tag) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  folders: [],
  tags: [],
  isLoading: false,
  error: null,
  
  loadDocuments: async (folderId) => {
    set({ isLoading: true, error: null });
    try {
      const documents = await documentService.getAllDocuments(folderId);
      set({ documents, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load documents', isLoading: false });
    }
  },
  
  loadFolders: async (parentId) => {
    try {
      const folders = await documentService.getAllFolders(parentId);
      set({ folders });
    } catch (error) {
      set({ error: 'Failed to load folders' });
    }
  },
  
  loadTags: async () => {
    try {
      const tags = await documentService.getAllTags();
      set({ tags });
    } catch (error) {
      set({ error: 'Failed to load tags' });
    }
  },
  
  refreshAll: async (folderId) => {
    await Promise.all([
      get().loadDocuments(folderId),
      get().loadFolders(),
      get().loadTags(),
    ]);
  },
  
  addDocument: (document) => set((state) => ({ 
    documents: [document, ...state.documents] 
  })),
  
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map(d => d.id === id ? { ...d, ...updates } : d)
  })),
  
  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter(d => d.id !== id)
  })),
  
  addFolder: (folder) => set((state) => ({ 
    folders: [...state.folders, folder] 
  })),
  
  updateFolder: (id, updates) => set((state) => ({
    folders: state.folders.map(f => f.id === id ? { ...f, ...updates } : f)
  })),
  
  removeFolder: (id) => set((state) => ({
    folders: state.folders.filter(f => f.id !== id)
  })),
  
  addTag: (tag) => set((state) => ({ 
    tags: [...state.tags, tag] 
  })),
}));