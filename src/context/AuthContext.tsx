import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { checkAuth, fetchUserData, updateUserProfile } from '@/services/api/authApi';
import { tokenManager } from '@/services/auth/TokenManager';
import { User } from '@/types';
import { logger } from '@/utils/logger';
import { toast } from 'react-hot-toast';

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

      if (!isTokenValid) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      // APIによる認証状態確認
      const isValidOnServer = await checkAuth();
      if (!isValidOnServer) {
        tokenManager.clearTokens();
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Auth', 'Auth check failed', error);
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
    if (!tokenManager.isAuthenticated()) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      // トークンを自動更新（必要に応じて）
      const token = await tokenManager.getAccessToken();
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      const isValid = await checkAuthStatus();
      if (isValid) {
        await fetchUser();
        setIsAuthenticated(true);
      }
    } catch (error) {
      logger.error('Auth', 'Auth refresh failed', error);
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
        });

        if (isTokenValid) {
          console.log('✅ トークン有効 - サーバー認証確認中...');
          const isValid = await checkAuthStatus();
          if (isValid && isMounted) {
            await fetchUser();
            setIsAuthenticated(true);
            updateActivity();
            console.log('✅ 認証復元成功');
            logger.info('Auth', 'Authentication restored from storage');
          } else {
            console.log('❌ サーバー認証失敗');
          }
        } else {
          console.log('🔒 トークン無効 - 認証クリア');
          // トークンが無効な場合はクリア
          tokenManager.clearTokens();
          setIsAuthenticated(false);
          setUser(null);
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
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuthStatus, fetchUser, updateActivity]);

  // 定期的な認証チェック
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInterval = setInterval(
      async () => {
        await refreshAuth();
      },
      5 * 60 * 1000
    ); // 5分ごと

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, refreshAuth]);

  // オンライン/オフライン状態の監視
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated) {
        logger.info('Auth', 'Connection restored, refreshing auth');
        refreshAuth();
      }
    };

    const handleOffline = () => {
      logger.info('Auth', 'Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, refreshAuth]);

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
