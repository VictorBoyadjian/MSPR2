jest.mock('@/constants/config', () => ({
  CONFIG: {
    AI_IMAGE_SOURCE: 'MISTRAL',
    IMAGE_API_URL: 'https://test-image-api.example.com',
    API_TIMEOUT_MS: 5000,
    API_BASE_URL: 'https://test-api.example.com',
    TOKEN_STORAGE_KEY: 'test_token',
    RECO_API_URL: 'https://test-reco.example.com',
  },
}));

jest.mock('@/services/api', () => ({
  getToken: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  __esModule: true,
  SaveFormat: { JPEG: 'jpeg' },
  ImageManipulator: {
    manipulate: jest.fn(),
  },
}));

import { ImageManipulator } from 'expo-image-manipulator';
import * as apiModule from '@/services/api';
import { compressAndConvertImageToBase64, scanDishService } from '@/services/scanDishService';

const mockManipulate = ImageManipulator.manipulate as jest.Mock;
const mockGetToken = apiModule.getToken as jest.MockedFunction<typeof apiModule.getToken>;

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// > 524288 bytes: length > 699050 chars
const SMALL_BASE64 = 'A'.repeat(100);
const LARGE_BASE64 = 'A'.repeat(700000);

function mockAttempt(base64: string | undefined) {
  const mockSaveAsync = jest.fn().mockResolvedValueOnce({ base64 });
  const mockRenderAsync = jest.fn().mockResolvedValueOnce({ saveAsync: mockSaveAsync });
  mockManipulate.mockReturnValueOnce({ resize: jest.fn(), renderAsync: mockRenderAsync });
}

describe('compressAndConvertImageToBase64', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne le base64 immédiatement si la taille est acceptable', async () => {
    mockAttempt(SMALL_BASE64);
    const result = await compressAndConvertImageToBase64('file://photo.jpg');
    expect(result).toBe(SMALL_BASE64);
    expect(mockManipulate).toHaveBeenCalledTimes(1);
  });

  it('réduit la compression si l\'image dépasse 512 Ko puis réussit', async () => {
    mockAttempt(LARGE_BASE64);
    mockAttempt(SMALL_BASE64);
    const result = await compressAndConvertImageToBase64('file://photo.jpg');
    expect(result).toBe(SMALL_BASE64);
    expect(mockManipulate).toHaveBeenCalledTimes(2);
  });

  it('réduit la largeur quand compress atteint le minimum (≤ 0.4)', async () => {
    // compress: 0.8 → 0.65 → 0.5 → 0.35 (ici switch to width), ensuite succès
    for (let i = 0; i < 4; i++) mockAttempt(LARGE_BASE64);
    mockAttempt(SMALL_BASE64);
    const result = await compressAndConvertImageToBase64('file://photo.jpg');
    expect(result).toBe(SMALL_BASE64);
    expect(mockManipulate).toHaveBeenCalledTimes(5);
  });

  it('lève une erreur si base64 est absent du résultat', async () => {
    mockAttempt(undefined);
    await expect(compressAndConvertImageToBase64('file://photo.jpg')).rejects.toThrow(
      "Échec de l'encodage base64 de l'image",
    );
  });

  it('lève une erreur après 6 tentatives infructueuses', async () => {
    for (let i = 0; i < 6; i++) mockAttempt(LARGE_BASE64);
    await expect(compressAndConvertImageToBase64('file://photo.jpg')).rejects.toThrow(
      "Impossible de compresser l'image sous 500 Ko",
    );
    expect(mockManipulate).toHaveBeenCalledTimes(6);
  });
});

describe('scanDishService.scan', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lève une erreur si l\'utilisateur n\'est pas authentifié', async () => {
    mockGetToken.mockReturnValue(null);
    await expect(scanDishService.scan('file://photo.jpg')).rejects.toThrow(
      'Vous devez être connecté pour analyser un plat',
    );
  });

  it('appelle l\'endpoint analyze-by-mistral pour AI_IMAGE_SOURCE MISTRAL', async () => {
    mockGetToken.mockReturnValue('tok123');
    mockAttempt(SMALL_BASE64);
    const splittedDish = { aliments: [{ name: 'Pomme', calories: 50 }] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => splittedDish,
    } as Response);

    const result = await scanDishService.scan('file://photo.jpg');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('analyze-by-mistral'),
      expect.any(Object),
    );
    expect(result).toEqual(splittedDish);
  });

  it('lève une erreur si la réponse HTTP n\'est pas ok', async () => {
    mockGetToken.mockReturnValue('tok123');
    mockAttempt(SMALL_BASE64);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as Response);

    await expect(scanDishService.scan('file://photo.jpg')).rejects.toThrow('503');
  });

  it('lève une erreur si la réponse ne contient pas d\'aliments', async () => {
    mockGetToken.mockReturnValue('tok123');
    mockAttempt(SMALL_BASE64);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ other: 'data' }),
    } as Response);

    await expect(scanDishService.scan('file://photo.jpg')).rejects.toThrow(
      "Erreur lors de l'analyse de l'image",
    );
  });

  it('envoie le token dans le header Authorization', async () => {
    mockGetToken.mockReturnValue('mytoken');
    mockAttempt(SMALL_BASE64);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ aliments: [] }),
    } as Response);

    await scanDishService.scan('file://photo.jpg');
    const [, opts] = mockFetch.mock.calls[0];
    expect((opts as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer mytoken',
    });
  });

  it('sérialise l\'image en base64 dans le body', async () => {
    mockGetToken.mockReturnValue('tok');
    mockAttempt(SMALL_BASE64);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ aliments: [] }),
    } as Response);

    await scanDishService.scan('file://image.jpg');
    const [, opts] = mockFetch.mock.calls[0];
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body).toHaveProperty('base64_image', SMALL_BASE64);
  });
});
