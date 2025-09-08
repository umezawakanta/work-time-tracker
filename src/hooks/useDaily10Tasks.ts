import { useState, useEffect, useCallback } from 'react';
import { daily10Api } from '@/services/api/daily10Api';
import {
  DailyTask,
  DailyProgress,
  DailyStats,
  TaskProgress,
  SubtaskProgress,
} from '@/types/daily10';
import { useAuth } from '@/hooks/useAuth';

// タスク配列の正規化関数
function toTaskArray(src: unknown): TaskProgress[] {
  // 1) すでに配列
  if (Array.isArray(src)) {
    return src.filter(
      (task): task is TaskProgress =>
        task &&
        typeof task === 'object' &&
        'taskId' in task &&
        'completed' in task &&
        'subtasks' in task
    );
  }

  // 2) 連想オブジェクト {id: {..}, ...} 形式（Firestoreや正規化Stateでありがち）
  if (src && typeof src === 'object') {
    const obj = src as Record<string, unknown>;
    return Object.values(obj).filter(
      (task): task is TaskProgress =>
        task &&
        typeof task === 'object' &&
        'taskId' in task &&
        'completed' in task &&
        'subtasks' in task
    );
  }

  // 3) JSON文字列で来たケース
  if (typeof src === 'string') {
    try {
      const parsed = JSON.parse(src);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (task): task is TaskProgress =>
            task &&
            typeof task === 'object' &&
            'taskId' in task &&
            'completed' in task &&
            'subtasks' in task
        );
      }
      if (parsed && typeof parsed === 'object') {
        return Object.values(parsed).filter(
          (task): task is TaskProgress =>
            task &&
            typeof task === 'object' &&
            'taskId' in task &&
            'completed' in task &&
            'subtasks' in task
        );
      }
    } catch {
      // JSON解析に失敗した場合は空配列を返す
    }
  }

  // 4) それ以外は空配列
  return [];
}

// サブタスクを取得するヘルパー関数
function getAllSubtasks(progress: DailyProgress | null): SubtaskProgress[] {
  if (!progress || !progress.tasks) return [];
  return progress.tasks.flatMap((task) => task.subtasks || []);
}

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
            tasks: toTaskArray(updatedProgress.tasks),
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
            tasks: toTaskArray(progressData.tasks),
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
          tasks: toTaskArray(progressData.tasks),
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
