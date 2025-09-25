import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiClient';
import { User, Project, ReportSummary, AdminUser, Book, Memo, IncomeExpenseRecord, WorkDiary } from '../types';

export const useDataFetching = (isLoggedIn: boolean, user: User | null) => {
  // デバッグログの追加
  useEffect(() => {
    console.log('useDataFetching - Initialized with:', {
      isLoggedIn,
      user: user ? { id: user.id, email: user.email, displayName: user.displayName } : null
    });
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
    
    console.log('useDataFetching - loadProjects: Starting to load projects for user:', user.id);
    setProjectsLoading(true);
    try {
      const response = await apiFetch(`/api/projects/list?userId=${user.id}`);
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
    
    try {
      const response = await apiFetch(`/api/reports/summary?userId=${user.id}`);
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
    
    try {
      const response = await apiFetch(`/api/admin/users?userId=${user.id}`);
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
    
    setBooksLoading(true);
    try {
      const response = await apiFetch(`/api/books?userId=${user.id}`);
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
      return;
    }
    
    try {
      const response = await apiFetch(`/api/memos?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setMemos(data.memos || []);
      }
    } catch (error) {
      console.error('Failed to load memos:', error);
    }
  };

  // 公開メモ読み込み
  const loadPublicMemos = async () => {
    setPublicMemosLoading(true);
    try {
      const response = await apiFetch('/api/memos/public');
      if (response.ok) {
        const data = await response.json();
        setPublicMemos(data.memos || []);
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
    
    setIncomeExpenseLoading(true);
    try {
      const response = await apiFetch(`/api/work-records/salary?userId=${user.id}`);
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
    
    setDiaryLoading(true);
    try {
      const response = await apiFetch(`/api/work-records/diary?userId=${user.id}`);
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
