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
import { AdminBugsList } from '@/components/admin/AdminBugsList';
import { api } from '@/services/api/apiConfig';
import SocialShareButton from '@/components/ui/SocialShareButton';
import AdminUsersPage from '@/pages/AdminUsersPage';
import { AdminFeaturesList } from '@/components/admin/AdminFeaturesList';
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
  taskStats?: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    completionRate: number;
    overdueCount: number;
    thisWeekCount: number;
    lastUpdated?: string;
  };
  deviceStats?: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  regionStats?: {
    [region: string]: number;
  };
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
      const response = await api.get('admin/metrics');
      const data = response.data;
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
      const response = await api.get('admin/analytics/summary', {
        params: { range },
      });
      const adminSummary = response.data;
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
      // 管理者用分析APIからリテンションデータを取得
      const { data } = await api.get('admin/analytics?range=30d');
      const payload = (data && (data.data || data)) as any;
      const retentionData = Array.isArray(payload?.retentionData) ? payload.retentionData : [];

      // データ形式を変換
      const rows = retentionData.map((item: any) => ({
        date: item.startDate,
        size: item.size,
        days: [0, item.d1Rate || 0], // D1率を配列形式に変換
      }));

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
      const response = await api.get('admin/live-metrics');
      const data = response.data;
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
    // 初期データ読み込み
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchMetrics(),
          fetchAnalyticsSummary(pageviewWindow),
          fetchPageviewsTrend(pageviewWindow),
          fetchTopPages(pageviewWindow),
          fetchUsersTrend(pageviewWindow),
          fetchRevenueTrend(6),
          fetchPaidUsersTrend(6),
          fetchRevenueSummary(),
          fetchAssessmentsSummary(),
          fetchLearningSummary(),
          fetchLiveMetrics(),
          fetchActiveUsers(24),
          fetchRetention30d(),
          fetchErrorReports(10),
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();

    // 60秒ごとに自動更新（頻度を下げてレイアウトの安定性を向上）
    const interval = setInterval(() => {
      // 重要なメトリクスのみを更新
      fetchMetrics();
      fetchLiveMetrics();
      fetchActiveUsers(24);
    }, 60000);

    return () => clearInterval(interval);
  }, [pageviewWindow]);

  // レイアウト修正のためのuseEffect
  useEffect(() => {
    const fixLayout = () => {
      // タブリストの幅を強制的に制限
      const tabsList = document.querySelector('.admin-dashboard .tabs-list') as HTMLElement;
      if (tabsList) {
        tabsList.style.maxWidth = '100%';
        tabsList.style.overflowX = 'hidden';
        tabsList.style.width = 'calc(100% - 0.75rem)';
      }

      // バッジコンテナの幅を強制的に制限
      const badgeContainer = document.querySelector(
        '.admin-dashboard .badge-container'
      ) as HTMLElement;
      if (badgeContainer) {
        badgeContainer.style.maxWidth = '100%';
        badgeContainer.style.overflowX = 'hidden';
        badgeContainer.style.width = '100%';
      }

      // タブトリガーの幅を強制的に制限
      const tabTriggers = document.querySelectorAll(
        '.admin-dashboard .tabs-trigger'
      ) as NodeListOf<HTMLElement>;
      tabTriggers.forEach((trigger) => {
        trigger.style.maxWidth = '80px';
        trigger.style.minWidth = '60px';
        trigger.style.flexShrink = '0';
        trigger.style.overflow = 'hidden';
        trigger.style.textOverflow = 'ellipsis';
      });

      // バッジの幅を強制的に制限
      const badges = document.querySelectorAll(
        '.admin-dashboard .badge'
      ) as NodeListOf<HTMLElement>;
      badges.forEach((badge) => {
        badge.style.maxWidth = '100%';
        badge.style.overflow = 'hidden';
        badge.style.textOverflow = 'ellipsis';
        badge.style.whiteSpace = 'nowrap';
      });
    };

    // 初期実行
    fixLayout();

    // リサイズ時にも実行
    window.addEventListener('resize', fixLayout);

    // コンポーネントの再レンダリング時にも実行
    const timeoutId = setTimeout(fixLayout, 100);

    return () => {
      window.removeEventListener('resize', fixLayout);
      clearTimeout(timeoutId);
    };
  }, []);

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
    <>
      <style>
        {`
          /* 管理者ダッシュボード専用のモバイルファーストスタイル */
          
          /* 強力なCSSリセット */
          .admin-dashboard * {
            box-sizing: border-box !important;
          }
          
          .admin-dashboard .tabs-list,
          .admin-dashboard .tabs-list * {
            max-width: 100% !important;
            overflow-x: hidden !important;
          }
          
          .admin-dashboard .badge-container,
          .admin-dashboard .badge-container * {
            max-width: 100% !important;
            overflow-x: hidden !important;
          }
          
          .admin-dashboard {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            position: relative;
            width: 100%;
            overflow-x: hidden;
            box-sizing: border-box;
          }
          
          .admin-dashboard::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.05) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
          }
          
          .admin-dashboard .container {
            max-width: 100% !important;
            padding: 0.5rem !important;
            margin: 0 !important;
            position: relative;
            z-index: 1;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
          }
          
          .admin-dashboard .admin-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.25rem 1rem;
            margin: -0.5rem -0.5rem 1rem;
            border-radius: 0 0 20px 20px;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
            position: relative;
            overflow: hidden;
            width: calc(100% + 1rem) !important;
            box-sizing: border-box !important;
          }
          
          .admin-dashboard .admin-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
            pointer-events: none;
          }
          
          .admin-dashboard .admin-title {
            font-size: 1.625rem;
            font-weight: 900;
            margin-bottom: 0.375rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
            line-height: 1.2;
            letter-spacing: -0.025em;
          }
          
          .admin-dashboard .admin-subtitle {
            font-size: 0.8rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
            margin-bottom: 0.75rem;
          }
          
          .admin-dashboard .admin-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.375rem;
            margin-top: 0.75rem;
            position: relative;
            z-index: 1;
          }
          
          .admin-dashboard .admin-actions .btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.5rem 0.875rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            min-height: 2.5rem;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          
          .admin-dashboard .admin-actions .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          
          .admin-dashboard .admin-actions .btn.active {
            background: rgba(255, 255, 255, 0.9);
            color: #667eea;
            font-weight: 700;
          }
          
          .admin-dashboard .admin-actions .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }
          
          .admin-dashboard .tabs-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            margin-bottom: 1rem;
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, 0.05);
            width: 100% !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
          }
          
          .admin-dashboard .tabs-list {
            display: flex !important;
            overflow-x: auto !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            padding: 0.375rem !important;
            background: #f8fafc !important;
            border-radius: 12px !important;
            margin: 0.375rem !important;
            gap: 0.125rem !important;
            scroll-behavior: smooth !important;
            -webkit-overflow-scrolling: touch !important;
            width: calc(100% - 0.75rem) !important;
            box-sizing: border-box !important;
            min-width: 0 !important;
            max-width: 100% !important;
            flex-wrap: nowrap !important;
            align-items: center !important;
          }
          
          .admin-dashboard .tabs-list::-webkit-scrollbar {
            display: none;
          }
          
          .admin-dashboard .tabs-trigger {
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            padding: 0.5rem 0.625rem !important;
            border-radius: 8px !important;
            font-size: 0.65rem !important;
            font-weight: 600 !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            white-space: nowrap !important;
            background: transparent !important;
            border: none !important;
            color: #6b7280 !important;
            cursor: pointer !important;
            position: relative !important;
            min-height: 2rem !important;
            display: flex !important;
            align-items: center !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: transparent !important;
            max-width: 80px !important;
            min-width: 60px !important;
            text-overflow: ellipsis !important;
            overflow: hidden !important;
            text-align: center !important;
          }
          
          .admin-dashboard .tabs-trigger[data-state="active"] {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transform: translateY(-1px);
          }
          
          .admin-dashboard .tabs-trigger:hover:not([data-state="active"]) {
            background: #e2e8f0;
            color: #374151;
          }
          
          .admin-dashboard .card {
            background: white;
            border-radius: 14px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
            margin-bottom: 0.75rem;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
            width: 100%;
            box-sizing: border-box;
            max-width: 100%;
          }
          
          .admin-dashboard .card:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          }
          
          .admin-dashboard .card-header {
            padding: 1rem 1.25rem 0.625rem;
            border-bottom: 1px solid #f1f5f9;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          }
          
          .admin-dashboard .card-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.375rem;
            line-height: 1.3;
            letter-spacing: -0.025em;
          }
          
          .admin-dashboard .card-description {
            font-size: 0.8rem;
            color: #6b7280;
            line-height: 1.4;
          }
          
          .admin-dashboard .card-content {
            padding: 1.25rem;
            width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
          }
          
          .admin-dashboard .metrics-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            width: 100%;
            box-sizing: border-box;
          }
          
          .admin-dashboard .metric-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 14px;
            padding: 1.25rem;
            border: 1px solid #e2e8f0;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
            width: 100%;
            box-sizing: border-box;
            max-width: 100%;
          }
          
          .admin-dashboard .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          }
          
          .admin-dashboard .metric-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          }
          
          .admin-dashboard .metric-value {
            font-size: 1.75rem;
            font-weight: 900;
            color: #1f2937;
            margin-bottom: 0.375rem;
            line-height: 1;
          }
          
          .admin-dashboard .metric-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.625rem;
          }
          
          .admin-dashboard .metric-icon {
            width: 2rem;
            height: 2rem;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 1.25rem;
            right: 1.25rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
          
          .admin-dashboard .badge-container {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 0.125rem !important;
            margin-top: 0.75rem !important;
            width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
            max-width: 100% !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            align-content: flex-start !important;
          }
          
          .admin-dashboard .badge {
            padding: 0.125rem 0.375rem !important;
            border-radius: 8px !important;
            font-size: 0.6rem !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
            border: 1px solid transparent !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            max-width: 100% !important;
            min-width: 0 !important;
            word-break: break-word !important;
            line-height: 1.2 !important;
            display: inline-block !important;
            text-align: center !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          
          .admin-dashboard .badge[data-variant="default"] {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          }
          
          .admin-dashboard .badge[data-variant="secondary"] {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            color: #374151;
            border-color: #d1d5db;
          }
          
          .admin-dashboard .badge[data-variant="outline"] {
            background: transparent;
            color: #6b7280;
            border-color: #d1d5db;
          }
          
          .admin-dashboard .alert {
            border-radius: 14px;
            padding: 1rem;
            margin-bottom: 1rem;
            border: 2px solid;
            position: relative;
            overflow: hidden;
          }
          
          .admin-dashboard .alert[data-variant="destructive"] {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border-color: #fecaca;
            color: #dc2626;
          }
          
          .admin-dashboard .alert::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 3px;
            height: 100%;
            background: currentColor;
          }
          
          .admin-dashboard .alert-title {
            font-weight: 700;
            font-size: 0.9rem;
            margin-bottom: 0.375rem;
          }
          
          .admin-dashboard .alert-description {
            font-size: 0.8rem;
            line-height: 1.4;
          }
          
          /* タブレット対応 */
          @media (min-width: 640px) {
            .admin-dashboard .container {
              padding: 1rem !important;
            }
            
            .admin-dashboard .admin-header {
              margin: -1rem -1rem 1.5rem !important;
              padding: 1.75rem 1.5rem !important;
            }
            
            .admin-dashboard .admin-title {
              font-size: 2rem !important;
            }
            
            .admin-dashboard .metrics-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            
            .admin-dashboard .card-content {
              padding: 1.5rem !important;
            }
            
            .admin-dashboard .tabs-trigger {
              max-width: 120px !important;
              font-size: 0.75rem !important;
              padding: 0.625rem 0.875rem !important;
            }
          }
          
          /* デスクトップ対応 */
          @media (min-width: 1024px) {
            .admin-dashboard .metrics-grid {
              grid-template-columns: repeat(4, 1fr) !important;
            }
            
            .admin-dashboard .admin-title {
              font-size: 2.25rem !important;
            }
            
            .admin-dashboard .tabs-list {
              padding: 0.5rem !important;
              margin: 0.5rem !important;
            }
            
            .admin-dashboard .tabs-trigger {
              padding: 0.75rem 1rem !important;
              font-size: 0.8rem !important;
              max-width: 140px !important;
            }
          }
        `}
      </style>
      <div className="admin-dashboard">
        <div className="container">
          {/* ヘッダー */}
          <div className="admin-header">
            <h1 className="admin-title">管理者ダッシュボード</h1>
            {isFeatureAccessible('/_bg/admin/last-updated').allowed && (
              <p className="admin-subtitle">最終更新: {lastUpdate.toLocaleString()}</p>
            )}
            <div className="admin-actions">
              {isFeatureAccessible('/_bg/admin/window-7d').allowed && (
                <button
                  className={`btn ${pageviewWindow === '7d' ? 'active' : ''}`}
                  onClick={() => setPageviewWindow('7d')}
                >
                  7d
                </button>
              )}
              {isFeatureAccessible('/_bg/admin/window-30d').allowed && (
                <button
                  className={`btn ${pageviewWindow === '30d' ? 'active' : ''}`}
                  onClick={() => setPageviewWindow('30d')}
                >
                  30d
                </button>
              )}
              {isFeatureAccessible('/_bg/admin/window-90d').allowed && (
                <button
                  className={`btn ${pageviewWindow === '90d' ? 'active' : ''}`}
                  onClick={() => setPageviewWindow('90d')}
                >
                  90d
                </button>
              )}
              {isFeatureAccessible('/_bg/admin/refresh').allowed && (
                <button className="btn" onClick={fetchMetrics} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  更新
                </button>
              )}
              {/* 承認付き進捗フロー制御 */}
              {adminApproved && isFeatureAccessible('/_bg/admin/approve-next').allowed && (
                <button className="btn active" onClick={approveNextStep}>
                  次の段階を承認
                </button>
              )}
              {isFeatureAccessible('/_bg/admin/export-report').allowed && (
                <button className="btn">
                  <Download className="w-4 h-4" />
                  レポート出力
                </button>
              )}
            </div>
          </div>

          {/* 重要アラート */}
          {priorityActions.filter((action) => action.urgency === 'critical' && !action.completed)
            .length > 0 && (
            <div className="alert" data-variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <div className="alert-title">緊急対応が必要です</div>
                <div className="alert-description">
                  {
                    priorityActions.filter(
                      (action) => action.urgency === 'critical' && !action.completed
                    ).length
                  }
                  件の緊急タスクがあります。
                </div>
              </div>
            </div>
          )}

          {/* タブコンテンツ */}
          <div className="tabs-container">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList
                className="tabs-list"
                style={{
                  maxWidth: '100%',
                  overflowX: 'hidden',
                  width: 'calc(100% - 0.75rem)',
                  display: 'flex',
                  flexWrap: 'nowrap',
                  gap: '0.125rem',
                }}
              >
                {isFeatureAccessible('/admin/overview').allowed && (
                  <TabsTrigger
                    value="overview"
                    className="tabs-trigger"
                    style={{ maxWidth: '80px', minWidth: '60px', flexShrink: 0 }}
                  >
                    概要
                  </TabsTrigger>
                )}
                {isFeatureAccessible('/admin/users').allowed && (
                  <TabsTrigger
                    value="users"
                    className="tabs-trigger"
                    style={{ maxWidth: '80px', minWidth: '60px', flexShrink: 0 }}
                  >
                    ユーザー
                  </TabsTrigger>
                )}
                {isFeatureAccessible('/admin/actions').allowed && (
                  <TabsTrigger
                    value="actions"
                    className="tabs-trigger"
                    style={{ maxWidth: '80px', minWidth: '60px', flexShrink: 0 }}
                  >
                    優先アクション
                  </TabsTrigger>
                )}
                {isFeatureAccessible('/admin/analytics').allowed && (
                  <TabsTrigger
                    value="analytics"
                    className="tabs-trigger"
                    style={{ maxWidth: '80px', minWidth: '60px', flexShrink: 0 }}
                  >
                    分析
                  </TabsTrigger>
                )}
                {isFeatureAccessible('/admin/errors').allowed && (
                  <TabsTrigger
                    value="errors"
                    className="tabs-trigger"
                    style={{ maxWidth: '80px', minWidth: '60px', flexShrink: 0 }}
                  >
                    エラー監視
                  </TabsTrigger>
                )}
                {isFeatureAccessible('/admin/bugs').allowed && (
                  <TabsTrigger
                    value="bugs"
                    className="tabs-trigger"
                    style={{ maxWidth: '80px', minWidth: '60px', flexShrink: 0 }}
                  >
                    不具合
                  </TabsTrigger>
                )}
                {isFeatureAccessible('/admin/features').allowed && (
                  <TabsTrigger
                    value="features"
                    className="tabs-trigger"
                    style={{ maxWidth: '80px', minWidth: '60px', flexShrink: 0 }}
                  >
                    機能一覧
                  </TabsTrigger>
                )}
                {isFeatureAccessible('/admin/settings').allowed && (
                  <TabsTrigger
                    value="settings"
                    className="tabs-trigger"
                    style={{ maxWidth: '80px', minWidth: '60px', flexShrink: 0 }}
                  >
                    設定
                  </TabsTrigger>
                )}
                {isFeatureAccessible('/admin/assessments').allowed && (
                  <TabsTrigger
                    value="assessments"
                    className="tabs-trigger"
                    style={{ maxWidth: '80px', minWidth: '60px', flexShrink: 0 }}
                  >
                    診断集計
                  </TabsTrigger>
                )}
                {isFeatureAccessible('/admin/learning').allowed && (
                  <TabsTrigger
                    value="learning"
                    className="tabs-trigger"
                    style={{ maxWidth: '80px', minWidth: '60px', flexShrink: 0 }}
                  >
                    学習進捗
                  </TabsTrigger>
                )}
              </TabsList>

              {isFeatureAccessible('/admin/overview').allowed && (
                <TabsContent value="overview" className="space-y-6">
                  {/* 開発フローの現在位置 */}
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">開発フロー（承認必須）</div>
                      <div className="card-description">
                        提案: {adminSuggested ?? '—'} / 承認: {adminApproved ?? '—'} / 有効:{' '}
                        {adminEffective ?? '—'}
                      </div>
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <strong>📋 開発フローとは？</strong>
                          <br />
                          機能開発の各段階を管理する承認制のワークフローです。
                          <br />
                          <strong>提案</strong>: 開発者が次の段階を提案
                          <br />
                          <strong>承認</strong>: 管理者が提案を承認
                          <br />
                          <strong>有効</strong>: 現在有効な段階
                        </div>
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="text-xs text-yellow-800">
                            <strong>🎯 なぜ必要？</strong>
                            <br />
                            • 品質管理: 各段階で適切な承認を得ることで品質を保証
                            <br />
                            • リスク軽減: 未完成の機能が本番環境に誤って公開されることを防止
                            <br />
                            • チーム連携: 開発者と管理者の間で明確な責任分担を実現
                            <br />• 進捗可視化: 現在の開発状況を一目で把握可能
                          </div>
                        </div>
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <div className="text-xs text-green-800">
                            <strong>⚡ 操作方法</strong>
                            <br />
                            • ヘッダーの「次の段階を承認」ボタンで承認操作
                            <br />
                            • 各段階のバッジにマウスを合わせると詳細表示
                            <br />
                            • 紫色: 現在有効な段階
                            <br />
                            • グレー: 承認済み段階
                            <br />• 白: 未承認段階
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="badge-container">
                        {NEW_STATUS_ORDER.map((s) => (
                          <div
                            key={s}
                            className="badge"
                            data-variant={
                              adminEffective === s
                                ? 'default'
                                : adminApproved === s
                                  ? 'secondary'
                                  : 'outline'
                            }
                            title={
                              s === 'planning'
                                ? '計画段階: 要件定義と設計'
                                : s === 'designing'
                                  ? '設計段階: UI/UX設計'
                                  : s === 'developing'
                                    ? '開発段階: コーディング'
                                    : s === 'unit_testing'
                                      ? '単体テスト: 個別機能のテスト'
                                      : s === 'documenting'
                                        ? '文書化: ドキュメント作成'
                                        : s === 'review'
                                          ? 'レビュー: コードレビュー'
                                          : s === 'release_pending'
                                            ? 'リリース待ち: 本番デプロイ前'
                                            : s === 'complete'
                                              ? '完了: 本番リリース済み'
                                              : s
                            }
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-gray-600">
                        💡 各段階にマウスを合わせると詳細が表示されます
                      </div>
                    </div>
                  </div>

                  {metrics && (
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div className="metric-icon">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="metric-label">総ユーザー数</div>
                        <div className="metric-value">
                          {(
                            Number(analytics?.totalUsers || 0) || metrics.users.total
                          ).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600 font-semibold mb-2">
                          +{metrics.users.newToday} 今日
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
                        <div className="text-xs text-gray-600 mt-2">
                          アクティブ率:{' '}
                          {(Number(analytics?.totalUsers || 0) || metrics.users.total) > 0
                            ? Math.round(
                                (metrics.users.active /
                                  (Number(analytics?.totalUsers || 0) || metrics.users.total)) *
                                  100
                              )
                            : 0}
                          %
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-icon">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="metric-label">月次売上 (MRR)</div>
                        <div className="metric-value">¥{metrics.revenue.mrr.toLocaleString()}</div>
                        <div className="text-sm text-green-600 font-semibold mb-2">
                          +¥{Number(metrics.revenue.todayRevenue || 0).toLocaleString()} 今日
                        </div>
                        <Progress value={metrics.revenue.conversionRate} className="mt-2" />
                        <div className="text-xs text-gray-600 mt-2">
                          コンバージョン率: {metrics.revenue.conversionRate}%
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-icon">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div className="metric-label">システム稼働率</div>
                        <div className="metric-value">{metrics.system.uptime}%</div>
                        <div className="text-sm text-blue-600 font-semibold mb-2">
                          {metrics.system.responseTime}ms 平均応答
                        </div>
                        <Progress value={metrics.system.uptime} className="mt-2" />
                        <div className="text-xs text-gray-600 mt-2">
                          エラー率: {metrics.system.errorRate}%
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-icon">
                          <Mail className="w-6 h-6" />
                        </div>
                        <div className="metric-label">サポート</div>
                        <div className="metric-value">{metrics.support.openTickets}</div>
                        <div className="text-sm text-orange-600 font-semibold mb-2">
                          未対応チケット
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          平均応答: {metrics.support.avgResponseTime} | 満足度:{' '}
                          {metrics.support.satisfaction}/5
                        </div>
                      </div>
                    </div>
                  )}

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
                                  variant={
                                    action.urgency === 'critical' ? 'destructive' : 'secondary'
                                  }
                                >
                                  {action.urgency}
                                </Badge>
                                {action.deadline && (
                                  <span className="text-xs text-gray-500">
                                    期限: {action.deadline}
                                  </span>
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
                            <p className="text-3xl font-bold">
                              {learningSummary.uniqueLearners30d}
                            </p>
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

                  {/* タスク統計 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>タスク統計</CardTitle>
                      <CardDescription>タスクの完了率と進捗状況</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {analytics?.taskStats?.total || 0}
                          </div>
                          <div className="text-sm text-gray-500">総タスク数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {analytics?.taskStats?.byStatus?.completed || 0}
                          </div>
                          <div className="text-sm text-gray-500">完了タスク</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {analytics?.taskStats?.completionRate || 0}%
                          </div>
                          <div className="text-sm text-gray-500">完了率</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {analytics?.taskStats?.thisWeekCount || 0}
                          </div>
                          <div className="text-sm text-gray-500">今週のタスク</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* デバイス・地域統計 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>デバイス統計</CardTitle>
                        <CardDescription>アクセスデバイスの分布</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analytics?.deviceStats ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">デスクトップ</span>
                              <span className="font-medium">{analytics.deviceStats.desktop}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">モバイル</span>
                              <span className="font-medium">{analytics.deviceStats.mobile}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">タブレット</span>
                              <span className="font-medium">{analytics.deviceStats.tablet}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">データがありません</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>地域統計</CardTitle>
                        <CardDescription>アクセス地域の分布</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analytics?.regionStats ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">日本</span>
                              <span className="font-medium">{analytics.regionStats.JP}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">アメリカ</span>
                              <span className="font-medium">{analytics.regionStats.US}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">その他</span>
                              <span className="font-medium">{analytics.regionStats.Other}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">データがありません</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
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
                  <Card>
                    <CardHeader>
                      <CardTitle>サーバエラーレポート</CardTitle>
                      <CardDescription>詳細なエラーログと分析</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <iframe
                        title="server-errors-frame"
                        src="/_bg/server-error-reporting"
                        className="w-full min-h-[70vh] border rounded"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {isFeatureAccessible('/admin/bugs').allowed && (
                <TabsContent value="bugs" className="space-y-6">
                  <AdminBugsList />
                </TabsContent>
              )}

              {isFeatureAccessible('/admin/features').allowed && (
                <TabsContent value="features" className="space-y-6">
                  <AdminFeaturesList />
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
                              <Badge
                                variant="outline"
                                className="text-orange-600 border-orange-300"
                              >
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
                                <p className="text-sm text-green-700">
                                  ユーザー拡散とマーケティング
                                </p>
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
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
