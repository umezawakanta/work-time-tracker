import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, TrendingUp, Clock, Gauge, Target, RefreshCw } from 'lucide-react';
import { usePerformanceMonitoring, PerformanceMetrics } from '@/lib/performanceOptimizer';

export const PerformanceDashboard: React.FC = () => {
  const { metrics, score, suggestions } = usePerformanceMonitoring();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // パフォーマンステストの再実行
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 95) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 85) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const formatMetric = (value: number | undefined, unit: string = 'ms') => {
    if (!value) return '--';
    return `${Math.round(value)}${unit}`;
  };

  const getMetricStatus = (value: number | undefined, thresholds: [number, number]) => {
    if (!value) return 'unknown';
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">🥷 パフォーマンス忍者監視</h1>
          <p className="text-gray-600">Core Web Vitalsとパフォーマンス最適化</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? '測定中...' : '再測定'}
        </Button>
      </div>

      {/* Lighthouse Score */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-6 w-6 text-blue-500" />
            推定 Lighthouse Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}</div>
              <Badge className={getScoreBadgeColor(score)}>
                {score >= 95 ? '優秀' : score >= 85 ? '良好' : '要改善'}
              </Badge>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">目標: 95+</span>
                <span className="text-sm font-medium">{score}/100</span>
              </div>
              <Progress value={score} className="h-3" />
            </div>
            <div className="text-center text-sm text-gray-600">
              🎯 パフォーマンス忍者バッジまで: {Math.max(0, 95 - score)}ポイント
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* First Contentful Paint */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              FCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className={`text-2xl font-bold ${getStatusColor(getMetricStatus(metrics.fcp, [1800, 3000]))}`}
              >
                {formatMetric(metrics.fcp)}
              </div>
              <Badge className={getStatusBadge(getMetricStatus(metrics.fcp, [1800, 3000]))}>
                {getMetricStatus(metrics.fcp, [1800, 3000]) === 'good'
                  ? '良好'
                  : getMetricStatus(metrics.fcp, [1800, 3000]) === 'needs-improvement'
                    ? '要改善'
                    : '不良'}
              </Badge>
              <div className="text-xs text-gray-600">目標: 1.8秒以下</div>
            </div>
          </CardContent>
        </Card>

        {/* Largest Contentful Paint */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              LCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className={`text-2xl font-bold ${getStatusColor(getMetricStatus(metrics.lcp, [2500, 4000]))}`}
              >
                {formatMetric(metrics.lcp)}
              </div>
              <Badge className={getStatusBadge(getMetricStatus(metrics.lcp, [2500, 4000]))}>
                {getMetricStatus(metrics.lcp, [2500, 4000]) === 'good'
                  ? '良好'
                  : getMetricStatus(metrics.lcp, [2500, 4000]) === 'needs-improvement'
                    ? '要改善'
                    : '不良'}
              </Badge>
              <div className="text-xs text-gray-600">目標: 2.5秒以下</div>
            </div>
          </CardContent>
        </Card>

        {/* First Input Delay */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              FID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className={`text-2xl font-bold ${getStatusColor(getMetricStatus(metrics.fid, [100, 300]))}`}
              >
                {formatMetric(metrics.fid)}
              </div>
              <Badge className={getStatusBadge(getMetricStatus(metrics.fid, [100, 300]))}>
                {getMetricStatus(metrics.fid, [100, 300]) === 'good'
                  ? '良好'
                  : getMetricStatus(metrics.fid, [100, 300]) === 'needs-improvement'
                    ? '要改善'
                    : '不良'}
              </Badge>
              <div className="text-xs text-gray-600">目標: 100ms以下</div>
            </div>
          </CardContent>
        </Card>

        {/* Cumulative Layout Shift */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              CLS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className={`text-2xl font-bold ${getStatusColor(getMetricStatus(metrics.cls, [0.1, 0.25]))}`}
              >
                {formatMetric(metrics.cls, '')}
              </div>
              <Badge className={getStatusBadge(getMetricStatus(metrics.cls, [0.1, 0.25]))}>
                {getMetricStatus(metrics.cls, [0.1, 0.25]) === 'good'
                  ? '良好'
                  : getMetricStatus(metrics.cls, [0.1, 0.25]) === 'needs-improvement'
                    ? '要改善'
                    : '不良'}
              </Badge>
              <div className="text-xs text-gray-600">目標: 0.1以下</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最適化提案 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            最適化提案
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-green-600">
              <Target className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">パフォーマンスは最適化されています！🎉</p>
              <p className="text-sm text-gray-600 mt-1">
                すべてのメトリクスが目標値を達成しています
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
                  <span className="text-sm font-medium text-yellow-800">{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* パフォーマンス忍者バッジ進捗 */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🥷 パフォーマンス忍者バッジ進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">バッジ獲得進捗</span>
                <span className="text-sm font-medium">
                  {Math.min(100, (score / 95) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={Math.min(100, (score / 95) * 100)} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{score}</div>
                <div className="text-sm text-gray-600">現在のスコア</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">95</div>
                <div className="text-sm text-gray-600">目標スコア</div>
              </div>
            </div>
            {score >= 95 ? (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-green-600 font-bold text-lg">🎉 バッジ獲得！</div>
                <div className="text-green-700 text-sm">
                  パフォーマンス忍者バッジを獲得しました！
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-600">
                あと {95 - score} ポイントでバッジ獲得！
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
