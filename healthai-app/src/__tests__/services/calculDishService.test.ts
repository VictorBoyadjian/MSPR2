import { calculDishService } from '@/services/calculDishService';
import * as api from '@/services/api';
import { splittedDish } from '@/types/splittedDish';

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  getToken: jest.fn(),
}));
const mockGetToken = api.getToken as jest.MockedFunction<typeof api.getToken>;

const mockDishInput: splittedDish = {
  aliments: {
    Laitue: { quantity_g: 200 },
    Poulet: { quantity_g: 150 },
  },
};

const mockResponse = {
  dish_name: 'Salade César',
  kcal: 150,
  proteins_g: 10,
  carbs_g: 8,
  fats_g: 5,
};

describe('calculDishService.calculate', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockGetToken.mockReset();
  });

  it('lève une erreur si pas de token', async () => {
    mockGetToken.mockReturnValueOnce(null);
    await expect(calculDishService.calculate(mockDishInput)).rejects.toThrow(
      'Vous devez être connecté',
    );
  });

  it('effectue une requête POST avec le bon payload', async () => {
    mockGetToken.mockReturnValueOnce('valid-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await calculDishService.calculate(mockDishInput);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/dish-calculate'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockDishInput),
        headers: expect.objectContaining({ Authorization: 'Bearer valid-token' }),
      }),
    );
  });

  it('retourne la réponse si valide', async () => {
    mockGetToken.mockReturnValueOnce('valid-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await calculDishService.calculate(mockDishInput);
    expect(result.dish_name).toBe('Salade César');
    expect(result.kcal).toBe(150);
  });

  it('lève une erreur si la réponse HTTP n\'est pas ok', async () => {
    mockGetToken.mockReturnValueOnce('valid-token');
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => null,
    } as Response);

    await expect(calculDishService.calculate(mockDishInput)).rejects.toThrow(
      "Erreur lors de l'analyse de l'image",
    );
  });

  it('lève une erreur si dish_name absent dans la réponse', async () => {
    mockGetToken.mockReturnValueOnce('valid-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ kcal: 200 }),
    } as Response);

    await expect(calculDishService.calculate(mockDishInput)).rejects.toThrow(
      'Réponse invalide',
    );
  });

  it('lève une erreur si kcal absent dans la réponse', async () => {
    mockGetToken.mockReturnValueOnce('valid-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dish_name: 'Test' }),
    } as Response);

    await expect(calculDishService.calculate(mockDishInput)).rejects.toThrow(
      'Réponse invalide',
    );
  });
});
