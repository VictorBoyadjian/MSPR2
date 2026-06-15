export type food = {
  quantity_g: number;
};

export type splittedDish = {
  aliments: Record<string, food>;
};

// Réponse de la route /calcul/ : chaque aliment enrichi de ses valeurs nutritives.
export type analyzedFood = {
  quantity_g: number;
  calories_kcal: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  accuracy: number;
};

export type analyzedDish = {
  aliments: Record<string, analyzedFood>;
};
