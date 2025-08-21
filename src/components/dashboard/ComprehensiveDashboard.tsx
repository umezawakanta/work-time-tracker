/**
 * 🎯 統合ダッシュボード
 * Gemini AIによる4象限分析、リアルタイム Analytics、管理機能を統合した包括的ダッシュボード
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import { Legend } from 'recharts';
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Zap,
  Award,
  Settings,
  Download,
  Share2,
  Filter,
  RefreshCw as Refresh,
  Bell,
  DollarSign,
  UserCheck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { RootState } from '@/store';
import { geminiTaskClassifier } from '@/services/ai/GeminiTaskClassifier';
import { userTrackingService } from '@/services/analytics/UserTrackingService';
import { EisenhowerMatrix } from '@/components/quadrant/EisenhowerMatrix';
import { toast } from 'react-hot-toast';

// 統合ダッシュボードの状態管理
interface DashboardState {
  isLoading: boolean;
  aiAnalysis: any;
  analytics: any;
  realtimeStats: any;
  userBehavior: any;
  selectedPeriod: '1d' | '7d' | '30d' | '90d';
  selectedMetric: string;
  filters: {
    userId?: string;
    category?: string;
    priority?: string;
  };
}

interface ComprehensiveDashboardProps {
  className?: string;
  userId?: string;
  role?: 'admin' | 'developer' | 'operations' | 'sales' | 'finance' | 'legal' | 'user';
}

export const ComprehensiveDashboard: React.FC<ComprehensiveDashboardProps> = ({
  className,
  userId,
  role = 'user',
}) => {
  const [state, setState] = useState<DashboardState>({
    isLoading: true,
    aiAnalysis: null,
    analytics: null,
    realtimeStats: null,
    userBehavior: null,
    selectedPeriod: '7d',
    selectedMetric: 'productivity',
    filters: {},
  });

  // Redux state
  const todos = useSelector((state: RootState) => state.todo.items);
  const user = useSelector((state: RootState) => state.user);

  /**
   * 🚀 データ初期化
   */
  useEffect(() => {
    initializeDashboard();
  }, [state.selectedPeriod, userId]);

  const initializeDashboard = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // 並列でデータを取得
      const [aiAnalysis, analytics, realtimeStats, userBehavior] = await Promise.all([
        loadAIAnalysis(),
        loadAnalytics(),
        loadRealtimeStats(),
        loadUserBehavior(),
      ]);

      setState((prev) => ({
        ...prev,
        aiAnalysis,
        analytics,
        realtimeStats,
        userBehavior,
        isLoading: false,
      }));

      toast.success('ダッシュボードデータを読み込みました');
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      toast.error('ダッシュボードの初期化に失敗しました');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * 🤖 AI分析データの読み込み
   */
  const loadAIAnalysis = async () => {
    try {
      const tasksData = todos.map((todo: any) => ({
        id: todo._id || todo.id,
        title: todo.task || todo.title,
        description: todo.note || todo.description || '',
        deadline: todo.deadline,
        priority: todo.priority,
        category: todo.category,
        tags: todo.tags,
        estimatedTime: todo.estimatedDuration || todo.estimatedTime,
        status: todo.completed ? 'completed' : 'active',
      }));

      const analysis = await geminiTaskClassifier.analyzeTasks(tasksData);

      return {
        tasks: analysis,
        summary: {
          totalTasks: analysis.length,
          quadrantBreakdown: analysis.reduce(
            (acc, task) => {
              acc[task.quadrant] = (acc[task.quadrant] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ),
          averageConfidence:
            analysis.reduce((acc, task) => acc + task.confidence, 0) / analysis.length,
          highPriorityTasks: analysis.filter((task) => task.priority >= 80).length,
        },
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      return null;
    }
  };

  /**
   * 📊 Analytics データの読み込み
   */
  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/analytics/dashboard?period=${state.selectedPeriod}&userId=${userId || ''}`
      );
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Analytics loading error:', error);
      return null;
    }
  };

  /**
   * 📱 リアルタイム統計の読み込み
   */
  const loadRealtimeStats = async () => {
    try {
      const response = await fetch('/api/analytics/realtime');
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Realtime stats error:', error);
      return null;
    }
  };

  /**
   * 👤 ユーザー行動データの読み込み
   */
  const loadUserBehavior = async () => {
    if (!userId) return null;

    try {
      const response = await fetch(
        `/api/analytics/user-behavior/${userId}?period=${state.selectedPeriod}`
      );
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('User behavior error:', error);
      return null;
    }
  };

  /**
   * 🎨 4象限カラーパレット
   */
  const quadrantColors = {
    essential: '#ef4444', // 赤 - 緊急かつ重要
    effectiveness: '#3b82f6', // 青 - 重要だが緊急でない
    illusion: '#f59e0b', // 黄 - 緊急だが重要でない
    waste: '#6b7280', // グレー - 重要でも緊急でもない
  };

  /**
   * 📈 生産性メトリクスの計算
   */
  const productivityMetrics = useMemo(() => {
    if (!state.aiAnalysis) return null;

    const { tasks, summary } = state.aiAnalysis;
    const total = tasks.length;

    return {
      productivityScore: Math.round(
        ((summary.quadrantBreakdown.effectiveness || 0) * 40) / total +
          ((summary.quadrantBreakdown.essential || 0) * 30) / total +
          ((summary.quadrantBreakdown.illusion || 0) * 20) / total +
          ((summary.quadrantBreakdown.waste || 0) * 10) / total
      ),
      focusRatio:
        ((summary.quadrantBreakdown.effectiveness || 0) +
          (summary.quadrantBreakdown.essential || 0)) /
        total,
      wasteRatio: (summary.quadrantBreakdown.waste || 0) / total,
      urgencyManagement:
        (summary.quadrantBreakdown.effectiveness || 0) / (summary.quadrantBreakdown.illusion || 1),
    };
  }, [state.aiAnalysis]);

  /**
   * 📊 役割別ダッシュボードコンテンツ
   */
  const getRoleDashboard = () => {
    const roleConfigs = {
      admin: {
        title: '管理者ダッシュボード',
        icon: Settings,
        metrics: ['users', 'revenue', 'systemHealth', 'security'],
        actions: ['userManagement', 'systemSettings', 'reports'],
      },
      developer: {
        title: '開発者ダッシュボード',
        icon: Activity,
        metrics: ['deployments', 'bugs', 'performance', 'codeQuality'],
        actions: ['deploy', 'monitoring', 'testing'],
      },
      operations: {
        title: '運用ダッシュボード',
        icon: BarChart3,
        metrics: ['uptime', 'performance', 'alerts', 'capacity'],
        actions: ['monitoring', 'scaling', 'maintenance'],
      },
      sales: {
        title: '営業ダッシュボード',
        icon: TrendingUp,
        metrics: ['leads', 'conversions', 'revenue', 'targets'],
        actions: ['leadGeneration', 'followUp', 'reporting'],
      },
      finance: {
        title: '経理ダッシュボード',
        icon: DollarSign,
        metrics: ['revenue', 'expenses', 'profit', 'forecasts'],
        actions: ['billing', 'reporting', 'budgeting'],
      },
      legal: {
        title: '法務ダッシュボード',
        icon: FileText,
        metrics: ['compliance', 'contracts', 'risks', 'deadlines'],
        actions: ['compliance', 'contracts', 'reporting'],
      },
      user: {
        title: 'マイダッシュボード',
        icon: Target,
        metrics: ['productivity', 'tasks', 'goals', 'insights'],
        actions: ['taskManagement', 'planning', 'analysis'],
      },
    };

    return roleConfigs[role] || roleConfigs.user;
  };

  /**
   * 🔄 データ更新
   */
  const handleRefresh = () => {
    initializeDashboard();
    userTrackingService.trackInteraction('click', 'dashboard-refresh', 'dashboard');
  };

  /**
   * 📤 データエクスポート
   */
  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      period: state.selectedPeriod,
      aiAnalysis: state.aiAnalysis,
      analytics: state.analytics,
      productivityMetrics,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    userTrackingService.trackInteraction('click', 'dashboard-export', 'dashboard');
    toast.success('データをエクスポートしました');
  };

  /**
   * 📱 SNSシェア
   */
  const handleShare = () => {
    if (!productivityMetrics) return;

    const shareText =
      `私の生産性スコア: ${productivityMetrics.productivityScore}/100 🎯\n` +
      `集中度: ${Math.round(productivityMetrics.focusRatio * 100)}% 💪\n` +
      '#WorkTimeTracker で生産性を向上中！';

    if (navigator.share) {
      navigator.share({
        title: 'Work Time Tracker - 生産性レポート',
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('シェア用テキストをコピーしました');
    }

    userTrackingService.trackInteraction('click', 'dashboard-share', 'dashboard');
  };

  const roleConfig = getRoleDashboard();
  const Icon = roleConfig.icon;

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ダッシュボードを読み込み中...
          </h2>
          <p className="text-gray-600">AIによる高度な分析を実行しています</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Icon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{roleConfig.title}</h1>
                <p className="text-sm text-gray-600">
                  最終更新: {new Date().toLocaleString('ja-JP')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Activity className="h-3 w-3 mr-1" />
                  ライブ
                </Badge>
                {state.realtimeStats && (
                  <Badge variant="secondary">
                    {state.realtimeStats.activeUsers} アクティブユーザー
                  </Badge>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <Refresh className="h-4 w-4 mr-2" />
                更新
              </Button>

              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                エクスポート
              </Button>

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                シェア
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI概要 */}
        {productivityMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">生産性スコア</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {productivityMetrics.productivityScore}/100
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <Progress value={productivityMetrics.productivityScore} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">集中度</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(productivityMetrics.focusRatio * 100)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <Progress value={productivityMetrics.focusRatio * 100} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">総タスク数</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {state.aiAnalysis?.summary.totalTasks || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI信頼度</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {Math.round((state.aiAnalysis?.summary.averageConfidence || 0) * 100)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Brain className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* タブ型ダッシュボード */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="ai-analysis">AI分析</TabsTrigger>
            <TabsTrigger value="analytics">アナリティクス</TabsTrigger>
            <TabsTrigger value="realtime">リアルタイム</TabsTrigger>
            <TabsTrigger value="management">管理</TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 4象限チャート */}
              {state.aiAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      AI 4象限分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(state.aiAnalysis.summary.quadrantBreakdown).map(
                            ([key, value]) => ({
                              name: key,
                              value,
                              color: quadrantColors[key as keyof typeof quadrantColors],
                            })
                          )}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                        >
                          {Object.entries(state.aiAnalysis.summary.quadrantBreakdown).map(
                            ([key], index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={quadrantColors[key as keyof typeof quadrantColors]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* アクティビティトレンド */}
              {state.analytics?.timeSeriesData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      アクティビティトレンド
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={state.analytics.timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* AI分析タブ */}
          <TabsContent value="ai-analysis" className="space-y-6">
            {state.aiAnalysis && todos.length > 0 && (
              <EisenhowerMatrix
                tasks={todos}
                showAnalytics={true}
                autoRefresh={false}
                className="w-full"
              />
            )}
          </TabsContent>

          {/* アナリティクスタブ */}
          <TabsContent value="analytics" className="space-y-6">
            {state.analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>イベント統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(state.analytics.eventTypes || {}).map(([event, count]) => (
                        <div key={event} className="flex items-center justify-between">
                          <span className="font-medium">{event}</span>
                          <Badge variant="secondary">{String(count)}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>人気ページ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(state.analytics.topPages || [])
                        .slice(0, 5)
                        .map((page: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="font-medium truncate">{page.page}</span>
                            <Badge variant="outline">{page.views} views</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* リアルタイムタブ */}
          <TabsContent value="realtime" className="space-y-6">
            {state.realtimeStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      アクティブユーザー
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">
                      {state.realtimeStats.activeUsers}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">現在オンライン</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      分/イベント
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(state.realtimeStats.eventsPerMinute)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">1分間あたり</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      アクティブセッション
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-600">
                      {state.realtimeStats.activeSessions}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">現在のセッション数</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* 管理タブ */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    ユーザー管理
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    ユーザー一覧
                  </Button>
                  <Button className="w-full" variant="outline">
                    権限管理
                  </Button>
                  <Button className="w-full" variant="outline">
                    アクティビティログ
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    システム設定
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    一般設定
                  </Button>
                  <Button className="w-full" variant="outline">
                    セキュリティ
                  </Button>
                  <Button className="w-full" variant="outline">
                    バックアップ
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    レポート
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    利用統計
                  </Button>
                  <Button className="w-full" variant="outline">
                    パフォーマンス
                  </Button>
                  <Button className="w-full" variant="outline">
                    カスタムレポート
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 通知・アラート */}
        {state.aiAnalysis?.summary.highPriorityTasks > 0 && (
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>注意:</strong> {state.aiAnalysis.summary.highPriorityTasks}
              件の高優先度タスクがあります。 早急な対応を検討してください。
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;
