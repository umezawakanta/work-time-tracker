import React from 'react';
import type { User } from '../types';

interface LoginFormProps {
  isRegisterMode: boolean;
  setIsRegisterMode: (mode: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  loading: boolean;
  message: string;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleRegister: (e: React.FormEvent) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({
  isRegisterMode,
  setIsRegisterMode,
  email,
  setEmail,
  password,
  setPassword,
  displayName,
  setDisplayName,
  loading,
  message,
  handleLogin,
  handleRegister
}) => {
  return (
    <div className="app">
      <div className="login-container">
        <h1>Work Time Tracker</h1>
        
        {isRegisterMode ? (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label htmlFor="displayName">表示名</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <button type="submit" disabled={loading} className="login-button">
              {loading ? "登録中..." : "アカウント作成"}
            </button>
            <button 
              type="button" 
              onClick={() => setIsRegisterMode(false)}
              className="switch-button"
            >
              ログインに戻る
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading} className="login-button">
              {loading ? "ログイン中..." : "ログイン"}
            </button>
            <button 
              type="button" 
              onClick={() => setIsRegisterMode(true)}
              className="switch-button"
            >
              アカウント作成
            </button>
          </form>
        )}
        
        {message && (
          <div className={`message ${message.includes("成功") || message.includes("作成") ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
