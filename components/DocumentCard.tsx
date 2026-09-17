'use client';

import { View, Text, StyleSheet, TouchableOpacity, Image, TouchableOpacityProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Document } from '@/types';
import { format } from 'date-fns';
import { colors } from '@/hooks/useTheme';
import { useTheme } from '@/hooks/useTheme';

interface DocumentCardProps {
  document: Document;
  onPress?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  onSelect?: () => void;
  showThumbnail?: boolean;
}

export function DocumentCard({
  document,
  onPress,
  onLongPress,
  selected = false,
  onSelect,
  showThumbnail = true,
}: DocumentCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

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

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
      style={[
        styles.card,
        selected && styles.cardSelected,
        { borderColor: selected ? themeColors.primary : themeColors.outlineVariant },
      ]}
    >
      {showThumbnail && document.thumbnailUri ? (
        <Image
          source={{ uri: document.thumbnailUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: getFileColor(document.type) + '15' }]}>
          <Feather 
            name={getFileIcon(document.type)} 
            size={32} 
            color={getFileColor(document.type)} 
          />
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{document.name}</Text>
          {document.isFavorite && (
            <Feather name="star" size={16} color="#F59E0B" style={styles.favoriteIcon} />
          )}
        </View>
        
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {formatSize(document.size)} • {format(new Date(document.createdAt), 'MMM d, yyyy')}
          </Text>
          {document.tags.length > 0 && (
            <View style={styles.tags}>
              {document.tags.slice(0, 2).map((tag) => (
                <View key={tag.id} style={[styles.tag, { backgroundColor: tag.color + '20' }]}>
                  <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
                </View>
              ))}
              {document.tags.length > 2 && (
                <View style={[styles.tag, { backgroundColor: themeColors.outlineVariant }]}>
                  <Text style={styles.tagText}>+{document.tags.length - 2}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {selected && (
        <View style={styles.checkContainer}>
          <Feather name="check-circle" size={24} color={themeColors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.outlineVariant,
    overflow: 'hidden',
    shadowColor: colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderWidth: 2,
    backgroundColor: colors.light.primaryContainer,
  },
  thumbnail: {
    width: 80,
    height: 100,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  iconContainer: {
    width: 80,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.light.onSurface,
    flex: 1,
  },
  favoriteIcon: {
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  checkContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 2,
    shadowColor: colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});