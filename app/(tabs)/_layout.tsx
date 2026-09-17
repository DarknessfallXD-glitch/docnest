'use client';

import { Tabs } from 'expo-router';
import { useAppStore, useDocumentStore } from '@/hooks/useAppStore';
import { TabBar } from '@/components/TabBar';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/hooks/useTheme';
import { useEffect } from 'react';

export default function TabsLayout() {
  const { loadSettings } = useAppStore();
  const { refreshAll } = useDocumentStore();
  const { isDark } = useTheme();

  useEffect(() => {
    loadSettings();
    refreshAll();
  }, [loadSettings, refreshAll]);

  const tabIcons = {
    home: { focused: 'home', unfocused: 'home' },
    folders: { focused: 'folder', unfocused: 'folder' },
    tags: { focused: 'tag', unfocused: 'tag' },
    favorites: { focused: 'star', unfocused: 'star' },
    settings: { focused: 'settings', unfocused: 'settings' },
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? colors.dark.primary : colors.light.primary,
        tabBarInactiveTintColor: isDark ? colors.dark.onSurfaceVariant : colors.light.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
          borderTopWidth: 1,
          borderTopColor: isDark ? colors.dark.outlineVariant : colors.light.outlineVariant,
          height: 72,
          paddingTop: 8,
          paddingBottom: 16,
          paddingHorizontal: 8,
        },
        tabBarItemStyle: {
          flex: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: 'Inter-SemiBold',
        },
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Feather name={focused ? 'home' : 'home'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: 'Folders',
          tabBarIcon: ({ focused, color }) => (
            <Feather name={focused ? 'folder' : 'folder'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          title: 'Tags',
          tabBarIcon: ({ focused, color }) => (
            <Feather name={focused ? 'tag' : 'tag'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ focused, color }) => (
            <Feather name={focused ? 'star' : 'star'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <Feather name={focused ? 'settings' : 'settings'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}