import { exercises, sportSessions } from '@/services/api';
import { Exercise } from '@/types/exercises.type';
import { SportSession } from '@/types/sport-sessions.type';

export type SessionExerciseInput = {
  exerciseId: string;
  sets?: number;
  reps?: number;
  duration_min?: number;
  order?: number;
};

export type CreateSessionInput = {
  duration_min: number;
  exercises: SessionExerciseInput[];
};

export const workoutService = {
  list: async (): Promise<SportSession[]> => {
    const response = await sportSessions.search({
      sorts: [{ field: 'id', direction: 'desc' }],
      includes: [{ relation: 'exercises' }],
      limit: 50,
    });
    return response.data;
  },

  searchExercises: async (term: string): Promise<Exercise[]> => {
    const value = term ? `%${term.charAt(0).toUpperCase()}${term.slice(1)}%` : null;
    const response = await exercises.search({
      filters: value ? [{ field: 'name', operator: 'like', value }] : [],
      limit: 25,
    });
    return response.data;
  },

  create: (input: CreateSessionInput) =>
    sportSessions.mutate([
      {
        operation: 'create',
        attributes: { duration_min: input.duration_min },
        relations: {
          exercises: input.exercises.map((e, index) => ({
            operation: 'attach',
            key: e.exerciseId,
            pivot: { sets: e.sets, reps: e.reps, duration_min: e.duration_min, order: e.order ?? index },
          })),
        },
      },
    ]),

  remove: (id: string) => sportSessions.delete([id]),
};
