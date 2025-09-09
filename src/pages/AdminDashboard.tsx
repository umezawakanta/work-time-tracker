import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Settings,
  Shield,
  Database,
  Activity,
  UserPlus,
  CreditCard,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  Globe,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { ErrorMonitoringDashboard } from '@/components/development/ErrorMonitoringDashboard';
import { AdminBugsList } from '@/components/admin/AdminBugsList';
import { api } from '@/services/api/apiConfig';
import SocialShareButton from '@/components/ui/SocialShareButton';
import AdminUsersPage from '@/pages/AdminUsersPage';

// named / default どちらでも拾って、失敗しても空を返す
const AdminFeaturesList = React.lazy(async () => {
  try {
    const mod: any = await import('@/components/admin/AdminFeaturesList');
    return { default: mod.AdminFeaturesList ?? mod.default ?? (() => null) };
  } catch {
    return { default: () => null };
  }
});

import { isFeatureAccessible } from '@/config/features';
import { useDerivedFeatureStatuses } from '@/hooks/useDerivedFeatureStatuses';
import {
  NEW_STATUS_ORDER,
  setApprovedStatus,
  toNextStatus,
} from '@/services/dev/featureStatusEngine';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  mrr: number;
  uptime: number;
  errorRate: number;
  pendingTickets: number;
  newUsersToday: number;
  revenueGrowth: number;
  systemHealth: {
    server: boolean;
    database: boolean;
    api: boolean;
    websocket: boolean;
  };
}

interface TopPage {
  path: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

interface UserActivity {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface PriorityAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  dueDate: string;
  category: string;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // テスト安定化のため、エラーハンドリングを強化
  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 並列でAPIを呼び出し
      const [metricsRes, topPagesRes, usersRes, actionsRes] = await Promise.allSettled([
        api.get('/admin/metrics'),
        api.get('/analytics/pageviews/daily'),
        api.get('/admin/users'),
        api.get('/admin/actions'),
      ]);

      // メトリクス
      if (metricsRes.status === 'fulfilled') {
        setMetrics(metricsRes.value.data);
      } else {
        console.warn('Metrics API failed:', metricsRes.reason);
        // フォールバックデータ
        setMetrics({
          totalUsers: 0,
          activeUsers: 0,
          mrr: 0,
          uptime: 0,
          errorRate: 0,
          pendingTickets: 0,
          newUsersToday: 0,
          revenueGrowth: 0,
          systemHealth: {
            server: false,
            database: false,
            api: false,
            websocket: false,
          },
        });
      }

      // トップページ
      if (topPagesRes.status === 'fulfilled') {
        setTopPages(topPagesRes.value.data || []);
      }

      // ユーザー活動
      if (usersRes.status === 'fulfilled') {
        setUserActivities(usersRes.value.data || []);
      }

