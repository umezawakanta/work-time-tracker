import { EventEmitter } from 'events';

/**
 * 📡 ページ間データ同期サービス - リアルタイム連携システム
 */

export interface PageData {
  pageId: string;
  pageName: string;
  lastUpdated: string;
  data: Record<string, any>;
  metrics: Record<string, number>;
  actions: PageAction[];
  status: 'active' | 'idle' | 'loading' | 'error';
}

export interface PageAction {
  id: string;
  type: string;
  timestamp: string;
  data: any;
  source: string;
}

export interface SyncEvent {
  type: 'update' | 'action' | 'metric_change' | 'status_change';
  sourcePageId: string;
  targetPageIds: string[];
  data: any;
  timestamp: string;
}

export interface CrossPageMapping {
  sourceAction: string;
  targetUpdates: Array<{
    pageId: string;
    updateType: string;
    dataPath: string;
    transformer?: (data: any) => any;
  }>;
}

/**
 * 🔄 リアルタイムページ同期サービス
 */
class PageSyncService extends EventEmitter {
  private static instance: PageSyncService | null = null;
  private pages: Map<string, PageData> = new Map();
  private crossPageMappings: CrossPageMapping[] = [];
  private syncListeners: Map<string, (event: SyncEvent) => void> = new Map();
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: string = new Date().toISOString();

  private constructor() {
    super();
    this.initializePages();
    this.setupCrossPageMappings();
    this.startAutoSync();
    console.log('📡 ページ同期サービス初期化完了');
  }

  public static getInstance(): PageSyncService {
    if (!PageSyncService.instance) {
      PageSyncService.instance = new PageSyncService();
    }
    return PageSyncService.instance;
  }

  /**
   * 📄 ページ初期化
   */
  private initializePages(): void {
    const pageConfigs = [
      { id: 'home', name: 'ホーム' },
      { id: 'integrated-dashboard', name: '統合ダッシュボード' },
      { id: 'todos', name: 'ToDo管理' },
      { id: 'badge-dashboard', name: '開発バッジダッシュボード' },
      { id: 'badge-prediction', name: 'バッジ完了予測' },
      { id: 'badge-showcase', name: 'バッジショーケース' },
      { id: 'wbs-creation', name: 'WBS作成' },
      { id: 'ai-wbs-generation', name: 'AI WBS生成' },
      { id: 'gamification', name: 'ゲーミフィケーション' },
      { id: 'attendance', name: '勤怠管理' },
    ];

    pageConfigs.forEach((config) => {
      this.pages.set(config.id, {
        pageId: config.id,
        pageName: config.name,
        lastUpdated: new Date().toISOString(),
        data: {},
        metrics: {},
        actions: [],
        status: 'idle',
      });
    });
  }

  /**
   * 🔗 ページ間マッピング設定
   */
  private setupCrossPageMappings(): void {
    this.crossPageMappings = [
      // ToDo完了 → バッジ進捗更新
      {
        sourceAction: 'todo_completed',
        targetUpdates: [
          {
            pageId: 'badge-dashboard',
            updateType: 'progress_update',
            dataPath: 'badgeProgress',
            transformer: (data) => ({ badgeId: 'task-master', progress: data.completedCount * 2 }),
          },
          {
            pageId: 'integrated-dashboard',
            updateType: 'metric_update',
            dataPath: 'completedTasks',
            transformer: (data) => data.completedCount,
          },
        ],
      },

      // WBS作成 → プロジェクト管理バッジ進捗
      {
        sourceAction: 'wbs_created',
        targetUpdates: [
          {
            pageId: 'badge-dashboard',
            updateType: 'progress_update',
            dataPath: 'badgeProgress',
            transformer: (data) => ({
              badgeId: 'product-manager',
              progress: data.wbsComplexity * 5,
            }),
          },
          {
            pageId: 'gamification',
            updateType: 'points_award',
            dataPath: 'totalPoints',
            transformer: (data) => data.wbsComplexity * 50,
          },
        ],
      },

      // AI機能使用 → AI統合バッジ進捗
      {
        sourceAction: 'ai_feature_used',
        targetUpdates: [
          {
            pageId: 'badge-dashboard',
            updateType: 'progress_update',
            dataPath: 'badgeProgress',
            transformer: (data) => ({
              badgeId: 'ai-integration-pioneer',
              progress: data.usageCount,
            }),
          },
          {
            pageId: 'badge-prediction',
            updateType: 'prediction_update',
            dataPath: 'aiProgress',
            transformer: (data) => data.usageCount,
          },
        ],
      },

      // ゲーミフィケーション → 全体モチベーション
      {
        sourceAction: 'points_earned',
        targetUpdates: [
          {
            pageId: 'integrated-dashboard',
            updateType: 'metric_update',
            dataPath: 'motivationScore',
            transformer: (data) => Math.min(100, data.totalPoints / 100),
          },
          {
            pageId: 'home',
            updateType: 'achievement_update',
            dataPath: 'recentAchievements',
            transformer: (data) => data.latestAchievement,
          },
        ],
      },

      // 勤怠記録 → 生産性メトリクス
      {
        sourceAction: 'time_logged',
        targetUpdates: [
          {
            pageId: 'integrated-dashboard',
            updateType: 'metric_update',
            dataPath: 'productivityScore',
            transformer: (data) => data.efficiency || 0,
          },
          {
            pageId: 'badge-dashboard',
            updateType: 'progress_update',
            dataPath: 'badgeProgress',
            transformer: (data) => ({
              badgeId: 'labor-relations-specialist',
              progress: data.workHours / 10,
            }),
          },
        ],
      },

      // バッジ完了 → 全体通知
      {
        sourceAction: 'badge_completed',
        targetUpdates: [
          {
            pageId: 'home',
            updateType: 'notification',
            dataPath: 'notifications',
            transformer: (data) => ({
              type: 'badge_achievement',
              title: `🏆 ${data.badgeName} 完了！`,
              message: `${data.badgeName}バッジを獲得しました`,
              timestamp: new Date().toISOString(),
            }),
          },
          {
            pageId: 'gamification',
            updateType: 'points_award',
            dataPath: 'totalPoints',
            transformer: (data) => data.points || 0,
          },
          {
            pageId: 'badge-showcase',
            updateType: 'showcase_update',
            dataPath: 'featuredBadges',
            transformer: (data) => data.badge,
          },
        ],
      },
    ];
  }

