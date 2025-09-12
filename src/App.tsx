import React, { useState, useEffect } from "react";
import "./App.css";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  preferences: any;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ログイン状態をチェック
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // トークンが有効かチェック（簡易版）
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("ログイン成功！");
        setUser(data.user);
        setIsLoggedIn(true);
        if (data.token) {
          localStorage.setItem("access_token", data.token);
        }
        console.log("Login successful:", data);
      } else {
        setMessage(`ログイン失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setUser(null);
    setMessage("");
  };

  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="dashboard">
          <header className="dashboard-header">
            <h1>Work Time Tracker</h1>
            <div className="user-info">
              <span>こんにちは、{user?.displayName || user?.email}さん</span>
              <button onClick={handleLogout} className="logout-button">
                ログアウト
              </button>
            </div>
          </header>
          
          <main className="dashboard-main">
            <div className="welcome-card">
              <h2>ダッシュボード</h2>
              <p>時間記録機能を開始する準備ができました。</p>
            </div>
            
            <div className="feature-cards">
              <div className="feature-card">
                <h3>時間記録</h3>
                <p>作業時間を記録・管理</p>
                <button className="feature-button" disabled>
                  準備中
                </button>
              </div>
              
              <div className="feature-card">
                <h3>プロジェクト管理</h3>
                <p>プロジェクト別の時間管理</p>
                <button className="feature-button" disabled>
                  準備中
                </button>
              </div>
              
              <div className="feature-card">
                <h3>レポート</h3>
                <p>時間使用状況の分析</p>
                <button className="feature-button" disabled>
                  準備中
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="login-container">
        <h1>Work Time Tracker</h1>
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
        </form>
        {message && (
          <div className={`message ${message.includes("成功") ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;