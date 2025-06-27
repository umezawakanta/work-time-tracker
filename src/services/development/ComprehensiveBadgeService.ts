import { toast } from '@/components/ui/use-toast';
import { DevelopmentBadge, BadgeCategory, BadgeRequirement } from '@/types/development-badges';
import { getBadgeStatsByCategory, findNextAchievableBadge } from '@/types/development-badges';

export interface BadgeProgress {
  badgeId: string;
  currentProgress: number;
  targetProgress: number;
  progressPercentage: number;
  estimatedCompletionDays: number;
  recentActivities: BadgeActivity[];
  blockers: string[];
  recommendations: string[];
}

export interface BadgeActivity {
  id: string;
  badgeId: string;
  activity: string;
  timestamp: string;
  progressContribution: number;
  source: 'manual' | 'automatic' | 'system';
  metadata?: Record<string, any>;
}

export interface BadgeStatistics {
  totalBadges: number;
  completedBadges: number;
  inProgressBadges: number;
  availableBadges: number;
  completionRate: number;
  averageCompletionTime: number;
  categoriesCompleted: Record<BadgeCategory, number>;
  recentAchievements: DevelopmentBadge[];
  topCategories: Array<{ category: BadgeCategory; progress: number }>;
  streakCount: number;
  totalPoints: number;
  nextMilestone: {
    badge: DevelopmentBadge;
    daysToCompletion: number;
    blockers: string[];
  } | null;
}

export interface PageSyncData {
  pageName: string;
  lastUpdated: string;
  badgeUpdates: BadgeActivity[];
  progressChanges: Record<string, number>;
  completedActions: string[];
  metrics: Record<string, number>;
}

export interface BadgePrediction {
  badgeId: string;
  predictedCompletionDate: string;
  confidenceLevel: number; // 0-100
  requiredDailyProgress: number;
  currentVelocity: number;
  factors: {
    historical: number;
    current: number;
    trend: number;
    complexity: number;
  };
  recommendations: string[];
  risksAndMitigations: Array<{
    risk: string;
    probability: number;
    impact: string;
    mitigation: string;
  }>;
}

/**
 * 🏆 包括的バッジサービス - 全ページ統合管理システム
 */
