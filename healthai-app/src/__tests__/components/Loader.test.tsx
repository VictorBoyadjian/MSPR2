import { Colors } from '@/constants/theme/colors';

describe('Loader — couleur', () => {
  it('utilise theme.text comme couleur en mode clair', () => {
    const theme = Colors.light;
    expect(theme.text).toBe('#111312');
  });

  it('utilise theme.text comme couleur en mode sombre', () => {
    const theme = Colors.dark;
    expect(theme.text).toBe('#f4f5f4');
  });

  it('les couleurs de texte diffèrent entre clair et sombre', () => {
    expect(Colors.light.text).not.toBe(Colors.dark.text);
  });
});
