import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { ThemePreference } from '@/stores/themeStore';

const KEY = 'healthai.theme-preference';

const isPreference = (v: string | null): v is ThemePreference =>
  v === 'system' || v === 'light' || v === 'dark';

/** Persistance locale du choix de thème (clair / sombre / système). */
export const themeStorage = {
  get: async (): Promise<ThemePreference | null> => {
    const raw =
      Platform.OS === 'web'
        ? globalThis.localStorage?.getItem(KEY) ?? null
        : await SecureStore.getItemAsync(KEY);
    return isPreference(raw) ? raw : null;
  },

  set: async (preference: ThemePreference): Promise<void> => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(KEY, preference);
      return;
    }
    await SecureStore.setItemAsync(KEY, preference);
  },
};
