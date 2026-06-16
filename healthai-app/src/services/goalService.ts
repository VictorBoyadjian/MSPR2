import { goals } from '@/services/api';
import { Goal } from '@/types/goals.type';

export const goalService = {
  /** Récupère tous les goals (agrège les pages — jeu de données petit et fixe). */
  list: async (): Promise<Goal[]> => {
    const all: Goal[] = [];
    let page = 1;
    for (;;) {
      const res = await goals.search({
        sorts: [{ field: 'id', direction: 'asc' }],
        limit: 50,
        page,
      });
      all.push(...res.data);
      if (!res.last_page || page >= res.last_page) break;
      page += 1;
    }
    return all;
  },
};
