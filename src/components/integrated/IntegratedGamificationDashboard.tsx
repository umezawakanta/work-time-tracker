/**
 * 🎮 統合ゲーミフィケーションダッシュボード
 * ゲーミフィケーション、AI強化ゲーミフィケーション、ToDo管理の完全統合画面
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGamifiedTodoCompletion } from '../dailyToDoReminder/hooks/useGamifiedTodoCompletion';
import {
  integratedGamificationService,
  IntegratedDashboardData,
  PlayerProfile,
  GamificationReward,
  Challenge,
  AIInsight,
} from '@/services/gamification/IntegratedGamificationService';
import {
  aiGamificationService,
  SmartTaskRecommendation,
} from '@/services/gamification/AIGamificationService';
import {
  Trophy,
  Star,
  Zap,
  Brain,
  Target,
  TrendingUp,
  Award,
  Clock,
  Flame,
  Crown,
  Sparkles,
  Users,
  BarChart3,
  Lightbulb,
  Plus,
  RefreshCw,
  Calendar,
  CheckCircle,
  ListPlus,
  Activity,
  Heart,
  Shield,
  Cpu,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo } from '@/types/todo';

interface IntegratedGamificationDashboardProps {
  userId?: string;
  compactMode?: boolean;
}

export const IntegratedGamificationDashboard: React.FC<IntegratedGamificationDashboardProps> = ({
  userId = 'current_user',
  compactMode = false,
}) => {
  // State Management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dashboardData, setDashboardData] = useState<IntegratedDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiTaskRecommendation, setAiTaskRecommendation] = useState<SmartTaskRecommendation | null>(
    null
  );

  // Redux Selectors
  const todos = useSelector((state: RootState) => state.todo.items);
  const completedTodosToday = todos.filter(
    (todo) =>
      todo &&
      todo._id &&
      todo.completed &&
      todo.completedDate &&
      new Date(todo.completedDate).toDateString() === new Date().toDateString()
  );

  // Custom Hooks
  const { completeTask, isProcessing, lastRewards, playerLevel, totalXP, streakDays } =
    useGamifiedTodoCompletion();

  // Initialize Dashboard
  useEffect(() => {
    initializeDashboard();
  }, [userId]);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      // Initialize player profile
      await integratedGamificationService.initializePlayer(userId);

      // Load dashboard data
      const data = await integratedGamificationService.getDashboardData();
      setDashboardData(data);

      console.log('🎮 Integrated Gamification Dashboard initialized:', {
        level: data.player.level,
        totalXP: data.player.totalXP,
        badges: data.player.badges.length,
        streakDays: data.player.streakDays,
      });
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      const data = await integratedGamificationService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const generateAITasks = async () => {
    try {
      const context = await aiGamificationService.getCurrentTaskGenerationContext();
      const recommendation = await aiGamificationService.generateSmartTasks(context);
      setAiTaskRecommendation(recommendation);
    } catch (error) {
      console.error('AI task generation failed:', error);
    }
  };

  const addAITasksToTodo = async () => {
    if (!aiTaskRecommendation) return;

    try {
      const addedTasks =
        await integratedGamificationService.integrateAIGeneratedTasks(aiTaskRecommendation);
      console.log(`🤖 Added ${addedTasks.length} AI-generated tasks with gamification integration`);
      setAiTaskRecommendation(null);
      await refreshDashboard();
    } catch (error) {
      console.error('Failed to add AI tasks:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>統合ゲーミフィケーションを初期化中...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertDescription>ダッシュボードデータの読み込みに失敗しました。</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('w-full', compactMode ? 'space-y-4' : 'space-y-6')}>
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">レベル {dashboardData.player.level}</h2>
                  <p className="text-white/80">🎮 統合ゲーミフィケーション</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {dashboardData.player.totalXP.toLocaleString()} XP
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {dashboardData.player.streakDays}日連続
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  {dashboardData.player.badges.length}バッジ
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={refreshDashboard}
              disabled={isRefreshing}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>次のレベルまで</span>
              <span>
                {dashboardData.player.currentXP}/{dashboardData.player.xpToNextLevel} XP
              </span>
            </div>
            <Progress
              value={(dashboardData.player.currentXP / dashboardData.player.xpToNextLevel) * 100}
              className="bg-white/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            概要
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            タスク管理
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI統合
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            実績・報酬
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Today's Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">今日の完了</span>
                </div>
                <div className="text-2xl font-bold">{dashboardData.todayStats.tasksCompleted}</div>
                <div className="text-sm text-gray-600">
                  +{dashboardData.todayStats.xpEarned} XP獲得
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">連続記録</span>
                </div>
                <div className="text-2xl font-bold">{dashboardData.player.streakDays}</div>
                <div className="text-sm text-gray-600">
                  {dashboardData.todayStats.streakStatus ? '継続中' : '今日がチャンス'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">AI連携</span>
                </div>
                <div className="text-2xl font-bold">
                  {dashboardData.todayStats.aiRecommendationsUsed}
                </div>
                <div className="text-sm text-gray-600">今日の利用回数</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">バッジ</span>
                </div>
                <div className="text-2xl font-bold">{dashboardData.player.badges.length}</div>
                <div className="text-sm text-gray-600">獲得済み</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Rewards */}
          {dashboardData.recentRewards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  最近の報酬
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentRewards.slice(0, 5).map((reward, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-full',
                            reward.type === 'xp' && 'bg-green-100 text-green-600',
                            reward.type === 'badge' && 'bg-yellow-100 text-yellow-600',
                            reward.type === 'level_up' && 'bg-purple-100 text-purple-600',
                            reward.type === 'streak_bonus' && 'bg-orange-100 text-orange-600'
                          )}
                        >
                          {reward.type === 'xp' && <Star className="w-4 h-4" />}
                          {reward.type === 'badge' && <Award className="w-4 h-4" />}
                          {reward.type === 'level_up' && <Crown className="w-4 h-4" />}
                          {reward.type === 'streak_bonus' && <Flame className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{reward.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(reward.timestamp).toLocaleString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={reward.rarity === 'legendary' ? 'default' : 'secondary'}>
                          +{reward.amount}
                        </Badge>
                        {reward.aiEnhanced && (
                          <div className="text-xs text-blue-600 mt-1">AI強化</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Challenges */}
          {dashboardData.activeChallenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  アクティブチャレンジ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.activeChallenges.map((challenge, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{challenge.title}</h4>
                        {challenge.aiGenerated && (
                          <Badge variant="outline" className="text-xs">
                            AI生成
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>進捗</span>
                          <span>
                            {challenge.progress}/{challenge.maxProgress}
                          </span>
                        </div>
                        <Progress value={(challenge.progress / challenge.maxProgress) * 100} />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>報酬: {challenge.xpReward} XP</span>
                          <span>
                            期限: {new Date(challenge.deadline).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                ゲーミフィケーション統合タスク管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Today's Tasks */}
                <div className="grid grid-cols-1 gap-3">
                  {todos
                    .filter((todo) => todo && todo._id && !todo.completed)
                    .slice(0, 5)
                    .map((todo) => (
                      <div
                        key={todo._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => completeTask(todo as Todo)}
                            disabled={isProcessing}
                            aria-label={`タスク「${todo.task}」を完了する`}
                            className="w-5 h-5 border rounded border-gray-300 hover:border-green-500 transition-colors"
                          />
                          <div>
                            <p className="font-medium">{todo.task}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Badge variant="outline">優先度: {todo.priority}</Badge>
                              {todo.tags?.includes('AI生成') && (
                                <Badge variant="secondary" className="text-xs">
                                  AI生成
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            予想XP: {Math.round(todo.priority * 10 + 15)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {completedTodosToday.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 text-green-600">✅ 今日完了したタスク</h4>
                    <div className="space-y-2">
                      {completedTodosToday.slice(0, 3).map((todo) => (
                        <div
                          key={todo._id}
                          className="flex items-center gap-3 p-2 bg-green-50 rounded"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{todo.task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Integration Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI統合ゲーミフィケーション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">AIタスク生成</h4>
                    <p className="text-sm text-gray-600">
                      あなたの状況に最適化されたタスクを自動生成
                    </p>
                  </div>
                  <Button onClick={generateAITasks} className="flex items-center gap-2">
                    <ListPlus className="w-4 h-4" />
                    タスク生成
                  </Button>
                </div>

                {aiTaskRecommendation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium mb-3">🤖 生成されたタスク</h5>
                    <div className="space-y-2 mb-4">
                      {aiTaskRecommendation.tasks.map((task, index) => (
                        <div key={index} className="p-2 bg-white rounded border">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{task.title}</p>
                              <p className="text-xs text-gray-600">{task.description}</p>
                            </div>
                            <div className="text-xs text-right">
                              <div className="text-green-600">
                                +{Math.round(task.estimatedMinutes / 5 + task.priority * 10)} XP
                              </div>
                              <div className="text-gray-500">{task.estimatedMinutes}分</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={addAITasksToTodo} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      すべてのタスクを追加 ({aiTaskRecommendation.tasks.length}個)
                    </Button>
                  </div>
                )}

                {/* AI Insights */}
                {dashboardData.aiInsights.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">AI洞察</h4>
                    {dashboardData.aiInsights.map((insight, index) => (
                      <Alert key={index}>
                        <Lightbulb className="w-4 h-4" />
                        <AlertDescription>
                          <strong>{insight.title}</strong>: {insight.description}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  獲得バッジ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {dashboardData.player.badges.map((badge, index) => (
                    <div key={index} className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="text-xs font-medium">{badge.name}</div>
                      <div className="text-xs text-gray-600">{badge.rarity}</div>
                    </div>
                  ))}
                  {dashboardData.player.badges.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      まだバッジを獲得していません
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  実績
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.player.achievements.map((achievement, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-sm">{achievement.title}</h5>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                        </div>
                        <Badge variant={achievement.isCompleted ? 'default' : 'secondary'}>
                          {achievement.xpReward} XP
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>進捗</span>
                          <span>
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
