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

/** Message du coach du jour, tel que stocké dans la métrique du jour (API Laravel). */
export type CoachMessageOfDay = {
  date: string;
  message: string | null;
};
