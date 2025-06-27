import { ComprehensiveBadgeService } from '@/services/development/ComprehensiveBadgeService';
import { DevelopmentBadge, BadgeCategory } from '@/types/development-badges';
import { toast } from '@/components/ui/use-toast';

export interface PageBadgeSync {
  pageName: string;
  associatedCategories: BadgeCategory[];
  activityTriggers: string[];
  autoProgressEnabled: boolean;
  syncPriority: number;
  lastSync: string;
  pendingUpdates: number;
}

export interface BadgeActivityEvent {
  id: string;
  sourcePageName: string;
  targetPageNames: string[];
  badgeId: string;
  category: BadgeCategory;
  activityType: 'progress_update' | 'milestone_reached' | 'badge_completed' | 'new_activity';
  progressDelta: number;
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface CrossPageBadgeMetrics {
  totalBadges: number;
  completedBadges: number;
  inProgressBadges: number;
  completionRate: number;
  totalPoints: number;
  weeklyProgress: number;
  streakDays: number;
  activeCategories: number;
  topCategories: Array<{
    category: BadgeCategory;
    name: string;
    progress: number;
    badgeCount: number;
    completedCount: number;
  }>;
  recentAchievements: Array<{
    badgeId: string;
    name: string;
    category: BadgeCategory;
    completedAt: string;
    points: number;
  }>;
  upcomingMilestones: Array<{
    badgeId: string;
    name: string;
    progress: number;
    estimatedCompletion: string;
    daysRemaining: number;
  }>;
}

export interface PageSpecificBadgeData {
  pageName: string;
  relevantBadges: DevelopmentBadge[];
  categoryProgress: Record<BadgeCategory, number>;
  pageSpecificMetrics: Record<string, number>;
  quickActions: Array<{
    id: string;
    title: string;
    description: string;
    badgeId?: string;
    category?: BadgeCategory;
    action: () => void;
  }>;
  recommendations: string[];
}

/**
 * 🔄 包括的バッジ同期サービス
 * 全ページ間でのバッジ進捗・活動同期を管理
 */
class ComprehensiveBadgeSyncService {
  private static instance: ComprehensiveBadgeSyncService | null = null;
  private comprehensiveBadgeService: ComprehensiveBadgeService;
  private pageConfigurations: Map<string, PageBadgeSync> = new Map();
  private activeListeners: Map<string, Set<(data: PageSpecificBadgeData) => void>> = new Map();
  private syncQueue: BadgeActivityEvent[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private globalMetrics: CrossPageBadgeMetrics | null = null;

  // 全対象ページの設定
  private readonly PAGE_CONFIGURATIONS: Record<
    string,
    Omit<PageBadgeSync, 'pageName' | 'lastSync' | 'pendingUpdates'>
  > = {
    home: {
      associatedCategories: ['foundation', 'business', 'productivity', 'analytics'],
      activityTriggers: ['dashboard_visit', 'metric_review', 'overview_access'],
      autoProgressEnabled: true,
      syncPriority: 10,
    },
    'integrated-dashboard': {
      associatedCategories: ['analytics', 'monitoring', 'business', 'operations'],
      activityTriggers: ['metric_analysis', 'dashboard_interaction', 'data_visualization'],
      autoProgressEnabled: true,
      syncPriority: 9,
    },
    todos: {
      associatedCategories: ['productivity', 'project_management', 'systematization'],
      activityTriggers: ['task_completion', 'todo_management', 'productivity_tracking'],
      autoProgressEnabled: true,
      syncPriority: 8,
    },
    'automation-rules': {
      associatedCategories: ['automation', 'systematization', 'efficiency'],
      activityTriggers: ['rule_creation', 'automation_setup', 'workflow_optimization'],
      autoProgressEnabled: true,
      syncPriority: 8,
    },
    'development-badge-dashboard': {
      associatedCategories: ['foundation', 'testing', 'cicd', 'architecture'],
      activityTriggers: ['badge_review', 'progress_tracking', 'skill_assessment'],
      autoProgressEnabled: true,
      syncPriority: 9,
    },
    'badge-completion-prediction': {
      associatedCategories: ['analytics', 'ai_ml', 'planning'],
      activityTriggers: ['prediction_analysis', 'ai_insights', 'progress_forecasting'],
      autoProgressEnabled: true,
      syncPriority: 7,
    },
    'badge-showcase': {
      associatedCategories: ['achievement', 'social', 'presentation'],
      activityTriggers: ['badge_showcase', 'achievement_sharing', 'portfolio_review'],
      autoProgressEnabled: true,
      syncPriority: 6,
    },
    'wbs-creation': {
      associatedCategories: ['project_management', 'planning', 'systematization'],
      activityTriggers: ['wbs_creation', 'project_planning', 'task_breakdown'],
      autoProgressEnabled: true,
      syncPriority: 8,
    },
    'ai-wbs-generation': {
      associatedCategories: ['ai_ml', 'automation', 'project_management'],
      activityTriggers: ['ai_wbs_generation', 'intelligent_planning', 'automated_breakdown'],
      autoProgressEnabled: true,
      syncPriority: 7,
    },
    gamification: {
      associatedCategories: ['engagement', 'motivation', 'social'],
      activityTriggers: ['gamification_interaction', 'point_earning', 'achievement_unlocking'],
      autoProgressEnabled: true,
      syncPriority: 6,
    },
    'attendance-management': {
      associatedCategories: ['productivity', 'systematization', 'operations'],
      activityTriggers: ['time_tracking', 'attendance_logging', 'productivity_measurement'],
      autoProgressEnabled: true,
      syncPriority: 7,
    },
    reports: {
      associatedCategories: ['analytics', 'business', 'documentation'],
      activityTriggers: ['report_generation', 'data_analysis', 'insight_discovery'],
      autoProgressEnabled: true,
      syncPriority: 8,
    },
    'improvement-planning': {
      associatedCategories: ['planning', 'optimization', 'systematization'],
      activityTriggers: ['improvement_planning', 'optimization_strategy', 'enhancement_tracking'],
      autoProgressEnabled: true,
      syncPriority: 7,
    },
    'system-design': {
      associatedCategories: ['architecture', 'design', 'systematization'],
      activityTriggers: ['system_design', 'architecture_planning', 'design_documentation'],
      autoProgressEnabled: true,
      syncPriority: 8,
    },
    'admin-dashboard': {
      associatedCategories: ['management', 'operations', 'systematization'],
      activityTriggers: ['admin_operations', 'system_management', 'administrative_tasks'],
      autoProgressEnabled: true,
      syncPriority: 7,
    },
    'api-testing': {
      associatedCategories: ['testing', 'quality_assurance', 'automation'],
      activityTriggers: ['api_testing', 'quality_validation', 'test_automation'],
      autoProgressEnabled: true,
      syncPriority: 8,
    },
    'quality-dashboard': {
      associatedCategories: ['quality_assurance', 'monitoring', 'testing'],
      activityTriggers: ['quality_monitoring', 'metrics_review', 'quality_improvement'],
      autoProgressEnabled: true,
      syncPriority: 8,
    },
    'error-monitoring': {
      associatedCategories: ['monitoring', 'reliability', 'operations'],
      activityTriggers: ['error_tracking', 'incident_response', 'reliability_monitoring'],
      autoProgressEnabled: true,
      syncPriority: 9,
    },
    'performance-monitoring': {
      associatedCategories: ['performance', 'optimization', 'monitoring'],
      activityTriggers: ['performance_analysis', 'optimization_tracking', 'metrics_monitoring'],
      autoProgressEnabled: true,
      syncPriority: 8,
    },
    profile: {
      associatedCategories: ['personal', 'achievement', 'social'],
      activityTriggers: ['profile_update', 'achievement_review', 'personal_analytics'],
      autoProgressEnabled: true,
      syncPriority: 5,
    },
    settings: {
      associatedCategories: ['systematization', 'operations', 'customization'],
      activityTriggers: ['settings_configuration', 'system_customization', 'preference_setup'],
      autoProgressEnabled: true,
      syncPriority: 4,
    },
    'achievements-badges': {
      associatedCategories: ['achievement', 'social', 'presentation'],
      activityTriggers: ['achievement_tracking', 'badge_management', 'progress_celebration'],
      autoProgressEnabled: true,
      syncPriority: 7,
    },
  };

  private constructor() {
    this.comprehensiveBadgeService = ComprehensiveBadgeService.getInstance();
    this.initializePageConfigurations();
    this.startSyncService();
    console.log('🔄 包括的バッジ同期サービス初期化完了');
  }

  public static getInstance(): ComprehensiveBadgeSyncService {
    if (!ComprehensiveBadgeSyncService.instance) {
      ComprehensiveBadgeSyncService.instance = new ComprehensiveBadgeSyncService();
    }
    return ComprehensiveBadgeSyncService.instance;
  }

  /**
   * 🚀 ページ設定初期化
   */
  private initializePageConfigurations(): void {
    Object.entries(this.PAGE_CONFIGURATIONS).forEach(([pageName, config]) => {
      this.pageConfigurations.set(pageName, {
        pageName,
        ...config,
        lastSync: new Date().toISOString(),
        pendingUpdates: 0,
      });
    });
  }

  /**
   * 🔄 同期サービス開始
   */
  private startSyncService(): void {
    this.syncInterval = setInterval(() => {
      this.processSyncQueue();
      this.updateGlobalMetrics();
      this.notifyAllListeners();
    }, 5000); // 5秒ごとに同期処理
  }

  /**
   * 📊 グローバルメトリクス更新
   */
  private updateGlobalMetrics(): void {
    const stats = this.comprehensiveBadgeService.getBadgeStatistics();
    const allBadges = this.comprehensiveBadgeService.getAllBadges();

    this.globalMetrics = {
      totalBadges: stats.totalBadges,
      completedBadges: stats.completedBadges,
      inProgressBadges: stats.inProgressBadges,
      completionRate: stats.completionRate,
      totalPoints: stats.totalPoints,
      weeklyProgress: this.calculateWeeklyProgress(),
      streakDays: stats.streakCount || 0,
      activeCategories: Object.keys(stats.categoriesCompleted).length,
      topCategories: this.calculateTopCategories(stats),
      recentAchievements: this.formatRecentAchievements(stats.recentAchievements),
      upcomingMilestones: this.calculateUpcomingMilestones(allBadges),
    };
  }

  /**
   * 📈 週次進捗計算
   */
  private calculateWeeklyProgress(): number {
    const activities = this.comprehensiveBadgeService.getRecentActivities(50);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(
      (activity) => new Date(activity.timestamp) > weekAgo
    );

    return recentActivities.reduce((sum, activity) => sum + activity.progressContribution, 0);
  }

  /**
   * 🏆 トップカテゴリ計算
   */
  private calculateTopCategories(stats: any): CrossPageBadgeMetrics['topCategories'] {
    return stats.topCategories.map((category: any) => ({
      category: category.category,
      name: this.getCategoryName(category.category),
      progress: category.progress,
      badgeCount: this.getBadgeCountForCategory(category.category),
      completedCount: stats.categoriesCompleted[category.category] || 0,
    }));
  }

  /**
   * 🎖️ 最近の達成フォーマット
   */
  private formatRecentAchievements(
    achievements: DevelopmentBadge[]
  ): CrossPageBadgeMetrics['recentAchievements'] {
    return achievements.slice(0, 5).map((badge) => ({
      badgeId: badge.id,
      name: badge.name,
      category: badge.category,
      completedAt: badge.completedAt || new Date().toISOString(),
      points: badge.points || 0,
    }));
  }

  /**
   * 🎯 次のマイルストーン計算
   */
  private calculateUpcomingMilestones(
    badges: DevelopmentBadge[]
  ): CrossPageBadgeMetrics['upcomingMilestones'] {
    return badges
      .filter((badge) => !badge.isCompleted && badge.progress > 0)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5)
      .map((badge) => ({
        badgeId: badge.id,
        name: badge.name,
        progress: badge.progress,
        estimatedCompletion: this.calculateEstimatedCompletion(badge),
        daysRemaining: this.calculateDaysRemaining(badge),
      }));
  }

