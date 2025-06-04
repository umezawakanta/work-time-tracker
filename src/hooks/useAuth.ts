// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { AuthUser, AuthError, AuthResponse } from '@/types/auth';
import { authApi } from '@/services/auth';

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthError | null>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // 開発環境用のモックユーザー
    if (process.env.NODE_ENV === 'development') {
      setUser({
        uid: 'dev-user-001',
        email: 'developer@example.com',
        displayName: '開発ユーザー',
        photoURL: null,
        emailVerified: true,
        isPremium: false,
        subscriptionStatus: 'free',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          language: 'ja',
          notifications: {
            email: true,
            push: true,
            daily: true,
            weekly: true,
          },
          timezone: 'Asia/Tokyo',
        },
      });
      setLoading(false);
      return;
    }

    // 既存のMongoDBベースの認証チェック
    const checkAuth = async () => {
      try {
        const currentUser = authApi.getCurrentUser();
        if (currentUser) {
          // MongoDB UserをAuthUserにマッピング
          setUser({
            uid: currentUser._id,
            email: currentUser.email,
            displayName: currentUser.name,
            photoURL: null,
            emailVerified: true,
            isPremium: false,
            subscriptionStatus: 'free',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            preferences: {
              theme: 'light',
              language: 'ja',
              notifications: {
                email: true,
                push: true,
                daily: true,
                weekly: true,
              },
              timezone: 'Asia/Tokyo',
            },
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      const { user: mongoUser, token } = response.data;

      authApi.setCurrentUser(mongoUser, token);

      const authUser: AuthUser = {
        uid: mongoUser._id,
        email: mongoUser.email,
        displayName: mongoUser.name,
        photoURL: null,
        emailVerified: true,
        isPremium: false,
        subscriptionStatus: 'free',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          language: 'ja',
          notifications: {
            email: true,
            push: true,
            daily: true,
            weekly: true,
          },
          timezone: 'Asia/Tokyo',
        },
      };

      setUser(authUser);
      return { user: authUser, error: null };
    } catch (error: any) {
      const authError: AuthError = {
        code: 'auth/operation-not-allowed',
        message: error.response?.data?.message || 'ログインに失敗しました',
      };
      setError(authError);
      return { user: null, error: authError };
    }
  }, []);

  // その他のメソッドはスタブ実装
  const signUp = useCallback(async (): Promise<AuthResponse> => {
    return {
      user: null,
      error: { code: 'auth/operation-not-allowed', message: 'サインアップは現在利用できません' },
    };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResponse> => {
    return {
      user: null,
      error: { code: 'auth/operation-not-allowed', message: 'Google認証は現在利用できません' },
    };
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    authApi.logout();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (): Promise<AuthError | null> => {
    return {
      code: 'auth/operation-not-allowed',
      message: 'パスワードリセットは現在利用できません',
    };
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearError,
  };
};
