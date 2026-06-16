/** Pivot session_exercises : place d'un exercice dans une séance. */
export type SessionExercisePivot = {
  order_num: number;
  sets: number | null;
  reps: string | null;
  rest_sec: number | null;
  notes: string | null;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  body_part: string | null;
  category: string | null;
  difficulty: string | null;
  equipment: string | null;
  description: string | null;
  created_at: string | null;
  pivot?: SessionExercisePivot | null;
};
