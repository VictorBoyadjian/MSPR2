export const ROUTES = {
  // Auth
  LOGIN: '/(auth)/login',
  REGISTER: '/(auth)/register',

  // Tabs
  DASHBOARD: '/(tabs)/dashboard',
  MEALS: '/(tabs)/meals',
  WORKOUTS: '/(tabs)/workouts',
  PLANNING: '/(tabs)/planning',

  // Meal
  MEAL_DETAIL: (id: string) => `/meal/${id}`,
  MEAL_ADD: '/meal/add',

  // Workout
  WORKOUT_DETAIL: (id: string) => `/workout/${id}`,
  WORKOUT_ADD: '/workout/add',
  WORKOUT_HISTORY: '/workout/history',
} as const;
