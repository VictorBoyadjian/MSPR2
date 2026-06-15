import { sendRequest, users } from '@/services/api';
import { User } from '@/types/users.type';

/** Opération de relation pivot au format lomkit (table user_allergies). */
export type AttachOperation = { operation: 'attach'; key: string };

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  age?: number;
  gender?: string;
  weight_kg?: number;
  height_cm?: number;
  // Données santé collectées pendant l'onboarding (colonnes users, migration V0012).
  bodyfat?: number;
  rest_bpm?: number;
  sport_per_week?: number;
  // Relations many-to-many (attach) — ex. allergies.
  relations?: {
    allergies?: AttachOperation[];
  };
};

export const authService = {
  login: (email: string, password: string) =>
    sendRequest<{ bearer_token: string }>('POST', '/login', { email, password }),

  register: (data: RegisterPayload) =>
    sendRequest<{ message: string }>('POST', '/register', data),

  logout: () => sendRequest<{ message: string }>('POST', '/logout'),

  me: () => sendRequest<User>('GET', '/me'),

  deleteAccount: (id: string) => users.delete([id]),
};
