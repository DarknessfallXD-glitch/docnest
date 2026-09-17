import { useColorScheme } from 'react-native';
import { useAppStore } from './useAppStore';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { settings } = useAppStore();
  
  const colorScheme = settings.theme === 'system' ? systemColorScheme : settings.theme;
  const isDark = colorScheme === 'dark';
  
  return {
    isDark,
    colorScheme: isDark ? 'dark' : 'light',
    theme: settings.theme,
  };
}

export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceVariant: '#F1F5F9',
    primary: '#0EA5E9',
    primaryContainer: '#E0F2FE',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#0369A1',
    secondary: '#64748B',
    secondaryContainer: '#E2E8F0',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#334155',
    tertiary: '#8B5CF6',
    tertiaryContainer: '#F5F3FF',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#5B21B6',
    error: '#EF4444',
    errorContainer: '#FEF2F2',
    onError: '#FFFFFF',
    onErrorContainer: '#991B1B',
    outline: '#CBD5E1',
    outlineVariant: '#E2E8F0',
    onBackground: '#0F172A',
    onSurface: '#1E293B',
    onSurfaceVariant: '#475569',
    inverseSurface: '#1E293B',
    inverseOnSurface: '#F8FAFC',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    primary: '#38BDF8',
    primaryContainer: '#0369A1',
    onPrimary: '#0C4A6E',
    onPrimaryContainer: '#E0F2FE',
    secondary: '#94A3B8',
    secondaryContainer: '#334155',
    onSecondary: '#1E293B',
    onSecondaryContainer: '#E2E8F0',
    tertiary: '#C4B5FD',
    tertiaryContainer: '#5B21B6',
    onTertiary: '#2E1065',
    onTertiaryContainer: '#F5F3FF',
    error: '#F87171',
    errorContainer: '#991B1B',
    onError: '#450A0A',
    onErrorContainer: '#FEF2F2',
    outline: '#64748B',
    outlineVariant: '#475569',
    onBackground: '#F8FAFC',
    onSurface: '#F1F5F9',
    onSurfaceVariant: '#CBD5E1',
    inverseSurface: '#F1F5F9',
    inverseOnSurface: '#1E293B',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.7)',
  },
};

export type ColorScheme = keyof typeof colors;

export function useColors() {
  const { isDark } = useTheme();
  return isDark ? colors.dark : colors.light;
}