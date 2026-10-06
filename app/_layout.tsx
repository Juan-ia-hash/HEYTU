import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AppErrorBoundary } from '@/components/layout/AppErrorBoundary';
import { AuthProvider } from '@/lib/auth/AuthProvider';

void SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppErrorBoundary>
          <AuthProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
