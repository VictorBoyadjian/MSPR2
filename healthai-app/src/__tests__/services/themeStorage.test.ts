import { Platform } from 'react-native';
import { themeStorage } from '@/services/themeStorage';
import * as SecureStore from 'expo-secure-store';

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('themeStorage (native)', () => {
  beforeEach(() => {
    (Platform as { OS: string }).OS = 'ios';
    jest.clearAllMocks();
  });

  it('get() retourne "light" si stocké', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('light');
    const result = await themeStorage.get();
    expect(result).toBe('light');
  });

  it('get() retourne "dark" si stocké', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('dark');
    const result = await themeStorage.get();
    expect(result).toBe('dark');
  });

  it('get() retourne "system" si stocké', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('system');
    const result = await themeStorage.get();
    expect(result).toBe('system');
  });

  it('get() retourne null si valeur invalide', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('invalid');
    const result = await themeStorage.get();
    expect(result).toBeNull();
  });

  it('get() retourne null si rien en store', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
    const result = await themeStorage.get();
    expect(result).toBeNull();
  });

  it('set() écrit dans SecureStore', async () => {
    await themeStorage.set('dark');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('healthai.theme-preference', 'dark');
  });

  it('set() accepte toutes les préférences valides', async () => {
    for (const pref of ['light', 'dark', 'system'] as const) {
      await themeStorage.set(pref);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('healthai.theme-preference', pref);
    }
  });
});

describe('themeStorage (web)', () => {
  const storage: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: jest.fn((key: string) => storage[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { storage[key] = value; }),
    removeItem: jest.fn((key: string) => { delete storage[key]; }),
  };

  beforeEach(() => {
    (Platform as { OS: string }).OS = 'web';
    (globalThis as { localStorage?: typeof mockLocalStorage }).localStorage = mockLocalStorage;
    jest.clearAllMocks();
    Object.keys(storage).forEach((k) => delete storage[k]);
  });

  afterAll(() => {
    (Platform as { OS: string }).OS = 'ios';
  });

  it('get() lit "light" depuis localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('light');
    const result = await themeStorage.get();
    expect(result).toBe('light');
  });

  it('get() retourne null si valeur inconnue dans localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('garbage');
    const result = await themeStorage.get();
    expect(result).toBeNull();
  });

  it('set() écrit dans localStorage', async () => {
    await themeStorage.set('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('healthai.theme-preference', 'dark');
  });
});
