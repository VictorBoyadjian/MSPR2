import { Dish, dishes, MealType } from '@/services/api';

export type CreateDishInput = {
  name: string;
  meal_type: MealType;
  calories_kcal?: number;
  proteins_g?: number;
  carbs_g?: number;
  fats_g?: number;
  user_id: string;
  eated_at?: string;
};

export const dishService = {
  list: async (userId: string): Promise<Dish[]> => {
    const response = await dishes.search({
      filters: [
        { field: 'user_id', operator: 'like', value: userId },
      ],
      sorts: [{ field: 'id', direction: 'desc' }],
      limit: 50,
    });
    return response.data;
  },

  create: (input: CreateDishInput) =>
    dishes.mutate([{ operation: 'create', attributes: input }]),

  getById: async (id: string): Promise<Dish> => {
    const response = await dishes.search({ filters: [
      { field: 'id', operator: 'like', value: id }
    ] });
    console.log('dishService.getById response:', id, response);
    return response.data[0];
  },

  update: (id: string, input: CreateDishInput) =>
    dishes.mutate([{ operation: 'update', key: id, attributes: input }]),

  remove: (id: string) => dishes.delete([id]),
};
