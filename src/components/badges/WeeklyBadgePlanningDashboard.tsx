import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import { expandedBadgeService } from '@/services/badges/ExpandedBadgeService';

interface WeeklyPlan {
  weekStartDate: string;
  weekEndDate: string;
  targetBadges: Array<{
    id: string;
    name: string;
    category: string;
    progress: number;
    difficulty: string;
    estimatedHours: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  focusAreas: string[];
  estimatedHours: number;
  weeklyTarget: number;
}

interface DailyGoal {
  date: string;
  badgeId: string;
  badgeName: string;
  targetProgress: number;
  actualProgress: number;
  completed: boolean;
  timeSpent: number;
}

export const WeeklyBadgePlanningDashboard: React.FC = () => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateWeeklyPlan();
  }, []);

  /**
   * 🗓️ 週次計画生成
   */
  const generateWeeklyPlan = async () => {
    setLoading(true);
    try {
      const goals = expandedBadgeService.generateWeeklyGoals();
      const startDate = getWeekStartDate();
      const endDate = getWeekEndDate(startDate);

      const plan: WeeklyPlan = {
        weekStartDate: startDate.toISOString(),
        weekEndDate: endDate.toISOString(),
        targetBadges: goals.targetBadges.map((badge) => ({
          id: badge.id,
          name: badge.name,
          category: badge.category,
          progress: badge.progress,
          difficulty: badge.difficulty,
          estimatedHours: calculateBadgeHours(badge.difficulty, badge.progress),
          priority: calculatePriority(badge.progress, badge.difficulty),
        })),
        focusAreas: goals.focusAreas,
        estimatedHours: goals.estimatedHours,
        weeklyTarget: goals.weeklyTarget,
      };

      setWeeklyPlan(plan);
      generateDailyGoals(plan);
    } catch (error) {
      console.error('週次計画生成エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📅 日次目標生成
   */
  const generateDailyGoals = (plan: WeeklyPlan) => {
    const goals: DailyGoal[] = [];
    const workDays = 5; // 平日のみ

    plan.targetBadges.forEach((badge) => {
      for (let day = 0; day < workDays; day++) {
        const date = new Date(plan.weekStartDate);
        date.setDate(date.getDate() + day);

        const dailyProgress = Math.min(20, (100 - badge.progress) / workDays);

        goals.push({
          date: date.toISOString(),
          badgeId: badge.id,
          badgeName: badge.name,
          targetProgress: dailyProgress,
          actualProgress: Math.random() * dailyProgress * 1.2, // シミュレート
          completed: Math.random() > 0.7,
          timeSpent: Math.random() * 3 + 1,
        });
      }
    });

    setDailyGoals(goals);
  };

  /**
   * 📊 進捗計算ヘルパー関数
   */
  const calculateBadgeHours = (difficulty: string, progress: number): number => {
    const baseHours =
      {
        bronze: 5,
        silver: 10,
        gold: 15,
        platinum: 25,
        legendary: 40,
      }[difficulty] || 10;

    return Math.round(baseHours * (1 - progress / 100));
  };

  const calculatePriority = (progress: number, difficulty: string): 'high' | 'medium' | 'low' => {
    if (progress > 70 || difficulty === 'bronze') return 'high';
    if (progress > 40 || difficulty === 'silver') return 'medium';
    return 'low';
  };

  const getWeekStartDate = (): Date => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return startOfWeek;
  };

  const getWeekEndDate = (startDate: Date): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return endDate;
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      case 'legendary':
        return '👑';
      default:
        return '⭐';
    }
  };

  const getWeeklyStats = () => {
    if (!weeklyPlan) return null;

    const totalProgress = dailyGoals.reduce((sum, goal) => sum + goal.actualProgress, 0);
    const totalTimeSpent = dailyGoals.reduce((sum, goal) => sum + goal.timeSpent, 0);
    const completedGoals = dailyGoals.filter((goal) => goal.completed).length;
    const completionRate = dailyGoals.length > 0 ? (completedGoals / dailyGoals.length) * 100 : 0;

    return {
      totalProgress: Math.round(totalProgress),
      totalTimeSpent: Math.round(totalTimeSpent),
      completedGoals,
      completionRate: Math.round(completionRate),
      estimatedCompletionDate: calculateEstimatedCompletion(),
    };
  };

  const calculateEstimatedCompletion = (): string => {
    if (!weeklyPlan) return '';

    const avgProgressPerDay =
      dailyGoals.length > 0
        ? dailyGoals.reduce((sum, goal) => sum + goal.actualProgress, 0) / dailyGoals.length
        : 5;

    const remainingProgress = weeklyPlan.targetBadges.reduce(
      (sum, badge) => sum + (100 - badge.progress),
      0
    );

    const daysToCompletion = Math.ceil(remainingProgress / avgProgressPerDay);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToCompletion);

    return completionDate.toLocaleDateString('ja-JP');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">週次計画を生成中...</span>
      </div>
    );
  }

  if (!weeklyPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">計画を生成できませんでした</h3>
        <Button onClick={generateWeeklyPlan}>再試行</Button>
      </div>
    );
  }

  const stats = getWeeklyStats();

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🗓️ 週次バッジ完了予測</h1>
          <p className="text-gray-600 mt-2">
            {formatDate(weeklyPlan.weekStartDate)} ～ {formatDate(weeklyPlan.weekEndDate)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={generateWeeklyPlan} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            計画更新
          </Button>
        </div>
      </div>

      {/* 週次統計 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総進捗</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">作業時間</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalTimeSpent}h</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">完了率</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">目標バッジ</p>
                  <p className="text-2xl font-bold text-orange-600">{weeklyPlan.weeklyTarget}</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">完了予定</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {stats.estimatedCompletionDate}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* メインコンテンツ */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="daily">日次計画</TabsTrigger>
          <TabsTrigger value="badges">バッジ詳細</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 今週の目標 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  今週の目標
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>バッジ完了目標:</span>
                    <Badge variant="outline">{weeklyPlan.weeklyTarget}個</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>予想作業時間:</span>
                    <Badge variant="outline">{weeklyPlan.estimatedHours}時間</Badge>
                  </div>
                  <div>
                    <span className="block mb-2">重点分野:</span>
                    <div className="flex flex-wrap gap-2">
                      {weeklyPlan.focusAreas.map((area, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 進捗サマリー */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  進捗サマリー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyPlan.targetBadges.slice(0, 3).map((badge) => (
                    <div key={badge.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{badge.name}</span>
                        <span className="text-sm text-gray-600">{badge.progress}%</span>
                      </div>
                      <Progress value={badge.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 推奨アクション */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                今週の推奨アクション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expandedBadgeService.getWeeklyRecommendations().map((recommendation, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 日次計画タブ */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                日次進捗計画
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Set(dailyGoals.map((goal) => goal.date))).map((date) => {
                  const dayGoals = dailyGoals.filter((goal) => goal.date === date);
                  const dayProgress = dayGoals.reduce((sum, goal) => sum + goal.actualProgress, 0);
                  const dayTarget = dayGoals.reduce((sum, goal) => sum + goal.targetProgress, 0);

                  return (
                    <div key={date} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{formatDate(date)}</h3>
                        <Badge
                          className={
                            dayProgress >= dayTarget
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {Math.round(dayProgress)}/{Math.round(dayTarget)}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {dayGoals.map((goal, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm">{goal.badgeName}</span>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={(goal.actualProgress / goal.targetProgress) * 100}
                                className="w-20 h-2"
                              />
                              <span className="text-xs text-gray-600">
                                {Math.round(goal.actualProgress)}%
                              </span>
                              {goal.completed && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* バッジ詳細タブ */}
        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyPlan.targetBadges.map((badge) => (
              <Card key={badge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>{getDifficultyIcon(badge.difficulty)}</span>
                      <span className="text-sm">{badge.name}</span>
                    </span>
                    <Badge className={getPriorityColor(badge.priority)}>{badge.priority}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">進捗</span>
                        <span className="text-sm font-medium">{badge.progress}%</span>
                      </div>
                      <Progress value={badge.progress} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">カテゴリ:</span>
                      <Badge variant="outline">{badge.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">予想時間:</span>
                      <span>{badge.estimatedHours}時間</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 分析タブ */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* トレンド分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  進捗トレンド
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    📊 トレンドチャートは実装予定
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* パフォーマンス分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  パフォーマンス分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>平均日次進捗:</span>
                    <span className="font-semibold">
                      {stats ? Math.round(stats.totalProgress / 7) : 0}%/日
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>効率性指数:</span>
                    <span className="font-semibold">
                      {stats ? Math.round((stats.totalProgress / stats.totalTimeSpent) * 10) : 0}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>目標達成可能性:</span>
                    <Badge
                      className={
                        stats && stats.completionRate > 70
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {stats && stats.completionRate > 70 ? '高' : '中'}
                    </Badge>
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

export default WeeklyBadgePlanningDashboard;
