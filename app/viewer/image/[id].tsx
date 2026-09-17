'use client';

import { View, Text, StyleSheet, SafeAreaView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components';
import { useDocuments } from '@/hooks/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/hooks/useTheme';
import React, { useEffect, useState } from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ImageViewerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const { documents, refreshAll } = useDocuments();
  const [isLoading, setIsLoading] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
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

  const onLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageSize({ width, height });
    setError(null);
  };

  const onError = () => {
    setError('Failed to load image');
  };

  const zoomIn = () => setScale(prev => Math.min(prev * 1.5, 5));
  const zoomOut = () => setScale(prev => Math.max(prev / 1.5, 0.5));
  const resetZoom = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  const handlePan = (event: any) => {
    if (scale > 1) {
      setTranslate(prev => ({
        x: Math.max(Math.min(prev.x + event.nativeEvent.translationX, 0), SCREEN_WIDTH - imageSize.width * scale),
        y: Math.max(Math.min(prev.y + event.nativeEvent.translationY, 0), SCREEN_HEIGHT - imageSize.height * scale),
      }));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Feather name="loader" size={32} color={themeColors.primary} />
          <Text style={styles.loadingText}>Loading image...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!document) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Image Viewer" leftAction={{ icon: 'chevron-left', onPress: () => router.back() }} />
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
        <Header title="Image Viewer" leftAction={{ icon: 'chevron-left', onPress: () => router.back() }} />
        <View style={styles.error}>
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageWidth = imageSize.width * scale;
  const imageHeight = imageSize.height * scale;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
      <Header
        title={document.name}
        leftAction={{ icon: 'chevron-left', onPress: () => router.back() }}
        rightActions={[
          { icon: 'minus', onPress: zoomOut, accessibilityLabel: 'Zoom out' },
          { icon: 'plus', onPress: zoomIn, accessibilityLabel: 'Zoom in' },
          { icon: 'rotate-ccw', onPress: resetZoom, accessibilityLabel: 'Reset zoom' },
        ]}
      />

      <View style={styles.imageContainer}>
        <View 
          style={styles.scrollView}
          onTouchStart={handlePan}
          onTouchMove={handlePan}
        >
          <Image
            source={{ uri: document.uri }}
            style={[
              styles.image,
              { width: imageWidth, height: imageHeight },
              { transform: [{ translateX: translate.x }, { translateY: translate.y }] },
            ]}
            onLoad={onLoad}
            onError={onError}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.zoomControls}>
        <TouchableOpacity onPress={zoomOut} style={styles.zoomButton} accessibilityLabel="Zoom out">
          <Feather name="minus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
        <TouchableOpacity onPress={zoomIn} style={styles.zoomButton} accessibilityLabel="Zoom in">
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
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
    gap: 16,
    backgroundColor: '#000000',
  },
  loadingSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
    backgroundColor: '#000000',
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
    backgroundColor: '#000000',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    // Size set dynamically
  },
  zoomControls: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  zoomButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    minWidth: 60,
    textAlign: 'center',
  },
});