import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemePreferenceProvider } from '@/components/theme/theme-preference-provider';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/hooks/useAuth';
import { useColorSchemeResolved } from '@/hooks/use-theme';

function RootNavigator() {
  const { isAuthenticated, isLoading, onboardingPending } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const onOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else if (onboardingPending) {
      if (!onOnboarding) router.replace('/onboarding');
    } else if (inAuthGroup || onOnboarding) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, onboardingPending, segments, router]);

  if (isLoading) return <Loader />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="meal/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="meal/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="meal/add-form" options={{ presentation: 'modal' }} />
      <Stack.Screen name="meal/scanDishPage" options={{ presentation: 'modal' }} />
      <Stack.Screen name="workout/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="workout/run" options={{ presentation: 'modal' }} />
      <Stack.Screen name="community/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="community/mine" />
      <Stack.Screen name="community/[id]" />
    </Stack>
  );
}

function ThemedNavigation() {
  const scheme = useColorSchemeResolved();
  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <AuthProvider>
        <ConfirmProvider>
          <ThemedNavigation />
        </ConfirmProvider>
      </AuthProvider>
    </ThemePreferenceProvider>
  );
}
