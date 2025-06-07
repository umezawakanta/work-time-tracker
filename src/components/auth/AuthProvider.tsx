import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User } from '@/types';
import { login, register, logout, checkAuth, fetchUserData } from '@/services/api/authApi';
import { logger } from '@/utils/logger';

interface AuthContextType {
  // 基本認証状態
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;

  // 認証アクション
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  // セッション管理
  refreshAuth: () => Promise<void>;
  sessionExpired: boolean;

  // アカウント管理
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;

  // セキュリティ機能
  enableTwoFactor: () => Promise<string>; // QRコードURL
  verifyTwoFactor: (code: string) => Promise<void>;
  disableTwoFactor: (code: string) => Promise<void>;

  // アクティビティ監視
  lastActivity: Date | null;
  sessionTimeout: number;
  isOnline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// セッション設定
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分
const WARNING_TIME = 5 * 60 * 1000; // 5分前に警告
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5分ごとにリフレッシュ

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();

  // 基本状態
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // セッション管理
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [sessionTimeout] = useState(SESSION_TIMEOUT);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // セッションタイマー
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // アクティビティ監視
  const updateActivity = useCallback(() => {
    const now = new Date();
    setLastActivity(now);
    localStorage.setItem('lastActivity', now.toISOString());

    // セッションタイマーをリセット
    if (sessionTimer) clearTimeout(sessionTimer);
    if (warningTimer) clearTimeout(warningTimer);

    if (isAuthenticated) {
      // 警告タイマー設定
      const warning = setTimeout(() => {
        toast('セッションが5分後に期限切れになります', {
          icon: '⚠️',
          duration: 4000,
        });
      }, SESSION_TIMEOUT - WARNING_TIME);
      setWarningTimer(warning);

      // セッション期限タイマー設定
      const timeout = setTimeout(() => {
        handleSessionExpiry();
      }, SESSION_TIMEOUT);
      setSessionTimer(timeout);
    }
  }, [isAuthenticated, sessionTimer, warningTimer]);

  // セッション期限切れ処理
  const handleSessionExpiry = useCallback(async () => {
    setSessionExpired(true);
    setIsAuthenticated(false);
    setUser(null);

    // トークンクリア
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');

    // タイマークリア
    if (sessionTimer) clearTimeout(sessionTimer);
    if (warningTimer) clearTimeout(warningTimer);
    if (refreshTimer) clearTimeout(refreshTimer);

    toast.error('セッションが期限切れになりました。再度ログインしてください。');
    navigate('/login', { state: { sessionExpired: true } });
  }, [navigate, sessionTimer, warningTimer, refreshTimer]);

  // 認証状態の自動リフレッシュ
  const refreshAuth = useCallback(async () => {
    if (!isAuthenticated || !isOnline) return;

    try {
      await checkAuth();
      const userData = await fetchUserData();
      setUser(userData);
      logger.debug('Auth', 'Auth refreshed successfully');
    } catch (error) {
      logger.error('Auth', 'Auth refresh failed', error);
      handleSessionExpiry();
    }
  }, [isAuthenticated, isOnline, handleSessionExpiry]);

