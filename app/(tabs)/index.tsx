'use client';

import { View, FlatList, StyleSheet, RefreshControl, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header, SearchBar, DocumentCard, EmptyState, Button, Modal, InputDialog } from '@/components';
import { useDocuments, useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/hooks/useTheme';
import { Document } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const {
    documents,
    folders,
    isLoading,
    currentFolderId,
    setCurrentFolderId,
    refreshAll,
    importDocument,
    searchDocuments,
    searchQuery,
    setSearchQuery,
    toggleFavorite,
    deleteDocument,
    moveDocument,
    selectedDocuments,
    toggleDocumentSelection,
    clearSelection,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    setSort,
  } = useDocuments();

  const { settings } = useAppStore();
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState<{ id: string; name: string } | null>(null);

  const currentFolder = folders.find(f => f.id === currentFolderId);
  const isRoot = !currentFolderId;

  const filteredDocuments = documents.filter(doc => {
    if (searchQuery.trim() === '') return true;
    return doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = b.createdAt.getTime() - a.createdAt.getTime();
        break;
      case 'size':
        comparison = b.size - a.size;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      searchDocuments(text);
    } else {
      refreshAll(currentFolderId);
    }
  }, [setSearchQuery, searchDocuments, refreshAll, currentFolderId]);

  const handleImport = async () => {
    try {
      await importDocument();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedDocuments) {
      await deleteDocument(id);
    }
    clearSelection();
  };

  const handleMoveSelected = async () => {
    // Navigate to folder picker
  };

  const handleCreateFolder = async (name: string) => {
    const folder = await useDocuments().createFolder(name, currentFolderId);
    if (folder) {
      setCurrentFolderId(folder.id);
    }
    setShowCreateFolderDialog(false);
  };

  const handleRename = async (id: string, newName: string) => {
    const document = documents.find(d => d.id === id);
    if (document && document.type !== 'folder') {
      await useDocuments().renameDocument(id, newName);
    } else {
      await useDocuments().renameFolder(id, newName);
    }
    setShowRenameDialog(null);
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <DocumentCard
      document={item}
      onPress={() => router.push(`/document/${item.id}`)}
      onLongPress={() => toggleDocumentSelection(item.id)}
      selected={selectedDocuments.has(item.id)}
      onSelect={() => toggleDocumentSelection(item.id)}
      showThumbnail={settings.showThumbnails}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon={isRoot ? 'folder-plus' : 'file-text'}
      title={isRoot ? 'No documents yet' : 'This folder is empty'}
      description={isRoot 
        ? 'Import your first document to get started'
        : 'Add files or create subfolders to organize your documents'}
      actionLabel="Import Document"
      onActionPress={handleImport}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Feather name="loader" size={32} color={themeColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header
        title={currentFolder?.name || 'Documents'}
        leftAction={!isRoot ? { icon: 'chevron-left', onPress: () => {
          const parent = folders.find(f => f.id === currentFolder?.parentId);
          setCurrentFolderId(parent?.id || null);
        }} : null}
        rightActions={[
          { 
            icon: 'folder-plus', 
            onPress: () => setShowCreateFolderDialog(true),
            accessibilityLabel: 'Create folder'
          },
          { 
            icon: 'upload', 
            onPress: handleImport,
            accessibilityLabel: 'Import document'
          },
          { 
            icon: selectedDocuments.size > 0 ? 'trash-2' : 'grid',
            onPress: selectedDocuments.size > 0 ? handleDeleteSelected : () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
            accessibilityLabel: selectedDocuments.size > 0 ? 'Delete selected' : 'Toggle view',
            badge: selectedDocuments.size > 0 ? selectedDocuments.size : undefined,
          },
        ]}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search documents..."
        showFilter={true}
        onFilterPress={() => setShowSortModal(true)}
      />

      {selectedDocuments.size > 0 && (
        <View style={[styles.selectionBar, { backgroundColor: themeColors.primaryContainer }]}>
          <Text style={[styles.selectionText, { color: themeColors.onPrimaryContainer }]}>
            {selectedDocuments.size} selected
          </Text>
          <View style={styles.selectionActions}>
            <Button variant="ghost" size="sm" onPress={handleMoveSelected} leftIcon="move">
              Move
            </Button>
            <Button variant="danger" size="sm" onPress={handleDeleteSelected} leftIcon="trash-2">
              Delete
            </Button>
            <Button variant="ghost" size="sm" onPress={clearSelection} rightIcon="x">
              Clear
            </Button>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {currentFolder && !isRoot && (
          <View style={styles.folderHeader}>
            <View style={[styles.folderInfo, { backgroundColor: (currentFolder.color || themeColors.primary) + '15' }]}>
              <Feather name={currentFolder.icon || 'folder'} size={24} color={currentFolder.color || themeColors.primary} />
            </View>
            <View style={styles.folderStats}>
              <Text style={[styles.folderStat, { color: themeColors.onSurface }]}>
                {folders.filter(f => f.parentId === currentFolderId).length} folders
              </Text>
              <Text style={[styles.folderStat, { color: themeColors.onSurfaceVariant }]}>
                {documents.filter(d => d.folderId === currentFolderId).length} documents
              </Text>
            </View>
          </View>
        )}

        {sortedDocuments.length === 0 ? (
          renderEmpty()
        ) : (
          viewMode === 'grid' ? (
            <FlatList
              data={sortedDocuments}
              renderItem={renderDocument}
              keyExtractor={item => item.id}
              numColumns={2}
              contentContainerStyle={styles.gridContent}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => refreshAll(currentFolderId)}
                  colors={['#0EA5E9']}
                />
              }
            />
          ) : (
            <FlatList
              data={sortedDocuments}
              renderItem={renderDocument}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => refreshAll(currentFolderId)}
                  colors={['#0EA5E9']}
                />
              }
            />
          )
        )}
      </View>

      <Modal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        title="Sort Documents"
        size="sm"
      >
        <View style={styles.sortOptions}>
          {['name', 'date', 'size', 'type'].map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setSort(option as any)}
              style={[
                styles.sortOption,
                sortBy === option && { backgroundColor: themeColors.primaryContainer },
              ]}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option ? { color: themeColors.onPrimaryContainer, fontWeight: '600' } : { color: themeColors.onSurface }
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
              {sortBy === option && (
                <Feather 
                  name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
                  size={18} 
                  color={sortBy === option ? themeColors.onPrimaryContainer : themeColors.onSurfaceVariant}
                />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            style={styles.sortOption}
          >
            <Text style={styles.sortOptionText}>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</Text>
            <Feather name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size={18} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </Modal>

      <InputDialog
        visible={showCreateFolderDialog}
        onClose={() => setShowCreateFolderDialog(false)}
        title="Create Folder"
        label="Folder Name"
        placeholder="Enter folder name"
        onConfirm={handleCreateFolder}
        confirmLabel="Create"
        validation={(value) => value.trim() ? null : 'Folder name is required'}
        autoFocus
      />

      <InputDialog
        visible={!!showRenameDialog}
        onClose={() => setShowRenameDialog(null)}
        title="Rename"
        label="New Name"
        placeholder="Enter new name"
        initialValue={showRenameDialog?.name || ''}
        onConfirm={(value) => showRenameDialog && handleRename(showRenameDialog.id, value)}
        confirmLabel="Save"
        validation={(value) => value.trim() ? null : 'Name is required'}
        autoFocus
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridContent: {
    paddingHorizontal: 8,
    gap: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.outlineVariant,
  },
  folderInfo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderStats: {
    flexDirection: 'row',
    gap: 16,
  },
  folderStat: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 8,
    borderRadius: 12,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOptions: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sortOptionText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
});