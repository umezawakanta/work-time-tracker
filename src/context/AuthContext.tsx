import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { checkAuth, fetchUserData, updateUserProfile } from '@/services/api/authApi';
import { tokenManager } from '@/services/auth/TokenManager';
import { User } from '@/types';
import { logger } from '@/utils/logger';
import { toast } from 'react-hot-toast';

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

// 環境変数の取得をより互換性のある方法で行う
const getEnvVar = (key: string): string | undefined => {
  // Jest環境ではprocess.envを優先
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // Vite環境でのimport.meta.env（安全にアクセス）
  try {
    if (typeof window !== 'undefined' && (window as any).import?.meta?.env) {
      return (window as any).import.meta.env[key];
    }
  } catch (e) {
    // import.metaが利用できない場合は無視
  }
  return undefined;
};

const isDev = () => {
  // Test environment should never be considered development
  if (getEnvVar('NODE_ENV') === 'test') {
    return false;
  }

  return (
    getEnvVar('NODE_ENV') === 'development' ||
    getEnvVar('DEV') === 'true' ||
    getEnvVar('MODE') === 'development'
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
    const interval = setInterval(updateSessionInfo, 30000); // 30秒ごと

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
        return false;
      }

      // APIによる認証状態確認（タイムアウトを設定）
      console.log('📡 Starting server auth check...');
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Auth check timeout')), 4000); // 4秒タイムアウト
      });

      const authCheckPromise = checkAuth();

      const isValidOnServer = await Promise.race([authCheckPromise, timeoutPromise]);
      console.log('📡 Server auth check result:', { isValidOnServer });

      if (!isValidOnServer) {
        console.log('❌ Server auth check failed');
        tokenManager.clearTokens();
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      console.log('✅ Server auth check passed');
      return true;
    } catch (error) {
      console.log('❌ Auth check error:', error);
      logger.error('Auth', 'Auth check failed', error);

      // サーバーエラーの場合、ローカルトークンが有効なら一時的に認証状態を維持
      const isTokenValid = tokenManager.isAuthenticated();
      if (isTokenValid) {
        console.log('⚠️ Server unreachable but token valid - maintaining auth state');
        return true; // ローカルトークンが有効なら認証状態を維持
      }

      tokenManager.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);

  // ユーザー情報の取得
  const fetchUser = useCallback(async () => {
    try {
      if (!tokenManager.isAuthenticated()) {
        setUser(null);
        return;
      }

      const userData = await fetchUserData();
      setUser(userData);

      // 管理者の場合は成功メッセージ表示
      if (userData.isAdmin) {
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
    } catch (error) {
      logger.error('Auth', 'Failed to fetch user data', error);
      setUser(null);
    }
  }, []);

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
          await fetchUser();
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
      const updatedUser = await updateUserProfile(data);
      setUser(updatedUser);
      toast.success('プロフィールを更新しました');
    } catch (error) {
      logger.error('Auth', 'Profile update failed', error);
      toast.error('プロフィールの更新に失敗しました');
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
        const isTokenValid = tokenManager.isAuthenticated();
        const sessionInfo = tokenManager.getSessionInfo();
        const debugInfo = tokenManager.getDebugInfo();

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
        });

        // 開発環境でのサーバー起動ガイダンス（初回のみ）
        if (
          isDev() &&
          window.location.hostname === 'localhost' &&
          !sessionStorage.getItem('auth-init-shown')
        ) {
          console.log('💡 Development Mode Guidance:');
          console.log('   - Frontend: http://localhost:3000 ✅');
          console.log('   - Backend: http://localhost:3001 (確認中...)');
          console.log('   - サーバーが起動していない場合、オフラインモードで動作します');
          sessionStorage.setItem('auth-init-shown', 'true');
        }

        // 開発環境での即座認証設定（サーバー問題を回避）
        // ログアウト状態をチェック
        const isLoggedOut = sessionStorage.getItem('user-logged-out') === 'true';

        // テスト環境では開発モードを無効化
        const isTestEnvironment = getEnvVar('NODE_ENV') === 'test';

        if (
          isDev() &&
          !isTestEnvironment &&
          window.location.hostname === 'localhost' &&
          !isLoggedOut
        ) {
          console.log('🚀 Development fast auth mode enabled');
          if (isMounted) {
            setUser({
              id: 'demo-user',
              _id: 'demo-user-id',
              name: 'Demo User (Dev)',
              username: 'demouser',
              email: 'demo@example.com',
              isAdmin: true,
              avatar: '',
            });
            setIsAuthenticated(true);
            updateActivity();
            setLoading(false); // 開発環境では即座にローディング解除
            console.log('✅ Development auth set immediately');
            console.log('🏁 認証初期化完了 - loading終了 (dev fast mode)');
            return; // 早期リターンで他の処理をスキップ
          }
        } else if (isLoggedOut) {
          console.log('🚪 User manually logged out - skipping auto auth');
        }

        if (isTokenValid) {
          console.log('✅ トークン有効 - サーバー認証確認中...');

          // 開発環境での認証スキップオプション
          const isExplicitMockMode = window.__VITE_USE_MOCK_DATA__ === 'true';
          const isDevelopmentSkip = isDev() && !isTestEnvironment && isSkipAuth();

          if (isExplicitMockMode || isDevelopmentSkip) {
            console.log('🎭 モックモード/開発モード有効 - 認証をスキップします');
            if (isMounted) {
              // ダミーユーザーデータを設定
              setUser({
                id: 'demo-user',
                _id: 'demo-user-id',
                name: 'デモユーザー',
                username: 'demouser',
                email: 'demo@example.com',
                isAdmin: true,
                avatar: '',
              });
              setIsAuthenticated(true);
              updateActivity();
              console.log('✅ デモ認証成功');
            }
          } else {
            try {
              // タイムアウトを設定してcheckAuthStatusを実行
              const authCheckPromise = checkAuthStatus();
              const timeoutPromise = new Promise<boolean>((_, reject) => {
                setTimeout(() => reject(new Error('Init auth timeout')), 5000); // 5秒タイムアウト
              });

              const isValid = await Promise.race([authCheckPromise, timeoutPromise]);

              if (isValid && isMounted) {
                try {
                  await fetchUser();
                  setIsAuthenticated(true);
                  updateActivity();
                  console.log('✅ 認証復元成功');
                  logger.info('Auth', 'Authentication restored from storage');
                } catch (userFetchError) {
                  console.log('⚠️ User fetch failed but auth valid:', userFetchError);
                  // ユーザー情報の取得に失敗しても認証状態は維持
                  setIsAuthenticated(true);
                }
              } else if (isMounted) {
                console.log('❌ サーバー認証失敗');
                // サーバー認証失敗時も状態をクリア
                setIsAuthenticated(false);
                setUser(null);
              }
            } catch (error) {
              console.log('⚠️ Auth check timeout or error:', error);

              if (isMounted) {
                // サーバーエラーでもローカルトークンが有効なら認証状態を維持
                if (tokenManager.isAuthenticated()) {
                  console.log('🔄 Offline mode - maintaining auth from local token');
                  setIsAuthenticated(true);

                  // ユーザーデータを設定（デモデータ）
                  console.log('⚠️ Setting demo user data for offline mode');
                  setUser({
                    id: 'demo-user',
                    _id: 'demo-user-id',
                    name: 'Demo User (Offline)',
                    username: 'demouser',
                    email: 'demo@example.com',
                    isAdmin: true,
                    avatar: '',
                  });
                  updateActivity();
                } else {
                  console.log('🔒 Token invalid after timeout - clearing auth');
                  setIsAuthenticated(false);
                  setUser(null);
                }
              }
            }
          }
        } else {
          console.log('🔒 トークン無効 - 認証クリア');
          // ログアウト状態をチェック
          const isLoggedOut = sessionStorage.getItem('user-logged-out') === 'true';

          // 開発環境でトークンがない場合のフォールバック（ログアウトしていない場合のみ）
          if (
            isDev() &&
            !isTestEnvironment &&
            window.location.hostname === 'localhost' &&
            !isLoggedOut
          ) {
            console.log('🔧 Development mode: Setting demo auth for no token case');
            setUser({
              id: 'demo-user',
              _id: 'demo-user-id',
              name: 'Demo User (No Token)',
              username: 'demouser',
              email: 'demo@example.com',
              isAdmin: true,
              avatar: '',
            });
            setIsAuthenticated(true);
          } else {
            // トークンが無効な場合はクリア
            tokenManager.clearTokens();
            setIsAuthenticated(false);
            setUser(null);
            if (isLoggedOut) {
              console.log('🚪 Logged out state preserved');
            }
          }
          console.log('🔒 Auth cleared - user needs to login');
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
