'use client';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from './Button';
import { colors } from '@/hooks/useTheme';
import { useTheme } from '@/hooks/useTheme';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  illustration?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
  illustration,
}: EmptyStateProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {illustration ? (
        illustration
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: themeColors.primaryContainer }]}>
          <Feather name={icon} size={48} color={themeColors.primary} />
        </View>
      )}
      
      <Text style={[styles.title, { color: themeColors.onSurface }]}>{title}</Text>
      <Text style={[styles.description, { color: themeColors.onSurfaceVariant }]}>{description}</Text>
      
      {actionLabel && onActionPress && (
        <Button
          variant="primary"
          size="md"
          leftIcon="plus"
          onPress={onActionPress}
          style={styles.actionButton}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 8,
    minWidth: 200,
  },
});