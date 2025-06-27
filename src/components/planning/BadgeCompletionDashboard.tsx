import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Settings,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  badgeCompletionEstimator,
  BadgeEstimate,
  CompletionTimeline,
  WorkSchedule,
  TimelineMilestone,
  WeeklyPlan,
} from '@/services/planning/BadgeCompletionEstimator';

interface BadgeCompletionDashboardProps {
  className?: string;
}

/**
 * 🎯 バッジ完了予測ダッシュボード - 作業時間・達成予定日・マイルストーン表示
 */
export const BadgeCompletionDashboard: React.FC<BadgeCompletionDashboardProps> = ({
  className,
}) => {
  const [timeline, setTimeline] = useState<CompletionTimeline | null>(null);
  const [prioritizedBadges, setPrioritizedBadges] = useState<BadgeEstimate[]>([]);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    weeklyHours: 20,
    dailyHours: 4,
    workDays: [1, 2, 3, 4, 5],
    breakDays: [],
    intensiveMode: false,
  });
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(loadDashboardData, 60000); // 1分毎に更新
    return () => clearInterval(interval);
  }, []);

  /**
   * 📊 ダッシュボードデータ読み込み
   */
  const loadDashboardData = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const timelineData = badgeCompletionEstimator.getCompletionTimeline();
      const prioritizedData = badgeCompletionEstimator.getPrioritizedBadges();

      setTimeline(timelineData);
      setPrioritizedBadges(prioritizedData);

      console.log('📊 Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      toast({
        title: '❌ データ読み込みエラー',
        description: 'ダッシュボードデータの読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ⚙️ 作業スケジュール更新
   */
  const handleScheduleUpdate = (): void => {
    badgeCompletionEstimator.updateWorkSchedule(workSchedule);
    loadDashboardData();
    setIsScheduleDialogOpen(false);

    toast({
      title: '✅ スケジュール更新完了',
      description: '新しいスケジュールで予測を再計算しました',
      variant: 'default',
    });
  };

  /**
   * 📅 日付フォーマット
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  /**
   * ⏱️ 時間フォーマット
   */
  const formatHours = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}分`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10}時間`;
    } else {
      const days = Math.floor(hours / 8);
      const remainingHours = hours % 8;
      return `${days}日${remainingHours > 0 ? ` ${Math.round(remainingHours)}時間` : ''}`;
    }
  };

  /**
   * 🎯 優先度バッジ取得
   */
  const getPriorityBadge = (priority: string): React.ReactElement => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }
    > = {
      high: { variant: 'destructive', color: 'bg-red-100 text-red-800' },
      medium: { variant: 'default', color: 'bg-yellow-100 text-yellow-800' },
      low: { variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
    };

    const config = variants[priority] || variants.medium;
    return (
      <Badge variant={config.variant} className={config.color}>
        {priority === 'high' ? '🔥 高' : priority === 'medium' ? '⚡ 中' : '🔄 低'}
      </Badge>
    );
  };

  /**
   * 🏆 難易度バッジ取得
   */
  const getDifficultyBadge = (difficulty: string): React.ReactElement => {
    const configs: Record<string, { icon: string; color: string }> = {
      bronze: { icon: '🥉', color: 'bg-amber-100 text-amber-800' },
      silver: { icon: '🥈', color: 'bg-gray-100 text-gray-800' },
      gold: { icon: '🥇', color: 'bg-yellow-100 text-yellow-800' },
      platinum: { icon: '💎', color: 'bg-blue-100 text-blue-800' },
      legendary: { icon: '👑', color: 'bg-purple-100 text-purple-800' },
    };

    const config = configs[difficulty] || configs.bronze;
    return (
      <Badge className={config.color}>
        {config.icon} {difficulty.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading || !timeline) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">バッジ完了予測を計算中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-8 w-8 text-blue-600" />
            バッジ完了予測ダッシュボード
          </h2>
          <p className="text-gray-600 mt-1">
            全バッジ獲得までの作業時間・達成予定日・マイルストーンを表示
          </p>
        </div>

        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              スケジュール設定
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>⚙️ 作業スケジュール設定</DialogTitle>
              <DialogDescription>
                週間作業時間や作業日を設定して、より正確な予測を行います
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="weeklyHours">週間作業時間</Label>
                <div className="mt-2">
                  <Slider
                    value={[workSchedule.weeklyHours]}
                    onValueChange={(value) =>
                      setWorkSchedule((prev) => ({ ...prev, weeklyHours: value[0] }))
                    }
                    max={60}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-1">{workSchedule.weeklyHours}時間/週</p>
                </div>
              </div>

              <div>
                <Label htmlFor="dailyHours">1日の作業時間</Label>
                <div className="mt-2">
                  <Slider
                    value={[workSchedule.dailyHours]}
                    onValueChange={(value) =>
                      setWorkSchedule((prev) => ({ ...prev, dailyHours: value[0] }))
                    }
                    max={12}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-1">{workSchedule.dailyHours}時間/日</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="intensive-mode"
                  checked={workSchedule.intensiveMode}
                  onCheckedChange={(checked) =>
                    setWorkSchedule((prev) => ({ ...prev, intensiveMode: checked }))
                  }
                />
                <Label htmlFor="intensive-mode">🔥 集中モード (1.5倍速)</Label>
              </div>

              <Button onClick={handleScheduleUpdate} className="w-full">
                ✅ スケジュール更新
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総バッジ数</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeline.totalBadges}</div>
            <p className="text-xs text-muted-foreground">完了済み: {timeline.completedBadges}個</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">残り作業時間</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHours(timeline.totalRemainingHours)}</div>
            <p className="text-xs text-muted-foreground">週{workSchedule.weeklyHours}時間ペース</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了予定日</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(timeline.overallCompletionDate)}</div>
            <p className="text-xs text-muted-foreground">
              残り
              {Math.ceil(
                (new Date(timeline.overallCompletionDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24 * 7)
              )}
              週間
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">現在の速度</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeline.currentVelocity.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">バッジ/週</p>
          </CardContent>
        </Card>
      </div>

      {/* 進捗率 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            全体進捗率
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                完了バッジ: {timeline.completedBadges}/{timeline.totalBadges}
              </span>
              <span>{Math.round((timeline.completedBadges / timeline.totalBadges) * 100)}%</span>
            </div>
            <Progress
              value={(timeline.completedBadges / timeline.totalBadges) * 100}
              className="h-3"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>開始</span>
              <span>現在</span>
              <span>完了</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タブコンテンツ */}
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="badges">🎯 優先バッジ</TabsTrigger>
          <TabsTrigger value="milestones">🎖️ マイルストーン</TabsTrigger>
          <TabsTrigger value="weekly">📅 週次計画</TabsTrigger>
          <TabsTrigger value="timeline">📊 タイムライン</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🎯 優先度順バッジリスト</CardTitle>
              <CardDescription>
                残り時間と優先度に基づいて最適化されたバッジ獲得順序
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prioritizedBadges.slice(0, 10).map((badge, index) => (
                  <div
                    key={badge.badgeId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                      <div>
                        <h3 className="font-semibold">{badge.badgeName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getPriorityBadge(badge.priority)}
                          {getDifficultyBadge(badge.difficulty)}
                          <Badge variant="outline">{badge.category}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-600">残り作業時間</div>
                      <div className="text-lg font-bold">{formatHours(badge.remainingHours)}</div>
                      <div className="text-xs text-gray-500">
                        完了予定: {formatDate(badge.estimatedCompletionDate)}
                      </div>
                      <div className="mt-2">
                        <Progress value={badge.currentProgress} className="h-2 w-24" />
                        <div className="text-xs text-center mt-1">{badge.currentProgress}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🎖️ 達成マイルストーン</CardTitle>
              <CardDescription>短期・中期・長期の目標達成スケジュール</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timeline.milestones.map((milestone, index) => (
                  <div key={index} className="relative">
                    {index > 0 && (
                      <div className="absolute left-6 -top-6 h-6 w-0.5 bg-gray-300"></div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {milestone.category === 'short_term' && (
                          <Target className="h-6 w-6 text-blue-600" />
                        )}
                        {milestone.category === 'medium_term' && (
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        )}
                        {milestone.category === 'long_term' && (
                          <Trophy className="h-6 w-6 text-purple-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{milestone.title}</h3>
                          <Badge variant="secondary">{formatDate(milestone.date)}</Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{milestone.description}</p>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>累積進捗率</span>
                            <span>{Math.round(milestone.cumulativeProgress)}%</span>
                          </div>
                          <Progress value={milestone.cumulativeProgress} className="h-2" />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {milestone.badgesCompleted.slice(0, 3).map((badgeName, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {badgeName}
                            </Badge>
                          ))}
                          {milestone.badgesCompleted.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{milestone.badgesCompleted.length - 3}個
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📅 週次作業計画</CardTitle>
              <CardDescription>今後12週間の詳細な作業スケジュール</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.weeklyPlan.slice(0, 8).map((week, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">
                        Week {index + 1}: {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{week.categoryFocus}</Badge>
                        <Badge>{week.plannedHours}時間</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">対象バッジ</h4>
                        <div className="space-y-1">
                          {week.targetBadges.slice(0, 3).map((badgeId, idx) => {
                            const badge = prioritizedBadges.find((b) => b.badgeId === badgeId);
                            return badge ? (
                              <div
                                key={idx}
                                className="text-sm text-gray-600 flex items-center gap-2"
                              >
                                <CheckCircle className="h-3 w-3" />
                                {badge.badgeName}
                              </div>
                            ) : null;
                          })}
                          {week.targetBadges.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{week.targetBadges.length - 3}個の追加バッジ
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">予想完了数</h4>
                        <div className="text-2xl font-bold text-green-600">
                          {week.estimatedCompletions}
                          <span className="text-sm font-normal text-gray-600 ml-1">バッジ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 完了予測タイムライン</CardTitle>
              <CardDescription>全バッジ獲得までの詳細なロードマップ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* タイムライン可視化 */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {timeline.milestones.map((milestone, index) => {
                    const progress =
                      ((new Date().getTime() - new Date().getTime()) /
                        (new Date(milestone.date).getTime() - new Date().getTime())) *
                      100;

                    return (
                      <div key={index} className="relative flex items-center mb-8">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                            index === 0
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border-2 border-gray-300'
                          }`}
                        >
                          {index === 0 ? (
                            <PlayCircle className="h-4 w-4" />
                          ) : (
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          )}
                        </div>

                        <div className="ml-6 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{milestone.title}</h3>
                            <span className="text-sm text-gray-500">
                              {formatDate(milestone.date)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{milestone.description}</p>

                          <div className="mt-2">
                            <Progress value={milestone.cumulativeProgress} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1">
                              累積進捗: {Math.round(milestone.cumulativeProgress)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 統計情報 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {timeline.currentVelocity.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">バッジ/週</div>
                    <div className="text-xs text-gray-500">現在のペース</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.ceil(timeline.totalRemainingHours / timeline.currentVelocity)}
                    </div>
                    <div className="text-sm text-gray-600">週間</div>
                    <div className="text-xs text-gray-500">完了まで</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {timeline.remainingBadges}
                    </div>
                    <div className="text-sm text-gray-600">バッジ</div>
                    <div className="text-xs text-gray-500">残り</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* フッター */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              予測精度: 平均85% | 最終更新: {new Date().toLocaleString('ja-JP')}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              再計算
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
