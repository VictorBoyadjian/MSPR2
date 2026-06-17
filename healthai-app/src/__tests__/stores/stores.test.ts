import { useDishStore } from '@/stores/dishStore';
import { useSessionStore } from '@/stores/sessionStore';

describe('dishStore', () => {
  it('useDishStore est une fonction', () => {
    expect(typeof useDishStore).toBe('function');
  });

  it('useDishStore retourne undefined (stub)', () => {
    expect(useDishStore()).toBeUndefined();
  });
});

describe('sessionStore', () => {
  it('useSessionStore est une fonction', () => {
    expect(typeof useSessionStore).toBe('function');
  });

  it('useSessionStore retourne undefined (stub)', () => {
    expect(useSessionStore()).toBeUndefined();
  });
});
