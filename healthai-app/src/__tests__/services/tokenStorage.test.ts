import { Platform } from 'react-native';
import { tokenStorage } from '@/services/tokenStorage';
import * as SecureStore from 'expo-secure-store';

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('tokenStorage (native)', () => {
  beforeEach(() => {
    (Platform as { OS: string }).OS = 'ios';
    jest.clearAllMocks();
  });

  it('get() lit depuis SecureStore', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('stored-token');
    const token = await tokenStorage.get();
    expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('healthai_token');
    expect(token).toBe('stored-token');
  });

  it('get() retourne null si rien en store', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
    const token = await tokenStorage.get();
    expect(token).toBeNull();
  });

  it('set() écrit dans SecureStore', async () => {
    await tokenStorage.set('new-token');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('healthai_token', 'new-token');
  });

  it('clear() supprime du SecureStore', async () => {
    await tokenStorage.clear();
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('healthai_token');
  });
});

describe('tokenStorage (web)', () => {
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

  it('get() lit depuis localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('web-token');
    const token = await tokenStorage.get();
    expect(token).toBe('web-token');
  });

  it('set() écrit dans localStorage', async () => {
    await tokenStorage.set('web-token');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('healthai_token', 'web-token');
  });

  it('clear() supprime de localStorage', async () => {
    await tokenStorage.clear();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('healthai_token');
  });
});
