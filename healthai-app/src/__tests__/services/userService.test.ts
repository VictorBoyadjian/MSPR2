import { userService } from '@/services/userService';
import * as api from '@/services/api';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  sendRequest: jest.fn(),
  users: { search: jest.fn(), mutate: jest.fn(), delete: jest.fn() },
  allergies: { search: jest.fn() },
  goals: { search: jest.fn() },
  metrics: { search: jest.fn() },
  dishes: { search: jest.fn(), mutate: jest.fn(), delete: jest.fn() },
}));

const mockSendRequest = api.sendRequest as jest.MockedFunction<typeof api.sendRequest>;
const mockUsers = api.users as jest.Mocked<typeof api.users>;

const mockUser = {
  id: 'u1',
  email: 'test@test.com',
  first_name: 'Jean',
  last_name: 'Dupont',
  age: 30,
  gender: 'male' as const,
  weight_kg: 75,
  height_cm: 180,
  bodyfat: 15,
  rest_bpm: 65,
  sport_per_week: 4,
  goal_id: null,
  target_weight: 70,
  weeks_to_goal: 12,
  is_premium: false,
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  allergies: [],
  handicaps: [],
};

describe('userService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getWithRelations', () => {
    it('recherche l\'utilisateur avec ses relations', async () => {
      mockUsers.search.mockResolvedValueOnce({ current_page: 1, data: [mockUser], total: 1 });
      const result = await userService.getWithRelations('u1');
      expect(result).toEqual(mockUser);
      expect(mockUsers.search).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: [{ field: 'id', operator: 'like', value: 'u1' }],
          includes: expect.arrayContaining([
            { relation: 'allergies' },
            { relation: 'handicaps' },
          ]),
        }),
      );
    });

    it('retourne undefined si utilisateur non trouvé', async () => {
      mockUsers.search.mockResolvedValueOnce({ current_page: 1, data: [], total: 0 });
      const result = await userService.getWithRelations('unknown');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('envoie un PATCH /me avec les attributs', async () => {
      mockSendRequest.mockResolvedValueOnce(mockUser);
      await userService.update({ first_name: 'Pierre', age: 25 });
      expect(mockSendRequest).toHaveBeenCalledWith('PATCH', '/me', { first_name: 'Pierre', age: 25 });
    });

    it('inclut les allergies si fourni', async () => {
      mockSendRequest.mockResolvedValueOnce(mockUser);
      await userService.update({ weight_kg: 70 }, ['1', '3']);
      expect(mockSendRequest).toHaveBeenCalledWith('PATCH', '/me', {
        weight_kg: 70,
        allergies: [1, 3],
      });
    });

    it('inclut les handicaps si fourni', async () => {
      mockSendRequest.mockResolvedValueOnce(mockUser);
      await userService.update({ weight_kg: 70 }, undefined, ['2']);
      expect(mockSendRequest).toHaveBeenCalledWith('PATCH', '/me', {
        weight_kg: 70,
        handicaps: [2],
      });
    });

    it('n\'inclut pas les allergies si undefined', async () => {
      mockSendRequest.mockResolvedValueOnce(mockUser);
      await userService.update({ age: 30 });
      const call = mockSendRequest.mock.calls[0][2] as Record<string, unknown>;
      expect(call).not.toHaveProperty('allergies');
      expect(call).not.toHaveProperty('handicaps');
    });
  });
});
