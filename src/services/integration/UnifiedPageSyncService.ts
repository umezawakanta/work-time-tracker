import { DevelopmentBadge, BadgeCategory } from '@/types/development-badges';
import { EXPANDED_BADGES_DATABASE } from '@/services/development/ExpandedBadgesDatabase';
import comprehensiveBadgeService from '@/services/development/ComprehensiveBadgeService';

export interface PageSyncEvent {
  id: string;
  pageName: string;
  eventType: 'page_visit' | 'action_completed' | 'milestone_reached' | 'data_updated';
  timestamp: string;
  data: Record<string, any>;
  badgeImpact: Array<{
    badgeId: string;
    progressDelta: number;
    reason: string;
  }>;
}

export interface PageMetrics {
  pageName: string;
  lastVisited: string;
  visitCount: number;
  activeTime: number;
  actionsCompleted: number;
  badgeProgress: Record<string, number>;
  keyMetrics: Record<string, number>;
}

export interface CrossPageInsights {
  totalActiveBadges: number;
  nearCompletionBadges: DevelopmentBadge[];
  recommendedNextActions: Array<{
    page: string;
    action: string;
    badgeImpact: string;
    priority: number;
  }>;
  weeklyProgress: Array<{
    week: string;
    completedBadges: number;
    progressGained: number;
    pagesActive: number;
  }>;
}

class UnifiedPageSyncService {
  private static instance: UnifiedPageSyncService;
  private pageMetrics: Map<string, PageMetrics> = new Map();
  private syncEvents: PageSyncEvent[] = [];
  private listeners: Map<string, ((event: PageSyncEvent) => void)[]> = new Map();

  // ページ定義と関連バッジカテゴリ
  private pageDefinitions = {
    home: {
      title: 'ホーム',
      categories: ['business', 'analytics', 'management'],
      keyActions: ['dashboard_review', 'metrics_analysis', 'goal_setting'],
    },
    'integrated-dashboard': {
      title: '統合ダッシュボード',
      categories: ['analytics', 'monitoring', 'business', 'operations'],
      keyActions: ['metric_analysis', 'trend_review', 'insight_discovery'],
    },
    todos: {
      title: 'ToDo管理',
      categories: ['productivity', 'project_management', 'systematization'],
      keyActions: ['task_completion', 'priority_setting', 'workflow_optimization'],
    },
    'automation-rules': {
      title: '自動化ルール',
      categories: ['automation', 'systematization', 'efficiency'],
      keyActions: ['rule_creation', 'workflow_automation', 'process_optimization'],
    },
    'development-badges': {
      title: '開発バッジダッシュボード',
      categories: ['foundation', 'testing', 'cicd', 'architecture'],
      keyActions: ['badge_review', 'progress_tracking', 'skill_assessment'],
    },
    'badge-prediction': {
      title: 'バッジ完了予測',
      categories: ['analytics', 'ai_ml', 'planning'],
      keyActions: ['prediction_analysis', 'timeline_review', 'strategy_adjustment'],
    },
    'badge-showcase': {
      title: 'バッジショーケース',
      categories: ['achievement', 'social', 'presentation'],
      keyActions: ['portfolio_review', 'achievement_sharing', 'skill_demonstration'],
    },
    'wbs-creation': {
      title: 'WBS作成',
      categories: ['project_management', 'planning', 'systematization'],
      keyActions: ['project_planning', 'task_breakdown', 'timeline_creation'],
    },
    'ai-wbs-generation': {
      title: 'AI WBS生成',
      categories: ['ai_ml', 'automation', 'project_management'],
      keyActions: ['ai_planning', 'intelligent_breakdown', 'optimization'],
    },
    gamification: {
      title: 'ゲーミフィケーション',
      categories: ['engagement', 'motivation', 'social'],
      keyActions: ['point_earning', 'achievement_unlocking', 'competition'],
    },
    'attendance-management': {
      title: '勤怠管理',
      categories: ['productivity', 'systematization', 'operations'],
      keyActions: ['time_tracking', 'attendance_logging', 'productivity_measurement'],
    },
    reports: {
      title: 'レポート',
      categories: ['analytics', 'business', 'documentation'],
      keyActions: ['report_generation', 'data_analysis', 'insight_sharing'],
    },
    'improvement-planning': {
      title: '改善計画',
      categories: ['planning', 'optimization', 'systematization'],
      keyActions: ['improvement_identification', 'plan_creation', 'progress_tracking'],
    },
    'system-design': {
      title: 'システム設計',
      categories: ['architecture', 'design', 'systematization'],
      keyActions: ['architecture_design', 'system_planning', 'specification_creation'],
    },
    'admin-dashboard': {
      title: '管理者ダッシュボード',
      categories: ['management', 'operations', 'systematization'],
      keyActions: ['admin_operations', 'system_management', 'user_management'],
    },
    'api-testing': {
      title: 'APIテスト',
      categories: ['testing', 'quality_assurance', 'automation'],
      keyActions: ['api_testing', 'quality_validation', 'test_automation'],
    },
    'quality-dashboard': {
      title: '品質ダッシュボード',
      categories: ['quality_assurance', 'monitoring', 'testing'],
      keyActions: ['quality_monitoring', 'metrics_review', 'improvement_planning'],
    },
    'error-monitoring': {
      title: 'エラー監視',
      categories: ['monitoring', 'reliability', 'operations'],
      keyActions: ['error_tracking', 'incident_response', 'reliability_improvement'],
    },
    'performance-monitoring': {
      title: 'パフォーマンス監視',
      categories: ['performance', 'optimization', 'monitoring'],
      keyActions: ['performance_analysis', 'optimization_planning', 'metrics_tracking'],
    },
    profile: {
      title: 'プロフィール',
      categories: ['personal', 'achievement', 'social'],
      keyActions: ['profile_update', 'achievement_review', 'skill_showcase'],
    },
    settings: {
      title: '設定',
      categories: ['systematization', 'operations', 'customization'],
      keyActions: ['configuration', 'customization', 'preference_setting'],
    },
    achievements: {
      title: '実績・バッジ',
      categories: ['achievement', 'progress', 'motivation'],
      keyActions: ['achievement_review', 'progress_analysis', 'goal_setting'],
    },
  };

