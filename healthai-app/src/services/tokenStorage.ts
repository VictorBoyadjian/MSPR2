import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { CONFIG } from '@/constants/config';

const KEY = CONFIG.TOKEN_STORAGE_KEY;

export const tokenStorage = {
  get: async (): Promise<string | null> => {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(KEY) ?? null;
    return SecureStore.getItemAsync(KEY);
  },

  set: async (token: string): Promise<void> => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(KEY, token);
      return;
    }
    await SecureStore.setItemAsync(KEY, token);
  },

  clear: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(KEY);
      return;
    }
    await SecureStore.deleteItemAsync(KEY);
  },
};
