import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  Cpu,
  HardDrive as Memory,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Gauge,
  Target,
  Lightbulb,
  Rocket,
} from 'lucide-react';
import {
  performanceOptimizationService,
  PerformanceReport,
  PerformanceOptimization,
  LongTask,
  MemoryLeak,
} from '@/services/performance/PerformanceOptimizationService';

interface PerformanceMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'green' | 'yellow' | 'red' | 'blue';
  trend?: 'up' | 'down' | 'stable';
}

const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50 text-green-800',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    red: 'border-red-200 bg-red-50 text-red-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  const trendIcon = trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→';

  return (
    <Card className={`${colorClasses[color]} border-2`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs opacity-70 flex items-center gap-1">
            {trend && <span>{trendIcon}</span>}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const OptimizationCard: React.FC<{ optimization: PerformanceOptimization }> = ({
  optimization,
}) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    testing: 'bg-yellow-100 text-yellow-800',
  };

  const impactColors = {
    low: 'text-blue-600',
    medium: 'text-orange-600',
    high: 'text-red-600',
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{optimization.description}</span>
          <Badge className={statusColors[optimization.status]}>{optimization.status}</Badge>
        </div>
        <div className="text-sm text-gray-600">
          <span className={impactColors[optimization.impact]}>{optimization.impact} impact</span>
          <span className="ml-2 text-green-600">+{optimization.improvement}% improvement</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {optimization.type === 'memory' && <Memory className="h-4 w-4" />}
        {optimization.type === 'cpu' && <Cpu className="h-4 w-4" />}
        {optimization.type === 'network' && <Activity className="h-4 w-4" />}
        {optimization.type === 'rendering' && <BarChart3 className="h-4 w-4" />}
      </div>
    </div>
  );
};

const LongTaskCard: React.FC<{ task: LongTask }> = ({ task }) => (
  <div className="flex items-center justify-between p-3 border-l-4 border-orange-400 bg-orange-50">
    <div>
      <div className="font-medium text-orange-800">{task.source}</div>
      <div className="text-sm text-orange-600">
        {task.duration.toFixed(1)}ms (blocking: {task.blockingTime.toFixed(1)}ms)
      </div>
    </div>
    <Clock className="h-4 w-4 text-orange-600" />
  </div>
);

const MemoryLeakCard: React.FC<{ leak: MemoryLeak }> = ({ leak }) => (
  <div className="flex items-center justify-between p-3 border-l-4 border-red-400 bg-red-50">
    <div>
      <div className="font-medium text-red-800">{leak.component}</div>
      <div className="text-sm text-red-600">{leak.description}</div>
    </div>
    <AlertTriangle className="h-4 w-4 text-red-600" />
  </div>
);

/**
 * ⚡ パフォーマンス最適化マスターダッシュボード
 * リアルタイム監視、メモリ・CPU最適化、Lighthouse score improvements for the Performance Optimization Master badge.
 */
