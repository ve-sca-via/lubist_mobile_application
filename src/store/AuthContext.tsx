import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { AppRole } from '@/navigation/navigation.types';
import { getUser, setTokens, setUser, clearAuth } from '@/services/storage/tokenStorage';
import { setOnAuthExpired } from '@/services/api/client';

// Builds up to and including 1.x let vendors log in and manage their salon here.
// That module now lives in the standalone vendor app, so a stored vendor session
// has no stack to land on. Drop it on restore instead of leaving live tokens in
// SecureStore behind a login screen the vendor can no longer get past.
const RETIRED_ROLES = ['vendor'];

type AuthContextValue = {
  isAuthenticated: boolean;
  role: AppRole | null;
  user: any | null;
  isLoading: boolean;
  signIn: (user: any, tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  updateUser: (user: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUserState] = useState<any | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Cached cart / bookings / favourites / reviews / profile belong to one
  // customer. Drop them whenever the signed-in account changes so a second
  // person on the same phone never sees the previous one's data (queries are
  // cached for 30s / kept for 10 min - see AppProviders).
  const queryClient = useQueryClient();

  useEffect(() => {
    async function loadAuth() {
      try {
        const storedUser = await getUser();
        if (storedUser) {
          const backendRole = storedUser.user_role || storedUser.role || 'client';

          if (RETIRED_ROLES.includes(backendRole)) {
            await clearAuth();
            return;
          }

          setUserState(storedUser);
          setRole(backendRole === 'customer' ? 'client' : backendRole);
        }
      } catch (err) {
        console.error('Failed to load auth from storage', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  // When the API client can't recover the session (refresh failed/expired), it
  // clears SecureStore and fires this. Reset in-memory state so isAuthenticated
  // flips to false and navigation sends the user back to the login screen.
  useEffect(() => {
    setOnAuthExpired(() => {
      queryClient.clear();
      setUserState(null);
      setRole(null);
    });
    return () => setOnAuthExpired(null);
  }, [queryClient]);

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      role,
      user,
      isLoading,
      signIn: async (newUser: any, tokens: { access_token: string; refresh_token: string }) => {
        await setTokens(tokens.access_token, tokens.refresh_token);
        await setUser(newUser);
        queryClient.clear();
        setUserState(newUser);
        const backendRole = newUser.user_role || newUser.role || 'client';
        setRole(backendRole === 'customer' ? 'client' : backendRole);
      },
      updateUser: async (updatedUser: any) => {
        await setUser(updatedUser);
        setUserState(updatedUser);
        const backendRole = updatedUser.user_role || updatedUser.role || 'client';
        setRole(backendRole === 'customer' ? 'client' : backendRole);
      },
      signOut: async () => {
        await clearAuth();
        queryClient.clear();
        setUserState(null);
        setRole(null);
      },
    }),
    [role, user, isLoading, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
