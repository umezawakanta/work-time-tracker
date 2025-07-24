/**
 * 🚀 統一データサービス
 * 全ダッシュボードとコンポーネントが使用する中央集権的なデータ管理システム
 */

import { EventEmitter } from 'events';
import { store } from '@/store';
import {
  initializeUnifiedSystem,
  refreshUnifiedData,
  addRecentActivity,
  addSystemEvent,
  addNotification,
  updateSystemHealth,
  updateConnectionStatus,
  setCacheData,
  clearCache,
  type UnifiedTaskMetrics,
  type UnifiedGamificationMetrics,
  type UnifiedPerformanceMetrics,
  type RecentActivity,
  type SystemEvent,
  type Notification,
} from '@/store/unifiedDataSlice';

export interface UnifiedDataServiceConfig {
  refreshInterval: number;
  enableRealtime: boolean;
  enableCaching: boolean;
  maxCacheSize: number;
  debugMode: boolean;
}

export interface DataSyncResult {
  success: boolean;
  timestamp: string;
  duration: number;
  errors: string[];
  updatedMetrics: string[];
}

export interface SystemHealthCheck {
  status: 'healthy' | 'degraded' | 'critical';
  issues: string[];
  recommendations: string[];
  score: number;
}

class UnifiedDataService extends EventEmitter {
  private static instance: UnifiedDataService;
  private config: UnifiedDataServiceConfig;
  private refreshInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;
  private lastHealthCheck: number = 0;
  private syncInProgress: boolean = false;

  private constructor(config?: Partial<UnifiedDataServiceConfig>) {
    super();
    this.config = {
      refreshInterval: 30000, // 30秒
      enableRealtime: true,
      enableCaching: true,
      maxCacheSize: 100,
      debugMode: process.env.NODE_ENV === 'development',
      ...config,
    };

    this.setupEventListeners();
  }

