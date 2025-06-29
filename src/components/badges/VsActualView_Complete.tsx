import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

// 完全な予定vs実績ビューレンダリング関数
const renderVsActualView = () => {
  // インターフェース定義（再定義）
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
    categoryIcon: string;
    planned: { badges: number; hours: number; priority: 'high' | 'medium' | 'low' };
    actual: { badges: number; hours: number; completedBadges: string[] };
    performance: {
      badgeAchievementRate: number;
      hourEfficiency: number;
      status: 'ahead' | 'on_track' | 'behind' | 'critical';
    };
    reasons: { accelerators: string[]; blockers: string[] };
  }

  interface TimeSeriesComparison {
    date: string;
    plannedCumulative: number;
    actualCumulative: number;
    plannedDaily: number;
    actualDaily: number;
    gap: number;
  }

  interface PerformanceInsight {
    type: 'success' | 'warning' | 'critical' | 'info';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionItems: string[];
    metrics?: { value: number; unit: string; trend: 'up' | 'down' | 'stable' };
  }

  // サンプルデータ生成
  const generateVsActualData = () => {
    const monthlyData: PlannedVsActualData = {
      period: '2025-07',
      periodType: 'monthly',
      planned: {
        badges: 15,
        hours: 180,
        categories: {
          セキュリティ: 4,
          'デザイン・UX': 3,
          プロジェクト管理: 4,
          開発: 2,
          'AI・機械学習': 2,
        },
        milestones: [
          'セキュリティ基礎完全習得',
          'UXリサーチ手法マスター',
          '要件定義プロセス確立',
          'AI基礎環境構築',
        ],
      },
      actual: {
        badges: 4,
        hours: 142,
        categories: {
          セキュリティ: 2,
          'デザイン・UX': 1,
          プロジェクト管理: 1,
          開発: 0,
          'AI・機械学習': 0,
        },
        completedMilestones: ['セキュリティ基礎完全習得', 'UXリサーチ手法マスター'],
      },
      variance: {
        badgeVariance: -11,
        hourVariance: -38,
        badgeVariancePercentage: -73.3,
        hourVariancePercentage: -21.1,
      },
      performance: {
        achievementRate: 26.7,
        efficiency: 78.9,
        qualityScore: 85.2,
        riskLevel: 'medium',
      },
    };

    const categoryComparisons: CategoryComparison[] = [
      {
        categoryName: 'セキュリティ',
        categoryIcon: '🔐',
        planned: { badges: 4, hours: 60, priority: 'high' },
        actual: {
          badges: 2,
          hours: 52,
          completedBadges: ['セキュリティ基礎', 'ネットワークセキュリティ'],
        },
        performance: { badgeAchievementRate: 50.0, hourEfficiency: 86.7, status: 'on_track' },
        reasons: {
          accelerators: ['集中的な学習時間の確保', '実践的な演習による理解促進'],
          blockers: ['ペネトレーションテストの難易度が予想以上'],
        },
      },
      {
        categoryName: 'AI・機械学習',
        categoryIcon: '🤖',
        planned: { badges: 2, hours: 20, priority: 'low' },
        actual: { badges: 0, hours: 12, completedBadges: [] },
        performance: { badgeAchievementRate: 0.0, hourEfficiency: 60.0, status: 'critical' },
        reasons: {
          accelerators: ['Python基礎の復習完了'],
          blockers: ['数学的基礎知識の不足', '機械学習ライブラリの習得困難'],
        },
      },
    ];

    const timeSeriesData: TimeSeriesComparison[] = [
      {
        date: '2025-07-01',
        plannedCumulative: 1,
        actualCumulative: 0,
        plannedDaily: 1,
        actualDaily: 0,
        gap: -1,
      },
      {
        date: '2025-07-08',
        plannedCumulative: 4,
        actualCumulative: 2,
        plannedDaily: 1,
        actualDaily: 1,
        gap: -2,
      },
      {
        date: '2025-07-15',
        plannedCumulative: 6,
        actualCumulative: 3,
        plannedDaily: 2,
        actualDaily: 1,
        gap: -3,
      },
      {
        date: '2025-07-22',
        plannedCumulative: 9,
        actualCumulative: 4,
        plannedDaily: 3,
        actualDaily: 1,
        gap: -5,
      },
      {
        date: '2025-07-31',
        plannedCumulative: 15,
        actualCumulative: 4,
        plannedDaily: 3,
        actualDaily: 0,
        gap: -11,
      },
    ];

    return { monthlyData, categoryComparisons, timeSeriesData };
  };

  const { monthlyData, categoryComparisons, timeSeriesData } = generateVsActualData();

  // 洞察生成
  const insights: PerformanceInsight[] = [
    {
      type: 'critical',
      title: '達成率が大幅に低下',
      description: `現在の達成率${monthlyData.performance.achievementRate.toFixed(1)}%は目標を大きく下回っています`,
      impact: 'high',
      actionItems: [
        '学習時間の大幅な増加（週+10時間）',
        '優先度の見直しと集中分野の絞り込み',
        '学習方法の抜本的改善',
      ],
      metrics: { value: monthlyData.performance.achievementRate, unit: '%', trend: 'down' },
    },
    {
      type: 'success',
      title: '高い学習効率を維持',
      description: `効率スコア${monthlyData.performance.efficiency.toFixed(1)}%は優秀なレベルです`,
      impact: 'medium',
      actionItems: ['現在の学習方法を他分野にも適用', '効率的な手法をドキュメント化'],
      metrics: { value: monthlyData.performance.efficiency, unit: '%', trend: 'stable' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* メインメトリクス */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            📈 予定 vs 実績 - {monthlyData.period}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">バッジ数</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-bold text-gray-600">
                  {monthlyData.planned.badges}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="text-lg font-bold text-blue-600">{monthlyData.actual.badges}</span>
              </div>
              <div className="text-xs mt-1 text-red-600">
                {monthlyData.variance.badgeVariance} (
                {monthlyData.variance.badgeVariancePercentage.toFixed(1)}%)
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">学習時間</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-bold text-gray-600">
                  {monthlyData.planned.hours}h
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="text-lg font-bold text-green-600">
                  {monthlyData.actual.hours}h
                </span>
              </div>
              <div className="text-xs mt-1 text-red-600">
                {monthlyData.variance.hourVariance}h (
                {monthlyData.variance.hourVariancePercentage.toFixed(1)}%)
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">達成率</div>
              <div className="text-2xl font-bold text-purple-600">
                {monthlyData.performance.achievementRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {monthlyData.actual.badges}/{monthlyData.planned.badges} 完了
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">効率</div>
              <div className="text-2xl font-bold text-orange-600">
                {monthlyData.performance.efficiency.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">時間効率性</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">全体達成率</span>
                <span className="text-sm font-bold text-purple-600">
                  {monthlyData.performance.achievementRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={monthlyData.performance.achievementRate} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">効率スコア</span>
                <span className="text-sm font-bold text-orange-600">
                  {monthlyData.performance.efficiency.toFixed(1)}%
                </span>
              </div>
              <Progress value={monthlyData.performance.efficiency} className="h-3" />
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 text-yellow-700 rounded-lg">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4" />
              中リスク
            </div>
            <div className="text-sm mt-1">目標達成には追加努力が必要です</div>
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別比較 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            🎯 カテゴリ別 予定vs実績
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryComparisons.map((category) => (
              <div key={category.categoryName} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.categoryIcon}</span>
                    <div>
                      <h4 className="font-medium">{category.categoryName}</h4>
                      <Badge
                        variant={category.planned.priority === 'high' ? 'destructive' : 'secondary'}
                      >
                        {category.planned.priority} priority
                      </Badge>
                    </div>
                  </div>
                  <Badge
                    variant={
                      category.performance.status === 'critical' ? 'destructive' : 'secondary'
                    }
                  >
                    {category.performance.status === 'on_track'
                      ? '順調'
                      : category.performance.status === 'critical'
                        ? '要注意'
                        : category.performance.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">予定バッジ</div>
                    <div className="text-lg font-bold text-gray-600">{category.planned.badges}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">実績バッジ</div>
                    <div className="text-lg font-bold text-blue-600">{category.actual.badges}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">予定時間</div>
                    <div className="text-lg font-bold text-gray-600">{category.planned.hours}h</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">実績時間</div>
                    <div className="text-lg font-bold text-green-600">{category.actual.hours}h</div>
                  </div>
                </div>

                {category.actual.completedBadges.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">完了バッジ:</div>
                    <div className="flex flex-wrap gap-2">
                      {category.actual.completedBadges.map((badge, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          ✅ {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* パフォーマンス洞察 */}
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
                        : insight.type === 'critical'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                    }`}
                  >
                    {insight.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={insight.impact === 'high' ? 'destructive' : 'default'}>
                        {insight.impact} impact
                      </Badge>
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
    </div>
  );
};
