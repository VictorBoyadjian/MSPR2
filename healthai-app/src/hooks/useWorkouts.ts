import { useCallback, useEffect, useState } from 'react';

import { sessionService } from '@/services/sessionService';
import { UserSession } from '@/types/workout-sessions.type';

export function useWorkouts() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSessions(await sessionService.listMine());
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
