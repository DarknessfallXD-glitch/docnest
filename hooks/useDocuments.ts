import { useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useDocumentStore, useAppStore } from './useAppStore';
import { documentService } from '@/lib/documentService';
import { Document, Folder } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { SUPPORTED_MIME_TYPES, MAX_FILE_SIZE } from '@/constants';

export function useDocuments() {
  const { 
    documents, 
    folders, 
    tags, 
    isLoading, 
    error,
    loadDocuments, 
    loadFolders, 
    loadTags,
    refreshAll,
    addDocument,
    updateDocument,
    removeDocument,
    addFolder,
    updateFolder,
    removeFolder,
    addTag,
  } = useDocumentStore();
  
  const { currentFolderId, setCurrentFolderId, setIsLoading } = useAppStore();

  const importDocument = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: SUPPORTED_MIME_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets[0]) {
        setIsLoading(false);
        return null;
      }

      const asset = result.assets[0];
      
      if (asset.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 100MB limit');
      }

      const fileName = `${uuidv4()}_${asset.name}`;
      const appUri = await documentService.copyFileToAppDirectory(asset.uri, fileName);
      const type = documentService.detectDocumentType(asset.uri, asset.mimeType);
      
      const document = await documentService.createDocument({
        name: asset.name,
        type,
        size: asset.size,
        uri: appUri,
        isFavorite: false,
        folderId: currentFolderId,
      });
      
      addDocument(document);
      setIsLoading(false);
      return document;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [currentFolderId, addDocument, setIsLoading]);

  const shareDocument = useCallback(async (document: Document) => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        throw new Error('Sharing is not available on this device');
      }
      await Sharing.shareAsync(document.uri, {
        mimeType: getMimeType(document.type),
        dialogTitle: `Share ${document.name}`,
      });
    } catch (error) {
      throw error;
    }
  }, []);

  const renameDocument = useCallback(async (id: string, newName: string) => {
    await documentService.updateDocument(id, { name: newName });
    updateDocument(id, { name: newName, updatedAt: new Date() });
  }, [updateDocument]);

  const deleteDocument = useCallback(async (id: string) => {
    const document = documents.find(d => d.id === id);
    if (document) {
      await documentService.deleteFile(document.uri);
      if (document.thumbnailUri) {
        await documentService.deleteFile(document.thumbnailUri);
      }
      await documentService.deleteDocument(id);
      removeDocument(id);
    }
  }, [documents, removeDocument]);

  const toggleFavorite = useCallback(async (id: string) => {
    const document = documents.find(d => d.id === id);
    if (document) {
      const newFavorite = !document.isFavorite;
      await documentService.updateDocument(id, { isFavorite: newFavorite });
      updateDocument(id, { isFavorite: newFavorite, updatedAt: new Date() });
    }
  }, [documents, updateDocument]);

  const moveDocument = useCallback(async (id: string, folderId: string | null) => {
    await documentService.updateDocument(id, { folderId });
    updateDocument(id, { folderId, updatedAt: new Date() });
  }, [updateDocument]);

  const createFolder = useCallback(async (name: string, parentId?: string, color?: string) => {
    const folder = await documentService.createFolder({
      name,
      parentId: parentId || currentFolderId,
      color,
    });
    addFolder(folder);
    return folder;
  }, [currentFolderId, addFolder]);

  const renameFolder = useCallback(async (id: string, newName: string) => {
    await documentService.updateFolder(id, { name: newName });
    updateFolder(id, { name: newName, updatedAt: new Date() });
  }, [updateFolder]);

  const deleteFolder = useCallback(async (id: string) => {
    await documentService.deleteFolder(id);
    removeFolder(id);
  }, [removeFolder]);

  const createTag = useCallback(async (name: string, color: string) => {
    const tag = await documentService.createTag({ name, color });
    addTag(tag);
    return tag;
  }, [addTag]);

  const addTagToDocument = useCallback(async (documentId: string, tagId: string) => {
    await documentService.addTagToDocument(documentId, tagId);
    const document = documents.find(d => d.id === documentId);
    const tag = tags.find(t => t.id === tagId);
    if (document && tag) {
      updateDocument(documentId, { 
        tags: [...document.tags, tag],
        updatedAt: new Date() 
      });
    }
  }, [documents, tags, updateDocument]);

  const removeTagFromDocument = useCallback(async (documentId: string, tagId: string) => {
    await documentService.removeTagFromDocument(documentId, tagId);
    const document = documents.find(d => d.id === documentId);
    if (document) {
      updateDocument(documentId, { 
        tags: document.tags.filter(t => t.id !== tagId),
        updatedAt: new Date() 
      });
    }
  }, [documents, updateDocument]);

  const searchDocuments = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadDocuments(currentFolderId);
      return;
    }
    setIsLoading(true);
    try {
      const results = await documentService.searchDocuments(query, currentFolderId);
      useDocumentStore.setState({ documents: results, isLoading: false });
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [currentFolderId, loadDocuments, setIsLoading]);

  return {
    documents,
    folders,
    tags,
    isLoading,
    error,
    currentFolderId,
    setCurrentFolderId,
    refreshAll,
    importDocument,
    shareDocument,
    renameDocument,
    deleteDocument,
    toggleFavorite,
    moveDocument,
    createFolder,
    renameFolder,
    deleteFolder,
    createTag,
    addTagToDocument,
    removeTagFromDocument,
    searchDocuments,
    loadDocuments,
    loadFolders,
    loadTags,
  };
}

function getMimeType(type: Document['type']): string {
  switch (type) {
    case 'pdf': return 'application/pdf';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt': return 'text/plain';
    case 'image': return 'image/*';
    default: return 'application/octet-stream';
  }
}