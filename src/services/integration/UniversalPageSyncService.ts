import { comprehensiveBadgeService } from '@/services/development/ComprehensiveBadgeService';
import { DevelopmentBadge, BadgeCategory } from '@/types/development-badges';
import { toast } from '@/components/ui/use-toast';

export interface UniversalPageState {
  pageId: string;
  pageName: string;
  isActive: boolean;
  lastUpdated: string;
  metrics: Record<string, number>;
  badgeProgress: Record<string, number>;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  pendingUpdates: number;
  activities: PageActivity[];
  connections: string[];
}

export interface PageActivity {
  id: string;
  type: 'badge_progress' | 'feature_unlock' | 'achievement' | 'milestone' | 'user_action';
  description: string;
  timestamp: string;
  userId?: string;
  metadata: Record<string, any>;
  impact: 'low' | 'medium' | 'high';
  relatedPages: string[];
}

export interface CrossPageUpdate {
  id: string;
  sourcePageId: string;
  targetPageIds: string[];
  updateType: 'badge_sync' | 'metric_update' | 'feature_toggle' | 'data_refresh';
  payload: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isCompleted: boolean;
}

export interface SyncMetrics {
  totalPages: number;
  activeSyncs: number;
  syncSuccessRate: number;
  averageSyncTime: number;
  pendingUpdates: number;
  errorCount: number;
  lastFullSync: string;
}

/**
 * 🔄 ユニバーサルページ同期サービス
 * 全23ページ間のリアルタイム同期と連携を管理
 */
