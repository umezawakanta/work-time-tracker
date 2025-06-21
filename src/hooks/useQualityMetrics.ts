import { useState, useEffect, useCallback } from 'react';
import { qualityAnalysisService, QualityMetrics } from '@/services/quality/QualityAnalysisService';

interface UseQualityMetricsReturn {
  metrics: QualityMetrics | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
  loadMetrics: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useQualityMetrics = (
  autoRefresh = false,
  refreshInterval = 300000
): UseQualityMetricsReturn => {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setError(null);
      const data = await qualityAnalysisService.getQualityMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quality metrics';
      setError(errorMessage);
      console.error('Failed to load quality metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshMetrics = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // レポートの更新をトリガー
      await qualityAnalysisService.refreshReports();

      // 少し待ってから新しいデータを取得
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const data = await qualityAnalysisService.getQualityMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh quality metrics';
      setError(errorMessage);
      console.error('Failed to refresh quality metrics:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 初回ロード
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // 自動更新
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        loadMetrics();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isLoading, isRefreshing, loadMetrics]);

  return {
    metrics,
    isLoading,
    isRefreshing,
    error,
    refreshMetrics,
    loadMetrics,
    lastUpdated,
  };
};

// 品質トレンド分析フック
export const useQualityTrends = (days = 30) => {
  const { metrics } = useQualityMetrics();
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    if (metrics?.trends) {
      // 指定された日数分のトレンドデータを抽出
      const recentTrends = metrics.trends.slice(-days);
      setTrends(recentTrends);
    }
  }, [metrics, days]);

  const calculateTrendDirection = useCallback(
    (metric: 'testCoverage' | 'eslintScore' | 'performanceScore' | 'overallScore') => {
      if (trends.length < 2) return 'stable';

      const recent = trends.slice(-7); // 最近1週間
      const older = trends.slice(-14, -7); // その前の1週間

      const recentAvg = recent.reduce((sum, item) => sum + item[metric], 0) / recent.length;
      const olderAvg = older.reduce((sum, item) => sum + item[metric], 0) / older.length;

      const difference = recentAvg - olderAvg;

      if (difference > 2) return 'improving';
      if (difference < -2) return 'declining';
      return 'stable';
    },
    [trends]
  );

  const getTrendInsights = useCallback(() => {
    const insights = [];

    const testCoverageTrend = calculateTrendDirection('testCoverage');
    const eslintTrend = calculateTrendDirection('eslintScore');
    const performanceTrend = calculateTrendDirection('performanceScore');
    const overallTrend = calculateTrendDirection('overallScore');

    if (testCoverageTrend === 'improving') {
      insights.push('📈 テストカバレッジが向上しています');
    } else if (testCoverageTrend === 'declining') {
      insights.push('📉 テストカバレッジが低下しています - 新機能のテスト追加を推奨');
    }

    if (eslintTrend === 'improving') {
      insights.push('✨ コード品質が向上しています');
    } else if (eslintTrend === 'declining') {
      insights.push('⚠️ ESLintエラーが増加しています - リファクタリングを検討してください');
    }

    if (performanceTrend === 'improving') {
      insights.push('🚀 パフォーマンスが改善されています');
    } else if (performanceTrend === 'declining') {
      insights.push('🐌 パフォーマンスが低下しています - 最適化が必要です');
    }

    if (overallTrend === 'improving') {
      insights.push('🎯 全体的な品質が向上しています！');
    } else if (overallTrend === 'declining') {
      insights.push('🔧 品質メトリクスの改善が必要です');
    }

    return insights;
  }, [calculateTrendDirection]);

  return {
    trends,
    calculateTrendDirection,
    getTrendInsights,
  };
};

// 品質アラートフック
export const useQualityAlerts = () => {
  const { metrics } = useQualityMetrics();
  const [alerts, setAlerts] = useState<
    Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      action?: string;
      timestamp: Date;
    }>
  >([]);

  useEffect(() => {
    if (!metrics) return;

    const newAlerts = [];
    const now = new Date();

    // 品質ゲートチェック
    const qualityGate = qualityAnalysisService.checkQualityGate(metrics);

    if (!qualityGate.passed) {
      newAlerts.push({
        type: 'error' as const,
        message: '品質ゲートを通過していません',
        action: '要改善項目を確認してください',
        timestamp: now,
      });
    }

    // テストカバレッジアラート
    if (metrics.testCoverage.overall.lines < 70) {
      newAlerts.push({
        type: 'warning' as const,
        message: `テストカバレッジが低下しています (${metrics.testCoverage.overall.lines}%)`,
        action: '新しいテストケースを追加してください',
        timestamp: now,
      });
    }

    // 静的解析アラート
    if (metrics.staticAnalysis.eslint.errorCount > 0) {
      newAlerts.push({
        type: 'error' as const,
        message: `${metrics.staticAnalysis.eslint.errorCount}件のESLintエラーがあります`,
        action: 'エラーを修正してください',
        timestamp: now,
      });
    }

    // パフォーマンスアラート
    if (metrics.performance.lighthouse.performance < 80) {
      newAlerts.push({
        type: 'warning' as const,
        message: `パフォーマンススコアが低下しています (${metrics.performance.lighthouse.performance}点)`,
        action: 'パフォーマンス最適化を検討してください',
        timestamp: now,
      });
    }

    setAlerts(newAlerts);
  }, [metrics]);

  const dismissAlert = useCallback((index: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    dismissAlert,
    clearAllAlerts,
    hasAlerts: alerts.length > 0,
    errorCount: alerts.filter((a) => a.type === 'error').length,
    warningCount: alerts.filter((a) => a.type === 'warning').length,
  };
};
