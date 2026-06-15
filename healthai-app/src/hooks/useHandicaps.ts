import { useCallback, useEffect, useState } from 'react';

import { handicapService } from '@/services/handicapService';
import { Handicap } from '@/types/handicaps.type';

export function useHandicaps() {
  const [items, setItems] = useState<Handicap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await handicapService.list());
    } catch {
      setError('Impossible de charger la liste des handicaps.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}
