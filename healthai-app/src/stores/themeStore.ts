import { createContext, useContext } from 'react';

import type { ThemeScheme } from '@/constants/theme';

/** Choix de l'utilisateur : suivre le système, ou forcer clair / sombre. */
export type ThemePreference = 'system' | 'light' | 'dark';

export type ThemeState = {
  /** Préférence brute sélectionnée par l'utilisateur. */
  preference: ThemePreference;
  /** Schéma effectivement appliqué après résolution de `system`. */
  scheme: ThemeScheme;
  setPreference: (preference: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeState | null>(null);

export function useThemePreference(): ThemeState {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemePreference doit être utilisé dans un ThemePreferenceProvider');
  }
  return context;
}
