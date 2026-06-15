import { createContext, useContext } from 'react';

import { User } from '@/types/users.type';
import { RegisterPayload } from '@/services/authService';

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

export function useAuthStore(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthStore doit être utilisé dans un AuthProvider');
  }
  return context;
}
