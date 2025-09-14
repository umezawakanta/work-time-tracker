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

interface Memo {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Reply[];
}

interface Reply {
  id: string;
  memoId: string;
  content: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
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

  // メモ関連の状態
  const [memos, setMemos] = useState<Memo[]>([]);
  const [showMemos, setShowMemos] = useState(false);
  const [showMemoForm, setShowMemoForm] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoContent, setMemoContent] = useState("");
  const [memoCategory, setMemoCategory] = useState("");
  const [memoTags, setMemoTags] = useState("");
  const [memoIsPublic, setMemoIsPublic] = useState(false);
  const [memoSearchTerm, setMemoSearchTerm] = useState("");
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("all");

  // 公開メモ関連の状態
  const [publicMemos, setPublicMemos] = useState<Memo[]>([]);
  const [showPublicMemos, setShowPublicMemos] = useState(false);
  const [publicMemoSearchTerm, setPublicMemoSearchTerm] = useState("");
  const [selectedPublicMemoCategory, setSelectedPublicMemoCategory] = useState("all");

  // フォント設定関連の状態
  const [selectedFont, setSelectedFont] = useState("system");
  const [showFontSettings, setShowFontSettings] = useState(false);

  // テーマ設定関連の状態
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  // カスタムジャンル管理の状態
  const [customGenres, setCustomGenres] = useState<string[]>([]);
  const [showGenreManager, setShowGenreManager] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");

  // 返信機能の状態
  const [replyingToMemo, setReplyingToMemo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // 利用可能なテーマ一覧
  const availableThemes = [
    { value: "default", label: "🌟 デフォルト (ピンク)", preview: "💕" },
    { value: "dark", label: "🌙 ダークテーマ", preview: "🌚" },
    { value: "ocean", label: "🌊 オーシャン", preview: "🐠" },
    { value: "forest", label: "🌲 フォレスト", preview: "🦋" },
    { value: "sunset", label: "🌅 サンセット", preview: "🌇" },
    { value: "rainbow", label: "🌈 レインボー", preview: "🦄" },
    { value: "space", label: "🚀 スペース", preview: "🛸" },
    { value: "candy", label: "🍭 キャンディ", preview: "🍬" },
    { value: "pastel", label: "🌸 パステル", preview: "🦄" },
    { value: "neon", label: "💫 ネオン", preview: "⚡" }
  ];

  // 利用可能なフォント一覧（小学生向けかわいいフォント中心）
  const availableFonts = [
    { value: "system", label: "🌟 システムデフォルト" },
    // かわいい日本語フォント
    { value: "Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🍡 Kosugi Maru (丸文字) - おすすめ！" },
    { value: "M PLUS Rounded 1c, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🎀 M PLUS Rounded (丸文字) - かわいい！" },
    { value: "Hiragino Maru Gothic ProN, ヒラギノ丸ゴ ProN W4, Meiryo, メイリオ, Osaka, MS PGothic, sans-serif", label: "💕 ヒラギノ丸ゴ (丸文字) - やわらかい" },
    { value: "Nico Moji, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "✨ Nico Moji (手書き風) - かわいい！" },
    { value: "Hachi Maru Pop, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌸 Hachi Maru Pop (丸文字) - ポップ！" },
    { value: "Yomogi, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌺 Yomogi (手書き風) - やさしい" },
    { value: "Shippori Mincho, ヒラギノ明朝 ProN W3, Hiragino Mincho ProN, 游明朝, Yu Mincho, serif", label: "🎨 Shippori Mincho (手書き風) - アート" },
    { value: "Noto Sans CJK JP, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌈 Noto Sans (丸文字風) - カラフル" },
    { value: "Sawarabi Mincho, ヒラギノ明朝 ProN W3, Hiragino Mincho ProN, 游明朝, Yu Mincho, serif", label: "🌿 Sawarabi Mincho (手書き風) - 自然" },
    { value: "Sawarabi Gothic, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌱 Sawarabi Gothic (やわらか) - やさしい" },
    // かわいい英語フォント
    { value: "Comic Sans MS, cursive", label: "🎪 Comic Sans MS (かわいい) - 楽しい！" },
    { value: "Chalkduster, cursive", label: "🖍️ Chalkduster (チョーク風) - 学校みたい！" },
    { value: "Marker Felt, fantasy", label: "🖊️ Marker Felt (マーカー風) - カラフル！" },
    { value: "Bradley Hand, cursive", label: "✏️ Bradley Hand (手書き風) - やさしい" },
    { value: "Snell Roundhand, cursive", label: "💌 Snell Roundhand (手書き風) - エレガント" },
    { value: "Brush Script MT, cursive", label: "🖌️ Brush Script MT (ブラシ風) - アート" },
    { value: "Lucida Handwriting, cursive", label: "📝 Lucida Handwriting (手書き風) - きれい" },
    { value: "Papyrus, fantasy", label: "📜 Papyrus (古代風) - おもしろい！" },
    { value: "Chalkboard, fantasy", label: "🖼️ Chalkboard (黒板風) - 学校！" },
    { value: "Herculanum, fantasy", label: "🏛️ Herculanum (古代風) - かっこいい！" },
    // その他のフォント
    { value: "serif", label: "📚 Serif (明朝体) - 本みたい" },
    { value: "sans-serif", label: "📖 Sans-serif (ゴシック体) - 読みやすい" },
    { value: "monospace", label: "💻 Monospace (等幅) - プログラマー" },
    { value: "cursive", label: "✍️ Cursive (筆記体) - 手書き風" },
    { value: "fantasy", label: "🎭 Fantasy (装飾体) - おもしろい" }
  ];

  // フォント設定の読み込みと適用
  useEffect(() => {
    const savedFont = localStorage.getItem("selectedFont");
    if (savedFont) {
      setSelectedFont(savedFont);
      // 少し遅延してからフォントを適用（DOMが完全に読み込まれてから）
      setTimeout(() => {
        applyFont(savedFont);
      }, 100);
    }
  }, []);

  // カスタムジャンルの読み込み
  useEffect(() => {
    const savedGenres = localStorage.getItem("customGenres");
    if (savedGenres) {
      try {
        setCustomGenres(JSON.parse(savedGenres));
      } catch (error) {
        console.error("Failed to load custom genres:", error);
      }
    }
  }, []);

  // テーマ設定の読み込みと適用
  useEffect(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  // フォント適用関数
  const applyFont = (fontValue: string) => {
    const root = document.documentElement;
    const body = document.body;
    
    if (fontValue === "system") {
      root.style.setProperty("--app-font-family", "");
      body.style.fontFamily = "";
      // すべての要素にフォントをリセット
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        (el as HTMLElement).style.fontFamily = "";
      });
    } else {
      root.style.setProperty("--app-font-family", fontValue);
      body.style.fontFamily = fontValue;
      // すべての要素に直接フォントを適用
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        (el as HTMLElement).style.fontFamily = fontValue;
      });
    }
    
    // デバッグ用ログ
    console.log("Applied font:", fontValue);
    console.log("CSS variable:", root.style.getPropertyValue("--app-font-family"));
  };

  // フォント変更ハンドラー
  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue);
    applyFont(fontValue);
    localStorage.setItem("selectedFont", fontValue);
  };

  // テーマ適用関数
  const applyTheme = (themeValue: string) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", themeValue);
    
    // デバッグ用ログ
    console.log("Applying theme:", themeValue);
    console.log("Root element:", root);
    console.log("Data-theme attribute:", root.getAttribute("data-theme"));
    
    // 強制的にCSS変数を適用
    if (themeValue === "dark") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #68d391 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #4a5568 0%, #68d391 100%)");
      root.style.setProperty("--accent-color", "#68d391");
      root.style.setProperty("--text-color", "#e2e8f0");
      root.style.setProperty("--bg-color", "#1a202c");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #2d3748 0%, #4a5568 100%)");
    } else if (themeValue === "ocean") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #06b6d4 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #0284c7 0%, #06b6d4 100%)");
      root.style.setProperty("--accent-color", "#06b6d4");
      root.style.setProperty("--text-color", "#0f172a");
      root.style.setProperty("--bg-color", "#f0f9ff");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #e0f2fe 0%, #bae6fd 100%)");
    } else if (themeValue === "forest") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #22c55e 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #15803d 0%, #22c55e 100%)");
      root.style.setProperty("--accent-color", "#22c55e");
      root.style.setProperty("--text-color", "#14532d");
      root.style.setProperty("--bg-color", "#f0fdf4");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #dcfce7 0%, #bbf7d0 100%)");
    } else if (themeValue === "sunset") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #fb923c 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #ea580c 0%, #fb923c 100%)");
      root.style.setProperty("--accent-color", "#fb923c");
      root.style.setProperty("--text-color", "#9a3412");
      root.style.setProperty("--bg-color", "#fff7ed");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #fed7aa 0%, #fdba74 100%)");
    } else if (themeValue === "rainbow") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #a78bfa 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #7c3aed 0%, #a78bfa 100%)");
      root.style.setProperty("--accent-color", "#a78bfa");
      root.style.setProperty("--text-color", "#581c87");
      root.style.setProperty("--bg-color", "#faf5ff");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #e9d5ff 0%, #ddd6fe 100%)");
    } else if (themeValue === "space") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #1e293b 0%, #334155 50%, #6366f1 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #334155 0%, #6366f1 100%)");
      root.style.setProperty("--accent-color", "#6366f1");
      root.style.setProperty("--text-color", "#e2e8f0");
      root.style.setProperty("--bg-color", "#0f172a");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #1e293b 0%, #334155 100%)");
    } else if (themeValue === "candy") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #ec4899 0%, #db2777 50%, #f472b6 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #db2777 0%, #f472b6 100%)");
      root.style.setProperty("--accent-color", "#f472b6");
      root.style.setProperty("--text-color", "#831843");
      root.style.setProperty("--bg-color", "#fdf2f8");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #fce7f3 0%, #fbcfe8 100%)");
    } else if (themeValue === "pastel") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #c4b5fd 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #8b5cf6 0%, #c4b5fd 100%)");
      root.style.setProperty("--accent-color", "#c4b5fd");
      root.style.setProperty("--text-color", "#6b21a8");
      root.style.setProperty("--bg-color", "#faf5ff");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #f3e8ff 0%, #ede9fe 100%)");
    } else if (themeValue === "neon") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #10b981 0%, #059669 50%, #34d399 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #059669 0%, #34d399 100%)");
      root.style.setProperty("--accent-color", "#34d399");
      root.style.setProperty("--text-color", "#064e3b");
      root.style.setProperty("--bg-color", "#ecfdf5");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #d1fae5 0%, #a7f3d0 100%)");
    } else {
      // デフォルトテーマ（ピンク）
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 50%, #ffa8a8 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)");
      root.style.setProperty("--accent-color", "#ffb6c1");
      root.style.setProperty("--text-color", "#333");
      root.style.setProperty("--bg-color", "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)");
    }
  };

  // テーマ変更ハンドラー
  const handleThemeChange = (themeValue: string) => {
    setSelectedTheme(themeValue);
    applyTheme(themeValue);
    localStorage.setItem("selectedTheme", themeValue);
    
    // 強制的にスタイルを再適用
    setTimeout(() => {
      applyTheme(themeValue);
      // さらに強制的にDOM要素のスタイルを更新
      const body = document.body;
      const dashboard = document.querySelector('.dashboard');
      const header = document.querySelector('.dashboard-header');
      const timeSection = document.querySelector('.time-tracking-section');
      
      if (body) {
        body.style.background = getComputedStyle(document.documentElement).getPropertyValue('--bg-color') || 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)';
        body.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#333';
      }
      
      if (dashboard) {
        (dashboard as HTMLElement).style.background = getComputedStyle(document.documentElement).getPropertyValue('--card-bg') || 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)';
      }
      
      if (header) {
        (header as HTMLElement).style.background = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 50%, #ffa8a8 100%)';
        (header as HTMLElement).style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color') || 'white';
      }
      
      if (timeSection) {
        (timeSection as HTMLElement).style.background = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color') || 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)';
      }
    }, 100);
  };

  // カスタムジャンル管理関数
  const handleAddGenre = () => {
    if (newGenreName.trim() && !customGenres.includes(newGenreName.trim())) {
      const updatedGenres = [...customGenres, newGenreName.trim()];
      setCustomGenres(updatedGenres);
      localStorage.setItem("customGenres", JSON.stringify(updatedGenres));
      setNewGenreName("");
    }
  };

  const handleDeleteGenre = (genreToDelete: string) => {
    const updatedGenres = customGenres.filter(genre => genre !== genreToDelete);
    setCustomGenres(updatedGenres);
    localStorage.setItem("customGenres", JSON.stringify(updatedGenres));
  };

  // 利用可能なジャンル一覧を取得（デフォルト + カスタム）
  const getAllGenres = () => {
    const defaultGenres = [
      "仕事", "学習", "趣味", "健康", "家族", "旅行", "読書", "映画", "音楽", "スポーツ", "料理", "その他"
    ];
    return [...defaultGenres, ...customGenres];
  };

  // 返信機能の関数
  const handleReplySubmit = async (memoId: string) => {
    if (!replyContent.trim()) {
      setMessage("返信内容を入力してください");
      return;
    }

    if (!isLoggedIn || !user) {
      setMessage("ログインが必要です");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch('/api/memos/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          memoId,
          content: replyContent.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage("返信を投稿しました！");
        setReplyContent("");
        setReplyingToMemo(null);
        // 公開メモを再読み込み
        loadPublicMemos();
      } else {
        setMessage(data.message || "返信の投稿に失敗しました");
      }
    } catch (error) {
      console.error("Reply submission error:", error);
      setMessage("返信の投稿中にエラーが発生しました");
    }
  };

  const handleReplyCancel = () => {
    setReplyingToMemo(null);
    setReplyContent("");
  };

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

  // メモ関連の関数
  const loadMemos = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      if (selectedMemoCategory !== 'all') {
        params.append('category', selectedMemoCategory);
      }
      if (memoSearchTerm) {
        params.append('search', memoSearchTerm);
      }

      const response = await fetch(`/api/memos?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMemos(data.memos || []);
      } else {
        setMessage(`メモの一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load memos:", error);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleCreateMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memoTitle || !memoContent || !memoCategory) {
      setMessage("タイトル、内容、カテゴリは必須です");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const tags = memoTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const response = await fetch("/api/memos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: memoTitle,
          content: memoContent,
          category: memoCategory,
          tags,
          isPublic: memoIsPublic,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("メモを追加しました！");
        setMemoTitle("");
        setMemoContent("");
        setMemoCategory("");
        setMemoTags("");
        setMemoIsPublic(false);
        setShowMemoForm(false);
        loadMemos();
      } else {
        setMessage(`メモの追加失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setMemoTitle(memo.title);
    setMemoContent(memo.content);
    setMemoCategory(memo.category);
    setMemoTags(memo.tags.join(', '));
    setMemoIsPublic(memo.isPublic);
    setShowMemoForm(true);
  };

  const handleUpdateMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMemo) return;

    try {
      const token = localStorage.getItem("access_token");
      const tags = memoTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const response = await fetch(`/api/memos/${editingMemo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: memoTitle,
          content: memoContent,
          category: memoCategory,
          tags,
          isPublic: memoIsPublic,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("メモを更新しました！");
        setEditingMemo(null);
        setShowMemoForm(false);
        loadMemos();
      } else {
        setMessage(`メモの更新失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteMemo = async (memoId: string, memoTitle: string) => {
    if (!window.confirm(`「${memoTitle}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/memos/${memoId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage("メモを削除しました");
        loadMemos();
      } else {
        setMessage(`メモの削除失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleMemoSearch = () => {
    loadMemos();
  };

  const handleMemoCategoryChange = (category: string) => {
    setSelectedMemoCategory(category);
    loadMemos();
  };

  const getMemoCategories = () => {
    const memoCategories = new Set(memos.map(memo => memo.category));
    const allCategories = [...memoCategories, ...getAllGenres()];
    return Array.from(new Set(allCategories)).sort();
  };

  // 公開メモ関連の関数
  const loadPublicMemos = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedPublicMemoCategory !== 'all') {
        params.append('category', selectedPublicMemoCategory);
      }
      if (publicMemoSearchTerm) {
        params.append('search', publicMemoSearchTerm);
      }

      const response = await fetch(`/api/memos/public?${params.toString()}`);

      const data = await response.json();

      if (data.success) {
        setPublicMemos(data.memos || []);
      } else {
        setMessage(`公開メモの一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load public memos:", error);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handlePublicMemoSearch = () => {
    loadPublicMemos();
  };

  const handlePublicMemoCategoryChange = (category: string) => {
    setSelectedPublicMemoCategory(category);
    loadPublicMemos();
  };

  const getPublicMemoCategories = () => {
    const memoCategories = new Set(publicMemos.map(memo => memo.category));
    const allCategories = [...memoCategories, ...getAllGenres()];
    return Array.from(new Set(allCategories)).sort();
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
            <h1>⏰ Work Time Tracker 📚</h1>
            <div className="user-info">
              <span>👋 こんにちは、{user?.displayName || user?.email}さん！</span>
              <button 
                onClick={() => setShowThemeSettings(!showThemeSettings)} 
                className="theme-settings-button"
                title="テーマ設定"
              >
                🎨 テーマ
              </button>
              <button 
                onClick={() => setShowFontSettings(!showFontSettings)} 
                className="font-settings-button"
                title="フォント設定"
              >
                🔤 フォント
              </button>
              <button onClick={handleLogout} className="logout-button">
                🚪 ログアウト
              </button>
            </div>
          </header>
          
          <main className="dashboard-main">
            <div className="time-tracking-section">
              <h2>⏱️ 時間記録</h2>
              
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
                    ▶️ 記録開始
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
                      ⏹️ 記録停止
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* プロジェクト管理セクション */}
            <div className="projects-section">
              <div className="section-header">
                <h2>📁 プロジェクト</h2>
                <button 
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="add-project-button"
                >
                  {showProjectForm ? "❌ キャンセル" : "➕ プロジェクト追加"}
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
                <h2>📊 レポート</h2>
                <button 
                  onClick={() => {
                    setShowReports(!showReports);
                    if (!showReports && !reportSummary) {
                      loadReportSummary();
                    }
                  }}
                  className="toggle-reports-button"
                >
                  {showReports ? "📊 レポートを閉じる" : "📊 レポートを表示"}
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
                  <h2>👑 管理者パネル</h2>
                  <button 
                    onClick={() => {
                      setShowAdminPanel(!showAdminPanel);
                      if (!showAdminPanel && adminUsers.length === 0) {
                        loadAdminUsers();
                      }
                    }}
                    className="toggle-admin-button"
                  >
                    {showAdminPanel ? "👑 管理者パネルを閉じる" : "👑 管理者パネルを表示"}
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
                <h2>📚 本棚</h2>
                <button 
                  onClick={() => {
                    setShowBookshelf(!showBookshelf);
                    if (!showBookshelf && books.length === 0) {
                      loadBooks();
                    }
                  }}
                  className="toggle-bookshelf-button"
                >
                  {showBookshelf ? "📚 本棚を閉じる" : "📚 本棚を表示"}
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

            {/* メモセクション */}
            <div className="memos-section">
              <div className="section-header">
                <h2>📝 メモ</h2>
                <button 
                  onClick={() => {
                    setShowMemos(!showMemos);
                    if (!showMemos && memos.length === 0) {
                      loadMemos();
                    }
                  }}
                  className="toggle-memos-button"
                >
                  {showMemos ? "📝 メモを閉じる" : "📝 メモを表示"}
                </button>
              </div>

              {showMemos && (
                <div className="memos-content">
                  <div className="memos-stats">
                    <div className="stat-card">
                      <h3>総メモ数</h3>
                      <p className="stat-value">{memos.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>カテゴリ数</h3>
                      <p className="stat-value">{getMemoCategories().length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>公開メモ</h3>
                      <p className="stat-value">{memos.filter(memo => memo.isPublic).length}</p>
                    </div>
                  </div>

                  <div className="memos-controls">
                    <div className="search-controls">
                      <input
                        type="text"
                        placeholder="メモを検索..."
                        value={memoSearchTerm}
                        onChange={(e) => setMemoSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      <button onClick={handleMemoSearch} className="search-button">
                        検索
                      </button>
                    </div>
                    <div className="category-controls">
                      <select
                        value={selectedMemoCategory}
                        onChange={(e) => handleMemoCategoryChange(e.target.value)}
                        className="category-select"
                      >
                        <option value="all">すべてのカテゴリ</option>
                        {getMemoCategories().map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => setShowGenreManager(!showGenreManager)}
                      className="genre-manager-button"
                    >
                      🏷️ ジャンル管理
                    </button>
                    <button 
                      onClick={() => {
                        setEditingMemo(null);
                        setShowMemoForm(!showMemoForm);
                        if (!showMemoForm) {
                          setMemoTitle("");
                          setMemoContent("");
                          setMemoCategory("");
                          setMemoTags("");
                          setMemoIsPublic(false);
                        }
                      }}
                      className="add-memo-button"
                    >
                      {showMemoForm ? "キャンセル" : "メモを追加"}
                    </button>
                  </div>

                  {showMemoForm && (
                    <form onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo} className="memo-form">
                      <h3>{editingMemo ? "メモを編集" : "メモを追加"}</h3>
                      <div className="form-group">
                        <label htmlFor="memoTitle">タイトル *</label>
                        <input
                          type="text"
                          id="memoTitle"
                          value={memoTitle}
                          onChange={(e) => setMemoTitle(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="memoCategory">カテゴリ *</label>
                        <select
                          id="memoCategory"
                          value={memoCategory}
                          onChange={(e) => setMemoCategory(e.target.value)}
                          required
                          disabled={loading}
                        >
                          <option value="">選択してください</option>
                          {getAllGenres().map(genre => (
                            <option key={genre} value={genre}>{genre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="memoContent">内容 *</label>
                        <textarea
                          id="memoContent"
                          value={memoContent}
                          onChange={(e) => setMemoContent(e.target.value)}
                          required
                          disabled={loading}
                          rows={6}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="memoTags">タグ（カンマ区切り）</label>
                        <input
                          type="text"
                          id="memoTags"
                          value={memoTags}
                          onChange={(e) => setMemoTags(e.target.value)}
                          disabled={loading}
                          placeholder="例: 重要, 会議, プロジェクト"
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={memoIsPublic}
                            onChange={(e) => setMemoIsPublic(e.target.checked)}
                            disabled={loading}
                          />
                          公開メモにする
                        </label>
                      </div>
                      <button type="submit" disabled={loading} className="submit-button">
                        {loading ? "処理中..." : (editingMemo ? "更新" : "追加")}
                      </button>
                    </form>
                  )}

                  <div className="memos-list">
                    {memos.length === 0 ? (
                      <p className="no-memos">メモが登録されていません</p>
                    ) : (
                      memos.map((memo) => (
                        <div key={memo.id} className="memo-item">
                          <div className="memo-header">
                            <h3>{memo.title}</h3>
                            <div className="memo-meta">
                              <span className="memo-category">{memo.category}</span>
                              {memo.isPublic && <span className="public-badge">公開</span>}
                            </div>
                          </div>
                          <div className="memo-content">
                            <p>{memo.content}</p>
                          </div>
                          {memo.tags && memo.tags.length > 0 && (
                            <div className="memo-tags">
                              {memo.tags.map((tag, index) => (
                                <span key={index} className="tag">{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="memo-footer">
                            <span className="memo-date">
                              {new Date(memo.updatedAt).toLocaleDateString('ja-JP')}
                            </span>
                            <div className="memo-actions">
                              <button 
                                onClick={() => handleEditMemo(memo)}
                                className="edit-button"
                              >
                                編集
                              </button>
                              <button
                                onClick={() => handleDeleteMemo(memo.id, memo.title)}
                                className="delete-button"
                              >
                                削除
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ジャンル管理モーダル */}
              {showGenreManager && (
                <div className="genre-manager-modal">
                  <div className="genre-manager-content">
                    <div className="genre-manager-header">
                      <h3>ジャンル管理</h3>
                      <button 
                        onClick={() => setShowGenreManager(false)}
                        className="close-button"
                      >
                        ×
                      </button>
                    </div>
                    <div className="genre-manager-body">
                      <div className="add-genre-section">
                        <h4>新しいジャンルを追加</h4>
                        <div className="add-genre-form">
                          <input
                            type="text"
                            value={newGenreName}
                            onChange={(e) => setNewGenreName(e.target.value)}
                            placeholder="ジャンル名を入力"
                            className="genre-input"
                          />
                          <button 
                            onClick={handleAddGenre}
                            className="add-genre-button"
                            disabled={!newGenreName.trim() || customGenres.includes(newGenreName.trim())}
                          >
                            追加
                          </button>
                        </div>
                      </div>
                      
                      <div className="custom-genres-section">
                        <h4>カスタムジャンル一覧</h4>
                        {customGenres.length === 0 ? (
                          <p className="no-genres">カスタムジャンルはありません</p>
                        ) : (
                          <div className="genres-list">
                            {customGenres.map((genre, index) => (
                              <div key={index} className="genre-item">
                                <span className="genre-name">{genre}</span>
                                <button 
                                  onClick={() => handleDeleteGenre(genre)}
                                  className="delete-genre-button"
                                >
                                  削除
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 公開メモセクション */}
            <div className="public-memos-section">
              <div className="section-header">
                <h2>🌐 公開メモ</h2>
                <button 
                  onClick={() => {
                    setShowPublicMemos(!showPublicMemos);
                    if (!showPublicMemos && publicMemos.length === 0) {
                      loadPublicMemos();
                    }
                  }}
                  className="toggle-public-memos-button"
                >
                  {showPublicMemos ? "🌐 公開メモを閉じる" : "🌐 公開メモを表示"}
                </button>
              </div>

              {showPublicMemos && (
                <div className="public-memos-content">
                  <div className="public-memos-stats">
                    <div className="stat-card">
                      <h3>公開メモ数</h3>
                      <p className="stat-value">{publicMemos.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>カテゴリ数</h3>
                      <p className="stat-value">{getPublicMemoCategories().length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>最新更新</h3>
                      <p className="stat-value">
                        {publicMemos.length > 0 
                          ? new Date(Math.max(...publicMemos.map(memo => new Date(memo.updatedAt).getTime()))).toLocaleDateString('ja-JP')
                          : '-'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="public-memos-controls">
                    <div className="search-controls">
                      <input
                        type="text"
                        placeholder="公開メモを検索..."
                        value={publicMemoSearchTerm}
                        onChange={(e) => setPublicMemoSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      <button onClick={handlePublicMemoSearch} className="search-button">
                        検索
                      </button>
                    </div>
                    <div className="category-controls">
                      <select
                        value={selectedPublicMemoCategory}
                        onChange={(e) => handlePublicMemoCategoryChange(e.target.value)}
                        className="category-select"
                      >
                        <option value="all">すべてのカテゴリ</option>
                        {getPublicMemoCategories().map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="public-memos-list">
                    {publicMemos.length === 0 ? (
                      <p className="no-public-memos">公開メモがありません</p>
                    ) : (
                      publicMemos.map((memo) => (
                        <div key={memo.id} className="public-memo-item">
                          <div className="memo-header">
                            <h3>{memo.title}</h3>
                            <div className="memo-meta">
                              <span className="memo-category">{memo.category}</span>
                              <span className="public-badge">公開</span>
                            </div>
                          </div>
                          <div className="memo-content">
                            <p>{memo.content}</p>
                          </div>
                          {memo.tags && memo.tags.length > 0 && (
                            <div className="memo-tags">
                              {memo.tags.map((tag, index) => (
                                <span key={index} className="tag">{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="memo-footer">
                            <span className="memo-date">
                              {new Date(memo.updatedAt).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                          
                          {/* 返信表示 */}
                          {memo.replies && memo.replies.length > 0 && (
                            <div className="replies-section">
                              <h5>💬 返信 ({memo.replies.length})</h5>
                              {memo.replies.map((reply) => (
                                <div key={reply.id} className="reply-item">
                                  <div className="reply-content">{reply.content}</div>
                                  <div className="reply-meta">
                                    <span className="reply-author">👤 {reply.authorName}</span>
                                    <span className="reply-date">
                                      {new Date(reply.createdAt).toLocaleDateString('ja-JP')}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* 返信フォーム */}
                          <div className="reply-form-section">
                            <button 
                              onClick={() => setReplyingToMemo(replyingToMemo === memo.id ? null : memo.id)}
                              className="reply-button"
                            >
                              💬 返信する
                            </button>
                            
                            {replyingToMemo === memo.id && (
                              <div className="reply-form">
                                <h5>💬 返信を投稿</h5>
                                <div className="reply-author-info">
                                  <p>👤 投稿者: {user?.displayName || user?.email}</p>
                                </div>
                                <div className="form-group">
                                  <label htmlFor="replyContent">返信内容 *</label>
                                  <textarea
                                    id="replyContent"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="返信内容を入力してください"
                                    rows={3}
                                    required
                                  />
                                </div>
                                <div className="reply-form-actions">
                                  <button 
                                    onClick={() => handleReplySubmit(memo.id)}
                                    className="submit-reply-button"
                                    disabled={!replyContent.trim()}
                                  >
                                    📤 返信を投稿
                                  </button>
                                  <button 
                                    onClick={handleReplyCancel}
                                    className="cancel-reply-button"
                                  >
                                    ❌ キャンセル
                                  </button>
                                </div>
                              </div>
                            )}
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
        
        {/* テーマ設定モーダル */}
        {showThemeSettings && (
          <div className="theme-settings-modal">
            <div className="theme-settings-content">
              <div className="theme-settings-header">
                <h3>🎨 テーマ設定</h3>
                <button 
                  onClick={() => setShowThemeSettings(false)}
                  className="close-button"
                >
                  ×
                </button>
              </div>
              <div className="theme-settings-body">
                <div className="theme-preview">
                  <p>現在のテーマ: {availableThemes.find(t => t.value === selectedTheme)?.preview} {availableThemes.find(t => t.value === selectedTheme)?.label}</p>
                </div>
                <div className="theme-options">
                  {availableThemes.map((theme) => (
                    <label key={theme.value} className="theme-option">
                      <input
                        type="radio"
                        name="theme"
                        value={theme.value}
                        checked={selectedTheme === theme.value}
                        onChange={(e) => handleThemeChange(e.target.value)}
                      />
                      <span className="theme-preview-icon">{theme.preview}</span>
                      <span className="theme-label">{theme.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フォント設定モーダル */}
        {showFontSettings && (
          <div className="font-settings-modal">
            <div className="font-settings-content">
              <div className="font-settings-header">
                <h3>フォント設定</h3>
                <button 
                  onClick={() => setShowFontSettings(false)}
                  className="close-button"
                >
                  ×
                </button>
              </div>
              <div className="font-settings-body">
                <div className="font-preview">
                  <p style={{ fontFamily: selectedFont === "system" ? "" : selectedFont }}>
                    このテキストでフォントをプレビューできます
                  </p>
                </div>
                <div className="font-options">
                  {availableFonts.map((font) => (
                    <label key={font.value} className="font-option">
                      <input
                        type="radio"
                        name="font"
                        value={font.value}
                        checked={selectedFont === font.value}
                        onChange={(e) => handleFontChange(e.target.value)}
                      />
                      <span style={{ fontFamily: font.value === "system" ? "" : font.value }}>
                        {font.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
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