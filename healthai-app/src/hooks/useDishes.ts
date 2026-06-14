import { useCallback, useEffect, useState } from 'react';

import { Dish } from '@/services/api';
import { dishService } from '@/services/dishService';
import { useAuthStore } from '@/stores/authStore';

export function useDishes() {
  const { user } = useAuthStore();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      setDishes(await dishService.list(user.id));
    } catch (err) {
      console.error('useDishes.refresh error:', err);
      setError('Impossible de charger les repas.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { dishes: dishes, loading, error, refresh };
}
