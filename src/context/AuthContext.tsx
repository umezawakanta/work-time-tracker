import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { checkAuth, fetchUserData, updateUserProfile, logout } from '@/services/api/authApi';
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
}

// セッション管理の設定
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5分
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5分前に警告
const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30分でタイムアウト

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const isCheckingAuthRef = useRef(false);
  const lastActivityRef = useRef(Date.now());
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  // 最終アクティビティ時間を更新
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
  }, []);

  // ユーザーアクティビティの監視
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const handleActivity = () => {
      updateLastActivity();
      if (sessionExpired) {
        setSessionExpired(false);
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateLastActivity, sessionExpired]);

  const fetchUser = useCallback(async () => {
    console.log('[AuthContext] fetchUser実行');
    try {
      const userData = await fetchUserData();

      // 環境変数で指定されたメールアドレスのユーザーを管理者にする
      const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(',') || [];
      console.log('[AuthContext] 管理者メールアドレス設定:', adminEmails);
      console.log('[AuthContext] ユーザーメールアドレス:', userData.email);

      if (adminEmails.includes(userData.email)) {
        userData.isAdmin = true;
        console.log('[AuthContext] 管理者権限が付与されました:', userData.email);
        toast.success(`管理者権限でログインしました (${userData.email})`, {
          duration: 3000,
          id: 'admin-login',
        });
      } else {
        userData.isAdmin = false;
        console.log('[AuthContext] 一般ユーザーとしてログイン:', userData.email);
      }

      setUser(userData);
      console.log('[AuthContext] ユーザーデータ設定完了', {
        name: userData.name,
        email: userData.email,
        isAdmin: userData.isAdmin,
      });
    } catch (error) {
      console.error('[AuthContext] ユーザーデータ取得失敗:', error);
      setUser(null);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (data: { name: string; email: string }) => {
    console.log('[AuthContext] updateProfile実行');
    try {
      const updatedUser = await updateUserProfile(data);

      // プロフィール更新時も管理者権限を再確認
      const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(',') || [];
      if (adminEmails.includes(updatedUser.email)) {
        updatedUser.isAdmin = true;
        console.log('[AuthContext] プロフィール更新後も管理者権限を維持:', updatedUser.email);
      } else {
        updatedUser.isAdmin = false;
      }

      setUser(updatedUser);
    } catch (error) {
      console.error('[AuthContext] プロフィール更新失敗:', error);
      throw error;
    }
  }, []);

  // 認証状態の確認
  const refreshAuth = useCallback(async () => {
    if (isCheckingAuthRef.current) {
      console.log('[AuthContext] 認証チェック中、スキップ');
      return;
    }

    console.log('[AuthContext] 認証状態確認開始');
    isCheckingAuthRef.current = true;

    try {
      const isAuth = await checkAuth();

      if (isAuth) {
        setIsAuthenticated(true);
        updateLastActivity();
        if (!user) {
          await fetchUser();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setSessionExpired(true);
      }
    } catch (error) {
      console.error('[AuthContext] 認証状態確認エラー:', error);
      setIsAuthenticated(false);
      setUser(null);
      setSessionExpired(true);
    } finally {
      isCheckingAuthRef.current = false;
    }
  }, [fetchUser, user, updateLastActivity]);

  const checkAuthStatus = useCallback(async () => {
    if (isCheckingAuthRef.current) {
      console.log('[AuthContext] 認証チェック中、スキップ');
      return;
    }

    console.log('[AuthContext] 認証チェック開始');
    isCheckingAuthRef.current = true;
    setLoading(true);

    try {
      const isAuth = await checkAuth();
      console.log('[AuthContext] 認証結果:', isAuth);

      if (isAuth) {
        setIsAuthenticated(true);
        updateLastActivity();
        try {
          const userData = await fetchUserData();
          const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(',') || [];
          console.log('[AuthContext] checkAuthStatus - 管理者メール設定:', adminEmails);
          console.log('[AuthContext] checkAuthStatus - ユーザーメール:', userData.email);

          if (adminEmails.includes(userData.email)) {
            userData.isAdmin = true;
            console.log('[AuthContext] checkAuthStatus - 管理者権限付与:', userData.email);
          } else {
            userData.isAdmin = false;
            console.log('[AuthContext] checkAuthStatus - 一般ユーザー:', userData.email);
          }

          setUser(userData);
          console.log('[AuthContext] ユーザーデータ取得完了', {
            name: userData.name,
            email: userData.email,
            isAdmin: userData.isAdmin,
          });
        } catch (error) {
          console.error('[AuthContext] ユーザーデータ取得失敗:', error);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      logger.warn('Auth', 'Check auth failed');
      console.error('[AuthContext] 認証チェックエラー:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      isCheckingAuthRef.current = false;
      setLoading(false);
      console.log('[AuthContext] 認証チェック完了');
    }
  }, [fetchUser, updateLastActivity]);

  // セッション監視機能
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      // セッションタイムアウトの警告
      if (
        timeSinceLastActivity > AUTO_LOGOUT_TIME - SESSION_WARNING_TIME &&
        !warningShownRef.current
      ) {
        warningShownRef.current = true;
        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <span className="font-medium">セッション期限警告</span>
              <span className="text-sm">
                5分以内にアクティビティがない場合、自動ログアウトします。
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    updateLastActivity();
                    toast.dismiss(t.id);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  セッション継続
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsAuthenticated(false);
                    setSessionExpired(true);
                    toast.dismiss(t.id);
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  ログアウト
                </button>
              </div>
            </div>
          ),
          {
            duration: 30000,
            id: 'session-warning',
          }
        );
      }

      // 自動ログアウト
      if (timeSinceLastActivity > AUTO_LOGOUT_TIME) {
        console.log('[AuthContext] セッションタイムアウト');
        logout();
        setIsAuthenticated(false);
        setSessionExpired(true);
        toast.error('セッションがタイムアウトしました。再度ログインしてください。');
      }
    };

    // 定期的なセッションチェック
    sessionCheckIntervalRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [isAuthenticated, updateLastActivity]);

  useEffect(() => {
    console.log('[AuthContext] 初回認証チェック実行');
    checkAuthStatus();
  }, [checkAuthStatus]);

  // contextValueをReact.useMemoではなくuseRefで完全に安定化
  const stableContextValue = useRef<AuthContextType | null>(null);

  if (
    !stableContextValue.current ||
    stableContextValue.current.isAuthenticated !== isAuthenticated ||
    stableContextValue.current.loading !== loading ||
    stableContextValue.current.user !== user ||
    stableContextValue.current.sessionExpired !== sessionExpired
  ) {
    console.log('[AuthContext] contextValue更新', {
      isAuthenticated,
      loading,
      user: !!user,
      sessionExpired,
      reason: !stableContextValue.current ? 'initial' : 'state_change',
    });

    stableContextValue.current = {
      isAuthenticated,
      setIsAuthenticated,
      loading,
      user,
      setUser,
      fetchUser,
      updateProfile,
      sessionExpired,
      refreshAuth,
    };
  }

  return <AuthContext.Provider value={stableContextValue.current}>{children}</AuthContext.Provider>;
};

export default AuthContext;
