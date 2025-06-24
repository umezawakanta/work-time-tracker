import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Calendar,
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Trophy,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { RootState } from '@/store';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, subWeeks } from 'date-fns';
import { ja } from 'date-fns/locale';

// Chart.js登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  estimatedTime?: number; // 分
  actualTime?: number; // 分
  tags: string[];
}

interface AnalyticsMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number; // 日数
  productivityScore: number;
  categoryStats: Array<{
    category: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
  priorityStats: Array<{
    priority: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
  weeklyTrend: Array<{
    week: string;
    completed: number;
    created: number;
  }>;
  dailyProductivity: Array<{
    date: string;
    completed: number;
    timeSpent: number; // 分
  }>;
}

export const TodoAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);

  // Redux storeからTODOデータを取得（実際のプロジェクトではここから取得）
  const todos = useSelector((state: RootState) => state.todo?.items || []);

  // デモデータ生成（実際の実装では実際のTODOデータを使用）
  const generateDemoTodos = (): TodoItem[] => {
    const categories = ['開発', 'デザイン', 'テスト', 'ドキュメント', 'レビュー', 'リサーチ'];
    const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = [
      'low',
      'medium',
      'high',
      'urgent',
    ];
    const statuses: Array<'pending' | 'in-progress' | 'completed' | 'cancelled'> = [
      'pending',
      'in-progress',
      'completed',
      'cancelled',
    ];

    return Array.from({ length: 150 }, (_, index) => {
      const createdAt = subDays(new Date(), Math.floor(Math.random() * 90));
      const isCompleted = Math.random() > 0.3; // 70%完了率
      const completedAt = isCompleted
        ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
        : undefined;

      return {
        id: `todo-${index}`,
        title: `タスク ${index + 1}`,
        description: `詳細な説明 ${index + 1}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: isCompleted ? 'completed' : statuses[Math.floor(Math.random() * 3)],
        createdAt: createdAt.toISOString(),
        completedAt: completedAt?.toISOString(),
        estimatedTime: 30 + Math.floor(Math.random() * 120), // 30-150分
        actualTime: isCompleted ? 20 + Math.floor(Math.random() * 180) : undefined, // 20-200分
        tags: [`tag-${Math.floor(Math.random() * 10)}`],
      };
    });
  };

  const demoTodos = useMemo(() => generateDemoTodos(), []);

  // 分析データの計算
  const analytics: AnalyticsMetrics = useMemo(() => {
    const now = new Date();
    let filteredTodos = demoTodos;

    // 時間範囲でフィルタ
    const daysBack = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    }[timeRange];

    const startDate = subDays(now, daysBack);
    filteredTodos = demoTodos.filter((todo) => new Date(todo.createdAt) >= startDate);

    const totalTasks = filteredTodos.length;
    const completedTasks = filteredTodos.filter((todo) => todo.status === 'completed').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 平均完了時間（日数）
    const completedWithTime = filteredTodos.filter((todo) => todo.completedAt);
    const averageCompletionTime =
      completedWithTime.length > 0
        ? completedWithTime.reduce((acc, todo) => {
            const created = new Date(todo.createdAt);
            const completed = new Date(todo.completedAt!);
            return acc + (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / completedWithTime.length
        : 0;

    // 生産性スコア（完了率 + 時間効率）
    const timeEfficiency =
      completedWithTime.length > 0
        ? completedWithTime.reduce((acc, todo) => {
            if (todo.estimatedTime && todo.actualTime) {
              return acc + Math.min(todo.estimatedTime / todo.actualTime, 2); // 最大2倍効率
            }
            return acc + 1;
          }, 0) / completedWithTime.length
        : 1;

    const productivityScore = Math.round((completionRate + timeEfficiency * 50) / 2);

    // カテゴリ別統計
    const categoryStats = Array.from(new Set(filteredTodos.map((todo) => todo.category)))
      .map((category) => {
        const categoryTodos = filteredTodos.filter((todo) => todo.category === category);
        const completed = categoryTodos.filter((todo) => todo.status === 'completed').length;
        return {
          category,
          total: categoryTodos.length,
          completed,
          completionRate: categoryTodos.length > 0 ? (completed / categoryTodos.length) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    // 優先度別統計
    const priorityStats = ['urgent', 'high', 'medium', 'low'].map((priority) => {
      const priorityTodos = filteredTodos.filter((todo) => todo.priority === priority);
      const completed = priorityTodos.filter((todo) => todo.status === 'completed').length;
      return {
        priority,
        total: priorityTodos.length,
        completed,
        completionRate: priorityTodos.length > 0 ? (completed / priorityTodos.length) * 100 : 0,
      };
    });

    // 週別トレンド
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(now, i), { locale: ja });
      const weekEnd = endOfWeek(weekStart, { locale: ja });

      const weekTodos = demoTodos.filter((todo) => {
        const todoDate = new Date(todo.createdAt);
        return todoDate >= weekStart && todoDate <= weekEnd;
      });

      const completed = weekTodos.filter(
        (todo) =>
          todo.completedAt &&
          new Date(todo.completedAt) >= weekStart &&
          new Date(todo.completedAt) <= weekEnd
      ).length;

      return {
        week: format(weekStart, 'M/d', { locale: ja }),
        completed,
        created: weekTodos.length,
      };
    }).reverse();

    // 日別生産性（過去14日）
    const dailyProductivity = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(now, i);
      const dayTodos = filteredTodos.filter((todo) => {
        if (!todo.completedAt) return false;
        const completedDate = new Date(todo.completedAt);
        return format(completedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      return {
        date: format(date, 'M/d', { locale: ja }),
        completed: dayTodos.length,
        timeSpent: dayTodos.reduce((acc, todo) => acc + (todo.actualTime || 0), 0),
      };
    }).reverse();

    return {
      totalTasks,
      completedTasks,
      completionRate,
      averageCompletionTime,
      productivityScore,
      categoryStats,
      priorityStats,
      weeklyTrend: weeks,
      dailyProductivity,
    };
  }, [demoTodos, timeRange]);

  const refreshData = async () => {
    setIsLoading(true);
    // 実際のAPIコールをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  // チャートオプション
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            TODO分析ダッシュボード
          </h1>
          <p className="text-gray-600 mt-2">タスクの完了状況と生産性を詳細に分析</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="border rounded-md px-3 py-1"
            >
              <option value="week">過去1週間</option>
              <option value="month">過去1ヶ月</option>
              <option value="quarter">過去3ヶ月</option>
              <option value="year">過去1年</option>
            </select>
          </div>
          <Button onClick={refreshData} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            更新
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総タスク数</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === 'week'
                ? '過去1週間'
                : timeRange === 'month'
                  ? '過去1ヶ月'
                  : timeRange === 'quarter'
                    ? '過去3ヶ月'
                    : '過去1年'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了率</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均完了時間</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageCompletionTime.toFixed(1)}日</div>
            <p className="text-xs text-muted-foreground">タスク作成から完了まで</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生産性スコア</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.productivityScore}</div>
            <Badge
              variant={
                analytics.productivityScore >= 80
                  ? 'default'
                  : analytics.productivityScore >= 60
                    ? 'secondary'
                    : 'destructive'
              }
              className="mt-2"
            >
              {analytics.productivityScore >= 80
                ? '優秀'
                : analytics.productivityScore >= 60
                  ? '良好'
                  : '要改善'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* 詳細分析タブ */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">トレンド分析</TabsTrigger>
          <TabsTrigger value="categories">カテゴリ別</TabsTrigger>
          <TabsTrigger value="priority">優先度別</TabsTrigger>
          <TabsTrigger value="productivity">生産性</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  週別完了トレンド
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Line
                  data={{
                    labels: analytics.weeklyTrend.map((w) => w.week),
                    datasets: [
                      {
                        label: '完了数',
                        data: analytics.weeklyTrend.map((w) => w.completed),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                      },
                      {
                        label: '作成数',
                        data: analytics.weeklyTrend.map((w) => w.created),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  日別生産性
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Bar
                  data={{
                    labels: analytics.dailyProductivity.map((d) => d.date),
                    datasets: [
                      {
                        label: '完了タスク数',
                        data: analytics.dailyProductivity.map((d) => d.completed),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>カテゴリ別完了率</CardTitle>
              </CardHeader>
              <CardContent>
                <Pie
                  data={{
                    labels: analytics.categoryStats.map((c) => c.category),
                    datasets: [
                      {
                        data: analytics.categoryStats.map((c) => c.completed),
                        backgroundColor: [
                          '#3B82F6',
                          '#10B981',
                          '#F59E0B',
                          '#EF4444',
                          '#8B5CF6',
                          '#06B6D4',
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>カテゴリ詳細</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.categoryStats.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <Badge variant="secondary">
                        {category.completed}/{category.total}
                      </Badge>
                    </div>
                    <Progress value={category.completionRate} className="h-2" />
                    <div className="text-sm text-gray-600">
                      完了率: {category.completionRate.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="priority" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>優先度別完了状況</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar
                data={{
                  labels: analytics.priorityStats.map((p) => {
                    const labels = {
                      urgent: '緊急',
                      high: '高',
                      medium: '中',
                      low: '低',
                    };
                    return labels[p.priority as keyof typeof labels];
                  }),
                  datasets: [
                    {
                      label: '完了数',
                      data: analytics.priorityStats.map((p) => p.completed),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    },
                    {
                      label: '未完了数',
                      data: analytics.priorityStats.map((p) => p.total - p.completed),
                      backgroundColor: 'rgba(156, 163, 175, 0.8)',
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>時間効率性</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center mb-4">
                  {analytics.productivityScore}%
                </div>
                <Progress value={analytics.productivityScore} className="mb-4" />
                <div className="text-sm text-gray-600 text-center">
                  見積もり時間対実績時間の効率性
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>日別作業時間</CardTitle>
              </CardHeader>
              <CardContent>
                <Line
                  data={{
                    labels: analytics.dailyProductivity.slice(-7).map((d) => d.date),
                    datasets: [
                      {
                        label: '作業時間（分）',
                        data: analytics.dailyProductivity.slice(-7).map((d) => d.timeSpent),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value) {
                            return `${value}分`;
                          },
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>改善提案</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">
                    {analytics.completionRate < 70
                      ? '完了率が低めです。タスクの細分化を検討しましょう'
                      : '良好な完了率を維持しています'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    {analytics.averageCompletionTime > 7
                      ? '完了まで時間がかかっています。優先度付けを見直しましょう'
                      : '適切なペースでタスクを完了しています'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    最も生産性の高いカテゴリ: {analytics.categoryStats[0]?.category || 'なし'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
