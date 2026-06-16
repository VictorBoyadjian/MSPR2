import { sendRequest, users } from '@/services/api';
import { GenderEnum, User } from '@/types/users.type';

/** Champs profil éditables (issus de l'onboarding, colonnes table users). */
export type UpdateUserAttributes = Partial<{
  first_name: string;
  last_name: string;
  age: number;
  gender: GenderEnum;
  weight_kg: number;
  height_cm: number;
  bodyfat: number;
  rest_bpm: number;
  sport_per_week: number;
  goal_id: number;
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
   * `allergyIds`/`handicapIds` ne sont envoyés (et donc resynchronisés) que s'ils sont
   * fournis : on peut mettre à jour uniquement des attributs (ex. goal_id) sans toucher
   * aux relations.
   */
  update: (attributes: UpdateUserAttributes, allergyIds?: string[], handicapIds?: string[]) =>
    sendRequest<User>('PATCH', '/me', {
      ...attributes,
      ...(allergyIds ? { allergies: allergyIds.map(Number) } : {}),
      ...(handicapIds ? { handicaps: handicapIds.map(Number) } : {}),
    }),
};