      // 優先アクション
      if (actionsRes.status === 'fulfilled') {
        setPriorityActions(actionsRes.value.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setError('データの読み込みに失敗しました');

      // エラー時もフォールバックデータを設定
      setMetrics({
        totalUsers: 0,
        activeUsers: 0,
        mrr: 0,
        uptime: 0,
        errorRate: 0,
        pendingTickets: 0,
        newUsersToday: 0,
        revenueGrowth: 0,
        systemHealth: {
          server: false,
          database: false,
          api: false,
          websocket: false,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [selectedTimeRange]);

  const filteredUserActivities = useMemo(() => {
    if (!searchQuery) return Array.isArray(userActivities) ? userActivities : [];
    return Array.isArray(userActivities)
      ? userActivities.filter(
          (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
  }, [userActivities, searchQuery]);

  const highPriorityActions = useMemo(() => {
    return Array.isArray(priorityActions)
      ? priorityActions.filter(
          (action) => action.priority === 'high' && action.status !== 'completed'
        )
      : [];
  }, [priorityActions]);

  const systemHealthScore = useMemo(() => {
    if (!metrics || !metrics.systemHealth) return 0;
    const healthChecks = Object.values(metrics.systemHealth);
    const healthyCount = healthChecks.filter(Boolean).length;
    return Math.round((healthyCount / healthChecks.length) * 100);
  }, [metrics]);

  const handleRefresh = () => {
    loadMetrics();
    toast.success('データを更新しました');
  };

  const handleCompleteAction = async (actionId: string) => {
    try {
      await api.post(`/admin/actions/${actionId}/complete`);
      setPriorityActions((prev) =>
        prev.map((action) =>
          action.id === actionId ? { ...action, status: 'completed' as const } : action
        )
      );
      toast.success('アクションを完了しました');
    } catch (error) {
      console.error('Failed to complete action:', error);
      toast.error('アクションの完了に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">データを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>エラーが発生しました</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
          <p className="text-muted-foreground">システム全体の監視と管理</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          <SocialShareButton
            url={window.location.href}
            title="管理者ダッシュボード"
            description="システム監視と管理"
          />
        </div>
      </div>

      {/* メトリクスカード */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.totalUsers ?? 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{metrics.newUsersToday ?? 0} 今日</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.activeUsers ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {(metrics.totalUsers ?? 0) > 0
                  ? Math.round(((metrics.activeUsers ?? 0) / (metrics.totalUsers ?? 1)) * 100)
                  : 0}
                % アクティブ率
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">月次収益</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{(metrics.mrr ?? 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {(metrics.revenueGrowth ?? 0) >= 0 ? '+' : ''}
                {(metrics.revenueGrowth ?? 0).toFixed(1)}% 成長率
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">システム稼働率</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.uptime ?? 0).toFixed(1)}%</div>
              <Progress value={metrics.uptime ?? 0} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* システムヘルス */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              システムヘルス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.systemHealth &&
                Object.entries(metrics.systemHealth).map(([service, isHealthy]) => (
                  <div key={service} className="flex items-center gap-2">
                    {isHealthy ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium capitalize">{service}</span>
                  </div>
                ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>全体ヘルススコア</span>
                <span className="font-medium">{systemHealthScore}%</span>
              </div>
              <Progress value={systemHealthScore} className="mt-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="users">ユーザー</TabsTrigger>
          <TabsTrigger value="actions">優先アクション</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
          <TabsTrigger value="errors">エラー監視</TabsTrigger>
          <TabsTrigger value="features">機能管理</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 優先アクション */}
          {highPriorityActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  緊急対応が必要
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {highPriorityActions.slice(0, 3).map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{action.title}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteAction(action.id)}
                        disabled={action.status === 'completed'}
                      >
                        {action.status === 'completed' ? '完了済み' : '完了'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* トップページ */}
          {Array.isArray(topPages) && topPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>人気ページ</CardTitle>
                <CardDescription>過去{selectedTimeRange}のアクセス数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPages.slice(0, 5).map((page, index) => (
                    <div key={page.path} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="font-medium">{page.path}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{page.views.toLocaleString()} ビュー</span>
                        <span>{page.uniqueViews.toLocaleString()} ユニーク</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ユーザー管理</CardTitle>
              <CardDescription>ユーザーの検索と管理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="ユーザーを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <div className="space-y-2">
                  {filteredUserActivities.slice(0, 10).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserPlus className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>優先アクション</CardTitle>
              <CardDescription>管理が必要なアクション一覧</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(priorityActions) &&
                  priorityActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{action.title}</h4>
                          <Badge
                            variant={
                              action.priority === 'high'
                                ? 'destructive'
                                : action.priority === 'medium'
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {action.priority}
                          </Badge>
                          <Badge variant="outline">{action.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>担当: {action.assignedTo}</span>
                          <span>期限: {new Date(action.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteAction(action.id)}
                        disabled={action.status === 'completed'}
                      >
                        {action.status === 'completed' ? '完了済み' : '完了'}
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Suspense fallback={<div>読み込み中...</div>}>
            <AnalyticsDashboard isAdminUser={true} />
          </Suspense>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Suspense fallback={<div>読み込み中...</div>}>
            <ErrorMonitoringDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Suspense fallback={<div>読み込み中...</div>}>
            <AdminFeaturesList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
