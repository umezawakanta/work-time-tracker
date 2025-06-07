import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthService from '@/services/auth/AuthService';
import { AuthUser, AuthError } from '@/types/auth';
import { logger } from '@/utils/logger';

interface FirebaseAuthContextType {
  // 基本認証状態
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;

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

  // 認証状態のリスナー設定
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = AuthService.subscribeToAuthState((authUser) => {
      if (!isMounted) return;

      setUser(authUser);
      setIsAuthenticated(!!authUser);
      setSessionExpired(false);
      setLoading(false);

      if (authUser) {
        logger.info('Auth', 'User authenticated via Firebase', {
          userId: authUser.uid,
          email: authUser.email,
        });

        // 管理者ユーザーの場合の特別処理
        if (authUser.isPremium) {
          toast.success('🔥 プレミアムユーザーとしてログインしました', {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 'bold',
            },
          });
        }
      } else {
        logger.info('Auth', 'User signed out');
      }
    });

    // 初期の認証状態をチェック
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && isMounted) {
      setUser(currentUser);
      setIsAuthenticated(true);
      setLoading(false);
    } else if (isMounted) {
      setLoading(false);
    }

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // ログイン処理
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await AuthService.signIn(email, password);

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('ログインしました');
      logger.info('Auth', 'User signed in successfully', {
        userId: response.user?.uid,
      });
    } catch (error: unknown) {
      logger.error('Auth', 'Sign in failed', error);
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ユーザー登録処理
  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await AuthService.signUp(email, password, name);

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('アカウントが作成されました');
      logger.info('Auth', 'User registered successfully', {
        userId: response.user?.uid,
      });
    } catch (error: unknown) {
      logger.error('Auth', 'Sign up failed', error);
      const errorMessage =
        error instanceof Error ? error.message : 'アカウントの作成に失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Googleログイン処理
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AuthService.signInWithGoogle();

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Googleアカウントでログインしました');
      logger.info('Auth', 'User signed in with Google', {
        userId: response.user?.uid,
      });
    } catch (error: unknown) {
      logger.error('Auth', 'Google sign in failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Googleログインに失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ログアウト処理
  const signOut = useCallback(async () => {
    try {
      await AuthService.signOut();

      setIsAuthenticated(false);
      setUser(null);
      setSessionExpired(false);

      toast.success('ログアウトしました');
      logger.info('Auth', 'User signed out successfully');
      navigate('/login');
    } catch (error) {
      logger.error('Auth', 'Sign out failed', error);
      toast.error('ログアウトに失敗しました');
    }
  }, [navigate]);

  // パスワードリセット処理
  const resetPassword = useCallback(async (email: string) => {
    try {
      const error = await AuthService.resetPassword(email);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('パスワードリセットメールを送信しました');
      logger.info('Auth', 'Password reset email sent', { email });
    } catch (error: unknown) {
      logger.error('Auth', 'Password reset failed', error);
      const errorMessage =
        error instanceof Error ? error.message : 'パスワードリセットに失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // 認証の更新（Firebase Authでは自動）
  const refreshAuth = useCallback(async () => {
    // Firebase Authは自動でトークンを更新するため、特別な処理は不要
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value: FirebaseAuthContextType = {
    // 基本認証状態
    isAuthenticated,
    user,
    loading,

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
