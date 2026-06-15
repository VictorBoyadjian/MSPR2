import { useCallback, useEffect, useState } from 'react';

import { allergyService } from '@/services/allergyService';
import { Allergy } from '@/types/allergies.type';

export function useAllergies() {
  const [items, setItems] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await allergyService.list());
    } catch {
      setError('Impossible de charger la liste des allergies.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}
