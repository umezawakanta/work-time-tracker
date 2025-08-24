import { useState, useEffect, useCallback } from 'react';
import ComprehensiveBadgeSyncService, {
  PageSpecificBadgeData,
  CrossPageBadgeMetrics,
} from '@/services/integration/ComprehensiveBadgeSyncService';

export interface UseComprehensiveBadgeSyncResult {
  pageData: PageSpecificBadgeData | null;
  globalMetrics: CrossPageBadgeMetrics | null;
  isLoading: boolean;
  error: string | null;
  recordActivity: (activityType: string, metadata?: Record<string, any>) => Promise<void>;
  refreshData: () => void;
  syncStatus: {
    isConnected: boolean;
    lastSync: string;
    pendingUpdates: number;
  };
}

/**
 * 🔄 包括的バッジ同期フック
 * 各ページでバッジシステムとの同期機能を提供
 */
export const useComprehensiveBadgeSync = (pageName: string): UseComprehensiveBadgeSyncResult => {
  const [pageData, setPageData] = useState<PageSpecificBadgeData | null>(null);
  const [globalMetrics, setGlobalMetrics] = useState<CrossPageBadgeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState({
    isConnected: false,
    lastSync: '',
    pendingUpdates: 0,
  });

  const syncService = ComprehensiveBadgeSyncService.getInstance();

  /**
   * 📊 データ初期化
   */
  const initializeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ページ専用データ取得
      const pageSpecificData = syncService.getPageSpecificData(pageName);
      setPageData(pageSpecificData);

      // グローバルメトリクス取得
      const metrics = syncService.getGlobalMetrics();
      setGlobalMetrics(metrics);

      // 同期状況更新
      setSyncStatus({
        isConnected: true,
        lastSync: new Date().toISOString(),
        pendingUpdates: 0,
      });

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データ取得エラー');
      setIsLoading(false);
    }
  }, [pageName, syncService]);

  /**
   * 📝 アクティビティ記録
   */
  const recordActivity = useCallback(
    async (activityType: string, metadata: Record<string, any> = {}) => {
      try {
        await syncService.recordPageActivity(pageName, activityType, metadata);

        // データ更新
        const updatedPageData = syncService.getPageSpecificData(pageName);
        setPageData(updatedPageData);

        const updatedMetrics = syncService.getGlobalMetrics();
        setGlobalMetrics(updatedMetrics);

        // 同期状況更新
        setSyncStatus((prev) => ({
          ...prev,
          lastSync: new Date().toISOString(),
        }));
      } catch (err) {
        console.error('Activity recording error:', err);
        setError(err instanceof Error ? err.message : 'アクティビティ記録エラー');
      }
    },
    [pageName, syncService]
  );

  /**
   * 🔄 データ再取得
   */
  const refreshData = useCallback(() => {
    initializeData();
  }, [initializeData]);

  /**
   * 🎯 データ変更リスナー設定
   */
  useEffect(() => {
    const handleDataUpdate = (updatedData: PageSpecificBadgeData) => {
      setPageData(updatedData);
      setSyncStatus((prev) => ({
        ...prev,
        lastSync: new Date().toISOString(),
      }));
    };

    // リスナー登録
    syncService.registerPageListener(pageName, handleDataUpdate);

    // 初期データ読み込み
    initializeData();

    // クリーンアップは不要（サービス側で管理）
  }, [pageName, syncService, initializeData]);

  /**
   * 📊 定期的なメトリクス更新
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedMetrics = syncService.getGlobalMetrics();
      if (updatedMetrics) {
        setGlobalMetrics(updatedMetrics);
      }
    }, 10000); // 10秒ごとに更新

    return () => clearInterval(interval);
  }, [syncService]);

  return {
    pageData,
    globalMetrics,
    isLoading,
    error,
    recordActivity,
    refreshData,
    syncStatus,
  };
};

/**
 * 🏠 ホームページ専用フック
 */
export const useHomeBadgeSync = () => {
  const result = useComprehensiveBadgeSync('home');

  useEffect(() => {
    // ホームページ訪問を記録
    result.recordActivity('home_visit', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }, []);

  return result;
};

/**
 * 📊 ダッシュボード専用フック
 */
export const useDashboardBadgeSync = () => {
  const result = useComprehensiveBadgeSync('integrated-dashboard');

  const recordMetricView = useCallback(
    (metricName: string, value: number) => {
      result.recordActivity('metric_view', {
        metricName,
        value,
        timestamp: new Date().toISOString(),
      });
    },
    [result]
  );

  const recordDashboardInteraction = useCallback(
    (interactionType: string, componentName: string) => {
      result.recordActivity('dashboard_interaction', {
        interactionType,
        componentName,
        timestamp: new Date().toISOString(),
      });
    },
    [result]
  );

  return {
    ...result,
    recordMetricView,
    recordDashboardInteraction,
  };
};

/**
 * ✅ TODO管理専用フック
 */
export const useTodoBadgeSync = () => {
  const result = useComprehensiveBadgeSync('todos');

  const recordTaskCompletion = useCallback(
    (taskId: string, priority: string, category: string) => {
      result.recordActivity('task_completion', {
        taskId,
        priority,
        category,
        timestamp: new Date().toISOString(),
      });
    },
    [result]
  );

  const recordProductivityAction = useCallback(
    (actionType: string, details: Record<string, any>) => {
      result.recordActivity('productivity_action', {
        actionType,
        ...details,
        timestamp: new Date().toISOString(),
      });
    },
    [result]
  );

  return {
    ...result,
    recordTaskCompletion,
    recordProductivityAction,
  };
};

/**
 * 🏆 バッジ関連ページ専用フック
 */
export const useBadgePageSync = (pageType: 'dashboard' | 'showcase' | 'prediction') => {
  const pageNameMap = {
    dashboard: 'development-badge-dashboard',
    showcase: 'badge-showcase',
    prediction: 'badge-completion-prediction',
  };

  const result = useComprehensiveBadgeSync(pageNameMap[pageType]);

  const recordBadgeInteraction = useCallback(
    (interactionType: string, badgeId?: string, category?: string) => {
      result.recordActivity('badge_interaction', {
        interactionType,
        badgeId,
        category,
        timestamp: new Date().toISOString(),
      });
    },
    [result]
  );

  return {
    ...result,
    recordBadgeInteraction,
  };
};

/**
 * 🎮 ゲーミフィケーション専用フック
 */
export const useGamificationBadgeSync = () => {
  const result = useComprehensiveBadgeSync('gamification');

  const recordGamificationAction = useCallback(
    (actionType: string, points: number, level?: string) => {
      result.recordActivity('gamification_action', {
        actionType,
        points,
        level,
        timestamp: new Date().toISOString(),
      });
    },
    [result]
  );

  return {
    ...result,
    recordGamificationAction,
  };
};

export default useComprehensiveBadgeSync;
