import { sessionService } from '@/services/sessionService';
import * as api from '@/services/api';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  sendRequest: jest.fn(),
  workoutSessions: { search: jest.fn(), mutate: jest.fn(), delete: jest.fn() },
  allergies: { search: jest.fn() },
  goals: { search: jest.fn() },
  metrics: { search: jest.fn() },
  dishes: { search: jest.fn() },
  users: { search: jest.fn() },
}));

const mockSendRequest = api.sendRequest as jest.MockedFunction<typeof api.sendRequest>;
const mockWorkoutSessions = api.workoutSessions as jest.Mocked<typeof api.workoutSessions>;

const mockSession = {
  id: 's1',
  name: 'Full Body',
  description: null,
  duration_min: 45,
  exercises: [],
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('sessionService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('search', () => {
    it('retourne les séances correspondant au terme', async () => {
      mockWorkoutSessions.search.mockResolvedValueOnce({ current_page: 1, data: [mockSession], total: 1 });
      const result = await sessionService.search('Full');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Full Body');
    });

    it('n\'ajoute pas de filtre si terme vide', async () => {
      mockWorkoutSessions.search.mockResolvedValueOnce({ current_page: 1, data: [], total: 0 });
      await sessionService.search('   ');
      const call = mockWorkoutSessions.search.mock.calls[0][0];
      expect(call.filters).toEqual([]);
    });

    it('capitalise le terme de recherche', async () => {
      mockWorkoutSessions.search.mockResolvedValueOnce({ current_page: 1, data: [], total: 0 });
      await sessionService.search('full');
      const call = mockWorkoutSessions.search.mock.calls[0][0];
      expect(call.filters?.[0]?.value).toBe('%Full%');
    });
  });

  describe('getById', () => {
    it('retourne la séance correspondant à l\'ID', async () => {
      mockWorkoutSessions.search.mockResolvedValueOnce({ current_page: 1, data: [mockSession], total: 1 });
      const result = await sessionService.getById('s1');
      expect(result).toEqual(mockSession);
    });

    it('retourne null si séance introuvable', async () => {
      mockWorkoutSessions.search.mockResolvedValueOnce({ current_page: 1, data: [], total: 0 });
      const result = await sessionService.getById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getExercises', () => {
    it('retourne les exercices de la séance', async () => {
      const exercises = [{ id: 'e1', name: 'Squat' }];
      mockWorkoutSessions.search.mockResolvedValueOnce({
        current_page: 1,
        data: [{ ...mockSession, exercises }],
        total: 1,
      });
      const result = await sessionService.getExercises('s1');
      expect(result).toEqual(exercises);
    });

    it('retourne un tableau vide si séance introuvable', async () => {
      mockWorkoutSessions.search.mockResolvedValueOnce({ current_page: 1, data: [], total: 0 });
      const result = await sessionService.getExercises('unknown');
      expect(result).toEqual([]);
    });
  });

  describe('listMine', () => {
    it('retourne les séances de l\'utilisateur aplaties', async () => {
      mockSendRequest.mockResolvedValueOnce({
        data: [{
          ...mockSession,
          pivot: { id: 'us1', performed_at: '2024-06-15 10:00:00' },
        }],
      });
      const result = await sessionService.listMine();
      expect(result).toHaveLength(1);
      expect(result[0].userSessionId).toBe('us1');
      expect(result[0].performedAt).toContain('2024-06-15');
    });

    it('utilise une chaîne vide si la séance n\'a pas de pivot', async () => {
      mockSendRequest.mockResolvedValueOnce({
        data: [{ ...mockSession }],
      });
      const result = await sessionService.listMine();
      expect(result[0].userSessionId).toBe('');
      expect(result[0].performedAt).toBe('');
    });
  });

  describe('record', () => {
    it('enregistre une séance', async () => {
      mockSendRequest.mockResolvedValueOnce({});
      await sessionService.record('s1', '2024-06-15T10:00:00Z');
      expect(mockSendRequest).toHaveBeenCalledWith('POST', '/me/sessions', {
        workout_session_id: NaN, // Number('s1') = NaN
        performed_at: '2024-06-15T10:00:00Z',
      });
    });
  });

  describe('remove', () => {
    it('supprime une séance enregistrée', async () => {
      mockSendRequest.mockResolvedValueOnce({});
      await sessionService.remove('us1');
      expect(mockSendRequest).toHaveBeenCalledWith('DELETE', '/me/sessions/us1');
    });
  });

  describe('update', () => {
    it('modifie une séance enregistrée (performedAt seulement)', async () => {
      mockSendRequest.mockResolvedValueOnce({});
      await sessionService.update('us1', { performedAt: '2024-07-01T10:00:00Z' });
      expect(mockSendRequest).toHaveBeenCalledWith('PATCH', '/me/sessions/us1', {
        performed_at: '2024-07-01T10:00:00Z',
      });
    });

    it('modifie une séance enregistrée (workoutSessionId seulement)', async () => {
      mockSendRequest.mockResolvedValueOnce({});
      await sessionService.update('us1', { workoutSessionId: '42' });
      expect(mockSendRequest).toHaveBeenCalledWith('PATCH', '/me/sessions/us1', {
        workout_session_id: 42,
      });
    });

    it('modifie une séance avec workoutSessionId et performedAt', async () => {
      mockSendRequest.mockResolvedValueOnce({});
      await sessionService.update('us1', { workoutSessionId: '7', performedAt: '2024-08-01T08:00:00Z' });
      expect(mockSendRequest).toHaveBeenCalledWith('PATCH', '/me/sessions/us1', {
        workout_session_id: 7,
        performed_at: '2024-08-01T08:00:00Z',
      });
    });
  });
});
