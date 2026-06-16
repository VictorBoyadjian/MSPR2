// Contrats des endpoints nutrition du moteur ML (RECO_API_URL).

export type CaloriesInput = {
  age: number; // 18-65
  gender: 'male' | 'female';
  weight_kg: number; // 30-200
  height_cm: number; // 140-215
  target_weight_kg: number; // 30-200
  weeks_to_goal: number; // 1-104
  profile: string;
};

export type CaloriesOutput = {
  bmr: number;
  tdee: number;
  daily_adjustment: number;
  daily_calories_target: number;
  weekly_change_kg: number;
  total_change_kg: number;
  goal_type: string; // 'deficit' | 'surplus'
  protein_target_g: number;
  note: string;
};

export type RecommendedMeal = {
  name: string;
  meal_type: string;
  calories_kcal: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  allergens: string[];
};

export type MealsInput = {
  profile: string;
  allergens_to_exclude: string[];
  meal_type?: string | null;
};

export type MealsOutput = {
  profile: string;
  allergens_excluded: string[];
  meal_type_filter: string | null;
  count: number;
  meals: RecommendedMeal[];
};
