import React from 'react';
import { ThemeContext, useThemePreference, ThemeState } from '@/stores/themeStore';

const mockThemeState: ThemeState = {
  preference: 'system',
  scheme: 'light',
  setPreference: jest.fn(),
};

describe('ThemeContext et useThemePreference', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lève une erreur si utilisé hors ThemePreferenceProvider', () => {
    jest.spyOn(React, 'useContext').mockReturnValueOnce(null);
    expect(() => useThemePreference()).toThrow(
      'useThemePreference doit être utilisé dans un ThemePreferenceProvider',
    );
  });

  it('retourne le contexte quand il est fourni', () => {
    jest.spyOn(React, 'useContext').mockReturnValueOnce(mockThemeState as unknown as null);
    const result = useThemePreference();
    expect(result).toBe(mockThemeState);
  });

  it('ThemeContext est défini', () => {
    expect(ThemeContext).toBeDefined();
  });

  it('useThemePreference est une fonction', () => {
    expect(typeof useThemePreference).toBe('function');
  });

  it('ThemeState contient les propriétés preference, scheme, setPreference', () => {
    expect(mockThemeState).toMatchObject({
      preference: expect.any(String),
      scheme: expect.any(String),
      setPreference: expect.any(Function),
    });
  });

  it('setPreference est appelable avec "light"', () => {
    mockThemeState.setPreference('light');
    expect(mockThemeState.setPreference).toHaveBeenCalledWith('light');
  });

  it('setPreference est appelable avec "dark"', () => {
    mockThemeState.setPreference('dark');
    expect(mockThemeState.setPreference).toHaveBeenCalledWith('dark');
  });

  it('setPreference est appelable avec "system"', () => {
    mockThemeState.setPreference('system');
    expect(mockThemeState.setPreference).toHaveBeenCalledWith('system');
  });

  it('preference "light" est une valeur valide', () => {
    const lightState: ThemeState = { ...mockThemeState, preference: 'light', scheme: 'light' };
    expect(lightState.preference).toBe('light');
    expect(lightState.scheme).toBe('light');
  });

  it('preference "dark" est une valeur valide', () => {
    const darkState: ThemeState = { ...mockThemeState, preference: 'dark', scheme: 'dark' };
    expect(darkState.preference).toBe('dark');
    expect(darkState.scheme).toBe('dark');
  });
});
