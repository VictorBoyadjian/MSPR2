import { useCallback, useEffect, useState } from 'react';

import { SportSession } from '@/services/api';
import { workoutService } from '@/services/workoutService';

export function useWorkouts() {
  const [sessions, setSessions] = useState<SportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSessions(await workoutService.list());
    } catch {
      setError('Impossible de charger les séances.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, loading, error, refresh };
}
