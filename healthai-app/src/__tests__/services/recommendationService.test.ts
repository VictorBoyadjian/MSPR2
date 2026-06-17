import { recommendationService } from '@/services/recommendationService';
import * as api from '@/services/api';

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  getToken: jest.fn(() => 'test-token'),
  sendRequest: jest.fn(),
}));

const mockInput = {
  age: 30,
  gender: 'male' as const,
  weight_kg: 75,
  height_cm: 180,
  body_fat_pct: 15,
  resting_bpm: 65,
  experience_level: 'intermediate' as const,
};

const mockProgram = {
  sessions_per_week: 3,
  session_duration_min: 45,
  focus: 'cardio',
  intensity: 'moderate',
  weekly_volume_h: 2.25,
  progression: 'linear',
  nutrition_tip: 'eat well',
  objective: 'lose weight',
};

describe('recommendationService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('recommend', () => {
    it('appelle /recommend et retourne le résultat', async () => {
      const mockOutput = {
        prediction_id: 'p1',
        profile: 'weightloss',
        confidence: 0.9,
        top_profiles: [],
        bmi: 23,
        bmi_category: 'normal',
        program: mockProgram,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOutput,
      } as Response);

      const result = await recommendationService.recommend(mockInput);
      expect(result).toEqual(mockOutput);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/recommend'),
        expect.objectContaining({ method: 'POST', body: JSON.stringify(mockInput) }),
      );
    });

    it('lève une erreur si la réponse n\'est pas ok', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 422 } as Response);
      await expect(recommendationService.recommend(mockInput)).rejects.toThrow('Reco API 422');
    });
  });

  describe('calories', () => {
    it('appelle /nutrition/calories', async () => {
      const caloriesInput = {
        age: 30, gender: 'male' as const, weight_kg: 75, height_cm: 180,
        target_weight_kg: 70, weeks_to_goal: 12, profile: 'weightloss',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ daily_calories_target: 2000 }),
      } as Response);
      const result = await recommendationService.calories(caloriesInput);
      expect((result as { daily_calories_target: number }).daily_calories_target).toBe(2000);
    });
  });

  describe('meals', () => {
    it('appelle /nutrition/meals', async () => {
      const mealsInput = { profile: 'weightloss', allergens_to_exclude: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ meals: [], count: 0 }),
      } as Response);
      await recommendationService.meals(mealsInput);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/nutrition/meals'),
        expect.any(Object),
      );
    });
  });

  describe('feedback', () => {
    it('appelle /logs/feedback et ne lève pas d\'erreur si OK', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);
      await expect(recommendationService.feedback({ prediction_id: 'p1', chosen_profile: 'weightloss' })).resolves.not.toThrow();
    });

    it('retourne undefined sans throw si l\'API échoue', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 } as Response);
      const result = await recommendationService.feedback({ prediction_id: 'p1', chosen_profile: 'weightloss' });
      expect(result).toBeUndefined();
    });
  });
});
