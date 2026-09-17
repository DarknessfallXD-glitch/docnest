'use client';

import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Button } from '@/components';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/hooks/useTheme';

export default function NotFoundScreen() {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Feather name="alert-circle" size={64} color={themeColors.onSurfaceVariant} />
        <Text style={[styles.title, { color: themeColors.onSurface }]}>Page Not Found</Text>
        <Text style={[styles.description, { color: themeColors.onSurfaceVariant }]}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Link href="/">
          <Button variant="primary" leftIcon="home">Go Home</Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});