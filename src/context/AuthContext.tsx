import React, { createContext, useState, useEffect, useCallback } from 'react';
import { checkAuth, fetchUserData, updateUserProfile } from '@/services/api/authApi';
import { User } from '@/types';

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

  const fetchUser = useCallback(async () => {
    try {
      const userData = await fetchUserData();
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

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus);
        if (authStatus) {
          await fetchUser();
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [fetchUser]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    user,
    setUser,
    fetchUser,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;