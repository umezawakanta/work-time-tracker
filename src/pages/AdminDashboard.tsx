import React, { useState, useEffect, useMemo } from 'react';
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
import { api } from '@/services/api/apiConfig';
import SocialShareButton from '@/components/ui/SocialShareButton';
import AdminUsersPage from '@/pages/AdminUsersPage';
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

interface LiveMetrics {
  activeUsers: number;
  completionRate: number;
  avgTaskTime: number;
  todaysTasks: number;
  weeklyTrend: number;
  hourlyActivity: Array<{ hour: string; tasks: number; users: number }>;
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
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [topPagesQuery, setTopPagesQuery] = useState<string>('');
  const [activeUsers24h, setActiveUsers24h] = useState<number | null>(null);
  const [isDauLoading, setIsDauLoading] = useState<boolean>(false);
  const [retention, setRetention] = useState<Array<{ date: string; size: number; days: number[] }>>(
    []
  );
  const [isRetentionLoading, setIsRetentionLoading] = useState<boolean>(false);
  const [errorReports, setErrorReports] = useState<
    Array<{ createdAt: string; message: string; url?: string; email?: string }>
  >([]);
  const [isErrorReportsLoading, setIsErrorReportsLoading] = useState<boolean>(false);

  // 開発フロー（承認制）
  const { data: derivedStatuses, refresh: refreshDerived } = useDerivedFeatureStatuses();
  const adminFeatureId = 'admin';
  const adminSuggested = derivedStatuses?.suggested?.[adminFeatureId];
  const adminApproved = derivedStatuses?.approved?.[adminFeatureId];
  const adminEffective = derivedStatuses?.effective?.[adminFeatureId];

