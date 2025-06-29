// src/services/auth.ts
import { User } from '@/types';
import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<{ token: string; user: User }>('/auth/login', credentials),
  register: (userData: LoginCredentials & { name: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userString = localStorage.getItem('user');
    return userString ? (JSON.parse(userString) as User) : null;
  },
  setCurrentUser: (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};
