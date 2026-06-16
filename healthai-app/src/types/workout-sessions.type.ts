import { WorkoutExercise } from './workout-exercises.type';

/** Séance type du catalogue (liée à un profil/goal via `profile`). */
export type WorkoutSession = {
  id: string;
  name: string;
  profile: string;
  session_type: string | null;
  total_duration_min: number | null;
  difficulty: string | null;
  description: string | null;
  objective: string | null;
  created_at: string | null;
  exercises?: WorkoutExercise[];
  /** Présent quand la séance vient de /me/sessions (pivot user_sessions). */
  pivot?: { id: string; performed_at: string } | null;
};

/** Séance enregistrée par l'utilisateur (faite si passée, planifiée si future). */
export type UserSession = WorkoutSession & {
  /** id de la ligne user_sessions (pour suppression). */
  userSessionId: string;
  performedAt: string;
};
