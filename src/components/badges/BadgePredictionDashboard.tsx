import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Brain,
  BarChart3,
  Zap,
  Trophy,
  Star,
  Activity,
  Lightbulb,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { EXPANDED_BADGES_DATABASE } from '@/services/development/ExpandedBadgesDatabase';
import { DevelopmentBadge } from '@/types/development-badges';

interface BadgePrediction {
  badgeId: string;
  badge: DevelopmentBadge;
  predictedCompletionDate: string;
  daysToCompletion: number;
  confidenceLevel: number; // 0-100
  currentVelocity: number; // progress per day
  requiredDailyProgress: number;
  trend: 'accelerating' | 'steady' | 'decelerating' | 'stalled';
  factors: {
    historical: number;
    current: number;
    difficulty: number;
    prerequisites: number;
  };
  risks: Array<{
    type: string;
    probability: number;
    impact: string;
    mitigation: string;
  }>;
  recommendations: string[];
}

interface PredictionMetrics {
  totalBadgesTracked: number;
  onTrackBadges: number;
  atRiskBadges: number;
  acceleratingBadges: number;
  averageCompletionTime: number;
  predictedCompletionRate: number;
}

export const BadgePredictionDashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<BadgePrediction[]>([]);
  const [metrics, setMetrics] = useState<PredictionMetrics | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<BadgePrediction | null>(null);
  const [timeHorizon, setTimeHorizon] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [filterType, setFilterType] = useState<'all' | 'on-track' | 'at-risk' | 'accelerating'>(
    'all'
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePredictions();
  }, [timeHorizon]);

  /**
   * 🚀 予測システム初期化
   */
  const initializePredictions = async () => {
    setLoading(true);

    try {
      // 進行中のバッジを取得
      const inProgressBadges = EXPANDED_BADGES_DATABASE.filter(
        (badge) => !badge.isCompleted && badge.progress > 0
      );

      // 各バッジの予測を生成
      const badgePredictions = await Promise.all(
        inProgressBadges.map((badge) => generateBadgePrediction(badge))
      );

      setPredictions(badgePredictions);

      // メトリクス計算
      const predictionMetrics = calculatePredictionMetrics(badgePredictions);
      setMetrics(predictionMetrics);

      setLoading(false);
    } catch (error) {
      console.error('予測システム初期化エラー:', error);
      setLoading(false);
    }
  };

  /**
   * 🔮 個別バッジ予測生成
   */
  const generateBadgePrediction = async (badge: DevelopmentBadge): Promise<BadgePrediction> => {
    // 履歴データをシミュレーション（実装時は実際のデータから取得）
    const historicalData = generateHistoricalData(badge);

    // 現在の進捗速度を計算
    const currentVelocity = calculateCurrentVelocity(historicalData);

    // 必要な日次進捗を計算
    const remainingProgress = 100 - badge.progress;
    const targetDays = getTargetDays(timeHorizon);
    const requiredDailyProgress = remainingProgress / targetDays;

    // 完了予測日を計算
    const daysToCompletion =
      currentVelocity > 0 ? Math.ceil(remainingProgress / currentVelocity) : -1;

    const predictedDate =
      daysToCompletion > 0 ? new Date(Date.now() + daysToCompletion * 24 * 60 * 60 * 1000) : null;

    // トレンド分析
    const trend = analyzeTrend(historicalData);

    // 信頼度計算
    const confidenceLevel = calculateConfidenceLevel(badge, historicalData, currentVelocity);

    // リスク分析
    const risks = analyzeRisks(badge, currentVelocity, requiredDailyProgress);

    // 推奨事項生成
    const recommendations = generateRecommendations(
      badge,
      currentVelocity,
      requiredDailyProgress,
      trend
    );

    return {
      badgeId: badge.id,
      badge,
      predictedCompletionDate: predictedDate ? predictedDate.toISOString() : '',
      daysToCompletion,
      confidenceLevel,
      currentVelocity,
      requiredDailyProgress,
      trend,
      factors: {
        historical: calculateHistoricalFactor(historicalData),
        current: badge.progress,
        difficulty: getDifficultyFactor(badge.difficulty),
        prerequisites: calculatePrerequisitesFactor(badge),
      },
      risks,
      recommendations,
    };
  };

  /**
   * 📊 履歴データ生成（シミュレーション）
   */
  const generateHistoricalData = (badge: DevelopmentBadge) => {
    const days = 30;
    const data = [];
    let progress = Math.max(0, badge.progress - 30); // 30日前の進捗を推定

    for (let i = 0; i < days; i++) {
      const dailyProgress = Math.random() * 2 + 0.5; // 0.5-2.5% per day
      progress = Math.min(badge.progress, progress + dailyProgress);
      data.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
        progress,
        velocity: dailyProgress,
      });
    }

    return data;
  };

  /**
   * ⚡ 現在の進捗速度計算
   */
  const calculateCurrentVelocity = (historicalData: any[]) => {
    if (historicalData.length < 7) return 1; // デフォルト値

    const recentData = historicalData.slice(-7); // 直近7日
    const totalProgress = recentData.reduce((sum, day) => sum + day.velocity, 0);
    return totalProgress / recentData.length;
  };

  /**
   * 📈 トレンド分析
   */
  const analyzeTrend = (
    historicalData: any[]
  ): 'accelerating' | 'steady' | 'decelerating' | 'stalled' => {
    if (historicalData.length < 14) return 'steady';

    const firstHalf = historicalData.slice(0, Math.floor(historicalData.length / 2));
    const secondHalf = historicalData.slice(Math.floor(historicalData.length / 2));

    const firstAvg = firstHalf.reduce((sum, day) => sum + day.velocity, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.velocity, 0) / secondHalf.length;

    const changeRate = (secondAvg - firstAvg) / firstAvg;

    if (changeRate > 0.2) return 'accelerating';
    if (changeRate < -0.2) return 'decelerating';
    if (secondAvg < 0.1) return 'stalled';
    return 'steady';
  };

  /**
   * 🎯 信頼度計算
   */
  const calculateConfidenceLevel = (
    badge: DevelopmentBadge,
    historicalData: any[],
    velocity: number
  ): number => {
    let confidence = 50; // ベース信頼度

    // 進捗の一貫性
    const velocityVariance = calculateVariance(historicalData.map((d) => d.velocity));
    confidence += Math.max(0, 30 - velocityVariance * 10);

    // バッジの難易度
    const difficultyPenalty = getDifficultyFactor(badge.difficulty) * 5;
    confidence -= difficultyPenalty;

    // 現在の進捗状況
    if (badge.progress > 50) confidence += 10;
    if (badge.progress > 80) confidence += 15;

    // 速度の安定性
    if (velocity > 0.5) confidence += 10;

    return Math.max(0, Math.min(100, confidence));
  };

  /**
   * ⚠️ リスク分析
   */
  const analyzeRisks = (badge: DevelopmentBadge, velocity: number, requiredVelocity: number) => {
    const risks = [];

    // 進捗速度リスク
    if (velocity < requiredVelocity * 0.8) {
      risks.push({
        type: 'velocity_risk',
        probability: 70,
        impact: '完了時期の遅延',
        mitigation: '日次作業時間の増加、優先度の見直し',
      });
    }

    // 複雑度リスク
    if (badge.difficulty === 'platinum' || badge.difficulty === 'legendary') {
      risks.push({
        type: 'complexity_risk',
        probability: 50,
        impact: '予期しない技術的困難',
        mitigation: '専門知識の習得、メンターとの相談',
      });
    }

    // 前提条件リスク
    if (badge.prerequisites && badge.prerequisites.length > 0) {
      risks.push({
        type: 'dependency_risk',
        probability: 40,
        impact: '前提条件の未完了による阻害',
        mitigation: '前提バッジの優先完了',
      });
    }

    // モチベーションリスク
    if (velocity < 0.5) {
      risks.push({
        type: 'motivation_risk',
        probability: 60,
        impact: '継続的な進捗停滞',
        mitigation: 'ゲーミフィケーション要素の活用、報酬設定',
      });
    }

    return risks;
  };

  /**
   * 💡 推奨事項生成
   */
  const generateRecommendations = (
    badge: DevelopmentBadge,
    velocity: number,
    requiredVelocity: number,
    trend: string
  ): string[] => {
    const recommendations = [];

    if (velocity < requiredVelocity) {
      recommendations.push('⏰ 日次作業時間を増やし、進捗ペースを向上させましょう');
    }

    if (trend === 'decelerating' || trend === 'stalled') {
      recommendations.push('🔄 作業方法を見直し、新しいアプローチを試してみましょう');
      recommendations.push('👥 メンターや同僚に相談し、アドバイスを求めましょう');
    }

    if (badge.difficulty === 'platinum' || badge.difficulty === 'legendary') {
      recommendations.push('📚 関連する学習リソースを活用し、スキルアップを図りましょう');
    }

    if (badge.progress > 70) {
      recommendations.push('🏃‍♂️ 完了まであと少し！集中して最後のスパートをかけましょう');
    }

    recommendations.push('🎯 小さなマイルストーンを設定し、達成感を味わいながら進めましょう');

    return recommendations;
  };

  // ヘルパー関数
  const getTargetDays = (horizon: string): number => {
    switch (horizon) {
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'quarter':
        return 90;
      case 'year':
        return 365;
      default:
        return 30;
    }
  };

  const getDifficultyFactor = (difficulty: string): number => {
    switch (difficulty) {
      case 'bronze':
        return 1;
      case 'silver':
        return 2;
      case 'gold':
        return 3;
      case 'platinum':
        return 4;
      case 'legendary':
        return 5;
      default:
        return 2;
    }
  };

  const calculateHistoricalFactor = (data: any[]): number => {
    return data.reduce((sum, d) => sum + d.velocity, 0) / data.length;
  };

  const calculatePrerequisitesFactor = (badge: DevelopmentBadge): number => {
    return badge.prerequisites ? badge.prerequisites.length * 10 : 0;
  };

  const calculateVariance = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  /**
   * 📊 予測メトリクス計算
   */
  const calculatePredictionMetrics = (predictions: BadgePrediction[]): PredictionMetrics => {
    const total = predictions.length;
    const onTrack = predictions.filter((p) => p.confidenceLevel >= 70).length;
    const atRisk = predictions.filter((p) => p.confidenceLevel < 50).length;
    const accelerating = predictions.filter((p) => p.trend === 'accelerating').length;

    const avgCompletion = predictions.reduce((sum, p) => sum + p.daysToCompletion, 0) / total;
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidenceLevel, 0) / total;

    return {
      totalBadgesTracked: total,
      onTrackBadges: onTrack,
      atRiskBadges: atRisk,
      acceleratingBadges: accelerating,
      averageCompletionTime: avgCompletion,
      predictedCompletionRate: avgConfidence,
    };
  };

  /**
   * 🎨 トレンドアイコン取得
   */
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'accelerating':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decelerating':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stalled':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  /**
   * 🎨 信頼度カラー取得
   */
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-blue-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPredictions = predictions.filter((prediction) => {
    switch (filterType) {
      case 'on-track':
        return prediction.confidenceLevel >= 70;
      case 'at-risk':
        return prediction.confidenceLevel < 50;
      case 'accelerating':
        return prediction.trend === 'accelerating';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">予測システムを初期化中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            バッジ完了予測システム
          </h1>
          <p className="text-muted-foreground mt-2">AI駆動の進捗分析と完了時期予測</p>
        </div>

        <div className="flex items-center gap-4">
          <Tabs value={timeHorizon} onValueChange={(value) => setTimeHorizon(value as any)}>
            <TabsList>
              <TabsTrigger value="week">週</TabsTrigger>
              <TabsTrigger value="month">月</TabsTrigger>
              <TabsTrigger value="quarter">四半期</TabsTrigger>
              <TabsTrigger value="year">年</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            設定
          </Button>
        </div>
      </div>

      {/* メトリクスダッシュボード */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">追跡中バッジ</p>
                  <p className="text-2xl font-bold">{metrics.totalBadgesTracked}</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">順調進行</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.onTrackBadges}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">リスクあり</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.atRiskBadges}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">平均完了日数</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(metrics.averageCompletionTime)}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* フィルター */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">フィルター:</span>
        <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
          <TabsList>
            <TabsTrigger value="all">全て</TabsTrigger>
            <TabsTrigger value="on-track">順調</TabsTrigger>
            <TabsTrigger value="at-risk">リスクあり</TabsTrigger>
            <TabsTrigger value="accelerating">加速中</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 予測リスト */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPredictions.map((prediction) => (
          <Card
            key={prediction.badgeId}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedPrediction(prediction)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{prediction.badge.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{prediction.badge.name}</h3>
                    <p className="text-sm text-muted-foreground">{prediction.badge.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{prediction.badge.difficulty}</Badge>
                      {getTrendIcon(prediction.trend)}
                      <span className="text-sm">{prediction.trend}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">信頼度:</span>
                    <span className={`font-bold ${getConfidenceColor(prediction.confidenceLevel)}`}>
                      {prediction.confidenceLevel}%
                    </span>
                  </div>

                  {prediction.daysToCompletion > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{prediction.daysToCompletion}日</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">進捗:</span>
                    <span className="font-medium">{prediction.badge.progress}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>進捗状況</span>
                  <span>{prediction.badge.progress}%</span>
                </div>
                <Progress value={prediction.badge.progress} className="h-2" />
              </div>

              {prediction.recommendations.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">主な推奨事項:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{prediction.recommendations[0]}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 詳細モーダル */}
      {selectedPrediction && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPrediction(null)}
        >
          <Card
            className="max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-4xl">{selectedPrediction.badge.icon}</span>
                <div>
                  <h2 className="text-xl">{selectedPrediction.badge.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{selectedPrediction.badge.difficulty}</Badge>
                    {getTrendIcon(selectedPrediction.trend)}
                    <span className="text-sm">{selectedPrediction.trend}</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 予測概要 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">
                    {selectedPrediction.daysToCompletion}日
                  </p>
                  <p className="text-sm text-muted-foreground">予想完了日数</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p
                    className={`text-2xl font-bold ${getConfidenceColor(selectedPrediction.confidenceLevel)}`}
                  >
                    {selectedPrediction.confidenceLevel}%
                  </p>
                  <p className="text-sm text-muted-foreground">予測信頼度</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedPrediction.currentVelocity.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">日次進捗速度</p>
                </div>
              </div>

              {/* 進捗状況 */}
              <div>
                <h3 className="font-semibold mb-2">進捗状況</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>現在の進捗</span>
                    <span>{selectedPrediction.badge.progress}%</span>
                  </div>
                  <Progress value={selectedPrediction.badge.progress} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">現在の速度: </span>
                      <span className="font-medium">
                        {selectedPrediction.currentVelocity.toFixed(1)}%/日
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">必要速度: </span>
                      <span className="font-medium">
                        {selectedPrediction.requiredDailyProgress.toFixed(1)}%/日
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 推奨事項 */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  推奨事項
                </h3>
                <div className="space-y-2">
                  {selectedPrediction.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded bg-blue-50">
                      <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* リスク分析 */}
              {selectedPrediction.risks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    リスク分析
                  </h3>
                  <div className="space-y-3">
                    {selectedPrediction.risks.map((risk, index) => (
                      <div
                        key={index}
                        className="p-3 rounded border border-orange-200 bg-orange-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{risk.impact}</span>
                          <Badge variant="outline" className="text-xs">
                            {risk.probability}% 確率
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>対策:</strong> {risk.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 予測要因 */}
              <div>
                <h3 className="font-semibold mb-2">予測要因分析</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">履歴パフォーマンス</span>
                    <Progress
                      value={selectedPrediction.factors.historical * 10}
                      className="h-2 mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">現在進捗</span>
                    <Progress value={selectedPrediction.factors.current} className="h-2 mt-1" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">難易度影響</span>
                    <Progress
                      value={selectedPrediction.factors.difficulty * 20}
                      className="h-2 mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">前提条件</span>
                    <Progress
                      value={Math.max(0, 100 - selectedPrediction.factors.prerequisites)}
                      className="h-2 mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BadgePredictionDashboard;
