import { Exercise } from "./exercises.type";
import { Goal } from "./goals.type";

export type SessionUserPivot = {
  id: string;
  pivot?: { performed_at?: string };
};

export type SportSession = {
  id: string;
  duration_min: number | null;
  /** Renseigné côté client depuis le pivot user_sessions.performed_at de l'utilisateur courant. */
  performed_at?: string;
  users?: SessionUserPivot[];
  exercises?: Exercise[];
  goals?: Goal[];
};
