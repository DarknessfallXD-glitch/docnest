'use client';

import { Stack } from 'expo-router';
import { Providers } from '@/components/Providers';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-splash-screen';

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ presentation: 'card' }} />
        <Stack.Screen name="+not-found" options={{ presentation: 'card' }} />
      </Stack>
    </Providers>
  );
}