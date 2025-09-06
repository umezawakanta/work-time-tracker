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

  // タスク一覧を取得
  const fetchTasks = useCallback(async () => {
    try {
      const tasksData = await daily10Api.fetchTasks();
      setTasks(tasksData);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('タスクの取得に失敗しました');
    }
  }, []);

  // 進捗を取得
  const fetchProgress = useCallback(
    async (date: string) => {
      if (!user?.id) return;

      try {
        const progressData = await daily10Api.fetchProgress(user.id, date);
        setProgress(progressData);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
        setError('進捗の取得に失敗しました');
      }
    },
    [user?.id]
  );

  // 統計データを取得
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const statsData = await daily10Api.fetchStats(user.id);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('統計データの取得に失敗しました');
    }
  }, [user?.id]);

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
        setProgress(updatedProgress);
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
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([fetchTasks(), fetchProgress(currentDate), fetchStats()]);
      } catch (err) {
        console.error('Initialization failed:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [fetchTasks, fetchProgress, fetchStats, currentDate]);

  return {
    tasks,
    progress,
    stats,
    isLoading,
    error,
    updateProgress,
    refreshProgress: () => fetchProgress(currentDate),
    refreshStats: fetchStats,
  };
};
