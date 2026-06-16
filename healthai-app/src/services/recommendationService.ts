// Service du moteur de recommandation ML. Host dédié (CONFIG.RECO_API_URL),
// authentifié avec le même bearer que l'API métier (cf. API de reconnaissance d'images).
import { CONFIG } from '@/constants/config';
import { getToken } from '@/services/api';
import { CaloriesInput, CaloriesOutput, MealsInput, MealsOutput } from '@/types/nutrition.type';
import { FeedbackInput, RecommendInput, RecommendOutput } from '@/types/recommendation.type';
import { SessionsRecoInput, SessionsRecoOutput } from '@/types/workout-sessions.type';

async function recoPost<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT_MS);
  const token = getToken();
  try {
    const response = await fetch(`${CONFIG.RECO_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Reco API ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const recommendationService = {
  /** Prédit le profil fitness de l'utilisateur et retourne un programme + classement. */
  recommend: (input: RecommendInput) => recoPost<RecommendOutput>('/recommend', input),

  /** Objectif calorique journalier (Harris-Benedict) selon le profil et le poids cible. */
  calories: (input: CaloriesInput) => recoPost<CaloriesOutput>('/nutrition/calories', input),

  /** Repas complets adaptés au profil, filtrés par allergènes et type de repas. */
  meals: (input: MealsInput) => recoPost<MealsOutput>('/nutrition/meals', input),

  /** Séances de sport adaptées au profil, filtrées par type et parties du corps. */
  sessions: (input: SessionsRecoInput) => recoPost<SessionsRecoOutput>('/sessions/exercises', input),

  /**
   * Envoie au moteur le profil réellement choisi pour qu'il compare à sa prédiction.
   * Non bloquant : on ignore les erreurs (le feedback n'est pas critique).
   */
  feedback: (input: FeedbackInput) =>
    recoPost<unknown>('/logs/feedback', input).catch(() => undefined),
};
