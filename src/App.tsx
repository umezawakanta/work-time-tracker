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

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

interface ReportSummary {
  totalTime: number;
  totalEntries: number;
  averageSessionTime: number;
  todayTime: number;
  thisWeekTime: number;
  thisMonthTime: number;
  projectBreakdown: Array<{
    projectId: string;
    projectName: string;
    totalTime: number;
    entryCount: number;
  }>;
}

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  totalPages: number;
  readPages: number;
  category: string;
  rating: number;
  notes: string;
  lentTo: string;
  createdAt: string;
  updatedAt: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // 時間記録関連の状態
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState("");
  
  // プロジェクト関連の状態
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectColor, setProjectColor] = useState("#3b82f6");
  
  // レポート関連の状態
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [showReports, setShowReports] = useState(false);
  
  // 管理者関連の状態
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // 本棚関連の状態
  const [books, setBooks] = useState<Book[]>([]);
  const [showBookshelf, setShowBookshelf] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [bookPublishedYear, setBookPublishedYear] = useState(new Date().getFullYear());
  const [bookTotalPages, setBookTotalPages] = useState(0);
  const [bookCategory, setBookCategory] = useState("");
  const [bookNotes, setBookNotes] = useState("");

  // ログイン状態をチェック
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // トークンの有効性を検証
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      // 簡単なトークン検証（実際の実装ではJWTをデコード）
      const response = await fetch("/api/projects/list", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsLoggedIn(true);
        loadProjects();
        loadReportSummary();
      } else {
        // トークンが無効な場合は削除
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("access_token");
      setIsLoggedIn(false);
    }
  };

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
        loadProjects(); // プロジェクトを読み込み
        loadReportSummary(); // レポートを読み込み
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("アカウントが作成されました！ログインしてください。");
        setIsRegisterMode(false);
        setEmail("");
        setPassword("");
        setDisplayName("");
        console.log("Registration successful:", data);
      } else {
        setMessage(`登録失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: projectName, 
          description: projectDescription,
          color: projectColor 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("プロジェクトが作成されました！");
        setProjectName("");
        setProjectDescription("");
        setProjectColor("#3b82f6");
        setShowProjectForm(false);
        loadProjects();
        console.log("Project creation successful:", data);
      } else {
        setMessage(`プロジェクト作成失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/projects/list", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const loadReportSummary = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/reports/summary", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReportSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to load report summary:", error);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log('🔍 Debug - loaded users:', data.users);
        console.log('🔍 Debug - first user id:', data.users && data.users[0] ? data.users[0].id : 'no users');
        setAdminUsers(data.users || []);
      } else {
        setMessage(`ユーザー一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load admin users:", error);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleEditUser = async (user: AdminUser) => {
    console.log('🔍 Debug - handleEditUser called with:', user);
    console.log('🔍 Debug - user.id:', user.id);
    setEditingUser(user);
  };

  const handleUpdateUser = async (updatedUser: AdminUser) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // デバッグログ：送信前のデータを確認
      console.log('🔍 Debug - updatedUser:', updatedUser);
      console.log('🔍 Debug - updatedUser.id:', updatedUser.id);
      
      // APIが期待する形式にデータを変換
      const requestData = {
        userId: updatedUser.id,  // idをuserIdに変換
        displayName: updatedUser.displayName,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        status: updatedUser.status
      };

      // デバッグログ：送信するデータを確認
      console.log('🔍 Debug - requestData:', requestData);

      const response = await fetch("/api/admin/user-edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("ユーザー情報を更新しました");
        loadAdminUsers();
        setEditingUser(null);
      } else {
        setMessage(`ユーザー更新失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`${userName}を削除してもよろしいですか？この操作は取り消せません。`)) {
      return;
    }

    // 削除中の状態を設定
    setDeletingUserId(userId);
    
    // 楽観的更新：即座にUIから削除
    const originalUsers = [...adminUsers];
    setAdminUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    setMessage("ユーザーを削除中...");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // トークンがない場合は元に戻す
        setAdminUsers(originalUsers);
        setMessage("認証エラーが発生しました");
        return;
      }

      const response = await fetch("/api/admin/user-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("ユーザーを削除しました");
        // 成功時は楽観的更新のまま維持
      } else {
        // 失敗時は元に戻す
        setAdminUsers(originalUsers);
        setMessage(`ユーザー削除失敗: ${data.message}`);
      }
    } catch (error) {
      // エラー時は元に戻す
      setAdminUsers(originalUsers);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      // 削除中の状態をクリア
      setDeletingUserId(null);
    }
  };

  // 本棚関連の関数
  const loadBooks = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/books", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setBooks(data.books || []);
      } else {
        setMessage(`本の一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookTitle || !bookAuthor || !bookIsbn || !bookCategory) {
      setMessage("必須フィールドを入力してください");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
          publishedYear: bookPublishedYear,
          totalPages: bookTotalPages,
          category: bookCategory,
          notes: bookNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("本を追加しました！");
        setBookTitle("");
        setBookAuthor("");
        setBookIsbn("");
        setBookPublishedYear(new Date().getFullYear());
        setBookTotalPages(0);
        setBookCategory("");
        setBookNotes("");
        setShowBookForm(false);
        loadBooks();
      } else {
        setMessage(`本の追加失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookIsbn(book.isbn);
    setBookPublishedYear(book.publishedYear);
    setBookTotalPages(book.totalPages);
    setBookCategory(book.category);
    setBookNotes(book.notes);
    setShowBookForm(true);
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBook) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/books/${editingBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
          publishedYear: bookPublishedYear,
          totalPages: bookTotalPages,
          category: bookCategory,
          notes: bookNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("本を更新しました！");
        setEditingBook(null);
        setShowBookForm(false);
        loadBooks();
      } else {
        setMessage(`本の更新失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!window.confirm(`「${bookTitle}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage("本を削除しました");
        loadBooks();
      } else {
        setMessage(`本の削除失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const getReadingProgress = (book: Book) => {
    if (book.totalPages === 0) return 0;
    return Math.round((book.readPages / book.totalPages) * 100);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setUser(null);
    setMessage("");
    setCurrentTimeEntry(null);
    setIsTracking(false);
    setElapsedTime(0);
    setProjects([]);
    setSelectedProject("");
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
            
            {/* プロジェクト管理セクション */}
            <div className="projects-section">
              <div className="section-header">
                <h2>プロジェクト</h2>
                <button 
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="add-project-button"
                >
                  {showProjectForm ? "キャンセル" : "プロジェクト追加"}
                </button>
              </div>

              {showProjectForm && (
                <form onSubmit={handleCreateProject} className="project-form">
                  <div className="form-group">
                    <label htmlFor="projectName">プロジェクト名</label>
                    <input
                      type="text"
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="projectDescription">説明（任意）</label>
                    <input
                      type="text"
                      id="projectDescription"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="projectColor">色</label>
                    <input
                      type="color"
                      id="projectColor"
                      value={projectColor}
                      onChange={(e) => setProjectColor(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="submit-button">
                    {loading ? "作成中..." : "プロジェクト作成"}
                  </button>
                </form>
              )}

              <div className="projects-list">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className={`project-item ${selectedProject === project.id ? 'selected' : ''}`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div 
                      className="project-color" 
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <div className="project-info">
                      <h3>{project.name}</h3>
                      {project.description && <p>{project.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* レポートセクション */}
            <div className="reports-section">
              <div className="section-header">
                <h2>レポート</h2>
                <button 
                  onClick={() => {
                    setShowReports(!showReports);
                    if (!showReports && !reportSummary) {
                      loadReportSummary();
                    }
                  }}
                  className="toggle-reports-button"
                >
                  {showReports ? "レポートを閉じる" : "レポートを表示"}
                </button>
              </div>

              {showReports && reportSummary && (
                <div className="report-content">
                  <div className="report-stats">
                    <div className="stat-card">
                      <h3>総作業時間</h3>
                      <p className="stat-value">{formatTime(reportSummary.totalTime)}</p>
                    </div>
                    <div className="stat-card">
                      <h3>今日の作業時間</h3>
                      <p className="stat-value">{formatTime(reportSummary.todayTime)}</p>
                    </div>
                    <div className="stat-card">
                      <h3>今週の作業時間</h3>
                      <p className="stat-value">{formatTime(reportSummary.thisWeekTime)}</p>
                    </div>
                    <div className="stat-card">
                      <h3>今月の作業時間</h3>
                      <p className="stat-value">{formatTime(reportSummary.thisMonthTime)}</p>
                    </div>
                  </div>
                  
                  <div className="report-details">
                    <div className="detail-section">
                      <h3>セッション統計</h3>
                      <p>総セッション数: {reportSummary.totalEntries}回</p>
                      <p>平均セッション時間: {formatTime(reportSummary.averageSessionTime)}</p>
                    </div>
                    
                    {reportSummary.projectBreakdown.length > 0 && (
                      <div className="detail-section">
                        <h3>プロジェクト別時間</h3>
                        <div className="project-breakdown">
                          {reportSummary.projectBreakdown.map((project) => (
                            <div key={project.projectId} className="breakdown-item">
                              <span className="project-name">{project.projectName}</span>
                              <span className="project-time">{formatTime(project.totalTime)}</span>
                              <span className="project-count">({project.entryCount}回)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 管理者パネル */}
            {user?.role === 'admin' && (
              <div className="admin-section">
                <div className="section-header">
                  <h2>管理者パネル</h2>
                  <button 
                    onClick={() => {
                      setShowAdminPanel(!showAdminPanel);
                      if (!showAdminPanel && adminUsers.length === 0) {
                        loadAdminUsers();
                      }
                    }}
                    className="toggle-admin-button"
                  >
                    {showAdminPanel ? "管理者パネルを閉じる" : "管理者パネルを表示"}
                  </button>
                </div>

                {showAdminPanel && (
                  <div className="admin-content">
                    <div className="admin-stats">
                      <div className="stat-card">
                        <h3>総ユーザー数</h3>
                        <p className="stat-value">{adminUsers.length}</p>
                      </div>
                      <div className="stat-card">
                        <h3>アクティブユーザー</h3>
                        <p className="stat-value">{adminUsers.filter(u => u.status === 'active').length}</p>
                      </div>
                      <div className="stat-card">
                        <h3>管理者数</h3>
                        <p className="stat-value">{adminUsers.filter(u => u.role === 'admin').length}</p>
                      </div>
                    </div>

                    <div className="users-table">
                      <h3>ユーザー一覧</h3>
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>表示名</th>
                              <th>メール</th>
                              <th>役割</th>
                              <th>状態</th>
                              <th>登録日</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminUsers.map((user) => (
                              <tr key={user.id}>
                                <td>{user.displayName}</td>
                                <td>{user.email}</td>
                                <td>
                                  <span className={`role-badge ${user.role}`}>
                                    {user.role === 'admin' ? '管理者' : 'ユーザー'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-badge ${user.status}`}>
                                    {user.status === 'active' ? 'アクティブ' : 
                                     user.status === 'inactive' ? '非アクティブ' : '停止中'}
                                  </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                  <button 
                                    onClick={() => handleEditUser(user)}
                                    className="edit-button"
                                  >
                                    編集
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user.id, user.displayName)}
                                    className="delete-button"
                                    style={{ 
                                      marginLeft: '8px', 
                                      backgroundColor: deletingUserId === user.id ? '#6c757d' : '#dc3545',
                                      opacity: deletingUserId === user.id ? 0.7 : 1
                                    }}
                                    disabled={deletingUserId === user.id}
                                  >
                                    {deletingUserId === user.id ? '削除中...' : '削除'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ユーザー編集フォーム */}
                    {editingUser && (
                      <div className="edit-user-form">
                        <h3>ユーザー編集</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateUser(editingUser);
                        }}>
                          <div className="form-group">
                            <label>表示名</label>
                            <input
                              type="text"
                              value={editingUser.displayName}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                displayName: e.target.value
                              })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>メールアドレス</label>
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                email: e.target.value
                              })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>役割</label>
                            <select
                              value={editingUser.role}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                role: e.target.value
                              })}
                            >
                              <option value="user">ユーザー</option>
                              <option value="admin">管理者</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>状態</label>
                            <select
                              value={editingUser.status}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                status: e.target.value
                              })}
                            >
                              <option value="active">アクティブ</option>
                              <option value="inactive">非アクティブ</option>
                              <option value="suspended">停止</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={editingUser.isVerified}
                                onChange={(e) => setEditingUser({
                                  ...editingUser,
                                  isVerified: e.target.checked
                                })}
                              />
                              認証済み
                            </label>
                          </div>
                          <div className="form-actions">
                            <button type="submit" className="save-button">
                              保存
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setEditingUser(null)}
                              className="cancel-button"
                            >
                              キャンセル
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 本棚セクション */}
            <div className="bookshelf-section">
              <div className="section-header">
                <h2>本棚</h2>
                <button 
                  onClick={() => {
                    setShowBookshelf(!showBookshelf);
                    if (!showBookshelf && books.length === 0) {
                      loadBooks();
                    }
                  }}
                  className="toggle-bookshelf-button"
                >
                  {showBookshelf ? "本棚を閉じる" : "本棚を表示"}
                </button>
              </div>

              {showBookshelf && (
                <div className="bookshelf-content">
                  <div className="bookshelf-stats">
                    <div className="stat-card">
                      <h3>総冊数</h3>
                      <p className="stat-value">{books.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>読了済み</h3>
                      <p className="stat-value">{books.filter(book => book.readPages >= book.totalPages && book.totalPages > 0).length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>読書中</h3>
                      <p className="stat-value">{books.filter(book => book.readPages > 0 && book.readPages < book.totalPages).length}</p>
                    </div>
                  </div>

                  <div className="bookshelf-actions">
                    <button 
                      onClick={() => {
                        setEditingBook(null);
                        setShowBookForm(!showBookForm);
                        if (!showBookForm) {
                          setBookTitle("");
                          setBookAuthor("");
                          setBookIsbn("");
                          setBookPublishedYear(new Date().getFullYear());
                          setBookTotalPages(0);
                          setBookCategory("");
                          setBookNotes("");
                        }
                      }}
                      className="add-book-button"
                    >
                      {showBookForm ? "キャンセル" : "本を追加"}
                    </button>
                  </div>

                  {showBookForm && (
                    <form onSubmit={editingBook ? handleUpdateBook : handleCreateBook} className="book-form">
                      <h3>{editingBook ? "本を編集" : "本を追加"}</h3>
                      <div className="form-group">
                        <label htmlFor="bookTitle">タイトル *</label>
                        <input
                          type="text"
                          id="bookTitle"
                          value={bookTitle}
                          onChange={(e) => setBookTitle(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookAuthor">著者 *</label>
                        <input
                          type="text"
                          id="bookAuthor"
                          value={bookAuthor}
                          onChange={(e) => setBookAuthor(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookIsbn">ISBN *</label>
                        <input
                          type="text"
                          id="bookIsbn"
                          value={bookIsbn}
                          onChange={(e) => setBookIsbn(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookPublishedYear">出版年 *</label>
                        <input
                          type="number"
                          id="bookPublishedYear"
                          value={bookPublishedYear}
                          onChange={(e) => setBookPublishedYear(parseInt(e.target.value) || new Date().getFullYear())}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookTotalPages">総ページ数 *</label>
                        <input
                          type="number"
                          id="bookTotalPages"
                          value={bookTotalPages}
                          onChange={(e) => setBookTotalPages(parseInt(e.target.value) || 0)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookCategory">カテゴリ *</label>
                        <select
                          id="bookCategory"
                          value={bookCategory}
                          onChange={(e) => setBookCategory(e.target.value)}
                          required
                          disabled={loading}
                        >
                          <option value="">選択してください</option>
                          <option value="小説">小説</option>
                          <option value="ノンフィクション">ノンフィクション</option>
                          <option value="技術書">技術書</option>
                          <option value="ビジネス">ビジネス</option>
                          <option value="自己啓発">自己啓発</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookNotes">メモ</label>
                        <textarea
                          id="bookNotes"
                          value={bookNotes}
                          onChange={(e) => setBookNotes(e.target.value)}
                          disabled={loading}
                          rows={3}
                        />
                      </div>
                      <button type="submit" disabled={loading} className="submit-button">
                        {loading ? "処理中..." : (editingBook ? "更新" : "追加")}
                      </button>
                    </form>
                  )}

                  <div className="books-list">
                    {books.length === 0 ? (
                      <p className="no-books">本が登録されていません</p>
                    ) : (
                      books.map((book) => (
                        <div key={book.id} className="book-item">
                          <div className="book-info">
                            <h3>{book.title}</h3>
                            <p className="book-author">{book.author}</p>
                            <p className="book-meta">
                              {book.publishedYear}年 | {book.category} | {book.totalPages}ページ
                            </p>
                            {book.notes && (
                              <p className="book-notes">{book.notes}</p>
                            )}
                            <div className="reading-progress">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill" 
                                  style={{ width: `${getReadingProgress(book)}%` }}
                                ></div>
                              </div>
                              <span className="progress-text">
                                {book.readPages} / {book.totalPages} ページ ({getReadingProgress(book)}%)
                              </span>
                            </div>
                          </div>
                          <div className="book-actions">
                            <button 
                              onClick={() => handleEditBook(book)}
                              className="edit-button"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id, book.title)}
                              className="delete-button"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
}

export default App;