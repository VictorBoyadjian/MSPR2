// Contrats du moteur de recommandation ML (RECO_API_URL).

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type RecommendInput = {
  age: number; // 18-65
  gender: 'male' | 'female'; // le moteur n'accepte que male|female
  weight_kg: number; // 30-200
  height_cm: number; // 140-215
  body_fat_pct: number; // 4-55
  resting_bpm: number; // 40-105
  experience_level: ExperienceLevel;
};

export type ProfileScore = {
  profile: string; // correspond à goals.name côté API Laravel
  confidence: number; // 0..1
};

export type ProgramOutput = {
  sessions_per_week: number;
  session_duration_min: number;
  focus: string;
  intensity: string;
  weekly_volume_h: number;
  progression: string;
  nutrition_tip: string;
  objective: string;
};

export type RecommendOutput = {
  prediction_id: string;
  profile: string; // profil recommandé (le mieux classé)
  confidence: number;
  top_profiles: ProfileScore[];
  bmi: number;
  bmi_category: string;
  program: ProgramOutput;
};
