/**
 * Palette de l'application — reprise des modes clair / sombre de la maquette
 * (design-inputs/healthai-maquettes.html) : noir profond, accent vert lime,
 * surfaces étagées et hiérarchie de texte dim / faint.
 *
 * Source de vérité unique : tout passe par `useTheme()` (cf. hooks/use-theme.ts)
 * qui renvoie `Colors.light` ou `Colors.dark` selon le schéma système.
 */

/** Couleurs de marque, identiques dans les deux modes. */
export const Brand = {
  /** Accent lime signature de la maquette (--accent). */
  accent: '#c8fa46',
  /** Variante appuyée pour les états pressés (--accent-deep). */
  accentDeep: '#b6e82f',
  /** Voile d'accent translucide pour les fonds doux (--accent-soft). */
  accentSoft: 'rgba(200,250,70,0.12)',
} as const;

export const Colors = {
  light: {
    // — Texte —
    text: '#111312',
    textSecondary: '#5e6469',
    textDim: '#5e6469',
    textFaint: '#a0a5a3',
    // — Fonds —
    background: '#f6f7f2',
    pageBg: '#eceee6',
    surface: '#ffffff',
    surface2: '#eef0e9',
    surface3: '#e4e7dd',
    // Alias historiques (élément / sélection) conservés pour l'existant.
    backgroundElement: '#ffffff',
    backgroundSelected: '#e4e7dd',
    // — Bordures & pistes —
    border: 'rgba(0,0,0,0.08)',
    borderStrong: 'rgba(0,0,0,0.14)',
    track: '#e0e2da',
    // — Accent —
    accent: Brand.accent,
    accentDeep: Brand.accentDeep,
    accentSoft: Brand.accentSoft,
    /** Texte/encre posé SUR l'accent (boutons pleins). */
    onAccent: '#16210a',
    /** Accent lisible posé sur un fond clair (texte, icônes). */
    accentText: '#5f7d00',
    // — Sémantique —
    danger: '#e5484d',
    good: '#30a46c',
  },
  dark: {
    // — Texte —
    text: '#f4f5f4',
    textSecondary: '#8b9096',
    textDim: '#8b9096',
    textFaint: '#5a5f64',
    // — Fonds —
    background: '#0a0a0b',
    pageBg: '#070708',
    surface: '#15171a',
    surface2: '#1e2024',
    surface3: '#262a2e',
    backgroundElement: '#15171a',
    backgroundSelected: '#262a2e',
    // — Bordures & pistes —
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.14)',
    track: '#26282b',
    // — Accent —
    accent: Brand.accent,
    accentDeep: Brand.accentDeep,
    accentSoft: Brand.accentSoft,
    onAccent: '#0a0a0b',
    accentText: Brand.accent,
    // — Sémantique —
    danger: '#ff4d4d',
    good: '#34c759',
  },
} as const;

/** Nom d'un token de couleur disponible dans les deux modes. */
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Schéma de couleurs résolu (clair / sombre). */
export type ThemeScheme = keyof typeof Colors;
