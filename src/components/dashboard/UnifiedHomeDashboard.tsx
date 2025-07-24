/**
 * 🏠 統一ホームダッシュボード
 * 統一データシステムを使用したメインダッシュボード
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// 統一データシステムのインポート
import {
  useUnifiedData,
  useTaskMetrics,
  useGamificationMetrics,
  useSystemMetrics,
  useRealtimeData,
} from '@/hooks/useUnifiedData';

// アイコン
import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  Crown,
  Flame,
  Target,
  TrendingUp,
  Zap,
  Award,
  Brain,
  Bell,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
  Users,
  Shield,
  Globe,
  Wifi,
  WifiOff,
  Calendar,
  Plus,
  ArrowRight,
  Eye,
  Star,
  Trophy,
  Heart,
  Home,
  BarChart,
  Play,
  Pause,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export interface UnifiedHomeDashboardProps {
  compactMode?: boolean;
  showWelcome?: boolean;
  enableAnimations?: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  priority: number;
  category: 'productivity' | 'analytics' | 'automation' | 'health' | 'education';
}

const quickActions: QuickAction[] = [
  {
    id: 'todos',
    title: 'タスク管理',
    description: 'TODO・プロジェクト管理',
    icon: <CheckCircle className="w-5 h-5" />,
    path: '/todos',
    color: 'bg-green-500',
    priority: 10,
    category: 'productivity',
  },
  {
    id: 'integrated-dashboard',
    title: '統合ダッシュボード',
    description: 'リアルタイム分析',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/integrated-dashboard',
    color: 'bg-blue-500',
    priority: 9,
    category: 'analytics',
  },
  {
    id: 'automation-rules',
    title: '自動化ルール',
    description: 'ワークフロー自動化',
    icon: <Settings className="w-5 h-5" />,
    path: '/automation-rules',
    color: 'bg-purple-500',
    priority: 8,
    category: 'automation',
  },
  {
    id: 'work-time-reports',
    title: '勤怠レポート',
    description: '作業時間分析',
    icon: <Clock className="w-5 h-5" />,
    path: '/work-time-reports',
    color: 'bg-orange-500',
    priority: 7,
    category: 'productivity',
  },
  {
    id: 'achievements',
    title: '実績・バッジ',
    description: 'ゲーミフィケーション',
    icon: <Award className="w-5 h-5" />,
    path: '/achievements',
    color: 'bg-yellow-500',
    priority: 6,
    category: 'productivity',
  },
  {
    id: 'adhd-support',
    title: 'ADHD集中サポート',
    description: '集中力・実行機能支援',
    icon: <Brain className="w-5 h-5" />,
    path: '/adhd-support',
    color: 'bg-pink-500',
    priority: 5,
    category: 'health',
  },
];

export const UnifiedHomeDashboard: React.FC<UnifiedHomeDashboardProps> = ({
  compactMode = false,
  showWelcome = true,
  enableAnimations = true,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 統一データシステムの使用
  const {
    systemMetrics,
    taskMetrics,
    gamificationMetrics,
    performanceMetrics,
    realtimeData,
    isLoading,
    error,
    connectionStatus,
    syncStatus,
    lastSyncTime,
    initialize,
    refreshData,
    addActivity,
    addNotification,
    performHealthCheck,
    clearCache,
    statistics,
    isOnline,
    hasUnreadNotifications,
    recentActivitiesCount,
    systemHealthStatus,
  } = useUnifiedData({
    autoInitialize: true,
    enableRealtime: true,
    debugMode: true,
    onDataUpdate: (data) => {
      console.log('📊 Dashboard data updated:', data);
    },
    onError: (error) => {
      console.error('Dashboard error:', error);
      toast.error(`データエラー: ${error}`);
    },
  });

  // 手動更新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData(true);
      toast.success('データを更新しました');
    } catch (error) {
      toast.error('更新に失敗しました');
    } finally {
      setIsRefreshing(false);
    }
  };

  // ヘルスチェック
  const handleHealthCheck = async () => {
    try {
      const health = await performHealthCheck();
      toast.success(`システムヘルス: ${health.status} (スコア: ${health.score})`);
    } catch (error) {
      toast.error('ヘルスチェックに失敗しました');
    }
  };

  // テストアクティビティの追加
  const addTestActivity = () => {
    addActivity({
      id: `test_${Date.now()}`,
      type: 'task_completed',
      title: 'テストタスクを完了',
      description: 'ダッシュボードのテスト用アクティビティ',
      timestamp: new Date().toISOString(),
      metadata: { source: 'dashboard_test' },
    });
  };

  // 計算されたメトリクス
  const overallProgress = useMemo(() => {
    const taskProgress = taskMetrics.completionRate || 0;
    const levelProgress = gamificationMetrics.nextLevelProgress || 0;
    return Math.round((taskProgress + levelProgress) / 2);
  }, [taskMetrics.completionRate, gamificationMetrics.nextLevelProgress]);

  // ステータスアイコンの取得
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'good':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  // 接続ステータスの表示
  const getConnectionDisplay = () => {
    if (!isOnline) {
      return { icon: <WifiOff className="w-4 h-4" />, text: 'オフライン', color: 'text-red-500' };
    }

    switch (connectionStatus) {
      case 'connected':
        return { icon: <Wifi className="w-4 h-4" />, text: '接続中', color: 'text-green-500' };
      case 'disconnected':
        return { icon: <WifiOff className="w-4 h-4" />, text: '切断', color: 'text-red-500' };
      case 'reconnecting':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: '再接続中',
          color: 'text-yellow-500',
        };
      default:
        return { icon: <Wifi className="w-4 h-4" />, text: '不明', color: 'text-gray-500' };
    }
  };

  const connectionDisplay = getConnectionDisplay();

  if (isLoading && !statistics.isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold">統一データシステムを初期化中...</p>
          <p className="text-sm text-muted-foreground mt-2">
            システムの準備をしています。しばらくお待ちください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', compactMode && 'space-y-4')}>
      {/* ヘッダーセクション */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          {showWelcome && (
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              統一ダッシュボード
            </h1>
          )}
          <p className="text-muted-foreground">リアルタイムデータ同期・統合管理システム</p>
        </div>

        {/* システム状態表示 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(systemHealthStatus)}
            <span className="text-sm font-medium">システム: {systemHealthStatus}</span>
          </div>

          <div className={cn('flex items-center gap-2', connectionDisplay.color)}>
            {connectionDisplay.icon}
            <span className="text-sm font-medium">{connectionDisplay.text}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            更新
          </Button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="link" onClick={() => refreshData(true)} className="ml-2 p-0 h-auto">
              再試行
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="tasks">タスク</TabsTrigger>
          <TabsTrigger value="gamification">ゲーミフィケーション</TabsTrigger>
          <TabsTrigger value="system">システム</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          {/* メインメトリクス */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日のタスク</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskMetrics.completedToday}</div>
                <p className="text-xs text-muted-foreground">
                  完了 / {taskMetrics.totalTasks} 総数
                </p>
                <Progress value={taskMetrics.completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">レベル</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gamificationMetrics.playerLevel}</div>
                <p className="text-xs text-muted-foreground">
                  {gamificationMetrics.totalXP} XP / {gamificationMetrics.rank}
                </p>
                <Progress value={gamificationMetrics.nextLevelProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ストリーク</CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gamificationMetrics.streakDays}</div>
                <p className="text-xs text-muted-foreground">連続達成日数</p>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-full',
                        i < gamificationMetrics.streakDays % 7 ? 'bg-orange-500' : 'bg-gray-200'
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">システム稼働</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.uptime}%</div>
                <p className="text-xs text-muted-foreground">
                  {systemMetrics.activeFeatures} 機能が稼働中
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {getStatusIcon(systemHealthStatus)}
                  <span className="text-xs">{systemHealthStatus}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* クイックアクション */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                クイックアクション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.slice(0, 6).map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all"
                    onClick={() => navigate(action.path)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={cn('p-2 rounded-lg text-white', action.color)}>
                        {action.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* リアルタイムアクティビティ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                最近のアクティビティ
                {recentActivitiesCount > 0 && (
                  <Badge variant="secondary">{recentActivitiesCount}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {realtimeData.recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {realtimeData.recentActivities.slice(0, 10).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="p-1 rounded-full bg-blue-100">
                          <Activity className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>まだアクティビティがありません</p>
                    <Button variant="link" onClick={addTestActivity} className="mt-2">
                      テストアクティビティを追加
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* その他のタブは省略 */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>タスク管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">タスク詳細ビューは開発中です。</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gamification">
          <Card>
            <CardHeader>
              <CardTitle>ゲーミフィケーション</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">ゲーミフィケーション詳細ビューは開発中です。</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>システム統計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">初期化状態</p>
                    <p className={statistics.isInitialized ? 'text-green-600' : 'text-red-600'}>
                      {statistics.isInitialized ? '初期化済み' : '未初期化'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">最終同期</p>
                    <p>{lastSyncTime ? new Date(lastSyncTime).toLocaleString() : '未同期'}</p>
                  </div>
                  <div>
                    <p className="font-medium">キャッシュサイズ</p>
                    <p>{statistics.cacheSize} エントリ</p>
                  </div>
                  <div>
                    <p className="font-medium">通知数</p>
                    <p>{statistics.totalNotifications}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleHealthCheck}>
                    ヘルスチェック
                  </Button>
                  <Button variant="outline" onClick={clearCache}>
                    キャッシュクリア
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedHomeDashboard;
