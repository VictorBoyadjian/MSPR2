import { Exercise, exercises, SportSession, sportSessions } from '@/services/api';

export type SessionExerciseInput = {
  exerciseId: number;
  sets?: number;
  reps?: number;
  duration_min?: number;
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
          exercises: input.exercises.map((e) => ({
            operation: 'attach',
            key: e.exerciseId,
            pivot: { sets: e.sets, reps: e.reps, duration_min: e.duration_min },
          })),
        },
      },
    ]),

  remove: (id: number) => sportSessions.delete([id]),
};
