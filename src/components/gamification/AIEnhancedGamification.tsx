/**
 * 🤖 AI強化ゲーミフィケーションダッシュボード（進化版）
 * リアルタイムAI分析・予測・パーソナライゼーションによる次世代ゲーム体験
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Heart,
  Activity,
  MessageCircle,
  Gauge,
  Shield,
  Timer,
  Coffee,
  Sun,
  Moon,
  Sunset,
  ThermometerSun,
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
  EmotionalState,
  PredictiveAnalytics,
  SmartCoaching,
  AIGameplayOptimization,
} from '@/services/gamification/AIGamificationService';

interface AIGamificationState {
  behaviorPattern: UserBehaviorPattern | null;
  personalityProfile: AIPersonalityProfile | null;
  emotionalState: EmotionalState | null;
  predictiveAnalytics: PredictiveAnalytics | null;
  smartCoaching: SmartCoaching | null;
  smartChallenges: SmartChallenge[];
  motivationalInsights: MotivationalInsight[];
  personalizedRewards: AIReward[];
  gameplayOptimization: AIGameplayOptimization | null;
  aiRecommendations: string[];
  isAnalyzing: boolean;
  lastUpdateTime: Date | null;
}

export const AIEnhancedGamification: React.FC = () => {
  const [state, setState] = useState<AIGamificationState>({
    behaviorPattern: null,
    personalityProfile: null,
    emotionalState: null,
    predictiveAnalytics: null,
    smartCoaching: null,
    smartChallenges: [],
    motivationalInsights: [],
    personalizedRewards: [],
    gameplayOptimization: null,
    aiRecommendations: [],
    isAnalyzing: false,
    lastUpdateTime: null,
  });

  const [selectedTab, setSelectedTab] = useState<
    'dashboard' | 'emotion' | 'prediction' | 'coaching' | 'challenges' | 'optimization'
  >('dashboard');

  const [userLevel, setUserLevel] = useState(15);
  const [userXP, setUserXP] = useState(3850);
  const [nextLevelXP] = useState(4500);

  // テキスト入力でリアルタイム感情分析
  const [textInput, setTextInput] = useState('');
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);

  useEffect(() => {
    initializeFullAIAnalysis();
  }, []);

  /**
   * 🚀 フルAI分析パイプライン実行
   */
  const initializeFullAIAnalysis = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isAnalyzing: true }));

    try {
      const userId = 'current_user';

      // モックコンテキストデータ生成
      const fullContext = {
        historicalData: generateMockHistoricalData(),
        recentActivity: generateMockRecentActivity(),
        textInput: textInput || '',
      };

      // フルAI分析を実行
      const analysisResults = await aiGamificationService.runFullAIAnalysis(userId, fullContext);

      // 追加でスマートチャレンジとリワードも取得
      const [smartChallenges, personalizedRewards, insights] = await Promise.all([
        aiGamificationService.generateSmartChallenges(userId, 5),
        aiGamificationService.generatePersonalizedRewards(userId),
        aiGamificationService.analyzeMotivationalState(userId, fullContext.recentActivity),
      ]);

      setState((prev) => ({
        ...prev,
        behaviorPattern: analysisResults.behavior,
        emotionalState: analysisResults.emotion,
        predictiveAnalytics: analysisResults.prediction,
        smartCoaching: analysisResults.coaching,
        gameplayOptimization: analysisResults.optimization,
        smartChallenges,
        personalizedRewards,
        motivationalInsights: insights,
        aiRecommendations: generateAIRecommendations(analysisResults),
        isAnalyzing: false,
        lastUpdateTime: new Date(),
      }));

      toast.success('🤖 AI分析が完了しました！パーソナライズされた体験をお楽しみください。');
    } catch (error) {
      console.error('フルAI分析エラー:', error);
      setState((prev) => ({ ...prev, isAnalyzing: false }));
      toast.error('AI分析中にエラーが発生しました。');
    }
  };

  /**
   * 💭 リアルタイム感情分析
   */
  const analyzeEmotionFromText = async (): Promise<void> => {
    if (!textInput.trim()) return;

    setIsAnalyzingEmotion(true);
    try {
      const userId = 'current_user';
      const recentActivity = generateMockRecentActivity();

      const emotionalState = await aiGamificationService.analyzeEmotionalState(
        userId,
        recentActivity,
        textInput
      );

      setState((prev) => ({
        ...prev,
        emotionalState,
      }));

      toast.success('💭 感情状態を更新しました');
    } catch (error) {
      console.error('感情分析エラー:', error);
      toast.error('感情分析に失敗しました');
    } finally {
      setIsAnalyzingEmotion(false);
    }
  };

  /**
   * 🎯 スマートチャレンジ受諾
   */
  const acceptChallenge = async (challenge: SmartChallenge): Promise<void> => {
    try {
      console.log('🎮 チャレンジを受諾:', challenge.title);

      // XP獲得
      setUserXP((prev) => prev + Math.floor(challenge.xpReward * 0.1));

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
    initializeFullAIAnalysis();
  };

  // ヘルパー関数群
  const getEmotionIcon = (mood: string) => {
    const icons = {
      energetic: <Zap className="w-5 h-5 text-yellow-500" />,
      focused: <Target className="w-5 h-5 text-blue-500" />,
      stressed: <AlertCircle className="w-5 h-5 text-red-500" />,
      calm: <Heart className="w-5 h-5 text-green-500" />,
      frustrated: <ThermometerSun className="w-5 h-5 text-orange-500" />,
      motivated: <Flame className="w-5 h-5 text-purple-500" />,
    };
    return icons[mood as keyof typeof icons] || <Activity className="w-5 h-5" />;
  };

  const getTimeIcon = (time: string) => {
    if (time.includes('09:') || time.includes('10:') || time.includes('11:')) {
      return <Sun className="w-4 h-4 text-yellow-500" />;
    } else if (time.includes('14:') || time.includes('15:') || time.includes('16:')) {
      return <Sunset className="w-4 h-4 text-orange-500" />;
    } else {
      return <Moon className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    const icons = {
      improving: <TrendingUp className="w-4 h-4 text-green-500" />,
      stable: <Gauge className="w-4 h-4 text-blue-500" />,
      declining: <AlertCircle className="w-4 h-4 text-red-500" />,
    };
    return icons[trend as keyof typeof icons] || <Activity className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* AIヘッダー */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            🤖 AI強化ゲーミフィケーション（進化版）
            {state.isAnalyzing && (
              <div className="flex items-center gap-2 ml-auto">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">AI分析中...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-lg">
              {state.lastUpdateTime ? (
                <>
                  最新AI分析: {state.lastUpdateTime.toLocaleTimeString()} • レベル {userLevel} (
                  {userXP}/{nextLevelXP} XP)
                </>
              ) : (
                'AI分析を準備中...'
              )}
            </div>
            <Button
              onClick={refreshAIAnalysis}
              disabled={state.isAnalyzing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn('w-4 h-4', state.isAnalyzing && 'animate-spin')} />
              AI再分析
            </Button>
          </div>
          <Progress value={(userXP / nextLevelXP) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* タブナビゲーション */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab as (value: string) => void}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">ダッシュボード</span>
          </TabsTrigger>
          <TabsTrigger value="emotion" className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">感情分析</span>
          </TabsTrigger>
          <TabsTrigger value="prediction" className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">予測分析</span>
          </TabsTrigger>
          <TabsTrigger value="coaching" className="flex items-center gap-1">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">コーチング</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">チャレンジ</span>
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">最適化</span>
          </TabsTrigger>
        </TabsList>

        {/* ダッシュボードタブ */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 現在の感情状態 */}
            {state.emotionalState && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getEmotionIcon(state.emotionalState.mood)}
                    <span className="font-medium">感情状態</span>
                  </div>
                  <div className="text-2xl font-bold">{state.emotionalState.mood}</div>
                  <div className="text-sm text-gray-600">
                    モチベーション: {state.emotionalState.motivation}%
                  </div>
                  <Progress value={state.emotionalState.motivation} className="mt-2" />
                </CardContent>
              </Card>
            )}

            {/* バーンアウトリスク */}
            {state.predictiveAnalytics && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    <span className="font-medium">バーンアウトリスク</span>
                  </div>
                  <div className="text-2xl font-bold">{state.predictiveAnalytics.burnoutRisk}%</div>
                  <div className="text-sm text-gray-600">
                    {state.predictiveAnalytics.burnoutRisk < 30
                      ? '低リスク'
                      : state.predictiveAnalytics.burnoutRisk < 70
                        ? '中リスク'
                        : '高リスク'}
                  </div>
                  <Progress value={state.predictiveAnalytics.burnoutRisk} className="mt-2" />
                </CardContent>
              </Card>
            )}

            {/* パフォーマンス傾向 */}
            {state.predictiveAnalytics && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getTrendIcon(state.predictiveAnalytics.performanceTrend)}
                    <span className="font-medium">パフォーマンス</span>
                  </div>
                  <div className="text-2xl font-bold capitalize">
                    {state.predictiveAnalytics.performanceTrend}
                  </div>
                  <div className="text-sm text-gray-600">
                    次レベルまで: {state.predictiveAnalytics.nextLevelPrediction.estimatedDays}日
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AIマッチ度 */}
            {state.gameplayOptimization && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">AI最適化</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {state.gameplayOptimization.personalityMatch}%
                  </div>
                  <div className="text-sm text-gray-600">パーソナリティマッチ</div>
                  <Progress value={state.gameplayOptimization.personalityMatch} className="mt-2" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI推奨事項 */}
          {state.aiRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  AI推奨事項
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {state.aiRecommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <Lightbulb className="w-4 h-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 感情分析タブ */}
        <TabsContent value="emotion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                リアルタイム感情分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">現在の気持ちを教えてください：</label>
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="今の気分や状況について自由に入力してください..."
                  className="mt-1"
                />
                <Button
                  onClick={analyzeEmotionFromText}
                  disabled={isAnalyzingEmotion || !textInput.trim()}
                  className="mt-2"
                >
                  {isAnalyzingEmotion ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      感情分析中...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      感情を分析
                    </>
                  )}
                </Button>
              </div>

              {state.emotionalState && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {state.emotionalState.energy}%
                    </div>
                    <div className="text-sm text-gray-600">エネルギー</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {state.emotionalState.motivation}%
                    </div>
                    <div className="text-sm text-gray-600">モチベーション</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {state.emotionalState.stress}%
                    </div>
                    <div className="text-sm text-gray-600">ストレス</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {state.emotionalState.satisfaction}%
                    </div>
                    <div className="text-sm text-gray-600">満足度</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 予測分析タブ */}
        <TabsContent value="prediction" className="space-y-4">
          {state.predictiveAnalytics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    最適な作業パターン
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">最適時間帯</h4>
                      <div className="space-y-1">
                        {state.predictiveAnalytics.optimalWorkPattern.bestTimes.map(
                          (time, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {getTimeIcon(time)}
                              {time}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">推奨休憩</h4>
                      <div className="text-2xl font-bold text-blue-600">
                        {state.predictiveAnalytics.optimalWorkPattern.recommendedBreaks}回/日
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">理想的作業時間</h4>
                      <div className="text-2xl font-bold text-green-600">
                        {state.predictiveAnalytics.optimalWorkPattern.idealTaskDuration}分
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>モチベーション要因</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {state.predictiveAnalytics.motivationalFactors.map((factor, index) => (
                      <Badge key={index} variant="outline">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* スマートコーチングタブ */}
        <TabsContent value="coaching" className="space-y-4">
          {state.smartCoaching && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    パーソナライズドアドバイス
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.smartCoaching.personalizedTips.map((tip, index) => (
                      <Alert key={index}>
                        <CheckCircle className="w-4 h-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">即座に実行</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {state.smartCoaching.adaptiveRecommendations.immediate.map((rec, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <PlayCircle className="w-4 h-4 text-green-500" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">短期目標</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {state.smartCoaching.adaptiveRecommendations.shortTerm.map((rec, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Timer className="w-4 h-4 text-blue-500" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">長期戦略</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {state.smartCoaching.adaptiveRecommendations.longTerm.map((rec, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* スマートチャレンジタブ */}
        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                AIパーソナライズドチャレンジ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.smartChallenges.map((challenge) => (
                  <Card key={challenge.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{challenge.title}</h4>
                        <Badge variant="outline">{challenge.xpReward} XP</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>難易度: {challenge.difficulty}/10</span>
                        <span>予想時間: {challenge.estimatedTime}分</span>
                      </div>
                      <div className="text-xs text-blue-600 mt-2">
                        AI理由: {challenge.personalizedReason}
                      </div>
                      <Button
                        onClick={() => acceptChallenge(challenge)}
                        className="w-full mt-3"
                        size="sm"
                      >
                        チャレンジ開始
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ゲームプレイ最適化タブ */}
        <TabsContent value="optimization" className="space-y-4">
          {state.gameplayOptimization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  AI ゲームプレイ最適化
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">最適化設定</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">難易度調整</span>
                        <Badge
                          variant={
                            state.gameplayOptimization.difficultyAdjustment > 0
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {state.gameplayOptimization.difficultyAdjustment > 0 ? '+' : ''}
                          {state.gameplayOptimization.difficultyAdjustment}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">報酬タイミング</span>
                        <Badge variant="outline">{state.gameplayOptimization.rewardTiming}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">パーソナリティマッチ</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={state.gameplayOptimization.personalityMatch}
                            className="w-20"
                          />
                          <span className="text-sm">
                            {state.gameplayOptimization.personalityMatch}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">推奨チャレンジタイプ</h4>
                    <div className="flex flex-wrap gap-2">
                      {state.gameplayOptimization.challengeTypes.map((type, index) => (
                        <Badge key={index} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>

                    <h4 className="font-medium mb-3 mt-4">エンゲージメント戦略</h4>
                    <p className="text-sm text-gray-600">
                      {state.gameplayOptimization.engagementStrategy}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ヘルパー関数
function generateMockHistoricalData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    tasksCompleted: Math.floor(Math.random() * 8) + 2,
    workDuration: Math.floor(Math.random() * 480) + 120,
    breaksTaken: Math.floor(Math.random() * 5) + 1,
    stressLevel: Math.floor(Math.random() * 100),
    productivityScore: Math.floor(Math.random() * 100) + 1,
  }));
}

function generateMockRecentActivity() {
  return Array.from({ length: 10 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
    action: ['task_completed', 'break_taken', 'focus_session', 'planning'][
      Math.floor(Math.random() * 4)
    ],
    duration: Math.floor(Math.random() * 120) + 5,
    context: `Activity ${i + 1}`,
  }));
}

function generateAIRecommendations(analysisResults: any): string[] {
  const recommendations = [
    `${analysisResults.emotion.mood}の状態では、${analysisResults.prediction.optimalWorkPattern.idealTaskDuration}分間のタスクが最適です`,
    `バーンアウトリスク${analysisResults.prediction.burnoutRisk}%のため、${analysisResults.coaching.interventionTriggers[0]}に注意してください`,
    `パフォーマンスが${analysisResults.prediction.performanceTrend}傾向のため、${analysisResults.coaching.personalizedTips[0]}`,
  ];
  return recommendations.slice(0, 2);
}
