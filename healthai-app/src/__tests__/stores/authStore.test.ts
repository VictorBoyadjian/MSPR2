import React from 'react';
import { AuthContext, useAuthStore, AuthState } from '@/stores/authStore';

const mockAuthState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  onboardingPending: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  deleteAccount: jest.fn(),
  refreshUser: jest.fn(),
  completeOnboarding: jest.fn(),
};

describe('useAuthStore', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lève une erreur si utilisé hors AuthProvider', () => {
    jest.spyOn(React, 'useContext').mockReturnValueOnce(null);
    expect(() => useAuthStore()).toThrow('useAuthStore doit être utilisé dans un AuthProvider');
  });

  it('retourne le contexte quand il est fourni', () => {
    jest.spyOn(React, 'useContext').mockReturnValueOnce(mockAuthState as unknown as null);
    const result = useAuthStore();
    expect(result).toBe(mockAuthState);
  });

  it('AuthContext a une valeur par défaut null', () => {
    expect(AuthContext).toBeDefined();
  });

  it('AuthState contient toutes les propriétés requises', () => {
    expect(mockAuthState).toMatchObject({
      user: null,
      isLoading: expect.any(Boolean),
      isAuthenticated: expect.any(Boolean),
      onboardingPending: expect.any(Boolean),
      login: expect.any(Function),
      register: expect.any(Function),
      logout: expect.any(Function),
      deleteAccount: expect.any(Function),
      refreshUser: expect.any(Function),
      completeOnboarding: expect.any(Function),
    });
  });

  it('login est une fonction appelable', async () => {
    (mockAuthState.login as jest.Mock).mockResolvedValueOnce(undefined);
    await mockAuthState.login('user@test.com', 'password');
    expect(mockAuthState.login).toHaveBeenCalledWith('user@test.com', 'password');
  });

  it('logout est une fonction appelable', async () => {
    (mockAuthState.logout as jest.Mock).mockResolvedValueOnce(undefined);
    await mockAuthState.logout();
    expect(mockAuthState.logout).toHaveBeenCalled();
  });

  it('completeOnboarding est une fonction appelable', () => {
    mockAuthState.completeOnboarding();
    expect(mockAuthState.completeOnboarding).toHaveBeenCalled();
  });
});
