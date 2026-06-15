import { allergies } from '@/services/api';
import { Allergy } from '@/types/allergies.type';

export const allergyService = {
  /** Récupère toutes les allergies (agrège les pages — le jeu de données est petit et fixe). */
  list: async (): Promise<Allergy[]> => {
    const all: Allergy[] = [];
    let page = 1;
    for (;;) {
      const res = await allergies.search({
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
