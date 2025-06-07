// src/hooks/useAuth.ts
import { useContext } from 'react';
import AuthContext from '@/context/AuthContext.tsx';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
