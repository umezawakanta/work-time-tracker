/**
 * 🎯 統一データシステム用カスタムフック
 * 全ダッシュボードが統一されたデータにアクセスするためのインターフェース
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import {
  unifiedDataService,
  type DataSyncResult,
  type SystemHealthCheck,
} from '@/services/unified/UnifiedDataService';
import {
  refreshUnifiedData,
  addRecentActivity,
  addNotification,
  type RecentActivity,
  type Notification,
} from '@/store/unifiedDataSlice';
import { toast } from 'react-hot-toast';

export interface UseUnifiedDataOptions {
  autoInitialize?: boolean;
  enableRealtime?: boolean;
  onDataUpdate?: (data: any) => void;
  onError?: (error: string) => void;
  debugMode?: boolean;
}

export interface UseUnifiedDataReturn {
  // データ状態
  systemMetrics: RootState['unifiedData']['systemMetrics'];
  taskMetrics: RootState['unifiedData']['taskMetrics'];
  gamificationMetrics: RootState['unifiedData']['gamificationMetrics'];
  performanceMetrics: RootState['unifiedData']['performanceMetrics'];
  realtimeData: RootState['unifiedData']['realtimeData'];

  // ローディング・エラー状態
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  lastSyncTime: string | null;

  // アクション
  initialize: () => Promise<boolean>;
  refreshData: (force?: boolean) => Promise<DataSyncResult>;
  addActivity: (activity: Omit<RecentActivity, 'userId'>) => void;
  addNotification: (notification: Notification) => void;
  performHealthCheck: () => Promise<SystemHealthCheck>;
  clearCache: () => void;

  // 統計・ヘルパー
  statistics: ReturnType<typeof unifiedDataService.getStatistics>;
  isOnline: boolean;
  hasUnreadNotifications: boolean;
  recentActivitiesCount: number;
  systemHealthStatus: 'excellent' | 'good' | 'warning' | 'critical';
}

/**
 * 🎯 統一データシステム用カスタムフック
 */
