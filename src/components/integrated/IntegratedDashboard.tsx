import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Rocket,
  Star,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Zap,
  Award,
  Wrench,
  Lightbulb,
  AlertTriangle,
  Network,
  Navigation,
  Code,
  Shield,
  Globe,
  Calendar,
} from 'lucide-react';
import {
  DevelopmentBadge,
  getCompletedBadges,
  getBadgesByCategory,
  getBadgeStatsSummary,
  getAvailableBadges,
  getInProgressBadges,
} from '@/services/development/ExpandedBadgesDatabase';
import { EXPANDED_BADGES_DATABASE } from '@/services/development/ExpandedBadgesDatabase';
import { BadgeCategory } from '@/types/development-badges';
import comprehensiveBadgeService from '@/services/development/ComprehensiveBadgeService';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'progress' | 'activity';
  data: any;
  size: 'sm' | 'md' | 'lg' | 'xl';
  priority: number;
}

interface IntegratedMetrics {
  totalProductivity: number;
  weeklyProgress: number;
  activeProjects: number;
  completedTasks: number;
  badgeProgress: number;
  learningStreak: number;
  teamCollaboration: number;
  innovationScore: number;
}

interface RealtimeSyncStatus {
  isConnected: boolean;
  lastSync: string;
  syncedPages: number;
  totalPages: number;
  conflicts: number;
  averageResponseTime: number;
  successRate: number;
}

interface DetailedBadgeProgress {
  categoryProgress: Record<string, number>;
  recentAchievements: Array<{
    id: string;
    name: string;
    achievedAt: string;
    points: number;
  }>;
  upcomingMilestones: Array<{
    id: string;
    name: string;
    progress: number;
    estimatedCompletion: string;
  }>;
  weeklyProgress: Array<{
    week: string;
    completed: number;
    points: number;
  }>;
}

interface PageSyncData {
  pageName: string;
  lastUpdated: string;
  badgeUpdates: Array<{
    badgeId: string;
    activity: string;
    progressContribution: number;
    metadata?: Record<string, any>;
  }>;
  progressChanges: Record<string, number>;
  completedActions: string[];
  metrics: Record<string, number>;
}

interface BadgeStatistics {
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

export const IntegratedDashboard: React.FC = () => {
  const [badgeStats, setBadgeStats] = useState<BadgeStatistics | null>(null);
  const [integratedMetrics, setIntegratedMetrics] = useState<IntegratedMetrics | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month' | 'year'>(
    'week'
  );
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<RealtimeSyncStatus>({
    isConnected: true,
    lastSync: new Date().toISOString(),
    syncedPages: 28,
    totalPages: 30,
    conflicts: 0,
    averageResponseTime: 145,
    successRate: 99.2,
  });
  const [detailedBadgeProgress, setDetailedBadgeProgress] = useState<DetailedBadgeProgress>({
    categoryProgress: {
      'CI/CD・DevOps': 75,
      'ビジネス・経営': 45,
      'マーケティング・営業': 38,
      '財務・法務': 22,
      'AI・機械学習': 85,
      セキュリティ: 67,
      '文化・芸術': 30,
      '哲学・学術': 25,
    },
    recentAchievements: [
      {
        id: 'gamification-designer',
        name: 'ゲーミフィケーションデザイナー',
        achievedAt: '2024-01-12T16:45:00Z',
        points: 750,
      },
      {
        id: 'skill-mapper',
        name: 'スキルマッパー',
        achievedAt: '2024-01-15T10:30:00Z',
        points: 700,
      },
    ],
    upcomingMilestones: [
      {
        id: 'ai-integration-pioneer',
        name: 'AI統合パイオニア',
        progress: 72,
        estimatedCompletion: '2024-02-15',
      },
      {
        id: 'accessibility-champion',
        name: 'アクセシビリティチャンピオン',
        progress: 87,
        estimatedCompletion: '2024-01-28',
      },
    ],
    weeklyProgress: [
      { week: '2024-W01', completed: 2, points: 450 },
      { week: '2024-W02', completed: 1, points: 750 },
      { week: '2024-W03', completed: 3, points: 1200 },
    ],
  });

