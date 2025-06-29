import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface PlannedVsActualData {
  period: string;
  periodType: 'weekly' | 'monthly' | 'quarterly';
  planned: {
    badges: number;
    hours: number;
    categories: Record<string, number>;
    milestones: string[];
  };
  actual: {
    badges: number;
    hours: number;
    categories: Record<string, number>;
    completedMilestones: string[];
  };
  variance: {
    badgeVariance: number;
    hourVariance: number;
    badgeVariancePercentage: number;
    hourVariancePercentage: number;
  };
  performance: {
    achievementRate: number;
    efficiency: number;
    qualityScore: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

interface CategoryComparison {
  categoryName: string;
  performance: {
    status: 'ahead' | 'on_track' | 'behind' | 'critical';
  };
}

interface PerformanceInsight {
  type: 'success' | 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  metrics?: { value: number; unit: string; trend: 'up' | 'down' | 'stable' };
}

// パフォーマンス洞察表示コンポーネント
const generatePerformanceInsights = (
  data: PlannedVsActualData,
  categoryComparisons: CategoryComparison[]
): PerformanceInsight[] => {
  const insights: PerformanceInsight[] = [];

  // 達成率に基づく洞察
  if (data.performance.achievementRate < 30) {
    insights.push({
      type: 'critical',
      title: '達成率が大幅に低下',
      description: `現在の達成率${data.performance.achievementRate.toFixed(1)}%は目標を大きく下回っています`,
      impact: 'high',
      actionItems: [
        '学習時間の大幅な増加（週+10時間）',
        '優先度の見直しと集中分野の絞り込み',
        '学習方法の抜本的改善',
      ],
      metrics: {
        value: data.performance.achievementRate,
        unit: '%',
        trend: 'down',
      },
    });
  }

  // 効率に基づく洞察
  if (data.performance.efficiency > 75) {
    insights.push({
      type: 'success',
      title: '高い学習効率を維持',
      description: `効率スコア${data.performance.efficiency.toFixed(1)}%は優秀なレベルです`,
      impact: 'medium',
      actionItems: [
        '現在の学習方法を他分野にも適用',
        '効率的な手法をドキュメント化',
        '学習時間の増加で更なる成果を目指す',
      ],
      metrics: {
        value: data.performance.efficiency,
        unit: '%',
        trend: 'stable',
      },
    });
  }

  // カテゴリ別の洞察
  const criticalCategories = categoryComparisons.filter(
    (cat) => cat.performance.status === 'critical'
  );
  if (criticalCategories.length > 0) {
    insights.push({
      type: 'warning',
      title: '要注意カテゴリの存在',
      description: `${criticalCategories.map((cat) => cat.categoryName).join('、')}分野で深刻な遅れが発生`,
      impact: 'high',
      actionItems: ['要注意分野への集中投入', '学習方法の見直し', '外部サポートの検討'],
    });
  }

  // 時間効率の洞察
  if (Math.abs(data.variance.hourVariancePercentage) < 10) {
    insights.push({
      type: 'info',
      title: '時間管理が適切',
      description: `時間使用の予実差が${Math.abs(data.variance.hourVariancePercentage).toFixed(1)}%と小さく、計画通りです`,
      impact: 'low',
      actionItems: ['現在の時間管理手法を継続', '微調整で更なる改善を図る'],
    });
  }

  // 品質スコアの洞察
  if (data.performance.qualityScore > 80) {
    insights.push({
      type: 'success',
      title: '高品質な学習を実現',
      description: `品質スコア${data.performance.qualityScore.toFixed(1)}%は理想的なレベルです`,
      impact: 'medium',
      actionItems: ['品質重視の姿勢を維持', '学習の深度を更に向上', '知識の実践的応用を強化'],
    });
  }

  return insights;
};

const renderPerformanceInsights = (insights: PerformanceInsight[]) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5" />
        💡 パフォーマンス洞察・改善提案
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              insight.type === 'success'
                ? 'bg-green-50 border-green-200'
                : insight.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : insight.type === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  insight.type === 'success'
                    ? 'bg-green-500'
                    : insight.type === 'warning'
                      ? 'bg-yellow-500'
                      : insight.type === 'critical'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                }`}
              >
                {insight.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : insight.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-white" />
                ) : insight.type === 'critical' ? (
                  <AlertTriangle className="w-4 h-4 text-white" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-white" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{insight.title}</h4>
                  <Badge
                    variant={
                      insight.impact === 'high'
                        ? 'destructive'
                        : insight.impact === 'medium'
                          ? 'default'
                          : 'secondary'
                    }
                  >
                    {insight.impact} impact
                  </Badge>
                  {insight.metrics && (
                    <div className="flex items-center gap-1 text-sm">
                      {insight.metrics.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : insight.metrics.trend === 'down' ? (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full" />
                      )}
                      <span className="font-medium">
                        {insight.metrics.value.toFixed(1)}
                        {insight.metrics.unit}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                <div>
                  <div className="text-sm font-medium mb-2">推奨アクション:</div>
                  <ul className="text-sm space-y-1">
                    {insight.actionItems.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export { generatePerformanceInsights, renderPerformanceInsights };