class UniversalPageSyncService {
  private static instance: UniversalPageSyncService | null = null;
  private pageStates: Map<string, UniversalPageState> = new Map();
  private crossPageUpdates: CrossPageUpdate[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private isGlobalSyncActive: boolean = false;

  private readonly PAGE_REGISTRY = [
    { id: 'home', name: 'ホーム', priority: 'critical' },
    { id: 'integrated-dashboard', name: '統合ダッシュボード', priority: 'critical' },
    { id: 'todo-management', name: 'TODO管理', priority: 'high' },
    { id: 'automation-rules', name: '自動化ルール', priority: 'high' },
    { id: 'badge-dashboard', name: '開発バッジダッシュボード', priority: 'critical' },
    { id: 'badge-prediction', name: 'バッジ完了予測', priority: 'medium' },
    { id: 'badge-showcase', name: 'バッジショーケース', priority: 'medium' },
    { id: 'wbs-creation', name: 'WBS作成', priority: 'high' },
    { id: 'ai-wbs-generation', name: 'AI WBS生成', priority: 'high' },
    { id: 'gamification', name: 'ゲーミフィケーション', priority: 'medium' },
    { id: 'attendance-management', name: '勤怠管理', priority: 'high' },
    { id: 'reports', name: 'レポート', priority: 'high' },
    { id: 'improvement-planning', name: '改善計画', priority: 'medium' },
    { id: 'system-design', name: 'システム設計', priority: 'high' },
    { id: 'admin-dashboard', name: '管理者ダッシュボード', priority: 'critical' },
    { id: 'api-testing', name: 'APIテスト', priority: 'medium' },
    { id: 'quality-dashboard', name: '品質ダッシュボード', priority: 'high' },
    { id: 'error-monitoring', name: 'エラー監視', priority: 'high' },
    { id: 'performance-monitoring', name: 'パフォーマンス監視', priority: 'high' },
    { id: 'profile', name: 'プロフィール', priority: 'medium' },
    { id: 'settings', name: '設定', priority: 'medium' },
    { id: 'achievements-badges', name: '実績・バッジ', priority: 'critical' },
    { id: 'analytics', name: '分析', priority: 'high' },
  ] as const;

  private constructor() {
    this.initializePageStates();
    this.startGlobalSync();
    console.log('🔄 ユニバーサルページ同期サービス初期化完了');
  }

  public static getInstance(): UniversalPageSyncService {
    if (!UniversalPageSyncService.instance) {
      UniversalPageSyncService.instance = new UniversalPageSyncService();
    }
    return UniversalPageSyncService.instance;
  }

  /**
   * 📊 ページ状態初期化
   */
  private initializePageStates(): void {
    this.PAGE_REGISTRY.forEach((page) => {
      const pageState: UniversalPageState = {
        pageId: page.id,
        pageName: page.name,
        isActive: false,
        lastUpdated: new Date().toISOString(),
        metrics: this.generateInitialMetrics(page.id),
        badgeProgress: {},
        syncStatus: 'idle',
        pendingUpdates: 0,
        activities: [],
        connections: this.generatePageConnections(page.id),
      };

      this.pageStates.set(page.id, pageState);
    });

    // バッジ進捗データを初期化
    this.syncBadgeProgress();
    console.log('📊 ページ状態を初期化しました', this.pageStates.size, 'ページ');
  }

  /**
   * 🔗 ページ間接続生成
   */
  private generatePageConnections(pageId: string): string[] {
    const connectionMap: Record<string, string[]> = {
      home: ['integrated-dashboard', 'badge-dashboard', 'todo-management', 'analytics'],
      'integrated-dashboard': [
        'home',
        'badge-dashboard',
        'reports',
        'analytics',
        'quality-dashboard',
      ],
      'todo-management': ['home', 'automation-rules', 'gamification', 'reports'],
      'automation-rules': ['todo-management', 'wbs-creation', 'api-testing'],
      'badge-dashboard': [
        'home',
        'integrated-dashboard',
        'badge-prediction',
        'badge-showcase',
        'achievements-badges',
      ],
      'badge-prediction': ['badge-dashboard', 'badge-showcase', 'gamification'],
      'badge-showcase': ['badge-dashboard', 'badge-prediction', 'achievements-badges'],
      'wbs-creation': ['ai-wbs-generation', 'system-design', 'reports'],
      'ai-wbs-generation': ['wbs-creation', 'system-design', 'automation-rules'],
      gamification: ['todo-management', 'badge-prediction', 'achievements-badges'],
      'attendance-management': ['reports', 'admin-dashboard', 'analytics'],
      reports: ['integrated-dashboard', 'analytics', 'quality-dashboard', 'attendance-management'],
      'improvement-planning': ['reports', 'quality-dashboard', 'system-design'],
      'system-design': ['wbs-creation', 'ai-wbs-generation', 'improvement-planning'],
      'admin-dashboard': ['integrated-dashboard', 'attendance-management', 'quality-dashboard'],
      'api-testing': ['automation-rules', 'quality-dashboard', 'error-monitoring'],
      'quality-dashboard': ['integrated-dashboard', 'reports', 'api-testing', 'error-monitoring'],
      'error-monitoring': ['quality-dashboard', 'performance-monitoring', 'api-testing'],
      'performance-monitoring': ['error-monitoring', 'quality-dashboard', 'analytics'],
      profile: ['settings', 'achievements-badges'],
      settings: ['profile', 'admin-dashboard'],
      'achievements-badges': ['badge-dashboard', 'badge-showcase', 'gamification', 'profile'],
      analytics: ['home', 'integrated-dashboard', 'reports', 'performance-monitoring'],
    };

    return connectionMap[pageId] || [];
  }

  /**
   * 📈 初期メトリクス生成
   */
  private generateInitialMetrics(pageId: string): Record<string, number> {
    const baseMetrics = {
      viewCount: Math.floor(Math.random() * 1000) + 100,
      lastActiveTime: Date.now(),
      userEngagement: Math.floor(Math.random() * 100) + 1,
      featureUsage: Math.floor(Math.random() * 80) + 20,
    };

    const pageSpecificMetrics: Record<string, Record<string, number>> = {
      'todo-management': {
        ...baseMetrics,
        totalTasks: Math.floor(Math.random() * 50) + 10,
        completedTasks: Math.floor(Math.random() * 30) + 5,
        productivityScore: Math.floor(Math.random() * 100) + 1,
      },
      'badge-dashboard': {
        ...baseMetrics,
        totalBadges: 30,
        unlockedBadges: Math.floor(Math.random() * 20) + 5,
        badgeProgress: Math.floor(Math.random() * 100) + 1,
      },
      gamification: {
        ...baseMetrics,
        totalPoints: Math.floor(Math.random() * 10000) + 1000,
        level: Math.floor(Math.random() * 10) + 1,
        streakDays: Math.floor(Math.random() * 30) + 1,
      },
      analytics: {
        ...baseMetrics,
        dataPoints: Math.floor(Math.random() * 10000) + 1000,
        insights: Math.floor(Math.random() * 50) + 10,
        dashboards: Math.floor(Math.random() * 20) + 5,
      },
    };

    return pageSpecificMetrics[pageId] || baseMetrics;
  }

  /**
   * 🔄 グローバル同期開始
   */
  private startGlobalSync(): void {
    this.syncInterval = setInterval(() => {
      this.performGlobalSync();
    }, 5000); // 5秒ごとに同期

    console.log('🔄 グローバル同期を開始しました');
  }

  /**
   * ⚡ グローバル同期実行
   */
  private async performGlobalSync(): Promise<void> {
    if (this.isGlobalSyncActive) return;

    this.isGlobalSyncActive = true;

    try {
      // バッジ進捗同期
      await this.syncBadgeProgress();

      // ページ間アップデート処理
      await this.processCrossPageUpdates();

      // メトリクス更新
      await this.updatePageMetrics();

      // アクティビティ同期
      await this.syncActivities();

      console.log('⚡ グローバル同期完了');
    } catch (error) {
      console.error('❌ グローバル同期エラー:', error);
    } finally {
      this.isGlobalSyncActive = false;
    }
  }

  /**
   * 🏆 バッジ進捗同期
   */
  private async syncBadgeProgress(): Promise<void> {
    try {
      const allBadges = comprehensiveBadgeService.getAllBadges();

      for (const pageState of this.pageStates.values()) {
        const relatedBadges = this.getPageRelatedBadges(pageState.pageId, allBadges);

        relatedBadges.forEach((badge) => {
          pageState.badgeProgress[badge.id] = badge.progress;
        });

        pageState.lastUpdated = new Date().toISOString();
        pageState.syncStatus = 'synced';
      }
    } catch (error) {
      console.error('❌ バッジ進捗同期エラー:', error);
    }
  }

  /**
   * 🎯 ページ関連バッジ取得
   */
  private getPageRelatedBadges(pageId: string, allBadges: DevelopmentBadge[]): DevelopmentBadge[] {
    return allBadges.filter((badge) => {
      // 簡単な関連性チェック
      return badge.isUnlocked && badge.progress > 0;
    });
  }

  /**
   * 🔄 ページ間アップデート処理
   */
  private async processCrossPageUpdates(): Promise<void> {
    const pendingUpdates = this.crossPageUpdates.filter((update) => !update.isCompleted);

    for (const update of pendingUpdates.slice(0, 10)) {
      // 一度に最大10件処理
      try {
        await this.processUpdate(update);
        update.isCompleted = true;
      } catch (error) {
        console.error('❌ アップデート処理エラー:', error);
      }
    }

    // 完了済みアップデートをクリーンアップ
    this.crossPageUpdates = this.crossPageUpdates.filter((update) => !update.isCompleted);
  }

  /**
   * ⚙️ 個別アップデート処理
   */
  private async processUpdate(update: CrossPageUpdate): Promise<void> {
    const sourcePageState = this.pageStates.get(update.sourcePageId);
    if (!sourcePageState) return;

    for (const targetPageId of update.targetPageIds) {
      const targetPageState = this.pageStates.get(targetPageId);
      if (!targetPageState) continue;

      switch (update.updateType) {
        case 'badge_sync':
          this.syncBadgesBetweenPages(sourcePageState, targetPageState, update.payload);
          break;
        case 'metric_update':
          this.updatePageMetricsFromSource(sourcePageState, targetPageState, update.payload);
          break;
        case 'feature_toggle':
          this.syncFeatureToggle(targetPageState, update.payload);
          break;
        case 'data_refresh':
          this.refreshPageData(targetPageState, update.payload);
          break;
      }

      targetPageState.lastUpdated = new Date().toISOString();
      targetPageState.pendingUpdates = Math.max(0, targetPageState.pendingUpdates - 1);
    }
  }

  /**
   * 🏆 ページ間バッジ同期
   */
  private syncBadgesBetweenPages(
    source: UniversalPageState,
    target: UniversalPageState,
    payload: any
  ): void {
    Object.keys(source.badgeProgress).forEach((badgeId) => {
      if (target.badgeProgress[badgeId] !== source.badgeProgress[badgeId]) {
        target.badgeProgress[badgeId] = source.badgeProgress[badgeId];

        // アクティビティ記録
        this.recordActivity(target.pageId, {
          type: 'badge_progress',
          description: `バッジ進捗更新: ${badgeId}`,
          metadata: { badgeId, progress: source.badgeProgress[badgeId] },
          impact: 'medium',
          relatedPages: [source.pageId],
        });
      }
    });
  }

  /**
   * 📊 メトリクス更新
   */
  private updatePageMetricsFromSource(
    source: UniversalPageState,
    target: UniversalPageState,
    payload: any
  ): void {
    const metricsToSync = payload.metrics || {};
    Object.keys(metricsToSync).forEach((metric) => {
      target.metrics[metric] = metricsToSync[metric];
    });
  }

  /**
   * 🔧 機能トグル同期
   */
  private syncFeatureToggle(target: UniversalPageState, payload: any): void {
    const { featureId, enabled } = payload;
    target.metrics[`feature_${featureId}`] = enabled ? 1 : 0;
  }

  /**
   * 🔄 ページデータ更新
   */
  private refreshPageData(target: UniversalPageState, payload: any): void {
    target.metrics = { ...target.metrics, ...payload.data };
  }

  /**
   * 📈 ページメトリクス更新
   */
  private async updatePageMetrics(): Promise<void> {
    for (const pageState of this.pageStates.values()) {
      pageState.metrics.lastActiveTime = Date.now();
      pageState.metrics.userEngagement += Math.floor(Math.random() * 3) - 1;
      pageState.metrics.userEngagement = Math.max(
        0,
        Math.min(100, pageState.metrics.userEngagement)
      );
    }
  }

  /**
   * 📝 アクティビティ同期
   */
  private async syncActivities(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const pageState of this.pageStates.values()) {
      pageState.activities = pageState.activities.filter(
        (activity) => new Date(activity.timestamp) > cutoffTime
      );
    }
  }

