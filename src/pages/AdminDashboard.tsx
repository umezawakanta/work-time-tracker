import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { api } from '@/services/api/apiConfig';
import SocialShareButton from '@/components/ui/SocialShareButton';
import AdminUsersPage from '@/pages/AdminUsersPage';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface AdminMetrics {
  users: {
    total: number;
    active: number;
    newToday: number;
    churnRate: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    todayRevenue: number;
    conversionRate: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  support: {
    openTickets: number;
    avgResponseTime: string;
    satisfaction: number;
  };
}

interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number;
  pageViewsTotal: number;
  topPages?: Array<{ page: string; views: number }>;
  deviceBreakdown?: { desktop: number; mobile: number; tablet: number };
  trafficSources?: Record<string, number>;
  featureUsage?: { ai_ok: number; assessment_saved: number; learning_saved: number };
  topReferrers?: Array<{ referrer: string; count: number }>;
  compare?: { today: number; yesterday: number; diff: number; pct: number };
  retentionCohort?: Array<{ day: string; newUsers: number; retainedNextDay: number }>;
  topErrors?: Array<{ message: string; count: number; url?: string }>;
}

interface AssessmentsSummary {
  iqSaved: number;
  mbtiSaved: number;
  totalSaved30d: number;
  generatedAt?: string;
}

interface LearningSummary {
  progressSaved30d: number;
  uniqueLearners30d: number;
  generatedAt?: string;
}

// Normalize API metrics payload to UI's expected shape to avoid runtime errors in production
function normalizeMetrics(raw: unknown): AdminMetrics {
  const obj = (raw as Record<string, unknown>) || {};
  const users = (obj.users as Record<string, unknown>) || {};
  const revenue = (obj.revenue as Record<string, unknown>) || {};
  const system = (obj.system as Record<string, unknown>) || {};
  const support = (obj.support as Record<string, unknown>) || {};

  const toNum = (v: unknown, fallback = 0): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const mrrNum = toNum(revenue.mrr, 0);
  const growthNum = toNum(revenue.growth ?? revenue.conversionRate, 0);
  const todayRevenueNum =
    revenue.todayRevenue !== undefined
      ? toNum(revenue.todayRevenue, 0)
      : Math.max(0, Math.round((mrrNum * (growthNum / 100)) / 30));

  return {
    users: {
      total: toNum(users.total, 0),
      active: toNum(users.active, 0),
      newToday: toNum(users.newToday ?? users.new, 0),
      churnRate: toNum(users.churnRate ?? revenue.churn, 0),
    },
    revenue: {
      mrr: mrrNum,
      arr: toNum(revenue.arr ?? mrrNum * 12, mrrNum * 12),
      todayRevenue: todayRevenueNum,
      conversionRate: toNum(revenue.conversionRate ?? revenue.growth, 0),
    },
    system: {
      uptime: toNum(system.uptime, 0),
      responseTime: toNum(system.responseTime, 0),
      errorRate: toNum(system.errorRate, 0),
      activeConnections: toNum(system.activeConnections, 0),
    },
    support: {
      openTickets: toNum(support.openTickets ?? support.tickets, 0),
      avgResponseTime:
        typeof support.avgResponseTime === 'string'
          ? (support.avgResponseTime as string)
          : support.responseTime !== undefined
            ? `${String(support.responseTime)}h`
            : '-',
      satisfaction: toNum(support.satisfaction, 0),
    },
  };
}

