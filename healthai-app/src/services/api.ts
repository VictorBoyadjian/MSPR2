import { CONFIG } from '@/constants/config';
import { Dish } from '@/types/dishes.type';
import { Exercise } from '@/types/exercises.type';
import { Goal } from '@/types/goals.type';
import { Metric } from '@/types/metrics.type';
import { SportSession } from '@/types/sport-sessions.type';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT_MS);

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new ApiError(response.status, extractMessage(payload, response.statusText));
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(0, 'La requête a expiré.');
    }
    throw new ApiError(0, 'Impossible de joindre le serveur.');
  } finally {
    clearTimeout(timeout);
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message: unknown }).message;
    if (typeof message === 'string') return message;
  }
  if (typeof payload === 'string') return payload;
  return fallback;
}

export const sendRequest = request;

export type SearchQuery = {
  filters?: { field: string; operator?: string; value: unknown }[];
  sorts?: { field: string; direction?: 'asc' | 'desc' }[];
  includes?: { relation: string }[];
  page?: number;
  limit?: 10 | 25 | 50;
};

export type SearchResponse<T> = {
  current_page: number;
  data: T[];
  last_page?: number;
  total?: number;
};

type PivotAttach = { operation: 'attach'; key: string; pivot?: Record<string, unknown> };

type MutateRelations = Record<string, PivotAttach[]>;

type MutateOperation<T> =
  | { operation: 'create'; attributes: Partial<T>; relations?: MutateRelations }
  | { operation: 'update'; key: string; attributes: Partial<T>; relations?: MutateRelations };

export type MutateResponse = { created: string[]; updated: string[] };

function resource<T>(path: string) {
  return {
    search: (query: SearchQuery = {}) =>
      request<SearchResponse<T>>('POST', `${path}/search`, { search: query }),

    mutate: (operations: MutateOperation<T>[]) =>
      request<MutateResponse>('POST', `${path}/mutate`, { mutate: operations }),

    delete: (ids: string[]) => request<{ data: T[] }>('DELETE', path, { resources: ids }),
  };
}

export const dishes = resource<Dish>('/dishes');
export const exercises = resource<Exercise>('/exercises');
export const sportSessions = resource<SportSession>('/sport_sessions');
export const metrics = resource<Metric>('/metrics');
export const goals = resource<Goal>('/goals');

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export { Dish };
