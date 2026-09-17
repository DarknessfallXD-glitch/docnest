'use client';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/hooks/useTheme';
import { useTheme } from '@/hooks/useTheme';

interface HeaderProps {
  title: string;
  leftAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
  } | null;
  rightActions?: Array<{
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
    badge?: number;
  }>;
  showBackButton?: boolean;
}

export function Header({
  title,
  leftAction,
  rightActions = [],
  showBackButton = false,
}: HeaderProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: themeColors.surface }]}>
      <TouchableOpacity
        onPress={leftAction?.onPress || (showBackButton ? handleBack : undefined)}
        style={styles.actionButton}
        accessibilityLabel={leftAction?.accessibilityLabel || (showBackButton ? 'Go back' : undefined)}
      >
        <Feather 
          name={leftAction?.icon || (showBackButton ? 'chevron-left' : 'menu')} 
          size={24} 
          color={themeColors.onSurface} 
        />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: themeColors.onSurface }]}>{title}</Text>
      </View>

      <View style={[styles.actionsContainer, { flexDirection: 'row', gap: 8 }]}>
        {rightActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={action.onPress}
            style={[
              styles.actionButton,
              action.badge && styles.actionButtonWithBadge,
            ]}
            accessibilityLabel={action.accessibilityLabel}
          >
            <Feather name={action.icon} size={24} color={themeColors.onSurface} />
            {action.badge && action.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{action.badge > 99 ? '99+' : action.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.outlineVariant,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  actionsContainer: {
    minWidth: 48,
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonWithBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});