import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { isFirebaseEnabled } from '@/config/firebase';
import AuthService from '@/services/auth/AuthService';
import { AuthUser, AuthError as _AuthError } from '@/types/auth';
import { logger } from '@/utils/logger';

interface FirebaseAuthContextType {
  // 基本認証状態
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  isFirebaseEnabled: boolean;

  // 認証アクション
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // セッション管理
  refreshAuth: () => Promise<void>;
  sessionExpired: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const navigate = useNavigate();

  // 基本状態
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Firebase有効性チェック
  useEffect(() => {
    if (!isFirebaseEnabled) {
      console.warn('🚧 Firebase is not enabled. Using mock authentication for development.');
      // 開発環境用のダミーユーザー
      if (import.meta.env.DEV) {
        setUser({
          uid: 'dev-user',
          email: 'dev@example.com',
          displayName: 'Development User',
          isPremium: true,
          photoURL: null,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          _id: 'dev-user-id',
          id: 'dev-user',
          name: 'Development User',
          username: 'dev-user',
          isAdmin: false,
          permissions: ['read', 'write'],
          roles: ['user'],
          lastActivityAt: new Date(),
          subscriptionStatus: 'premium' as const,
          preferences: {
            theme: 'light' as const,
            language: 'ja' as const,
            timezone: 'Asia/Tokyo',
            notifications: {
              email: true,
              push: true,
              daily: true,
              weekly: true,
            },
          },
        });
        setIsAuthenticated(true);
      }
      setLoading(false);
      return;
    }

    // Firebase認証状態のリスナー設定（Firebase有効時のみ）
    return AuthService.subscribeToAuthState((authUser) => {
      setUser(authUser);
      setIsAuthenticated(!!authUser);
      setSessionExpired(false);
      setLoading(false);

      if (authUser) {
        logger.info('Auth', 'User authenticated via Firebase', {
          userId: authUser.uid,
          email: authUser.email,
        });
      }
    });
  }, []);

  // 認証メソッドの実装
  const signIn = useCallback(async (email: string, password: string) => {
    if (!isFirebaseEnabled) {
      toast.error('Firebase認証が設定されていません');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.signIn(email, password);
      if (response.error) {
        throw new Error(response.error.message);
      }
      toast.success('ログインしました');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!isFirebaseEnabled) {
      toast.error('Firebase認証が設定されていません');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.signUp(email, password, name);
      if (response.error) {
        throw new Error(response.error.message);
      }
      toast.success('アカウントを作成しました。確認メールを送信しました。');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'アカウント作成に失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseEnabled) {
      toast.error('Firebase認証が設定されていません');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.signInWithGoogle();
      if (response.error) {
        throw new Error(response.error.message);
      }
      toast.success('Googleアカウントでログインしました');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Googleログインに失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isFirebaseEnabled) {
      setIsAuthenticated(false);
      setUser(null);
      toast.success('ログアウトしました');
      navigate('/firebase-login');
      return;
    }

    setLoading(true);
    try {
      await AuthService.signOut();
      setIsAuthenticated(false);
      setUser(null);
      toast.success('ログアウトしました');
      navigate('/firebase-login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'ログアウトに失敗しました';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isFirebaseEnabled) {
      toast.error('Firebase認証が設定されていません');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
      console.log('Password reset would be sent to:', email);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'パスワードリセットに失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    if (!isFirebaseEnabled) return;
    // 実装...
  }, []);

  return (
    <FirebaseAuthContext.Provider
      value={{
        // 基本認証状態
        isAuthenticated,
        user,
        loading,
        isFirebaseEnabled,

        // 認証アクション
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,

        // セッション管理
        refreshAuth,
        sessionExpired,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export default FirebaseAuthContext;
