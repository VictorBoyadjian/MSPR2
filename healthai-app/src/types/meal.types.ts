export type NutritionInfo = {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
};

export type Meal = {
  id: string;
  name: string;
  date: string;
  nutrition: NutritionInfo;
  userId: string;
  createdAt: string;
};

export type CreateMealDto = Omit<Meal, 'id' | 'userId' | 'createdAt'>;

export type UpdateMealDto = Partial<CreateMealDto>;