  /**
   * 🔄 自動同期開始
   */
  private startAutoSync(): void {
    if (this.autoSyncInterval) return;

    this.autoSyncInterval = setInterval(() => {
      this.performAutoSync();
    }, 10000); // 10秒ごと

    console.log('🔄 自動同期開始 (10秒間隔)');
  }

  /**
   * 🔄 自動同期実行
   */
  private performAutoSync(): void {
    const now = new Date().toISOString();

    // 各ページの最終更新時刻をチェック
    this.pages.forEach((pageData, pageId) => {
      const timeDiff = new Date(now).getTime() - new Date(pageData.lastUpdated).getTime();

      // 30秒以上更新されていないページは idle 状態に
      if (timeDiff > 30000 && pageData.status === 'active') {
        this.updatePageStatus(pageId, 'idle');
      }
    });

    this.lastSyncTime = now;
    this.emit('sync_completed', { timestamp: now });
  }

  /**
   * 📡 ページデータ更新
   */
  public updatePageData(pageId: string, data: Partial<PageData>): void {
    const page = this.pages.get(pageId);
    if (!page) {
      console.warn(`ページが見つかりません: ${pageId}`);
      return;
    }

    const updatedPage: PageData = {
      ...page,
      ...data,
      lastUpdated: new Date().toISOString(),
      status: 'active',
    };

    this.pages.set(pageId, updatedPage);

    // 同期イベント発行
    const syncEvent: SyncEvent = {
      type: 'update',
      sourcePageId: pageId,
      targetPageIds: Array.from(this.pages.keys()).filter((id) => id !== pageId),
      data: updatedPage,
      timestamp: new Date().toISOString(),
    };

    this.broadcastSyncEvent(syncEvent);
    console.log(`📡 ページデータ更新: ${pageId}`);
  }

  /**
   * ⚡ ページアクション記録・伝播
   */
  public recordPageAction(pageId: string, action: Omit<PageAction, 'id' | 'timestamp'>): void {
    const page = this.pages.get(pageId);
    if (!page) return;

    const fullAction: PageAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...action,
    };

    // ページにアクション追加
    page.actions.push(fullAction);
    page.lastUpdated = new Date().toISOString();
    page.status = 'active';

    // アクション履歴を最新100件に制限
    if (page.actions.length > 100) {
      page.actions = page.actions.slice(-100);
    }

    this.pages.set(pageId, page);

    // クロスページマッピング処理
    this.processCrossPageMapping(pageId, fullAction);

    // 同期イベント発行
    const syncEvent: SyncEvent = {
      type: 'action',
      sourcePageId: pageId,
      targetPageIds: this.getTargetPagesForAction(action.type),
      data: fullAction,
      timestamp: new Date().toISOString(),
    };