  useEffect(() => {
    initializeDashboard();
    setupPageSync();
    setupUnifiedPageSync();
  }, []);

  useEffect(() => {
    updateMetrics();
  }, [selectedTimeRange]);

  useEffect(() => {
    // リアルタイム同期状況の監視
    const syncInterval = setInterval(() => {
      // PageSyncServiceが実装されていない場合のモックデータを使用
      const mockSyncStats = {
        lastHealthCheck: new Date().toISOString(),
        syncedPages: 28,
        totalPages: 30,
        conflictsCount: 0,
        averageResponseTime: 145,
        successRate: 99.2,
      };

      setSyncStatus({
        isConnected: true,
        lastSync: mockSyncStats.lastHealthCheck,
        syncedPages: mockSyncStats.syncedPages,
        totalPages: mockSyncStats.totalPages,
        conflicts: mockSyncStats.conflictsCount,
        averageResponseTime: mockSyncStats.averageResponseTime,
        successRate: mockSyncStats.successRate,
      });
    }, 5000); // 5秒ごと

    return () => clearInterval(syncInterval);
  }, []);

  /**
   * 🔄 ページ間連携シミュレーション
   */
  const simulatePageIntegration = () => {
    // ページ間の連携をシミュレーション
    const pageUpdates = [
      { page: 'todos', metric: 'completedTasks', value: 45 },
      { page: 'wbs-creation', metric: 'activeProjects', value: 12 },
      { page: 'gamification', metric: 'totalPoints', value: 2450 },
      { page: 'attendance', metric: 'workHours', value: 42 },
    ];

    pageUpdates.forEach((update) => {
      setSyncStatus((prev) => ({ ...prev, [update.page]: 'synced' }));
    });

    console.log('🔄 ページ間連携シミュレーション完了');
  };

  /**
   * 🚀 ダッシュボード初期化
   */
  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // 拡張バッジデータベースから統計取得
      const expandedStats = getBadgeStatsSummary();

      // 従来のバッジ統計と統合
      const baseStats = comprehensiveBadgeService.getBadgeStatistics();
      const nextBadge = EXPANDED_BADGES_DATABASE.find((b) => !b.isCompleted && b.progress > 0);

      const stats = {
        ...baseStats,
        totalBadges: expandedStats.totalBadges,
        completedBadges: expandedStats.completedBadges,
        inProgressBadges: expandedStats.inProgressBadges,
        availableBadges: expandedStats.availableBadges,
        completionRate: expandedStats.completionRate,
        totalPoints: expandedStats.totalPoints,
        recentAchievements: EXPANDED_BADGES_DATABASE.filter((b) => b.isCompleted).slice(0, 5),
        topCategories: Object.entries(expandedStats.categoryBreakdown)
          .map(([category, count]) => ({
            category: category as BadgeCategory,
            progress: (count / Math.max(1, expandedStats.completedBadges)) * 100,
          }))
          .slice(0, 8),
        nextMilestone: nextBadge
          ? {
              badge: nextBadge,
              daysToCompletion: 7,
              blockers: ['要件定義未完了', 'テストケース不足'],
            }
          : null,
      };

      setBadgeStats(stats);

      // 統合メトリクスの計算
      const metrics = calculateIntegratedMetrics(stats);
      setIntegratedMetrics(metrics);

      // ウィジェットの生成
      const dashboardWidgets = generateDashboardWidgets(stats, metrics);
      setWidgets(dashboardWidgets);

      // ページ間連携のシミュレーション
      simulatePageIntegration();

