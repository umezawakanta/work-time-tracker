import { useState, useEffect, useCallback } from 'react';
import { daily10Api } from '@/services/api/daily10Api';
import { DailyTask, DailyProgress, DailyStats } from '@/types/daily10';
import { useAuth } from '@/hooks/useAuth';

export const useDaily10Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date().toISOString().split('T')[0];

  // 進捗を更新
  const updateProgress = useCallback(
    async (taskId: string, completed: boolean, notes?: string, subtaskId?: string) => {
      if (!user?.id) return;

      try {
        const updatedProgress = await daily10Api.updateProgress(user.id, {
          date: currentDate,
          taskId,
          subtaskId,
          completed,
          notes,
        });
        // データの検証と正規化
        if (updatedProgress && typeof updatedProgress === 'object') {
          const normalizedProgress = {
            ...updatedProgress,
            tasks: Array.isArray(updatedProgress.tasks) ? updatedProgress.tasks : [],
            subtasks: Array.isArray(updatedProgress.subtasks) ? updatedProgress.subtasks : [],
          };
          setProgress(normalizedProgress);
        }
      } catch (err) {
        console.error('Failed to update progress:', err);
        setError('進捗の更新に失敗しました');
      }
    },
    [user?.id, currentDate]
  );

  // 初期化
  useEffect(() => {
    const initialize = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // タスク一覧を取得
        const tasksData = await daily10Api.fetchTasks();
        setTasks(tasksData);

        // 進捗を取得
        const progressData = await daily10Api.fetchProgress(user.id, currentDate);
        // データの検証と正規化
        if (progressData && typeof progressData === 'object') {
          const normalizedProgress = {
            ...progressData,
            tasks: Array.isArray(progressData.tasks) ? progressData.tasks : [],
            subtasks: Array.isArray(progressData.subtasks) ? progressData.subtasks : [],
          };
          setProgress(normalizedProgress);
        } else {
          setProgress(null);
        }

        // 統計データを取得
        const statsData = await daily10Api.fetchStats(user.id);
        setStats(statsData);
      } catch (err: any) {
        console.error('Initialization failed:', err);
        const errorMessage =
          err?.response?.status === 404
            ? 'APIエンドポイントが見つかりません。デプロイを確認してください。'
            : err?.response?.status === 500
              ? 'サーバーエラーが発生しました。しばらく待ってから再試行してください。'
              : err?.message || 'データの読み込みに失敗しました';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [user?.id]); // currentDateを依存配列から削除

  // 進捗を再取得
  const refreshProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      const progressData = await daily10Api.fetchProgress(user.id, currentDate);
      // データの検証と正規化
      if (progressData && typeof progressData === 'object') {
        const normalizedProgress = {
          ...progressData,
          tasks: Array.isArray(progressData.tasks) ? progressData.tasks : [],
          subtasks: Array.isArray(progressData.subtasks) ? progressData.subtasks : [],
        };
        setProgress(normalizedProgress);
      } else {
        setProgress(null);
      }
    } catch (err: any) {
      console.error('Failed to refresh progress:', err);
      setError('進捗の再取得に失敗しました');
    }
  }, [user?.id, currentDate]);

  // 統計を再取得
  const refreshStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const statsData = await daily10Api.fetchStats(user.id);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to refresh stats:', err);
      setError('統計の再取得に失敗しました');
    }
  }, [user?.id]);

  return {
    tasks,
    progress,
    stats,
    isLoading,
    error,
    updateProgress,
    refreshProgress,
    refreshStats,
  };
};