  public static getInstance(): UnifiedPageSyncService {
    if (!UnifiedPageSyncService.instance) {
      UnifiedPageSyncService.instance = new UnifiedPageSyncService();
    }
    return UnifiedPageSyncService.instance;
  }

  /**
   * ページアクセスを記録
   */
  public recordPageVisit(pageName: string): void {
    const now = new Date().toISOString();
    const existing = this.pageMetrics.get(pageName);

    if (existing) {
      existing.lastVisited = now;
      existing.visitCount++;
    } else {
      this.pageMetrics.set(pageName, {
        pageName,
        lastVisited: now,
        visitCount: 1,
        activeTime: 0,
        actionsCompleted: 0,
        badgeProgress: {},
        keyMetrics: {},
      });
    }

    // バッジ進捗に影響
    this.processPageVisitImpact(pageName);
  }

  /**
   * ページでのアクション完了を記録
   */
  public recordAction(pageName: string, actionType: string, metadata?: Record<string, any>): void {
    const metrics = this.pageMetrics.get(pageName);
    if (metrics) {
      metrics.actionsCompleted++;
    }

    // バッジ進捗への影響を計算
    const badgeImpacts = this.calculateBadgeImpact(pageName, actionType, metadata);

    const event: PageSyncEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pageName,
      eventType: 'action_completed',
      timestamp: new Date().toISOString(),
      data: { actionType, ...metadata },
      badgeImpact: badgeImpacts,
    };