  const approveNextStep = () => {
    if (!adminApproved || !adminSuggested) return;
    const next = toNextStatus(adminApproved);
    if (!next) return;
    const idxNext = NEW_STATUS_ORDER.indexOf(next);
    const idxSuggested = NEW_STATUS_ORDER.indexOf(adminSuggested);
    const toSet = idxNext <= idxSuggested ? next : adminSuggested;
    setApprovedStatus(adminFeatureId, toSet);
    refreshDerived();
  };

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
      // Prefer simpler analytics daily endpoint; map to UI shape
      const days = windowArg === '90d' ? 90 : windowArg === '30d' ? 30 : 7;
      const { data } = await api.get('analytics/pageviews/daily', { params: { days } });
      const payload = (data && (data.data || data)) as any;
      const list = Array.isArray(payload?.series) ? payload.series : [];
      const series = list.map((p: any) => ({
        day: p.date || p.day,
        views: Number(p.count ?? p.views ?? 0),
      }));
      setPageviewSeries(series);
    } catch (e) {
      console.error('Failed to fetch pageviews trend:', e);
      setPageviewSeries([]);
    } finally {
      setIsPageviewsLoading(false);
    }
  };

  const fetchActiveUsers = async (hours = 24) => {
    try {
      setIsDauLoading(true);
      const { data } = await api.get('analytics/users/active', { params: { hours } });
      const payload = (data && (data.data || data)) as any;
      const n = Number(payload?.activeUsers ?? payload?.count ?? 0);
      setActiveUsers24h(Number.isFinite(n) ? n : 0);
    } catch (e) {
      console.error('Failed to fetch active users (24h):', e);
      setActiveUsers24h(null);
    } finally {
      setIsDauLoading(false);
    }
  };

  const fetchTopPages = async (windowArg: '7d' | '30d' | '90d' = '7d') => {
    try {
      setIsTopPagesLoading(true);
      const { data } = await api.get('admin/metrics/top-pages', { params: { window: windowArg } });
      const payload = (data && (data.data || data)) as any;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.rows)
          ? payload.rows
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
      setTopPages(rows);
    } catch (e) {
      console.error('Failed to fetch top pages:', e);
      setTopPages([]);
    } finally {
      setIsTopPagesLoading(false);
    }
  };

  const fetchRetention30d = async () => {
    try {
      setIsRetentionLoading(true);
      const { data } = await api.get('analytics/retention/30d');
      const payload = (data && (data.data || data)) as any;
      const rows = Array.isArray(payload?.cohorts) ? payload.cohorts : [];
      setRetention(rows);
    } catch (e) {
      console.error('Failed to fetch 30d retention:', e);
      setRetention([]);
    } finally {
      setIsRetentionLoading(false);
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

  const fetchErrorReports = async (limit = 10) => {
    try {
      setIsErrorReportsLoading(true);
      const { data } = await api.get('admin/error-reports', { params: { limit } });
      const payload = (data && (data.data || data)) as any;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setErrorReports(
        rows.map((r: any) => ({
          createdAt: String(r.createdAt || r.timestamp || ''),
          message: String(r.message || ''),
          url: r.url ? String(r.url) : undefined,
          email: r.email ? String(r.email) : undefined,
        }))
      );
    } catch (e) {
      console.error('Failed to fetch error reports:', e);
      setErrorReports([]);
    } finally {
      setIsErrorReportsLoading(false);
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

  const fetchLiveMetrics = async () => {
    try {
      setIsLiveLoading(true);
      const { data } = await api.get('analytics/live-metrics');
      const payload = (data && (data.data || data)) as Partial<LiveMetrics> | null;
      const normalized: LiveMetrics = {
        activeUsers: Number(payload?.activeUsers ?? 0),
        completionRate: Number(payload?.completionRate ?? 0),
        avgTaskTime: Number(payload?.avgTaskTime ?? 0),
        todaysTasks: Number(payload?.todaysTasks ?? 0),
        weeklyTrend: Number(payload?.weeklyTrend ?? 0),
        hourlyActivity: Array.isArray(payload?.hourlyActivity) ? payload!.hourlyActivity! : [],
      };
      setLiveMetrics(normalized);
    } catch (e) {
      console.error('Failed to fetch live metrics:', e);
      setLiveMetrics(null);
    } finally {
      setIsLiveLoading(false);
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
    fetchLiveMetrics();
    fetchActiveUsers(24);
    fetchRetention30d();
    fetchErrorReports(10);

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
      fetchLiveMetrics();
      fetchActiveUsers(24);
      fetchRetention30d();
      fetchErrorReports(10);
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
          {isFeatureAccessible('/_bg/admin/title').allowed && (
            <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
          )}
          {isFeatureAccessible('/_bg/admin/last-updated').allowed && (
            <p className="text-gray-600">最終更新: {lastUpdate.toLocaleString()}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isFeatureAccessible('/_bg/admin/window-7d').allowed && (
            <Button
              variant={pageviewWindow === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPageviewWindow('7d')}
            >
              7d
            </Button>
          )}
          {isFeatureAccessible('/_bg/admin/window-30d').allowed && (
            <Button
              variant={pageviewWindow === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPageviewWindow('30d')}
            >
              30d
            </Button>
          )}
          {isFeatureAccessible('/_bg/admin/window-90d').allowed && (
            <Button
              variant={pageviewWindow === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPageviewWindow('90d')}
            >
              90d
            </Button>
          )}
          {isFeatureAccessible('/_bg/admin/refresh').allowed && (
            <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              更新
            </Button>
          )}
          {/* 承認付き進捗フロー制御 */}
          {adminApproved && isFeatureAccessible('/_bg/admin/approve-next').allowed && (
            <Button variant="default" size="sm" onClick={approveNextStep}>
              次の段階を承認
            </Button>
          )}
          {isFeatureAccessible('/_bg/admin/export-report').allowed && (
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              レポート出力
            </Button>
          )}
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

      {/* 概要カードはタブ内に配置するため、ここでは描画しない */}

      {/* 利用状況サマリ（analyticsタブに集約） */}

      {/* タブコンテンツ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          id="admin-tabs"
          className="grid w-full grid-cols-7 sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b"
        >
          {isFeatureAccessible('/admin/overview').allowed && (
            <TabsTrigger value="overview">概要</TabsTrigger>
          )}
          {isFeatureAccessible('/admin/users').allowed && (
            <TabsTrigger value="users">ユーザー</TabsTrigger>
          )}
          {isFeatureAccessible('/admin/actions').allowed && (
            <TabsTrigger value="actions">優先アクション</TabsTrigger>
          )}
          {isFeatureAccessible('/admin/analytics').allowed && (
            <TabsTrigger value="analytics">分析</TabsTrigger>
          )}
          {isFeatureAccessible('/admin/errors').allowed && (
            <TabsTrigger value="errors">エラー監視</TabsTrigger>
          )}
          {isFeatureAccessible('/admin/settings').allowed && (
            <TabsTrigger value="settings">設定</TabsTrigger>
          )}
          {isFeatureAccessible('/admin/assessments').allowed && (
            <TabsTrigger value="assessments">診断集計</TabsTrigger>
          )}
          {isFeatureAccessible('/admin/learning').allowed && (
            <TabsTrigger value="learning">学習進捗</TabsTrigger>
          )}
        </TabsList>

        {isFeatureAccessible('/admin/overview').allowed && (
          <TabsContent value="overview" className="space-y-6">
            {/* 概要メトリクス */}
            {/* 開発フローの現在位置 */}
            <Card>
              <CardHeader>
                <CardTitle>開発フロー（承認必須）</CardTitle>
                <CardDescription>
                  提案: {adminSuggested ?? '—'} / 承認: {adminApproved ?? '—'} / 有効:{' '}
                  {adminEffective ?? '—'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {NEW_STATUS_ORDER.map((s) => (
                    <Badge
                      key={s}
                      variant={
                        adminEffective === s
                          ? 'default'
                          : adminApproved === s
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                        <p className="text-2xl font-bold">
                          {(
                            Number(analytics?.totalUsers || 0) || metrics.users.total
                          ).toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600">+{metrics.users.newToday} 今日</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <Progress
                      value={
                        (Number(analytics?.totalUsers || 0) || metrics.users.total) > 0
                          ? (metrics.users.active /
                              (Number(analytics?.totalUsers || 0) || metrics.users.total)) *
                            100
                          : 0
                      }
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      アクティブ率:{' '}
                      {(Number(analytics?.totalUsers || 0) || metrics.users.total) > 0
                        ? Math.round(
                            (metrics.users.active /
                              (Number(analytics?.totalUsers || 0) || metrics.users.total)) *
                              100
                          )
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
                        <p className="text-2xl font-bold">
                          ¥{metrics.revenue.mrr.toLocaleString()}
                        </p>
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
                        <p className="text-xs text-blue-600">
                          {metrics.system.responseTime}ms 平均応答
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-purple-600" />
                    </div>
                    <Progress value={metrics.system.uptime} className="mt-2" />
                    <p className="text-xs text-gray-600 mt-1">
                      エラー率: {metrics.system.errorRate}%
                    </p>
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

                {/* ライブメトリクス */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">ライブアクティブ</p>
                        <p className="text-2xl font-bold">
                          {isLiveLoading ? '—' : (liveMetrics?.activeUsers ?? 0)}
                        </p>
                        <p className="text-xs text-gray-600">
                          完了率: {isLiveLoading ? '—' : `${liveMetrics?.completionRate ?? 0}%`}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-rose-500" />
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      今日のタスク: {isLiveLoading ? '—' : (liveMetrics?.todaysTasks ?? 0)} /
                      週次傾向: {isLiveLoading ? '—' : (liveMetrics?.weeklyTrend ?? 0)}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

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
        )}

        {/* 診断集計（実データ） */}
        {isFeatureAccessible('/admin/assessments').allowed && (
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
        )}

        {/* 学習進捗（実データ） */}
        {isFeatureAccessible('/admin/learning').allowed && (
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
        )}

        {isFeatureAccessible('/admin/actions').allowed && (
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
        )}

        {isFeatureAccessible('/admin/analytics').allowed && (
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard isAdminUser={true} hideTopPages={true} />
            {/* 30日リテンション */}
            <Card>
              <CardHeader>
                <CardTitle>30日リテンション（簡易）</CardTitle>
                <CardDescription>D1%は翌日継続率。サイズはコホート人数。</CardDescription>
              </CardHeader>
              <CardContent>
                {isRetentionLoading ? (
                  <div className="h-24 bg-gray-200 rounded animate-pulse" />
                ) : retention.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="p-2">開始日</th>
                          <th className="p-2">サイズ</th>
                          <th className="p-2">D1%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {retention.slice(-14).map((r, i) => {
                          const d1 = r.days?.[1] || 0;
                          const pct = r.size > 0 ? Math.round((d1 / r.size) * 100) : 0;
                          return (
                            <tr key={`${r.date}-${i}`} className="border-t">
                              <td className="p-2 whitespace-nowrap">{r.date}</td>
                              <td className="p-2">{r.size}</td>
                              <td className="p-2">{pct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">データがありません</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* エラーダッシュボード（統合タブ） */}
        {isFeatureAccessible('/admin/errors').allowed && (
          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>エラー監視ダッシュボード</CardTitle>
                <CardDescription>リアルタイム監視と自動復旧</CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorMonitoringDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isFeatureAccessible('/admin/users').allowed && (
          <TabsContent value="users" className="space-y-6">
            <AdminUsersPage />
          </TabsContent>
        )}

        {isFeatureAccessible('/admin/settings').allowed && (
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
        )}
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