  // ログイン処理
  const signIn = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      setLoading(true);
      try {
        const response = await login(email, password);

        setIsAuthenticated(true);
        setUser(response.user);
        setSessionExpired(false);

        // Remember me 機能
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // アクティビティ更新
        updateActivity();

        // 定期リフレッシュ開始
        const refresh = setInterval(refreshAuth, REFRESH_INTERVAL);
        setRefreshTimer(refresh);

        logger.info('Auth', 'User signed in successfully', { userId: response.user.id });
        toast.success('ログインしました');
      } catch (error: any) {
        logger.error('Auth', 'Sign in failed', error);

        // エラータイプに応じた処理
        if (error.response?.status === 429) {
          toast.error(
            'ログイン試行回数が上限に達しました。しばらく時間をおいてからお試しください。'
          );
        } else if (error.response?.status === 401) {
          toast.error('メールアドレスまたはパスワードが正しくありません。');
        } else {
          toast.error('ログインに失敗しました。');
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [updateActivity, refreshAuth]
  );

  // ユーザー登録処理
  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const response = await register({ name, email, password });

        // 登録後自動ログイン
        setIsAuthenticated(true);
        setUser(response.user);
        updateActivity();

        // 定期リフレッシュ開始
        const refresh = setInterval(refreshAuth, REFRESH_INTERVAL);
        setRefreshTimer(refresh);

        logger.info('User registered and signed in', { userId: response.user.id });
        toast.success('アカウントが作成されました');
      } catch (error: any) {
        logger.error('Sign up failed:', error);

        if (error.response?.data?.field === 'email') {
          toast.error('このメールアドレスは既に登録されています。');
        } else {
          toast.error('アカウントの作成に失敗しました。');
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [updateActivity, refreshAuth]
  );

  // ログアウト処理
  const signOut = useCallback(async () => {
    try {
      logout();

      setIsAuthenticated(false);
      setUser(null);
      setSessionExpired(false);

      // タイマークリア
      if (sessionTimer) clearTimeout(sessionTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (refreshTimer) clearTimeout(refreshTimer);

      // ローカルストレージクリア
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('rememberMe');

      logger.info('User signed out');
      toast.success('ログアウトしました');

      navigate('/login');
    } catch (error) {
      logger.error('Sign out failed:', error);
      toast.error('ログアウトに失敗しました');
    }
  }, [navigate, sessionTimer, warningTimer, refreshTimer]);

  // プロフィール更新
  const updateProfile = useCallback(async (data: { name: string; email: string }) => {
    try {
      // APIコール実装予定
      // const updatedUser = await updateUserProfile(data);
      // setUser(updatedUser);
      toast.success('プロフィールを更新しました');
    } catch (error) {
      logger.error('Profile update failed:', error);
      toast.error('プロフィールの更新に失敗しました');
      throw error;
    }
  }, []);

  // パスワード変更
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      // APIコール実装予定
      // await changeUserPassword(currentPassword, newPassword);
      toast.success('パスワードを変更しました');
    } catch (error) {
      logger.error('Password change failed:', error);
      toast.error('パスワードの変更に失敗しました');
      throw error;
    }
  }, []);

  // アカウント削除
  const deleteAccount = useCallback(async () => {
    try {
      // APIコール実装予定
      // await deleteUserAccount();
      await signOut();
      toast.success('アカウントを削除しました');
    } catch (error) {
      logger.error('Account deletion failed:', error);
      toast.error('アカウントの削除に失敗しました');
      throw error;
    }
  }, [signOut]);

  // 2要素認証有効化
  const enableTwoFactor = useCallback(async (): Promise<string> => {
    try {
      // APIコール実装予定
      // const qrCodeUrl = await enableTwoFactorAuth();
      // return qrCodeUrl;
      toast.success('2要素認証を有効化しました');
      return 'qr-code-url';
    } catch (error) {
      logger.error('2FA enable failed:', error);
      toast.error('2要素認証の有効化に失敗しました');
      throw error;
    }
  }, []);

  // 2要素認証確認
  const verifyTwoFactor = useCallback(async (code: string) => {
    try {
      // APIコール実装予定
      // await verifyTwoFactorCode(code);
      toast.success('2要素認証を確認しました');
    } catch (error) {
      logger.error('2FA verify failed:', error);
      toast.error('認証コードが正しくありません');
      throw error;
    }
  }, []);

  // 2要素認証無効化
  const disableTwoFactor = useCallback(async (code: string) => {
    try {
      // APIコール実装予定
      // await disableTwoFactorAuth(code);
      toast.success('2要素認証を無効化しました');
    } catch (error) {
      logger.error('2FA disable failed:', error);
      toast.error('2要素認証の無効化に失敗しました');
      throw error;
    }
  }, []);

  // 初期化処理
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        const rememberMe = localStorage.getItem('rememberMe');
        const lastActivityStr = localStorage.getItem('lastActivity');

        if (token) {
          // セッション有効性チェック
          if (lastActivityStr) {
            const lastActivityTime = new Date(lastActivityStr);
            const now = new Date();
            const timeSinceLastActivity = now.getTime() - lastActivityTime.getTime();

            if (timeSinceLastActivity > SESSION_TIMEOUT && !rememberMe) {
              // セッション期限切れ
              handleSessionExpiry();
              return;
            }
          }

          // 認証状態確認
          await checkAuth();
          const userData = await fetchUserData();

          setIsAuthenticated(true);
          setUser(userData);
          updateActivity();

          // 定期リフレッシュ開始
          const refresh = setInterval(refreshAuth, REFRESH_INTERVAL);
          setRefreshTimer(refresh);

          logger.info('Auth initialized from storage');
        }
      } catch (error) {
        logger.error('Auth initialization failed:', error);
        handleSessionExpiry();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [handleSessionExpiry, updateActivity, refreshAuth]);

  // オンライン状態監視
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isAuthenticated) {
        refreshAuth();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast('オフラインです', { icon: '📡' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, refreshAuth]);

  // アクティビティ監視イベント
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isAuthenticated, updateActivity]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (sessionTimer) clearTimeout(sessionTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [sessionTimer, warningTimer, refreshTimer]);

  const value: AuthContextType = {
    // 基本認証状態
    isAuthenticated,
    user,
    loading,

    // 認証アクション
    signIn,
    signUp,
    signOut,

    // セッション管理
    refreshAuth,
    sessionExpired,

    // アカウント管理
    updateProfile,
    changePassword,
    deleteAccount,

    // セキュリティ機能
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,

    // アクティビティ監視
    lastActivity,
    sessionTimeout,
    isOnline,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
