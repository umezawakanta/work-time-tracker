/**
 * 🤖 AI認知コーチングダッシュボード
 * ADHD/ASD特性に基づく機械学習コーチング統合UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdaptiveCard } from '@/components/ui/AdaptiveCard';
import { useRealtimeAdaptation } from '@/components/realtime/RealtimeAdaptationProvider';
import CognitiveAICoachingService from '@/services/ai/CognitiveAICoachingService';
import {
  Brain,
  Bot,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  Star,
  CheckCircle2,
  Clock,
  BarChart3,
  Activity,
  Eye,
  AlertTriangle,
  Zap,
  Heart,
  Sparkles,
  Settings,
  BookOpen,
  Users,
  Award,
  Calendar,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Play,
  Pause,
  Coffee,
  Sunrise,
  Moon,
  Flame,
  Snowflake,
  Shield,
  Timer,
  Bell,
  MessageSquare,
  ChevronRight,
  X,
  Check,
  Minus,
} from 'lucide-react';

interface AIRecommendation {
  id: string;
  type: 'behavioral' | 'environmental' | 'cognitive' | 'schedule' | 'social';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: number;
  difficulty: number;
  timeToResult: number;
  cognitiveLoad: number;
  actionSteps: ActionStep[];
  measurableOutcomes: string[];
  validUntil: Date;
}

interface ActionStep {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed?: boolean;
}

interface CoachingInsight {
  id: string;
  category: 'strength' | 'challenge' | 'opportunity' | 'warning';
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  urgency: number;
  personalizedMessage: string;
  suggestedActions: string[];
  generatedAt: Date;
}

interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  confidence: number;
  triggers: string[];
  outcomes: string[];
  adhdRelevance: number;
}

export const CognitiveAICoachingDashboard: React.FC = () => {
  const { state: adaptationState } = useRealtimeAdaptation();

  // State Management
  const [aiService] = useState(() => new CognitiveAICoachingService());
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [insights, setInsights] = useState<CoachingInsight[]>([]);
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [selectedTab, setSelectedTab] = useState('recommendations');
  const [isLearning, setIsLearning] = useState(false);
  const [modelStats, setModelStats] = useState<any>(null);
  const [activeRecommendationId, setActiveRecommendationId] = useState<string | null>(null);

  // AIサービスからのデータ取得
  const loadAIData = useCallback(async () => {
    const userId = 'demo-user'; // 実際の実装ではauth contextから取得

    try {
      const recs = aiService.getActiveRecommendations(userId);
      const ins = aiService.getCoachingInsights(userId);
      const pats = aiService.getBehaviorPatterns(userId);
      const stats = aiService.getModelStatistics(userId);

      setRecommendations(recs);
      setInsights(ins);
      setPatterns(pats);
      setModelStats(stats);
    } catch (error) {
      console.error('AI data loading error:', error);
    }
  }, [aiService]);

  // 認知データの送信（リアルタイム適応から）
  const sendCognitiveData = useCallback(async () => {
    if (!adaptationState.cognitiveState) return;

    const cognitiveData = {
      userId: 'demo-user',
      timestamp: new Date(),
      cognitiveState: {
        attention: adaptationState.cognitiveState.attention,
        energy: adaptationState.cognitiveState.energy,
        stress: adaptationState.cognitiveState.stress,
        flow: adaptationState.cognitiveState.flow || 50,
        motivation: 60, // デフォルト値
      },
      behavioralMetrics: {
        taskCompletionRate: 75,
        procrastinationFrequency: 30,
        impulsivityScore: 40,
        focusSessionCount: 3,
        breakPatternAdherence: 80,
        socialInteractionLevel: 50,
        sleepQuality: 70,
        exerciseFrequency: 60,
      },
      environmentalFactors: {
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        noiseLevel: 30,
        socialContext: 'alone' as const,
        location: 'home' as const,
      },
      outcomes: {
        productivity: 70,
        satisfaction: 75,
        stressReduction: 60,
        goalProgress: 65,
      },
    };

    try {
      await aiService.recordCognitiveData(cognitiveData);
      setIsLearning(true);
      setTimeout(() => setIsLearning(false), 2000);
    } catch (error) {
      console.error('Cognitive data recording error:', error);
    }
  }, [adaptationState.cognitiveState, aiService]);

  // Initial data load
  useEffect(() => {
    loadAIData();

    // AIサービスのイベントリスナー
    const handleRecommendationsGenerated = () => {
      loadAIData();
    };

    const handleFlowStateDetected = () => {
      loadAIData();
    };

    aiService.on('recommendationsGenerated', handleRecommendationsGenerated);
    aiService.on('flowStateDetected', handleFlowStateDetected);
    aiService.on('urgentRecommendation', handleRecommendationsGenerated);

    return () => {
      aiService.off('recommendationsGenerated', handleRecommendationsGenerated);
      aiService.off('flowStateDetected', handleFlowStateDetected);
      aiService.off('urgentRecommendation', handleRecommendationsGenerated);
    };
  }, [loadAIData, aiService]);

  // 定期的な認知データ送信
  useEffect(() => {
    const interval = setInterval(sendCognitiveData, 30000); // 30秒間隔
    return () => clearInterval(interval);
  }, [sendCognitiveData]);

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'challenge':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'opportunity':
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
      case 'warning':
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'behavioral':
        return <Activity className="h-4 w-4" />;
      case 'environmental':
        return <Eye className="h-4 w-4" />;
      case 'cognitive':
        return <Brain className="h-4 w-4" />;
      case 'schedule':
        return <Calendar className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const handleRecommendationFeedback = (
    recommendationId: string,
    feedback: 'positive' | 'negative'
  ) => {
    aiService.provideFeedback('demo-user', recommendationId, feedback);
    loadAIData();
  };

  const executeRecommendation = (recommendation: AIRecommendation) => {
    setActiveRecommendationId(recommendation.id);
    // 実際の実装では、推奨事項の実行ワークフローを開始
  };

  const RecommendationCard: React.FC<{ recommendation: AIRecommendation }> = ({
    recommendation,
  }) => (
    <AdaptiveCard
      cognitiveLoad={
        recommendation.cognitiveLoad <= 30
          ? 'low'
          : recommendation.cognitiveLoad <= 60
            ? 'medium'
            : 'high'
      }
      className="mb-4"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getTypeIcon(recommendation.type)}
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {recommendation.title}
                <Badge className={getPriorityColor(recommendation.priority)}>
                  {recommendation.priority === 'critical'
                    ? '緊急'
                    : recommendation.priority === 'high'
                      ? '高'
                      : recommendation.priority === 'medium'
                        ? '中'
                        : '低'}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">{recommendation.description}</CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRecommendationFeedback(recommendation.id, 'positive')}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRecommendationFeedback(recommendation.id, 'negative')}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 推論説明 */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
              <Brain className="h-3 w-3" />
              AI分析
            </div>
            <p className="text-sm text-blue-700">{recommendation.reasoning}</p>
          </div>

          {/* メトリクス */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {recommendation.expectedImpact}%
              </div>
              <div className="text-xs text-gray-600">期待効果</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{recommendation.difficulty}%</div>
              <div className="text-xs text-gray-600">実行難易度</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {recommendation.timeToResult}日
              </div>
              <div className="text-xs text-gray-600">効果実感</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {recommendation.cognitiveLoad}%
              </div>
              <div className="text-xs text-gray-600">認知負荷</div>
            </div>
          </div>

          {/* アクションステップ */}
          {recommendation.actionSteps.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">実行ステップ</h4>
              <div className="space-y-2">
                {recommendation.actionSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-gray-600">{step.description}</div>
                      <div className="text-xs text-blue-600 mt-1">
                        <Timer className="h-3 w-3 inline mr-1" />約{step.estimatedMinutes}分
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      {step.completed ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 測定可能な成果 */}
          {recommendation.measurableOutcomes.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">期待される成果</h4>
              <div className="flex flex-wrap gap-1">
                {recommendation.measurableOutcomes.map((outcome, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {outcome}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => executeRecommendation(recommendation)}
              className="flex-1"
              disabled={activeRecommendationId === recommendation.id}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {activeRecommendationId === recommendation.id ? '実行中...' : '実行する'}
            </Button>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-1" />
              後で
            </Button>
          </div>
        </div>
      </CardContent>
    </AdaptiveCard>
  );

  const InsightCard: React.FC<{ insight: CoachingInsight }> = ({ insight }) => (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {getCategoryIcon(insight.category)}
          {insight.title}
          <Badge variant="outline" className="text-xs">
            信頼度: {Math.round(insight.confidence * 100)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
        <div className="text-sm font-medium text-blue-700 mb-2">{insight.personalizedMessage}</div>

        {insight.evidence.length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-600 mb-1">根拠データ:</div>
            <div className="space-y-1">
              {insight.evidence.map((evidence, index) => (
                <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  {evidence}
                </div>
              ))}
            </div>
          </div>
        )}

        {insight.suggestedActions.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">推奨アクション:</div>
            <div className="flex flex-wrap gap-1">
              {insight.suggestedActions.map((action, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {action}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            AI認知コーチング
          </h1>
          <p className="text-gray-600 mt-1">
            機械学習による個人最適化されたADHD/ASDサポートシステム
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLearning && (
            <Badge variant="secondary" className="flex items-center gap-1 animate-pulse">
              <Brain className="h-3 w-3" />
              学習中...
            </Badge>
          )}

          <Button
            onClick={sendCognitiveData}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            データ送信
          </Button>
        </div>
      </div>

      {/* AIシステム状態 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <BarChart3 className="h-5 w-5" />
            AI学習システム状態
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{modelStats?.totalModels || 0}</div>
              <div className="text-sm text-gray-600">学習モデル</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {modelStats?.averageAccuracy ? Math.round(modelStats.averageAccuracy * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">平均精度</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {modelStats?.learnedPatterns || 0}
              </div>
              <div className="text-sm text-gray-600">学習パターン</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {modelStats?.activeRecommendations || 0}
              </div>
              <div className="text-sm text-gray-600">アクティブ推奨</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{modelStats?.dataPoints || 0}</div>
              <div className="text-sm text-gray-600">データポイント</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* リアルタイム認知状態 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            現在の認知状態
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">注意力</span>
                <span className="text-sm text-gray-600">
                  {adaptationState.cognitiveState?.attention || 0}%
                </span>
              </div>
              <Progress value={adaptationState.cognitiveState?.attention || 0} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">エネルギー</span>
                <span className="text-sm text-gray-600">
                  {adaptationState.cognitiveState?.energy || 0}%
                </span>
              </div>
              <Progress value={adaptationState.cognitiveState?.energy || 0} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">ストレス</span>
                <span className="text-sm text-gray-600">
                  {adaptationState.cognitiveState?.stress || 0}%
                </span>
              </div>
              <Progress
                value={adaptationState.cognitiveState?.stress || 0}
                className="h-2 bg-red-100"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">フロー</span>
                <span className="text-sm text-gray-600">
                  {adaptationState.cognitiveState?.flow || 50}%
                </span>
              </div>
              <Progress value={adaptationState.cognitiveState?.flow || 50} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メインタブ */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">推奨事項 ({recommendations.length})</TabsTrigger>
          <TabsTrigger value="insights">インサイト ({insights.length})</TabsTrigger>
          <TabsTrigger value="patterns">パターン ({patterns.length})</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        {/* 推奨事項タブ */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">AIが学習中です</h3>
                <p className="text-gray-600">
                  より多くのデータが蓄積されると、パーソナライズされた推奨事項が表示されます。
                </p>
                <Button onClick={sendCognitiveData} className="mt-4" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  データを送信して学習を促進
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div>
              {recommendations.map((recommendation) => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* インサイトタブ */}
        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">インサイトを生成中</h3>
                <p className="text-gray-600">
                  行動パターンが分析されると、パーソナライズされたインサイトが表示されます。
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* パターンタブ */}
        <TabsContent value="patterns" className="space-y-4">
          {patterns.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">パターンを検出中</h3>
                <p className="text-gray-600">
                  十分なデータが蓄積されると、行動パターンが検出され表示されます。
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((pattern) => (
                <Card key={pattern.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{pattern.name}</span>
                      <Badge variant="outline">
                        {Math.round(pattern.confidence * 100)}% 信頼度
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">{pattern.description}</p>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-medium text-gray-600">頻度</div>
                        <Progress value={pattern.frequency * 100} className="h-1" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-600">ADHD関連度</div>
                        <Progress value={pattern.adhdRelevance * 100} className="h-1" />
                      </div>
                    </div>

                    {pattern.triggers.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-600 mb-1">トリガー:</div>
                        <div className="flex flex-wrap gap-1">
                          {pattern.triggers.map((trigger, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 分析タブ */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">学習進捗</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">データ収集</span>
                      <span className="text-sm text-gray-600">
                        {modelStats?.dataPoints || 0} / 1000
                      </span>
                    </div>
                    <Progress
                      value={Math.min((modelStats?.dataPoints || 0) / 10, 100)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">パターン認識</span>
                      <span className="text-sm text-gray-600">{patterns.length} / 20</span>
                    </div>
                    <Progress value={Math.min(patterns.length * 5, 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">AI精度</span>
                      <span className="text-sm text-gray-600">
                        {modelStats?.averageAccuracy
                          ? Math.round(modelStats.averageAccuracy * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={modelStats?.averageAccuracy ? modelStats.averageAccuracy * 100 : 0}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最近の活動</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>認知データを記録しました</span>
                    <span className="text-xs text-gray-500 ml-auto">2分前</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span>新しいパターンを検出</span>
                    <span className="text-xs text-gray-500 ml-auto">15分前</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span>推奨事項を生成しました</span>
                    <span className="text-xs text-gray-500 ml-auto">1時間前</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <RotateCcw className="h-4 w-4 text-orange-600" />
                    <span>モデルを再訓練しました</span>
                    <span className="text-xs text-gray-500 ml-auto">3時間前</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CognitiveAICoachingDashboard;
