/**
 * 🚀 本番環境最適化ダッシュボード
 * CDN統合・キャッシュ戦略・監視システム・パフォーマンス最適化の統合管理画面
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Download,
  Share2,
  Target,
  Lightbulb,
  Gauge,
  Timer,
  Cloud,
  Database,
  Network,
  HardDrive,
  Cpu,
  BarChart3,
  Globe,
  Wifi,
} from 'lucide-react';
import {
  productionOptimizationService,
  ProductionMetrics,
  CDNConfiguration,
  CacheStrategy,
  OptimizationRecommendation,
} from '@/services/production/ProductionOptimizationService';

interface ProductionOptimizationDashboardProps {
  compactMode?: boolean;
}

export const ProductionOptimizationDashboard: React.FC<ProductionOptimizationDashboardProps> = ({
  compactMode = false,
}) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'cdn' | 'cache' | 'metrics' | 'recommendations'
  >('overview');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // データの初期化と監視
  useEffect(() => {
    initializeDashboard();

    const handleMetricsCollected = (metrics: ProductionMetrics) => {
      refreshDashboardData();
    };

    const handleProductionAlert = (alert: any) => {
      refreshDashboardData();
    };

    productionOptimizationService.on('metricsCollected', handleMetricsCollected);
    productionOptimizationService.on('productionAlert', handleProductionAlert);

    return () => {
      productionOptimizationService.off('metricsCollected', handleMetricsCollected);
      productionOptimizationService.off('productionAlert', handleProductionAlert);
    };
  }, []);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      await refreshDashboardData();
      console.log('🚀 Production Optimization Dashboard initialized');
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboardData = useCallback(() => {
    const data = productionOptimizationService.getDashboardData();
    setDashboardData(data);
    setIsMonitoring(data.isMonitoring);
  }, []);

  const applyAutoOptimizations = async () => {
    setIsLoading(true);
    try {
      await productionOptimizationService.applyAutoOptimizations();
      await refreshDashboardData();
    } catch (error) {
      console.error('Auto optimization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricColor = (value: number, good: number, excellent: number) => {
    if (value >= excellent) return 'text-green-600';
    if (value >= good) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium">本番環境最適化ダッシュボードを初期化中...</p>
        </div>
      </div>
    );
  }

  const latestMetrics = dashboardData.metrics[dashboardData.metrics.length - 1];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Cloud className="h-6 w-6 text-blue-600" />
            本番環境最適化ダッシュボード
          </h2>
          <p className="text-gray-600 mt-1">
            CDN統合・キャッシュ戦略・監視システム・パフォーマンス最適化
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
            />
            <span className="text-sm text-gray-600">
              {isMonitoring ? 'リアルタイム監視中' : '監視停止中'}
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={applyAutoOptimizations} disabled={isLoading}>
            <Zap className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            自動最適化実行
          </Button>

          <Button variant="outline" size="sm" onClick={refreshDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {/* 概要メトリクス */}
      {latestMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Response Time</span>
                <Timer className="h-4 w-4 text-blue-500" />
              </div>
              <div
                className={`text-2xl font-bold ${getMetricColor(latestMetrics.responseTime.avg, 500, 200)}`}
              >
                {Math.round(latestMetrics.responseTime.avg)}ms
              </div>
              <p className="text-xs text-gray-500 mt-1">平均レスポンス時間</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">CDN Hit Rate</span>
                <Globe className="h-4 w-4 text-green-500" />
              </div>
              <div
                className={`text-2xl font-bold ${getMetricColor(latestMetrics.cdn.hitRate, 85, 95)}`}
              >
                {Math.round(latestMetrics.cdn.hitRate)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">CDNヒット率</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Cache Hit Rate</span>
                <Database className="h-4 w-4 text-purple-500" />
              </div>
              <div
                className={`text-2xl font-bold ${getMetricColor(latestMetrics.cache.browserHitRate, 80, 90)}`}
              >
                {Math.round(latestMetrics.cache.browserHitRate)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">ブラウザキャッシュ</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Error Rate</span>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div
                className={`text-2xl font-bold ${getMetricColor(5 - latestMetrics.errors.rate, 3, 4.5)}`}
              >
                {latestMetrics.errors.rate.toFixed(2)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">エラー率</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Bandwidth</span>
                <Wifi className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-indigo-600">
                {Math.round(latestMetrics.cdn.bandwidth)}GB
              </div>
              <p className="text-xs text-gray-500 mt-1">転送量</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="cdn">CDN</TabsTrigger>
          <TabsTrigger value="cache">キャッシュ</TabsTrigger>
          <TabsTrigger value="metrics">メトリクス</TabsTrigger>
          <TabsTrigger value="recommendations">最適化提案</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* パフォーマンストレンド */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  パフォーマンストレンド
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(time) => new Date(time).toLocaleString()}
                        formatter={(value: number, name: string) => [Math.round(value), name]}
                      />
                      <Line
                        type="monotone"
                        dataKey="responseTime.avg"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Response Time (ms)"
                      />
                      <Line
                        type="monotone"
                        dataKey="cdn.hitRate"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="CDN Hit Rate (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ユーザーエクスペリエンス */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  ユーザーエクスペリエンス
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestMetrics && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">読み込み時間</span>
                      <span className="font-medium">
                        {Math.round(latestMetrics.userExperience.loadTime)}ms
                      </span>
                    </div>
                    <Progress
                      value={Math.max(0, 100 - latestMetrics.userExperience.loadTime / 30)}
                      className="h-2"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">インタラクティブ時間</span>
                      <span className="font-medium">
                        {Math.round(latestMetrics.userExperience.interactiveTime)}ms
                      </span>
                    </div>
                    <Progress
                      value={Math.max(0, 100 - latestMetrics.userExperience.interactiveTime / 40)}
                      className="h-2"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">セッション時間</span>
                      <span className="font-medium">
                        {Math.round(latestMetrics.userExperience.sessionDuration / 60)}分
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        100,
                        (latestMetrics.userExperience.sessionDuration / 1200) * 100
                      )}
                      className="h-2"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">直帰率</span>
                      <span className="font-medium">
                        {Math.round(latestMetrics.userExperience.bounceRate)}%
                      </span>
                    </div>
                    <Progress
                      value={100 - latestMetrics.userExperience.bounceRate}
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CDNタブ */}
        <TabsContent value="cdn" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CDN設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  CDN設定
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.cdnConfig && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Provider</span>
                      <Badge variant="default">{dashboardData.cdnConfig.provider}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">HTTP/2</span>
                      <Badge
                        variant={dashboardData.cdnConfig.http2Enabled ? 'default' : 'secondary'}
                      >
                        {dashboardData.cdnConfig.http2Enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Brotli圧縮</span>
                      <Badge
                        variant={dashboardData.cdnConfig.brotliEnabled ? 'default' : 'secondary'}
                      >
                        {dashboardData.cdnConfig.brotliEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Regions</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dashboardData.cdnConfig.regions.map((region: string) => (
                          <Badge key={region} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CDNメトリクス */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  CDNパフォーマンス
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestMetrics && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Hit', value: latestMetrics.cdn.hitRate, fill: '#10B981' },
                            { name: 'Miss', value: latestMetrics.cdn.missRate, fill: '#EF4444' },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* キャッシュタブ */}
        <TabsContent value="cache" className="space-y-6">
          {dashboardData.cacheStrategies.map((strategy: CacheStrategy) => (
            <Card key={strategy.level}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-500" />
                  {strategy.level.charAt(0).toUpperCase() + strategy.level.slice(1)} Cache
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">設定</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Policy</span>
                        <Badge variant="outline">{strategy.policy}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">TTL</span>
                        <span className="text-sm">{strategy.ttl}秒</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Max Size</span>
                        <span className="text-sm">{strategy.maxSize}MB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <Badge variant={strategy.enabled ? 'default' : 'secondary'}>
                          {strategy.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Patterns</h4>
                    <div className="flex flex-wrap gap-1">
                      {strategy.patterns.map((pattern, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* メトリクスタブ */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* レスポンス時間分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-blue-500" />
                  レスポンス時間分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                      />
                      <YAxis />
                      <Tooltip labelFormatter={(time) => new Date(time).toLocaleString()} />
                      <Area
                        type="monotone"
                        dataKey="responseTime.p95"
                        stackId="1"
                        stroke="#EF4444"
                        fill="#EF4444"
                        fillOpacity={0.3}
                        name="P95"
                      />
                      <Area
                        type="monotone"
                        dataKey="responseTime.p50"
                        stackId="1"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.3}
                        name="P50"
                      />
                      <Area
                        type="monotone"
                        dataKey="responseTime.avg"
                        stackId="1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        name="Average"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* エラー分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  エラー分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestMetrics && (
                  <div className="space-y-4">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(latestMetrics.errors.types).map(([type, count]) => ({
                            type,
                            count,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#EF4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {latestMetrics.errors.total}
                        </div>
                        <div className="text-sm text-gray-600">総エラー数</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {latestMetrics.errors.rate.toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-600">エラー率</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 最適化提案タブ */}
        <TabsContent value="recommendations" className="space-y-4">
          {dashboardData.recommendations.map((recommendation: OptimizationRecommendation) => (
            <Card key={recommendation.id} className="border-l-4 border-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{recommendation.title}</span>
                      <Badge
                        variant={
                          recommendation.priority === 'critical'
                            ? 'destructive'
                            : recommendation.priority === 'high'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {recommendation.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {recommendation.type}
                      </Badge>
                      {recommendation.autoApplicable && (
                        <Badge variant="default" className="text-xs">
                          自動適用可能
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                    <p className="text-sm text-blue-600 font-medium mb-2">
                      {recommendation.impact}
                    </p>
                    <p className="text-xs text-gray-500">{recommendation.implementation}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-green-600">
                      -{recommendation.estimatedImprovement.loadTime}ms
                    </div>
                    <div className="text-xs text-gray-500">
                      -{recommendation.estimatedImprovement.bandwidth}% 転送量
                    </div>
                    <Badge variant="outline" className="mt-1">
                      工数: {recommendation.effort}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionOptimizationDashboard;
