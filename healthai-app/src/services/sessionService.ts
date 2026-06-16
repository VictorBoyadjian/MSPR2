import { sendRequest, workoutSessions } from '@/services/api';
import { WorkoutExercise } from '@/types/workout-exercises.type';
import { UserSession, WorkoutSession } from '@/types/workout-sessions.type';
import { apiDateToIso } from '@/utils/formatDate';

// Lomkit `like` est sensible à la casse : on capitalise comme ailleurs dans l'app.
const cap = (s: string) => `%${s.charAt(0).toUpperCase()}${s.slice(1)}%`;

type MeSessionsResponse = {
  data: (WorkoutSession & { pivot?: { id: string; performed_at: string } })[];
};

export const sessionService = {
  /** Catalogue : recherche de séances, optionnellement filtrées par profil (goal). */
  search: async (term: string, profile?: string | null): Promise<WorkoutSession[]> => {
    const filters: { field: string; operator?: string; value: unknown }[] = [];
    if (profile) filters.push({ field: 'profile', value: profile });
    if (term.trim()) filters.push({ field: 'name', operator: 'like', value: cap(term.trim()) });

    const response = await workoutSessions.search({
      filters,
      includes: [{ relation: 'exercises' }],
      sorts: [{ field: 'id', direction: 'asc' }],
      limit: 25,
    });
    return response.data;
  },

  /**
   * Récupère une séance du catalogue avec ses exercices (relation `exercises`,
   * triée côté API par `order_num`). Le endpoint `/me/sessions` ne charge pas
   * les exercices : on passe donc par la recherche REST sur l'id de la séance.
   */
  getById: async (workoutSessionId: string): Promise<WorkoutSession | null> => {
    const response = await workoutSessions.search({
      filters: [{ field: 'id', value: Number(workoutSessionId) }],
      includes: [{ relation: 'exercises' }],
      limit: 10,
    });
    return response.data[0] ?? null;
  },

  /** Exercices d'une séance (vide si la séance est introuvable). */
  getExercises: async (workoutSessionId: string): Promise<WorkoutExercise[]> => {
    const session = await sessionService.getById(workoutSessionId);
    return session?.exercises ?? [];
  },

  /** Séances de l'utilisateur (faites + planifiées), aplaties pour l'affichage. */
  listMine: async (): Promise<UserSession[]> => {
    const res = await sendRequest<MeSessionsResponse>('GET', '/me/sessions');
    return res.data.map((s) => ({
      ...s,
      userSessionId: s.pivot?.id ?? '',
      performedAt: apiDateToIso(s.pivot?.performed_at ?? ''),
    }));
  },

  /** Enregistre une séance (date passée = faite, future = planifiée). */
  record: (workoutSessionId: string, performedAt: string) =>
    sendRequest('POST', '/me/sessions', {
      workout_session_id: Number(workoutSessionId),
      performed_at: performedAt,
    }),

  /** Modifie une séance enregistrée (date et/ou séance choisie). */
  update: (
    userSessionId: string,
    payload: { workoutSessionId?: string; performedAt?: string },
  ) =>
    sendRequest('PATCH', `/me/sessions/${userSessionId}`, {
      ...(payload.workoutSessionId ? { workout_session_id: Number(payload.workoutSessionId) } : {}),
      ...(payload.performedAt ? { performed_at: payload.performedAt } : {}),
    }),

  /** Supprime une séance enregistrée (par l'id de la ligne user_sessions). */
  remove: (userSessionId: string) => sendRequest('DELETE', `/me/sessions/${userSessionId}`),
};