export function useUnifiedData(options: UseUnifiedDataOptions = {}): UseUnifiedDataReturn {
  const {
    autoInitialize = true,
    enableRealtime = true,
    onDataUpdate,
    onError,
    debugMode = false,
  } = options;

  // Redux state
  const dispatch = useDispatch<AppDispatch>();
  const unifiedDataState = useSelector((state: RootState) => state.unifiedData);
  const { user, isAuthenticated } = useAuth();

  // Local state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [statistics, setStatistics] = useState(() => unifiedDataService.getStatistics());

  // ユーザーIDの取得
  const userId = useMemo(() => {
    return user?.uid || user?.id || 'anonymous_user';
  }, [user]);

  /**
   * 🚀 システムの初期化
   */
  const initialize = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !userId) {
      console.warn('User not authenticated or userId not available');
      return false;
    }

    try {
      const success = await unifiedDataService.initialize(userId);

      if (success) {
        setStatistics(unifiedDataService.getStatistics());

        if (debugMode) {
          console.log('🚀 Unified Data System initialized successfully');
        }

        if (onDataUpdate) {
          onDataUpdate(unifiedDataState);
        }

        toast.success('データシステムを初期化しました');
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize unified data system:', errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      toast.error('システムの初期化に失敗しました');
      return false;
    }
  }, [isAuthenticated, userId, debugMode, onDataUpdate, onError, unifiedDataState]);

  /**
   * 🔄 データの手動更新
   */
  const refreshData = useCallback(
    async (force: boolean = false): Promise<DataSyncResult> => {
      if (!isAuthenticated || !userId) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await unifiedDataService.refreshData(userId, force);
        setStatistics(unifiedDataService.getStatistics());

        if (result.success) {
          if (debugMode) {
            console.log('📊 Data refresh completed:', result);
          }

          if (onDataUpdate) {
            onDataUpdate(unifiedDataState);
          }

          if (!force) {
            toast.success('データを更新しました');
          }
        } else {
          throw new Error(result.errors.join(', '));
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to refresh data:', errorMessage);

        if (onError) {
          onError(errorMessage);
        }

        toast.error('データの更新に失敗しました');
        throw error;
      }
    },
    [isAuthenticated, userId, debugMode, onDataUpdate, onError, unifiedDataState]
  );

  /**
   * 📊 アクティビティの追加
   */
  const addActivity = useCallback(
    (activity: Omit<RecentActivity, 'userId'>) => {
      const fullActivity: RecentActivity = {
        ...activity,
        userId,
      };

      unifiedDataService.addRecentActivity(fullActivity);
      setStatistics(unifiedDataService.getStatistics());

      if (debugMode) {
        console.log('📊 Activity added:', fullActivity);
      }
    },
    [userId, debugMode]
  );

  /**
   * 📬 通知の追加
   */
  const addNotificationHandler = useCallback(
    (notification: Notification) => {
      unifiedDataService.addNotification(notification);
      setStatistics(unifiedDataService.getStatistics());

      if (debugMode) {
        console.log('📬 Notification added:', notification);
      }
    },
    [debugMode]
  );

  /**
   * 🏥 ヘルスチェックの実行
   */
  const performHealthCheck = useCallback(async (): Promise<SystemHealthCheck> => {
    const healthCheck = await unifiedDataService.performHealthCheck();

    if (debugMode) {
      console.log('🏥 Health check result:', healthCheck);
    }

    return healthCheck;
  }, [debugMode]);

  /**
   * 🧹 キャッシュのクリア
   */
  const clearCache = useCallback(() => {
    unifiedDataService.clearCache();
    setStatistics(unifiedDataService.getStatistics());
    toast.success('キャッシュをクリアしました');

    if (debugMode) {
      console.log('🧹 Cache cleared');
    }
  }, [debugMode]);

  // 計算されたプロパティ
  const hasUnreadNotifications = useMemo(() => {
    return unifiedDataState.realtimeData.notifications.some((n) => !n.read);
  }, [unifiedDataState.realtimeData.notifications]);

  const recentActivitiesCount = useMemo(() => {
    return unifiedDataState.realtimeData.recentActivities.length;
  }, [unifiedDataState.realtimeData.recentActivities]);

  const systemHealthStatus = useMemo(() => {
    return unifiedDataState.systemMetrics.systemHealth;
  }, [unifiedDataState.systemMetrics.systemHealth]);

  // エフェクト: 自動初期化
  useEffect(() => {
    if (
      autoInitialize &&
      isAuthenticated &&
      userId &&
      !unifiedDataService.getStatistics().isInitialized
    ) {
      initialize();
    }
  }, [autoInitialize, isAuthenticated, userId, initialize]);

  // エフェクト: オンライン/オフライン状態の監視
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // エフェクト: 統一データサービスのイベントリスナー
  useEffect(() => {
    const handleDataRefreshed = (result: DataSyncResult) => {
      setStatistics(unifiedDataService.getStatistics());

      if (onDataUpdate) {
        onDataUpdate(unifiedDataState);
      }
    };

    const handleActivityAdded = (activity: RecentActivity) => {
      setStatistics(unifiedDataService.getStatistics());
    };

    const handleNotificationAdded = (notification: Notification) => {
      setStatistics(unifiedDataService.getStatistics());
    };

    const handleCacheCleared = () => {
      setStatistics(unifiedDataService.getStatistics());
    };

    // イベントリスナーの登録
    unifiedDataService.on('dataRefreshed', handleDataRefreshed);
    unifiedDataService.on('activityAdded', handleActivityAdded);
    unifiedDataService.on('notificationAdded', handleNotificationAdded);
    unifiedDataService.on('cacheCleared', handleCacheCleared);

    return () => {
      // イベントリスナーのクリーンアップ
      unifiedDataService.off('dataRefreshed', handleDataRefreshed);
      unifiedDataService.off('activityAdded', handleActivityAdded);
      unifiedDataService.off('notificationAdded', handleNotificationAdded);
      unifiedDataService.off('cacheCleared', handleCacheCleared);
    };
  }, [onDataUpdate, unifiedDataState]);

  // エフェクト: 統計の定期更新
  useEffect(() => {
    const interval = setInterval(() => {
      setStatistics(unifiedDataService.getStatistics());
    }, 5000); // 5秒ごと

    return () => clearInterval(interval);
  }, []);

  return {
    // データ状態
    systemMetrics: unifiedDataState.systemMetrics,
    taskMetrics: unifiedDataState.taskMetrics,
    gamificationMetrics: unifiedDataState.gamificationMetrics,
    performanceMetrics: unifiedDataState.performanceMetrics,
    realtimeData: unifiedDataState.realtimeData,

    // ローディング・エラー状態
    isLoading: unifiedDataState.isLoading,
    isRefreshing: unifiedDataState.isRefreshing,
    error: unifiedDataState.error,
    connectionStatus: unifiedDataState.connectionStatus,
    syncStatus: unifiedDataState.syncStatus,
    lastSyncTime: unifiedDataState.lastSyncTime,

    // アクション
    initialize,
    refreshData,
    addActivity,
    addNotification: addNotificationHandler,
    performHealthCheck,
    clearCache,

    // 統計・ヘルパー
    statistics,
    isOnline,
    hasUnreadNotifications,
    recentActivitiesCount,
    systemHealthStatus,
  };
}