  /**
   * 🎯 シングルトンインスタンスの取得
   */
  public static getInstance(config?: Partial<UnifiedDataServiceConfig>): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService(config);
    }
    return UnifiedDataService.instance;
  }

  /**
   * 🚀 統一データシステムの初期化
   */
  public async initialize(userId: string): Promise<boolean> {
    try {
      if (this.isInitialized) {
        console.log('⚠️ Unified Data Service already initialized');
        return true;
      }

      console.log('🚀 Initializing Unified Data Service for user:', userId);

      // Redux storeの初期化
      await store.dispatch(initializeUnifiedSystem(userId));

      // ヘルスチェックの実行
      const healthCheck = await this.performHealthCheck();
      store.dispatch(
        updateSystemHealth(
          healthCheck.status === 'healthy'
            ? 'excellent'
            : healthCheck.status === 'degraded'
              ? 'warning'
              : 'critical'
        )
      );

      // リアルタイム同期の開始
      if (this.config.enableRealtime) {
        this.startRealtimeSync(userId);
      }

      // システムイベントの記録
      this.addSystemEvent({
        id: `init_${Date.now()}`,
        type: 'success',
        message: 'Unified Data Service initialized successfully',
        timestamp: new Date().toISOString(),
        component: 'UnifiedDataService',
      });

      this.isInitialized = true;
      this.emit('initialized', { userId, timestamp: new Date().toISOString() });

      console.log('✅ Unified Data Service initialization completed');
      return true;
    } catch (error) {
      console.error('❌ Unified Data Service initialization failed:', error);

      this.addSystemEvent({
        id: `init_error_${Date.now()}`,
        type: 'error',
        message: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        component: 'UnifiedDataService',
      });

      return false;
    }
  }

  /**
   * 🔄 データの手動更新
   */
  public async refreshData(userId: string, force: boolean = false): Promise<DataSyncResult> {
    const startTime = Date.now();
    const result: DataSyncResult = {
      success: false,
      timestamp: new Date().toISOString(),
      duration: 0,
      errors: [],
      updatedMetrics: [],
    };

    try {
      if (this.syncInProgress && !force) {
        throw new Error('Sync already in progress');
      }

      this.syncInProgress = true;
      store.dispatch(updateConnectionStatus('reconnecting'));

      // データの更新
      await store.dispatch(refreshUnifiedData(userId));

      // 追加のメトリクス更新
      await this.updateTaskMetrics(userId);
      await this.updateGamificationMetrics(userId);
      await this.updatePerformanceMetrics();

      result.success = true;
      result.updatedMetrics = ['tasks', 'gamification', 'performance', 'system'];

      store.dispatch(updateConnectionStatus('connected'));

      this.addSystemEvent({
        id: `sync_${Date.now()}`,
        type: 'success',
        message: 'Data synchronization completed successfully',
        timestamp: new Date().toISOString(),
        component: 'UnifiedDataService',
      });
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      store.dispatch(updateConnectionStatus('disconnected'));

      this.addSystemEvent({
        id: `sync_error_${Date.now()}`,
        type: 'error',
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        component: 'UnifiedDataService',
      });
    } finally {
      this.syncInProgress = false;
      result.duration = Date.now() - startTime;
      this.emit('dataRefreshed', result);
    }

    return result;
  }

  /**
   * 📊 タスクメトリクスの更新
   */
  private async updateTaskMetrics(userId: string): Promise<void> {
    try {
      const todos = JSON.parse(localStorage.getItem('todos') || '[]');
      const today = new Date().toDateString();

      // リアルタイム統計の計算
      const completedToday = todos.filter(
        (todo: any) =>
          todo.completed &&
          todo.completedDate &&
          new Date(todo.completedDate).toDateString() === today
      ).length;

      if (completedToday > 0) {
        this.addRecentActivity({
          id: `task_completed_${Date.now()}`,
          type: 'task_completed',
          title: `${completedToday}個のタスクを完了`,
          description: '今日の目標に向けて順調に進んでいます！',
          timestamp: new Date().toISOString(),
          userId,
          metadata: { completedCount: completedToday },
        });
      }
    } catch (error) {
      console.error('Failed to update task metrics:', error);
    }
  }

  /**
   * 🎮 ゲーミフィケーションメトリクスの更新
   */
  private async updateGamificationMetrics(userId: string): Promise<void> {
    try {
      const level = parseInt(localStorage.getItem('playerLevel') || '1');
      const totalXP = parseInt(localStorage.getItem('totalXP') || '0');

      // レベルアップの検出
      const expectedLevel = Math.floor(totalXP / 1000) + 1;
      if (expectedLevel > level) {
        localStorage.setItem('playerLevel', expectedLevel.toString());

        this.addRecentActivity({
          id: `level_up_${Date.now()}`,
          type: 'level_up',
          title: `レベル${expectedLevel}にレベルアップ！`,
          description: '新しいバッジと機能がアンロックされました',
          timestamp: new Date().toISOString(),
          userId,
          metadata: { newLevel: expectedLevel, previousLevel: level },
        });

        this.addNotification({
          id: `level_up_notification_${Date.now()}`,
          type: 'achievement',
          title: '🎉 レベルアップ！',
          message: `おめでとうございます！レベル${expectedLevel}に到達しました！`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          actionUrl: '/achievements',
        });
      }
    } catch (error) {
      console.error('Failed to update gamification metrics:', error);
    }
  }

  /**
   * ⚡ パフォーマンスメトリクスの更新
   */
  private async updatePerformanceMetrics(): Promise<void> {
    try {
      // パフォーマンス指標の収集
      const performanceEntries = performance.getEntriesByType(
        'navigation'
      ) as PerformanceNavigationTiming[];
      const pageLoadTime =
        performanceEntries.length > 0
          ? performanceEntries[0].loadEventEnd - performanceEntries[0].loadEventStart
          : 0;

      // メモリ使用量（利用可能な場合）
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo
        ? Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100)
        : 0;

      // API応答時間のシミュレーション
      const apiResponseTime = Math.random() * 200 + 100; // 100-300ms

      if (this.config.debugMode) {
        console.log('📊 Performance Metrics:', {
          pageLoadTime: Math.round(pageLoadTime),
          memoryUsage,
          apiResponseTime: Math.round(apiResponseTime),
        });
      }
    } catch (error) {
      console.error('Failed to update performance metrics:', error);
    }
  }

  /**
   * 🏥 システムヘルスチェック
   */
  public async performHealthCheck(): Promise<SystemHealthCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // メモリ使用量チェック
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const memoryUsage = (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100;
        if (memoryUsage > 80) {
          issues.push('High memory usage detected');
          recommendations.push('Consider clearing cache or reloading the page');
          score -= 20;
        }
      }

      // ローカルストレージサイズチェック
      const storageUsed = new Blob(Object.values(localStorage)).size;
      if (storageUsed > 5 * 1024 * 1024) {
        // 5MB
        issues.push('Local storage is nearly full');
        recommendations.push('Clean up old data or optimize storage usage');
        score -= 15;
      }

      // エラー率チェック（シミュレーション）
      const errorRate = Math.random() * 2; // 0-2%
      if (errorRate > 1) {
        issues.push('Elevated error rate detected');
        recommendations.push('Check network connection and server status');
        score -= 25;
      }

      // 接続状態チェック
      if (!navigator.onLine) {
        issues.push('No internet connection');
        recommendations.push('Check your network connection');
        score -= 30;
      }

      this.lastHealthCheck = Date.now();

      const status = score >= 80 ? 'healthy' : score >= 60 ? 'degraded' : 'critical';

      return {
        status,
        issues,
        recommendations,
        score,
      };
    } catch (error) {
      return {
        status: 'critical',
        issues: ['Health check failed'],
        recommendations: ['Contact system administrator'],
        score: 0,
      };
    }
  }

  /**
   * 🔄 リアルタイム同期の開始
   */
  private startRealtimeSync(userId: string): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      if (!this.syncInProgress) {
        await this.refreshData(userId);
      }
    }, this.config.refreshInterval);

    console.log(`🔄 Realtime sync started with ${this.config.refreshInterval}ms interval`);
  }

  /**
   * 🛑 リアルタイム同期の停止
   */
  public stopRealtimeSync(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('🛑 Realtime sync stopped');
    }
  }

  /**
   * 📝 イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // ページ可視性の変更を監視
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isInitialized) {
        this.emit('pageVisible');
      } else if (document.visibilityState === 'hidden') {
        this.emit('pageHidden');
      }
    });

    // オンライン/オフライン状態の監視
    window.addEventListener('online', () => {
      store.dispatch(updateConnectionStatus('connected'));
      this.emit('connectionRestored');
    });

    window.addEventListener('offline', () => {
      store.dispatch(updateConnectionStatus('disconnected'));
      this.emit('connectionLost');
    });
  }

  /**
   * 📊 アクティビティの追加
   */
  public addRecentActivity(activity: RecentActivity): void {
    store.dispatch(addRecentActivity(activity));
    this.emit('activityAdded', activity);
  }

  /**
   * 🔔 システムイベントの追加
   */
  public addSystemEvent(event: SystemEvent): void {
    store.dispatch(addSystemEvent(event));
    this.emit('systemEvent', event);
  }

  /**
   * 📬 通知の追加
   */
  public addNotification(notification: Notification): void {
    store.dispatch(addNotification(notification));
    this.emit('notificationAdded', notification);
  }

  /**
   * 🧹 キャッシュのクリア
   */
  public clearCache(): void {
    store.dispatch(clearCache());
    this.emit('cacheCleared');
  }

  /**
   * 📈 統計情報の取得
   */
  public getStatistics() {
    const state = store.getState().unifiedData;
    return {
      isInitialized: this.isInitialized,
      lastSyncTime: state.lastSyncTime,
      connectionStatus: state.connectionStatus,
      syncStatus: state.syncStatus,
      cacheSize: Object.keys(state.cache).length,
      totalActivities: state.realtimeData.recentActivities.length,
      totalNotifications: state.realtimeData.notifications.length,
      systemHealth: state.systemMetrics.systemHealth,
    };
  }

  /**
   * 🚮 リソースのクリーンアップ
   */
  public destroy(): void {
    this.stopRealtimeSync();
    this.removeAllListeners();
    this.isInitialized = false;
    console.log('🚮 Unified Data Service destroyed');
  }
}

// シングルトンインスタンスをエクスポート
export const unifiedDataService = UnifiedDataService.getInstance();

// デフォルトエクスポート
export default unifiedDataService;
