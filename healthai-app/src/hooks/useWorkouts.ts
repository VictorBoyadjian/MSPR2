import { useCallback, useEffect, useState } from 'react';

import { workoutService } from '@/services/sessionService';
import { useAuthStore } from '@/stores/authStore';
import { SportSession } from '@/types/sport-sessions.type';

export function useWorkouts() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<SportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      setSessions(await workoutService.list(user.id));
    } catch {
      setError('Impossible de charger les séances.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, loading, error, refresh };
}
