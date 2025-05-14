import { useState, useEffect, useCallback } from 'react';
import { 
  fetchTaskStatistics as fetchTodoStats
} from '@/services/todoStatsService';
import { 
  exportTasks,
  ExportFormat,
  importTasksAndSend as importTasks,
} from '@/services/todoExportService';
import { TodoStats } from '@/types/TodoStats';

/**
 * AdvancedOptionsコンポーネントで使用するカスタムフック
 * 状態管理と関連機能をまとめて提供します
 */
export function useAdvancedOptions() {
  // 状態管理
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState<boolean>(true);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [recentActions, setRecentActions] = useState<Array<{ action: string; timestamp: number }>>([]);
  const [statistics, setStatistics] = useState<TodoStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 統計データの読み込み
  const loadStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTodoStats();
      setStatistics(data);
      setError(null);
    } catch (err) {
      setError('統計データの読み込みに失敗しました');
      console.error('統計データの読み込みエラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 最近のアクションをローカルストレージから読み込み
  const loadRecentActions = useCallback(() => {
    try {
      const storedActions = localStorage.getItem('recentTodoActions');
      if (storedActions) {
        setRecentActions(JSON.parse(storedActions));
      }
    } catch (err) {
      console.error('アクション履歴の読み込みエラー:', err);
    }
  }, []);
  
  // 設定をローカルストレージから読み込み
  const loadSettings = useCallback(() => {
    try {
      const autoAdjust = localStorage.getItem('todoAutoAdjust');
      if (autoAdjust !== null) {
        setAutoAdjustEnabled(autoAdjust === 'true');
      }
    } catch (err) {
      console.error('設定の読み込みエラー:', err);
    }
  }, []);
  
  // 最初のデータ読み込み
  useEffect(() => {
    loadStatistics();
    loadRecentActions();
    loadSettings();
  }, [loadStatistics, loadRecentActions, loadSettings]); // 依存配列を追加
  
  // アクション履歴に追加
  const addToRecentActions = useCallback((action: string) => {
    const newAction = {
      action,
      timestamp: Date.now()
    };
    
    setRecentActions(prev => {
      const updated = [newAction, ...prev].slice(0, 10);
      
      // ローカルストレージに保存
      try {
        localStorage.setItem('recentTodoActions', JSON.stringify(updated));
      } catch (error) {
        console.error('アクション履歴の保存に失敗しました', error);
      }
      
      return updated;
    });
  }, []);
  
  // 自動調整設定の切り替え
  const toggleAutoAdjust = useCallback((enabled: boolean) => {
    setAutoAdjustEnabled(enabled);
    
    // 設定をローカルストレージに保存
    try {
      localStorage.setItem('todoAutoAdjust', String(enabled));
    } catch (error) {
      console.error('設定の保存に失敗しました', error);
    }
    
    addToRecentActions(`自動調整を${enabled ? 'オン' : 'オフ'}に設定`);
  }, [addToRecentActions]);
  
  // 優先度調整実行
  const handleAdjustPriorities = useCallback(() => {
    // ここでAPIを呼び出して優先度調整を実行
    // モック実装
    setTimeout(() => {
      addToRecentActions('優先度を手動調整しました');
    }, 500);
    
    return true; // 成功を示す
  }, [addToRecentActions]);
  
  // タスクエクスポート
  const handleExport = useCallback(async (format: ExportFormat = 'csv') => {
    try {
      setIsLoading(true);
      const blob = await exportTasks(format);
      
      // ダウンロードファイル名を生成
      const date = new Date().toISOString().split('T')[0];
      const fileName = `tasks-${date}.${format}`;
      
      // ブラウザでダウンロードを開始
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // リソースの解放
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addToRecentActions(`タスクを${format.toUpperCase()}形式でエクスポート`);
      setError(null);
      return true;
    } catch (err) {
      setError('エクスポートに失敗しました');
      console.error('エクスポートエラー:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [addToRecentActions]);
  
  // タスクインポート
  const handleImport = useCallback(async (file: File, format: string) => {
    if (!file) return false;
    
    try {
      setIsLoading(true);
      const success = await importTasks(file, format);
      
      if (success) {
        // importTasksAndSendはbooleanを返すので、エラー対象のresult.countとresult.successは使用しない
        addToRecentActions(`タスクをインポートしました (${file.name})`);
        // 統計を再読み込み
        loadStatistics();
        setError(null);
        return true;
      } else {
        setError('インポートに失敗しました');
        return false;
      }
    } catch (err) {
      setError('インポートに失敗しました');
      console.error('インポートエラー:', err);
      return false;
    } finally {
      setIsLoading(false);
      setImportFile(null); // インポート後はファイル選択をクリア
    }
  }, [addToRecentActions, loadStatistics]);
  
  // 経過時間を計算する関数
  const getElapsedTime = useCallback((timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}秒前`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分前`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}時間前`;
    return `${Math.floor(seconds / 86400)}日前`;
  }, []);
  
  // フック戻り値
  return {
    // 状態
    autoAdjustEnabled,
    importFile,
    recentActions,
    statistics,
    isLoading,
    error,
    
    // アクション
    setAutoAdjustEnabled: toggleAutoAdjust,
    setImportFile,
    addToRecentActions,
    handleAdjustPriorities,
    handleExport,
    handleImport,
    getElapsedTime,
    refreshStatistics: loadStatistics
  };
}