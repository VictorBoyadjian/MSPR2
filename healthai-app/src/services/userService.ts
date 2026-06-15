import { sendRequest, users } from '@/services/api';
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
  /** Récupère l'utilisateur avec ses relations (le endpoint /me ne charge pas les relations). */
  getWithRelations: async (id: string): Promise<User | undefined> => {
    const res = await users.search({
      filters: [{ field: 'id', operator: 'like', value: id }],
      includes: [{ relation: 'allergies' }, { relation: 'handicaps' }],
      limit: 10,
    });
    return res.data[0];
  },

  /**
   * Met à jour le profil de l'utilisateur courant via PATCH /me.
   * `allergies` et `handicaps` sont des tableaux d'ids qui remplacent l'ensemble correspondant.
   */
  update: (attributes: UpdateUserAttributes, allergyIds: string[], handicapIds: string[]) =>
    sendRequest<User>('PATCH', '/me', {
      ...attributes,
      allergies: allergyIds.map(Number),
      handicaps: handicapIds.map(Number),
    }),
};
