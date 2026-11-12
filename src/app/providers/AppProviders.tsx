import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppGate } from '@/shared/components/AppGate';
import { AuthProvider } from '@/store/AuthContext';
import { navigationTheme } from '@/theme/navigationTheme';

const mergedTheme = {
  ...DefaultTheme,
  ...navigationTheme,
};

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* Overlays update-required / wrong-app screens above all navigation. */}
          <AppGate>
            <NavigationContainer theme={mergedTheme}>{children}</NavigationContainer>
          </AppGate>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
