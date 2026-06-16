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

/** Exercice d'une séance recommandée par le moteur ML (POST /sessions/exercises). */
export type RecommendedExercise = {
  order_num: number;
  exercise_name: string;
  body_part: string;
  category: string;
  equipment: string;
  sets: number;
  reps: string;
  rest_sec: number;
  notes: string;
};

/** Séance recommandée par le moteur ML, liée au catalogue via `session_id`. */
export type RecommendedSession = {
  session_id: number;
  name: string;
  profile: string;
  session_type: string;
  total_duration_min: number;
  difficulty: string;
  description: string;
  objective: string;
  exercises: RecommendedExercise[];
};

export type SessionsRecoInput = {
  profile: string;
  session_type?: string | null;
  body_parts_to_exclude: string[];
};

export type SessionsRecoOutput = {
  profile: string;
  session_type_filter: string | null;
  body_parts_excluded: string[];
  count: number;
  sessions: RecommendedSession[];
};
