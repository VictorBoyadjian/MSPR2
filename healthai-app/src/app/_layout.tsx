import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AuthProvider } from '@/components/auth/auth-provider';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/hooks/useAuth';

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
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="meal/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="meal/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="meal/add-form" options={{ presentation: 'modal' }} />
      <Stack.Screen name="meal/scan-dish" options={{ presentation: 'modal' }} />
      <Stack.Screen name="workout/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="workout/run" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
