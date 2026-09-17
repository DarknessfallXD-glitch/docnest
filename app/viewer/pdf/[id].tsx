'use client';

import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components';
import { useDocuments } from '@/hooks/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/hooks/useTheme';
import React, { useEffect, useState } from 'react';
import { PDFView } from 'react-native-pdf';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PDFViewerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const { documents, refreshAll } = useDocuments();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      if (id) {
        const doc = documents.find(d => d.id === id);
        if (!doc) {
          await refreshAll();
        }
      }
      setIsLoading(false);
    };
    loadDocument();
  }, [id, documents, refreshAll]);

  const document = documents.find(d => d.id === id);

  const onLoadComplete = (np: number) => {
    setNumberOfPages(np);
    setError(null);
  };

  const onError = (err: any) => {
    setError(err.message || 'Failed to load PDF');
  };

  const onPageChanged = (pageNumber: number) => {
    setPage(pageNumber);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Feather name="loader" size={32} color={themeColors.primary} />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!document) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="PDF Viewer" leftAction={{ icon: 'chevron-left', onPress: () => router.back() }} />
        <View style={styles.notFound}>
          <Feather name="alert-triangle" size={48} color={themeColors.onSurfaceVariant} />
          <Text style={styles.notFoundText}>Document not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="PDF Viewer" leftAction={{ icon: 'chevron-left', onPress: () => router.back() }} />
        <View style={styles.error}>
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load PDF</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header
        title={document.name}
        leftAction={{ icon: 'chevron-left', onPress: () => router.back() }}
        rightActions={[
          { icon: 'chevron-left', onPress: () => page > 1 && setPage(page - 1), accessibilityLabel: 'Previous page' },
          { icon: 'chevron-right', onPress: () => page < numberOfPages && setPage(page + 1), accessibilityLabel: 'Next page' },
        ]}
      />

      <View style={styles.pdfContainer}>
        <PDFView
          source={{ uri: document.uri }}
          onLoadComplete={onLoadComplete}
          onError={onError}
          onPageChanged={onPageChanged}
          page={page}
          style={styles.pdf}
        />
      </View>

      {numberOfPages > 0 && (
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            Page {page} of {numberOfPages}
          </Text>
        </View>
      )}
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
    gap: 16,
  },
  loadingSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
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
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
    textAlign: 'center',
  },
  pdfContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  pdf: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: colors.light.onSurface,
    backgroundColor: colors.light.background + 'CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});