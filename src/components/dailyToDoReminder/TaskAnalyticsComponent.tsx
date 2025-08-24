import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart4, Calendar, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TodoStats } from '@/types/todo';

// 分析タブの種類
type AnalyticsTab = 'overview' | 'productivity' | 'trends' | 'insights';

interface TaskAnalyticsProps {
  stats: TodoStats;
  dateRange: 'day' | 'week' | 'month' | 'year';
  setDateRange: (range: 'day' | 'week' | 'month' | 'year') => void;
  isPremium: boolean;
}

/**
 * タスク分析ダッシュボードコンポーネント
 * プレミアムユーザー向けの詳細な統計と分析を提供
 */
export const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({
  stats,
  dateRange,
  setDateRange,
  isPremium,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [productivityScore, setProductivityScore] = useState<number>(0);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [productivityTips, setProductivityTips] = useState<string[]>([]);

  // 生産性スコアの計算
  useEffect(() => {
    const calculateScore = () => {
      // 基本的な完了率（0-50点）
      const completionScore = Math.min(stats.completionRate, 100) * 0.5;

      // 期限遵守率（0-30点）
      const deadlineScore = stats.deadlineMeetRate * 0.3;

      // 連続達成ボーナス（0-20点）
      const streakBonus = Math.min(stats.streakDays, 10) * 2;

      // 合計スコア（0-100点）
      return Math.min(Math.round(completionScore + deadlineScore + streakBonus), 100);
    };

    // アニメーション付きでスコアを表示
    const targetScore = calculateScore();
    let currentScore = 0;

    const interval = setInterval(() => {
      currentScore += 2;
      setProductivityScore(Math.min(currentScore, targetScore));

      if (currentScore >= targetScore) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [stats]);

  // 生産性向上のヒントを取得
  useEffect(() => {
    if (activeTab === 'insights' && isPremium) {
      setLoadingInsights(true);

      // 実際の実装ではAPIからデータを取得
      setTimeout(() => {
        const tips = [
          '完了率が最も高い曜日は水曜日です。重要なタスクをこの日に設定してみましょう。',
          `平均タスク完了時間は${
            stats.averageCompletionTime < 60
              ? `${stats.averageCompletionTime}分`
              : `${(stats.averageCompletionTime / 60).toFixed(1)}時間`
          }です。時間見積もりを改善しましょう。`,
          '期限切れになったタスクの80%は見積もり時間が過小評価されています。',
          '短時間のフォーカスセッションを増やすことで完了率が15%向上する可能性があります。',
          'タスクをより小さな単位に分割すると完了率が向上します。',
        ];

        setProductivityTips(tips);
        setLoadingInsights(false);
      }, 1000);
    }
  }, [activeTab, isPremium, stats.averageCompletionTime]);

  // パフォーマンススコアの色を取得
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-gray-600';
  };

  // スコアのラベルを取得
  const getScoreLabel = (score: number) => {
    if (score >= 80) return '優秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '平均的';
    return '改善の余地あり';
  };

  return (
    <div className="space-y-4">
      {/* 分析期間の選択 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">タスク分析ダッシュボード</h3>

        <div className="flex">
          <TabsList className="bg-muted">
            <TabsTrigger
              value="day"
              className="text-xs py-1 px-2"
              onClick={() => setDateRange('day')}
              data-active={dateRange === 'day'}
            >
              今日
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="text-xs py-1 px-2"
              onClick={() => setDateRange('week')}
              data-active={dateRange === 'week'}
            >
              今週
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="text-xs py-1 px-2"
              onClick={() => setDateRange('month')}
              data-active={dateRange === 'month'}
            >
              今月
            </TabsTrigger>
            <TabsTrigger
              value="year"
              className="text-xs py-1 px-2"
              onClick={() => setDateRange('year')}
              data-active={dateRange === 'year'}
            >
              今年
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* 分析タブ */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AnalyticsTab)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="productivity">生産性</TabsTrigger>
          <TabsTrigger value="trends">傾向</TabsTrigger>
          <TabsTrigger value="insights" disabled={!isPremium}>
            インサイト
            {!isPremium && <span className="ml-1 text-xs">🔒</span>}
          </TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 完了率カード */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">完了率</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <Progress value={stats.completionRate} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  全{stats.totalTasks}タスク中{stats.completedTasks}タスク完了
                </p>
              </CardContent>
            </Card>

            {/* 期限遵守率カード */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">期限遵守率</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold">{stats.deadlineMeetRate}%</div>
                <Progress value={stats.deadlineMeetRate} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  期限内: {stats.tasksCompletedBeforeDeadline}タスク / 期限超過:{' '}
                  {stats.tasksCompletedAfterDeadline}タスク
                </p>
              </CardContent>
            </Card>

            {/* 生産性スコアカード */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">生産性スコア</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className={`text-2xl font-bold ${getScoreColor(productivityScore)}`}>
                  {productivityScore}/100
                </div>
                <Progress value={productivityScore} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  評価: {getScoreLabel(productivityScore)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">達成記録</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm">現在の連続達成日数</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.streakDays}日</p>
                </div>

                <Separator orientation="vertical" className="h-10 mx-4" />

                <div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">最長連続記録</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.longestStreak}日</p>
                </div>

                <Separator orientation="vertical" className="h-10 mx-4" />

                <div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-sm">平均完了時間</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {stats.averageCompletionTime < 60
                      ? `${stats.averageCompletionTime}分`
                      : `${(stats.averageCompletionTime / 60).toFixed(1)}時間`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 生産性タブ */}
        <TabsContent value="productivity">
          <Card>
            <CardHeader>
              <CardTitle>生産性分析</CardTitle>
              <CardDescription>タスク完了パターンと効率性の分析</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                このセクションでは、あなたのタスク完了パターンと効率性を分析します。
              </p>
              <p className="text-sm mt-2">実装中の機能です。今後のアップデートをお待ちください。</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 傾向タブ */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>タスク完了の傾向</CardTitle>
              <CardDescription>時間経過に伴うタスク完了の傾向を表示</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                このセクションでは、時間経過に伴うタスク完了の傾向を表示します。
              </p>
              <p className="text-sm mt-2">実装中の機能です。今後のアップデートをお待ちください。</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* インサイトタブ（プレミアム限定） */}
        <TabsContent value="insights">
          {isPremium ? (
            <Card>
              <CardHeader>
                <CardTitle>生産性向上のインサイト</CardTitle>
                <CardDescription>あなたのタスク管理パターンから導かれた洞察</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingInsights ? (
                  <div className="py-4 flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent animate-spin"></div>
                    <p className="text-sm mt-2">インサイトを分析中...</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {productivityTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  詳細なレポートを生成
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>プレミアム限定機能</CardTitle>
                <CardDescription>タスク管理の効率を向上させるインサイト</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <div className="mx-auto bg-muted rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart4 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">AIパワードインサイト</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  プレミアムプランにアップグレードして、タスク管理パターンに基づいたパーソナライズされたインサイトを取得しましょう。
                </p>
                <Button>プレミアムにアップグレード</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
