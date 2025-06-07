// src/types/auth.ts
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  isPremium: boolean;
  isAdmin?: boolean;
  subscriptionStatus?: 'free' | 'trial' | 'premium' | 'enterprise';
  createdAt: string;
  lastSignInAt?: string;
  loginCount?: number;
  preferences?: UserPreferences;
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
  user?: AuthUser | null;
  error?: AuthError | null;
  session?: any; // Supabase Sessionまたは任意のセッション情報
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
}
