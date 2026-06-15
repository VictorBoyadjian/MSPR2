import { users } from '@/services/api';
import { User } from '@/types/users.type';

/** Champs profil éditables (issus de l'onboarding, colonnes table users). */
export type UpdateUserAttributes = Partial<{
  first_name: string;
  last_name: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  bodyfat: number;
  rest_bpm: number;
  sport_per_week: number;
}>;

export const userService = {
  /** Récupère l'utilisateur avec ses allergies (le endpoint /me ne charge pas les relations). */
  getWithAllergies: async (id: string): Promise<User | undefined> => {
    const res = await users.search({
      filters: [{ field: 'id', operator: 'like', value: id }],
      includes: [{ relation: 'allergies' }],
      limit: 10,
    });
    return res.data[0];
  },

  /**
   * Met à jour le profil. Les allergies sont synchronisées (sync) : la liste fournie
   * remplace exactement l'ensemble des allergies de l'utilisateur.
   */
  update: (id: string, attributes: UpdateUserAttributes, allergyIds: string[]) =>
    users.mutate([
      {
        operation: 'update',
        key: id,
        attributes,
        relations: {
          allergies: allergyIds.map((key) => ({ operation: 'sync' as const, key })),
        },
      },
    ]),
};
