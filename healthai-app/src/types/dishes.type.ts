export type Dish = {
  id: string;
  name: string;
  calories_kcal: number | null;
  proteins_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  fiber_g: number | null;
  sugars_g: number | null;
  sodium_mg: number | null;
  cholesterol_mg: number | null;
  meal_type: string | null;
  is_scanned: boolean | null;
  user_id: string | null;
  eated_at: string | null;
  created_at: string;
  updated_at: string;
};