      setLoading(false);
    } catch (error) {
      console.error('ダッシュボード初期化エラー:', error);
      setLoading(false);
    }
  };

  /**
   * 🔄 ページ同期設定
   */
  const setupPageSync = () => {
    const pages = [
      'home',
      'todos',
      'badge-dashboard',
      'wbs-creation',
      'gamification',
      'attendance',
    ];

    pages.forEach((page) => {
      setSyncStatus((prev) => ({ ...prev, [page]: 'syncing' }));

      comprehensiveBadgeService.registerPageSyncListener(page, (data: PageSyncData) => {
        setSyncStatus((prev) => ({ ...prev, [page]: 'synced' }));
        handlePageDataUpdate(page, data);
      });
    });
  };

  /**
   * 🔗 統合ページ同期設定
   */
  const setupUnifiedPageSync = () => {
    // 全ページの定義と連携設定
    const unifiedPages = [
      'home',
      'integrated-dashboard',
      'todos',
      'automation-rules',
      'development-badges',
      'badge-prediction',
      'badge-showcase',
      'wbs-creation',
      'ai-wbs-generation',
      'gamification',
      'attendance-management',
      'reports',
      'improvement-planning',
      'system-design',
      'admin-dashboard',
      'api-testing',
      'quality-dashboard',
      'error-monitoring',
      'performance-monitoring',
      'profile',
      'settings',
      'achievements',
    ];

    // 各ページのアクティビティを監視
    unifiedPages.forEach((pageName) => {
      // ページ訪問を記録
      recordPageActivity(pageName, 'page_visit');

      // ページ固有のメトリクスを初期化
      initializePageMetrics(pageName);
    });

    // リアルタイム同期設定
    setupRealtimeSync();
  };

  /**
   * 📊 ページアクティビティ記録
   */
  const recordPageActivity = (
    pageName: string,
    activityType: string,
    metadata?: Record<string, any>
  ) => {
    const timestamp = new Date().toISOString();

    // バッジ進捗への影響を計算
    const badgeImpacts = calculatePageBadgeImpact(pageName, activityType);

    // 統合メトリクスを更新
    updateIntegratedMetrics(pageName, activityType, badgeImpacts);

    console.log(`📊 ${pageName}: ${activityType}`, { badgeImpacts, metadata });
  };

  /**
   * 🎯 ページ別バッジ影響計算
   */
  const calculatePageBadgeImpact = (pageName: string, activityType: string) => {
    const pageCategories: Record<string, string[]> = {
      home: ['business', 'analytics', 'management'],
      'integrated-dashboard': ['analytics', 'monitoring', 'business'],
      todos: ['business', 'project_management', 'systematization'],
      'automation-rules': ['automation', 'systematization'],
      'development-badges': ['foundation', 'testing', 'cicd'],
      'badge-prediction': ['analytics', 'ai_ml', 'planning'],
      'badge-showcase': ['achievement', 'social'],
      'wbs-creation': ['project_management', 'planning'],
      'ai-wbs-generation': ['ai_ml', 'automation'],
      gamification: ['engagement', 'motivation'],
      'attendance-management': ['business', 'operations'],
      reports: ['analytics', 'business', 'documentation'],
      'improvement-planning': ['planning', 'optimization'],
      'system-design': ['architecture', 'design'],
      'admin-dashboard': ['management', 'operations'],
      'api-testing': ['testing', 'quality_assurance'],
      'quality-dashboard': ['quality_assurance', 'monitoring'],
      'error-monitoring': ['monitoring', 'reliability'],
      'performance-monitoring': ['performance', 'optimization'],
      profile: ['personal', 'achievement'],
      settings: ['systematization', 'operations'],
      achievements: ['achievement', 'progress'],
    };

    const relevantCategories = pageCategories[pageName] || [];
    const impacts: Array<{ badgeId: string; progressDelta: number; reason: string }> = [];

    EXPANDED_BADGES_DATABASE.forEach((badge) => {
      if (badge.isCompleted || !relevantCategories.includes(badge.category)) return;

      let progressDelta = 0;
      let reason = '';

      // アクティビティタイプに基づいてポイント計算
      switch (activityType) {
        case 'page_visit':
          progressDelta = 0.5;
          reason = `${pageName}への訪問`;
          break;
        case 'task_completion':
          if (badge.category === 'business') {
            progressDelta = 2;
            reason = 'タスク完了';
          }
          break;
        case 'automation_setup':
          if (badge.category === 'automation') {
            progressDelta = 5;
            reason = '自動化設定';
          }
          break;
        case 'badge_review':
          if (badge.category === 'foundation') {
            progressDelta = 1;
            reason = 'バッジレビュー';
          }
          break;
        case 'report_creation':
          if (badge.category === 'analytics') {
            progressDelta = 3;
            reason = 'レポート作成';
          }
          break;
        case 'test_execution':
          if (badge.category === 'testing') {
            progressDelta = 4;
            reason = 'テスト実行';
          }
          break;
        case 'monitoring_setup':
          if (badge.category === 'monitoring') {
            progressDelta = 3;
            reason = '監視設定';
          }
          break;
        default:
          progressDelta = 1;
          reason = `${pageName}でのアクティビティ`;
      }

      if (progressDelta > 0) {
        impacts.push({ badgeId: badge.id, progressDelta, reason });
      }
    });

    return impacts;
  };

  /**
   * 🔄 統合メトリクス更新
   */
  const updateIntegratedMetrics = (
    pageName: string,
    activityType: string,
    badgeImpacts: Array<{ badgeId: string; progressDelta: number; reason: string }>
  ) => {
    // バッジ進捗を実際に更新
    badgeImpacts.forEach((impact) => {
      const badge = EXPANDED_BADGES_DATABASE.find((b) => b.id === impact.badgeId);
      if (badge) {
        const newProgress = Math.min(100, badge.progress + impact.progressDelta);
        badge.progress = newProgress;

        if (newProgress >= 100 && !badge.isCompleted) {
          badge.isCompleted = true;
          badge.completedAt = new Date().toISOString();

          // バッジ完了通知
          showBadgeCompletionNotification(badge);
        }
      }
    });

    // 統合メトリクスを再計算
    updateMetrics();
  };

  /**
   * 🎉 バッジ完了通知
   */
  const showBadgeCompletionNotification = (badge: DevelopmentBadge) => {
    console.log(`🏆 バッジ完了: ${badge.name}`);
    console.log(`📊 獲得ポイント: ${badge.points}pt`);

    // 実際の通知システムに統合する場合はここで実装
    // toast.success(`🏆 ${badge.name} を獲得しました！`);
  };

  /**
   * 📊 ページメトリクス初期化
   */
  const initializePageMetrics = (pageName: string) => {
    // ページ固有のメトリクスを設定
    const pageMetrics = {
      lastVisited: new Date().toISOString(),
      visitCount: 1,
      actionsCompleted: 0,
      badgeProgress: {},
      relevantBadges: EXPANDED_BADGES_DATABASE.filter((badge) => {
        const pageCategories: Record<string, string[]> = {
          todos: ['business', 'project_management'],
          'development-badges': ['foundation', 'testing', 'cicd'],
          reports: ['analytics', 'business'],
          'api-testing': ['testing', 'quality_assurance'],
          'error-monitoring': ['monitoring', 'reliability'],
        };
        const categories = pageCategories[pageName] || [];
        return categories.includes(badge.category);
      }).length,
    };

    console.log(`📊 ${pageName} メトリクス初期化:`, pageMetrics);
  };

  /**
   * ⚡ リアルタイム同期設定
   */
  const setupRealtimeSync = () => {
    // ページ間のリアルタイム同期を設定
    const syncInterval = setInterval(() => {
      // 全ページの状態を同期
      updateAllPageStates();

      // バッジ進捗の変更を検出して通知
      detectBadgeProgressChanges();

      // 統合ダッシュボードの状態更新
      updateDashboardState();
    }, 3000); // 3秒ごとに同期

    return () => clearInterval(syncInterval);
  };

  /**
   * 🔄 全ページ状態更新
   */
  const updateAllPageStates = () => {
    setSyncStatus((prev) => ({
      ...prev,
      lastGlobalSync: new Date().toISOString(),
      syncedPages: Math.min(prev.totalPages, prev.syncedPages + 1),
      successRate: Math.min(100, prev.successRate + 0.1),
    }));
  };

  /**
   * 🎯 バッジ進捗変更検出
   */
  const detectBadgeProgressChanges = () => {
    const recentlyUpdatedBadges = EXPANDED_BADGES_DATABASE.filter((badge) => {
      const lastUpdate = badge.completedAt || '2024-01-01';
      const timeDiff = Date.now() - new Date(lastUpdate).getTime();
      return timeDiff < 60000; // 1分以内に更新されたバッジ
    });

    if (recentlyUpdatedBadges.length > 0) {
      setDetailedBadgeProgress((prev) => ({
        ...prev,
        recentAchievements: recentlyUpdatedBadges.slice(0, 5).map((badge) => ({
          id: badge.id,
          name: badge.name,
          achievedAt: badge.completedAt || new Date().toISOString(),
          points: badge.points || 0,
        })),
      }));
    }
  };

  /**
   * 📊 ダッシュボード状態更新
   */
  const updateDashboardState = () => {
    const stats = comprehensiveBadgeService.getBadgeStatistics();
    const expandedStats = getBadgeStatsSummary();

    setIntegratedMetrics({
      totalProductivity: Math.round(
        expandedStats.completionRate * 0.8 + (stats.streakCount || 0) * 2
      ),
      weeklyProgress: Math.round(
        expandedStats.completionRate * 0.6 + (expandedStats.totalPoints / 100) * 0.4
      ),
      activeProjects: expandedStats.inProgressBadges,
      completedTasks: expandedStats.completedBadges,
      badgeProgress: Math.round(expandedStats.completionRate),
      learningStreak: stats.streakCount || 0,
      teamCollaboration: 85,
      innovationScore: Math.round(
        (expandedStats.totalPoints / (expandedStats.totalBadges * 100)) * 100
      ),
    });
  };

  /**
   * 📊 統合メトリクス計算
   */
  const calculateIntegratedMetrics = (stats: BadgeStatistics): IntegratedMetrics => {
    return {
      totalProductivity: Math.round(stats.completionRate * 0.8 + stats.streakCount * 2),
      weeklyProgress: Math.round(stats.completionRate * 0.6 + (stats.totalPoints / 100) * 0.4),
      activeProjects: stats.inProgressBadges,
      completedTasks: stats.completedBadges,
      badgeProgress: Math.round(stats.completionRate),
      learningStreak: stats.streakCount,
      teamCollaboration: 85, // 実装時は実際のデータから計算
      innovationScore: Math.round((stats.totalPoints / (stats.totalBadges * 100)) * 100),
    };
  };

  /**
   * 🎨 ダッシュボードウィジェット生成
   */
  const generateDashboardWidgets = (
    stats: BadgeStatistics,
    metrics: IntegratedMetrics
  ): DashboardWidget[] => {
    return [
      {
        id: 'overall-progress',
        title: '全体進捗',
        type: 'metric',
        data: {
          value: `${stats.completionRate.toFixed(1)}%`,
          change: '+5.2%',
          trend: 'up',
          icon: TrendingUp,
          color: 'text-green-600',
        },
        size: 'md',
        priority: 1,
      },
      {
        id: 'completed-badges',
        title: '獲得バッジ',
        type: 'metric',
        data: {
          value: stats.completedBadges,
          total: stats.totalBadges,
          icon: Trophy,
          color: 'text-yellow-600',
        },
        size: 'md',
        priority: 2,
      },
      {
        id: 'learning-streak',
        title: '学習連続記録',
        type: 'metric',
        data: {
          value: `${stats.streakCount}日`,
          icon: Zap,
          color: 'text-orange-600',
        },
        size: 'sm',
        priority: 3,
      },
      {
        id: 'total-points',
        title: '獲得ポイント',
        type: 'metric',
        data: {
          value: stats.totalPoints.toLocaleString(),
          icon: Star,
          color: 'text-purple-600',
        },
        size: 'sm',
        priority: 4,
      },
      {
        id: 'category-progress',
        title: 'カテゴリ別進捗',
        type: 'chart',
        data: {
          categories: stats.topCategories || [],
          type: 'horizontal-bar',
        },
        size: 'lg',
        priority: 5,
      },
      {
        id: 'recent-achievements',
        title: '最近の達成',
        type: 'list',
        data: {
          items: (stats.recentAchievements || []).slice(0, 5),
          type: 'badges',
        },
        size: 'md',
        priority: 6,
      },
      {
        id: 'next-milestone',
        title: '次のマイルストーン',
        type: 'progress',
        data: stats.nextMilestone,
        size: 'lg',
        priority: 7,
      },
    ];
  };

  /**
   * 📈 メトリクス更新
   */
  const updateMetrics = () => {
    const stats = comprehensiveBadgeService.getBadgeStatistics();
    setBadgeStats(stats);

    const metrics = calculateIntegratedMetrics(stats);
    setIntegratedMetrics(metrics);

    const updatedWidgets = generateDashboardWidgets(stats, metrics);
    setWidgets(updatedWidgets);
  };

  /**
   * 🔄 ページデータ更新処理
   */
  const handlePageDataUpdate = (pageName: string, data: PageSyncData) => {
    console.log(`ページデータ更新: ${pageName}`, data);

    // バッジ進捗の自動更新
    if (data.badgeUpdates.length > 0) {
      data.badgeUpdates.forEach((update) => {
        comprehensiveBadgeService.recordActivity(
          update.activity,
          'page_activity',
          update.progressContribution,
          {
            badgeId: update.badgeId,
            source: 'automatic',
            page: pageName,
            ...update.metadata,
          }
        );
      });

      // メトリクス再計算
      updateMetrics();
    }
  };

  /**
   * 🎨 カテゴリアイコン取得
   */
  const getCategoryIcon = (category: BadgeCategory) => {
    const iconMap: Record<string, React.ElementType> = {
      foundation: Shield,
      features: Wrench,
      ui_ux: Lightbulb,
      performance: Zap,
      testing: CheckCircle2,
      automation: Rocket,
      community: Users,
      ai_ml: Brain,
      internationalization: Globe,
      entrepreneurship: Target,
      agile: Activity,
      design: Star,
      devops: Wrench,
      skill_mapping: BarChart3,
    };

    return iconMap[category] || Trophy;
  };

  /**
   * 🎨 ウィジェットレンダリング
   */
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'metric':
        return (
          <Card key={widget.id} className={`${getWidgetSize(widget.size)}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{widget.title}</p>
                  <p className={`text-2xl font-bold ${widget.data.color || 'text-primary'}`}>
                    {widget.data.value}
                    {widget.data.total && (
                      <span className="text-lg text-muted-foreground">/{widget.data.total}</span>
                    )}
                  </p>
                  {widget.data.change && (
                    <p
                      className={`text-sm ${widget.data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {widget.data.change}
                    </p>
                  )}
                </div>
                {widget.data.icon && (
                  <widget.data.icon className={`w-8 h-8 ${widget.data.color || 'text-primary'}`} />
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'chart':
        return (
          <Card key={widget.id} className={`${getWidgetSize(widget.size)}`}>
            <CardHeader>
              <CardTitle>{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.data.categories?.map((category: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {React.createElement(getCategoryIcon(category.category), {
                          className: 'w-4 h-4',
                        })}
                        {category.category}
                      </span>
                      <span>{category.progress?.toFixed(1) || 0}%</span>
                    </div>
                    <Progress value={category.progress || 0} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'list':
        return (
          <Card key={widget.id} className={`${getWidgetSize(widget.size)}`}>
            <CardHeader>
              <CardTitle>{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.data.items?.map((item: DevelopmentBadge, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'progress':
        return (
          <Card key={widget.id} className={`${getWidgetSize(widget.size)}`}>
            <CardHeader>
              <CardTitle>{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {widget.data ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{widget.data.badge.icon}</span>
                      <div>
                        <p className="font-semibold">{widget.data.badge.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {widget.data.badge.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{widget.data.badge.difficulty}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>進捗</span>
                      <span>{widget.data.badge.progress}%</span>
                    </div>
                    <Progress value={widget.data.badge.progress} className="h-2" />
                  </div>

                  {widget.data.daysToCompletion > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>あと{widget.data.daysToCompletion}日で完了予定</span>
                    </div>
                  )}

                  {widget.data.blockers?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-600">ブロッカー:</p>
                      <ul className="text-xs space-y-1">
                        {(widget.data.blockers || []).map((blocker: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                            {blocker}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">次のマイルストーンを設定してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  /**
   * 📏 ウィジェットサイズ取得
   */
  const getWidgetSize = (size: string) => {
    switch (size) {
      case 'sm':
        return 'col-span-1';
      case 'md':
        return 'col-span-1 md:col-span-2';
      case 'lg':
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'xl':
        return 'col-span-1 md:col-span-2 lg:col-span-4';
      default:
        return 'col-span-1';
    }
  };

  /**
   * 🔄 同期ステータス表示
   */
  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'text-green-600';
      case 'syncing':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">統合ダッシュボードを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">統合ダッシュボード</h1>
          <p className="text-muted-foreground mt-2">
            全システムの状況とバッジ進捗をリアルタイムで監視
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                syncStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {syncStatus.isConnected ? 'リアルタイム同期中' : '接続エラー'}
            </span>
          </div>
        </div>
      </div>

      {/* リアルタイム同期ステータス */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            ページ同期ステータス
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">同期済みページ</p>
                <p className="text-lg font-semibold">
                  {syncStatus.syncedPages}/{syncStatus.totalPages}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均応答時間</p>
                <p className="text-lg font-semibold">{syncStatus.averageResponseTime}ms</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">成功率</p>
                <p className="text-lg font-semibold">{syncStatus.successRate}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  syncStatus.conflicts > 0 ? 'bg-red-100' : 'bg-gray-100'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 ${
                    syncStatus.conflicts > 0 ? 'text-red-600' : 'text-gray-600'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">競合</p>
                <p className="text-lg font-semibold">{syncStatus.conflicts}</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>ページ同期進捗</span>
              <span>{Math.round((syncStatus.syncedPages / syncStatus.totalPages) * 100)}%</span>
            </div>
            <Progress
              value={(syncStatus.syncedPages / syncStatus.totalPages) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* バッジ進捗詳細 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* カテゴリ別進捗 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              カテゴリ別バッジ進捗
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(detailedBadgeProgress.categoryProgress).map(([category, progress]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category}</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 直近の達成と次のマイルストーン */}
        <div className="space-y-6">
          {/* 最近の達成 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                最近の達成
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(detailedBadgeProgress.recentAchievements || []).map((achievement) => (
                <div key={achievement.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(achievement.achievedAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">+{achievement.points}pt</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 次のマイルストーン */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                次のマイルストーン
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(detailedBadgeProgress.upcomingMilestones || []).map((milestone) => (
                <div key={milestone.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{milestone.name}</span>
                    <span className="text-muted-foreground">{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    予定完了: {new Date(milestone.estimatedCompletion).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 週次進捗グラフ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            週次バッジ獲得推移
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(detailedBadgeProgress.weeklyProgress || []).map((week) => (
              <div key={week.week} className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{week.week}</p>
                <p className="text-2xl font-bold text-primary">{week.completed}</p>
                <p className="text-xs text-muted-foreground">バッジ</p>
                <p className="text-sm font-medium">+{week.points}pt</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* アクションセンター */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            今すぐできること
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span className="font-medium">開発バッジを進める</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                CI/CDパイプラインマスターまで残り43%
              </span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">チーム協働を強化</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                WBS作成で協働スキルを向上
              </span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="font-medium">アナリティクスを確認</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                週次レポートで進捗を分析
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ページナビゲーション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            クイックナビゲーション
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: 'TODO管理', path: '/todos', icon: '✅' },
              { name: 'バッジ', path: '/development-badges', icon: '🏆' },
              { name: 'WBS作成', path: '/wbs', icon: '📋' },
              { name: '時間管理', path: '/time-tracking', icon: '⏰' },
              { name: 'レポート', path: '/reports', icon: '📊' },
              { name: '設定', path: '/settings', icon: '⚙️' },
              { name: 'API テスト', path: '/api-test', icon: '🔧' },
              { name: '品質', path: '/quality', icon: '✨' },
              { name: 'エラー監視', path: '/errors', icon: '🚨' },
              { name: 'パフォーマンス', path: '/performance', icon: '⚡' },
              { name: 'チーム', path: '/team', icon: '👥' },
              { name: 'ドキュメント', path: '/docs', icon: '📚' },
            ].map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-center font-medium">{item.name}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegratedDashboard;
