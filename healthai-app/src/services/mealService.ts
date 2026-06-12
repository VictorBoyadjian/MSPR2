import { Dish, dishes, MealType } from '@/services/api';

export type CreateDishInput = {
  name: string;
  meal_type: MealType;
  calories_kcal?: number;
  proteins_g?: number;
  carbs_g?: number;
  fats_g?: number;
};

export const mealService = {
  list: async (): Promise<Dish[]> => {
    const response = await dishes.search({
      sorts: [{ field: 'id', direction: 'desc' }],
      limit: 50,
    });
    return response.data;
  },

  create: (input: CreateDishInput) =>
    dishes.mutate([{ operation: 'create', attributes: input }]),

  remove: (id: number) => dishes.delete([id]),
};