/**
 * 🎯 軽量版：システムメトリクスのみを取得するフック
 */
export function useSystemMetrics() {
  const systemMetrics = useSelector((state: RootState) => state.unifiedData.systemMetrics);
  const connectionStatus = useSelector((state: RootState) => state.unifiedData.connectionStatus);
  const lastSyncTime = useSelector((state: RootState) => state.unifiedData.lastSyncTime);

  return {
    systemMetrics,
    connectionStatus,
    lastSyncTime,
    isHealthy: systemMetrics.systemHealth === 'excellent' || systemMetrics.systemHealth === 'good',
  };
}

/**
 * 🎯 軽量版：タスクメトリクスのみを取得するフック
 */
export function useTaskMetrics() {
  const taskMetrics = useSelector((state: RootState) => state.unifiedData.taskMetrics);
  const isLoading = useSelector((state: RootState) => state.unifiedData.isLoading);

  return {
    taskMetrics,
    isLoading,
    hasActiveTasks: taskMetrics.pendingTasks > 0,
    hasUrgentTasks: taskMetrics.urgentTasks > 0,
    completionPercentage: Math.round(taskMetrics.completionRate),
  };
}

/**
 * 🎯 軽量版：ゲーミフィケーションメトリクスのみを取得するフック
 */
export function useGamificationMetrics() {
  const gamificationMetrics = useSelector(
    (state: RootState) => state.unifiedData.gamificationMetrics
  );
  const recentActivities = useSelector(
    (state: RootState) => state.unifiedData.realtimeData.recentActivities
  );

  const recentAchievements = recentActivities
    .filter((activity) => activity.type === 'badge_earned' || activity.type === 'level_up')
    .slice(0, 5);

  return {
    gamificationMetrics,
    recentAchievements,
    canLevelUp: gamificationMetrics.nextLevelProgress >= 100,
    isExpert: gamificationMetrics.playerLevel >= 10,
  };
}

/**
 * 🎯 軽量版：リアルタイムデータのみを取得するフック
 */
export function useRealtimeData() {
  const realtimeData = useSelector((state: RootState) => state.unifiedData.realtimeData);
  const connectionStatus = useSelector((state: RootState) => state.unifiedData.connectionStatus);

  return {
    realtimeData,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    hasUnreadNotifications: realtimeData.notifications.some((n) => !n.read),
    hasRecentActivity: realtimeData.recentActivities.length > 0,
  };
}
