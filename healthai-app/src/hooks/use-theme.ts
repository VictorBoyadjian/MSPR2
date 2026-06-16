/**
 * Accès au thème résolu (clair / sombre).
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useContext } from 'react';

import { Colors, type ThemeScheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeContext } from '@/stores/themeStore';

/**
 * Schéma de couleurs effectif. Respecte la préférence utilisateur
 * (clair / sombre / système) si un ThemePreferenceProvider est monté,
 * sinon retombe sur le schéma système (`light` par défaut).
 */
export function useColorSchemeResolved(): ThemeScheme {
  const preference = useContext(ThemeContext);
  const systemScheme = useColorScheme();
  if (preference) return preference.scheme;
  return systemScheme === 'dark' ? 'dark' : 'light';
}

/** Tokens de couleur du mode courant. */
export function useTheme() {
  return Colors[useColorSchemeResolved()];
}
