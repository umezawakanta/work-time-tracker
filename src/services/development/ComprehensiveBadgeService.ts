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
 * 🏆 包括的バッジサービス - 全カテゴリ対応の進捗管理
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
  private activityLog: ActivityRecord[] = [];
  private categoryMetrics: Map<string, CategoryMetrics> = new Map();
  private autoTracking: boolean = true;
  private progressInterval: NodeJS.Timeout | null = null;

  // 拡張されたカテゴリ情報
  private readonly CATEGORY_CONFIG = {
    // 技術系
    cicd: {
      name: 'CI/CD・DevOps',
      trackingWeight: 1.8,
      autoProgressTriggers: ['commit', 'deploy', 'pipeline', 'test'],
      skillAreas: ['continuous integration', 'deployment', 'automation', 'monitoring'],
      prerequisites: ['foundation'],
    },
    deployment: {
      name: 'デプロイ・ホスティング',
      trackingWeight: 1.6,
      autoProgressTriggers: ['deploy', 'hosting', 'server', 'cloud'],
      skillAreas: ['deployment strategies', 'hosting platforms', 'server management'],
      prerequisites: ['cicd'],
    },
    virtualization: {
      name: '仮想化・コンテナ',
      trackingWeight: 2.0,
      autoProgressTriggers: ['docker', 'kubernetes', 'container', 'vm'],
      skillAreas: ['containerization', 'orchestration', 'virtual machines'],
      prerequisites: ['infrastructure'],
    },
    infrastructure: {
      name: 'インフラ・クラウド',
      trackingWeight: 2.2,
      autoProgressTriggers: ['aws', 'azure', 'gcp', 'terraform', 'ansible'],
      skillAreas: ['cloud architecture', 'infrastructure as code', 'networking'],
      prerequisites: ['foundation'],
    },

    // ビジネス系
    business: {
      name: 'ビジネス・経営',
      trackingWeight: 1.3,
      autoProgressTriggers: ['strategy', 'planning', 'analysis', 'management'],
      skillAreas: ['strategic planning', 'business analysis', 'operations'],
      prerequisites: [],
    },
    marketing: {
      name: 'マーケティング・営業',
      trackingWeight: 1.4,
      autoProgressTriggers: ['campaign', 'analytics', 'seo', 'social'],
      skillAreas: ['digital marketing', 'content strategy', 'customer acquisition'],
      prerequisites: ['business'],
    },
    entrepreneurship: {
      name: '起業・投資',
      trackingWeight: 2.5,
      autoProgressTriggers: ['startup', 'pitch', 'funding', 'business model'],
      skillAreas: ['venture creation', 'fundraising', 'business development'],
      prerequisites: ['business', 'finance'],
    },

    // 財務・法務系
    finance: {
      name: '財務・会計・税務',
      trackingWeight: 1.7,
      autoProgressTriggers: ['accounting', 'budget', 'finance', 'tax'],
      skillAreas: ['financial analysis', 'budgeting', 'tax planning'],
      prerequisites: ['business'],
    },
    legal: {
      name: '法務・コンプライアンス',
      trackingWeight: 2.3,
      autoProgressTriggers: ['compliance', 'contract', 'legal', 'regulation'],
      skillAreas: ['regulatory compliance', 'contract law', 'corporate governance'],
      prerequisites: ['business'],
    },

    // 人事・労務系
    hr: {
      name: '労務・人事',
      trackingWeight: 1.5,
      autoProgressTriggers: ['hr', 'recruitment', 'performance', 'training'],
      skillAreas: ['talent management', 'organizational development', 'compensation'],
      prerequisites: ['business'],
    },

    // 文化・芸術系
    art: {
      name: '芸術・創作',
      trackingWeight: 1.2,
      autoProgressTriggers: ['design', 'creative', 'art', 'visual'],
      skillAreas: ['digital art', 'creative design', 'visual communication'],
      prerequisites: [],
    },
    publishing: {
      name: '出版・編集',
      trackingWeight: 1.6,
      autoProgressTriggers: ['writing', 'editing', 'publishing', 'content'],
      skillAreas: ['content creation', 'editorial workflow', 'publishing'],
      prerequisites: ['linguistics'],
    },

    // 学術・研究系
    philosophy: {
      name: '哲学・学術',
      trackingWeight: 3.0,
      autoProgressTriggers: ['philosophy', 'ethics', 'research', 'theory'],
      skillAreas: ['philosophical analysis', 'ethical reasoning', 'critical thinking'],
      prerequisites: [],
    },
    linguistics: {
      name: '語学・言語学',
      trackingWeight: 1.8,
      autoProgressTriggers: ['language', 'translation', 'multilingual', 'i18n'],
      skillAreas: ['multilingual communication', 'translation', 'localization'],
      prerequisites: [],
    },

    // 社会貢献系
    social_contribution: {
      name: '社会貢献・ESG',
      trackingWeight: 1.4,
      autoProgressTriggers: ['sustainability', 'social', 'environment', 'esg'],
      skillAreas: ['sustainability practices', 'social impact', 'environmental responsibility'],
      prerequisites: [],
    },
    sustainability: {
      name: '持続可能性・環境',
      trackingWeight: 1.9,
      autoProgressTriggers: ['green', 'carbon', 'renewable', 'circular'],
      skillAreas: ['environmental management', 'carbon footprint', 'circular economy'],
      prerequisites: ['social_contribution'],
    },

    // AI・先端技術系
    ai_ml: {
      name: 'AI・機械学習',
      trackingWeight: 2.8,
      autoProgressTriggers: ['ai', 'ml', 'neural', 'model', 'algorithm'],
      skillAreas: ['machine learning', 'neural networks', 'data science'],
      prerequisites: ['foundation', 'testing'],
    },
    cybersecurity: {
      name: 'サイバーセキュリティ',
      trackingWeight: 2.4,
      autoProgressTriggers: ['security', 'encryption', 'vulnerability', 'audit'],
      skillAreas: ['threat analysis', 'security architecture', 'incident response'],
      prerequisites: ['infrastructure'],
    },
  };

  private constructor() {
    this.initializeBadgeSystem();
    this.startAutoProgressTracking();
    this.initializeCategoryMetrics();
    this.startAutoTracking();
    console.log(
      '🏆 Comprehensive Badge Service initialized with',
      Object.keys(this.CATEGORY_CONFIG).length,
      'categories'
    );
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

  /**
   * 📊 カテゴリメトリクス初期化
   */
  private initializeCategoryMetrics(): void {
    Object.entries(this.CATEGORY_CONFIG).forEach(([category, config]) => {
      this.categoryMetrics.set(category, {
        totalActivities: 0,
        progressContributions: 0,
        lastActivity: null,
        averageImpact: 0,
        trendDirection: 'stable',
        velocityScore: 0,
        difficultyAdjustment: 1.0,
        marketRelevance: this.calculateMarketRelevance(category),
        learningSources: [],
        milestoneAchievements: [],
      });
    });
  }

  /**
   * 📈 市場関連性計算
   */
  private calculateMarketRelevance(category: string): number {
    const highDemandCategories = ['ai_ml', 'cybersecurity', 'cicd', 'infrastructure'];
    const mediumDemandCategories = ['marketing', 'finance', 'hr', 'sustainability'];

    if (highDemandCategories.includes(category)) return 0.9;
    if (mediumDemandCategories.includes(category)) return 0.7;
    return 0.5;
  }

  /**
   * 🎯 アクティビティ記録（カテゴリ別最適化）
   */
  async recordActivity(
    activity: string,
    category: string,
    impact: number = 1,
    metadata?: any
  ): Promise<void> {
    const config = this.CATEGORY_CONFIG[category];
    if (!config) {
      console.warn(`Unknown category: ${category}`);
      return;
    }

    // カテゴリ固有の重み付け適用
    const adjustedImpact = impact * config.trackingWeight;

    const record: ActivityRecord = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activity,
      category,
      impact: adjustedImpact,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        categoryConfig: config.name,
        skillAreas: config.skillAreas,
        autoTracked: this.isAutoTrackedActivity(activity, config.autoProgressTriggers),
      },
    };

    this.activityLog.push(record);
    await this.updateCategoryMetrics(category, record);
    await this.updateBadgeProgress(category, adjustedImpact);

    // カテゴリ間の相互作用を処理
    await this.handleCategoryInteractions(category, adjustedImpact);

    console.log(
      `📝 Activity recorded: ${activity} (${category}) - Impact: ${adjustedImpact.toFixed(2)}`
    );
  }

  /**
   * 🔗 カテゴリ間相互作用処理
   */
  private async handleCategoryInteractions(primaryCategory: string, impact: number): Promise<void> {
    const config = this.CATEGORY_CONFIG[primaryCategory];
    if (!config || !config.prerequisites) return;

    // 前提条件カテゴリにも影響を与える
    for (const prerequisite of config.prerequisites) {
      const spilloverImpact = impact * 0.3; // 30%の影響
      await this.updateBadgeProgress(prerequisite, spilloverImpact);
      console.log(`🔗 Spillover effect: ${prerequisite} +${spilloverImpact.toFixed(2)}`);
    }

    // 関連カテゴリの発見と相互強化
    const relatedCategories = this.findRelatedCategories(primaryCategory);
    for (const related of relatedCategories) {
      const synergyImpact = impact * 0.15; // 15%のシナジー効果
      await this.updateBadgeProgress(related, synergyImpact);
    }
  }

  /**
   * 🔍 関連カテゴリ発見
   */
  private findRelatedCategories(category: string): string[] {
    const synergies = {
      cicd: ['deployment', 'testing', 'monitoring'],
      ai_ml: ['analytics', 'data_science', 'automation'],
      marketing: ['analytics', 'content', 'social'],
      finance: ['business', 'legal', 'taxation'],
      philosophy: ['ethics', 'research', 'critical_thinking'],
      sustainability: ['social_contribution', 'economics', 'policy'],
    };

    return synergies[category] || [];
  }

  /**
   * 📊 カテゴリメトリクス更新
   */
  private async updateCategoryMetrics(category: string, record: ActivityRecord): Promise<void> {
    const metrics = this.categoryMetrics.get(category);
    if (!metrics) return;

    metrics.totalActivities++;
    metrics.progressContributions += record.impact;
    metrics.lastActivity = record.timestamp;

    // 平均影響度更新
    metrics.averageImpact = metrics.progressContributions / metrics.totalActivities;

    // 速度スコア計算
    metrics.velocityScore = this.calculateVelocityScore(category);

    // トレンド方向分析
    metrics.trendDirection = this.analyzeTrendDirection(category);

    this.categoryMetrics.set(category, metrics);
  }

  /**
   * ⚡ 速度スコア計算
   */
  private calculateVelocityScore(category: string): number {
    const recentActivities = this.activityLog.filter((a) => a.category === category).slice(-10); // 直近10件

    if (recentActivities.length === 0) return 0;

    const totalImpact = recentActivities.reduce((sum, a) => sum + a.impact, 0);
    const timeSpan = this.getTimeSpanHours(
      recentActivities[0].timestamp,
      recentActivities[recentActivities.length - 1].timestamp
    );

    return timeSpan > 0 ? totalImpact / timeSpan : 0;
  }

  /**
   * 📈 トレンド方向分析
   */
  private analyzeTrendDirection(category: string): 'accelerating' | 'stable' | 'decelerating' {
    const activities = this.activityLog.filter((a) => a.category === category).slice(-20); // 直近20件

    if (activities.length < 10) return 'stable';

    const firstHalf = activities.slice(0, 10);
    const secondHalf = activities.slice(10);

    const firstAvg = firstHalf.reduce((sum, a) => sum + a.impact, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, a) => sum + a.impact, 0) / secondHalf.length;

    const changeRate = (secondAvg - firstAvg) / firstAvg;

    if (changeRate > 0.2) return 'accelerating';
    if (changeRate < -0.2) return 'decelerating';
    return 'stable';
  }

  /**
   * 📊 カテゴリ別統計取得
   */
  getCategoryStatistics(): CategoryStatistics {
    const categories = Object.keys(this.CATEGORY_CONFIG).map((category) => {
      const metrics = this.categoryMetrics.get(category) || {
        totalActivities: 0,
        progressContributions: 0,
        lastActivity: null,
        averageImpact: 0,
        trendDirection: 'stable' as const,
        velocityScore: 0,
        difficultyAdjustment: 1.0,
        marketRelevance: 0.5,
        learningSources: [],
        milestoneAchievements: [],
      };

      return {
        category,
        name: this.CATEGORY_CONFIG[category].name,
        metrics,
        config: this.CATEGORY_CONFIG[category],
      };
    });

    return {
      categories,
      totalCategories: categories.length,
      activeCategories: categories.filter((c) => c.metrics.totalActivities > 0).length,
      topPerformingCategory: categories.reduce((top, current) =>
        current.metrics.velocityScore > top.metrics.velocityScore ? current : top
      ),
      overallProgress: this.calculateOverallProgress(),
      crossCategoryInsights: this.generateCrossCategoryInsights(),
    };
  }

  /**
   * 🎯 全体進捗計算
   */
  private calculateOverallProgress(): number {
    const allBadges = this.getAllBadges();
    if (allBadges.length === 0) return 0;

    const totalProgress = allBadges.reduce((sum, badge) => sum + badge.progress, 0);
    return totalProgress / allBadges.length;
  }

  /**
   * 💡 カテゴリ横断的洞察生成
   */
  private generateCrossCategoryInsights(): string[] {
    const insights = [];
    const stats = this.categoryMetrics;

    // 最も活発なカテゴリ
    let mostActive = '';
    let maxActivities = 0;
    stats.forEach((metrics, category) => {
      if (metrics.totalActivities > maxActivities) {
        maxActivities = metrics.totalActivities;
        mostActive = category;
      }
    });

    if (mostActive) {
      insights.push(
        `最も活発: ${this.CATEGORY_CONFIG[mostActive]?.name || mostActive} (${maxActivities}件の活動)`
      );
    }

    // 成長傾向のカテゴリ
    const acceleratingCategories = Array.from(stats.entries())
      .filter(([_, metrics]) => metrics.trendDirection === 'accelerating')
      .map(([category, _]) => this.CATEGORY_CONFIG[category]?.name || category);

    if (acceleratingCategories.length > 0) {
      insights.push(`成長中: ${acceleratingCategories.join(', ')}`);
    }

    // 市場価値の高いカテゴリでの進捗
    const highValueProgress = Array.from(stats.entries())
      .filter(
        ([category, metrics]) =>
          this.CATEGORY_CONFIG[category] &&
          metrics.marketRelevance > 0.8 &&
          metrics.totalActivities > 5
      )
      .map(([category, _]) => this.CATEGORY_CONFIG[category]?.name || category);

    if (highValueProgress.length > 0) {
      insights.push(`高市場価値分野で進捗: ${highValueProgress.join(', ')}`);
    }

    return insights;
  }

  // ヘルパーメソッド
  private isAutoTrackedActivity(activity: string, triggers: string[]): boolean {
    return triggers.some((trigger) => activity.toLowerCase().includes(trigger.toLowerCase()));
  }

  private async updateBadgeProgress(category: string, impact: number): Promise<void> {
    // バッジ進捗更新のロジック（簡略化）
    console.log(`Updating badge progress for category: ${category}, impact: ${impact}`);
  }

  private getTimeSpanHours(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  private startAutoTracking(): void {
    console.log('Auto tracking started');
  }
}

// 必要な型定義
interface ActivityRecord {
  id: string;
  activity: string;
  category: string;
  impact: number;
  timestamp: string;
  metadata?: any;
}

interface CategoryMetrics {
  totalActivities: number;
  progressContributions: number;
  lastActivity: string | null;
  averageImpact: number;
  trendDirection: 'accelerating' | 'stable' | 'decelerating';
  velocityScore: number;
  difficultyAdjustment: number;
  marketRelevance: number;
  learningSources: string[];
  milestoneAchievements: string[];
}

interface CategoryStatistics {
  categories: Array<{
    category: string;
    name: string;
    metrics: CategoryMetrics;
    config: any;
  }>;
  totalCategories: number;
  activeCategories: number;
  topPerformingCategory: any;
  overallProgress: number;
  crossCategoryInsights: string[];
}

// シングルトンインスタンスのエクスポート
export const comprehensiveBadgeService = ComprehensiveBadgeService.getInstance();
export default comprehensiveBadgeService;
