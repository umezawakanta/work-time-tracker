/**
 * 🚀 パフォーマンス最適化ダッシュボード
 * BaseDashboardを使用した統一されたダッシュボード実装
 */

import React, { useState, useEffect } from 'react';
import { BaseDashboard, MetricCard, DashboardSection } from '@/components/ui/BaseDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Rocket,
  Gauge,
  Clock,
  Eye,
  Zap,
  Image,
  Code,
  Database,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

interface PerformanceMetrics {
  lighthouseScore: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: 'images' | 'code' | 'caching' | 'network' | 'rendering';
  potentialSavings: string;
}

export const PerformanceOptimizationDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - 実際の実装では performance APIs を使用
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        // シミュレート API 呼び出し
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setMetrics({
          lighthouseScore: 85,
          firstContentfulPaint: 1.2,
          largestContentfulPaint: 2.1,
          cumulativeLayoutShift: 0.05,
          timeToInteractive: 2.8,
          totalBlockingTime: 150,
        });
      } catch (err) {
        setError('パフォーマンスメトリクスの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const handleRefresh = () => {
    setMetrics(null);
    setIsLoading(true);
    // 再読み込みのシミュレーション
    setTimeout(() => {
      setMetrics({
        lighthouseScore: Math.floor(Math.random() * 20) + 80,
        firstContentfulPaint: Math.random() * 0.5 + 1.0,
        largestContentfulPaint: Math.random() * 0.8 + 1.8,
        cumulativeLayoutShift: Math.random() * 0.1,
        timeToInteractive: Math.random() * 1.0 + 2.0,
        totalBlockingTime: Math.floor(Math.random() * 100) + 100,
      });
      setIsLoading(false);
    }, 1000);
  };

  const getMetricColor = (
    value: number,
    thresholds: { good: number; poor: number },
    reverse = false
  ) => {
    if (reverse) {
      return value <= thresholds.good ? 'green' : value <= thresholds.poor ? 'yellow' : 'red';
    }
    return value >= thresholds.good ? 'green' : value >= thresholds.poor ? 'yellow' : 'red';
  };

  const generateMetricCards = (): MetricCard[] => {
    if (!metrics) return [];

    return [
      {
        id: 'lighthouse',
        title: 'Lighthouse スコア',
        value: metrics.lighthouseScore,
        description: 'パフォーマンス総合評価',
        icon: <Gauge className="h-4 w-4" />,
        color: getMetricColor(metrics.lighthouseScore, { good: 90, poor: 50 }),
        trend: {
          value: 5.2,
          isPositive: true,
          label: '前回比較',
        },
      },
      {
        id: 'fcp',
        title: 'First Contentful Paint',
        value: `${metrics.firstContentfulPaint.toFixed(1)}s`,
        description: '初回コンテンツ表示時間',
        icon: <Eye className="h-4 w-4" />,
        color: getMetricColor(metrics.firstContentfulPaint, { good: 1.8, poor: 3.0 }, true),
      },
      {
        id: 'lcp',
        title: 'Largest Contentful Paint',
        value: `${metrics.largestContentfulPaint.toFixed(1)}s`,
        description: 'メインコンテンツ表示時間',
        icon: <Clock className="h-4 w-4" />,
        color: getMetricColor(metrics.largestContentfulPaint, { good: 2.5, poor: 4.0 }, true),
      },
      {
        id: 'cls',
        title: 'Cumulative Layout Shift',
        value: metrics.cumulativeLayoutShift.toFixed(3),
        description: 'レイアウト安定性',
        icon: <Zap className="h-4 w-4" />,
        color: getMetricColor(metrics.cumulativeLayoutShift, { good: 0.1, poor: 0.25 }, true),
      },
      {
        id: 'tti',
        title: 'Time to Interactive',
        value: `${metrics.timeToInteractive.toFixed(1)}s`,
        description: '操作可能になるまでの時間',
        icon: <TrendingUp className="h-4 w-4" />,
        color: getMetricColor(metrics.timeToInteractive, { good: 3.8, poor: 7.3 }, true),
      },
      {
        id: 'tbt',
        title: 'Total Blocking Time',
        value: `${metrics.totalBlockingTime}ms`,
        description: 'メインスレッド阻害時間',
        icon: <AlertTriangle className="h-4 w-4" />,
        color: getMetricColor(metrics.totalBlockingTime, { good: 200, poor: 600 }, true),
      },
    ];
  };

  const optimizationRecommendations: OptimizationRecommendation[] = [
    {
      id: 'images',
      title: '画像最適化',
      description: 'WebP形式の使用で20%の帯域幅削減が期待できます',
      impact: 'high',
      effort: 'medium',
      category: 'images',
      potentialSavings: '300KB',
    },
    {
      id: 'code-split',
      title: 'コード分割',
      description: 'lazy loadingにより初期読み込み時間を15%短縮',
      impact: 'high',
      effort: 'medium',
      category: 'code',
      potentialSavings: '500KB',
    },
    {
      id: 'caching',
      title: 'キャッシュ戦略',
      description: '適切なキャッシュヘッダーでリピート訪問を高速化',
      impact: 'medium',
      effort: 'low',
      category: 'caching',
      potentialSavings: '1.2s',
    },
    {
      id: 'unused-js',
      title: '未使用JavaScript削除',
      description: 'Tree shakingとバンドル分析で不要コードを除去',
      impact: 'medium',
      effort: 'high',
      category: 'code',
      potentialSavings: '200KB',
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const recommendationsSection: DashboardSection = {
    id: 'recommendations',
    title: '最適化の推奨事項',
    order: 1,
    content: (
      <div className="grid gap-4 md:grid-cols-2">
        {optimizationRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getImpactColor(recommendation.impact)}>
                    {recommendation.impact === 'high'
                      ? '高影響'
                      : recommendation.impact === 'medium'
                        ? '中影響'
                        : '低影響'}
                  </Badge>
                  <Badge className={getEffortColor(recommendation.effort)}>
                    {recommendation.effort === 'low'
                      ? '簡単'
                      : recommendation.effort === 'medium'
                        ? '普通'
                        : '困難'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3">{recommendation.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">予想削減量:</span>
                <span className="font-semibold text-green-600">
                  {recommendation.potentialSavings}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  };

  const performanceInsightsSection: DashboardSection = {
    id: 'insights',
    title: 'パフォーマンス分析',
    order: 2,
    content: (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>総合評価:</strong> サイトのパフォーマンスは良好です。
                さらなる最適化により、ユーザーエクスペリエンスを向上できます。
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">✅ 良好な項目</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• レイアウト安定性が優秀</li>
                  <li>• 初期表示が高速</li>
                  <li>• 適切なキャッシュ設定</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 改善可能</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• メインコンテンツ表示時間</li>
                  <li>• JavaScriptバンドルサイズ</li>
                  <li>• 画像最適化</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📈 次のステップ</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• WebP画像フォーマット</li>
                  <li>• コンポーネント遅延読み込み</li>
                  <li>• CDN設定の最適化</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
  };

  return (
    <BaseDashboard
      title="パフォーマンス最適化ダッシュボード"
      description="リアルタイムパフォーマンス監視・最適化・レポート"
      icon={<Rocket className="h-8 w-8 text-blue-600" />}
      metrics={generateMetricCards()}
      metricsColumns={3}
      sections={[recommendationsSection, performanceInsightsSection]}
      isLoading={isLoading}
      error={error}
      onRefresh={handleRefresh}
      actions={[
        {
          label: 'レポート生成',
          icon: <Lightbulb className="h-4 w-4 mr-2" />,
          onClick: () => console.log('Generate report'),
          variant: 'default',
        },
      ]}
    />
  );
};

export default PerformanceOptimizationDashboard;
