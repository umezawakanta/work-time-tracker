/**
 * 🤖 AI強化ゲーミフィケーションダッシュボード
 * パーソナライズされたゲーム体験とインテリジェントなモチベーション管理
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Bot,
  Target,
  TrendingUp,
  Award,
  Lightbulb,
  Zap,
  Users,
  BarChart3,
  Star,
  Crown,
  Trophy,
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  Flame,
  Calendar,
  Settings,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  aiGamificationService,
  UserBehaviorPattern,
  AIPersonalityProfile,
  SmartChallenge,
  MotivationalInsight,
  AIReward,
} from '@/services/gamification/AIGamificationService';

interface AIGamificationState {
  behaviorPattern: UserBehaviorPattern | null;
  personalityProfile: AIPersonalityProfile | null;
  smartChallenges: SmartChallenge[];
  motivationalInsights: MotivationalInsight[];
  personalizedRewards: AIReward[];
  aiRecommendations: string[];
  predictiveAnalytics: any;
  isAnalyzing: boolean;
  lastUpdateTime: Date | null;
}

export const AIEnhancedGamification: React.FC = () => {
  const [state, setState] = useState<AIGamificationState>({
    behaviorPattern: null,
    personalityProfile: null,
    smartChallenges: [],
    motivationalInsights: [],
    personalizedRewards: [],
    aiRecommendations: [],
    predictiveAnalytics: null,
    isAnalyzing: false,
    lastUpdateTime: null,
  });

  const [selectedTab, setSelectedTab] = useState<
    'dashboard' | 'challenges' | 'insights' | 'rewards'
  >('dashboard');
  const [userLevel, setUserLevel] = useState(12);
  const [userXP, setUserXP] = useState(2450);
  const [nextLevelXP] = useState(3000);

  useEffect(() => {
    initializeAIGamification();
  }, []);

  /**
   * 🚀 AI ゲーミフィケーション初期化
   */
  const initializeAIGamification = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isAnalyzing: true }));

    try {
      const userId = 'current_user'; // 実際のユーザーIDを取得

      // モック履歴データ
      const historicalData = generateMockHistoricalData();
      const interactionData = generateMockInteractionData();
      const recentActivity = generateMockRecentActivity();

      // AI分析を並行実行
      const [
        behaviorPattern,
        personalityProfile,
        smartChallenges,
        motivationalInsights,
        personalizedRewards,
        dashboardData,
      ] = await Promise.all([
        aiGamificationService.analyzeUserBehavior(userId, historicalData),
        aiGamificationService.generatePersonalityProfile(userId, interactionData),
        aiGamificationService.generateSmartChallenges(userId, 5),
        aiGamificationService.analyzeMotivationalState(userId, recentActivity),
        aiGamificationService.generatePersonalizedRewards(userId),
        aiGamificationService.getAIDashboardData(userId),
      ]);

      setState((prev) => ({
        ...prev,
        behaviorPattern,
        personalityProfile,
        smartChallenges,
        motivationalInsights,
        personalizedRewards,
        aiRecommendations: dashboardData.aiRecommendations,
        predictiveAnalytics: dashboardData.predictiveAnalytics,
        isAnalyzing: false,
        lastUpdateTime: new Date(),
      }));

      toast.success('🤖 AI分析が完了しました！パーソナライズされた体験をお楽しみください。');
    } catch (error) {
      console.error('AI初期化エラー:', error);
      setState((prev) => ({ ...prev, isAnalyzing: false }));
      toast.error('AI分析中にエラーが発生しました。');
    }
  };

  /**
   * 🎯 スマートチャレンジ受諾
   */
  const acceptChallenge = async (challenge: SmartChallenge): Promise<void> => {
    try {
      console.log('🎮 チャレンジを受諾:', challenge.title);

      // チャレンジ受諾ロジック
      toast.success(`🎯 「${challenge.title}」チャレンジを開始しました！`);

      // チャレンジを完了済みにマーク
      setState((prev) => ({
        ...prev,
        smartChallenges: prev.smartChallenges.map((c) =>
          c.id === challenge.id ? ({ ...c, isAccepted: true } as any) : c
        ),
      }));
    } catch (error) {
      console.error('チャレンジ受諾エラー:', error);
      toast.error('チャレンジの受諾に失敗しました。');
    }
  };

  /**
   * 🎁 リワード購入
   */
  const purchaseReward = async (reward: AIReward): Promise<void> => {
    try {
      if (userXP < reward.cost) {
        toast.error('XPが不足しています。');
        return;
      }

      console.log('🎁 リワードを購入:', reward.title);

      // XPを消費
      setUserXP((prev) => prev - reward.cost);

      toast.success(`🎁 「${reward.title}」を獲得しました！`);
    } catch (error) {
      console.error('リワード購入エラー:', error);
      toast.error('リワードの購入に失敗しました。');
    }
  };

  /**
   * 🔄 AI分析更新
   */
  const refreshAIAnalysis = (): void => {
    initializeAIGamification();
  };

  /**
   * 📊 モチベーションスコア計算
   */
  const calculateMotivationScore = (): number => {
    if (!state.motivationalInsights.length) return 75;

    const positiveCount = state.motivationalInsights.filter(
      (insight) => insight.type === 'encouragement' || insight.type === 'celebration'
    ).length;

    const totalCount = state.motivationalInsights.length;
    return Math.round((positiveCount / totalCount) * 100);
  };

  /**
   * 🎨 パーソナリティスタイル取得
   */
  const getPersonalityStyleColor = (style: string): string => {
    const colors = {
      achievement: 'text-yellow-600 bg-yellow-50',
      social: 'text-blue-600 bg-blue-50',
      mastery: 'text-purple-600 bg-purple-50',
      purpose: 'text-green-600 bg-green-50',
    };
    return colors[style as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  /**
   * 🏆 難易度カラー取得
   */
  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 3) return 'text-green-600 bg-green-50';
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-50';
    if (difficulty <= 8) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  /**
   * ⚡ 緊急度カラー取得
   */
  const getUrgencyColor = (urgency: string): string => {
    const colors = {
      low: 'text-blue-600 bg-blue-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-red-600 bg-red-50',
    };
    return colors[urgency as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  // モックデータ生成
  const generateMockHistoricalData = () =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      category: ['learning', 'health', 'work', 'personal'][Math.floor(Math.random() * 4)],
      completed: Math.random() > 0.3,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    }));

  const generateMockInteractionData = () =>
    Array.from({ length: 20 }, (_, i) => ({
      type: 'task_completion',
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
      value: Math.random(),
    }));

  const generateMockRecentActivity = () =>
    Array.from({ length: 10 }, (_, i) => ({
      action: 'completed_task',
      timestamp: new Date(Date.now() - i * 30 * 60 * 1000),
      success: Math.random() > 0.2,
    }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
              <Brain className="h-8 w-8 text-white" />
            </div>
            AI強化ゲーミフィケーション
          </h1>
          <p className="text-gray-600 mt-2">
            パーソナライズされたゲーム体験で最高のパフォーマンスを実現
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={refreshAIAnalysis}
            disabled={state.isAnalyzing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', state.isAnalyzing && 'animate-spin')} />
            {state.isAnalyzing ? 'AI分析中...' : 'AI分析更新'}
          </Button>
          <Badge variant="outline" className="bg-white/50">
            {state.lastUpdateTime
              ? `最終更新: ${state.lastUpdateTime.toLocaleTimeString()}`
              : '未分析'}
          </Badge>
        </div>
      </div>

      {/* AI分析ローディング */}
      {state.isAnalyzing && (
        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription>
            🤖 AIがあなたの行動パターンとモチベーションを分析中...
          </AlertDescription>
        </Alert>
      )}

      {/* プレイヤー統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">レベル</p>
                <p className="text-2xl font-bold text-yellow-900">{userLevel}</p>
                <Progress value={(userXP / nextLevelXP) * 100} className="h-2 mt-1" />
              </div>
              <Crown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">XP</p>
                <p className="text-2xl font-bold text-blue-900">{userXP.toLocaleString()}</p>
                <p className="text-xs text-blue-600">次のレベルまであと {nextLevelXP - userXP}</p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">モチベーション</p>
                <p className="text-2xl font-bold text-green-900">{calculateMotivationScore()}%</p>
                <p className="text-xs text-green-600">AI分析スコア</p>
              </div>
              <Flame className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">AIスコア</p>
                <p className="text-2xl font-bold text-purple-900">92%</p>
                <p className="text-xs text-purple-600">パーソナライゼーション精度</p>
              </div>
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            ダッシュボード
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            AIチャレンジ
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            インサイト
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            リワード
          </TabsTrigger>
        </TabsList>

        {/* ダッシュボードタブ */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* パーソナリティプロファイル */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  AIパーソナリティ分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.personalityProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">モチベーションスタイル</span>
                      <Badge
                        className={getPersonalityStyleColor(
                          state.personalityProfile.motivationStyle
                        )}
                      >
                        {state.personalityProfile.motivationStyle}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">競争性</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={state.personalityProfile.competitiveness * 10}
                          className="w-20 h-2"
                        />
                        <span className="text-sm">
                          {state.personalityProfile.competitiveness}/10
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">学習スタイル</span>
                      <Badge variant="outline">{state.personalityProfile.learningStyle}</Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">AI分析を実行してください</p>
                )}
              </CardContent>
            </Card>

            {/* 行動パターン */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  行動パターン分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.behaviorPattern ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">好みのタスクタイプ</p>
                      <div className="flex flex-wrap gap-1">
                        {state.behaviorPattern.preferredTaskTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">アクティブ時間帯</p>
                      <div className="flex flex-wrap gap-1">
                        {state.behaviorPattern.activeTimeRanges.map((time) => (
                          <Badge key={time} variant="outline" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">最適チャレンジレベル</p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={state.behaviorPattern.optimalChallengeLevel * 10}
                          className="flex-1 h-2"
                        />
                        <span className="text-sm">
                          {state.behaviorPattern.optimalChallengeLevel}/10
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">AI分析を実行してください</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI推奨事項 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI推奨事項
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {state.aiRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-900">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* チャレンジタブ */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.smartChallenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      難易度 {challenge.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{challenge.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {challenge.estimatedTime}分
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {challenge.xpReward} XP
                    </div>
                  </div>

                  <div className="p-2 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-800">
                      <Bot className="h-3 w-3 inline mr-1" />
                      {challenge.personalizedReason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">成功予測:</span>
                      <span className="text-xs font-medium">
                        {Math.round(challenge.successPrediction * 100)}%
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => acceptChallenge(challenge)}
                      className="flex items-center gap-1"
                    >
                      <PlayCircle className="h-3 w-3" />
                      開始
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* インサイトタブ */}
        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {state.motivationalInsights.map((insight, index) => (
              <Alert
                key={index}
                className={`border-l-4 ${getUrgencyColor(insight.urgency).replace('text-', 'border-l-')}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {insight.type === 'encouragement' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {insight.type === 'strategy' && <Lightbulb className="h-4 w-4 text-blue-600" />}
                    {insight.type === 'warning' && (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    )}
                    {insight.type === 'celebration' && (
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <AlertDescription className="text-sm">{insight.message}</AlertDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={getUrgencyColor(insight.urgency)}>
                        {insight.urgency}
                      </Badge>
                      {insight.actionable && (
                        <Badge variant="secondary" className="text-xs">
                          実行可能
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </TabsContent>

        {/* リワードタブ */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.personalizedRewards.map((reward) => (
              <Card key={reward.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{reward.title}</CardTitle>
                    <Badge
                      className={
                        reward.rarityLevel === 'legendary'
                          ? 'bg-yellow-500 text-white'
                          : reward.rarityLevel === 'epic'
                            ? 'bg-purple-500 text-white'
                            : reward.rarityLevel === 'rare'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-500 text-white'
                      }
                    >
                      {reward.rarityLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{reward.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">コスト:</span>
                    <span className="font-bold">{reward.cost} XP</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">AI推奨スコア:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={reward.aiRecommendationScore * 100} className="w-16 h-2" />
                      <span className="text-xs">
                        {Math.round(reward.aiRecommendationScore * 100)}%
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    disabled={userXP < reward.cost}
                    onClick={() => purchaseReward(reward)}
                  >
                    {userXP < reward.cost ? 'XP不足' : '購入'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
