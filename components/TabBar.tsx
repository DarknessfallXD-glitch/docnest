'use client';

import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/hooks/useTheme';
import { useTheme } from '@/hooks/useTheme';

interface TabBarProps {
  currentRoute: string;
  onTabPress: (route: string) => void;
  badges?: Record<string, number>;
}

export function TabBar({ currentRoute, onTabPress, badges = {} }: TabBarProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'folders', icon: 'folder', label: 'Folders' },
    { id: 'tags', icon: 'tag', label: 'Tags' },
    { id: 'favorites', icon: 'star', label: 'Favorites' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface, borderTopColor: themeColors.outlineVariant }]}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.id;
        const badgeCount = badges[tab.id];
        
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabPress(tab.id)}
            style={styles.tab}
            activeOpacity={0.8}
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <View style={styles.iconContainer}>
              <Feather 
                name={isActive ? `${tab.icon}` : tab.icon} 
                size={24} 
                color={isActive ? themeColors.primary : themeColors.onSurfaceVariant}
                style={{ fontWeight: isActive ? '700' : '400' }}
              />
              {badgeCount && badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.label,
              { color: isActive ? themeColors.primary : themeColors.onSurfaceVariant }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 72,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 56,
  },
  iconContainer: {
    position: 'relative',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});