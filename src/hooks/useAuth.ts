import { useState, useEffect } from 'react';
import { User } from '../types';
import { getAuthToken, createAuthHeaders } from '../utils/authUtils';
import { apiFetch } from '../utils/apiClient';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // 認証チェック
  const checkAuth = async () => {
    console.log('useAuth - Starting auth check...');
    console.log('useAuth - localStorage access_token:', localStorage.getItem('access_token') ? 'exists' : 'not found');
    console.log('useAuth - localStorage authToken:', localStorage.getItem('authToken') ? 'exists' : 'not found');
    const token = getAuthToken((message) => console.log('getAuthToken message:', message));
    console.log('useAuth - Token found:', !!token);
    console.log('useAuth - Token value:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
      console.log('useAuth - No token found, setting isCheckingAuth to false');
      setIsCheckingAuth(false);
      return;
    }

    try {
      console.log('useAuth - Verifying token with API...');
      const headers = createAuthHeaders(token);
      console.log('useAuth - Auth headers:', headers);
      
      const response = await apiFetch('/api/auth/verify', {
        method: 'POST',
        headers: headers,
      });

      console.log('useAuth - Verify response status:', response.status);
      console.log('useAuth - Verify response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('useAuth - Verification successful, user data:', data.user);
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        console.log('useAuth - Verification failed, removing token');
        console.log('useAuth - Response status:', response.status);
        console.log('useAuth - Response statusText:', response.statusText);
        
        // レスポンスの詳細を取得
        try {
          const errorData = await response.json();
          console.log('useAuth - Error response data:', errorData);
        } catch (e) {
          console.log('useAuth - Could not parse error response as JSON');
        }
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('useAuth - Auth check failed:', error);
      console.error('useAuth - Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      console.log('useAuth - Setting isCheckingAuth to false');
      setIsCheckingAuth(false);
    }
  };

  // ログイン
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('useAuth - Login successful, saving token:', data.token ? data.token.substring(0, 20) + '...' : 'null');
        console.log('useAuth - Token data:', data);
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('authToken', data.token); // 後方互換性のため
        console.log('useAuth - Token saved to localStorage');
        setUser(data.user);
        setIsLoggedIn(true);
        setMessage("ログインしました");
        setEmail("");
        setPassword("");
        
        // 認証状態を確実に更新するため、少し待ってから認証チェックを再実行
        setTimeout(() => {
          console.log('useAuth - Re-checking auth after login');
          checkAuth();
        }, 100);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "ログインに失敗しました");
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage("ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 登録
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('useAuth - Register successful, saving token:', data.token ? data.token.substring(0, 20) + '...' : 'null');
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('authToken', data.token); // 後方互換性のため
        setUser(data.user);
        setIsLoggedIn(true);
        setMessage("登録しました");
        setEmail("");
        setPassword("");
        setDisplayName("");
        setIsRegisterMode(false);
        
        // 認証状態を確実に更新するため、少し待ってから認証チェックを再実行
        setTimeout(() => {
          console.log('useAuth - Re-checking auth after register');
          checkAuth();
        }, 100);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "登録に失敗しました");
      }
    } catch (error) {
      console.error('Register error:', error);
      setMessage("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // ログアウト
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setUser(null);
    setMessage("ログアウトしました");
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isLoggedIn,
    isCheckingAuth,
    user,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    loading,
    message,
    setMessage,
    isRegisterMode,
    setIsRegisterMode,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};
