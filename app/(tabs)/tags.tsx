'use client';

import { View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header, SearchBar, EmptyState, Button, Modal, InputDialog } from '@/components';
import { useDocuments, useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/hooks/useTheme';
import { Tag } from '@/types';
import React, { useCallback, useState } from 'react';

interface TagItemProps {
  tag: Tag;
  documentCount: number;
  onPress: () => void;
}

function TagItem({ tag, documentCount, onPress }: TagItemProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <TouchableOpacity onPress={onPress} style={styles.tagCard} activeOpacity={0.9}>
      <View style={[styles.tagColor, { backgroundColor: tag.color }]} />
      <View style={styles.tagInfo}>
        <Text style={styles.tagName}>{tag.name}</Text>
        <Text style={styles.tagCount}>{documentCount} documents</Text>
      </View>
      <Feather name="chevron-right" size={20} color={themeColors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}

export default function TagsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const {
    tags,
    isLoading,
    refreshAll,
    createTag,
    searchQuery,
    setSearchQuery,
    selectedDocuments,
    clearSelection,
  } = useDocuments();

  const { settings } = useAppStore();
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState<{ id: string; name: string; color: string } | null>(null);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, [setSearchQuery]);

  const handleCreateTag = async (name: string) => {
    await createTag(name, selectedColor);
    setShowCreateTagDialog(false);
    setSelectedColor('#3B82F6');
  };

  const COLORS = [
    '#3B82F6', '#EF4444', '#22C55E', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
    '#84CC16', '#6366F1',
  ];

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
        title="Tags"
        rightActions={[
          { 
            icon: 'plus', 
            onPress: () => setShowCreateTagDialog(true),
            accessibilityLabel: 'Create tag'
          },
        ]}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search tags..."
      />

      <View style={styles.content}>
        {tags.length === 0 ? (
          <EmptyState
            icon="tag"
            title="No tags yet"
            description="Create tags to categorize and find documents easily"
            actionLabel="Create Tag"
            onActionPress={() => setShowCreateTagDialog(true)}
          />
        ) : (
          <FlatList
            data={tags}
            renderItem={({ item }) => (
              <TagItem
                tag={item}
                documentCount={Math.floor(Math.random() * 20)}
                onPress={() => router.push(`/tags/${item.id}`)}
              />
            )}
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
        visible={showCreateTagDialog}
        onClose={() => setShowCreateTagDialog(false)}
        title="Create Tag"
        label="Tag Name"
        placeholder="Enter tag name"
        onConfirm={handleCreateTag}
        confirmLabel="Create"
        validation={(value) => value.trim() ? null : 'Tag name is required'}
        autoFocus
      />

      <Modal
        visible={showCreateTagDialog}
        onClose={() => setShowCreateTagDialog(false)}
        title="Create Tag"
        size="md"
      >
        <Text style={styles.colorLabel}>Choose Color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.colorOption,
                selectedColor === color && styles.colorOptionSelected,
              ]}
            >
              <View style={[styles.colorCircle, { backgroundColor: color }]} />
              {selectedColor === color && (
                <Feather name="check" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <InputDialog
          visible={showCreateTagDialog}
          onClose={() => setShowCreateTagDialog(false)}
          title=""
          label="Tag Name"
          placeholder="Enter tag name"
          onConfirm={handleCreateTag}
          confirmLabel="Create"
          validation={(value) => value.trim() ? null : 'Tag name is required'}
          autoFocus
        />
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
    gap: 8,
  },
  tagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.light.outlineVariant,
    padding: 14,
    gap: 14,
  },
  tagColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  tagInfo: {
    flex: 1,
    minWidth: 0,
  },
  tagName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.light.onSurface,
  },
  tagCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
    marginTop: 2,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: colors.light.onSurface,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.light.onSurface,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});