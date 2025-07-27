/**
 * 🚀 高度パフォーマンス監視ダッシュボード
 * Lighthouse自動監視・リアルタイム性能分析・最適化提案の統合ダッシュボード
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
  Eye,
  Settings,
  Download,
  Share2,
  Target,
  Lightbulb,
  Gauge,
  Timer,
  Image,
  Code,
  Smartphone,
  Monitor,
  Package,
} from 'lucide-react';
import {
  performanceMonitoringService,
  PerformanceMetrics,
  PerformanceAlert,
  PerformanceBudget,
  OptimizationSuggestion,
} from '@/services/testing/PerformanceMonitoringService';

interface AdvancedPerformanceDashboardProps {
  compactMode?: boolean;
}

export const AdvancedPerformanceDashboard: React.FC<AdvancedPerformanceDashboardProps> = ({
  compactMode = false,
}) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<PerformanceMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'trends' | 'budgets' | 'alerts' | 'suggestions'
  >('overview');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // データの初期化と監視
  useEffect(() => {
    initializeDashboard();

    const handleMetricsUpdate = (metrics: PerformanceMetrics) => {
      refreshDashboardData();
    };

    const handleBudgetUpdate = (budgets: PerformanceBudget[]) => {
      refreshDashboardData();
    };

    const handlePerformanceAlert = (alert: PerformanceAlert) => {
      refreshDashboardData();
    };

    performanceMonitoringService.on('metricsUpdated', handleMetricsUpdate);
    performanceMonitoringService.on('budgetUpdated', handleBudgetUpdate);
    performanceMonitoringService.on('performanceAlert', handlePerformanceAlert);

    return () => {
      performanceMonitoringService.off('metricsUpdated', handleMetricsUpdate);
      performanceMonitoringService.off('budgetUpdated', handleBudgetUpdate);
      performanceMonitoringService.off('performanceAlert', handlePerformanceAlert);
    };
  }, []);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      await refreshDashboardData();
      console.log('🚀 Advanced Performance Dashboard initialized');
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboardData = useCallback(() => {
    const data = performanceMonitoringService.getDashboardData();
    setDashboardData(data);
    setIsMonitoring(data.isMonitoring);
  }, []);

  const runManualTest = async (url: string) => {
    setIsLoading(true);
    try {
      const metrics = await performanceMonitoringService.runManualTest(url);
      setSelectedMetrics(metrics);
      await refreshDashboardData();
    } catch (error) {
      console.error('Manual test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMetricColor = (value: number, threshold: number, isReverse = false) => {
    const status = isReverse ? value <= threshold : value >= threshold;
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getBudgetStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium">パフォーマンス監視ダッシュボードを初期化中...</p>
        </div>
      </div>
    );
  }

  const latestMetrics = dashboardData.latestMetrics[dashboardData.latestMetrics.length - 1];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gauge className="h-6 w-6 text-blue-600" />
            高度パフォーマンス監視
          </h2>
          <p className="text-gray-600 mt-1">
            Lighthouse自動監視・リアルタイム性能分析・ADHD配慮UI最適化
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => runManualTest('http://localhost:3002')}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            手動テスト実行
          </Button>

          <Button variant="outline" size="sm" onClick={refreshDashboardData}>
            <Eye className="h-4 w-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {/* メトリクス概要カード */}
      {latestMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Performance</span>
                <Gauge className="h-4 w-4 text-blue-500" />
              </div>
              <div
                className={`text-2xl font-bold rounded px-2 py-1 ${getScoreColor(latestMetrics.scores.performance)}`}
              >
                {Math.round(latestMetrics.scores.performance)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Lighthouse スコア</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Accessibility</span>
                <Target className="h-4 w-4 text-green-500" />
              </div>
              <div
                className={`text-2xl font-bold rounded px-2 py-1 ${getScoreColor(latestMetrics.scores.accessibility)}`}
              >
                {Math.round(latestMetrics.scores.accessibility)}
              </div>
              <p className="text-xs text-gray-500 mt-1">ADHD配慮重要</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">LCP</span>
                <Timer className="h-4 w-4 text-purple-500" />
              </div>
              <div
                className={`text-2xl font-bold ${getMetricColor(latestMetrics.coreWebVitals.lcp, 2500, true)}`}
              >
                {Math.round(latestMetrics.coreWebVitals.lcp)}ms
              </div>
              <p className="text-xs text-gray-500 mt-1">目標: 2.5s以下</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">CLS</span>
                <Activity className="h-4 w-4 text-orange-500" />
              </div>
              <div
                className={`text-2xl font-bold ${getMetricColor(latestMetrics.coreWebVitals.cls, 0.1, true)}`}
              >
                {latestMetrics.coreWebVitals.cls.toFixed(3)}
              </div>
              <p className="text-xs text-gray-500 mt-1">レイアウト安定性</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* アクティブアラート */}
      {dashboardData.alerts.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="font-medium text-yellow-800 mb-2">
              パフォーマンスアラート ({dashboardData.alerts.length}件)
            </div>
            <div className="space-y-1">
              {dashboardData.alerts.slice(0, 3).map((alert: PerformanceAlert) => (
                <div key={alert.id} className="text-sm text-yellow-700">
                  • {alert.description} ({alert.url})
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="trends">トレンド</TabsTrigger>
          <TabsTrigger value="budgets">予算</TabsTrigger>
          <TabsTrigger value="alerts">アラート</TabsTrigger>
          <TabsTrigger value="suggestions">最適化提案</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestMetrics && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">First Contentful Paint</span>
                      <span
                        className={`font-medium ${getMetricColor(latestMetrics.coreWebVitals.fcp, 2000, true)}`}
                      >
                        {Math.round(latestMetrics.coreWebVitals.fcp)}ms
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (2000 / latestMetrics.coreWebVitals.fcp) * 100)}
                      className="h-2"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Largest Contentful Paint</span>
                      <span
                        className={`font-medium ${getMetricColor(latestMetrics.coreWebVitals.lcp, 2500, true)}`}
                      >
                        {Math.round(latestMetrics.coreWebVitals.lcp)}ms
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (2500 / latestMetrics.coreWebVitals.lcp) * 100)}
                      className="h-2"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cumulative Layout Shift</span>
                      <span
                        className={`font-medium ${getMetricColor(latestMetrics.coreWebVitals.cls, 0.1, true)}`}
                      >
                        {latestMetrics.coreWebVitals.cls.toFixed(3)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (0.1 / latestMetrics.coreWebVitals.cls) * 100)}
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* リソースサイズ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  リソースサイズ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestMetrics && (
                  <div className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: 'Scripts',
                                value: latestMetrics.resourceSizes.scripts,
                                fill: '#3B82F6',
                              },
                              {
                                name: 'Images',
                                value: latestMetrics.resourceSizes.images,
                                fill: '#10B981',
                              },
                              {
                                name: 'Styles',
                                value: latestMetrics.resourceSizes.stylesheets,
                                fill: '#F59E0B',
                              },
                              {
                                name: 'Fonts',
                                value: latestMetrics.resourceSizes.fonts,
                                fill: '#8B5CF6',
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}KB`}
                          />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(latestMetrics.resourceSizes.total)}KB
                      </div>
                      <div className="text-sm text-gray-600">総サイズ</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* トレンドタブ */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                パフォーマンストレンド (24時間)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.trends.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      labelFormatter={(time) => new Date(time).toLocaleString()}
                      formatter={(value: number) => [Math.round(value), 'スコア']}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgPerformance"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Performance"
                    />
                    <Line
                      type="monotone"
                      dataKey="avgAccessibility"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Accessibility"
                    />
                    <Line
                      type="monotone"
                      dataKey="avgBestPractices"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Best Practices"
                    />
                    <Line
                      type="monotone"
                      dataKey="avgSEO"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      name="SEO"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 予算タブ */}
        <TabsContent value="budgets" className="space-y-6">
          {dashboardData.budgets.map((budget: PerformanceBudget) => (
            <Card key={budget.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  {budget.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* メトリクス予算 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">パフォーマンス指標</h4>
                    <div className="space-y-3">
                      {Object.entries(budget.metrics).map(([key, metric]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getBudgetStatusIcon(metric.status)}
                            <span className="text-sm">{key}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {metric.current?.toFixed(1) || '---'} / {metric.budget}
                            </span>
                            <Badge
                              variant={
                                metric.status === 'passed'
                                  ? 'default'
                                  : metric.status === 'warning'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {metric.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* リソース予算 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">リソースサイズ (KB)</h4>
                    <div className="space-y-3">
                      {Object.entries(budget.resources).map(([key, resource]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getBudgetStatusIcon(resource.status)}
                            <span className="text-sm">{key}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {resource.current?.toFixed(0) || '---'} / {resource.budget}
                            </span>
                            <Badge
                              variant={
                                resource.status === 'passed'
                                  ? 'default'
                                  : resource.status === 'warning'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {resource.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* アラートタブ */}
        <TabsContent value="alerts" className="space-y-4">
          {dashboardData.alerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  パフォーマンスアラートなし
                </h3>
                <p className="text-gray-600">すべての指標が正常な範囲内です</p>
              </CardContent>
            </Card>
          ) : (
            dashboardData.alerts.map((alert: PerformanceAlert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  alert.severity === 'critical' ? 'border-red-500' : 'border-yellow-500'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                          }`}
                        />
                        <span className="font-medium">{alert.metric}</span>
                        <Badge
                          variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <p className="text-xs text-gray-500">{alert.url}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {alert.currentValue.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">閾値: {alert.threshold}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">推奨対応:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {alert.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* 最適化提案タブ */}
        <TabsContent value="suggestions" className="space-y-4">
          {latestMetrics && (
            <div className="space-y-4">
              {performanceMonitoringService
                .generateOptimizationSuggestions(latestMetrics)
                .map((suggestion: OptimizationSuggestion) => (
                  <Card key={suggestion.id} className="border-l-4 border-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{suggestion.title}</span>
                            <Badge
                              variant={
                                suggestion.priority === 'critical'
                                  ? 'destructive'
                                  : suggestion.priority === 'high'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {suggestion.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                          <p className="text-sm text-blue-600 font-medium mb-2">
                            {suggestion.impact}
                          </p>
                          <p className="text-xs text-gray-500">{suggestion.implementation}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium text-green-600">
                            +{suggestion.estimatedImprovement.performanceScore}pt
                          </div>
                          <div className="text-xs text-gray-500">
                            -{suggestion.estimatedImprovement.loadTime}ms
                          </div>
                          <Badge variant="outline" className="mt-1">
                            工数: {suggestion.effort}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedPerformanceDashboard;
