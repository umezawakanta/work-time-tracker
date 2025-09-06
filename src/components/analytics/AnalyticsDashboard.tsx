import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Target,
  Activity,
} from 'lucide-react';
import { userTrackingService, UserAnalytics } from '@/services/analytics/UserTrackingService';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-hot-toast';
import { unifiedErrorHandler } from '@/services/error/UnifiedErrorHandler';

interface AnalyticsDashboardProps {
  isAdminUser?: boolean;
  hideTopPages?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isAdminUser = false,
  hideTopPages = false,
}) => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      let data;
      if (isAdminUser) {
        // 管理者の場合は管理者用APIを使用
        const rangeMap = { day: '1d', week: '7d', month: '30d' };
        data = await userTrackingService.getAdminAnalytics(rangeMap[timeRange]);
      } else {
        // 一般ユーザーの場合は従来のAPIを使用
        data = await userTrackingService.getAnalytics(timeRange);
      }
      setAnalytics(data);
    } catch (error) {
      await unifiedErrorHandler.handleError(error, {
        component: 'AnalyticsDashboard',
        action: 'loadAnalytics',
        additionalData: { timeRange, isAdminUser },
      });
      toast.error('解析データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;

    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('解析データをダウンロードしました');
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const deviceColors = {
    desktop: '#3b82f6',
    mobile: '#ef4444',
    tablet: '#10b981',
  };

  const trafficColors = {
    direct: '#6366f1',
    search: '#f59e0b',
    social: '#ec4899',
    referral: '#10b981',
  };

  if (!isAdminUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">管理者権限が必要です</h3>
            <p className="text-gray-600">このダッシュボードは管理者のみアクセスできます。</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            解析データを読み込み中...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">データが見つかりません</h3>
            <Button onClick={loadAnalytics} className="mt-4">
              再読み込み
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 ユーザー解析ダッシュボード</h1>
          <p className="text-gray-600">リアルタイムユーザー行動とサイト解析</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">今日</SelectItem>
              <SelectItem value="week">過去7日</SelectItem>
              <SelectItem value="month">過去30日</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>

          <Button onClick={loadAnalytics} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {/* 概要メトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalUsers.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-600 ml-1">vs 先週</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">アクティブユーザー</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeUsers}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+8.3%</span>
              <span className="text-gray-600 ml-1">vs 先週</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均セッション時間</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(analytics.averageSessionDuration)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+5.2%</span>
              <span className="text-gray-600 ml-1">vs 先週</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総ページビュー</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.pageViewsTotal.toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+15.7%</span>
              <span className="text-gray-600 ml-1">vs 先週</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細解析タブ */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="pages">ページ解析</TabsTrigger>
          <TabsTrigger value="devices">デバイス</TabsTrigger>
          <TabsTrigger value="traffic">トラフィック</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ユーザー種別 */}
            <Card>
              <CardHeader>
                <CardTitle>ユーザー種別</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">新規ユーザー</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(analytics.newUsers / analytics.totalUsers) * 100}
                        className="w-24"
                      />
                      <span className="text-sm font-bold">{analytics.newUsers}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">リピートユーザー</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(analytics.returningUsers / analytics.totalUsers) * 100}
                        className="w-24"
                      />
                      <span className="text-sm font-bold">{analytics.returningUsers}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 人気ページ（管理画面では重複回避のため非表示可） */}
            {!hideTopPages && (
              <Card>
                <CardHeader>
                  <CardTitle>人気ページ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topPages.map((page, index) => (
                      <div key={page.page} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-sm font-medium">{page.page}</span>
                        </div>
                        <span className="text-sm font-bold">{page.views.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ページ別詳細解析</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topPages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>デバイス別アクセス</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.deviceBreakdown || {}).map(
                        ([device, percentage]) => ({
                          name: device,
                          value: percentage,
                          fill: deviceColors[device as keyof typeof deviceColors],
                        })
                      )}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {Object.entries(analytics.deviceBreakdown || {}).map(([device], index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={deviceColors[device as keyof typeof deviceColors]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>デバイス詳細</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.deviceBreakdown || {}).map(([device, percentage]) => (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device === 'desktop' && <Monitor className="h-4 w-4" />}
                        {device === 'mobile' && <Smartphone className="h-4 w-4" />}
                        {device === 'tablet' && <Tablet className="h-4 w-4" />}
                        <span className="text-sm font-medium capitalize">{device}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-20" />
                        <span className="text-sm font-bold">{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>トラフィックソース</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.trafficSources || {}).map(
                      ([source, percentage]) => ({
                        name: source,
                        value: percentage,
                        fill: trafficColors[source as keyof typeof trafficColors],
                      })
                    )}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {Object.entries(analytics.trafficSources || {}).map(([source], index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={trafficColors[source as keyof typeof trafficColors]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
