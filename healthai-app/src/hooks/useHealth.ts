import { useCallback, useEffect, useState } from 'react';

import { healthService, MetricInput } from '@/services/healthService';
import { useAuthStore } from '@/stores/authStore';
import { SportStats, WeightPoint } from '@/types/health.type';
import { Metric } from '@/types/metrics.type';

export function useHealth() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const [stats, setStats] = useState<SportStats | null>(null);
  const [metric, setMetric] = useState<Metric | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sportStats, current, history] = await Promise.all([
        healthService.getSportStats(),
        healthService.getCurrentMetric(),
        userId ? healthService.getWeightHistory(userId) : Promise.resolve<WeightPoint[]>([]),
      ]);
      setStats(sportStats);
      setMetric(current);
      setWeightHistory(history);
    } catch {
      setError('Impossible de charger tes données santé.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Enregistre une mesure du jour et met à jour l'état local avec la métrique renvoyée. */
  const save = useCallback(async (payload: MetricInput) => {
    const updated = await healthService.saveMetric(payload);
    setMetric(updated);

    // Reflète tout de suite la mesure du jour dans la courbe (upsert par date).
    const weight = Number(updated.weight_kg);
    if (Number.isFinite(weight)) {
      const date = String(updated.recorded_at).slice(0, 10);
      setWeightHistory((prev) => {
        const rest = prev.filter((p) => p.date !== date);
        return [...rest, { date, weight }].sort((a, b) => a.date.localeCompare(b.date));
      });
    }
    return updated;
  }, []);

  return { stats, metric, weightHistory, loading, error, refresh, save };
}
