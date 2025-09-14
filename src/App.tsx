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

interface TimeEntry {
  id: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  project?: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // 時間記録関連の状態
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState("");

  // ログイン状態をチェック
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // 経過時間の更新
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && currentTimeEntry) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - currentTimeEntry.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, currentTimeEntry]);

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
    setCurrentTimeEntry(null);
    setIsTracking(false);
    setElapsedTime(0);
  };

  const handleStartTracking = async () => {
    if (!description.trim()) {
      setMessage("作業内容を入力してください");
      return;
    }

    try {
      const response = await fetch("/api/time/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (data.success) {
        const newEntry: TimeEntry = {
          id: data.entry.id,
          description,
          startTime: new Date(data.entry.startTime),
        };
        setCurrentTimeEntry(newEntry);
        setIsTracking(true);
        setElapsedTime(0);
        setMessage("時間記録を開始しました");
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleStopTracking = async () => {
    if (!currentTimeEntry) return;

    try {
      const response = await fetch("/api/time/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ entryId: currentTimeEntry.id }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentTimeEntry(null);
        setIsTracking(false);
        setElapsedTime(0);
        setDescription("");
        setMessage(`時間記録を停止しました。記録時間: ${formatTime(data.entry.duration)}`);
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            <div className="time-tracking-section">
              <h2>時間記録</h2>
              
              {!isTracking ? (
                <div className="start-tracking">
                  <div className="form-group">
                    <label htmlFor="description">作業内容</label>
                    <input
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="作業内容を入力してください"
                    />
                  </div>
                  <button onClick={handleStartTracking} className="start-button">
                    記録開始
                  </button>
                </div>
              ) : (
                <div className="tracking-active">
                  <div className="current-entry">
                    <h3>記録中: {currentTimeEntry?.description}</h3>
                    <div className="elapsed-time">
                      {formatTime(elapsedTime)}
                    </div>
                    <button onClick={handleStopTracking} className="stop-button">
                      記録停止
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="feature-cards">
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