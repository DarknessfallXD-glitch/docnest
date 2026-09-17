'use client';

import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header, Button, Modal, ConfirmDialog } from '@/components';
import { useDocuments, useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/hooks/useTheme';
import { Document } from '@/types';
import React, { useEffect, useState } from 'react';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function DocumentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const {
    documents,
    tags,
    refreshAll,
    toggleFavorite,
    deleteDocument,
    moveDocument,
    addTagToDocument,
    removeTagFromDocument,
  } = useDocuments();

  const { currentFolderId, setCurrentFolderId } = useAppStore();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      if (id) {
        const doc = documents.find(d => d.id === id);
        if (doc) {
          setDocument(doc);
        } else {
          await refreshAll();
          const found = documents.find(d => d.id === id);
          setDocument(found || null);
        }
      }
      setIsLoading(false);
    };
    loadDocument();
  }, [id, documents, refreshAll]);

  const handleShare = async () => {
    if (!document) return;
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device');
        return;
      }
      await Sharing.shareAsync(document.uri, {
        mimeType: getMimeType(document.type),
        dialogTitle: `Share ${document.name}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const handleOpen = () => {
    if (!document) return;
    // Open with appropriate viewer based on type
    if (document.type === 'pdf') {
      router.push(`/viewer/pdf/${document.id}`);
    } else if (document.type === 'docx') {
      router.push(`/viewer/docx/${document.id}`);
    } else if (document.type === 'txt') {
      router.push(`/viewer/txt/${document.id}`);
    } else if (document.type === 'image') {
      router.push(`/viewer/image/${document.id}`);
    }
  };

  const handleRename = async (newName: string) => {
    if (!document) return;
    const { renameDocument } = useDocuments();
    await renameDocument(document.id, newName);
    setShowRenameDialog(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Feather name="loader" size={32} color={themeColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!document) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Document" leftAction={{ icon: 'chevron-left', onPress: () => router.back() }} />
        <View style={styles.notFound}>
          <Feather name="alert-triangle" size={48} color={themeColors.onSurfaceVariant} />
          <Text style={styles.notFoundText}>Document not found</Text>
          <Button variant="primary" onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf': return 'file-text';
      case 'docx': return 'file';
      case 'txt': return 'file-text';
      case 'image': return 'image';
      default: return 'file';
    }
  };

  const getFileColor = (type: Document['type']) => {
    switch (type) {
      case 'pdf': return '#EF4444';
      case 'docx': return '#3B82F6';
      case 'txt': return '#64748B';
      case 'image': return '#8B5CF6';
      default: return '#94A3B8';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header
        title={document.name}
        leftAction={{ icon: 'chevron-left', onPress: () => router.back() }}
        rightActions={[
          { 
            icon: document.isFavorite ? 'star' : 'star',
            onPress: () => toggleFavorite(document.id),
            accessibilityLabel: document.isFavorite ? 'Remove from favorites' : 'Add to favorites',
          },
          { 
            icon: 'share-2', 
            onPress: handleShare,
            accessibilityLabel: 'Share document'
          },
          { 
            icon: 'more-vertical', 
            onPress: () => {},
            accessibilityLabel: 'More options'
          },
        ]}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.documentHeader}>
          <View style={[styles.fileIcon, { backgroundColor: getFileColor(document.type) + '15' }]}>
            <Feather name={getFileIcon(document.type)} size={40} color={getFileColor(document.type)} />
          </View>
          
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>{document.name}</Text>
            <View style={styles.documentMeta}>
              <Text style={styles.metaItem}>
                <Feather name="file" size={14} color={themeColors.onSurfaceVariant} style={{ marginRight: 4 }} />
                {formatSize(document.size)}
              </Text>
              <Text style={styles.metaItem}>
                <Feather name="calendar" size={14} color={themeColors.onSurfaceVariant} style={{ marginRight: 4 }} />
                {new Date(document.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.metaItem}>
                <Feather name="clock" size={14} color={themeColors.onSurfaceVariant} style={{ marginRight: 4 }} />
                Modified {new Date(document.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Button variant="primary" leftIcon="play" onPress={handleOpen} style={styles.actionButton}>
            Open Document
          </Button>
          <Button variant="secondary" leftIcon="download" onPress={handleShare} style={styles.actionButton}>
            Share
          </Button>
        </View>

        {document.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {document.tags.map((tag) => (
                <View key={tag.id} style={[styles.tag, { backgroundColor: tag.color + '20', borderColor: tag.color }]}>
                  <Text style={{ color: tag.color }}>{tag.name}</Text>
                  <TouchableOpacity onPress={() => removeTagFromDocument(document.id, tag.id)}>
                    <Feather name="x" size={12} color={tag.color} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => setShowAddTagModal(true)} style={styles.addTagButton}>
                <Feather name="plus" size={14} color={themeColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Tags</Text>
          <View style={styles.availableTags}>
            {tags
              .filter(tag => !document.tags.some(t => t.id === tag.id))
              .slice(0, 10)
              .map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  onPress={() => addTagToDocument(document.id, tag.id)}
                  style={[styles.availableTag, { borderColor: tag.color }]}
                >
                  <Text style={{ color: tag.color }}>{tag.name}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Folder</Text>
          <TouchableOpacity style={styles.folderRow} onPress={() => setShowMoveModal(true)}>
            <View style={styles.folderInfo}>
              <Feather name="folder" size={20} color={themeColors.primary} />
              <Text style={styles.folderName}>
                {document.folderId 
                  ? documents.find(d => d.id === document.folderId)?.name || 'Unknown Folder'
                  : 'Root'}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={themeColors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          
          <TouchableOpacity onPress={() => setShowRenameDialog(true)} style={styles.dangerItem}>
            <View style={styles.dangerIcon}>
              <Feather name="edit" size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text style={styles.dangerLabel}>Rename</Text>
              <Text style={styles.dangerDescription}>Change the document name</Text>
            </View>
            <Feather name="chevron-right" size={20} color={themeColors.onSurfaceVariant} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={styles.dangerItem}>
            <View style={styles.dangerIconDanger}>
              <Feather name="trash-2" size={20} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.dangerLabelDanger}>Delete Document</Text>
              <Text style={styles.dangerDescription}>Permanently delete this document</Text>
            </View>
            <Feather name="chevron-right" size={20} color={themeColors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Document"
        message={`Are you sure you want to delete "${document.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          await deleteDocument(document.id);
          setShowDeleteConfirm(false);
          router.back();
        }}
        destructive
      />

      <Modal
        visible={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title="Move to Folder"
        size="md"
      >
        <View style={styles.folderList}>
          <TouchableOpacity
            onPress={() => { moveDocument(document.id, null); setShowMoveModal(false); }}
            style={[styles.folderItem, document.folderId === null && styles.folderItemSelected]}
          >
            <Feather name="home" size={22} color={document.folderId === null ? themeColors.onPrimaryContainer : themeColors.onSurface} />
            <Text style={[styles.folderItemText, document.folderId === null ? { color: themeColors.onPrimaryContainer, fontWeight: '600' } : { color: themeColors.onSurface }]}>
              Root
            </Text>
            {document.folderId === null && <Feather name="check" size={20} color={themeColors.onPrimaryContainer} />}
          </TouchableOpacity>
          {documents.filter(d => d.folderId === currentFolderId).map((folder) => (
            <TouchableOpacity
              key={folder.id}
              onPress={() => { moveDocument(document.id, folder.id); setShowMoveModal(false); }}
              style={styles.folderItem}
            >
              <Feather name="folder" size={22} color={themeColors.primary} />
              <Text style={styles.folderItemText}>{folder.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal
        visible={showAddTagModal}
        onClose={() => setShowAddTagModal(false)}
        title="Add Tags"
        size="md"
      >
        <Text style={styles.modalText}>Select tags to add to this document</Text>
        <View style={styles.tagSelection}>
          {tags
            .filter(tag => !document.tags.some(t => t.id === tag.id))
            .map((tag) => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => { addTagToDocument(document.id, tag.id); setShowAddTagModal(false); }}
                style={[styles.tagSelectionItem, { borderColor: tag.color }]}
              >
                <View style={[styles.tagColorDot, { backgroundColor: tag.color }]} />
                <Text style={{ color: tag.color }}>{tag.name}</Text>
              </TouchableOpacity>
            ))}
        </View>
      </Modal>

      <Modal
        visible={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        title="Rename Document"
        label="New Name"
        placeholder="Enter new name"
        initialValue={document.name}
        onConfirm={handleRename}
        confirmLabel="Save"
        validation={(value) => value.trim() ? null : 'Name is required'}
        autoFocus
      />
    </SafeAreaView>
  );
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.light.onSurfaceVariant,
    textAlign: 'center',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 20,
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.outlineVariant,
    marginBottom: 16,
  },
  fileIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    minWidth: 0,
  },
  documentName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: colors.light.onSurface,
    marginBottom: 8,
  },
  documentMeta: {
    gap: 4,
  },
  metaItem: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.outlineVariant,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.light.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  addTagButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.light.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availableTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  folderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  folderName: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurface,
  },
  dangerZone: {
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF2F2',
    overflow: 'hidden',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.light.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerIconDanger: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerLabel: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: colors.light.onSurface,
  },
  dangerLabelDanger: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
  },
  dangerDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.outlineVariant,
    marginHorizontal: 20,
  },
  folderList: {
    gap: 4,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
  },
  folderItemSelected: {
    backgroundColor: colors.light.primaryContainer,
  },
  folderItemText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  modalText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
    marginBottom: 16,
  },
  tagSelection: {
    maxHeight: 300,
  },
  tagSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  tagColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});