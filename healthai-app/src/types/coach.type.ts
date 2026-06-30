/** Bilan hebdomadaire envoyé à Mistral pour générer le message du coach. */
export type CoachMessageInput = {
  first_name: string;
  goal: string;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  sport_hours_this_week: number;
  weekly_average_hours: number;
  sessions_count: number;
  meals_logged: number;
  avg_daily_calories: number;
};

/** Message du coach généré (texte libre, en français). */
export type CoachMessageOutput = {
  message: string;
};

/**
 * État du message du coach (API Laravel) :
 *  - `today`  : message du jour, ou null s'il n'a pas encore été généré aujourd'hui ;
 *  - `latest` : dernier message disponible (n'importe quel jour), repli à afficher.
 */
export type CoachMessageStatus = {
  date: string;
  today: string | null;
  latest: { message: string; date: string } | null;
};
