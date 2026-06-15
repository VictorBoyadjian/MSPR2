import { Redirect, useLocalSearchParams } from 'expo-router';

import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import type { Credentials } from '@/components/onboarding/data';

export default function OnboardingScreen() {
  const params = useLocalSearchParams<Partial<Credentials>>();

  // Garde-fou : sans identifiants (accès direct à la route), on repart sur l'inscription.
  if (!params.email || !params.password) {
    return <Redirect href="/(auth)/register" />;
  }

  const credentials: Credentials = {
    first_name: params.first_name ?? '',
    last_name: params.last_name ?? '',
    email: params.email,
    password: params.password,
  };

  return <OnboardingFlow credentials={credentials} />;
}