const PerformanceOptimizationDashboard: React.FC = () => {
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedOptimization, setSelectedOptimization] = useState<string | null>(null);

  useEffect(() => {
    // 初期データ取得
    const report = performanceOptimizationService.getCurrentReport();
    setPerformanceReport(report);

    // 3秒間隔でデータ更新
    const interval = setInterval(() => {
      const updatedReport = performanceOptimizationService.getCurrentReport();
      setPerformanceReport(updatedReport);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleLighthouseOptimization = async (): Promise<void> => {
    setIsOptimizing(true);
    try {
      await performanceOptimizationService.improveLighthouseScore();
      const updatedReport = performanceOptimizationService.getCurrentReport();
      setPerformanceReport(updatedReport);
    } catch (error) {
      console.error('Lighthouse最適化エラー:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  if (!performanceReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>パフォーマンスデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  const { lighthouse, memory, cpu, optimizations, recommendations } = performanceReport;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            パフォーマンス最適化ダッシュボード
          </h1>
          <p className="text-gray-600 mt-1">
            リアルタイム監視とエンタープライズ級最適化 | 総合スコア:{' '}
            {performanceReport.overallScore}点
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleLighthouseOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-2"
          >
            {isOptimizing ? (
              <Activity className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Lighthouse最適化
          </Button>
        </div>
      </div>

      {/* Lighthouseスコアカード */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <PerformanceMetricCard
          title="Performance"
          value={`${lighthouse.performance}点`}
          subtitle={
            lighthouse.performance >= 99 ? '🎉 Perfect!' : `${99 - lighthouse.performance}点不足`
          }
          icon={<Gauge className="h-4 w-4" />}
          color={
            lighthouse.performance >= 99 ? 'green' : lighthouse.performance >= 90 ? 'yellow' : 'red'
          }
          trend={lighthouse.performance >= 95 ? 'up' : 'down'}
        />
        <PerformanceMetricCard
          title="Accessibility"
          value={`${lighthouse.accessibility}点`}
          subtitle="アクセシビリティ"
          icon={<Target className="h-4 w-4" />}
          color={lighthouse.accessibility >= 95 ? 'green' : 'yellow'}
        />
        <PerformanceMetricCard
          title="Best Practices"
          value={`${lighthouse.bestPractices}点`}
          subtitle="ベストプラクティス"
          icon={<CheckCircle className="h-4 w-4" />}
          color={lighthouse.bestPractices >= 90 ? 'green' : 'yellow'}
        />
        <PerformanceMetricCard
          title="SEO"
          value={`${lighthouse.seo}点`}
          subtitle="検索エンジン最適化"
          icon={<TrendingUp className="h-4 w-4" />}
          color={lighthouse.seo >= 90 ? 'green' : 'yellow'}
        />
        <PerformanceMetricCard
          title="Overall Score"
          value={`${performanceReport.overallScore.toFixed(1)}点`}
          subtitle="総合スコア"
          icon={<BarChart3 className="h-4 w-4" />}
          color={performanceReport.overallScore >= 95 ? 'green' : 'blue'}
        />
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Core Web Vitals
          </CardTitle>
          <CardDescription>ユーザー体験の核心指標</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">LCP (Largest Contentful Paint)</span>
                <span
                  className={`text-sm ${lighthouse.lcp <= 2.5 ? 'text-green-600' : lighthouse.lcp <= 4 ? 'text-yellow-600' : 'text-red-600'}`}
                >
                  {lighthouse.lcp.toFixed(1)}s
                </span>
              </div>
              <Progress
                value={(lighthouse.lcp / 4) * 100}
                className={
                  lighthouse.lcp <= 2.5
                    ? 'bg-green-100'
                    : lighthouse.lcp <= 4
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">FID (First Input Delay)</span>
                <span
                  className={`text-sm ${lighthouse.fid <= 100 ? 'text-green-600' : lighthouse.fid <= 300 ? 'text-yellow-600' : 'text-red-600'}`}
                >
                  {lighthouse.fid}ms
                </span>
              </div>
              <Progress
                value={(lighthouse.fid / 300) * 100}
                className={
                  lighthouse.fid <= 100
                    ? 'bg-green-100'
                    : lighthouse.fid <= 300
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">CLS (Cumulative Layout Shift)</span>
                <span
                  className={`text-sm ${lighthouse.cls <= 0.1 ? 'text-green-600' : lighthouse.cls <= 0.25 ? 'text-yellow-600' : 'text-red-600'}`}
                >
                  {lighthouse.cls.toFixed(3)}
                </span>
              </div>
              <Progress
                value={(lighthouse.cls / 0.25) * 100}
                className={
                  lighthouse.cls <= 0.1
                    ? 'bg-green-100'
                    : lighthouse.cls <= 0.25
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime">リアルタイム監視</TabsTrigger>
          <TabsTrigger value="optimizations">最適化管理</TabsTrigger>
          <TabsTrigger value="analysis">詳細分析</TabsTrigger>
          <TabsTrigger value="recommendations">推奨事項</TabsTrigger>
        </TabsList>

        {/* リアルタイム監視 */}
        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* メモリ監視 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Memory className="h-5 w-5 text-blue-500" />
                  メモリ監視
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <PerformanceMetricCard
                    title="使用率"
                    value={`${memory.memoryUsagePercentage.toFixed(1)}%`}
                    subtitle={performanceOptimizationService.formatBytes(memory.usedJSHeapSize)}
                    icon={<Memory className="h-4 w-4" />}
                    color={
                      memory.memoryUsagePercentage > 80
                        ? 'red'
                        : memory.memoryUsagePercentage > 60
                          ? 'yellow'
                          : 'green'
                    }
                  />
                  <PerformanceMetricCard
                    title="GC効率"
                    value={`${memory.gcPerformance.efficiency.toFixed(1)}%`}
                    subtitle={`${memory.gcPerformance.frequency}回/分`}
                    icon={<Settings className="h-4 w-4" />}
                    color={memory.gcPerformance.efficiency > 80 ? 'green' : 'yellow'}
                  />
                </div>

                {memory.memoryLeaks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      メモリリーク検出
                    </h4>
                    {memory.memoryLeaks.slice(0, 3).map((leak) => (
                      <MemoryLeakCard key={leak.id} leak={leak} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CPU監視 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-green-500" />
                  CPU監視
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <PerformanceMetricCard
                    title="CPU使用率"
                    value={`${cpu.cpuUsage.toFixed(1)}%`}
                    subtitle={`${cpu.frameRate.toFixed(1)} FPS`}
                    icon={<Cpu className="h-4 w-4" />}
                    color={cpu.cpuUsage > 80 ? 'red' : cpu.cpuUsage > 60 ? 'yellow' : 'green'}
                  />
                  <PerformanceMetricCard
                    title="タスク時間"
                    value={`${cpu.taskDuration.toFixed(1)}ms`}
                    subtitle="平均実行時間"
                    icon={<Clock className="h-4 w-4" />}
                    color={
                      cpu.taskDuration > 50 ? 'red' : cpu.taskDuration > 25 ? 'yellow' : 'green'
                    }
                  />
                </div>

                {cpu.longTasks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-orange-600 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      長時間タスク検出
                    </h4>
                    {cpu.longTasks.slice(0, 3).map((task) => (
                      <LongTaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 最適化管理 */}
        <TabsContent value="optimizations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* メモリ最適化 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Memory className="h-5 w-5 text-blue-500" />
                  メモリ最適化
                </CardTitle>
                <CardDescription>
                  {
                    performanceOptimizationService
                      .getMemoryOptimizations()
                      .filter((opt) => opt.status === 'active').length
                  }{' '}
                  / {performanceOptimizationService.getMemoryOptimizations().length} 有効
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {performanceOptimizationService.getMemoryOptimizations().map((optimization) => (
                  <OptimizationCard key={optimization.id} optimization={optimization} />
                ))}
              </CardContent>
            </Card>

            {/* CPU最適化 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-green-500" />
                  CPU最適化
                </CardTitle>
                <CardDescription>
                  {
                    performanceOptimizationService
                      .getCPUOptimizations()
                      .filter((opt) => opt.status === 'active').length
                  }{' '}
                  / {performanceOptimizationService.getCPUOptimizations().length} 有効
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {performanceOptimizationService.getCPUOptimizations().map((optimization) => (
                  <OptimizationCard key={optimization.id} optimization={optimization} />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 詳細分析 */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">パフォーマンス詳細</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>FCP</span>
                  <span className="font-mono">{lighthouse.fcp.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>TTFB</span>
                  <span className="font-mono">{lighthouse.ttfb.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Script実行時間</span>
                  <span className="font-mono">{cpu.scriptExecutionTime.toFixed(1)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>レンダリング時間</span>
                  <span className="font-mono">{cpu.renderingTime.toFixed(1)}ms</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">メモリ詳細</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>使用量</span>
                  <span className="font-mono">
                    {performanceOptimizationService.formatBytes(memory.usedJSHeapSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>総容量</span>
                  <span className="font-mono">
                    {performanceOptimizationService.formatBytes(memory.totalJSHeapSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>上限</span>
                  <span className="font-mono">
                    {performanceOptimizationService.formatBytes(memory.jsHeapSizeLimit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GC頻度</span>
                  <span className="font-mono">{memory.gcPerformance.frequency}回/分</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最適化統計</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>有効な最適化</span>
                  <span className="font-bold text-green-600">
                    {optimizations.filter((opt) => opt.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>総改善率</span>
                  <span className="font-bold text-blue-600">
                    +
                    {optimizations
                      .filter((opt) => opt.status === 'active')
                      .reduce((sum, opt) => sum + opt.improvement, 0)}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>メモリリーク</span>
                  <span
                    className={`font-bold ${memory.memoryLeaks.length > 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {memory.memoryLeaks.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>長時間タスク</span>
                  <span
                    className={`font-bold ${cpu.longTasks.length > 0 ? 'text-orange-600' : 'text-green-600'}`}
                  >
                    {cpu.longTasks.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 推奨事項 */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                パフォーマンス改善推奨事項
              </CardTitle>
              <CardDescription>AIが分析したパフォーマンス最適化の提案</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <Lightbulb className="h-4 w-4" />
                      <AlertTitle>推奨事項 #{index + 1}</AlertTitle>
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    🎉 パフォーマンス最適！
                  </h3>
                  <p className="text-gray-600">
                    現在、特別な最適化は必要ありません。素晴らしいパフォーマンスを維持しています！
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceOptimizationDashboard;
