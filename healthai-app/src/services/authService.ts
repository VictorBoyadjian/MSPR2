import { sendRequest } from '@/services/api';
import { User } from '@/types/users.type';

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export const authService = {
  login: (email: string, password: string) =>
    sendRequest<{ bearer_token: string }>('POST', '/login', { email, password }),

  register: (data: RegisterPayload) =>
    sendRequest<{ message: string }>('POST', '/register', data),

  logout: () => sendRequest<{ message: string }>('POST', '/logout'),

  me: () => sendRequest<User>('GET', '/me'),

  deleteAccount: () => sendRequest<{ message: string }>('DELETE', '/me'),
};
