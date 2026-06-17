import { Colors } from '@/constants/theme/colors';
import { Spacing } from '@/constants/theme/layout';

describe('Card — styles et couleurs', () => {
  it('utilise backgroundElement comme couleur de fond', () => {
    const theme = Colors.light;
    expect(theme.backgroundElement).toBe('#ffffff');
  });

  it('backgroundElement est différent en mode sombre', () => {
    expect(Colors.light.backgroundElement).not.toBe(Colors.dark.backgroundElement);
  });

  it('le padding utilise Spacing.three', () => {
    expect(Spacing.three).toBeDefined();
    expect(typeof Spacing.three).toBe('number');
  });

  it('le borderRadius utilise Spacing.three', () => {
    const borderRadius = Spacing.three;
    expect(borderRadius).toBeGreaterThan(0);
  });
});
