// src/hooks/useAuth.ts
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a safe default for test environments
    return {
      user: undefined,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      isAuthenticated: () => false,
      setIsAuthenticated: () => {},
      setUser: () => {},
      refreshAuth: () => Promise.resolve(),
    };
  }
  return context;
}
