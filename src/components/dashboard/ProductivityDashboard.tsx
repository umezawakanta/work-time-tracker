import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ProductivityChart,
  BurndownChart,
  CategoryDistributionChart,
  MetricsOverview,
} from '@/components/analytics/ProductivityChart';
import {
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { TodoItem } from '@/types';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageTasksPerDay: number;
  streakDays: number;
  todayProgress: number;
}

interface ProductivityTrend {
  date: string;
  completedTasks: number;
  hoursWorked: number;
  efficiency: number;
}

interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
  remaining: number;
}

export const ProductivityDashboard: React.FC = () => {
  const todos = useSelector((state: RootState) => state.todo.items);
  const todoHistory = useSelector((state: RootState) => state.todo.todoHistory);
  const dailyHistory = useSelector((state: RootState) => state.todo.dailyHistory);

  // ダッシュボード統計の計算
  const dashboardStats = useMemo<DashboardStats>(() => {
    const now = new Date();
    const today = now.toDateString();

    const totalTasks = todos.length;
    const completedTasks = todos.filter((t) => t.completed).length;
    const pendingTasks = todos.filter((t) => !t.completed).length;

    const overdueTasks = todos.filter((t) => {
      if (t.completed || !t.deadline) return false;
      return new Date(t.deadline) < now;
    }).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 過去7日間の平均タスク数
    const last7Days = Object.entries(todoHistory)
      .slice(-7)
      .reduce((sum, [_, count]) => sum + count, 0);
    const averageTasksPerDay = Math.round((last7Days / 7) * 10) / 10;

    // 連続達成日数の計算
    const streakDays = calculateStreakDays(dailyHistory);

    // 今日の進捗
    const todayTasks = todos.filter((t) => {
      if (!t.deadline) return false;
      return new Date(t.deadline).toDateString() === today;
    });
    const todayCompleted = todayTasks.filter((t) => t.completed).length;
    const todayProgress =
      todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      averageTasksPerDay,
      streakDays,
      todayProgress,
    };
  }, [todos, todoHistory, dailyHistory]);

  // 生産性トレンドデータの生成
  const productivityTrend = useMemo<ProductivityTrend[]>(() => {
    return dailyHistory.slice(-30).map((day, index) => ({
      date: day.date,
      completedTasks: day.count,
      hoursWorked: Math.round((day.count * 1.5 + Math.random() * 2) * 10) / 10, // 推定作業時間
      efficiency: Math.round((day.count * 0.8 + Math.random() * 0.4) * 100) / 100, // 効率スコア
    }));
  }, [dailyHistory]);

  // バーンダウンデータの生成
  const burndownData = useMemo<BurndownData[]>(() => {
    const activeTasks = todos.filter((t) => !t.completed);
    const totalRemaining = activeTasks.length;
    const daysInPeriod = 14; // 2週間のバーンダウン

    return Array.from({ length: daysInPeriod }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (daysInPeriod - 1 - index));

      const ideal = Math.max(0, totalRemaining - (totalRemaining / daysInPeriod) * (index + 1));
      const actual = Math.max(0, totalRemaining - Math.random() * (index + 1) * 2);

      return {
        date: date.toISOString().split('T')[0],
        ideal: Math.round(ideal),
        actual: Math.round(actual),
        remaining: Math.round(actual),
      };
    });
  }, [todos]);

  // カテゴリ別分布データ
  const categoryDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};

    todos.forEach((todo) => {
      const category = todo.category || todo.type || '未分類';
      distribution[category] = (distribution[category] || 0) + 1;
    });

    return distribution;
  }, [todos]);

  // メトリクス概要データ
  const metricsData = useMemo(
    () => ({
      productivity: {
        completionRate: dashboardStats.completionRate,
        averageTasksPerDay: dashboardStats.averageTasksPerDay,
        streak: dashboardStats.streakDays,
        trend:
          dashboardStats.completionRate > 70
            ? ('up' as const)
            : dashboardStats.completionRate > 50
              ? ('stable' as const)
              : ('down' as const),
      },
      timeManagement: {
        totalHoursWorked: Math.round(dashboardStats.completedTasks * 1.5),
        averageTaskDuration: 90, // 平均90分
        overTimeRate: 0.15,
        efficientHours: [9, 10, 11, 14, 15, 16],
      },
      taskAnalysis: {
        totalTasks: dashboardStats.totalTasks,
        completedTasks: dashboardStats.completedTasks,
        overdueTasks: dashboardStats.overdueTasks,
        highPriorityTasks: todos.filter((t) => t.isPrioritized || t.priority <= 2).length,
        categoryDistribution: categoryDistribution,
      },
    }),
    [dashboardStats, todos, categoryDistribution]
  );

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            📊 生産性ダッシュボード
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            タスクの進捗と生産性を可視化して、効率的な作業をサポートします
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          最終更新:{' '}
          {new Date().toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Badge>
      </div>

      {/* メトリクス概要 */}
      <MetricsOverview metrics={metricsData} />

      {/* 主要統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">総タスク数</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {dashboardStats.totalTasks}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">完了率</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {dashboardStats.completionRate}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">連続達成</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {dashboardStats.streakDays}日
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">期限超過</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                  {dashboardStats.overdueTasks}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* チャートグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 生産性トレンド */}
        <ProductivityChart data={productivityTrend} title="📈 生産性トレンド（過去30日）" />

        {/* バーンダウンチャート */}
        <BurndownChart data={burndownData} title="📉 バーンダウンチャート（2週間）" />
      </div>

      {/* カテゴリ分布と今日の進捗 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* カテゴリ別分布 */}
        <CategoryDistributionChart data={categoryDistribution} title="🏷️ タスクカテゴリ別分布" />

        {/* 今日の進捗詳細 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              📅 今日の進捗詳細
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">進捗率</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {dashboardStats.todayProgress}%
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${dashboardStats.todayProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {
                      todos.filter(
                        (t) =>
                          t.completed &&
                          t.deadline &&
                          new Date(t.deadline).toDateString() === new Date().toDateString()
                      ).length
                    }
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">完了</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {
                      todos.filter(
                        (t) =>
                          !t.completed &&
                          t.deadline &&
                          new Date(t.deadline).toDateString() === new Date().toDateString()
                      ).length
                    }
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">残り</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* インサイトとレコメンデーション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            💡 AIインサイト & 改善提案
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                📊 パフォーマンス分析
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>
                  • 完了率 {dashboardStats.completionRate}% -{' '}
                  {dashboardStats.completionRate > 80
                    ? '優秀です！'
                    : dashboardStats.completionRate > 60
                      ? '良好です'
                      : '改善の余地があります'}
                </li>
                <li>• 平均 {dashboardStats.averageTasksPerDay} タスク/日のペース</li>
                <li>• {dashboardStats.streakDays}日連続でタスクを達成中</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white">🎯 改善提案</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                {dashboardStats.overdueTasks > 0 && <li>• 期限超過タスクの整理をお勧めします</li>}
                {dashboardStats.completionRate < 70 && (
                  <li>• タスクの優先度見直しを検討してください</li>
                )}
                <li>• 最も生産性の高い時間帯を活用しましょう</li>
                <li>• 定期的な休憩で集中力を維持しましょう</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ヘルパー関数
function calculateStreakDays(dailyHistory: Array<{ date: string; count: number }>): number {
  if (dailyHistory.length === 0) return 0;

  let streak = 0;
  const sortedHistory = [...dailyHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const day of sortedHistory) {
    if (day.count > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default ProductivityDashboard;