  /**
   * 📝 ページ専用データ生成
   */
  public getPageSpecificData(pageName: string): PageSpecificBadgeData {
    const config = this.pageConfigurations.get(pageName);
    const allBadges = this.comprehensiveBadgeService.getAllBadges();

    if (!config) {
      throw new Error(`Page configuration not found: ${pageName}`);
    }

    const relevantBadges = allBadges.filter((badge) =>
      config.associatedCategories.includes(badge.category)
    );

    const categoryProgress: Record<BadgeCategory, number> = {};
    config.associatedCategories.forEach((category) => {
      categoryProgress[category] = this.calculateCategoryProgress(category);
    });

    return {
      pageName,
      relevantBadges,
      categoryProgress,
      pageSpecificMetrics: this.generatePageSpecificMetrics(pageName),
      quickActions: this.generateQuickActions(pageName, relevantBadges),
      recommendations: this.generatePageRecommendations(pageName, relevantBadges),
    };
  }

  /**
   * 🔔 ページリスナー登録
   */
  public registerPageListener(
    pageName: string,
    listener: (data: PageSpecificBadgeData) => void
  ): void {
    if (!this.activeListeners.has(pageName)) {
      this.activeListeners.set(pageName, new Set());
    }
    this.activeListeners.get(pageName)!.add(listener);
  }

