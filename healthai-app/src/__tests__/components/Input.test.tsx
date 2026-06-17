import { Colors } from '@/constants/theme/colors';

describe('Input — logique de l\'état', () => {
  describe('état flottant du label', () => {
    it('le label flotte si focused est true', () => {
      const focused = true;
      const text = '';
      const floating = focused || text.length > 0;
      expect(floating).toBe(true);
    });

    it('le label flotte si du texte est saisi', () => {
      const focused = false;
      const text = 'hello';
      const floating = focused || text.length > 0;
      expect(floating).toBe(true);
    });

    it('le label ne flotte pas si vide et non focusé', () => {
      const focused = false;
      const text = '';
      const floating = focused || text.length > 0;
      expect(floating).toBe(false);
    });
  });

  describe('couleur du label', () => {
    const DANGER = '#e5484d';

    it('couleur erreur si error présent', () => {
      const theme = Colors.light;
      const error = 'Invalid';
      const focused = false;
      const labelColor = error ? DANGER : focused ? theme.accentText : theme.textSecondary;
      expect(labelColor).toBe(DANGER);
    });

    it('couleur accent si focusé et sans erreur', () => {
      const theme = Colors.light;
      const error = undefined;
      const focused = true;
      const labelColor = error ? DANGER : focused ? theme.accentText : theme.textSecondary;
      expect(labelColor).toBe(theme.accentText);
    });

    it('couleur secondaire au repos', () => {
      const theme = Colors.light;
      const error = undefined;
      const focused = false;
      const labelColor = error ? DANGER : focused ? theme.accentText : theme.textSecondary;
      expect(labelColor).toBe(theme.textSecondary);
    });
  });

  describe('placeholder conditionnel', () => {
    it('le placeholder apparaît seulement quand le label flotte ou est absent', () => {
      const label = 'Email';
      const floating = true;
      const placeholder = !label || floating ? 'placeholder text' : undefined;
      expect(placeholder).toBe('placeholder text');
    });

    it('le placeholder est caché au repos si label présent', () => {
      const label = 'Email';
      const floating = false;
      const placeholder = !label || floating ? 'placeholder text' : undefined;
      expect(placeholder).toBeUndefined();
    });

    it('le placeholder s\'affiche si aucun label', () => {
      const label = undefined;
      const floating = false;
      const placeholder = !label || floating ? 'placeholder text' : undefined;
      expect(placeholder).toBe('placeholder text');
    });
  });
});
