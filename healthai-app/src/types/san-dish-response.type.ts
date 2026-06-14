export type food = {
  quantity: number;
  quantity_g: number;
  calories_kcal: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  accuracy: number;
};

export type ScanDishResponse = {
  aliments: Record<string, food>;
};