    this.broadcastSyncEvent(syncEvent);
    console.log(`⚡ アクション記録: ${pageId} - ${action.type}`);
  }

  /**
   * 🔗 クロスページマッピング処理
   */
  private processCrossPageMapping(sourcePageId: string, action: PageAction): void {
    const mappings = this.crossPageMappings.filter((m) => m.sourceAction === action.type);

    mappings.forEach((mapping) => {
      mapping.targetUpdates.forEach((update) => {
        const targetPage = this.pages.get(update.pageId);
        if (!targetPage) return;

        // データ変換
        const transformedData = update.transformer ? update.transformer(action.data) : action.data;

        // ターゲットページのデータ更新
        const dataPath = update.dataPath.split('.');
        let current = targetPage.data;

        for (let i = 0; i < dataPath.length - 1; i++) {
          if (!current[dataPath[i]]) current[dataPath[i]] = {};
          current = current[dataPath[i]];
        }

        current[dataPath[dataPath.length - 1]] = transformedData;
        targetPage.lastUpdated = new Date().toISOString();

        this.pages.set(update.pageId, targetPage);

        // ターゲットページに通知
        const targetSyncEvent: SyncEvent = {
          type: 'update',
          sourcePageId,
          targetPageIds: [update.pageId],
          data: { updateType: update.updateType, data: transformedData },
          timestamp: new Date().toISOString(),
        };

        this.notifyPage(update.pageId, targetSyncEvent);
      });
    });
  }

  /**
   * 📊 メトリクス更新
   */
  public updatePageMetrics(pageId: string, metrics: Record<string, number>): void {
    const page = this.pages.get(pageId);
    if (!page) return;

    page.metrics = { ...page.metrics, ...metrics };
    page.lastUpdated = new Date().toISOString();
    page.status = 'active';

    this.pages.set(pageId, page);

    // メトリクス変更イベント
    const syncEvent: SyncEvent = {
      type: 'metric_change',
      sourcePageId: pageId,
      targetPageIds: ['integrated-dashboard'],
      data: metrics,
      timestamp: new Date().toISOString(),
    };

    this.broadcastSyncEvent(syncEvent);
  }

  /**
   * 🔄 ページステータス更新
   */
  public updatePageStatus(pageId: string, status: PageData['status']): void {
    const page = this.pages.get(pageId);
    if (!page) return;

    page.status = status;
    page.lastUpdated = new Date().toISOString();
    this.pages.set(pageId, page);

    // ステータス変更イベント
    const syncEvent: SyncEvent = {
      type: 'status_change',
      sourcePageId: pageId,
      targetPageIds: ['integrated-dashboard'],
      data: { status },
      timestamp: new Date().toISOString(),
    };

    this.broadcastSyncEvent(syncEvent);
  }

  /**
   * 📡 同期イベント配信
   */
  private broadcastSyncEvent(event: SyncEvent): void {
    // 全体リスナーに通知
    this.emit('sync_event', event);

    // 個別ページリスナーに通知
    event.targetPageIds.forEach((pageId) => {
      this.notifyPage(pageId, event);
    });
  }

  /**
   * 📢 特定ページに通知
   */
  private notifyPage(pageId: string, event: SyncEvent): void {
    const listener = this.syncListeners.get(pageId);
    if (listener) {
      listener(event);
    }
  }

  /**
   * 🎯 アクション対象ページ特定
   */
  private getTargetPagesForAction(actionType: string): string[] {
    const mapping = this.crossPageMappings.find((m) => m.sourceAction === actionType);
    return mapping ? mapping.targetUpdates.map((u) => u.pageId) : [];
  }

  // 外部API
  /**
   * 🔗 ページ同期リスナー登録
   */
  public registerPageListener(pageId: string, listener: (event: SyncEvent) => void): void {
    this.syncListeners.set(pageId, listener);
    console.log(`🔗 リスナー登録: ${pageId}`);
  }

  /**
   * 🔌 ページ同期リスナー解除
   */
  public unregisterPageListener(pageId: string): void {
    this.syncListeners.delete(pageId);
    console.log(`🔌 リスナー解除: ${pageId}`);
  }

  /**
   * 📄 ページデータ取得
   */
  public getPageData(pageId: string): PageData | undefined {
    return this.pages.get(pageId);
  }

  /**
   * 📊 全ページデータ取得
   */
  public getAllPagesData(): Map<string, PageData> {
    return new Map(this.pages);
  }

  /**
   * 📈 同期統計取得
   */
  public getSyncStatistics(): {
    totalPages: number;
    activePages: number;
    idlePages: number;
    totalActions: number;
    lastSyncTime: string;
    avgResponseTime: number;
  } {
    const pagesArray = Array.from(this.pages.values());
    const totalActions = pagesArray.reduce((sum, page) => sum + page.actions.length, 0);

    return {
      totalPages: pagesArray.length,
      activePages: pagesArray.filter((p) => p.status === 'active').length,
      idlePages: pagesArray.filter((p) => p.status === 'idle').length,
      totalActions,
      lastSyncTime: this.lastSyncTime,
      avgResponseTime: 150, // 実装時は実際の計測値
    };
  }

  /**
   * 🧹 クリーンアップ
   */
  public cleanup(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }

    this.syncListeners.clear();
    this.removeAllListeners();
    console.log('🧹 ページ同期サービス クリーンアップ完了');
  }
}

export const pageSyncService = PageSyncService.getInstance();
