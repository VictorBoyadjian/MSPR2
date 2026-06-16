import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { themeStorage } from '@/services/themeStorage';
import { ThemeContext, ThemePreference, ThemeState } from '@/stores/themeStore';

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Restaure le choix persisté au démarrage.
  useEffect(() => {
    (async () => {
      const stored = await themeStorage.get();
      if (stored) setPreferenceState(stored);
    })();
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void themeStorage.set(next);
  }, []);

  const scheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeState>(
    () => ({ preference, scheme, setPreference }),
    [preference, scheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
