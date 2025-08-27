import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Globe,
  Clock,
  MousePointer,
  Smartphone,
  Monitor,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Zap,
  Filter,
  Download,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { unifiedErrorHandler } from '@/services/error/UnifiedErrorHandler';

interface UserSession {
  id: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  device: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  os: string;
  location: {
    country: string;
    city: string;
    region: string;
  };
  startTime: string;
  endTime?: string;
  duration: number;
  pageViews: number;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface PageView {
  id: string;
  sessionId: string;
  userId?: string;
  path: string;
  title: string;
  timestamp: string;
  timeOnPage: number;
  scrollDepth: number;
  clicks: number;
  referrer?: string;
}

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: string;
  registrationDate: string;
  lastLoginAt: string;
  totalSessions: number;
  totalPageViews: number;
  avgSessionDuration: number;
  preferredLanguage: string;
  timezone: string;
  subscription?: {
    plan: string;
    status: string;
    startDate: string;
  };
  behavior: {
    mostUsedFeatures: string[];
    preferredDevices: string[];
    activeHours: number[];
  };
}

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    new: number;
    returning: number;
    churned: number;
  };
  sessions: {
    total: number;
    avgDuration: number;
    bounceRate: number;
    pagesPerSession: number;
  };
  pageViews: {
    total: number;
    unique: number;
    topPages: Array<{ path: string; views: number; avgTime: number }>;
  };
  traffic: {
    direct: number;
    search: number;
    social: number;
    referral: number;
    email: number;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geography: Array<{ country: string; users: number; sessions: number }>;
  realtime: {
    activeUsers: number;
    currentPageViews: Array<{ path: string; users: number }>;
  };
}

/**
 * 包括的分析ダッシュボード - ユーザー行動・アクセス解析
 */
const ComprehensiveAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 初期化とデータ取得
  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 60000); // 1分ごとに更新
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // 実際の分析データを取得
      const response = await fetch(`/api/analytics/data?timeRange=${selectedTimeRange}`, {
        headers: {
          Authorization: `Bearer ${typeof (user as any)?.getIdToken === 'function' ? await (user as any).getIdToken() : ''}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAnalyticsData(result.data.analytics);
          setUserSessions(result.data.sessions || []);
          setPageViews(result.data.pageViews || []);
          setUserProfiles(result.data.users || []);
          console.log('✅ Analytics data loaded successfully');
        } else {
          throw new Error(result.message || 'Failed to load analytics data');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      setLastUpdate(new Date());
    } catch (error) {
      await unifiedErrorHandler.handleError(error, {
        component: 'ComprehensiveAnalyticsDashboard',
        action: 'fetchAnalyticsData',
        additionalData: { selectedTimeRange },
      });
      // エラー時はモックデータで初期化
      const mock = getMockAnalyticsData();
      setAnalyticsData(mock);
      setUserSessions([]);
      setPageViews([]);
      setUserProfiles([]);
      toast.error('分析データの取得に失敗しました。ネットワーク接続を確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  const getMockAnalyticsData = (): AnalyticsData => {
    return {
      users: {
        total: 2847,
        active: 1923,
        new: 347,
        returning: 1576,
        churned: 924,
      },
      sessions: {
        total: 8921,
        avgDuration: 342,
        bounceRate: 32.4,
        pagesPerSession: 4.7,
      },
      pageViews: {
        total: 41863,
        unique: 38291,
        topPages: [
          { path: '/', views: 8921, avgTime: 127 },
          { path: '/todos', views: 6734, avgTime: 298 },
          { path: '/quadrant-dashboard', views: 4521, avgTime: 456 },
          { path: '/integrated-dashboard', views: 3892, avgTime: 312 },
          { path: '/login', views: 2156, avgTime: 89 },
        ],
      },
      traffic: {
        direct: 42.3,
        search: 28.7,
        social: 15.2,
        referral: 9.8,
        email: 4.0,
      },
      devices: {
        desktop: 64.2,
        mobile: 28.9,
        tablet: 6.9,
      },
      geography: [
        { country: 'Japan', users: 1892, sessions: 5647 },
        { country: 'United States', users: 423, sessions: 1289 },
        { country: 'South Korea', users: 289, sessions: 856 },
        { country: 'Taiwan', users: 156, sessions: 478 },
        { country: 'Singapore', users: 87, sessions: 251 },
      ],
      realtime: {
        activeUsers: 127,
        currentPageViews: [
          { path: '/', users: 34 },
          { path: '/todos', users: 28 },
          { path: '/quadrant-dashboard', users: 21 },
          { path: '/integrated-dashboard', users: 18 },
          { path: '/login', users: 12 },
        ],
      },
    };
  };

  const getMockUserSessions = (): UserSession[] => {
    return [
      {
        id: 'session-1',
        userId: 'user-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        device: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        location: { country: 'Japan', city: 'Tokyo', region: 'Kanto' },
        startTime: new Date(Date.now() - 1800000).toISOString(),
        duration: 1800,
        pageViews: 12,
        referrer: 'https://google.com',
        utmSource: 'google',
        utmMedium: 'organic',
      },
      {
        id: 'session-2',
        ipAddress: '203.104.123.45',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        device: 'mobile',
        browser: 'Safari',
        os: 'iOS',
        location: { country: 'Japan', city: 'Osaka', region: 'Kansai' },
        startTime: new Date(Date.now() - 3600000).toISOString(),
        duration: 1200,
        pageViews: 8,
        referrer: 'https://twitter.com',
        utmSource: 'twitter',
        utmMedium: 'social',
      },
    ];
  };

  const getMockPageViews = (): PageView[] => {
    return [
      {
        id: 'view-1',
        sessionId: 'session-1',
        userId: 'user-123',
        path: '/',
        title: 'Work Time Tracker - Home',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        timeOnPage: 127,
        scrollDepth: 85,
        clicks: 3,
        referrer: 'https://google.com',
      },
      {
        id: 'view-2',
        sessionId: 'session-1',
        userId: 'user-123',
        path: '/todos',
        title: 'Todo Management',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        timeOnPage: 298,
        scrollDepth: 92,
        clicks: 7,
      },
    ];
  };

  const getMockUserProfiles = (): UserProfile[] => {
    return [
      {
        id: 'user-123',
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'user',
        registrationDate: '2024-01-15T10:30:00Z',
        lastLoginAt: new Date(Date.now() - 300000).toISOString(),
        totalSessions: 47,
        totalPageViews: 289,
        avgSessionDuration: 423,
        preferredLanguage: 'ja',
        timezone: 'Asia/Tokyo',
        subscription: {
          plan: 'premium',
          status: 'active',
          startDate: '2024-02-01T00:00:00Z',
        },
        behavior: {
          mostUsedFeatures: ['todos', 'quadrant-dashboard', 'time-tracking'],
          preferredDevices: ['desktop', 'mobile'],
          activeHours: [9, 10, 11, 14, 15, 16, 20, 21],
        },
      },
    ];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (value < threshold) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const exportData = async () => {
    try {
      const exportData = {
        analytics: analyticsData,
        sessions: userSessions,
        pageViews: pageViews,
        users: userProfiles,
        exportedAt: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('分析データをエクスポートしました');
    } catch (error) {
      console.error('エクスポートエラー:', error);
      toast.error('エクスポートに失敗しました');
    }
  };

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">分析データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">完全分析ダッシュボード</h1>
                <p className="text-gray-600 mt-2">ユーザー行動・アクセス解析・属性管理システム</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                aria-label="期間選択"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="1d">過去24時間</option>
                <option value="7d">過去7日間</option>
                <option value="30d">過去30日間</option>
                <option value="90d">過去90日間</option>
              </select>
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                エクスポート
              </Button>
              <Button onClick={fetchAnalyticsData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                更新
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* リアルタイム統計 */}
        <div className="mb-8">
          <Alert className="border-green-200 bg-green-50">
            <Activity className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              <strong>リアルタイム:</strong> 現在 {analyticsData.realtime.activeUsers} 人が
              アクティブです（最終更新: {lastUpdate.toLocaleTimeString()}）
            </AlertDescription>
          </Alert>
        </div>

        {/* 主要メトリクス */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">総ユーザー数</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {analyticsData.users.total.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {getTrendIcon(analyticsData.users.new)}
                <span className="text-sm text-blue-700">
                  新規: {analyticsData.users.new} / 継続: {analyticsData.users.returning}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">総ページビュー</p>
                  <p className="text-3xl font-bold text-green-900">
                    {analyticsData.pageViews.total.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {getTrendIcon(analyticsData.pageViews.unique)}
                <span className="text-sm text-green-700">
                  ユニーク: {analyticsData.pageViews.unique.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">平均セッション時間</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {Math.round(analyticsData.sessions.avgDuration / 60)}分
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {getTrendIcon(analyticsData.sessions.pagesPerSession - 3)}
                <span className="text-sm text-purple-700">
                  ページ/セッション: {analyticsData.sessions.pagesPerSession}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">直帰率</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {analyticsData.sessions.bounceRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {getTrendIcon(-analyticsData.sessions.bounceRate + 40)}
                <span className="text-sm text-orange-700">
                  エンゲージメント率: {(100 - analyticsData.sessions.bounceRate).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 詳細分析タブ */}
        <Tabs defaultValue="traffic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="traffic">トラフィック</TabsTrigger>
            <TabsTrigger value="pages">ページ</TabsTrigger>
            <TabsTrigger value="users">ユーザー</TabsTrigger>
            <TabsTrigger value="devices">デバイス</TabsTrigger>
            <TabsTrigger value="geography">地域</TabsTrigger>
            <TabsTrigger value="realtime">リアルタイム</TabsTrigger>
          </TabsList>

          <TabsContent value="traffic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    トラフィックソース
                  </CardTitle>
                  <CardDescription>ユーザーの流入元別分析</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.traffic).map(([source, percentage]) => (
                      <div key={source} className="flex items-center justify-between">
                        <span className="capitalize font-medium">{source}</span>
                        <div className="flex items-center gap-3">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm font-semibold w-12">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>人気ページランキング</CardTitle>
                  <CardDescription>アクセス数と平均滞在時間</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.pageViews.topPages.map((page, index) => (
                      <div key={page.path} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{page.path}</p>
                            <p className="text-sm text-gray-600">
                              平均滞在: {Math.round(page.avgTime / 60)}分{page.avgTime % 60}秒
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold">{page.views.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  デバイス別アクセス
                </CardTitle>
                <CardDescription>利用デバイスの分析</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Monitor className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">デスクトップ</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {analyticsData.devices.desktop.toFixed(1)}%
                    </p>
                    <Progress value={analyticsData.devices.desktop} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">モバイル</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {analyticsData.devices.mobile.toFixed(1)}%
                    </p>
                    <Progress value={analyticsData.devices.mobile} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="p-4 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Monitor className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">タブレット</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {analyticsData.devices.tablet.toFixed(1)}%
                    </p>
                    <Progress value={analyticsData.devices.tablet} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  地域別ユーザー分析
                </CardTitle>
                <CardDescription>国・地域別のアクセス状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.geography.map((location, index) => (
                    <div
                      key={location.country}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{location.country}</p>
                          <p className="text-sm text-gray-600">
                            セッション: {location.sessions.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{location.users.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">ユーザー</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    現在のアクティブユーザー
                  </CardTitle>
                  <CardDescription>リアルタイムユーザー活動</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-4xl font-bold text-green-600">
                      {analyticsData.realtime.activeUsers}
                    </p>
                    <p className="text-gray-600">現在アクティブ</p>
                  </div>
                  <div className="space-y-3">
                    {analyticsData.realtime.currentPageViews.map((page) => (
                      <div key={page.path} className="flex items-center justify-between">
                        <span className="font-medium">{page.path}</span>
                        <Badge variant="secondary">{page.users} ユーザー</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>最近のセッション</CardTitle>
                  <CardDescription>直近のユーザーセッション</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            className={`${session.device === 'desktop' ? 'bg-blue-100 text-blue-800' : session.device === 'mobile' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}
                          >
                            {session.device}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {formatDuration(session.duration)}
                          </span>
                        </div>
                        <p className="text-sm">
                          {session.location.city}, {session.location.country}
                        </p>
                        <p className="text-xs text-gray-500">{session.pageViews} ページビュー</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  ユーザープロファイル
                </CardTitle>
                <CardDescription>詳細なユーザー属性と行動分析</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userProfiles.slice(0, 5).map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{user.role}</Badge>
                          {user.subscription && (
                            <Badge className="ml-2 bg-gold-100 text-gold-800">
                              {user.subscription.plan}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">総セッション</p>
                          <p className="font-semibold">{user.totalSessions}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">ページビュー</p>
                          <p className="font-semibold">{user.totalPageViews}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">平均セッション</p>
                          <p className="font-semibold">
                            {Math.round(user.avgSessionDuration / 60)}分
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">最終ログイン</p>
                          <p className="font-semibold">
                            {new Date(user.lastLoginAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-1">よく使う機能:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.behavior.mostUsedFeatures.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;
