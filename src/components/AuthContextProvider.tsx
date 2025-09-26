import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

// 認証状態の型定義
interface AuthState {
  isLoggedIn: boolean;
  isCheckingAuth: boolean;
  user: User | null;
  email: string;
  password: string;
  displayName: string;
}

// 認証アクションの型定義
interface AuthActions {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsCheckingAuth: (isCheckingAuth: boolean) => void;
  setUser: (user: User | null) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setDisplayName: (displayName: string) => void;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleRegister: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => void;
  verifyToken: (token: string) => Promise<void>;
}

// 認証コンテキストの型定義
interface AuthContextType extends AuthState, AuthActions {}

// User型は既存のtypesからインポート

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダーのプロパティ型定義
interface AuthProviderProps {
  children: ReactNode;
  onLogin: (e: React.FormEvent) => Promise<void>;
  onRegister: (e: React.FormEvent) => Promise<void>;
  onLogout: () => void;
  onVerifyToken: (token: string) => Promise<void>;
  setMessage: (message: string) => void;
}

// 認証プロバイダーコンポーネント
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  onLogin,
  onRegister,
  onLogout,
  onVerifyToken,
  setMessage,
}) => {
  // 認証状態の管理
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  // 認証アクションの実装
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(e);
    } catch (error) {
      console.error("Login failed:", error);
      setMessage("ログインに失敗しました");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onRegister(e);
    } catch (error) {
      console.error("Registration failed:", error);
      setMessage("登録に失敗しました");
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const verifyToken = async (token: string) => {
    try {
      await onVerifyToken(token);
    } catch (error) {
      console.error("Token verification failed:", error);
      setMessage("認証の確認に失敗しました");
    }
  };

  // 認証状態の初期化
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        await verifyToken(token);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setIsCheckingAuth(false);
    };

    initializeAuth();
  }, []);

  // 認証状態の値
  const value: AuthContextType = {
    // 状態
    isLoggedIn,
    isCheckingAuth,
    user,
    email,
    password,
    displayName,
    // アクション
    setIsLoggedIn,
    setIsCheckingAuth,
    setUser,
    setEmail,
    setPassword,
    setDisplayName,
    handleLogin,
    handleRegister,
    handleLogout,
    verifyToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 認証コンテキストを使用するカスタムフック
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// 認証状態のみを取得するカスタムフック
export const useAuthState = (): AuthState => {
  const { isLoggedIn, isCheckingAuth, user, email, password, displayName } = useAuthContext();
  return { isLoggedIn, isCheckingAuth, user, email, password, displayName };
};

// 認証アクションのみを取得するカスタムフック
export const useAuthActions = (): AuthActions => {
  const {
    setIsLoggedIn,
    setIsCheckingAuth,
    setUser,
    setEmail,
    setPassword,
    setDisplayName,
    handleLogin,
    handleRegister,
    handleLogout,
    verifyToken,
  } = useAuthContext();
  return {
    setIsLoggedIn,
    setIsCheckingAuth,
    setUser,
    setEmail,
    setPassword,
    setDisplayName,
    handleLogin,
    handleRegister,
    handleLogout,
    verifyToken,
  };
};
