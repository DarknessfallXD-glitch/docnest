'use client';

import { ReactNode, useEffect } from 'react';
import { SplashScreen } from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NativeWindStyleSheet } from 'nativewind';

SplashScreen.preventAutoHideAsync();

export function Providers({ children }: { children: ReactNode }) {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
    'Inter-Medium': require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
    'Inter-SemiBold': require('@expo-google-fonts/inter/Inter_600SemiBold.ttf'),
    'Inter-Bold': require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
    'SpaceMono-Regular': require('@expo-google-fonts/space-mono/SpaceMono_400Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  NativeWindStyleSheet.setOutput('default');

  return <>{children}</>;
}