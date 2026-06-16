// Service du moteur de recommandation ML. Base URL et auth distinctes de l'API métier :
// pas de token, host dédié (CONFIG.RECO_API_URL).
import { CONFIG } from '@/constants/config';
import { RecommendInput, RecommendOutput } from '@/types/recommendation.type';

async function recoPost<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT_MS);
  try {
    const response = await fetch(`${CONFIG.RECO_API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
};
