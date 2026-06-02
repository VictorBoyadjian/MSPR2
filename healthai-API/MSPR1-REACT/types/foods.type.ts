export type FoodCategory = {
  id: string;
  name: string;
  created_at: string;
};

export type Food = {
  id: string;
  name: string;
  category_id: string | null;
  calories_kcal: number | null;
  proteins_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  fiber_g: number | null;
  sugars_g: number | null;
  sodium_mg: number | null;
  cholesterol_mg: number | null;
  meal_type: string | null;
  water_intake_ml: number | null;
  source: string | null;
  created_at: string;
  food_category: FoodCategory | null;
};