  /**
   * 📢 アクティビティ記録・同期
   */
  public async recordPageActivity(
    pageName: string,
    activityType: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const config = this.pageConfigurations.get(pageName);
    if (!config || !config.autoProgressEnabled) return;

    // 関連カテゴリの進捗を自動更新
    for (const category of config.associatedCategories) {
      await this.comprehensiveBadgeService.recordActivity(activityType, category, 1, {
        ...metadata,
        source: 'page_activity',
        page: pageName,
      });
    }

    // ページの同期情報を更新
    config.lastSync = new Date().toISOString();
    config.pendingUpdates = 0;

    this.notifyPageListeners(pageName);
  }

  /**
   * 📊 グローバルメトリクス取得
   */
  public getGlobalMetrics(): CrossPageBadgeMetrics | null {
    return this.globalMetrics;
  }

  /**
   * 🔄 全リスナーに通知
   */
  private notifyAllListeners(): void {
    this.activeListeners.forEach((listeners, pageName) => {
      this.notifyPageListeners(pageName);
    });
  }

  /**
   * 📢 ページリスナーに通知
   */
  private notifyPageListeners(pageName: string): void {
    const listeners = this.activeListeners.get(pageName);
    if (!listeners) return;

    try {
      const pageData = this.getPageSpecificData(pageName);
      listeners.forEach((listener) => {
        try {
          listener(pageData);
        } catch (error) {
          console.error(`Error notifying listener for page ${pageName}:`, error);
        }
      });
    } catch (error) {
      console.error(`Error generating page data for ${pageName}:`, error);
    }
  }

