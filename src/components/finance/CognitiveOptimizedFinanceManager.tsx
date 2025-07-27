/**
 * 💰 認知最適化資産管理システム
 * ADHD/ASD特性に基づく財務管理の最適化
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdaptiveCard } from '@/components/ui/AdaptiveCard';
import { useRealtimeAdaptation } from '@/components/realtime/RealtimeAdaptationProvider';
import CognitiveIntegrationService from '@/services/cognitive/CognitiveIntegrationService';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Target,
  Brain,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  Bell,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  Coffee,
  Lightbulb,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Timer,
} from 'lucide-react';

// 財務データ型定義
interface FinanceData {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFund: number;
  investments: number;
  debt: number;
  monthlyNetWorthChange: number;
  emergencyFundRatio: number;
  savingsRate: number;
  debtToIncomeRatio: number;
}

interface CognitiveFinanceSettings {
  visualComplexity: 'minimal' | 'standard' | 'detailed';
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  automationLevel: 'manual' | 'assisted' | 'automatic';
  alertSensitivity: 'low' | 'medium' | 'high';
  colorCoding: boolean;
  progressAnimations: boolean;
  contextualHelp: boolean;
  simplifiedLanguage: boolean;
  categoryGranularity: 'basic' | 'moderate' | 'detailed';
  budgetVisualization: 'simple' | 'chart' | 'interactive';
}

interface CognitiveFinanceRecommendation {
  id: string;
  type: 'saving' | 'spending' | 'investment' | 'budget' | 'automation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  cognitiveLoad: number; // 1-10
  estimatedTimeMinutes: number;
  adaptedForProfile: boolean;
}

export const CognitiveOptimizedFinanceManager: React.FC = () => {
  const { state: adaptationState } = useRealtimeAdaptation();

  // 状態管理
  const [financeData, setFinanceData] = useState<FinanceData>({
    netWorth: 1250000,
    monthlyIncome: 350000,
    monthlyExpenses: 280000,
    emergencyFund: 840000,
    investments: 850000,
    debt: 450000,
    monthlyNetWorthChange: 45000,
    emergencyFundRatio: 3.0,
    savingsRate: 20,
    debtToIncomeRatio: 0.32,
  });

  const [cognitiveSettings, setCognitiveSettings] = useState<CognitiveFinanceSettings>({
    visualComplexity: 'standard',
    updateFrequency: 'weekly',
    automationLevel: 'assisted',
    alertSensitivity: 'medium',
    colorCoding: true,
    progressAnimations: true,
    contextualHelp: true,
    simplifiedLanguage: false,
    categoryGranularity: 'moderate',
    budgetVisualization: 'chart',
  });

  const [recommendations, setRecommendations] = useState<CognitiveFinanceRecommendation[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(false);
  const [focusMetric, setFocusMetric] = useState<string | null>(null);

  // 認知状態に基づく自動設定調整
  useEffect(() => {
    const { cognitiveState } = adaptationState;

    // 認知負荷が高い場合の自動簡素化
    if (cognitiveState.cognitiveLoad > 70) {
      setCognitiveSettings((prev) => ({
        ...prev,
        visualComplexity: 'minimal',
        progressAnimations: false,
        categoryGranularity: 'basic',
        budgetVisualization: 'simple',
      }));
      setIsSimplifiedMode(true);
    }

    // ストレスレベルが高い場合の配慮
    if (cognitiveState.stress > 80) {
      setCognitiveSettings((prev) => ({
        ...prev,
        alertSensitivity: 'low',
        colorCoding: false,
        contextualHelp: true,
      }));
    }

    // 注意力が低い場合の集中支援
    if (cognitiveState.attention < 50) {
      setFocusMetric('netWorth'); // 最重要指標にフォーカス
      setCognitiveSettings((prev) => ({
        ...prev,
        visualComplexity: 'minimal',
        simplifiedLanguage: true,
      }));
    }
  }, [adaptationState.cognitiveState]);

  // 認知特性に基づく推奨事項生成
  const generateCognitiveRecommendations = useCallback(() => {
    const { cognitiveState } = adaptationState;
    const recs: CognitiveFinanceRecommendation[] = [];

    // エネルギーレベルに基づく推奨
    if (cognitiveState.energy < 40) {
      recs.push({
        id: 'auto-saving',
        type: 'automation',
        title: '自動積立の設定',
        description: 'エネルギーレベルが低い時でも貯蓄を継続できる自動システムを設定しましょう',
        impact: 'high',
        difficulty: 'easy',
        cognitiveLoad: 3,
        estimatedTimeMinutes: 10,
        adaptedForProfile: true,
      });
    }

    // 認知負荷に基づく推奨
    if (cognitiveState.cognitiveLoad > 70) {
      recs.push({
        id: 'simplify-tracking',
        type: 'budget',
        title: '支出追跡の簡素化',
        description: '認知負荷を軽減するため、支出カテゴリを3つに絞りましょう',
        impact: 'medium',
        difficulty: 'easy',
        cognitiveLoad: 2,
        estimatedTimeMinutes: 5,
        adaptedForProfile: true,
      });
    }

    // 注意力に基づく推奨
    if (cognitiveState.attention < 50) {
      recs.push({
        id: 'visual-alerts',
        type: 'budget',
        title: '視覚的アラートの強化',
        description: '注意力をサポートするため、重要な支出に色付きアラートを設定しましょう',
        impact: 'medium',
        difficulty: 'easy',
        cognitiveLoad: 2,
        estimatedTimeMinutes: 8,
        adaptedForProfile: true,
      });
    }

    // 財務状況に基づく推奨
    if (financeData.emergencyFundRatio < 3) {
      recs.push({
        id: 'emergency-fund',
        type: 'saving',
        title: '緊急資金の増強',
        description: '緊急資金を3ヶ月分まで増やすことで、精神的安定を得られます',
        impact: 'high',
        difficulty: 'medium',
        cognitiveLoad: 5,
        estimatedTimeMinutes: 20,
        adaptedForProfile: false,
      });
    }

    if (financeData.savingsRate < 20) {
      recs.push({
        id: 'increase-savings',
        type: 'saving',
        title: '貯蓄率の向上',
        description: '月収の20%を目標に、段階的に貯蓄率を上げましょう',
        impact: 'high',
        difficulty: 'medium',
        cognitiveLoad: 6,
        estimatedTimeMinutes: 30,
        adaptedForProfile: false,
      });
    }

    setRecommendations(recs);
  }, [adaptationState.cognitiveState, financeData]);

  useEffect(() => {
    generateCognitiveRecommendations();
  }, [generateCognitiveRecommendations]);

  // ユーティリティ関数
  const formatCurrency = (amount: number): string => {
    if (cognitiveSettings.simplifiedLanguage) {
      return `${Math.round(amount / 10000)}万円`;
    }
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMetricColor = (
    value: number,
    threshold: { good: number; warning: number },
    inverse = false
  ) => {
    if (!cognitiveSettings.colorCoding) return 'text-gray-700';

    if (inverse) {
      if (value <= threshold.good) return 'text-green-600';
      if (value <= threshold.warning) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value >= threshold.good) return 'text-green-600';
      if (value >= threshold.warning) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  const getMetricIcon = (metric: string, value: number, previousValue?: number) => {
    if (previousValue !== undefined) {
      if (value > previousValue) return <TrendingUp className="h-4 w-4 text-green-600" />;
      if (value < previousValue) return <TrendingDown className="h-4 w-4 text-red-600" />;
      return <Minus className="h-4 w-4 text-gray-600" />;
    }

    switch (metric) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-blue-600" />;
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: number;
    format?: 'currency' | 'percentage' | 'ratio';
    threshold?: { good: number; warning: number };
    inverse?: boolean;
    description?: string;
    isFocused?: boolean;
    cognitiveLoad?: 'low' | 'medium' | 'high';
  }> = ({
    title,
    value,
    format = 'currency',
    threshold,
    inverse,
    description,
    isFocused,
    cognitiveLoad = 'low',
  }) => {
    const formattedValue =
      format === 'currency'
        ? formatCurrency(value)
        : format === 'percentage'
          ? `${value}%`
          : `${value.toFixed(1)}`;

    const colorClass = threshold ? getMetricColor(value, threshold, inverse) : 'text-gray-900';

    return (
      <AdaptiveCard
        cognitiveLoad={cognitiveLoad}
        className={`transition-all duration-300 ${isFocused ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {threshold && getMetricIcon(title, value, undefined)}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${colorClass}`}>{formattedValue}</div>
          {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
          {threshold && (
            <div className="mt-2">
              <Progress
                value={
                  inverse ? 100 - (value / threshold.warning) * 100 : (value / threshold.good) * 100
                }
                className="h-1"
              />
            </div>
          )}
        </CardContent>
      </AdaptiveCard>
    );
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-green-600" />
            認知最適化資産管理
          </h1>
          <p className="text-gray-600 mt-1">ADHD/ASD特性に基づく個人最適化された財務管理システム</p>
        </div>

        <div className="flex items-center gap-3">
          {isSimplifiedMode && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              簡素化モード
            </Badge>
          )}

          <Button
            onClick={() => setIsSimplifiedMode(!isSimplifiedMode)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isSimplifiedMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isSimplifiedMode ? '詳細表示' : '簡素化'}
          </Button>
        </div>
      </div>

      {/* 認知状態アラート */}
      {adaptationState.cognitiveState.stress > 70 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Heart className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">ストレス軽減モード</AlertTitle>
          <AlertDescription className="text-blue-700">
            現在ストレスレベルが高めです。財務データは簡素化して表示しています。
            無理をせず、必要な時だけ詳細を確認してください。
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="budget">予算管理</TabsTrigger>
          <TabsTrigger value="recommendations">推奨事項</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          {/* メイン指標 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="純資産"
              value={financeData.netWorth}
              description="総資産から負債を差し引いた金額"
              isFocused={focusMetric === 'netWorth'}
              cognitiveLoad="low"
            />

            <MetricCard
              title="緊急資金比率"
              value={financeData.emergencyFundRatio}
              format="ratio"
              threshold={{ good: 3, warning: 1.5 }}
              description="月の支出に対する緊急資金の比率"
              cognitiveLoad="medium"
            />

            <MetricCard
              title="貯蓄率"
              value={financeData.savingsRate}
              format="percentage"
              threshold={{ good: 20, warning: 10 }}
              description="収入に占める貯蓄の割合"
              cognitiveLoad="medium"
            />

            <MetricCard
              title="負債収入比"
              value={financeData.debtToIncomeRatio * 100}
              format="percentage"
              threshold={{ good: 30, warning: 50 }}
              inverse={true}
              description="収入に対する負債の比率"
              cognitiveLoad="high"
            />
          </div>

          {/* 簡素化モードでは詳細チャートを非表示 */}
          {!isSimplifiedMode && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 資産構成 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    資産構成
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">投資</span>
                      <span className="font-medium">{formatCurrency(financeData.investments)}</span>
                    </div>
                    <Progress value={60} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">緊急資金</span>
                      <span className="font-medium">
                        {formatCurrency(financeData.emergencyFund)}
                      </span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* 月次フロー */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    月次キャッシュフロー
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">収入</span>
                      <span className="font-medium">
                        {formatCurrency(financeData.monthlyIncome)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-red-600">
                      <span className="text-sm">支出</span>
                      <span className="font-medium">
                        {formatCurrency(financeData.monthlyExpenses)}
                      </span>
                    </div>

                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-sm">純増加</span>
                        <span
                          className={getMetricColor(
                            financeData.monthlyIncome - financeData.monthlyExpenses,
                            { good: 50000, warning: 20000 }
                          )}
                        >
                          {formatCurrency(financeData.monthlyIncome - financeData.monthlyExpenses)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 予算管理タブ */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>支出カテゴリ別予算</CardTitle>
              <CardDescription>認知負荷を軽減するため、主要カテゴリのみ表示</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['生活費', '住居費', 'その他'].map((category, index) => {
                  const budgets = [120000, 100000, 60000];
                  const spent = [115000, 100000, 50000];
                  const progress = (spent[index] / budgets[index]) * 100;

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(spent[index])} / {formatCurrency(budgets[index])}
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className={`h-3 ${progress > 90 ? 'bg-red-100' : progress > 75 ? 'bg-yellow-100' : 'bg-green-100'}`}
                      />
                      <div className="text-xs text-gray-500">
                        残り: {formatCurrency(budgets[index] - spent[index])}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 推奨事項タブ */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <AdaptiveCard
                key={rec.id}
                cognitiveLoad={
                  rec.cognitiveLoad <= 3 ? 'low' : rec.cognitiveLoad <= 6 ? 'medium' : 'high'
                }
                className={rec.adaptedForProfile ? 'border-blue-200 bg-blue-50' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {rec.adaptedForProfile && <Brain className="h-4 w-4 text-blue-600" />}
                        {rec.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{rec.description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={rec.impact === 'high' ? 'default' : 'secondary'}>
                        {rec.impact === 'high'
                          ? '高影響'
                          : rec.impact === 'medium'
                            ? '中影響'
                            : '低影響'}
                      </Badge>
                      {rec.adaptedForProfile && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          認知最適化
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {rec.estimatedTimeMinutes}分
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        負荷: {rec.cognitiveLoad}/10
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {rec.difficulty === 'easy'
                          ? '簡単'
                          : rec.difficulty === 'medium'
                            ? '普通'
                            : '難しい'}
                      </div>
                    </div>
                    <Button size="sm" className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      実行する
                    </Button>
                  </div>
                </CardContent>
              </AdaptiveCard>
            ))}
          </div>
        </TabsContent>

        {/* 設定タブ */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                認知特性に基づく表示設定
              </CardTitle>
              <CardDescription>個人の認知特性に合わせて表示方法をカスタマイズ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="visualComplexity">視覚的複雑さ</Label>
                    <select
                      id="visualComplexity"
                      value={cognitiveSettings.visualComplexity}
                      onChange={(e) =>
                        setCognitiveSettings((prev) => ({
                          ...prev,
                          visualComplexity: e.target.value as any,
                        }))
                      }
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="minimal">最小限</option>
                      <option value="standard">標準</option>
                      <option value="detailed">詳細</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="automationLevel">自動化レベル</Label>
                    <select
                      id="automationLevel"
                      value={cognitiveSettings.automationLevel}
                      onChange={(e) =>
                        setCognitiveSettings((prev) => ({
                          ...prev,
                          automationLevel: e.target.value as any,
                        }))
                      }
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="manual">手動</option>
                      <option value="assisted">支援付き</option>
                      <option value="automatic">自動</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="updateFrequency">更新頻度</Label>
                    <select
                      id="updateFrequency"
                      value={cognitiveSettings.updateFrequency}
                      onChange={(e) =>
                        setCognitiveSettings((prev) => ({
                          ...prev,
                          updateFrequency: e.target.value as any,
                        }))
                      }
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="daily">毎日</option>
                      <option value="weekly">毎週</option>
                      <option value="monthly">毎月</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>色による区別</Label>
                    <Switch
                      checked={cognitiveSettings.colorCoding}
                      onCheckedChange={(checked) =>
                        setCognitiveSettings((prev) => ({
                          ...prev,
                          colorCoding: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>アニメーション</Label>
                    <Switch
                      checked={cognitiveSettings.progressAnimations}
                      onCheckedChange={(checked) =>
                        setCognitiveSettings((prev) => ({
                          ...prev,
                          progressAnimations: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>コンテキストヘルプ</Label>
                    <Switch
                      checked={cognitiveSettings.contextualHelp}
                      onCheckedChange={(checked) =>
                        setCognitiveSettings((prev) => ({
                          ...prev,
                          contextualHelp: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>簡易言語</Label>
                    <Switch
                      checked={cognitiveSettings.simplifiedLanguage}
                      onCheckedChange={(checked) =>
                        setCognitiveSettings((prev) => ({
                          ...prev,
                          simplifiedLanguage: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  設定をリセット
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CognitiveOptimizedFinanceManager;
