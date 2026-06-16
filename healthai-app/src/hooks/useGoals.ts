import { useCallback, useEffect, useState } from 'react';

import { goalService } from '@/services/goalService';
import { Goal } from '@/types/goals.type';

export function useGoals() {
  const [items, setItems] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await goalService.list());
    } catch {
      setError('Impossible de charger les programmes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}