    this.syncEvents.push(event);
    this.notifyListeners(event);
    this.updateBadgeProgress(badgeImpacts);
  }

  /**
   * 特定ページの関連バッジを取得
   */
  public getPageRelevantBadges(pageName: string): DevelopmentBadge[] {
    const pageConfig = this.pageDefinitions[pageName as keyof typeof this.pageDefinitions];
    if (!pageConfig) {
      return [];
    }

    return EXPANDED_BADGES_DATABASE.filter((badge) =>
      pageConfig.categories.includes(badge.category)
    );
  }

  /**
   * クロスページインサイトを生成
   */
  public generateCrossPageInsights(): CrossPageInsights {
    const activeBadges = EXPANDED_BADGES_DATABASE.filter(
      (badge) => badge.progress > 0 && !badge.isCompleted
    );

    const nearCompletionBadges = activeBadges
      .filter((badge) => badge.progress >= 80)
      .sort((a, b) => b.progress - a.progress);

    const recommendedActions = this.generateRecommendedActions(nearCompletionBadges);

    return {
      totalActiveBadges: activeBadges.length,
      nearCompletionBadges: nearCompletionBadges.slice(0, 5),
      recommendedNextActions: recommendedActions,
      weeklyProgress: this.calculateWeeklyProgress(),
    };
  }

  /**
   * 推奨アクションを生成
   */
  private generateRecommendedActions(nearCompletionBadges: DevelopmentBadge[]): Array<{
    page: string;
    action: string;
    badgeImpact: string;
    priority: number;
  }> {
    const actions: Array<{
      page: string;
      action: string;
      badgeImpact: string;
      priority: number;
    }> = [];

    nearCompletionBadges.forEach((badge) => {
      // バッジカテゴリに最も関連の深いページを特定
      const relevantPages = Object.entries(this.pageDefinitions)
        .filter(([_, config]) => config.categories.includes(badge.category))
        .sort((a, b) => {
          const aRelevance = a[1].categories.filter((cat) => cat === badge.category).length;
          const bRelevance = b[1].categories.filter((cat) => cat === badge.category).length;
          return bRelevance - aRelevance;
        });

      if (relevantPages.length > 0) {
        const [pageName, pageConfig] = relevantPages[0];
        const suggestedAction = pageConfig.keyActions[0];

        actions.push({
          page: pageName,
          action: suggestedAction,
          badgeImpact: `${badge.name}の進捗を${100 - badge.progress}%完了させる`,
          priority: badge.progress,
        });
      }
    });

    return actions.sort((a, b) => b.priority - a.priority).slice(0, 10);
  }

  /**
   * バッジ進捗への影響を計算
   */
  private calculateBadgeImpact(
    pageName: string,
    actionType: string,
    metadata?: Record<string, any>
  ): Array<{
    badgeId: string;
    progressDelta: number;
    reason: string;
  }> {
    const impacts: Array<{
      badgeId: string;
      progressDelta: number;
      reason: string;
    }> = [];

    const relevantBadges = this.getPageRelevantBadges(pageName);

    relevantBadges.forEach((badge) => {
      if (badge.isCompleted) {
        return;
      }

      let progressDelta = 0;
      let reason = '';

      // アクションタイプに基づいて進捗を計算
      switch (actionType) {
        case 'task_completion':
          if (badge.category === 'productivity') {
            progressDelta = 2;
            reason = 'タスク完了による生産性向上';
          }
          break;
        case 'rule_creation':
          if (badge.category === 'automation') {
            progressDelta = 5;
            reason = '自動化ルール作成';
          }
          break;
        case 'badge_review':
          if (badge.category === 'foundation') {
            progressDelta = 1;
            reason = 'バッジ進捗レビュー';
          }
          break;
        case 'report_generation':
          if (badge.category === 'analytics') {
            progressDelta = 3;
            reason = 'レポート作成・分析';
          }
          break;
        case 'api_testing':
          if (badge.category === 'testing') {
            progressDelta = 4;
            reason = 'API品質テスト実行';
          }
          break;
        case 'error_tracking':
          if (badge.category === 'monitoring') {
            progressDelta = 3;
            reason = 'エラー監視・対応';
          }
          break;
        default:
          // 一般的なページアクティビティ
          progressDelta = 1;
          reason = `${pageName}でのアクティビティ`;
      }

      if (progressDelta > 0) {
        impacts.push({
          badgeId: badge.id,
          progressDelta,
          reason,
        });
      }
    });

    return impacts;
  }

  /**
   * ページ訪問による影響を処理
   */
  private processPageVisitImpact(pageName: string): void {
    const relevantBadges = this.getPageRelevantBadges(pageName);
    const impacts: Array<{
      badgeId: string;
      progressDelta: number;
      reason: string;
    }> = [];

    relevantBadges.forEach((badge) => {
      if (!badge.isCompleted && badge.progress < 100) {
        impacts.push({
          badgeId: badge.id,
          progressDelta: 0.5, // 訪問だけでは小さな進捗
          reason: `${this.pageDefinitions[pageName as keyof typeof this.pageDefinitions]?.title || pageName}への訪問`,
        });
      }
    });

    if (impacts.length > 0) {
      this.updateBadgeProgress(impacts);
    }
  }

  /**
   * バッジ進捗を更新
   */
  private updateBadgeProgress(
    impacts: Array<{
      badgeId: string;
      progressDelta: number;
      reason: string;
    }>
  ): void {
    impacts.forEach((impact) => {
      const badge = EXPANDED_BADGES_DATABASE.find((b) => b.id === impact.badgeId);
      if (badge && !badge.isCompleted) {
        const newProgress = Math.min(100, badge.progress + impact.progressDelta);
        badge.progress = newProgress;

        if (newProgress >= 100 && !badge.isCompleted) {
          badge.isCompleted = true;
          badge.completedAt = new Date().toISOString();

          // 完了通知
          this.notifyBadgeCompletion(badge);
        }
      }
    });
  }

  /**
   * バッジ完了通知
   */
  private notifyBadgeCompletion(badge: DevelopmentBadge): void {
    const event: PageSyncEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pageName: 'system',
      eventType: 'milestone_reached',
      timestamp: new Date().toISOString(),
      data: { badgeCompleted: badge },
      badgeImpact: [],
    };

    this.syncEvents.push(event);
    this.notifyListeners(event);

    // トースト通知など
    console.log(`🏆 バッジ完了: ${badge.name} - ${badge.points}ポイント獲得!`);
  }

  /**
   * リスナーに通知
   */
  private notifyListeners(event: PageSyncEvent): void {
    const listeners = this.listeners.get(event.pageName) || [];
    const globalListeners = this.listeners.get('*') || [];

    [...listeners, ...globalListeners].forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Page sync listener error:', error);
      }
    });
  }

  /**
   * イベントリスナーを登録
   */
  public addEventListener(pageName: string, callback: (event: PageSyncEvent) => void): void {
    if (!this.listeners.has(pageName)) {
      this.listeners.set(pageName, []);
    }
    this.listeners.get(pageName)!.push(callback);
  }

  /**
   * 週次進捗を計算
   */
  private calculateWeeklyProgress(): Array<{
    week: string;
    completedBadges: number;
    progressGained: number;
    pagesActive: number;
  }> {
    // 実装時は実際のデータから計算
    const currentWeek = new Date().toISOString().slice(0, 7).replace('-', '-W');

    return [
      {
        week: currentWeek,
        completedBadges: 2,
        progressGained: 45,
        pagesActive: 8,
      },
    ];
  }

  /**
   * ページメトリクスを取得
   */
  public getPageMetrics(pageName: string): PageMetrics | null {
    return this.pageMetrics.get(pageName) || null;
  }

  /**
   * 全ページメトリクスを取得
   */
  public getAllPageMetrics(): PageMetrics[] {
    return Array.from(this.pageMetrics.values());
  }

  /**
   * 同期イベント履歴を取得
   */
  public getSyncEvents(limit: number = 50): PageSyncEvent[] {
    return this.syncEvents.slice(-limit).reverse();
  }

  /**
   * ページ間の連携状況を取得
   */
  public getPageSyncStatus(): Record<
    string,
    {
      lastActivity: string;
      actionsToday: number;
      badgesProgressed: number;
      syncHealth: 'excellent' | 'good' | 'warning' | 'critical';
    }
  > {
    const status: Record<string, any> = {};

    Object.keys(this.pageDefinitions).forEach((pageName) => {
      const metrics = this.pageMetrics.get(pageName);
      const recentEvents = this.syncEvents.filter(
        (e) =>
          e.pageName === pageName &&
          new Date(e.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      status[pageName] = {
        lastActivity: metrics?.lastVisited || 'Never',
        actionsToday: recentEvents.length,
        badgesProgressed: recentEvents.reduce((sum, e) => sum + e.badgeImpact.length, 0),
        syncHealth: this.calculateSyncHealth(pageName, metrics, recentEvents),
      };
    });

    return status;
  }

  /**
   * 同期健全性を計算
   */
  private calculateSyncHealth(
    pageName: string,
    metrics: PageMetrics | undefined,
    recentEvents: PageSyncEvent[]
  ): 'excellent' | 'good' | 'warning' | 'critical' {
    if (!metrics || !metrics.lastVisited) {
      return 'critical';
    }

    const hoursSinceLastVisit =
      (Date.now() - new Date(metrics.lastVisited).getTime()) / (1000 * 60 * 60);
    const actionsToday = recentEvents.length;

    if (hoursSinceLastVisit < 1 && actionsToday > 5) {
      return 'excellent';
    }
    if (hoursSinceLastVisit < 6 && actionsToday > 2) {
      return 'good';
    }
    if (hoursSinceLastVisit < 24) {
      return 'warning';
    }
    return 'critical';
  }
}

export default UnifiedPageSyncService;
