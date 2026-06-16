import { sendRequest } from '@/services/api';
import { SportStats } from '@/types/health.type';
import { Metric } from '@/types/metrics.type';

/** Mesures santé saisissables par l'utilisateur (une métrique par jour côté API). */
export type MetricInput = Partial<{
  weight_kg: number;
  heart_rate_resting: number;
}>;

export const healthService = {
  /** Statistiques sport (heures par jour cette semaine + moyenne hebdo), calculées par l'API. */
  getSportStats: async (): Promise<SportStats> => {
    const res = await sendRequest<{ data: SportStats }>('GET', '/me/sessions/stats');
    return res.data;
  },

  /** Métrique santé la plus récente (poids, pouls au repos), ou null si aucune. */
  getCurrentMetric: async (): Promise<Metric | null> => {
    const res = await sendRequest<{ data: Metric | null }>('GET', '/me/metrics/current');
    return res.data;
  },

  /** Enregistre les mesures du jour (upsert : une seule métrique par jour). */
  saveMetric: async (payload: MetricInput): Promise<Metric> => {
    const res = await sendRequest<{ data: Metric }>('PUT', '/me/metrics', payload);
    return res.data;
  },
};
