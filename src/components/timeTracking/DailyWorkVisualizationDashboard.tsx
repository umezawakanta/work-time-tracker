import { useAuth } from '@/hooks/useAuth';
/**
 * 📊 日次勤務状況可視化ダッシュボード
 * 当日の勤務時間、休憩時間、残業時間をグラフ・チャートで視覚化
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock,
  Coffee,
  TrendingUp,
  TrendingDown,
  Calendar,
  Timer,
  CheckCircle2,
  AlertCircle,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import WorkTimeAnalyticsService from '@/services/timeTracking/WorkTimeAnalyticsService';

// インスタンス作成
const analyticsService = new WorkTimeAnalyticsService();

interface DailyWorkVisualizationDashboardProps {
  userId?: string;
  selectedDate?: Date;
}

export const DailyWorkVisualizationDashboard: React.FC<DailyWorkVisualizationDashboardProps> = ({
  userId,
  selectedDate = new Date(),
}) => {
  const { user } = useAuth();
  const resolvedUserId = userId || user?.id || user?._id || user?.uid || user?.email || '';
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // 日次統計データ
  const dailyStats = useMemo(() => {
    return analyticsService.getDailyWorkStats(resolvedUserId, currentDate);
  }, [resolvedUserId, currentDate]);

  // 週次統計データ
  const weeklyStats = useMemo(() => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    return analyticsService.getWeeklyWorkStats(resolvedUserId, weekStart);
  }, [resolvedUserId, currentDate]);

  // 勤務パターン分析
  const workPattern = useMemo(() => {
    return analyticsService.analyzeWorkPattern(resolvedUserId, 30);
  }, [resolvedUserId]);

  // チャートデータ
  const chartData = useMemo(() => {
    return analyticsService.generateWorkTimeChartData(resolvedUserId, 7);
  }, [resolvedUserId]);

  // 時間を時:分形式でフォーマット
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins}分`;
  };

  // パーセンテージを色付きで表示
  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 75) return 'text-blue-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 勤務パターンのアイコン
  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'normal':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'overtime':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'short':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'irregular':
        return <Activity className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  // 円グラフ用のデータ
  const pieChartData = dailyStats
    ? [
        { name: '実働時間', value: dailyStats.actualWorkTime, color: '#3b82f6' },
        { name: '休憩時間', value: dailyStats.breakTime, color: '#10b981' },
        { name: '残業時間', value: dailyStats.overtimeMinutes, color: '#f59e0b' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            日次勤務状況の可視化
          </h1>
          <p className="text-gray-600 mt-2">
            {format(currentDate, 'yyyy年MM月dd日(EEEE)', { locale: ja })} の勤務データ分析
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={timeRange === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('today')}
          >
            今日
          </Button>
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            今週
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            今月
          </Button>
        </div>
      </div>

      {/* 概要カード */}
      {dailyStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 実働時間 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                実働時間
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatMinutes(dailyStats.actualWorkTime)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                予定: {formatMinutes(dailyStats.scheduledWorkTime)}
              </p>
              <Progress
                value={(dailyStats.actualWorkTime / dailyStats.scheduledWorkTime) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          {/* 休憩時間 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Coffee className="h-4 w-4 text-green-600" />
                休憩時間
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatMinutes(dailyStats.breakTime)}
              </div>
              <p className="text-xs text-gray-600 mt-1">適正な休憩で効率アップ</p>
            </CardContent>
          </Card>

          {/* 残業時間 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-600" />
                残業時間
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatMinutes(dailyStats.overtimeMinutes)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {dailyStats.overtimeMinutes > 0 ? '残業発生' : '定時内勤務'}
              </p>
            </CardContent>
          </Card>

          {/* 勤務効率 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                勤務効率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getEfficiencyColor(dailyStats.efficiency)}`}>
                {Math.round(dailyStats.efficiency)}%
              </div>
              <div className="flex items-center gap-1 mt-1">
                {getPatternIcon(dailyStats.workPattern)}
                <span className="text-xs text-gray-600 capitalize">{dailyStats.workPattern}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* メインチャート */}
      <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
        <TabsList>
          <TabsTrigger value="today">今日の詳細</TabsTrigger>
          <TabsTrigger value="week">週間トレンド</TabsTrigger>
          <TabsTrigger value="month">月間分析</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 時間配分円グラフ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  時間配分
                </CardTitle>
                <CardDescription>本日の勤務時間の内訳</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatMinutes(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 勤務パターン分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  勤務パターン分析
                </CardTitle>
                <CardDescription>過去30日間の傾向分析</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">平均到着時刻</p>
                    <p className="text-lg font-semibold">{workPattern.averageArrivalTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">平均退社時刻</p>
                    <p className="text-lg font-semibold">{workPattern.averageDepartureTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">残業頻度</p>
                    <p className="text-lg font-semibold">
                      {Math.round(workPattern.overtimeFrequency * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">勤務一貫性</p>
                    <p className="text-lg font-semibold">
                      {Math.round(workPattern.workConsistency * 100)}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">推奨事項</p>
                  <div className="space-y-1">
                    {workPattern.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="text-sm bg-blue-50 p-2 rounded border-l-4 border-blue-400"
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          {/* 週間勤務時間トレンド */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                週間勤務時間トレンド
              </CardTitle>
              <CardDescription>過去7日間の勤務時間推移</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatMinutes(value),
                      name === 'scheduledTime'
                        ? '予定時間'
                        : name === 'actualTime'
                          ? '実働時間'
                          : '残業時間',
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="scheduledTime" stackId="a" fill="#e5e7eb" name="予定時間" />
                  <Bar dataKey="actualTime" stackId="a" fill="#3b82f6" name="実働時間" />
                  <Bar dataKey="overtime" stackId="a" fill="#f59e0b" name="残業時間" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 週次サマリー */}
          {weeklyStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">週間総勤務時間</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatMinutes(weeklyStats.totalWorkTime)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">勤務日数: {weeklyStats.workDays}日</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">週間残業時間</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatMinutes(weeklyStats.totalOvertimeMinutes)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    平均効率: {Math.round(weeklyStats.efficiency)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">平均勤務時間</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatMinutes(weeklyStats.averageWorkTime)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">欠勤: {weeklyStats.absentDays}日</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          {/* 月間効率トレンド */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                月間効率トレンド
              </CardTitle>
              <CardDescription>日々の勤務効率の推移</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="勤務効率"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* アクションセンター */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            今日のアクション
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto flex-col p-4">
              <Calendar className="h-6 w-6 mb-2" />
              <span className="font-medium">勤務予定確認</span>
              <span className="text-xs text-gray-600">明日の予定を確認</span>
            </Button>

            <Button variant="outline" className="h-auto flex-col p-4">
              <Coffee className="h-6 w-6 mb-2" />
              <span className="font-medium">休憩リマインダー</span>
              <span className="text-xs text-gray-600">適切な休憩で効率UP</span>
            </Button>

            <Button variant="outline" className="h-auto flex-col p-4">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="font-medium">週間レポート</span>
              <span className="text-xs text-gray-600">詳細分析を確認</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyWorkVisualizationDashboard;
