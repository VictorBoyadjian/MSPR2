// Design tokens de l'onboarding HealthAI (thème sombre / néon).
// Autonome : n'utilise que des polices système (pas de dépendance Google Fonts).

export const accent = '#CBFF3C';

function rgbOf(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** rgba à partir d'un hex + alpha (React Native n'a pas color-mix()). */
export function withAlpha(hex: string, a: number): string {
  const [r, g, b] = rgbOf(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const accentA = (a: number) => withAlpha(accent, a);

/** Luminance relative → choisit une couleur d'encre lisible sur l'accent. */
export function inkFor(hex: string): string {
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [r, g, b] = rgbOf(hex).map((c) => c / 255);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.45 ? '#07090b' : '#ffffff';
}

export const colors = {
  bg: '#07080b',
  bg1: '#0f1218',
  bg2: '#171b22',
  line: 'rgba(255,255,255,0.07)',
  line2: 'rgba(255,255,255,0.14)',
  tx: '#f3f5fa',
  tx2: '#9aa1ae',
  tx3: '#5c6470',
  accent,
  ink: inkFor(accent),
} as const;

export const tabular = { fontVariant: ['tabular-nums' as const] };
