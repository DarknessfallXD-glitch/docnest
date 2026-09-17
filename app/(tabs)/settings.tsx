'use client';

import { View, ScrollView, StyleSheet, SafeAreaView, Switch, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Header, Button, Modal, ConfirmDialog } from '@/components';
import { useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/hooks/useTheme';
import React, { useState } from 'react';

export default function SettingsScreen() {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const { settings, setSettings, loadSettings } = useAppStore();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    await setSettings({ theme });
    setShowThemeModal(false);
  };

  const handleSortChange = async (sort: 'name' | 'date' | 'size' | 'type') => {
    await setSettings({ defaultSort: sort });
    setShowSortModal(false);
  };

  const handleReset = async () => {
    await setSettings({
      theme: 'system',
      defaultSort: 'date',
      sortOrder: 'desc',
      showThumbnails: true,
      autoBackup: false,
    });
    setShowResetConfirm(false);
  };

  const themeOptions = [
    { id: 'light', label: 'Light', icon: 'sun' },
    { id: 'dark', label: 'Dark', icon: 'moon' },
    { id: 'system', label: 'System', icon: 'monitor' },
  ];

  const sortOptions = [
    { id: 'name', label: 'Name' },
    { id: 'date', label: 'Date' },
    { id: 'size', label: 'Size' },
    { id: 'type', label: 'Type' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header title="Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <TouchableOpacity
            onPress={() => setShowThemeModal(true)}
            style={styles.settingRow}
          >
            <View style={styles.settingIcon}>
              <Feather name="palette" size={22} color={themeColors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingValue}>
                {themeOptions.find(t => t.id === settings.theme)?.label}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={themeColors.onSurfaceVariant} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Feather name="image" size={22} color={themeColors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Thumbnails</Text>
              <Text style={styles.settingValue}>
                {settings.showThumbnails ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={settings.showThumbnails}
              onValueChange={async (value) => await setSettings({ showThumbnails: value })}
              thumbColor={themeColors.primary}
              trackColor={{ false: themeColors.outlineVariant, true: themeColors.primary + '80' }}
            />
          </View>
        </View>

        <View style={[styles.section, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Organization</Text>
          
          <TouchableOpacity
            onPress={() => setShowSortModal(true)}
            style={styles.settingRow}
          >
            <View style={styles.settingIcon}>
              <Feather name="filter" size={22} color={themeColors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Default Sort</Text>
              <Text style={styles.settingValue}>
                {sortOptions.find(s => s.id === settings.defaultSort)?.label}
                ({settings.sortOrder === 'asc' ? 'Ascending' : 'Descending'})
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={themeColors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity
            onPress={() => setShowResetConfirm(true)}
            style={styles.settingRowDanger}
          >
            <View style={styles.settingIconDanger}>
              <Feather name="trash-2" size={22} color="#EF4444" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabelDanger}>Reset All Settings</Text>
              <Text style={styles.settingValue}>Restore default settings</Text>
            </View>
            <Feather name="chevron-right" size={20} color={themeColors.onSurfaceVariant} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRowDanger}>
            <View style={styles.settingIconDanger}>
              <Feather name="database" size={22} color="#EF4444" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabelDanger}>Clear All Data</Text>
              <Text style={styles.settingValue}>Delete all documents and folders (irreversible)</Text>
            </View>
            <Feather name="chevron-right" size={20} color={themeColors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Feather name="info" size={22} color={themeColors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Feather name="github" size={22} color={themeColors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Open Source</Text>
              <Text style={styles.settingValue}>View on GitHub</Text>
            </View>
            <Feather name="chevron-right" size={20} color={themeColors.onSurfaceVariant} />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Feather name="heart" size={22} color={themeColors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>License</Text>
              <Text style={styles.settingValue}>MIT License</Text>
            </View>
            <Feather name="chevron-right" size={20} color={themeColors.onSurfaceVariant} />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title="Choose Theme"
        size="sm"
      >
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => handleThemeChange(option.id as any)}
            style={[
              styles.optionItem,
              settings.theme === option.id && styles.optionItemSelected,
            ]}
          >
            <Feather name={option.icon} size={22} color={settings.theme === option.id ? themeColors.onPrimaryContainer : themeColors.onSurface} style={styles.optionIcon} />
            <Text style={[
              styles.optionText,
              settings.theme === option.id ? { color: themeColors.onPrimaryContainer, fontWeight: '600' } : { color: themeColors.onSurface }
            ]}>
              {option.label}
            </Text>
            {settings.theme === option.id && (
              <Feather name="check" size={20} color={themeColors.onPrimaryContainer} />
            )}
          </TouchableOpacity>
        ))}
      </Modal>

      <Modal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        title="Default Sort Order"
        size="sm"
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => handleSortChange(option.id as any)}
            style={[
              styles.optionItem,
              settings.defaultSort === option.id && styles.optionItemSelected,
            ]}
          >
            <Text style={[
              styles.optionText,
              settings.defaultSort === option.id ? { color: themeColors.onPrimaryContainer, fontWeight: '600' } : { color: themeColors.onSurface }
            ]}>
              {option.label}
            </Text>
            {settings.defaultSort === option.id && (
              <Feather name="check" size={20} color={themeColors.onPrimaryContainer} />
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setSettings({ sortOrder: settings.sortOrder === 'asc' ? 'desc' : 'asc' })}
          style={styles.optionItem}
        >
          <Text style={styles.optionText}>{settings.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</Text>
          <Feather name={settings.sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size={20} color={themeColors.primary} />
        </TouchableOpacity>
      </Modal>

      <ConfirmDialog
        visible={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset Settings"
        message="This will restore all settings to their default values. This action cannot be undone."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        onConfirm={handleReset}
        destructive
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.outlineVariant,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.light.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  settingRowDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.light.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconDanger: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    minWidth: 0,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: colors.light.onSurface,
  },
  settingLabelDanger: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
  },
  settingValue: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.outlineVariant,
    marginHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  optionItemSelected: {
    backgroundColor: colors.light.primaryContainer,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
});