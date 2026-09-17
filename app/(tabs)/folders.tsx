'use client';

import { View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header, SearchBar, FolderCard, EmptyState, Button, Modal, InputDialog } from '@/components';
import { useDocuments, useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/hooks/useTheme';
import { Folder } from '@/types';
import React, { useCallback, useState } from 'react';

export default function FoldersScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const {
    folders,
    isLoading,
    currentFolderId,
    setCurrentFolderId,
    refreshAll,
    createFolder,
    renameFolder,
    deleteFolder,
    searchQuery,
    setSearchQuery,
    selectedDocuments,
    toggleDocumentSelection,
    clearSelection,
  } = useDocuments();

  const { settings } = useAppStore();
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState<{ id: string; name: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const currentFolder = folders.find(f => f.id === currentFolderId);
  const isRoot = !currentFolderId;
  
  const childFolders = folders.filter(f => f.parentId === currentFolderId);
  const sortedFolders = [...childFolders].sort((a, b) => a.name.localeCompare(b.name));

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, [setSearchQuery]);

  const handleCreateFolder = async (name: string) => {
    await createFolder(name, currentFolderId);
    setShowCreateFolderDialog(false);
  };

  const handleRename = async (id: string, newName: string) => {
    await renameFolder(id, newName);
    setShowRenameDialog(null);
  };

  const handleDelete = async (id: string) => {
    await deleteFolder(id);
    setShowDeleteConfirm(null);
  };

  const renderFolder = ({ item }: { item: Folder & { documentCount: number; subfolderCount: number } }) => (
    <FolderCard
      folder={item}
      documentCount={item.documentCount}
      subfolderCount={item.subfolderCount}
      onPress={() => setCurrentFolderId(item.id)}
      onLongPress={() => toggleDocumentSelection(item.id)}
      selected={selectedDocuments.has(item.id)}
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
        title={currentFolder?.name || 'Folders'}
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
        ]}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search folders..."
      />

      {selectedDocuments.size > 0 && (
        <View style={[styles.selectionBar, { backgroundColor: themeColors.primaryContainer }]}>
          <Text style={[styles.selectionText, { color: themeColors.onPrimaryContainer }]}>
            {selectedDocuments.size} selected
          </Text>
          <View style={styles.selectionActions}>
            <Button variant="danger" size="sm" onPress={() => {
              // Delete selected folders
              clearSelection();
            }} leftIcon="trash-2">
              Delete
            </Button>
            <Button variant="ghost" size="sm" onPress={clearSelection} rightIcon="x">
              Clear
            </Button>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {sortedFolders.length === 0 ? (
          <EmptyState
            icon="folder-plus"
            title={isRoot ? 'No folders yet' : 'This folder is empty'}
            description={isRoot 
              ? 'Create your first folder to organize documents'
              : 'Create subfolders to further organize your files'}
            actionLabel="Create Folder"
            onActionPress={() => setShowCreateFolderDialog(true)}
          />
        ) : (
          <FlatList
            data={sortedFolders}
            renderItem={renderFolder}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => refreshAll()}
                colors={['#0EA5E9']}
              />
            }
          />
        )}
      </View>

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
        title="Rename Folder"
        label="New Name"
        placeholder="Enter new name"
        initialValue={showRenameDialog?.name || ''}
        onConfirm={(value) => showRenameDialog && handleRename(showRenameDialog.id, value)}
        confirmLabel="Save"
        validation={(value) => value.trim() ? null : 'Name is required'}
        autoFocus
      />

      <Modal
        visible={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Folder"
        size="sm"
      >
        <Text style={styles.modalMessage}>
          Are you sure you want to delete "{showDeleteConfirm?.name}"? 
          All subfolders and documents will be moved to the parent folder.
        </Text>
        <View style={styles.buttonRow}>
          <Button variant="ghost" size="md" onPress={() => setShowDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onPress={() => showDeleteConfirm && handleDelete(showDeleteConfirm.id)}>
            Delete
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

import { RefreshControl } from 'react-native';

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
  listContent: {
    paddingBottom: 20,
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
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
});