const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

// --- Core request helper ---

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, error?.message ?? response.statusText);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// --- Auth ---

export const auth = {
  login: (email: string, password: string) =>
    request<{ bearer_token: string }>('POST', '/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    age?: number;
    gender?: string;
    weight_kg?: number;
    height_cm?: number;
  }) => request<{ message: string }>('POST', '/register', data),

  logout: () => request<{ message: string }>('POST', '/logout'),

  me: () => request<User>('GET', '/me'),
};

// --- lomkit/rest resource helpers ---
// Each resource exposes: search, details, mutate, delete

type SearchPayload = {
  filters?: { field: string; operator?: string; value: unknown }[];
  sorts?: { field: string; direction?: 'asc' | 'desc' }[];
  includes?: { relation: string }[];
  page?: number;
  limit?: number;
};

type SearchResponse<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

type MutatePayload<T> = {
  mutate: ({ operation: 'create' | 'update'; attributes: Partial<T>; key?: number | string } | { operation: 'detach'; key: number | string })[];
};

type MutateResponse<T> = { created: T[]; updated: T[] };

function resource<T>(path: string) {
  return {
    search: (payload: SearchPayload = {}) =>
      request<SearchResponse<T>>('POST', `${path}/search`, payload),

    details: (id: number | string) =>
      request<{ data: T }>('GET', `${path}/${id}`),

    mutate: (payload: MutatePayload<T>) =>
      request<MutateResponse<T>>('POST', `${path}/mutate`, payload),

    delete: (ids: (number | string)[]) =>
      request<{ data: T[] }>('DELETE', path, { resources: ids }),
  };
}

// --- Resources ---

export const foods = resource<Food>('/foods');
export const foodCategories = resource<FoodCategory>('/food-categories');
export const mealLogs = resource<MealLog>('/meal-logs');
export const exercises = resource<Exercise>('/exercises');
export const metrics = resource<Metric>('/metrics');
export const sessions = resource<Session>('/sessions');
export const users = resource<User>('/users');

// --- Types ---

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  age?: number;
  gender?: string;
  weight_kg?: number;
  height_cm?: number;
};

export type Food = {
  id: number;
  name: string;
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  food_category_id?: number;
};

export type FoodCategory = {
  id: number;
  name: string;
};

export type MealLog = {
  id: number;
  user_id: number;
  food_id: number;
  quantity_g: number;
  logged_at: string;
};

export type Exercise = {
  id: number;
  name: string;
  calories_per_hour?: number;
  category?: string;
};

export type Metric = {
  id: number;
  user_id: number;
  weight_kg?: number;
  height_cm?: number;
  recorded_at: string;
};

export type Session = {
  id: number;
  user_id: number;
  exercise_id: number;
  duration_min: number;
  performed_at: string;
};