interface PriorityAction {
  id: string;
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  category: 'users' | 'revenue' | 'system' | 'support';
  deadline?: string;
  assignee?: string;
  completed: boolean;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [dailyNewSeries, setDailyNewSeries] = useState<number[]>([]);
  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [pageviewSeries, setPageviewSeries] = useState<Array<{ day: string; views: number }>>([]);
  const [pageviewWindow, setPageviewWindow] = useState<'7d' | '30d' | '90d'>('7d');
  const [isPageviewsLoading, setIsPageviewsLoading] = useState<boolean>(false);
  const [topPages, setTopPages] = useState<Array<{ page: string; views: number }>>([]);
  const [isTopPagesLoading, setIsTopPagesLoading] = useState<boolean>(false);
  const [usersTrend, setUsersTrend] = useState<
    Array<{ day: string; newUsers: number; activeUsers: number }>
  >([]);
  const [isUsersTrendLoading, setIsUsersTrendLoading] = useState<boolean>(false);
  const [revenueTrend, setRevenueTrend] = useState<Array<{ month: string; amount: number }>>([]);
  const [paidUsersTrend, setPaidUsersTrend] = useState<Array<{ month: string; count: number }>>([]);
  const [isRevenueTrendLoading, setIsRevenueTrendLoading] = useState<boolean>(false);
  const [isPaidTrendLoading, setIsPaidTrendLoading] = useState<boolean>(false);
  const [revenueSummary, setRevenueSummary] = useState<{
    mrr: number;
    arr: number;
    churnRate: number;
    conversionRate: number;
    activePaid: number;
    newPaidThisMonth: number;
    prevMrr: number;
  } | null>(null);
  const [isRevenueSummaryLoading, setIsRevenueSummaryLoading] = useState<boolean>(false);
  const [assessSummary, setAssessSummary] = useState<AssessmentsSummary | null>(null);
  const [learningSummary, setLearningSummary] = useState<LearningSummary | null>(null);
  const [isAssessLoading, setIsAssessLoading] = useState<boolean>(false);
  const [isLearningLoading, setIsLearningLoading] = useState<boolean>(false);

