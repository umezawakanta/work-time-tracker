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
// import { useToast } from '@/hooks/use-toast'; // TODO: use-toast hook implementation needed
// import { useDispatch } from 'react-redux';
// import { addTodoItem } from '@/store/todoSlice';
import { todoApi } from '@/services/api/todoApi';
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
  Plus,
  Wand2,
  Cpu,
  ListPlus,
  Cog,
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
  TaskGenerationContext,
  SmartTaskRecommendation,
  AIGeneratedTask,
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
  // 既存の状態管理
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emotionalText, setEmotionalText] = useState<string>('');

  // AI分析結果の状態
  const [analysisResults, setAnalysisResults] = useState<{
    emotion: EmotionalState | null;
    prediction: PredictiveAnalytics | null;
    coaching: SmartCoaching | null;
    optimization: AIGameplayOptimization | null;
  }>({
    emotion: null,
    prediction: null,
    coaching: null,
    optimization: null,
  });

  // 新規追加: AIタスク生成機能の状態管理
  const [taskGenerationLoading, setTaskGenerationLoading] = useState<boolean>(false);
  const [generatedTasks, setGeneratedTasks] = useState<SmartTaskRecommendation | null>(null);
  const [addingTasksToTodo, setAddingTasksToTodo] = useState<boolean>(false);
  const [taskGenerationContext, setTaskGenerationContext] = useState<TaskGenerationContext | null>(
    null
  );

  // Redux dispatch (commented out to avoid type issues)
  // const dispatch = useDispatch();

  // Toast通知用の簡易実装
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    console.log(`Toast (${type}): ${message}`);
    // TODO: 実際のtoast実装に置き換え
  };

  useEffect(() => {
    initializeFullAIAnalysis();
  }, []);

  /**
   * 🚀 フルAI分析パイプライン実行
   */
  const initializeFullAIAnalysis = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const userId = 'current_user';

      // モックコンテキストデータ生成
      const fullContext = {
        historicalData: generateMockHistoricalData(),
        recentActivity: generateMockRecentActivity(),
        textInput: emotionalText || '',
      };

      // フルAI分析を実行
      const analysisResults = await aiGamificationService.runFullAIAnalysis(userId, fullContext);

      // 追加でスマートチャレンジとリワードも取得
      const [smartChallenges, personalizedRewards, insights] = await Promise.all([
        aiGamificationService.generateSmartChallenges(userId, 5),
        aiGamificationService.generatePersonalizedRewards(userId),
        aiGamificationService.analyzeMotivationalState(userId, fullContext.recentActivity),
      ]);

      setAnalysisResults((prev) => ({
        ...prev,
        emotion: analysisResults.emotion,
        prediction: analysisResults.prediction,
        coaching: analysisResults.coaching,
        optimization: analysisResults.optimization,
      }));

      toast.success('🤖 AI分析が完了しました！パーソナライズされた体験をお楽しみください。');
    } catch (error) {
      console.error('フルAI分析エラー:', error);
      setIsLoading(false);
      toast.error('AI分析中にエラーが発生しました。');
    }
  };

  /**
   * 💭 リアルタイム感情分析
   */
  const analyzeEmotionFromText = async (): Promise<void> => {
    if (!emotionalText.trim()) return;

    setIsLoading(true);
    try {
      const userId = 'current_user';
      const recentActivity = generateMockRecentActivity();

      const emotionalState = await aiGamificationService.analyzeEmotionalState(
        userId,
        recentActivity,
        emotionalText
      );

      setAnalysisResults((prev) => ({
        ...prev,
        emotion: emotionalState,
      }));

      toast.success('💭 感情状態を更新しました');
    } catch (error) {
      console.error('感情分析エラー:', error);
      toast.error('感情分析に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🎯 スマートチャレンジ受諾
   */
  const acceptChallenge = async (challenge: SmartChallenge): Promise<void> => {
    try {
      console.log('🎮 チャレンジを受諾:', challenge.title);

      // XP獲得
      // setUserXP((prev) => prev + Math.floor(challenge.xpReward * 0.1)); // This line was removed

      toast.success(`🎯 「${challenge.title}」チャレンジを開始しました！`);

      // チャレンジを完了済みにマーク
      // setState((prev) => ({ // This line was removed
      //   ...prev,
      //   smartChallenges: prev.smartChallenges.map((c) =>
      //     c.id === challenge.id ? ({ ...c, isAccepted: true } as any) : c
      //   ),
      // }));
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
      // if (userXP < reward.cost) { // This line was removed
      //   toast.error('XPが不足しています。');
      //   return;
      // }

      // setUserXP((prev) => prev - reward.cost); // This line was removed
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

  // 新規追加: AIタスク生成機能のロジック
  const generateAITasks = async (): Promise<void> => {
    setTaskGenerationLoading(true);
    try {
      // ユーザーの現在のコンテキストを取得
      const context = await aiGamificationService.getCurrentTaskGenerationContext();
      setTaskGenerationContext(context);

      // AIによるタスク生成
      const recommendation = await aiGamificationService.generateSmartTasks(context);
      setGeneratedTasks(recommendation);

      showToast('🤖 AIがタスクを生成しました！', 'success');
    } catch (error) {
      console.error('AI task generation error:', error);
      showToast('タスク生成に失敗しました', 'error');
    } finally {
      setTaskGenerationLoading(false);
    }
  };

  const addGeneratedTasksToTodo = async (tasks: AIGeneratedTask[]): Promise<void> => {
    if (!tasks.length) return;

    setAddingTasksToTodo(true);
    try {
      // 各タスクをTodoシステムに追加
      for (const task of tasks) {
        await todoApi.create(
          task.title,
          task.priority,
          task.priority >= 4, // isPrioritized
          'input',
          task.suggestedDeadline
        );
      }

      showToast(`${tasks.length}個のタスクをTodoリストに追加しました！`, 'success');

      // 生成されたタスクをクリア
      setGeneratedTasks(null);
    } catch (error) {
      console.error('Failed to add tasks to todo:', error);
      showToast('タスクの追加に失敗しました', 'error');
    } finally {
      setAddingTasksToTodo(false);
    }
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
            {isLoading && (
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
              {/* state.lastUpdateTime ? ( // This line was removed
                <>
                  最新AI分析: {state.lastUpdateTime.toLocaleTimeString()} • レベル {userLevel} (
                  {userXP}/{nextLevelXP} XP)
                </>
              ) : ( // This line was removed
                'AI分析を準備中...'
              ) */}
            </div>
            <Button
              onClick={refreshAIAnalysis}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              AI再分析
            </Button>
          </div>
          <Progress value={/* userXP / nextLevelXP */ (0 / 1) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            ダッシュボード
          </TabsTrigger>
          <TabsTrigger value="emotion" className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            感情分析
          </TabsTrigger>
          <TabsTrigger value="prediction" className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            予測分析
          </TabsTrigger>
          <TabsTrigger value="coaching" className="flex items-center gap-1">
            <Lightbulb className="w-4 h-4" />
            コーチング
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            チャレンジ
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            最適化
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1">
            <ListPlus className="w-4 h-4" />
            AIタスク生成
          </TabsTrigger>
        </TabsList>

        {/* ダッシュボードタブ */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 現在の感情状態 */}
            {analysisResults.emotion && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getEmotionIcon(analysisResults.emotion.mood)}
                    <span className="font-medium">感情状態</span>
                  </div>
                  <div className="text-2xl font-bold">{analysisResults.emotion.mood}</div>
                  <div className="text-sm text-gray-600">
                    モチベーション: {analysisResults.emotion.motivation}%
                  </div>
                  <Progress value={analysisResults.emotion.motivation} className="mt-2" />
                </CardContent>
              </Card>
            )}

            {/* バーンアウトリスク */}
            {analysisResults.prediction && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    <span className="font-medium">バーンアウトリスク</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analysisResults.prediction.burnoutRisk}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {analysisResults.prediction.burnoutRisk < 30
                      ? '低リスク'
                      : analysisResults.prediction.burnoutRisk < 70
                        ? '中リスク'
                        : '高リスク'}
                  </div>
                  <Progress value={analysisResults.prediction.burnoutRisk} className="mt-2" />
                </CardContent>
              </Card>
            )}

            {/* パフォーマンス傾向 */}
            {analysisResults.prediction && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getTrendIcon(analysisResults.prediction.performanceTrend)}
                    <span className="font-medium">パフォーマンス</span>
                  </div>
                  <div className="text-2xl font-bold capitalize">
                    {analysisResults.prediction.performanceTrend}
                  </div>
                  <div className="text-sm text-gray-600">
                    次レベルまで: {analysisResults.prediction.nextLevelPrediction.estimatedDays}日
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AIマッチ度 */}
            {analysisResults.optimization && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">AI最適化</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analysisResults.optimization.personalityMatch}%
                  </div>
                  <div className="text-sm text-gray-600">パーソナリティマッチ</div>
                  <Progress
                    value={analysisResults.optimization.personalityMatch}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI推奨事項 */}
          {/* state.aiRecommendations.length > 0 && ( // This line was removed
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
          ) */}
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
                  value={emotionalText}
                  onChange={(e) => setEmotionalText(e.target.value)}
                  placeholder="今の気分や状況について自由に入力してください..."
                  className="mt-1"
                />
                <Button
                  onClick={analyzeEmotionFromText}
                  disabled={isLoading || !emotionalText.trim()}
                  className="mt-2"
                >
                  {isLoading ? (
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

              {analysisResults.emotion && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResults.emotion.energy}%
                    </div>
                    <div className="text-sm text-gray-600">エネルギー</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResults.emotion.motivation}%
                    </div>
                    <div className="text-sm text-gray-600">モチベーション</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {analysisResults.emotion.stress}%
                    </div>
                    <div className="text-sm text-gray-600">ストレス</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResults.emotion.satisfaction}%
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
          {analysisResults.prediction && (
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
                        {analysisResults.prediction.optimalWorkPattern.bestTimes.map(
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
                        {analysisResults.prediction.optimalWorkPattern.recommendedBreaks}回/日
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">理想的作業時間</h4>
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResults.prediction.optimalWorkPattern.idealTaskDuration}分
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
                    {analysisResults.prediction.motivationalFactors.map((factor, index) => (
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
          {analysisResults.coaching && (
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
                    {analysisResults.coaching.personalizedTips.map((tip, index) => (
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
                      {analysisResults.coaching.adaptiveRecommendations.immediate.map(
                        (rec, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <PlayCircle className="w-4 h-4 text-green-500" />
                            {rec}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">短期目標</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResults.coaching.adaptiveRecommendations.shortTerm.map(
                        (rec, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Timer className="w-4 h-4 text-blue-500" />
                            {rec}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">長期戦略</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResults.coaching.adaptiveRecommendations.longTerm.map(
                        (rec, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            {rec}
                          </div>
                        )
                      )}
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
                {/* state.smartChallenges.map((challenge) => ( // This line was removed
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
                ))} */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ゲームプレイ最適化タブ */}
        <TabsContent value="optimization" className="space-y-4">
          {analysisResults.optimization && (
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
                            analysisResults.optimization.difficultyAdjustment > 0
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {analysisResults.optimization.difficultyAdjustment > 0 ? '+' : ''}
                          {analysisResults.optimization.difficultyAdjustment}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">報酬タイミング</span>
                        <Badge variant="outline">{analysisResults.optimization.rewardTiming}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">パーソナリティマッチ</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={analysisResults.optimization.personalityMatch}
                            className="w-20"
                          />
                          <span className="text-sm">
                            {analysisResults.optimization.personalityMatch}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">推奨チャレンジタイプ</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.optimization.challengeTypes.map((type, index) => (
                        <Badge key={index} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>

                    <h4 className="font-medium mb-3 mt-4">エンゲージメント戦略</h4>
                    <p className="text-sm text-gray-600">
                      {analysisResults.optimization.engagementStrategy}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AIタスク生成タブ */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListPlus className="w-5 h-5" />
                AIタスク生成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="text-lg">
                    AIが生成するタスクは、あなたの現在の状況や目標に合わせて最適化されています。
                    生成されたタスクをTodoリストに追加することで、実践的な学習を促進できます。
                  </div>
                  <Button
                    onClick={generateAITasks}
                    disabled={taskGenerationLoading}
                    className="flex items-center gap-2"
                  >
                    {taskGenerationLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        タスク生成中...
                      </>
                    ) : (
                      <>
                        <ListPlus className="w-4 h-4" />
                        タスクを生成
                      </>
                    )}
                  </Button>
                </div>

                {generatedTasks && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-lg">🤖 AI生成タスク</h4>
                        <Badge variant="secondary">
                          {generatedTasks.tasks.length}個のタスク / 合計
                          {generatedTasks.totalEstimatedTime}分
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {generatedTasks.tasks.map((task, index) => (
                          <Card key={index} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-sm">{task.title}</h5>
                                <Badge variant="outline" className="text-xs">
                                  優先度: {task.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />約{task.estimatedMinutes}分
                                </span>
                                <span className="flex items-center gap-1">
                                  <Brain className="w-3 h-3" />
                                  信頼度{Math.round(task.aiConfidence * 100)}%
                                </span>
                              </div>
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                💡 {task.reasoningBehind}
                              </div>
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {task.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-sm mb-2">📊 AI分析レポート</h5>
                        <p className="text-xs text-gray-600 mb-2">{generatedTasks.reasoning}</p>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">難易度バランス:</span>{' '}
                          {generatedTasks.difficultyBalance}
                        </div>
                        {generatedTasks.optimizationTips.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium text-xs">💡 最適化のヒント:</span>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              {generatedTasks.optimizationTips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-1">
                                  <span>•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => addGeneratedTasksToTodo(generatedTasks.tasks)}
                        disabled={addingTasksToTodo}
                        className="w-full mt-4"
                        size="lg"
                      >
                        {addingTasksToTodo ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            タスクを追加中...
                          </>
                        ) : (
                          <>
                            <ListPlus className="w-4 h-4 mr-2" />
                            すべてのタスクをTodoリストに追加 ({generatedTasks.tasks.length}個)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