  /**
   * 📊 アクティビティ記録
   */
  public recordActivity(
    pageId: string,
    activityData: Omit<PageActivity, 'id' | 'timestamp'>
  ): void {
    const pageState = this.pageStates.get(pageId);
    if (!pageState) return;

    const activity: PageActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...activityData,
    };

    pageState.activities.push(activity);

    // 関連ページに通知
    activityData.relatedPages.forEach((relatedPageId) => {
      this.notifyPageOfActivity(relatedPageId, activity);
    });

    console.log(`📝 アクティビティ記録: ${pageId} - ${activity.description}`);
  }

  /**
   * 🔔 ページアクティビティ通知
   */
  private notifyPageOfActivity(pageId: string, activity: PageActivity): void {
    const listeners = this.eventListeners.get(`activity_${pageId}`);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(activity);
        } catch (error) {
          console.error('❌ アクティビティ通知エラー:', error);
        }
      });
    }
  }

  /**
   * 🔄 ページ間アップデート作成
   */
  public createCrossPageUpdate(
    sourcePageId: string,
    targetPageIds: string[],
    updateType: CrossPageUpdate['updateType'],
    payload: any,
    priority: CrossPageUpdate['priority'] = 'medium'
  ): string {
    const updateId = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const update: CrossPageUpdate = {
      id: updateId,
      sourcePageId,
      targetPageIds,
      updateType,
      payload,
      timestamp: new Date().toISOString(),
      priority,
      isCompleted: false,
    };

    this.crossPageUpdates.push(update);

    // 対象ページのpendingUpdatesを増加
    targetPageIds.forEach((pageId) => {
      const pageState = this.pageStates.get(pageId);
      if (pageState) {
        pageState.pendingUpdates++;
      }
    });

    console.log(`🔄 ページ間アップデート作成: ${updateId}`);
    return updateId;
  }

  /**
   * 📊 同期メトリクス取得
   */
  public getSyncMetrics(): SyncMetrics {
    const totalPages = this.pageStates.size;
    const activeSyncs = Array.from(this.pageStates.values()).filter(
      (state) => state.syncStatus === 'syncing'
    ).length;
    const pendingUpdates = this.crossPageUpdates.filter((update) => !update.isCompleted).length;

    return {
      totalPages,
      activeSyncs,
      syncSuccessRate: 95,
      averageSyncTime: 150,
      pendingUpdates,
      errorCount: 0,
      lastFullSync: new Date().toISOString(),
    };
  }

  /**
   * 🎯 ページ状態取得
   */
  public getPageState(pageId: string): UniversalPageState | undefined {
    return this.pageStates.get(pageId);
  }

  /**
   * 📋 全ページ状態取得
   */
  public getAllPageStates(): UniversalPageState[] {
    return Array.from(this.pageStates.values());
  }

  /**
   * 👂 イベントリスナー登録
   */
  public addEventListener(event: string, listener: (data: any) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(listener);

    // Cleanup function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  /**
   * 🧹 クリーンアップ
   */
  public cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.pageStates.clear();
    this.crossPageUpdates = [];
    this.eventListeners.clear();
    this.isGlobalSyncActive = false;

    console.log('🧹 ユニバーサルページ同期サービス クリーンアップ完了');
  }
}

export const universalPageSyncService = UniversalPageSyncService.getInstance();
