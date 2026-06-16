/**
 * Point d'entrée du thème. Conserve l'API publique `@/constants/theme`.
 *
 * Découpage :
 *  - colors.ts  → palette clair / sombre (maquette) + tokens d'accent
 *  - fonts.ts   → familles de polices par plateforme
 *  - layout.ts  → espacements et constantes de mise en page
 */

import '@/global.css';

export { Brand, Colors } from './colors';
export type { ThemeColor, ThemeScheme } from './colors';
export { Fonts } from './fonts';
export { BottomTabInset, MaxContentWidth, Spacing } from './layout';
