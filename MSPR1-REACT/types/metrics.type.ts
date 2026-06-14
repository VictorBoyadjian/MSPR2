export type Metric = {
  id: string;
  user_id: string;
  recorded_at: string;
  weight_kg: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  heart_rate_resting: number | null;
  calories_burned: number | null;
  session_duration_h: number | null;
  workout_type: string | null;
  workout_frequency: number | null;
  water_intake_l: number | null;
  experience_level: number | null;
  created_at: string;
  updated_at: string;
};
