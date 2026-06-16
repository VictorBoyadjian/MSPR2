import { useCallback, useEffect, useState } from 'react';

import { healthService, MetricInput } from '@/services/healthService';
import { SportStats } from '@/types/health.type';
import { Metric } from '@/types/metrics.type';

export function useHealth() {
  const [stats, setStats] = useState<SportStats | null>(null);
  const [metric, setMetric] = useState<Metric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sportStats, current] = await Promise.all([
        healthService.getSportStats(),
        healthService.getCurrentMetric(),
      ]);
      setStats(sportStats);
      setMetric(current);
    } catch {
      setError('Impossible de charger tes données santé.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Enregistre une mesure du jour et met à jour l'état local avec la métrique renvoyée. */
  const save = useCallback(async (payload: MetricInput) => {
    const updated = await healthService.saveMetric(payload);
    setMetric(updated);
    return updated;
  }, []);

  return { stats, metric, loading, error, refresh, save };
}
