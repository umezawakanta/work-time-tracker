import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Code,
  FileText,
  GitBranch,
  HomeIcon,
  Lightbulb,
  MonitorSpeaker,
  Network,
  Rocket,
  Settings,
  Star,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Wrench,
  Zap,
  AlertTriangle,
  Calendar,
  Globe,
  Shield,
  Database,
  Cloud,
  Cpu,
  Smartphone,
  Briefcase,
  DollarSign,
  Scale,
  UserCheck,
  Palette,
  Book,
  TreePine,
  Bot,
  Lock,
  Heart,
  Languages,
  PenTool,
  Microscope,
  Sync,
  RefreshCw,
} from 'lucide-react';
import { useHomeBadgeSync } from '@/hooks/useComprehensiveBadgeSync';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  category: string;
  priority: number;
  status: 'active' | 'completed' | 'locked';
  badgeCategory?: string;
}

export const EnhancedHome: React.FC = () => {
  const { pageData, globalMetrics, isLoading, error, recordActivity, refreshData, syncStatus } =
    useHomeBadgeSync();

  const [quickActions] = useState<QuickAction[]>([
    {
      id: 'dashboard',
      title: '統合ダッシュボード',
      description: 'リアルタイム監視・分析',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/dashboard',
      color: '#3B82F6',
      category: 'analytics',
      priority: 10,
      status: 'active',
      badgeCategory: 'analytics',
    },
    {
      id: 'todos',
      title: 'TODO管理',
      description: 'タスク・進捗管理',
      icon: <CheckCircle2 className="w-6 h-6" />,
      path: '/todos',
      color: '#10B981',
      category: 'productivity',
      priority: 9,
      status: 'active',
      badgeCategory: 'productivity',
    },
    {
      id: 'automation-rules',
      title: '自動化ルール',
      description: 'ワークフロー自動化',
      icon: <Settings className="w-6 h-6" />,
      path: '/automation-rules',
      color: '#8B5CF6',
      category: 'automation',
      priority: 8,
      status: 'active',
      badgeCategory: 'automation',
    },
    {
      id: 'development-badge-dashboard',
      title: '開発バッジダッシュボード',
      description: '技術スキル進捗追跡',
      icon: <Code className="w-6 h-6" />,
      path: '/development-badge-dashboard',
      color: '#EF4444',
      category: 'development',
      priority: 9,
      status: 'active',
      badgeCategory: 'foundation',
    },
    {
      id: 'badge-completion-prediction',
      title: 'バッジ完了予測',
      description: 'AI駆動の進捗予測',
      icon: <Brain className="w-6 h-6" />,
      path: '/badge-prediction',
      color: '#8B5CF6',
      category: 'analytics',
      priority: 8,
      status: 'active',
      badgeCategory: 'ai_ml',
    },
    {
      id: 'badge-showcase',
      title: 'バッジショーケース',
      description: '全バッジ・進捗確認',
      icon: <Trophy className="w-6 h-6" />,
      path: '/badge-showcase',
      color: '#F59E0B',
      category: 'achievements',
      priority: 8,
      status: 'active',
      badgeCategory: 'achievement',
    },
    {
      id: 'wbs-creation',
      title: 'WBS作成',
      description: 'プロジェクト分解・計画',
      icon: <FileText className="w-6 h-6" />,
      path: '/wbs',
      color: '#EF4444',
      category: 'planning',
      priority: 7,
      status: 'active',
      badgeCategory: 'project_management',
    },
    {
      id: 'ai-wbs-generation',
      title: 'AI WBS生成',
      description: 'AI支援プロジェクト計画',
      icon: <Bot className="w-6 h-6" />,
      path: '/ai-wbs',
      color: '#06B6D4',
      category: 'ai',
      priority: 7,
      status: 'active',
      badgeCategory: 'ai_ml',
    },
    {
      id: 'gamification',
      title: 'ゲーミフィケーション',
      description: 'ポイント・報酬システム',
      icon: <Star className="w-6 h-6" />,
      path: '/gamification',
      color: '#F97316',
      category: 'engagement',
      priority: 6,
      status: 'active',
      badgeCategory: 'engagement',
    },
    {
      id: 'attendance-management',
      title: '勤怠管理',
      description: '時間・効率追跡',
      icon: <Clock className="w-6 h-6" />,
      path: '/time-tracking',
      color: '#DC2626',
      category: 'productivity',
      priority: 6,
      status: 'active',
      badgeCategory: 'productivity',
    },
    {
      id: 'reports',
      title: 'レポート',
      description: '詳細分析・洞察',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/reports',
      color: '#0891B2',
      category: 'analytics',
      priority: 5,
      status: 'active',
      badgeCategory: 'analytics',
    },
    {
      id: 'improvement-planning',
      title: '改善計画',
      description: '継続的改善管理',
      icon: <TrendingUp className="w-6 h-6" />,
      path: '/improvement-planning',
      color: '#059669',
      category: 'optimization',
      priority: 5,
      status: 'active',
      badgeCategory: 'planning',
    },
    {
      id: 'system-design',
      title: 'システム設計',
      description: 'アーキテクチャ・設計',
      icon: <Database className="w-6 h-6" />,
      path: '/system-design',
      color: '#7C3AED',
      category: 'architecture',
      priority: 5,
      status: 'active',
      badgeCategory: 'architecture',
    },
    {
      id: 'admin-dashboard',
      title: '管理ダッシュボード',
      description: 'システム管理・運用',
      icon: <UserCheck className="w-6 h-6" />,
      path: '/admin',
      color: '#DC2626',
      category: 'administration',
      priority: 4,
      status: 'active',
      badgeCategory: 'management',
    },
    {
      id: 'api-testing',
      title: 'APIテスト',
      description: 'API品質・テスト',
      icon: <Wrench className="w-6 h-6" />,
      path: '/api-test',
      color: '#059669',
      category: 'testing',
      priority: 4,
      status: 'active',
      badgeCategory: 'testing',
    },
    {
      id: 'quality-dashboard',
      title: '品質ダッシュボード',
      description: '品質監視・改善',
      icon: <CheckCircle2 className="w-6 h-6" />,
      path: '/quality',
      color: '#65A30D',
      category: 'quality',
      priority: 4,
      status: 'active',
      badgeCategory: 'quality_assurance',
    },
    {
      id: 'error-monitoring',
      title: 'エラー監視',
      description: 'エラー追跡・解決',
      icon: <AlertTriangle className="w-6 h-6" />,
      path: '/errors',
      color: '#DC2626',
      category: 'monitoring',
      priority: 6,
      status: 'active',
      badgeCategory: 'monitoring',
    },
    {
      id: 'performance-monitoring',
      title: 'パフォーマンス監視',
      description: '性能監視・最適化',
      icon: <Zap className="w-6 h-6" />,
      path: '/performance',
      color: '#F59E0B',
      category: 'monitoring',
      priority: 6,
      status: 'active',
      badgeCategory: 'performance',
    },
    {
      id: 'profile',
      title: 'プロフィール',
      description: '個人設定・履歴',
      icon: <Users className="w-6 h-6" />,
      path: '/profile',
      color: '#8B5CF6',
      category: 'personal',
      priority: 3,
      status: 'active',
      badgeCategory: 'personal',
    },
    {
      id: 'settings',
      title: '設定',
      description: 'システム設定・環境',
      icon: <Settings className="w-6 h-6" />,
      path: '/settings',
      color: '#6B7280',
      category: 'system',
      priority: 2,
      status: 'active',
      badgeCategory: 'systematization',
    },
    {
      id: 'achievements-badges',
      title: '実績・バッジ',
      description: '達成状況・進捗確認',
      icon: <Trophy className="w-6 h-6" />,
      path: '/achievements',
      color: '#F59E0B',
      category: 'achievements',
      priority: 7,
      status: 'active',
      badgeCategory: 'achievement',
    },
  ]);

  const handleQuickActionClick = async (action: QuickAction) => {
    // アクティビティ記録
    await recordActivity('quick_action_click', {
      actionId: action.id,
      actionTitle: action.title,
      category: action.category,
      badgeCategory: action.badgeCategory,
      targetPath: action.path,
    });

    // ページ遷移
    window.location.href = action.path;
  };

  const handleRefreshData = async () => {
    await recordActivity('data_refresh', {
      timestamp: new Date().toISOString(),
      triggerSource: 'manual_refresh',
    });
    refreshData();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '1時間未満';
    if (diffInHours < 24) return `${diffInHours}時間前`;
    return `${Math.floor(diffInHours / 24)}日前`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">データ読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefreshData} variant="outline">
            再試行
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <HomeIcon className="w-10 h-10 text-primary" />
              Work Time Tracker
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              包括的なバッジ同期プラットフォーム - 全{quickActions.length}ページ連携
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${syncStatus.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
                />
                <span className="text-muted-foreground">
                  {syncStatus.isConnected ? 'リアルタイム同期中' : '同期エラー'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                最終同期: {formatTimeAgo(syncStatus.lastSync)}
              </span>
            </div>
            <Button
              onClick={handleRefreshData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Sync className="w-4 h-4" />
              同期
            </Button>
          </div>
        </div>

        {/* グローバルメトリクス概要 */}
        {globalMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">総バッジ数</p>
                    <p className="text-3xl font-bold">{globalMetrics.totalBadges}</p>
                    <p className="text-xs text-muted-foreground">
                      完了率 {globalMetrics.completionRate.toFixed(1)}%
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">獲得バッジ</p>
                    <p className="text-3xl font-bold text-green-600">
                      {globalMetrics.completedBadges}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      進行中 {globalMetrics.inProgressBadges}個
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">総ポイント</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {globalMetrics.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      週次進捗 +{globalMetrics.weeklyProgress.toFixed(1)}%
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">連続日数</p>
                    <p className="text-3xl font-bold text-purple-600">{globalMetrics.streakDays}</p>
                    <p className="text-xs text-muted-foreground">
                      アクティブカテゴリ {globalMetrics.activeCategories}個
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* クイックアクション - 全ページへのナビゲーション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-6 h-6" />
              クイックアクション - 全ページ連携ナビゲーション
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              各ページ訪問でバッジ進捗が自動同期されます
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {quickActions
                .sort((a, b) => b.priority - a.priority)
                .map((action) => (
                  <div
                    key={action.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => handleQuickActionClick(action)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${action.color}20`, color: action.color }}
                      >
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{action.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {action.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {action.category}
                          </Badge>
                          {action.badgeCategory && (
                            <Badge variant="secondary" className="text-xs">
                              {action.badgeCategory}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 最近の活動・実績 */}
        {globalMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 最近の実績 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  最近の実績
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {globalMetrics.recentAchievements.length > 0 ? (
                    globalMetrics.recentAchievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="font-medium text-sm">{achievement.name}</p>
                            <p className="text-xs text-muted-foreground">{achievement.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            +{achievement.points}pt
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(achievement.completedAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      まだ実績がありません。各ページを活用してバッジを獲得しましょう！
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 次のマイルストーン */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  次のマイルストーン
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {globalMetrics.upcomingMilestones.length > 0 ? (
                    globalMetrics.upcomingMilestones.slice(0, 3).map((milestone, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{milestone.name}</p>
                          <span className="text-xs text-muted-foreground">
                            残り{milestone.daysRemaining}日
                          </span>
                        </div>
                        <Progress value={milestone.progress} className="h-2 mb-1" />
                        <p className="text-xs text-muted-foreground">
                          進捗 {milestone.progress.toFixed(1)}% - 完了予定:{' '}
                          {milestone.estimatedCompletion}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      新しいバッジにチャレンジしてマイルストーンを設定しましょう！
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ページ同期状況 */}
        {pageData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                ページ同期状況・推奨アクション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">推奨アクション</h4>
                  <div className="space-y-2">
                    {pageData.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">クイックアクション</h4>
                  <div className="space-y-2">
                    {pageData.quickActions.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={action.action}
                      >
                        {action.title}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
