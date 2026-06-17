import { handicapService } from '@/services/handicapService';
import * as api from '@/services/api';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  sendRequest: jest.fn(),
  handicaps: { search: jest.fn() },
  allergies: { search: jest.fn() },
  goals: { search: jest.fn() },
  metrics: { search: jest.fn() },
  dishes: { search: jest.fn() },
  users: { search: jest.fn() },
}));

const mockHandicaps = api.handicaps as jest.Mocked<typeof api.handicaps>;

describe('handicapService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne un tableau vide si aucun handicap', async () => {
    mockHandicaps.search.mockResolvedValueOnce({ current_page: 1, data: [], last_page: 1, total: 0 });
    const result = await handicapService.list();
    expect(result).toEqual([]);
  });

  it('récupère les handicaps d\'une page', async () => {
    const data = [
      { id: '1', name: 'Mobilité réduite', created_at: '', updated_at: '' },
      { id: '2', name: 'Dos fragile', created_at: '', updated_at: '' },
    ];
    mockHandicaps.search.mockResolvedValueOnce({ current_page: 1, data, last_page: 1, total: 2 });
    const result = await handicapService.list();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Mobilité réduite');
  });

  it('agrège plusieurs pages', async () => {
    const page1 = [{ id: '1', name: 'A', created_at: '', updated_at: '' }];
    const page2 = [{ id: '2', name: 'B', created_at: '', updated_at: '' }];
    mockHandicaps.search
      .mockResolvedValueOnce({ current_page: 1, data: page1, last_page: 2, total: 2 })
      .mockResolvedValueOnce({ current_page: 2, data: page2, last_page: 2, total: 2 });
    const result = await handicapService.list();
    expect(result).toHaveLength(2);
  });

  it('passe le tri par nom asc', async () => {
    mockHandicaps.search.mockResolvedValueOnce({ current_page: 1, data: [], last_page: 1, total: 0 });
    await handicapService.list();
    expect(mockHandicaps.search).toHaveBeenCalledWith(
      expect.objectContaining({ sorts: [{ field: 'name', direction: 'asc' }] }),
    );
  });
});
