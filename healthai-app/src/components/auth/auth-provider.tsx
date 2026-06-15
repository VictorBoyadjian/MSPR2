import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { setToken, User } from '@/services/api';
import { authService, RegisterPayload } from '@/services/authService';
import { tokenStorage } from '@/services/tokenStorage';
import { AuthContext, AuthState } from '@/stores/authStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingPending, setOnboardingPending] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await tokenStorage.get();
      if (token) {
        setToken(token);
        try {
          setUser(await authService.me());
        } catch {
          setToken(null);
          await tokenStorage.clear();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { bearer_token } = await authService.login(email, password);
    setToken(bearer_token);
    await tokenStorage.set(bearer_token);
    setUser(await authService.me());
  }, []);

  const register = useCallback(
    async (data: RegisterPayload) => {
      await authService.register(data);
      // On marque l'onboarding requis AVANT le login pour éviter une redirection
      // transitoire vers l'accueil au moment où l'utilisateur devient authentifié.
      setOnboardingPending(true);
      await login(data.email, data.password);
    },
    [login],
  );

  const refreshUser = useCallback(async () => {
    setUser(await authService.me());
  }, []);

  const completeOnboarding = useCallback(() => setOnboardingPending(false), []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setToken(null);
      await tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount();
    setToken(null);
    await tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      onboardingPending,
      login,
      register,
      logout,
      deleteAccount,
      refreshUser,
      completeOnboarding,
    }),
    [user, isLoading, onboardingPending, login, register, logout, deleteAccount, refreshUser, completeOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
