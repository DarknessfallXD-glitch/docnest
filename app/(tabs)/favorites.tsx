'use client';

import { View, FlatList, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header, SearchBar, DocumentCard, EmptyState } from '@/components';
import { useDocuments, useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/hooks/useTheme';
import { Document } from '@/types';
import React, { useCallback, useEffect } from 'react';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const {
    documents,
    isLoading,
    refreshAll,
    searchQuery,
    setSearchQuery,
    toggleFavorite,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    settings,
  } = useDocuments();

  const { settings: appSettings } = useAppStore();

  const favoriteDocuments = documents.filter(doc => doc.isFavorite);
  
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, [setSearchQuery]);

  const sortedDocuments = [...favoriteDocuments].sort((a, b) => {
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

  const renderDocument = ({ item }: { item: Document }) => (
    <DocumentCard
      document={item}
      onPress={() => router.push(`/document/${item.id}`)}
      showThumbnail={settings.showThumbnails}
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
        title="Favorites"
        rightActions={[
          { 
            icon: viewMode === 'grid' ? 'list' : 'grid',
            onPress: () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
            accessibilityLabel: 'Toggle view',
          },
        ]}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search favorites..."
      />

      <View style={styles.content}>
        {favoriteDocuments.length === 0 ? (
          <EmptyState
            icon="star"
            title="No favorites yet"
            description="Mark documents as favorites to access them quickly"
            illustration={
              <View style={styles.illustration}>
                <Feather name="star" size={64} color={themeColors.onSurfaceVariant + '80'} />
              </View>
            }
          />
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
                  onRefresh={() => refreshAll()}
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
                  onRefresh={() => refreshAll()}
                  colors={['#0EA5E9']}
                />
              }
            />
          )
        )}
      </View>
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
  illustration: {
    marginBottom: 8,
  },
});