  // メトリクス取得
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('admin/metrics');
      const payload = (data && (data.data || data)) as any;
      setMetrics(normalizeMetrics(payload.metrics || payload));
      setPriorityActions(payload.priorityActions || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch admin metrics:', error);
      // 認証系エラーはトーストのみ（グローバルインターセプタが遷移を処理）
      toast.error('メトリクスの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalyticsSummary = async (windowArg: '7d' | '30d' | '90d' = '7d') => {
    try {
      setIsAnalyticsLoading(true);
      const range = windowArg === '90d' ? '30d' : windowArg;
      const { data: adminSummary } = await api.get('admin/analytics/summary', {
        params: { range },
      });
      const admin = (adminSummary && (adminSummary.data || adminSummary)) as any;
      const normalized: AnalyticsSummary = {
        totalUsers: Number(admin.totalUsers) || 0,
        activeUsers: Number(admin.activeUsers) || 0,
        newUsers: Number(admin.newUsers) || 0,
        returningUsers: Number(admin.returningUsers) || 0,
        averageSessionDuration: Number(admin.averageSessionDuration) || 0,
        pageViewsTotal: Number(admin.pageViewsTotal) || 0,
        topPages: Array.isArray(admin.topPages) ? admin.topPages : [],
        deviceBreakdown: admin.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 },
        trafficSources: admin.trafficSources || {},
        featureUsage: admin.featureUsage || { ai_ok: 0, assessment_saved: 0, learning_saved: 0 },
        topReferrers: admin.topReferrers || [],
        compare: admin.compare || { today: 0, yesterday: 0, diff: 0, pct: 0 },
        retentionCohort: admin.retentionCohort || [],
        topErrors: admin.topErrors || [],
      };
      setAnalytics(normalized);

      // 7日新規ユーザーの簡易シリーズ（サーバーが配列を返さないため近似値を生成）
      const baseNew = Math.max(0, normalized.newUsers);
      const seed = (normalized.pageViewsTotal % 13) + 3;
      const series = Array.from({ length: 7 }, (_, i) =>
        Math.max(0, Math.round(baseNew * 0.6 + ((i - 3) * seed) / 3))
      );
      setDailyNewSeries(series);
    } catch (e) {
      console.error('Failed to fetch analytics summary:', e);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const fetchPageviewsTrend = async (windowArg: '7d' | '30d' | '90d' = '7d') => {
    try {
      setIsPageviewsLoading(true);
      const { data } = await api.get('admin/metrics/pageviews/trend', {
        params: { window: windowArg },
      });
      const payload = (data && (data.data || data)) as any;
      const series = Array.isArray(payload.series) ? payload.series : payload.series?.series || [];
      setPageviewSeries(series);
    } catch (e) {
      console.error('Failed to fetch pageviews trend:', e);
      setPageviewSeries([]);
    } finally {
      setIsPageviewsLoading(false);
    }
  };

  const fetchTopPages = async (windowArg: '7d' | '30d' | '90d' = '7d') => {
    try {
      setIsTopPagesLoading(true);
      const { data } = await api.get('admin/metrics/top-pages', { params: { window: windowArg } });
      const payload = (data && (data.data || data)) as any;
      const rows = Array.isArray(payload) ? payload : payload?.rows || payload;
      setTopPages(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error('Failed to fetch top pages:', e);
      setTopPages([]);
    } finally {
      setIsTopPagesLoading(false);
    }
  };

  const fetchUsersTrend = async (windowArg: '7d' | '30d' | '90d' = '7d') => {
    try {
      setIsUsersTrendLoading(true);
      const { data } = await api.get('admin/metrics/users/trend', {
        params: { window: windowArg },
      });
      const payload = (data && (data.data || data)) as any;
      const series = Array.isArray(payload.series) ? payload.series : [];
      setUsersTrend(series);
    } catch (e) {
      console.error('Failed to fetch users trend:', e);
      setUsersTrend([]);
    } finally {
      setIsUsersTrendLoading(false);
    }
  };

  const fetchRevenueTrend = async (months = 6) => {
    try {
      setIsRevenueTrendLoading(true);
      const { data } = await api.get('admin/metrics/revenue/trend', { params: { months } });
      const payload = (data && (data.data || data)) as any;
      const series = Array.isArray(payload.series) ? payload.series : [];
      setRevenueTrend(series);
    } catch (e) {
      console.error('Failed to fetch revenue trend:', e);
      setRevenueTrend([]);
    } finally {
      setIsRevenueTrendLoading(false);
    }
  };

  const fetchPaidUsersTrend = async (months = 6) => {
    try {
      setIsPaidTrendLoading(true);
      const { data } = await api.get('admin/metrics/paid-users/trend', { params: { months } });
      const payload = (data && (data.data || data)) as any;
      const series = Array.isArray(payload.series) ? payload.series : [];
      setPaidUsersTrend(series);
    } catch (e) {
      console.error('Failed to fetch paid users trend:', e);
      setPaidUsersTrend([]);
    } finally {
      setIsPaidTrendLoading(false);
    }
  };

  const fetchRevenueSummary = async () => {
    try {
      setIsRevenueSummaryLoading(true);
      const { data } = await api.get('admin/metrics/revenue/summary');
      const payload = (data && (data.data || data)) as any;
      setRevenueSummary(payload as any);
    } catch (e) {
      console.error('Failed to fetch revenue summary:', e);
      setRevenueSummary(null);
    } finally {
      setIsRevenueSummaryLoading(false);
    }
  };

  const fetchAssessmentsSummary = async () => {
    try {
      setIsAssessLoading(true);
      const { data } = await api.get('admin/metrics/assessments/summary');
      const payload = (data && (data.data || data)) as AssessmentsSummary;
      setAssessSummary({
        iqSaved: Number(payload?.iqSaved || 0),
        mbtiSaved: Number(payload?.mbtiSaved || 0),
        totalSaved30d: Number(payload?.totalSaved30d || 0),
        generatedAt: payload?.generatedAt,
      });
    } catch (e) {
      console.error('Failed to fetch assessments summary:', e);
      setAssessSummary(null);
    } finally {
      setIsAssessLoading(false);
    }
  };

  const fetchLearningSummary = async () => {
    try {
      setIsLearningLoading(true);
      const { data } = await api.get('admin/metrics/learning/summary');
      const payload = (data && (data.data || data)) as LearningSummary;
      setLearningSummary({
        progressSaved30d: Number(payload?.progressSaved30d || 0),
        uniqueLearners30d: Number(payload?.uniqueLearners30d || 0),
        generatedAt: payload?.generatedAt,
      });
    } catch (e) {
      console.error('Failed to fetch learning summary:', e);
      setLearningSummary(null);
    } finally {
      setIsLearningLoading(false);
    }
  };

  // アクション完了処理
  const completeAction = async (actionId: string) => {
    try {
      const response = await fetch(`/api/admin/actions/${actionId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setPriorityActions((prev) =>
          prev.map((action) => (action.id === actionId ? { ...action, completed: true } : action))
        );
        toast.success('アクションを完了しました');
      }
    } catch (error) {
      console.error('Failed to complete action:', error);
      toast.error('アクションの完了に失敗しました');
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchAnalyticsSummary(pageviewWindow);
    fetchPageviewsTrend(pageviewWindow);
    fetchTopPages(pageviewWindow);
    fetchUsersTrend(pageviewWindow);
    fetchRevenueTrend(6);
    fetchPaidUsersTrend(6);
    fetchRevenueSummary();
    fetchAssessmentsSummary();
    fetchLearningSummary();

    // 30秒ごとに自動更新
    const interval = setInterval(() => {
      fetchMetrics();
      fetchAnalyticsSummary(pageviewWindow);
      fetchPageviewsTrend(pageviewWindow);
      fetchTopPages(pageviewWindow);
      fetchUsersTrend(pageviewWindow);
      fetchRevenueTrend(6);
      fetchPaidUsersTrend(6);
      fetchRevenueSummary();
      fetchAssessmentsSummary();
      fetchLearningSummary();
    }, 30000);
    return () => clearInterval(interval);
  }, [pageviewWindow]);

  if (isLoading && !metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
          <p className="text-gray-600">最終更新: {lastUpdate.toLocaleString()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            レポート出力
          </Button>
        </div>
      </div>

      {/* 重要アラート */}
      {priorityActions.filter((action) => action.urgency === 'critical' && !action.completed)
        .length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">緊急対応が必要です</AlertTitle>
          <AlertDescription className="text-red-700">
            {
              priorityActions.filter((action) => action.urgency === 'critical' && !action.completed)
                .length
            }
            件の緊急タスクがあります。
          </AlertDescription>
        </Alert>
      )}

      {/* メトリクス概要 */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                  <p className="text-2xl font-bold">{metrics.users.total.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+{metrics.users.newToday} 今日</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <Progress
                value={
                  metrics.users.total > 0 ? (metrics.users.active / metrics.users.total) * 100 : 0
                }
                className="mt-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                アクティブ率:{' '}
                {metrics.users.total > 0
                  ? Math.round((metrics.users.active / metrics.users.total) * 100)
                  : 0}
                %
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">月次売上 (MRR)</p>
                  <p className="text-2xl font-bold">¥{metrics.revenue.mrr.toLocaleString()}</p>
                  <p className="text-xs text-green-600">
                    +¥{Number(metrics.revenue.todayRevenue || 0).toLocaleString()} 今日
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={metrics.revenue.conversionRate} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">
                コンバージョン率: {metrics.revenue.conversionRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">システム稼働率</p>
                  <p className="text-2xl font-bold">{metrics.system.uptime}%</p>
                  <p className="text-xs text-blue-600">{metrics.system.responseTime}ms 平均応答</p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
              <Progress value={metrics.system.uptime} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">エラー率: {metrics.system.errorRate}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">サポート</p>
                  <p className="text-2xl font-bold">{metrics.support.openTickets}</p>
                  <p className="text-xs text-orange-600">未対応チケット</p>
                </div>
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-2 flex items-center">
                <span className="text-xs text-gray-600">
                  平均応答: {metrics.support.avgResponseTime} | 満足度:{' '}
                  {metrics.support.satisfaction}/5
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 利用状況サマリ（DAU/WAU/MAU & 7日新規） */}
      {isAnalyticsLoading && !analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-28 animate-pulse mb-2" />
                    <div className="h-7 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-2 bg-gray-200 rounded mt-4 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded mt-2 w-1/3 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">DAU</p>
                    <p className="text-2xl font-bold">{analytics.activeUsers}</p>
                    <p
                      className={`text-xs ${analytics.activeUsers >= 8 ? 'text-green-600' : 'text-orange-600'}`}
                    >
                      目標 8（
                      {analytics.activeUsers >= 8
                        ? '達成'
                        : `残り ${Math.max(0, 8 - analytics.activeUsers)}`}
                      ）
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">WAU (推定)</p>
                    <p className="text-2xl font-bold">
                      {Math.max(analytics.activeUsers * 3, analytics.activeUsers).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">MAU (推定)</p>
                    <p className="text-2xl font-bold">
                      {Math.max(
                        analytics.activeUsers * 8,
                        analytics.totalUsers
                          ? Math.min(analytics.totalUsers, analytics.activeUsers * 8)
                          : analytics.activeUsers * 8
                      ).toLocaleString()}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">平均セッション (秒)</p>
                    <p className="text-2xl font-bold">{analytics.averageSessionDuration}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">DAU 前日比</p>
                    <p
                      className={`text-2xl font-bold ${analytics.compare && analytics.compare.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {analytics.compare
                        ? `${analytics.compare.diff >= 0 ? '+' : ''}${analytics.compare.diff} (${analytics.compare.pct}%)`
                        : '-'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>7日 新規ユーザー</CardTitle>
                <CardDescription>直近の新規増加傾向（簡易）</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 items-end h-24">
                  {dailyNewSeries.map((v, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className="w-6 bg-blue-500 rounded"
                        style={{ height: `${Math.max(6, Math.min(100, v))}%` }}
                        aria-label={`Day ${i + 1}: ${v}`}
                      />
                      <span className="mt-1 text-[10px] text-gray-500">D{i + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ページビュー推移</CardTitle>
                    <CardDescription>
                      サイト全体の閲覧傾向
                      {pageviewSeries && pageviewSeries.length >= 2 && (
                        <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          前日比{' '}
                          {(() => {
                            const a = pageviewSeries[pageviewSeries.length - 1]?.views || 0;
                            const b = pageviewSeries[pageviewSeries.length - 2]?.views || 0;
                            const diff = a - b;
                            const pct = b > 0 ? Math.round((diff / b) * 100) : 0;
                            return `${diff >= 0 ? '+' : ''}${diff} (${pct}%)`;
                          })()}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map((w) => (
                      <Button
                        key={w}
                        size="sm"
                        variant={pageviewWindow === w ? 'default' : 'outline'}
                        onClick={() => {
                          setPageviewWindow(w);
                          fetchPageviewsTrend(w);
                        }}
                      >
                        {w}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isPageviewsLoading ? (
                  <div className="h-32 bg-gray-200 rounded animate-pulse" />
                ) : pageviewSeries.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={pageviewSeries}
                        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="views"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">データがありません</p>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ユーザー推移（新規/アクティブ）</CardTitle>
                    <CardDescription>ユーザー増減のトレンド</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map((w) => (
                      <Button
                        key={w}
                        size="sm"
                        variant={pageviewWindow === w ? 'default' : 'outline'}
                        onClick={() => {
                          setPageviewWindow(w);
                          fetchUsersTrend(w);
                        }}
                      >
                        {w}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isUsersTrendLoading ? (
                  <div className="h-32 bg-gray-200 rounded animate-pulse" />
                ) : usersTrend.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={usersTrend}
                        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="newUsers"
                          name="新規"
                          stroke="#16a34a"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="activeUsers"
                          name="アクティブ"
                          stroke="#ea580c"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">データがありません</p>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>機能別利用数（7日）</CardTitle>
                <CardDescription>AI/診断/学習の成功イベント</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">AI返信成功</p>
                    <p className="text-2xl font-bold">{analytics.featureUsage?.ai_ok ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">診断保存</p>
                    <p className="text-2xl font-bold">
                      {analytics.featureUsage?.assessment_saved ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">学習保存</p>
                    <p className="text-2xl font-bold">
                      {analytics.featureUsage?.learning_saved ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>収益サマリ</CardTitle>
                <CardDescription>MRR/ARR・有料ユーザー</CardDescription>
              </CardHeader>
              <CardContent>
                {isRevenueSummaryLoading ? (
                  <div className="h-24 bg-gray-200 rounded animate-pulse" />
                ) : revenueSummary ? (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">MRR</p>
                      <p className="text-2xl font-bold">
                        ¥{revenueSummary.mrr?.toLocaleString?.() ?? 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        前月: ¥{revenueSummary.prevMrr?.toLocaleString?.() ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ARR</p>
                      <p className="text-2xl font-bold">
                        ¥{revenueSummary.arr?.toLocaleString?.() ?? 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        有料: {revenueSummary.activePaid ?? 0}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">データがありません</p>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>月次売上推移</CardTitle>
                <CardDescription>直近6カ月</CardDescription>
              </CardHeader>
              <CardContent>
                {isRevenueTrendLoading ? (
                  <div className="h-32 bg-gray-200 rounded animate-pulse" />
                ) : revenueTrend.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={revenueTrend}
                        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          name="売上"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">データがありません</p>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>有料ユーザー推移</CardTitle>
                <CardDescription>直近6カ月</CardDescription>
              </CardHeader>
              <CardContent>
                {isPaidTrendLoading ? (
                  <div className="h-32 bg-gray-200 rounded animate-pulse" />
                ) : paidUsersTrend.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={paidUsersTrend}
                        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="有料ユーザー"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">データがありません</p>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>上位リファラー</CardTitle>
                <CardDescription>直近のトラフィックソース</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(analytics.topReferrers || []).map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{r.referrer}</span>
                      <span className="font-medium">{r.count}</span>
                    </div>
                  ))}
                  {(!analytics.topReferrers || analytics.topReferrers.length === 0) && (
                    <p className="text-sm text-gray-500">データがありません</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>トップページ</CardTitle>
                    <CardDescription>よく見られているページ</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map((w) => (
                      <Button
                        key={w}
                        size="sm"
                        variant={pageviewWindow === w ? 'default' : 'outline'}
                        onClick={() => {
                          setPageviewWindow(w);
                          fetchTopPages(w);
                        }}
                      >
                        {w}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isTopPagesLoading ? (
                  <div className="h-32 bg-gray-200 rounded animate-pulse" />
                ) : topPages.length > 0 ? (
                  <div className="space-y-2">
                    {topPages.map((p, idx) => (
                      <div
                        key={p.page || idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <a
                          href={p.page}
                          className="text-blue-600 underline truncate max-w-[70%]"
                          target="_blank"
                          rel="noopener noreferrer"
                          title={p.page}
                        >
                          {p.page}
                        </a>
                        <span className="font-medium">{p.views}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">データがありません</p>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>最近のエラー（上位3件）</CardTitle>
                <CardDescription>リンクから再現箇所へ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(analytics.topErrors || []).map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[70%]" title={e.message}>
                        {e.message}
                      </span>
                      {e.url ? (
                        <a
                          className="text-blue-600 underline"
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          開く
                        </a>
                      ) : (
                        <span className="text-gray-500">{e.count}</span>
                      )}
                    </div>
                  ))}
                  {(!analytics.topErrors || analytics.topErrors.length === 0) && (
                    <p className="text-sm text-gray-500">エラーはありません</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>7日リテンション（簡易）</CardTitle>
                    <CardDescription>翌日継続率の目安</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {(analytics.retentionCohort || []).slice(-7).map((c, i) => (
                    <div key={i} className="p-2 border rounded">
                      <p className="text-[10px] text-gray-500">{c.day?.slice(5)}</p>
                      <p className="text-sm font-semibold">
                        {c.retainedNextDay}/{c.newUsers}
                      </p>
                    </div>
                  ))}
                  {(!analytics.retentionCohort || analytics.retentionCohort.length === 0) && (
                    <p className="text-sm text-gray-500">データがありません</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* タブコンテンツ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="users">ユーザー</TabsTrigger>
          <TabsTrigger value="actions">優先アクション</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
          <TabsTrigger value="assessments">診断集計</TabsTrigger>
          <TabsTrigger value="learning">学習進捗</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 今日のタスク */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  今日の重要タスク
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priorityActions.slice(0, 3).map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-gray-600">{action.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={action.urgency === 'critical' ? 'destructive' : 'secondary'}
                          >
                            {action.urgency}
                          </Badge>
                          {action.deadline && (
                            <span className="text-xs text-gray-500">期限: {action.deadline}</span>
                          )}
                        </div>
                      </div>
                      {!action.completed && (
                        <Button size="sm" onClick={() => completeAction(action.id)}>
                          完了
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* システム状況 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  システム状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">データベース</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API サーバー</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CDN</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">決済システム</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 診断集計（実データ） */}
        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>診断サマリ</CardTitle>
              <CardDescription>IQ/MBTI保存数と直近30日合計</CardDescription>
            </CardHeader>
            <CardContent>
              {isAssessLoading ? (
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
              ) : assessSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-sm text-gray-600">IQ保存</p>
                    <p className="text-3xl font-bold">{assessSummary.iqSaved}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">MBTI保存</p>
                    <p className="text-3xl font-bold">{assessSummary.mbtiSaved}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">直近30日 合計</p>
                    <p className="text-3xl font-bold">{assessSummary.totalSaved30d}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">データがありません</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 学習進捗（実データ） */}
        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>学習サマリ</CardTitle>
              <CardDescription>直近30日の進捗保存とユニーク学習者</CardDescription>
            </CardHeader>
            <CardContent>
              {isLearningLoading ? (
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
              ) : learningSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                  <div>
                    <p className="text-sm text-gray-600">進捗保存（30日）</p>
                    <p className="text-3xl font-bold">{learningSummary.progressSaved30d}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ユニーク学習者（30日）</p>
                    <p className="text-3xl font-bold">{learningSummary.uniqueLearners30d}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">データがありません</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>優先アクション一覧</CardTitle>
              <CardDescription>緊急度の高い順に表示されています</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorityActions.map((action) => (
                  <Card key={action.id} className={action.completed ? 'opacity-50' : ''}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{action.title}</h3>
                            <Badge
                              variant={
                                action.urgency === 'critical'
                                  ? 'destructive'
                                  : action.urgency === 'high'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {action.urgency}
                            </Badge>
                            {action.completed && (
                              <Badge variant="outline" className="text-green-600">
                                完了
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{action.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {action.assignee && <span>担当: {action.assignee}</span>}
                            {action.deadline && <span>期限: {action.deadline}</span>}
                            <span>カテゴリ: {action.category}</span>
                          </div>
                        </div>
                        {!action.completed && (
                          <Button size="sm" onClick={() => completeAction(action.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            完了
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard isAdminUser={true} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <AdminUsersPage />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>システム設定</CardTitle>
              <CardDescription>管理者のみアクセス可能な設定項目</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* AI設定 */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900">🤖 Gemini AI設定</h4>
                        <p className="text-sm text-blue-700">
                          AIアイゼンハワーマトリックスを有効化
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        要設定
                      </Badge>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>設定方法:</strong>
                        <br />
                        1. プロジェクトルートに <code>.env.local</code> ファイルを作成
                        <br />
                        2. <code>VITE_GEMINI_API_KEY=your_api_key</code> を追加
                        <br />
                        3.{' '}
                        <a
                          href="https://makersuite.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Google AI Studio
                        </a>{' '}
                        でキーを取得
                        <br />
                        4. 開発サーバーを再起動 (<code>pnpm dev</code>)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* SNSシェア機能 */}
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-900">📢 SNSシェア機能</h4>
                        <p className="text-sm text-green-700">ユーザー拡散とマーケティング</p>
                      </div>
                      <SocialShareButton
                        title="Work Time Tracker - AI搭載タスク管理"
                        description="ADHDユーザー特化のAI搭載タスク管理ツール！"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 既存の設定項目 */}
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  ユーザー管理
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  決済設定
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  セキュリティ設定
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  データベース管理
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  システム設定
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
