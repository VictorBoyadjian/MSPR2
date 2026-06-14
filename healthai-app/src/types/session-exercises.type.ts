import { Exercise } from "./exercises.type";

export type SessionExercise = {
  exercise_id?: string;
  sport_session_id?: string;
  reps: number | null;
  sets: number | null;
  duration_min: number | null;
  order: number | null;
};
