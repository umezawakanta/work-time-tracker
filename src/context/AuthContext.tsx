import React, { createContext, useState, useEffect, useCallback } from 'react';
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
    if (isCheckingAuth) return; // 重複実行防止

    setIsCheckingAuth(true);
    try {
      const response = await checkAuth();
      if (response.data.isAuthenticated) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      logger.warn('Auth', 'Check auth failed');
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  }, [isCheckingAuth]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    user,
    setUser,
    fetchUser,
    updateProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
