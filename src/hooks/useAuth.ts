// src/hooks/useAuth.ts
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * AuthProvider が存在しない（ユニットテスト等）場合でも落ちずに
 * 「未ログインとして」ふるまうオプショナル版。
 * Hooks は無条件で一度だけ呼ばれるため、ESLint のルールにも適合。
 */
export function useAuthOptional() {
  const context = useContext(AuthContext); // ← Hook は無条件に1回だけ呼ぶ
  return (
    context ?? {
      user: null,
      isAuthenticated: false,
      login: async () => {},
      logout: async () => {},
    }
  );
}
