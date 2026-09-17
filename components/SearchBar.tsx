'use client';

import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/hooks/useTheme';
import { useTheme } from '@/hooks/useTheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search documents...',
  autoFocus = false,
  showFilter = false,
  onFilterPress,
}: SearchBarProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surfaceVariant }]}>
      <Feather 
        name="search" 
        size={22} 
        color={themeColors.onSurfaceVariant} 
        style={styles.searchIcon} 
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit ? () => onSubmit(value) : undefined}
        placeholder={placeholder}
        placeholderTextColor={themeColors.onSurfaceVariant}
        style={[styles.input, { color: themeColors.onSurface }]}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
      />
      {showFilter && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={styles.filterButton}
          accessibilityLabel="Filter"
        >
          <Feather name="filter" size={22} color={themeColors.onSurfaceVariant} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchIcon: {
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    height: '100%',
  },
  filterButton: {
    padding: 4,
    marginRight: 4,
  },
});