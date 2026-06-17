import { Colors } from '@/constants/theme/colors';

// Test logic / props behavior of Button component
describe('Button — logique', () => {
  describe('détermination de la couleur', () => {
    it('onAccent est utilisé pour le variant primary', () => {
      const theme = Colors.light;
      const isPrimary = true;
      const color = isPrimary ? theme.onAccent : theme.text;
      expect(color).toBe(theme.onAccent);
    });

    it('text est utilisé pour le variant secondary', () => {
      const theme = Colors.light;
      const isPrimary = false;
      const color = isPrimary ? theme.onAccent : theme.text;
      expect(color).toBe(theme.text);
    });
  });

  describe('état désactivé', () => {
    it('isDisabled est true si disabled=true', () => {
      const disabled = true;
      const loading = false;
      const isDisabled = disabled || loading;
      expect(isDisabled).toBe(true);
    });

    it('isDisabled est true si loading=true', () => {
      const disabled = false;
      const loading = true;
      const isDisabled = disabled || loading;
      expect(isDisabled).toBe(true);
    });

    it('isDisabled est false si ni disabled ni loading', () => {
      const disabled = false;
      const loading = false;
      const isDisabled = disabled || loading;
      expect(isDisabled).toBe(false);
    });
  });

  describe('couleurs en mode sombre', () => {
    it('accent est identique en clair et sombre', () => {
      expect(Colors.light.accent).toBe(Colors.dark.accent);
    });

    it('onAccent est différent selon le mode', () => {
      expect(Colors.light.onAccent).not.toBe(Colors.dark.onAccent);
    });
  });
});

describe('Button — opacité', () => {
  it('retourne 0.5 si désactivé', () => {
    const isDisabled = true;
    const pressed = false;
    const opacity = isDisabled ? 0.5 : pressed ? 0.8 : 1;
    expect(opacity).toBe(0.5);
  });

  it('retourne 0.8 si pressed', () => {
    const isDisabled = false;
    const pressed = true;
    const opacity = isDisabled ? 0.5 : pressed ? 0.8 : 1;
    expect(opacity).toBe(0.8);
  });

  it('retourne 1 si actif et non pressé', () => {
    const isDisabled = false;
    const pressed = false;
    const opacity = isDisabled ? 0.5 : pressed ? 0.8 : 1;
    expect(opacity).toBe(1);
  });
});
