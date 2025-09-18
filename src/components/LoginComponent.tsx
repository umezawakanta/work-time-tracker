import React, { useState } from 'react';
import './LoginComponent.css';

interface LoginComponentProps {
  onLogin: (e: React.FormEvent) => void;
  onRegister: (e: React.FormEvent) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  loading: boolean;
  message: string;
}

const LoginComponent: React.FC<LoginComponentProps> = ({
  onLogin,
  onRegister,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  name,
  setName,
  isLogin,
  setIsLogin,
  loading,
  message,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(e);
    } else {
      onRegister(e);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="app-logo">
            <div className="logo-character">
              <div className="character-halo"></div>
              <div className="character-wings">
                <div className="wing left-wing"></div>
                <div className="wing right-wing"></div>
              </div>
              <div className="character-face">
                <div className="character-eyes">
                  <div className="eye left-eye"></div>
                  <div className="eye right-eye"></div>
                </div>
                <div className="character-mouth"></div>
              </div>
              <div className="character-body"></div>
              <div className="sparkles">
                <div className="sparkle sparkle-1"></div>
                <div className="sparkle sparkle-2"></div>
                <div className="sparkle sparkle-3"></div>
                <div className="sparkle sparkle-4"></div>
                <div className="sparkle sparkle-5"></div>
                <div className="sparkle sparkle-6"></div>
              </div>
            </div>
          </div>
          <h1>Work Time Tracker</h1>
          <p className="app-description">
            可愛いキャラクターと一緒に作業時間を管理しよう！
          </p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            ログイン
          </button>
          <button
            className={`tab-button ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">お名前</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="お名前を入力してください"
                required={!isLogin}
                disabled={loading}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力してください"
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力してください"
                required
                disabled={loading}
                className="form-input password-input"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle"
                disabled={loading}
                title={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">パスワード確認</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="パスワードを再入力してください"
                  required={!isLogin}
                  disabled={loading}
                  className="form-input password-input"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle"
                  disabled={loading}
                  title={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className={`message ${message.includes('エラー') || message.includes('失敗') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                {isLogin ? 'ログイン中...' : '登録中...'}
              </div>
            ) : (
              isLogin ? 'ログイン' : '新規登録'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="privacy-note">
            アカウントを作成することで、
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              プライバシーポリシー
            </a>
            および
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              利用規約
            </a>
            に同意したものとみなされます。
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