  /**
   * 🔄 同期キュー処理
   */
  private processSyncQueue(): void {
    while (this.syncQueue.length > 0) {
      const event = this.syncQueue.shift();
      if (event) {
        this.processActivityEvent(event);
      }
    }
  }

  /**
   * ⚡ アクティビティイベント処理
   */
  private processActivityEvent(event: BadgeActivityEvent): void {
    event.targetPageNames.forEach((targetPage) => {
      const config = this.pageConfigurations.get(targetPage);
      if (config) {
        config.pendingUpdates++;
      }
    });
  }

  // ヘルパーメソッド
  private getCategoryName(category: BadgeCategory): string {
    const categoryNames: Record<BadgeCategory, string> = {
      foundation: '技術基盤',
      cicd: 'CI/CD・DevOps',
      business: 'ビジネス・経営',
      analytics: '分析・データ',
      ai_ml: 'AI・機械学習',
      productivity: '生産性向上',
      // 他のカテゴリも必要に応じて追加
    } as any;

    return categoryNames[category] || category;
  }

  private getBadgeCountForCategory(category: BadgeCategory): number {
    return this.comprehensiveBadgeService
      .getAllBadges()
      .filter((badge) => badge.category === category).length;
  }

  private calculateCategoryProgress(category: BadgeCategory): number {
    const badges = this.comprehensiveBadgeService
      .getAllBadges()
      .filter((badge) => badge.category === category);

    if (badges.length === 0) return 0;

    const totalProgress = badges.reduce((sum, badge) => sum + badge.progress, 0);
    return totalProgress / badges.length;
  }

  private generatePageSpecificMetrics(pageName: string): Record<string, number> {
    return {
      pageVisits: Math.floor(Math.random() * 100),
      avgTimeSpent: Math.floor(Math.random() * 300),
      completionRate: Math.random() * 100,
      engagementScore: Math.random() * 100,
    };
  }

  private generateQuickActions(
    pageName: string,
    badges: DevelopmentBadge[]
  ): PageSpecificBadgeData['quickActions'] {
    return [
      {
        id: 'view-progress',
        title: '進捗確認',
        description: '現在の進捗状況を確認',
        action: () => console.log('Progress viewed'),
      },
      {
        id: 'sync-data',
        title: 'データ同期',
        description: '最新データに同期',
        action: () => this.updateGlobalMetrics(),
      },
    ];
  }

  private generatePageRecommendations(pageName: string, badges: DevelopmentBadge[]): string[] {
    return [
      `${pageName}での活動を継続してバッジ進捗を向上させましょう`,
      '関連する他のページも活用することで、より多くのバッジを獲得できます',
      '定期的な進捗確認で目標達成を加速しましょう',
    ];
  }

  private calculateEstimatedCompletion(badge: DevelopmentBadge): string {
    const daysRemaining = this.calculateDaysRemaining(badge);
    const completionDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);
    return completionDate.toISOString().split('T')[0];
  }

  private calculateDaysRemaining(badge: DevelopmentBadge): number {
    const remainingProgress = 100 - badge.progress;
    const estimatedDaysPerPercent = 1; // 1%あたり1日と仮定
    return Math.ceil(remainingProgress * estimatedDaysPerPercent);
  }

  /**
   * 🛑 サービス終了・クリーンアップ
   */
  public cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.activeListeners.clear();
    this.syncQueue.length = 0;
    console.log('🔄 包括的バッジ同期サービス終了');
  }
}

export default ComprehensiveBadgeSyncService;
