import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { isFirebaseEnabled } from '@/config/firebase';
import AuthService from '@/services/auth/AuthService';
import { AuthUser, AuthError } from '@/types/auth';
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
        });
        setIsAuthenticated(true);
      }
      setLoading(false);
      return;
    }

    // Firebase認証状態のリスナー設定（Firebase有効時のみ）
    const unsubscribe = AuthService.subscribeToAuthState((authUser) => {
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

    return unsubscribe;
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

  // 他の認証メソッドも同様に実装...
  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!isFirebaseEnabled) {
      toast.error('Firebase認証が設定されていません');
      return;
    }
    // 実装...
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseEnabled) {
      toast.error('Firebase認証が設定されていません');
      return;
    }
    // 実装...
  }, []);

  const signOut = useCallback(async () => {
    if (!isFirebaseEnabled) {
      setIsAuthenticated(false);
      setUser(null);
      toast.success('ログアウトしました');
      navigate('/login');
      return;
    }
    // Firebase実装...
  }, [navigate]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isFirebaseEnabled) {
      toast.error('Firebase認証が設定されていません');
      return;
    }
    // 実装...
  }, []);

  const refreshAuth = useCallback(async () => {
    if (!isFirebaseEnabled) return;
    // 実装...
  }, []);

  const value: FirebaseAuthContextType = {
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
  };

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
}

export default FirebaseAuthContext;
