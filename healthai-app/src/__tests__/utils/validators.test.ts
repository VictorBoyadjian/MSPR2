import { isValidEmail, isValidPassword, isNotEmpty } from '@/utils/validators';

describe('isValidEmail', () => {
  it('accepte un email valide', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('victor.boyadjian5@gmail.com')).toBe(true);
    expect(isValidEmail('test+alias@sub.domain.io')).toBe(true);
  });

  it('rejette un email sans @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejette un email sans domaine', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejette un email sans extension', () => {
    expect(isValidEmail('user@domain')).toBe(false);
  });

  it('rejette une chaîne vide', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('ignore les espaces autour', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });
});

describe('isValidPassword', () => {
  it('accepte un mot de passe de 8 caractères ou plus', () => {
    expect(isValidPassword('password')).toBe(true);
    expect(isValidPassword('superlongpassword123!')).toBe(true);
  });

  it('rejette un mot de passe de moins de 8 caractères', () => {
    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('1234567')).toBe(false);
  });

  it('rejette une chaîne vide', () => {
    expect(isValidPassword('')).toBe(false);
  });
});

describe('isNotEmpty', () => {
  it('retourne true pour une chaîne non vide', () => {
    expect(isNotEmpty('hello')).toBe(true);
    expect(isNotEmpty('  texte  ')).toBe(true);
  });

  it('retourne false pour une chaîne vide', () => {
    expect(isNotEmpty('')).toBe(false);
  });

  it('retourne false pour une chaîne uniquement de spaces', () => {
    expect(isNotEmpty('   ')).toBe(false);
  });
});