class ComprehensiveBadgeService {
  private static instance: ComprehensiveBadgeService | null = null;
  private badges: Map<string, DevelopmentBadge> = new Map();
  private badgeProgress: Map<string, BadgeProgress> = new Map();
  private activities: BadgeActivity[] = [];
  private pageData: Map<string, PageSyncData> = new Map();
  private syncListeners: Map<string, (data: PageSyncData) => void> = new Map();
  private autoProgressTracking: boolean = true;
  private progressUpdateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeBadgeSystem();
    this.startAutoProgressTracking();
    console.log('🏆 包括的バッジサービス初期化完了');
  }

  public static getInstance(): ComprehensiveBadgeService {
    if (!ComprehensiveBadgeService.instance) {
      ComprehensiveBadgeService.instance = new ComprehensiveBadgeService();
    }
    return ComprehensiveBadgeService.instance;
  }

  /**
   * 🚀 バッジシステム初期化
   */
  private initializeBadgeSystem(): void {
    this.loadInitialBadgeData();
    this.initializePageSyncData();
    this.calculateAllBadgeProgress();
    console.log('🏆 バッジシステム初期化:', this.badges.size, 'バッジ');
  }

  /**
   * 📊 初期バッジデータ読み込み
   */
  private loadInitialBadgeData(): void {
    const initialBadges: DevelopmentBadge[] = [
      {
        id: 'skill-mapper',
        name: 'スキルマッパー',
        description: '包括的なスキルマップを作成し、チーム能力を可視化',
        category: 'skill_mapping',
        difficulty: 'gold',
        icon: '🗺️',
        requirements: [
          {
            type: 'feature_complete',
            target: 100,
            description: 'スキル評価システムの実装',
            progress: 100,
            isCompleted: true,
          },
        ],
        isUnlocked: true,
        progress: 100,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        points: 500,
      },
    ];

    initialBadges.forEach((badge) => {
      this.badges.set(badge.id, badge);
    });
  }

  /**
   * 📄 ページ同期データ初期化
   */
  private initializePageSyncData(): void {
    const pages = [
      'home',
      'dashboard',
      'todos',
      'badge-dashboard',
      'badge-prediction',
      'badge-showcase',
      'wbs-creation',
      'ai-wbs-generation',
      'gamification',
      'attendance',
    ];

    pages.forEach((page) => {
      this.pageData.set(page, {
        pageName: page,
        lastUpdated: new Date().toISOString(),
        badgeUpdates: [],
        progressChanges: {},
        completedActions: [],
        metrics: {},
      });
    });
  }

  /**
   * 📊 全バッジ進捗計算
   */
  private calculateAllBadgeProgress(): void {
    this.badges.forEach((badge, badgeId) => {
      const progress = this.calculateBadgeProgress(badge);
      this.badgeProgress.set(badgeId, progress);
    });
  }

  /**
   * 📈 個別バッジ進捗計算
   */
  private calculateBadgeProgress(badge: DevelopmentBadge): BadgeProgress {
    const totalRequirements = badge.requirements.length;
    const progressSum = badge.requirements.reduce((sum, req) => sum + (req.progress || 0), 0);

    const currentProgress = progressSum / totalRequirements;
    const targetProgress = 100;
    const progressPercentage = (currentProgress / targetProgress) * 100;

    const recentActivities = this.activities
      .filter((activity) => activity.badgeId === badge.id)
      .slice(-10);

    const averageDailyProgress = this.calculateAverageDailyProgress(recentActivities);
    const remainingProgress = targetProgress - currentProgress;
    const estimatedCompletionDays =
      averageDailyProgress > 0 ? Math.ceil(remainingProgress / averageDailyProgress) : -1;

    const blockers = this.identifyBlockers(badge);
    const recommendations = this.generateRecommendations(badge);

    return {
      badgeId: badge.id,
      currentProgress,
      targetProgress,
      progressPercentage,
      estimatedCompletionDays,
      recentActivities,
      blockers,
      recommendations,
    };
  }

  private calculateAverageDailyProgress(activities: BadgeActivity[]): number {
    if (activities.length === 0) return 0;
    const totalProgress = activities.reduce(
      (sum, activity) => sum + activity.progressContribution,
      0
    );
    return totalProgress / Math.max(1, activities.length);
  }

  private identifyBlockers(badge: DevelopmentBadge): string[] {
    const blockers: string[] = [];

    if (badge.prerequisites) {
      const unmetPrerequisites = badge.prerequisites.filter((prereqId) => {
        const prereqBadge = this.badges.get(prereqId);
        return !prereqBadge?.isCompleted;
      });

      if (unmetPrerequisites.length > 0) {
        blockers.push(`未完了の前提条件: ${unmetPrerequisites.join(', ')}`);
      }
    }

    return blockers;
  }

  private generateRecommendations(badge: DevelopmentBadge): string[] {
    const recommendations: string[] = [];

    const incompleteRequirements = badge.requirements.filter((req) => !req.isCompleted);
    if (incompleteRequirements.length > 0) {
      const nextRequirement = incompleteRequirements[0];
      recommendations.push(`次に取り組むべき: ${nextRequirement.description}`);
    }

    return recommendations;
  }

  /**
   * 🔄 自動進捗追跡開始
   */
  private startAutoProgressTracking(): void {
    if (this.progressUpdateInterval) return;

    this.progressUpdateInterval = setInterval(
      () => {
        this.updateAllProgress();
        this.syncPageData();
      },
      5 * 60 * 1000
    ); // 5分ごと

    console.log('🔄 自動進捗追跡開始');
  }

  private updateAllProgress(): void {
    this.badges.forEach((badge, badgeId) => {
      const progress = this.calculateBadgeProgress(badge);
      this.badgeProgress.set(badgeId, progress);

      if (progress.progressPercentage >= 100 && !badge.isCompleted) {
        this.completeBadge(badgeId);
      }
    });
  }

  private completeBadge(badgeId: string): void {
    const badge = this.badges.get(badgeId);
    if (!badge) return;

    badge.isCompleted = true;
    badge.completedAt = new Date().toISOString();
    badge.progress = 100;

    toast({
      title: '🏆 バッジ完了！',
      description: `${badge.name} を獲得しました！`,
      variant: 'default',
    });

    console.log('🏆 バッジ完了:', badge.name);
  }

  private syncPageData(): void {
    this.pageData.forEach((data, pageName) => {
      data.lastUpdated = new Date().toISOString();

      const listener = this.syncListeners.get(pageName);
      if (listener) {
        listener(data);
      }
    });
  }

  /**
   * 📝 活動記録
   */
  public recordActivity(activityData: Omit<BadgeActivity, 'id' | 'timestamp'>): void {
    const activity: BadgeActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...activityData,
    };

    this.activities.push(activity);

    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(-1000);
    }
  }

  /**
   * 📊 統計取得
   */
  public getBadgeStatistics(): BadgeStatistics {
    const allBadges = Array.from(this.badges.values());
    const completedBadges = allBadges.filter((b) => b.isCompleted);
    const inProgressBadges = allBadges.filter((b) => !b.isCompleted && b.progress > 0);
    const availableBadges = allBadges.filter((b) => !b.isCompleted && b.progress === 0);

    return {
      totalBadges: allBadges.length,
      completedBadges: completedBadges.length,
      inProgressBadges: inProgressBadges.length,
      availableBadges: availableBadges.length,
      completionRate: (completedBadges.length / allBadges.length) * 100,
      averageCompletionTime: 30,
      categoriesCompleted: {} as Record<BadgeCategory, number>,
      recentAchievements: completedBadges.slice(0, 5),
      topCategories: [],
      streakCount: 0,
      totalPoints: completedBadges.reduce((sum, b) => sum + (b.points || 0), 0),
      nextMilestone: null,
    };
  }

  // 外部API
  public registerPageSyncListener(pageName: string, listener: (data: PageSyncData) => void): void {
    this.syncListeners.set(pageName, listener);
  }

  public getPageSyncData(pageName: string): PageSyncData | undefined {
    return this.pageData.get(pageName);
  }

  public getAllBadges(): DevelopmentBadge[] {
    return Array.from(this.badges.values());
  }

  public getBadge(badgeId: string): DevelopmentBadge | undefined {
    return this.badges.get(badgeId);
  }

  public getBadgeProgress(badgeId: string): BadgeProgress | undefined {
    return this.badgeProgress.get(badgeId);
  }

  public getRecentActivities(limit: number = 20): BadgeActivity[] {
    return this.activities.slice(-limit).reverse();
  }

  public cleanup(): void {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
      this.progressUpdateInterval = null;
    }
    this.syncListeners.clear();
    console.log('🧹 包括的バッジサービス クリーンアップ完了');
  }
}

export const comprehensiveBadgeService = ComprehensiveBadgeService.getInstance();
