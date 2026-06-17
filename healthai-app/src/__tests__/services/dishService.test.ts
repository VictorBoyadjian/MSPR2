import { dishService } from '@/services/dishService';
import * as api from '@/services/api';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  sendRequest: jest.fn(),
  dishes: { search: jest.fn(), mutate: jest.fn(), delete: jest.fn() },
  users: { search: jest.fn() },
  allergies: { search: jest.fn() },
  goals: { search: jest.fn() },
  metrics: { search: jest.fn() },
}));

const mockDishes = api.dishes as jest.Mocked<typeof api.dishes>;

const mockDish = {
  id: 'd1',
  name: 'Salade César',
  meal_type: 'lunch' as const,
  calories_kcal: 350,
  proteins_g: 20,
  carbs_g: 15,
  fats_g: 25,
  user_id: 'u1',
  eated_at: '2024-06-15',
  created_at: '',
  updated_at: '',
};

describe('dishService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('list', () => {
    it('retourne les plats d\'un utilisateur', async () => {
      mockDishes.search.mockResolvedValueOnce({ current_page: 1, data: [mockDish], total: 1 });
      const result = await dishService.list('u1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Salade César');
    });

    it('passe le filtre user_id et tri desc', async () => {
      mockDishes.search.mockResolvedValueOnce({ current_page: 1, data: [], total: 0 });
      await dishService.list('u1');
      expect(mockDishes.search).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: [{ field: 'user_id', operator: 'like', value: 'u1' }],
          sorts: [{ field: 'id', direction: 'desc' }],
        }),
      );
    });

    it('retourne un tableau vide si aucun plat', async () => {
      mockDishes.search.mockResolvedValueOnce({ current_page: 1, data: [], total: 0 });
      const result = await dishService.list('u1');
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('appelle mutate avec operation create', async () => {
      mockDishes.mutate.mockResolvedValueOnce({ created: ['d2'], updated: [] });
      const input = { name: 'Omelette', meal_type: 'breakfast' as const, user_id: 'u1' };
      await dishService.create(input);
      expect(mockDishes.mutate).toHaveBeenCalledWith([
        { operation: 'create', attributes: input },
      ]);
    });
  });

  describe('getById', () => {
    it('retourne le plat correspondant à l\'ID', async () => {
      mockDishes.search.mockResolvedValueOnce({ current_page: 1, data: [mockDish], total: 1 });
      const result = await dishService.getById('d1');
      expect(result).toEqual(mockDish);
    });
  });

  describe('update', () => {
    it('appelle mutate avec operation update', async () => {
      mockDishes.mutate.mockResolvedValueOnce({ created: [], updated: ['d1'] });
      const input = { ...mockDish };
      await dishService.update('d1', input);
      expect(mockDishes.mutate).toHaveBeenCalledWith([
        { operation: 'update', key: 'd1', attributes: input },
      ]);
    });
  });

  describe('remove', () => {
    it('appelle delete avec l\'ID du plat', async () => {
      mockDishes.delete.mockResolvedValueOnce({ data: [] });
      await dishService.remove('d1');
      expect(mockDishes.delete).toHaveBeenCalledWith(['d1']);
    });
  });
});
