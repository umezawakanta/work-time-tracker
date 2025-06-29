import { TodoStats } from '../types/todo';

/**
 * タスクデータをエクスポートする関数
 * @param format エクスポート形式（'csv', 'json', 'ical'）
 * @returns エクスポート処理の結果をPromiseで返す
 */
export const exportTasks = async (
  format: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // APIエンドポイントの構築
    const endpoint = `/api/tasks/export?format=${format}`;

    // APIリクエスト
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'エクスポート処理に失敗しました');
    }

    // レスポンスの形式によって処理を分岐
    if (format === 'csv' || format === 'json' || format === 'ical') {
      // ファイルとしてダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // ファイル名の設定
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `tasks.${format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // ダウンロードリンクの作成とクリック
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // クリーンアップ
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, url };
    } else {
      throw new Error('サポートされていない形式です');
    }
  } catch (error) {
    console.error('エクスポートエラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    };
  }
};

/**
 * タスクデータをインポートする関数
 * @param file インポートするファイル
 * @param format ファイル形式（'csv', 'json', 'ical'）
 * @returns インポート処理の結果をPromiseで返す
 */
export const importTasks = async (
  file: File,
  format: string
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    // FormDataの作成
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    // APIリクエスト
    const response = await fetch('/api/tasks/import', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'インポート処理に失敗しました');
    }

    const result = await response.json();
    return {
      success: true,
      count: result.importedCount,
    };
  } catch (error) {
    console.error('インポートエラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    };
  }
};

/**
 * タスク統計データを取得する関数
 * @param period 期間（'day', 'week', 'month', 'all'）
 * @returns 統計データをPromiseで返す
 */
export const fetchTaskStatistics = async (period: string = 'all'): Promise<TodoStats> => {
  try {
    // APIエンドポイントの構築
    const endpoint = `/api/tasks/statistics?period=${period}`;

    // APIリクエスト
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('統計データの取得に失敗しました');
    }

    const data = await response.json();
    return data as TodoStats;
  } catch (error) {
    console.error('統計データ取得エラー:', error);

    // エラー時はデフォルトの統計データを返す
    return {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      averageCompletionTime: 0,
      inputTasks: 0,
      outputTasks: 0,
      inputOutputRatio: 1,
      tasksCompletedBeforeDeadline: 0,
      tasksCompletedAfterDeadline: 0,
      deadlineMeetRate: 0,
      streakDays: 0,
      longestStreak: 0,
    };
  }
};

/**
 * 優先度の自動調整を実行する関数
 * @returns 調整処理の結果をPromiseで返す
 */
export const adjustTaskPriorities = async (): Promise<{
  success: boolean;
  adjustedCount: number;
  error?: string;
}> => {
  try {
    // APIリクエスト
    const response = await fetch('/api/tasks/adjust-priorities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '優先度調整に失敗しました');
    }

    const result = await response.json();
    return {
      success: true,
      adjustedCount: result.adjustedCount,
    };
  } catch (error) {
    console.error('優先度調整エラー:', error);
    return {
      success: false,
      adjustedCount: 0,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    };
  }
};

/**
 * プレミアム機能の利用可能状態を確認する関数
 * @returns ユーザーのプレミアムステータス
 */
export const checkPremiumStatus = async (): Promise<{
  isPremium: boolean;
  features: string[];
  expiresAt?: string;
}> => {
  try {
    // APIリクエスト
    const response = await fetch('/api/user/premium-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('プレミアムステータスの取得に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('プレミアムステータスエラー:', error);
    // エラー時はデフォルト値を返す
    return {
      isPremium: false,
      features: [],
    };
  }
};
