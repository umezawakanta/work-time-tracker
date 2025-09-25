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
    const token = getAuthToken((message) => console.log('getAuthToken message:', message));
    console.log('useAuth - Token found:', !!token);
    
    if (!token) {
      console.log('useAuth - No token found, setting isCheckingAuth to false');
      setIsCheckingAuth(false);
      return;
    }

    try {
      console.log('useAuth - Verifying token with API...');
      const response = await apiFetch('/api/auth/verify', {
        method: 'POST',
        headers: createAuthHeaders(),
      });

      console.log('useAuth - Verify response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('useAuth - Verification successful, user data:', data.user);
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        console.log('useAuth - Verification failed, removing token');
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('useAuth - Auth check failed:', error);
      localStorage.removeItem('authToken');
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
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        setMessage("ログインしました");
        setEmail("");
        setPassword("");
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
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        setMessage("登録しました");
        setEmail("");
        setPassword("");
        setDisplayName("");
        setIsRegisterMode(false);
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
