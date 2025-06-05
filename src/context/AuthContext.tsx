import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await fetchUserData();

      // 環境変数で指定されたメールアドレスのユーザーを管理者にする
      const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(',') || [];
      if (adminEmails.includes(userData.email)) {
        userData.isAdmin = true;
      }

      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data: { name: string; email: string }) => {
    try {
      const updatedUser = await updateUserProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (isCheckingAuth) return;

    setIsCheckingAuth(true);
    try {
      const isAuth = await checkAuth();
      if (isAuth) {
        setIsAuthenticated(true);
        await fetchUser(); // Fetch user data separately
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      logger.warn('Auth', 'Check auth failed');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, [fetchUser]); // isCheckingAuthを依存配列から削除

  useEffect(() => {
    checkAuthStatus();
  }, []); // 初回マウント時のみ実行

  // contextValueをuseMemoで最適化 - 依存配列から関数を除外
  const contextValue = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      loading,
      user,
      setUser,
      fetchUser,
      updateProfile,
    }),
    [isAuthenticated, loading, user] // fetchUser, updateProfileを除外
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
