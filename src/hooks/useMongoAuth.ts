import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from '@/services/api/apiConfig';

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useMongoAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMongoAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // トークンの管理
  const getToken = () => localStorage.getItem('token');
  const setToken = (token: string) => localStorage.setItem('token', token);
  const removeToken = () => localStorage.removeItem('token');

  // 認証状態の確認
  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/check', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.isAuthenticated) {
        setUser(response.data.user);
      } else {
        removeToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ログイン
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      setToken(token);
      setUser(userData);

      console.log('[MongoAuth] ✅ ログイン成功:', userData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'ログインに失敗しました';
      setError(errorMessage);
      console.error('[MongoAuth] ❌ ログインエラー:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 登録
  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = response.data;

      setToken(token);
      setUser(userData);

      console.log('[MongoAuth] ✅ 登録成功:', userData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '登録に失敗しました';
      setError(errorMessage);
      console.error('[MongoAuth] ❌ 登録エラー:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ログアウト
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    console.log('[MongoAuth] 🚪 ログアウト完了');
  }, []);

  // 初期化時の認証確認
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};
