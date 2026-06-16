import { metrics, sendRequest } from '@/services/api';
import { SportStats, WeightPoint } from '@/types/health.type';
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

  /**
   * Historique de poids de l'utilisateur (du plus ancien au plus récent), pour tracer
   * la courbe d'évolution. On filtre les métriques sans poids côté client.
   */
  getWeightHistory: async (userId: string): Promise<WeightPoint[]> => {
    const res = await metrics.search({
      filters: [{ field: 'user_id', operator: 'like', value: userId }],
      sorts: [{ field: 'recorded_at', direction: 'asc' }],
      limit: 50,
    });
    return res.data
      .map((m) => ({ date: String(m.recorded_at).slice(0, 10), weight: Number(m.weight_kg) }))
      .filter((p) => Number.isFinite(p.weight));
  },

  /** Enregistre les mesures du jour (upsert : une seule métrique par jour). */
  saveMetric: async (payload: MetricInput): Promise<Metric> => {
    const res = await sendRequest<{ data: Metric }>('PUT', '/me/metrics', payload);
    return res.data;
  },
};
