import { healthService } from '@/services/healthService';
import * as api from '@/services/api';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  sendRequest: jest.fn(),
  metrics: { search: jest.fn(), mutate: jest.fn(), delete: jest.fn() },
  allergies: { search: jest.fn(), mutate: jest.fn(), delete: jest.fn() },
  goals: { search: jest.fn(), mutate: jest.fn(), delete: jest.fn() },
  dishes: { search: jest.fn(), mutate: jest.fn(), delete: jest.fn() },
  users: { search: jest.fn(), mutate: jest.fn(), delete: jest.fn() },
}));

const mockSendRequest = api.sendRequest as jest.MockedFunction<typeof api.sendRequest>;
const mockMetrics = api.metrics as jest.Mocked<typeof api.metrics>;

describe('healthService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getSportStats', () => {
    it('retourne les stats sport depuis l\'API', async () => {
      const stats = { days: [], weekly_avg_h: 2.5 };
      mockSendRequest.mockResolvedValueOnce({ data: stats });
      const result = await healthService.getSportStats();
      expect(result).toEqual(stats);
      expect(mockSendRequest).toHaveBeenCalledWith('GET', '/me/sessions/stats');
    });
  });

  describe('getCurrentMetric', () => {
    it('retourne la métrique courante', async () => {
      const metric = { id: '1', weight_kg: 75, heart_rate_resting: 65 };
      mockSendRequest.mockResolvedValueOnce({ data: metric });
      const result = await healthService.getCurrentMetric();
      expect(result).toEqual(metric);
    });

    it('retourne null si pas de métrique', async () => {
      mockSendRequest.mockResolvedValueOnce({ data: null });
      const result = await healthService.getCurrentMetric();
      expect(result).toBeNull();
    });
  });

  describe('getWeightHistory', () => {
    it('retourne l\'historique de poids (les entrées NaN sont filtrées, null → 0 reste)', async () => {
      mockMetrics.search.mockResolvedValueOnce({
        current_page: 1,
        data: [
          { id: '1', weight_kg: 75, recorded_at: '2024-01-15', heart_rate_resting: null, user_id: 'u1', created_at: '', updated_at: '' },
          { id: '2', weight_kg: 74, recorded_at: '2024-01-17', heart_rate_resting: null, user_id: 'u1', created_at: '', updated_at: '' },
        ],
        total: 2,
      });
      const result = await healthService.getWeightHistory('u1');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: '2024-01-15', weight: 75 });
      expect(result[1]).toEqual({ date: '2024-01-17', weight: 74 });
    });

    it('filtre les métriques sans poids valide (NaN)', async () => {
      mockMetrics.search.mockResolvedValueOnce({
        current_page: 1,
        data: [
          { id: '1', weight_kg: 'invalid' as unknown as number, recorded_at: '2024-01-15', heart_rate_resting: null, user_id: 'u1', created_at: '', updated_at: '' },
          { id: '2', weight_kg: 70, recorded_at: '2024-01-16', heart_rate_resting: null, user_id: 'u1', created_at: '', updated_at: '' },
        ],
        total: 2,
      });
      const result = await healthService.getWeightHistory('u1');
      // La première entrée a un weight_kg NaN et est filtrée
      expect(result).toHaveLength(1);
      expect(result[0].weight).toBe(70);
    });

    it('retourne un tableau vide si aucune métrique', async () => {
      mockMetrics.search.mockResolvedValueOnce({ current_page: 1, data: [], total: 0 });
      const result = await healthService.getWeightHistory('u1');
      expect(result).toEqual([]);
    });
  });

  describe('saveMetric', () => {
    it('sauvegarde une métrique et retourne le résultat', async () => {
      const saved = { id: '5', weight_kg: 73 };
      mockSendRequest.mockResolvedValueOnce({ data: saved });
      const result = await healthService.saveMetric({ weight_kg: 73 });
      expect(result).toEqual(saved);
      expect(mockSendRequest).toHaveBeenCalledWith('PUT', '/me/metrics', { weight_kg: 73 });
    });
  });
});
