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

    // トークンが存在する場合は認証済みとして扱う（API検証をスキップ）
    console.log('useAuth - Token exists, assuming user is authenticated');
    setIsLoggedIn(true);
    // ユーザー情報はlocalStorageから復元するか、デフォルト値を設定
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const userDisplayName = localStorage.getItem('userDisplayName') || 'User';
    setUser({
      id: 'temp-id',
      email: userEmail,
      displayName: userDisplayName,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsCheckingAuth(false);
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
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userDisplayName', data.user.displayName);
        console.log('useAuth - Token and user data saved to localStorage');
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
        console.log('useAuth - Register successful, saving token:', data.token ? data.token.substring(0, 20) + '...' : 'null');
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('authToken', data.token); // 後方互換性のため
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userDisplayName', data.user.displayName);
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');
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
