import { handicaps } from '@/services/api';
import { Handicap } from '@/types/handicaps.type';

export const handicapService = {
  /** Récupère tous les handicaps (agrège les pages — le jeu de données est petit et fixe). */
  list: async (): Promise<Handicap[]> => {
    const all: Handicap[] = [];
    let page = 1;
    for (;;) {
      const res = await handicaps.search({
        sorts: [{ field: 'name', direction: 'asc' }],
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
