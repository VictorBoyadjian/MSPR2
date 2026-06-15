// theme.js — design tokens for the HealthAI onboarding (dark / neon).
// Change `accent` to re-skin the whole app.

export const accent = '#CBFF3C';

function rgbOf(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

// rgba string from a hex + alpha (RN has no color-mix()).
export function withAlpha(hex, a) {
  const [r, g, b] = rgbOf(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const accentA = (a) => withAlpha(accent, a);

// Relative luminance → choose readable ink color on top of the accent.
export function inkFor(hex) {
  const [r, g, b] = rgbOf(hex).map((c) => c / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
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
};

// Loaded via @expo-google-fonts/space-grotesk in App.js.
export const fonts = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
};

export const tabular = { fontVariant: ['tabular-nums'] };
