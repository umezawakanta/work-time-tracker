import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { checkAuth, fetchUserData, updateUserProfile } from '@/services/api/authApi';
import { User } from '@/types';
import { logger } from '@/utils/logger';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const isCheckingAuthRef = useRef(false);

  const fetchUser = useCallback(async () => {
    console.log('[AuthContext] fetchUser実行');
    try {
      const userData = await fetchUserData();

      // 環境変数で指定されたメールアドレスのユーザーを管理者にする
      const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(',') || [];
      if (adminEmails.includes(userData.email)) {
        userData.isAdmin = true;
      }

      setUser(userData);
      console.log('[AuthContext] ユーザーデータ設定完了');
    } catch (error) {
      console.error('[AuthContext] ユーザーデータ取得失敗:', error);
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data: { name: string; email: string }) => {
    console.log('[AuthContext] updateProfile実行');
    try {
      const updatedUser = await updateUserProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('[AuthContext] プロフィール更新失敗:', error);
      throw error;
    }
  }, []);

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
        try {
          const userData = await fetchUserData();
          const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(',') || [];
          if (adminEmails.includes(userData.email)) {
            userData.isAdmin = true;
          }
          setUser(userData);
          console.log('[AuthContext] ユーザーデータ取得完了');
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
  }, []);

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
    stableContextValue.current.user !== user
  ) {
    console.log('[AuthContext] contextValue更新', {
      isAuthenticated,
      loading,
      user: !!user,
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
    };
  }

  return <AuthContext.Provider value={stableContextValue.current}>{children}</AuthContext.Provider>;
};

export default AuthContext;
