import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { checkAuth, fetchUserData } from '@/services/api/authApi';

interface User {
  name: string;
  // Add other user properties as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUser: () => Promise<void>;
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

  const contextValue = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    user,
    setUser,
    fetchUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};