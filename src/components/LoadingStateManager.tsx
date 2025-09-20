import React, { createContext, useContext, useState, ReactNode } from 'react';

// ローディング状態の型定義
interface LoadingStates {
  // 基本ローディング
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // 各機能のローディング状態
  memosLoading: boolean;
  setMemosLoading: (loading: boolean) => void;
  
  publicMemosLoading: boolean;
  setPublicMemosLoading: (loading: boolean) => void;
  
  projectsLoading: boolean;
  setProjectsLoading: (loading: boolean) => void;
  
  booksLoading: boolean;
  setBooksLoading: (loading: boolean) => void;
  
  workRecordsLoading: boolean;
  setWorkRecordsLoading: (loading: boolean) => void;
  
  incomeExpenseLoading: boolean;
  setIncomeExpenseLoading: (loading: boolean) => void;
  
  diaryLoading: boolean;
  setDiaryLoading: (loading: boolean) => void;
  
  timeEntriesLoading: boolean;
  setTimeEntriesLoading: (loading: boolean) => void;
  
  reportsLoading: boolean;
  setReportsLoading: (loading: boolean) => void;
  
  adminUsersLoading: boolean;
  setAdminUsersLoading: (loading: boolean) => void;
}

// コンテキストの作成
const LoadingContext = createContext<LoadingStates | undefined>(undefined);

// プロバイダーコンポーネント
interface LoadingStateProviderProps {
  children: ReactNode;
}

export const LoadingStateProvider: React.FC<LoadingStateProviderProps> = ({ children }) => {
  // 基本ローディング状態
  const [loading, setLoading] = useState(false);
  
  // 各機能のローディング状態
  const [memosLoading, setMemosLoading] = useState(false);
  const [publicMemosLoading, setPublicMemosLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [workRecordsLoading, setWorkRecordsLoading] = useState(false);
  const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(false);
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [timeEntriesLoading, setTimeEntriesLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);

  const value: LoadingStates = {
    // 基本ローディング
    loading,
    setLoading,
    
    // 各機能のローディング状態
    memosLoading,
    setMemosLoading,
    
    publicMemosLoading,
    setPublicMemosLoading,
    
    projectsLoading,
    setProjectsLoading,
    
    booksLoading,
    setBooksLoading,
    
    workRecordsLoading,
    setWorkRecordsLoading,
    
    incomeExpenseLoading,
    setIncomeExpenseLoading,
    
    diaryLoading,
    setDiaryLoading,
    
    timeEntriesLoading,
    setTimeEntriesLoading,
    
    reportsLoading,
    setReportsLoading,
    
    adminUsersLoading,
    setAdminUsersLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

// カスタムフック
export const useLoadingState = (): LoadingStates => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoadingState must be used within a LoadingStateProvider');
  }
  return context;
};

// ローディング状態のヘルパー関数
export const useLoadingHelpers = () => {
  const loadingState = useLoadingState();
  
  // 複数のローディング状態を同時に設定
  const setMultipleLoading = (states: Partial<Omit<LoadingStates, 'setLoading' | 'setMemosLoading' | 'setPublicMemosLoading' | 'setProjectsLoading' | 'setBooksLoading' | 'setWorkRecordsLoading' | 'setIncomeExpenseLoading' | 'setDiaryLoading' | 'setTimeEntriesLoading' | 'setReportsLoading' | 'setAdminUsersLoading'>>) => {
    Object.entries(states).forEach(([key, value]) => {
      const setterKey = `set${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof LoadingStates;
      const setter = loadingState[setterKey] as (value: boolean) => void;
      if (setter) {
        setter(value as boolean);
      }
    });
  };
  
  // すべてのローディング状態をリセット
  const resetAllLoading = () => {
    setMultipleLoading({
      loading: false,
      memosLoading: false,
      publicMemosLoading: false,
      projectsLoading: false,
      booksLoading: false,
      workRecordsLoading: false,
      incomeExpenseLoading: false,
      diaryLoading: false,
      timeEntriesLoading: false,
      reportsLoading: false,
      adminUsersLoading: false,
    });
  };
  
  // 特定の機能のローディング状態を確認
  const isAnyLoading = () => {
    return Object.values(loadingState).some((value) => 
      typeof value === 'boolean' && value === true
    );
  };
  
  return {
    setMultipleLoading,
    resetAllLoading,
    isAnyLoading,
  };
};

export default LoadingStateProvider;
