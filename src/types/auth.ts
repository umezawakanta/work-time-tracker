// src/types/auth.ts
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  isPremium: boolean;
  subscriptionStatus: 'free' | 'trial' | 'premium' | 'enterprise';
  createdAt: string;
  lastLoginAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'ja' | 'en';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    daily: boolean;
    weekly: boolean;
  };
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: AuthError | null;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
}