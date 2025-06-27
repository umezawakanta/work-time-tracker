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
  Home,
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
} from 'lucide-react';

interface DashboardMetrics {
  totalBadges: number;
  completedBadges: number;
  inProgressBadges: number;
  completionRate: number;
  totalPoints: number;
  weeklyProgress: number;
  activeCategories: number;
  streakDays: number;
}

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
}

interface CategoryProgress {
  category: string;
  name: string;
  progress: number;
  badgeCount: number;
  completedCount: number;
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'badge_earned' | 'progress_made' | 'milestone_reached' | 'page_visited';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export const EnhancedHome: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBadges: 95,
    completedBadges: 27,
    inProgressBadges: 18,
    completionRate: 28.4,
    totalPoints: 12750,
    weeklyProgress: 15.2,
    activeCategories: 15,
    streakDays: 7,
  });

  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([
    {
      category: 'cicd',
      name: 'CI/CD・DevOps',
      progress: 75,
      badgeCount: 8,
      completedCount: 6,
      icon: <GitBranch className="w-5 h-5" />,
      color: '#3B82F6',
    },
    {
      category: 'ai_ml',
      name: 'AI・機械学習',
      progress: 85,
      badgeCount: 12,
      completedCount: 10,
      icon: <Bot className="w-5 h-5" />,
      color: '#7C2D12',
    },
    {
      category: 'business',
      name: 'ビジネス・経営',
      progress: 45,
      badgeCount: 10,
      completedCount: 4,
      icon: <Briefcase className="w-5 h-5" />,
      color: '#EF4444',
    },
    {
      category: 'cybersecurity',
      name: 'サイバーセキュリティ',
      progress: 67,
      badgeCount: 9,
      completedCount: 6,
      icon: <Shield className="w-5 h-5" />,
      color: '#B91C1C',
    },
    {
      category: 'marketing',
      name: 'マーケティング',
      progress: 38,
      badgeCount: 7,
      completedCount: 3,
      icon: <Target className="w-5 h-5" />,
      color: '#EC4899',
    },
    {
      category: 'finance',
      name: '財務・会計',
      progress: 22,
      badgeCount: 8,
      completedCount: 2,
      icon: <DollarSign className="w-5 h-5" />,
      color: '#059669',
    },
    {
      category: 'art',
      name: '芸術・創作',
      progress: 30,
      badgeCount: 6,
      completedCount: 2,
      icon: <Palette className="w-5 h-5" />,
      color: '#DB2777',
    },
    {
      category: 'philosophy',
      name: '哲学・学術',
      progress: 25,
      badgeCount: 5,
      completedCount: 1,
      icon: <Microscope className="w-5 h-5" />,
      color: '#6366F1',
    },
  ]);

  const [quickActions, setQuickActions] = useState<QuickAction[]>([
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
    },
    {
      id: 'badges',
      title: 'バッジショーケース',
      description: '全バッジ・進捗確認',
      icon: <Trophy className="w-6 h-6" />,
      path: '/badge-showcase',
      color: '#F59E0B',
      category: 'achievements',
      priority: 8,
      status: 'active',
    },
    {
      id: 'prediction',
      title: 'バッジ完了予測',
      description: 'AI駆動の進捗予測',
      icon: <Brain className="w-6 h-6" />,
      path: '/badge-prediction',
      color: '#8B5CF6',
      category: 'analytics',
      priority: 8,
      status: 'active',
    },
    {
      id: 'wbs',
      title: 'WBS作成',
      description: 'プロジェクト分解・計画',
      icon: <FileText className="w-6 h-6" />,
      path: '/wbs',
      color: '#EF4444',
      category: 'planning',
      priority: 7,
      status: 'active',
    },
    {
      id: 'ai-wbs',
      title: 'AI WBS生成',
      description: 'AI支援プロジェクト計画',
      icon: <Bot className="w-6 h-6" />,
      path: '/ai-wbs',
      color: '#06B6D4',
      category: 'ai',
      priority: 7,
      status: 'active',
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
    },
    {
      id: 'time-tracking',
      title: '勤怠管理',
      description: '時間・効率追跡',
      icon: <Clock className="w-6 h-6" />,
      path: '/time-tracking',
      color: '#DC2626',
      category: 'productivity',
      priority: 6,
      status: 'active',
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
    },
    {
      id: 'quality',
      title: '品質ダッシュボード',
      description: '品質監視・改善',
      icon: <CheckCircle2 className="w-6 h-6" />,
      path: '/quality',
      color: '#65A30D',
      category: 'quality',
      priority: 4,
      status: 'active',
    },
    {
      id: 'errors',
      title: 'エラー監視',
      description: 'エラー追跡・解決',
      icon: <AlertTriangle className="w-6 h-6" />,
      path: '/errors',
      color: '#DC2626',
      category: 'monitoring',
      priority: 6,
      status: 'active',
    },
    {
      id: 'performance',
      title: 'パフォーマンス監視',
      description: '性能監視・最適化',
      icon: <Zap className="w-6 h-6" />,
      path: '/performance',
      color: '#F59E0B',
      category: 'monitoring',
      priority: 6,
      status: 'active',
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
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'badge_earned',
      title: 'ゲーミフィケーションデザイナー',
      description: 'ゲーム要素・エンゲージメント設計を完了',
      timestamp: '2024-01-12T16:45:00Z',
      icon: <Trophy className="w-4 h-4" />,
      color: '#F59E0B',
    },
    {
      id: '2',
      type: 'progress_made',
      title: 'AI統合パイオニア',
      description: '進捗率 72% → 78% (+6%)',
      timestamp: '2024-01-15T14:30:00Z',
      icon: <TrendingUp className="w-4 h-4" />,
      color: '#10B981',
    },
    {
      id: '3',
      type: 'milestone_reached',
      title: 'アクセシビリティチャンピオン',
      description: '87%達成、完了まで残り2週間',
      timestamp: '2024-01-16T10:15:00Z',
      icon: <Target className="w-4 h-4" />,
      color: '#3B82F6',
    },
    {
      id: '4',
      type: 'badge_earned',
      title: 'スキルマッパー',
      description: 'スキルマップ・能力評価システム完成',
      timestamp: '2024-01-15T10:30:00Z',
      icon: <Trophy className="w-4 h-4" />,
      color: '#F59E0B',
    },
    {
      id: '5',
      type: 'page_visited',
      title: 'システム監視強化',
      description: 'エラー監視・パフォーマンス監視の活用',
      timestamp: '2024-01-17T08:45:00Z',
      icon: <Activity className="w-4 h-4" />,
      color: '#8B5CF6',
    },
  ]);

  useEffect(() => {
    // メトリクスとデータの定期更新
    const interval = setInterval(() => {
      updateMetrics();
    }, 30000); // 30秒ごと

    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    // リアルタイムメトリクス更新のシミュレーション
    setMetrics((prev) => ({
      ...prev,
      weeklyProgress: prev.weeklyProgress + Math.random() * 0.5,
      totalPoints: prev.totalPoints + Math.floor(Math.random() * 10),
    }));
  };

  const navigateToPage = (path: string) => {
    window.location.href = path;
  };

  const getActivityTypeColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'badge_earned':
        return 'border-yellow-200 bg-yellow-50';
      case 'progress_made':
        return 'border-green-200 bg-green-50';
      case 'milestone_reached':
        return 'border-blue-200 bg-blue-50';
      case 'page_visited':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '1時間未満';
    if (diffInHours < 24) return `${diffInHours}時間前`;
    return `${Math.floor(diffInHours / 24)}日前`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Home className="w-10 h-10 text-primary" />
              Work Time Tracker
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              包括的な生産性・スキル開発プラットフォーム
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">リアルタイム同期中</span>
            </div>
          </div>
        </div>

        {/* メトリクス概要 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総バッジ数</p>
                  <p className="text-3xl font-bold">{metrics.totalBadges}</p>
                  <p className="text-xs text-muted-foreground">
                    完了率 {metrics.completionRate.toFixed(1)}%
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
                  <p className="text-3xl font-bold text-green-600">{metrics.completedBadges}</p>
                  <p className="text-xs text-muted-foreground">
                    進行中 {metrics.inProgressBadges}個
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総ポイント</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {metrics.totalPoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    週間+{metrics.weeklyProgress.toFixed(1)}%
                  </p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">継続日数</p>
                  <p className="text-3xl font-bold text-orange-600">{metrics.streakDays}</p>
                  <p className="text-xs text-muted-foreground">
                    活動カテゴリ {metrics.activeCategories}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* カテゴリ別進捗 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              カテゴリ別進捗状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryProgress.map((category) => (
                <div key={category.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-1 rounded"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div style={{ color: category.color }}>{category.icon}</div>
                      </div>
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {category.completedCount}/{category.badgeCount}
                    </span>
                  </div>
                  <Progress value={category.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{category.progress}% 完了</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* クイックアクション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              クイックアクション - 全機能アクセス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions
                .filter((action) => action.status === 'active')
                .sort((a, b) => b.priority - a.priority)
                .map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-3 hover:shadow-lg transition-all"
                    onClick={() => navigateToPage(action.path)}
                    style={{ borderColor: `${action.color}30` }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${action.color}20` }}
                      >
                        <div style={{ color: action.color }}>{action.icon}</div>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-sm">{action.title}</h3>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {action.category}
                    </Badge>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 最近のアクティビティ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              最近のアクティビティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-3 rounded-lg border ${getActivityTypeColor(activity.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded" style={{ color: activity.color }}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* システム状況 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              システム同期状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">ページ同期</p>
                  <p className="text-xs text-muted-foreground">28/30 ページ同期済み</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">応答時間</p>
                  <p className="text-xs text-muted-foreground">平均 145ms</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">成功率</p>
                  <p className="text-xs text-muted-foreground">99.2%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
