import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiClient';
import { User, Project, ReportSummary, AdminUser, Book, Memo, IncomeExpenseRecord, WorkDiary } from '../types';

export const useDataFetching = (isLoggedIn: boolean, user: User | null) => {
  // JWTトークンから実際のユーザーIDを取得する関数
  const getActualUserId = () => {
    const token = localStorage.getItem("access_token");
    let actualUserId = user?.id || 'temp-id';
    
    if (token) {
      try {
        console.log('useDataFetching - token:', token.substring(0, 50) + "...");
        const parts = token.split('.');
        console.log('useDataFetching - token parts length:', parts.length);
        if (parts.length === 3) {
          let payload = parts[1];
          console.log('useDataFetching - payload part:', payload);
          
          // JWT uses URL-safe base64, so we need to handle it properly
          // Replace URL-safe characters
          payload = payload.replace(/-/g, '+').replace(/_/g, '/');
          
          // Add padding if necessary
          const pad = payload.length % 4;
          if (pad) {
            if (pad === 1) {
              throw new Error('Invalid token');
            }
            payload += new Array(5 - pad).join('=');
          }
          
          // Now decode
          const decoded = JSON.parse(atob(payload));
          console.log('useDataFetching - Successfully decoded JWT payload:', decoded);
          
          actualUserId = decoded.userId || decoded.user_id || user?.id || 'temp-id';
          console.log('useDataFetching - getActualUserId:', actualUserId);
        }
      } catch (e) {
        console.warn('useDataFetching - Failed to decode token:', e);
        // Fall back to user.id
        actualUserId = user?.id || 'temp-id';
      }
    }
    
    return actualUserId;
  };

  // デバッグログの追加
  useEffect(() => {
    console.log('useDataFetching - Initialized with:', {
      isLoggedIn,
      user: user ? { id: user.id, email: user.email, displayName: user.displayName } : null
    });
  }, [isLoggedIn, user]);

  // 認証されていない場合は認証が必要なAPIを呼び出さない
  useEffect(() => {
    if (!isLoggedIn || !user) {
      console.log('useDataFetching - User not authenticated, skipping authenticated API calls');
      return;
    }
    
    console.log('useDataFetching - User authenticated, loading data...');
    
    // 認証状態が安定するまで少し待機してからAPIリクエストを実行
    const timer = setTimeout(() => {
      console.log('useDataFetching - Starting authenticated API calls after delay');
      // 認証が必要なデータを読み込み
      loadProjects();
      loadReportSummary();
      loadBooks();
      loadMemos();
      loadIncomeExpenseRecords();
      loadWorkDiaries();
    }, 100); // 100msの遅延
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, user]);

  // ローディング状態
  const [publicMemosLoading, setPublicMemosLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [workRecordsLoading, setWorkRecordsLoading] = useState(false);
  const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(false);
  const [diaryLoading, setDiaryLoading] = useState(false);

  // データ状態
  const [projects, setProjects] = useState<Project[]>([]);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [publicMemos, setPublicMemos] = useState<Memo[]>([]);
  const [incomeExpenseRecords, setIncomeExpenseRecords] = useState<IncomeExpenseRecord[]>([]);
  const [workDiaries, setWorkDiaries] = useState<WorkDiary[]>([]);

  // プロジェクト読み込み
  const loadProjects = async () => {
    if (!isLoggedIn || !user) {
      console.log('useDataFetching - loadProjects: Not logged in or no user');
      return;
    }
    
    const actualUserId = getActualUserId();
    console.log('useDataFetching - loadProjects: Starting to load projects for user:', actualUserId);
    setProjectsLoading(true);
    try {
      const response = await apiFetch(`/api/projects/list?userId=${actualUserId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('useDataFetching - loadProjects: Success, projects loaded:', data.projects?.length || 0);
        setProjects(data.projects || []);
      } else {
        console.log('useDataFetching - loadProjects: Failed with status:', response.status);
      }
    } catch (error) {
      console.error('useDataFetching - loadProjects: Error occurred:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  // レポートサマリー読み込み
  const loadReportSummary = async () => {
    if (!isLoggedIn || !user) {
      return;
    }
    
    const actualUserId = getActualUserId();
    try {
      const response = await apiFetch(`/api/reports/summary?userId=${actualUserId}`);
      if (response.ok) {
        const data = await response.json();
        setReportSummary(data);
      }
    } catch (error) {
      console.error('Failed to load report summary:', error);
    }
  };

  // 管理者ユーザー読み込み
  const loadAdminUsers = async () => {
    if (!isLoggedIn || !user) {
      return;
    }
    
    const actualUserId = getActualUserId();
    try {
      const response = await apiFetch(`/api/admin/users?userId=${actualUserId}`);
      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load admin users:', error);
    }
  };

  // 本読み込み
  const loadBooks = async () => {
    if (!isLoggedIn || !user) {
      return;
    }
    
    const actualUserId = getActualUserId();
    setBooksLoading(true);
    try {
      const response = await apiFetch(`/api/books?userId=${actualUserId}`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setBooksLoading(false);
    }
  };

  // メモ読み込み
  const loadMemos = async () => {
    if (!isLoggedIn || !user) {
      console.log('useDataFetching - loadMemos: User not authenticated');
      return;
    }
    
    const actualUserId = getActualUserId();
    console.log('useDataFetching - loadMemos: Starting to load memos for user:', actualUserId);
    try {
      const response = await apiFetch(`/api/memos?userId=${actualUserId}`);
      console.log('useDataFetching - loadMemos: API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('useDataFetching - loadMemos: Received data:', data);
        setMemos(data.memos || []);
        console.log('useDataFetching - loadMemos: Set memos to:', data.memos || []);
      } else {
        console.error('useDataFetching - loadMemos: API response not ok:', response.status);
      }
    } catch (error) {
      console.error('useDataFetching - loadMemos: Failed to load memos:', error);
    }
  };

  // 公開メモ読み込み
  const loadPublicMemos = async () => {
    setPublicMemosLoading(true);
    try {
      const response = await apiFetch('/api/memos/public');
      if (response.ok) {
        const responseText = await response.text();
        console.log('Public memos response:', responseText);
        try {
          const data = JSON.parse(responseText);
          setPublicMemos(data.memos || []);
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          console.error('Response text:', responseText);
          setPublicMemos([]);
        }
      }
    } catch (error) {
      console.error('Failed to load public memos:', error);
    } finally {
      setPublicMemosLoading(false);
    }
  };

  // 収支記録読み込み
  const loadIncomeExpenseRecords = async () => {
    if (!isLoggedIn || !user) {
      return;
    }
    
    const actualUserId = getActualUserId();
    setIncomeExpenseLoading(true);
    try {
      const response = await apiFetch(`/api/work-records/salary?userId=${actualUserId}`);
      if (response.ok) {
        const data = await response.json();
        setIncomeExpenseRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to load income/expense records:', error);
    } finally {
      setIncomeExpenseLoading(false);
    }
  };

  // 日記読み込み
  const loadWorkDiaries = async () => {
    if (!isLoggedIn || !user) {
      return;
    }
    
    const actualUserId = getActualUserId();
    setDiaryLoading(true);
    try {
      const response = await apiFetch(`/api/work-records/diary?userId=${actualUserId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkDiaries(data.diaries || []);
      }
    } catch (error) {
      console.error('Failed to load work diaries:', error);
    } finally {
      setDiaryLoading(false);
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    if (isLoggedIn && user) {
      loadProjects();
      loadReportSummary();
      loadAdminUsers();
      loadBooks();
      loadMemos();
      loadIncomeExpenseRecords();
      loadWorkDiaries();
    }
    loadPublicMemos();
  }, [isLoggedIn, user]);

  return {
    // ローディング状態
    publicMemosLoading,
    projectsLoading,
    booksLoading,
    workRecordsLoading,
    incomeExpenseLoading,
    diaryLoading,
    
    // データ
    projects,
    setProjects,
    reportSummary,
    setReportSummary,
    adminUsers,
    setAdminUsers,
    books,
    setBooks,
    memos,
    setMemos,
    publicMemos,
    setPublicMemos,
    incomeExpenseRecords,
    setIncomeExpenseRecords,
    workDiaries,
    setWorkDiaries,
    
    // 関数
    loadProjects,
    loadReportSummary,
    loadAdminUsers,
    loadBooks,
    loadMemos,
    loadPublicMemos,
    loadIncomeExpenseRecords,
    loadWorkDiaries,
  };
};
