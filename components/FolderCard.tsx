'use client';

import { View, Text, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Folder } from '@/types';
import { colors } from '@/hooks/useTheme';
import { useTheme } from '@/hooks/useTheme';

interface FolderCardProps extends TouchableOpacityProps {
  folder: Folder;
  documentCount: number;
  subfolderCount: number;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function FolderCard({
  folder,
  documentCount,
  subfolderCount,
  selected = false,
  onPress,
  onLongPress,
  style,
  ...props
}: FolderCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  const folderColor = folder.color || themeColors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
      style={[styles.card, selected && styles.cardSelected, { borderColor: selected ? folderColor : themeColors.outlineVariant }, style]}
      {...props}
    >
      <View style={[styles.iconContainer, { backgroundColor: folderColor + '15' }]}>
        <Feather name={folder.icon || 'folder'} size={28} color={folderColor} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{folder.name}</Text>
        <View style={styles.counts}>
          <View style={styles.countItem}>
            <Feather name="file-text" size={12} color={themeColors.onSurfaceVariant} />
            <Text style={styles.countText}>{documentCount}</Text>
          </View>
          {subfolderCount > 0 && (
            <View style={styles.countItem}>
              <Feather name="folder" size={12} color={themeColors.onSurfaceVariant} />
              <Text style={styles.countText}>{subfolderCount}</Text>
            </View>
          )}
        </View>
      </View>

      {selected && (
        <View style={styles.checkContainer}>
          <Feather name="check-circle" size={22} color={folderColor} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.light.outlineVariant,
    padding: 14,
    gap: 14,
    shadowColor: colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardSelected: {
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.light.onSurface,
  },
  counts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
  },
  checkContainer: {
    backgroundColor: colors.light.background,
    borderRadius: 10,
    padding: 2,
  },
});