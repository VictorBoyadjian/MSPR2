import { useCallback, useEffect, useState } from 'react';

import { Dish } from '@/services/api';
import { mealService } from '@/services/mealService';

export function useMeals() {
  const [meals, setMeals] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setMeals(await mealService.list());
    } catch {
      setError('Impossible de charger les repas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { meals, loading, error, refresh };
}
