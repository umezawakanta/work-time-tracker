import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  TrendingUp,
  Users,
  Calendar,
  BookOpen,
  Award,
  ChevronRight,
  Star,
  Clock,
  CheckCircle2,
  BarChart3,
  Zap,
  Trophy,
  Rocket,
  Activity,
  Brain,
  Globe,
  Shield,
  Wrench,
  Lightbulb,
} from 'lucide-react';
import {
  comprehensiveBadgeService,
  BadgeStatistics,
  BadgeProgress,
  PageSyncData,
} from '@/services/development/ComprehensiveBadgeService';
import { DevelopmentBadge, BadgeCategory } from '@/types/development-badges';
import {
  EXPANDED_BADGES_DATABASE,
  getBadgeStatsSummary,
} from '@/services/development/ExpandedBadgesDatabase';

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

export const IntegratedDashboard: React.FC = () => {
  const [badgeStats, setBadgeStats] = useState<BadgeStatistics | null>(null);
  const [integratedMetrics, setIntegratedMetrics] = useState<IntegratedMetrics | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month' | 'year'>(
    'week'
  );
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<Record<string, 'synced' | 'syncing' | 'error'>>({});

  useEffect(() => {
    initializeDashboard();
    setupPageSync();
  }, []);

  useEffect(() => {
    updateMetrics();
  }, [selectedTimeRange]);

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
          categories: stats.topCategories,
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
          items: stats.recentAchievements.slice(0, 5),
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
        comprehensiveBadgeService.recordActivity({
          badgeId: update.badgeId,
          activity: update.activity,
          progressContribution: update.progressContribution,
          source: 'automatic',
          metadata: { page: pageName, ...update.metadata },
        });
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
                        {widget.data.blockers.map((blocker: string, index: number) => (
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
          <p className="text-muted-foreground mt-2">全体の進捗とパフォーマンスを一元管理</p>
        </div>

        <div className="flex items-center gap-4">
          {/* 同期ステータス */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Object.entries(syncStatus).map(([page, status]) => (
                <div
                  key={page}
                  className={`w-2 h-2 rounded-full ${
                    status === 'synced'
                      ? 'bg-green-500'
                      : status === 'syncing'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-red-500'
                  }`}
                  title={`${page}: ${status}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">同期状態</span>
          </div>

          {/* 時間範囲選択 */}
          <Tabs
            value={selectedTimeRange}
            onValueChange={(value) => setSelectedTimeRange(value as any)}
          >
            <TabsList>
              <TabsTrigger value="day">日</TabsTrigger>
              <TabsTrigger value="week">週</TabsTrigger>
              <TabsTrigger value="month">月</TabsTrigger>
              <TabsTrigger value="year">年</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* メインメトリクス */}
      {integratedMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総合生産性</p>
                  <p className="text-2xl font-bold text-primary">
                    {integratedMetrics.totalProductivity}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">週間進捗</p>
                  <p className="text-2xl font-bold text-green-600">
                    {integratedMetrics.weeklyProgress}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">進行中プロジェクト</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {integratedMetrics.activeProjects}
                  </p>
                </div>
                <Rocket className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">イノベーションスコア</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {integratedMetrics.innovationScore}
                  </p>
                </div>
                <Lightbulb className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ダッシュボードウィジェット */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.sort((a, b) => a.priority - b.priority).map((widget) => renderWidget(widget))}
      </div>

      {/* クイックアクション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            クイックアクション - ページ統合ナビゲーション
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => (window.location.href = '/')}
            >
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">ホーム</span>
              <span className="text-xs text-muted-foreground">メインダッシュボード</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300"
              onClick={() => (window.location.href = '/todos')}
            >
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">ToDo管理</span>
              <span className="text-xs text-muted-foreground">タスク・進捗管理</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
              onClick={() => (window.location.href = '/badges')}
            >
              <Trophy className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">バッジショーケース</span>
              <span className="text-xs text-muted-foreground">全バッジ・進捗確認</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-300"
              onClick={() => (window.location.href = '/wbs')}
            >
              <BarChart3 className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium">WBS作成</span>
              <span className="text-xs text-muted-foreground">プロジェクト分解</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-yellow-50 hover:border-yellow-300"
              onClick={() => (window.location.href = '/gamification')}
            >
              <Star className="w-6 h-6 text-yellow-600" />
              <span className="text-sm font-medium">ゲーミフィケーション</span>
              <span className="text-xs text-muted-foreground">ポイント・報酬</span>
            </Button>
          </div>

          {/* 第二段のアクション */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-red-50 hover:border-red-300"
              onClick={() => (window.location.href = '/attendance')}
            >
              <Clock className="w-6 h-6 text-red-600" />
              <span className="text-sm font-medium">勤怠管理</span>
              <span className="text-xs text-muted-foreground">時間・効率追跡</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-teal-50 hover:border-teal-300"
              onClick={() => (window.location.href = '/ai-wbs')}
            >
              <Brain className="w-6 h-6 text-teal-600" />
              <span className="text-sm font-medium">AI WBS生成</span>
              <span className="text-xs text-muted-foreground">AI支援プロジェクト</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-indigo-50 hover:border-indigo-300"
              onClick={() => (window.location.href = '/badge-prediction')}
            >
              <Target className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium">バッジ完了予測</span>
              <span className="text-xs text-muted-foreground">進捗予測・計画</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-pink-50 hover:border-pink-300"
              onClick={() => (window.location.href = '/career-planning')}
            >
              <Users className="w-6 h-6 text-pink-600" />
              <span className="text-sm font-medium">キャリア計画</span>
              <span className="text-xs text-muted-foreground">スキル・成長戦略</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-cyan-50 hover:border-cyan-300"
              onClick={() => (window.location.href = '/analytics')}
            >
              <TrendingUp className="w-6 h-6 text-cyan-600" />
              <span className="text-sm font-medium">分析レポート</span>
              <span className="text-xs text-muted-foreground">詳細分析・洞察</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ページ連携ステータス */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            ページ連携ステータス
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(syncStatus).map(([page, status]) => (
              <div key={page} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status === 'synced'
                      ? 'bg-green-500'
                      : status === 'syncing'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-red-500'
                  }`}
                />
                <span className="text-sm capitalize">{page}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            🔄 リアルタイム同期: {Object.values(syncStatus).filter((s) => s === 'synced').length}/
            {Object.keys(syncStatus).length} ページ同期済み
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegratedDashboard;
