import { allergyService } from '@/services/allergyService';
import { goalService } from '@/services/goalService';
import * as api from '@/services/api';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  sendRequest: jest.fn(),
  allergies: { search: jest.fn() },
  goals: { search: jest.fn() },
  metrics: { search: jest.fn(), mutate: jest.fn() },
  dishes: { search: jest.fn(), mutate: jest.fn(), delete: jest.fn() },
  users: { search: jest.fn() },
}));

const mockAllergies = api.allergies as jest.Mocked<typeof api.allergies>;
const mockGoals = api.goals as jest.Mocked<typeof api.goals>;

describe('allergyService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne un tableau vide si aucune allergie', async () => {
    mockAllergies.search.mockResolvedValueOnce({ current_page: 1, data: [], last_page: 1, total: 0 });
    const result = await allergyService.list();
    expect(result).toEqual([]);
  });

  it('récupère une page d\'allergies', async () => {
    const allergies = [
      { id: '1', name: 'Gluten', created_at: '', updated_at: '' },
      { id: '2', name: 'Lactose', created_at: '', updated_at: '' },
    ];
    mockAllergies.search.mockResolvedValueOnce({ current_page: 1, data: allergies, last_page: 1, total: 2 });
    const result = await allergyService.list();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Gluten');
  });

  it('agrège plusieurs pages d\'allergies', async () => {
    const page1 = [{ id: '1', name: 'Gluten', created_at: '', updated_at: '' }];
    const page2 = [{ id: '2', name: 'Lactose', created_at: '', updated_at: '' }];
    mockAllergies.search
      .mockResolvedValueOnce({ current_page: 1, data: page1, last_page: 2, total: 2 })
      .mockResolvedValueOnce({ current_page: 2, data: page2, last_page: 2, total: 2 });
    const result = await allergyService.list();
    expect(result).toHaveLength(2);
  });

  it('passe les bons paramètres de tri', async () => {
    mockAllergies.search.mockResolvedValueOnce({ current_page: 1, data: [], last_page: 1, total: 0 });
    await allergyService.list();
    expect(mockAllergies.search).toHaveBeenCalledWith(
      expect.objectContaining({ sorts: [{ field: 'name', direction: 'asc' }] }),
    );
  });
});

describe('goalService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne un tableau vide si aucun goal', async () => {
    mockGoals.search.mockResolvedValueOnce({ current_page: 1, data: [], last_page: 1, total: 0 });
    const result = await goalService.list();
    expect(result).toEqual([]);
  });

  it('récupère les goals', async () => {
    const goals = [
      { id: '1', name: 'weightloss', label: 'Perte de poids', created_at: '', updated_at: '' },
    ];
    mockGoals.search.mockResolvedValueOnce({ current_page: 1, data: goals, last_page: 1, total: 1 });
    const result = await goalService.list();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('weightloss');
  });

  it('agrège plusieurs pages de goals', async () => {
    const page1 = [{ id: '1', name: 'weightloss', label: null, created_at: '', updated_at: '' }];
    const page2 = [{ id: '2', name: 'muscle_gain', label: null, created_at: '', updated_at: '' }];
    mockGoals.search
      .mockResolvedValueOnce({ current_page: 1, data: page1, last_page: 2, total: 2 })
      .mockResolvedValueOnce({ current_page: 2, data: page2, last_page: 2, total: 2 });
    const result = await goalService.list();
    expect(result).toHaveLength(2);
  });
});
