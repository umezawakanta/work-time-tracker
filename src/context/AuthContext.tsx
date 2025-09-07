import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { checkAuth, fetchUserData, updateUserProfile } from '@/services/api/authApi';
import { tokenManager } from '../services/auth/TokenManager';
import { User } from '@/types';
import { logger } from '@/utils/logger';
import { toast } from 'react-hot-toast';
import { getEnv as getEnvVar } from '@/utils/env';

// Extend Window interface for custom properties
declare global {
  interface Window {
    __VITE_USE_MOCK_DATA__?: string;
    __API_CONNECTION_FAILED__?: boolean;
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
  sessionExpired: boolean;
  refreshAuth: () => Promise<void>;
  sessionInfo: {
    isAuthenticated: boolean;
    expiresAt: Date | null;
    refreshExpiresAt: Date | null;
    timeUntilExpiry: number;
    timeUntilRefreshExpiry: number;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// 環境検出を動的にする（テスト環境で適切に動作するように）
const isDev = () => {
  // Test environment should never be considered development
  const nodeEnv = getEnvVar('NODE_ENV');
  if (nodeEnv === 'test') {
    return false;
  }

  return (
    nodeEnv === 'development' || getEnvVar('DEV') === 'true' || getEnvVar('MODE') === 'development'
  );
};

const isSkipAuth = () => {
  return getEnvVar('VITE_SKIP_AUTH') === 'true';
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(tokenManager.getSessionInfo());

  const lastActivityRef = useRef<number>(Date.now());
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // トークン期限切れイベントリスナー
  useEffect(() => {
    const handleTokenExpired = () => {
      logger.info('Auth', 'Token expired, redirecting to login');
      console.log('🔒 トークン期限切れ検出:', {
        currentUrl: window.location.href,
        tokenInfo: tokenManager.getDebugInfo(),
        sessionInfo: tokenManager.getSessionInfo(),
      });

      setIsAuthenticated(false);
      setUser(null);
      setSessionExpired(true);
      tokenManager.clearTokens();
      toast.error('セッションが期限切れになりました。再度ログインしてください。', {
        duration: 6000,
      });
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);
    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, []);

  // セッション情報の定期更新
  useEffect(() => {
    const updateSessionInfo = () => {
      setSessionInfo(tokenManager.getSessionInfo());
    };

    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 5 * 60 * 1000); // 5分ごと

    return () => clearInterval(interval);
  }, []);

  // ユーザーアクティビティ監視
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    // 30分間非アクティブでセッション期限切れ警告
    activityTimerRef.current = setTimeout(
      () => {
        if (isAuthenticated) {
          toast('長時間非アクティブです。セッションの更新をお勧めします。', {
            icon: '⚠️',
            duration: 5000,
          });
        }
      },
      25 * 60 * 1000
    ); // 25分
  }, [isAuthenticated]);

  // ユーザーアクティビティイベントの設定
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });

      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
    };
  }, [isAuthenticated, updateActivity]);

  // 認証状態のチェック
  const checkAuthStatus = useCallback(async () => {
    try {
      const isTokenValid = tokenManager.isAuthenticated();
      console.log('🔍 Local token check:', { isTokenValid });

      if (!isTokenValid) {
        console.log('🔒 Token invalid locally');
        setIsAuthenticated(false);
        setUser(null);
        setSessionExpired(true);
        return false;
      }

      // 本番/プレビュー以外はサーバ確認をスキップ
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const isTrustedHost =
        host === 'work-time-tracker-five.vercel.app' ||
        /^work-time-tracker-5d9q-.*\.vercel\.app$/.test(host);

      if (!isTrustedHost) {
        console.log('🧪 Dev host detected - checking server auth anyway');
        try {
          const isValidOnServer = await checkAuth();
          console.log('📡 Dev server auth check result:', { isValidOnServer });
          if (!isValidOnServer) {
            console.log('❌ Dev server auth check failed');
            tokenManager.clearTokens();
            setIsAuthenticated(false);
            setUser(null);
            setSessionExpired(true);
            // 開発環境でもログイン画面にリダイレクト
            if (typeof window !== 'undefined') {
              window.location.replace('/login');
            }
            return false;
          }
          console.log('✅ Dev server auth check passed');
          setIsAuthenticated(true);
          setSessionExpired(false);
          // 開発環境でもユーザー情報を取得（初回のみ）
          if (!user) {
            await fetchUser();
          }
          return true;
        } catch (serverError) {
          console.log('⚠️ Dev server auth check failed, redirecting to login', serverError);
          tokenManager.clearTokens();
          setIsAuthenticated(false);
          setUser(null);
          setSessionExpired(true);
          // 開発環境でもログイン画面にリダイレクト
          if (typeof window !== 'undefined') {
            window.location.replace('/login');
          }
          return false;
        }
      }

      console.log('📡 Starting server auth check...');
      try {
        const isValidOnServer = await checkAuth();
        console.log('📡 Server auth check result:', { isValidOnServer });
        if (!isValidOnServer) {
          console.log('❌ Server auth check failed');
          tokenManager.clearTokens();
          setIsAuthenticated(false);
          setUser(null);
          setSessionExpired(true);
          return false;
        }
        console.log('✅ Server auth check passed');
        setIsAuthenticated(true);
        setSessionExpired(false);
        return true;
      } catch (serverError) {
        console.log(
          '⚠️ Server auth check failed, but maintaining auth state for valid token',
          serverError
        );
        // サーバーエラーの場合でも、ローカルトークンが有効なら認証状態を維持
        // ただし、認証状態を明示的に設定する
        setIsAuthenticated(true);
        setSessionExpired(false);
        return true;
      }
    } catch (error) {
      console.log('❌ Auth check error:', error);
      logger.error('Auth', 'Auth check failed', error);

      // サーバーエラーの場合、ローカルトークンが有効なら一時的に認証状態を維持
      const isTokenValid = tokenManager.isAuthenticated();
      if (isTokenValid) {
        console.log('⚠️ Server unreachable but token valid - maintaining auth state');
        setIsAuthenticated(true);
        setSessionExpired(false);
        return true; // ローカルトークンが有効なら認証状態を維持
      }

      tokenManager.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      setSessionExpired(true);
      return false;
    }
  }, []);

  // 管理者トースト表示フラグ（セッションストレージベース）
  const getAdminToastShown = () => {
    try {
      return sessionStorage.getItem('admin-toast-shown') === 'true';
    } catch {
      return false;
    }
  };

  const setAdminToastShown = (value: boolean) => {
    try {
      if (value) {
        sessionStorage.setItem('admin-toast-shown', 'true');
      } else {
        sessionStorage.removeItem('admin-toast-shown');
      }
    } catch {
      // セッションストレージが使用できない場合は無視
    }
  };

  // ユーザー情報の取得
  const fetchUser = useCallback(async () => {
    try {
      if (!tokenManager.isAuthenticated()) {
        setUser(null);
        setAdminToastShown(false); // ログアウト時にフラグをリセット
        return;
      }

      // 既にユーザー情報が存在する場合はスキップ（重複取得を防ぐ）
      if (user && user.id) {
        console.log('👤 User already exists, skipping fetchUser');
        return;
      }

      const userData = await fetchUserData();
      setUser(userData);

      // 管理者の場合は初回ログイン時のみ成功メッセージ表示
      if (userData.isAdmin && !getAdminToastShown()) {
        setAdminToastShown(true);
        logger.info('Auth', 'Admin user logged in', { userId: userData.id });
        toast.success('🔥 管理者としてログインしました', {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
          },
        });
      }
    } catch (error: any) {
      logger.error('Auth', 'Failed to fetch user data', error);

      // ネットワークエラーやサーバーエラーの場合は認証状態を維持
      if (
        error?.code === 'ECONNREFUSED' ||
        error?.code === 'NETWORK_ERROR' ||
        error?.message?.includes('timeout') ||
        !error?.response
      ) {
        console.log('⚠️ Network error in fetchUser, maintaining auth state');
        return;
      }

      // 認証エラー（401/403）の場合は認証状態をリセット
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('🔒 Authentication error in fetchUser, clearing auth state');
        tokenManager.clearTokens();
        setIsAuthenticated(false);
        setUser(null);
        setSessionExpired(true);
        setAdminToastShown(false); // エラー時にフラグをリセット

        // ログイン画面にリダイレクト
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
      } else {
        console.log('⚠️ Other error in fetchUser, maintaining auth state');
        // その他のエラーの場合は認証状態を維持
      }
    }
  }, [user]);

  // 認証の更新
  const refreshAuth = useCallback(async () => {
    console.log('🔄 Refreshing auth...');

    if (!tokenManager.isAuthenticated()) {
      console.log('🔒 No valid token for refresh');
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      // トークンを自動更新（必要に応じて）
      const token = await tokenManager.getAccessToken();
      if (!token) {
        console.log('🔒 No access token available for refresh');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // タイムアウト付きでcheckAuthStatusを実行
      const authCheckPromise = checkAuthStatus();
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Refresh auth timeout')), 5000); // 5秒タイムアウト
      });

      const isValid = await Promise.race([authCheckPromise, timeoutPromise]);

      if (isValid) {
        try {
          // 開発環境ではfetchUserを呼び出さない（管理者トーストを防ぐため）
          const host = typeof window !== 'undefined' ? window.location.hostname : '';
          const isTrustedHost =
            host === 'work-time-tracker-five.vercel.app' ||
            /^work-time-tracker-5d9q-.*\.vercel\.app$/.test(host);

          if (isTrustedHost && !user) {
            await fetchUser();
          } else if (!isTrustedHost && !user) {
            // 開発環境ではダミーユーザー情報を設定
            const dummyUser = {
              id: 'dev-user',
              _id: 'dev-user',
              username: '開発ユーザー',
              email: 'dev@example.com',
              name: '開発ユーザー',
              isAdmin: true,
              lastLoginAt: new Date().toISOString(),
            } as User;
            setUser(dummyUser);
            console.log('🧪 開発環境 - ダミーユーザー情報を設定（refreshAuth）');
          }
          setIsAuthenticated(true);
          console.log('✅ Auth refresh successful');
        } catch (userError) {
          console.log('⚠️ User fetch failed during refresh:', userError);
          setIsAuthenticated(true); // 認証は有効だがユーザー情報取得失敗
        }
      } else {
        console.log('❌ Auth refresh failed - invalid auth');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.log('❌ Auth refresh error:', error);
      logger.error('Auth', 'Auth refresh failed', error);

      // タイムアウトの場合は認証状態を維持
      if (error instanceof Error && error.message.includes('timeout')) {
        console.log('⚠️ Refresh timeout - maintaining current state');
        return;
      }

      setIsAuthenticated(false);
      setUser(null);
    }
  }, [checkAuthStatus, fetchUser]);

  // プロフィール更新
  const updateProfile = useCallback(async (data: { name: string; email: string }) => {
    try {
      console.log('AuthContext updateProfile called with:', data);
      const updatedUser = await updateUserProfile(data);
      console.log('AuthContext received updated user:', updatedUser);
      setUser(updatedUser);
      // トースト通知は呼び出し元で管理
    } catch (error) {
      logger.error('Auth', 'Profile update failed', error);
      throw error;
    }
  }, []);

  // 初期化処理
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // TokenManagerから認証状態を確認
        console.log('🔧 Debug: tokenManager type:', typeof tokenManager);
        console.log(
          '🔧 Debug: tokenManager.isAuthenticated type:',
          typeof tokenManager.isAuthenticated
        );

        const isTokenValid = tokenManager.isAuthenticated();
        const sessionInfo = tokenManager.getSessionInfo();
        const debugInfo = tokenManager.getDebugInfo() as {
          accessToken?: unknown;
          refreshToken?: unknown;
          expiresAt?: unknown;
          refreshExpiresAt?: unknown;
        };

        console.log('🔑 認証初期化:', {
          isTokenValid,
          sessionInfo,
          debugInfo,
          currentUrl: window.location.href,
          hostname: window.location.hostname,
          localStorage: {
            accessToken: localStorage.getItem('accessToken') ? 'exists' : 'missing',
            refreshToken: localStorage.getItem('refreshToken') ? 'exists' : 'missing',
            rememberMe: localStorage.getItem('rememberMe'),
          },
          tokenManagerState: {
            hasAccessToken: Boolean(debugInfo && (debugInfo as any).accessToken),
            hasRefreshToken: Boolean(debugInfo && (debugInfo as any).refreshToken),
            expiresAt: (debugInfo && (debugInfo as any).expiresAt) || null,
            refreshExpiresAt: (debugInfo && (debugInfo as any).refreshExpiresAt) || null,
          },
        });

        // ログアウト状態をチェック
        const isLoggedOut = sessionStorage.getItem('user-logged-out') === 'true';

        if (isLoggedOut) {
          console.log('🚪 User manually logged out - skipping auto auth');
        }

        if (isTokenValid) {
          console.log('✅ トークン有効 - サーバー認証確認中...');

          // 本番環境では認証チェックを実行
          const host = typeof window !== 'undefined' ? window.location.hostname : '';
          const isTrustedHost =
            host === 'work-time-tracker-five.vercel.app' ||
            /^work-time-tracker-5d9q-.*\.vercel\.app$/.test(host);

          if (isTrustedHost) {
            // 本番環境では認証チェックを実行
            try {
              const isValidOnServer = await checkAuthStatus();
              if (isValidOnServer) {
                const userData = await fetchUserData();
                if (isMounted) {
                  setUser(userData);
                  setIsAuthenticated(true);
                  updateActivity();
                  console.log('✅ サーバー認証確認完了:', userData.email);
                }
              } else {
                console.log('❌ サーバー認証失敗 - 認証クリア');
                if (isMounted) {
                  tokenManager.clearTokens();
                  setIsAuthenticated(false);
                  setUser(null);
                }
              }
            } catch (error) {
              console.error('❌ サーバー認証確認失敗:', error);
              // サーバーエラーの場合は一時的に認証状態を維持
              if (isMounted) {
                setIsAuthenticated(true);
                console.log('⚠️ Server error but maintaining auth state');
              }
            }
          } else {
            // 開発環境では認証状態を維持
            console.log('🧪 開発環境 - 認証状態を維持');
            if (isMounted) {
              setIsAuthenticated(true);
              // 開発環境ではダミーユーザー情報を設定
              if (!user) {
                const dummyUser = {
                  id: 'dev-user',
                  _id: 'dev-user',
                  username: '開発ユーザー',
                  email: 'dev@example.com',
                  name: '開発ユーザー',
                  isAdmin: true,
                  lastLoginAt: new Date().toISOString(),
                } as User;
                setUser(dummyUser);
                console.log('🧪 開発環境 - ダミーユーザー情報を設定');
              }
            }
          }
        } else {
          console.log('🔒 トークン無効');
          // 開発環境では認証状態を維持
          const host = typeof window !== 'undefined' ? window.location.hostname : '';
          const isTrustedHost =
            host === 'work-time-tracker-five.vercel.app' ||
            /^work-time-tracker-5d9q-.*\.vercel\.app$/.test(host);

          if (!isTrustedHost) {
            console.log('🧪 開発環境 - トークン無効でも認証状態を維持');
            if (isMounted) {
              setIsAuthenticated(true);
              // 開発環境ではダミーユーザー情報を設定
              if (!user) {
                const dummyUser = {
                  id: 'dev-user',
                  _id: 'dev-user',
                  username: '開発ユーザー',
                  email: 'dev@example.com',
                  name: '開発ユーザー',
                  isAdmin: true,
                  lastLoginAt: new Date().toISOString(),
                } as User;
                setUser(dummyUser);
                console.log('🧪 開発環境 - ダミーユーザー情報を設定');
              }
            }
          } else {
            // 本番環境では認証クリア
            tokenManager.clearTokens();
            if (isMounted) {
              setIsAuthenticated(false);
              setUser(null);
            }
            console.log('🔒 Auth cleared - user needs to login');
          }
        }
      } catch (error) {
        console.log('❌ 認証初期化エラー:', error);
        logger.error('Auth', 'Auth initialization failed', error);
        if (isMounted) {
          tokenManager.clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          console.log('🏁 認証初期化完了 - loading終了');
          setLoading(false);

          // 開発環境でのデバッグ情報
          if (isDev()) {
            console.log('🐛 Final Auth State:', {
              isAuthenticated,
              user: user?.email || 'no user',
              loading: false,
              tokenValid: tokenManager.isAuthenticated(),
            });
          }
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // 依存配列を空にして無限ループを防ぐ

  // 定期的な認証チェック（一時的に無効化してデバッグ）
  useEffect(() => {
    if (!isAuthenticated) return;

    // 無限ループ防止のため一時的にコメントアウト
    // const checkInterval = setInterval(
    //   async () => {
    //     await refreshAuth();
    //   },
    //   5 * 60 * 1000
    // ); // 5分ごと

    // return () => clearInterval(checkInterval);
  }, [isAuthenticated]);

  // オンライン/オフライン状態の監視（一時的に無効化してデバッグ）
  useEffect(() => {
    // 無限ループ防止のため一時的にコメントアウト
    // const handleOnline = () => {
    //   if (isAuthenticated) {
    //     logger.info('Auth', 'Connection restored, refreshing auth');
    //     refreshAuth();
    //   }
    // };
    // const handleOffline = () => {
    //   logger.info('Auth', 'Connection lost');
    // };
    // window.addEventListener('online', handleOnline);
    // window.addEventListener('offline', handleOffline);
    // return () => {
    //   window.removeEventListener('online', handleOnline);
    //   window.removeEventListener('offline', handleOffline);
    // };
  }, [isAuthenticated]);

  // ページアンロード時のクリーンアップ
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Remember Meが無効な場合のみセッションをクリア
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      if (!rememberMe) {
        // ブラウザ終了時にセッションクリア（ログアウトはしない）
        // tokenManager.clearTokens();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    user,
    setUser,
    fetchUser,
    updateProfile,
    sessionExpired,
    refreshAuth,
    sessionInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
