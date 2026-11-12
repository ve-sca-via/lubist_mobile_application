import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { PropsWithChildren, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppGate } from '@/shared/components/AppGate';
import { AuthProvider } from '@/store/AuthContext';
import { navigationTheme } from '@/theme/navigationTheme';

const mergedTheme = {
  ...DefaultTheme,
  ...navigationTheme,
};

/**
 * - staleTime: with the default of 0, every screen mount (opening a salon,
 *   going back to Home, switching tabs) refetched everything it reads. 30s
 *   keeps navigation instant on budget phones. Mutations still invalidate
 *   immediately (cart, bookings, favourites, reviews) and pull-to-refresh /
 *   Retry force a refetch.
 * - retry 1: a customer on a bad connection sees the error + Retry after one
 *   retry instead of a ~7s spinner (default is 3 with backoff). Mutations never
 *   retry - re-sending an add-to-cart or checkout is not safe to do silently.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * React Query's "refetch on window focus" doesn't work on native out of the box.
 * Wire it to AppState so bringing the app back to the foreground refreshes
 * stale data - e.g. a booking the salon confirmed while the customer was away.
 */
function useAppStateFocus() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => sub.remove();
  }, []);
}

export function AppProviders({ children }: PropsWithChildren) {
  useAppStateFocus();
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* AuthProvider must stay inside QueryClientProvider: it clears the
            query cache on sign-in / sign-out / session expiry. */}
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
