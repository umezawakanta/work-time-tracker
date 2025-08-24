// StatsView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Calendar,
  LineChart as LineChartIcon,
  BarChart3,
  ArrowUp,
  Users,
  Award,
  Target,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiaryEntry, Goal, MonthlyStats, MotivationDataPoint, TagOption } from '@/types';
import './StatsView.css'; // スタイルを外部ファイルに移動

interface StatsViewProps {
  entries: DiaryEntry[];
  goals: Goal[];
  stats: MonthlyStats;
  motivationData: MotivationDataPoint[];
  moodEmojis: Record<string, string>;
  moodLabels: Record<string, string>;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  tagOptions: TagOption[];
}

const StatsView: React.FC<StatsViewProps> = ({
  entries,
  goals,
  stats,
  motivationData,
  moodEmojis,
  moodLabels,
  currentMonth,
  setCurrentMonth,
  tagOptions,
}) => {
  // 目標分析のタブ
  const [goalAnalysisTab, setGoalAnalysisTab] = useState<string>('category');
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 進捗バーの幅を設定
  useEffect(() => {
    if (progressBarRef.current) {
      const percentage = (stats.entryCount / 30) * 100;
      progressBarRef.current.style.setProperty('--progress-width', `${percentage}%`);
    }
  }, [stats.entryCount]);

  // 月の選択肢を生成（過去6ヶ月）
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: `${date.getFullYear()}-${date.getMonth()}`,
      label: format(date, 'yyyy年MM月'),
      date: new Date(date),
    };
  });

  // 気分データをグラフ用に整形
  const moodChartData = Object.entries(stats.moodCounts).map(([mood, count]) => ({
    name: moodLabels[mood],
    emoji: moodEmojis[mood],
    count,
  }));

  // タグデータをグラフ用に整形
  const tagChartData = Object.entries(stats.tagCounts)
    .map(([tagValue, count]) => {
      const tag = tagOptions.find((t) => t.value === tagValue);
      return {
        name: tag ? tag.label : tagValue,
        value: tagValue,
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // 上位5つのみ表示

  // 難易度分布データ
  const difficultyData = [1, 2, 3, 4, 5].map((level) => {
    const count = entries.filter((e) => e.difficulty === level).length;
    return {
      name: `レベル${level}`,
      count,
    };
  });

  // 目標カテゴリー別の割合データ
  const goalCategoryData = goals.reduce(
    (acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const goalCategoryChartData = Object.entries(goalCategoryData).map(([category, count]) => ({
    name:
      category === 'daily'
        ? '日常習慣'
        : category === 'weekly'
          ? '週間目標'
          : category === 'monthly'
            ? '月間目標'
            : '長期目標',
    value: count,
    category,
  }));

  // 目標達成状況データ
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const pendingGoals = goals.length - completedGoals;

  const goalStatusData = [
    { name: '達成済み', value: completedGoals, color: '#4ade80' },
    { name: '未達成', value: pendingGoals, color: '#f87171' },
  ];

  // 目標期限切れ状況
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingGoals = goals.filter((goal) => {
    if (!goal.targetDate || goal.completed) return false;
    const targetDate = new Date(goal.targetDate);
    return targetDate >= today;
  });

  const overdueGoals = goals.filter((goal) => {
    if (!goal.targetDate || goal.completed) return false;
    const targetDate = new Date(goal.targetDate);
    return targetDate < today;
  });

  // 目標タイムライン（今後の期限）
  const nextDeadlines = upcomingGoals
    .sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime())
    .slice(0, 5); // 最も近い5つの期限

  // 月を変更する処理
  const handleMonthChange = (value: string) => {
    const selected = monthOptions.find((m) => m.value === value);
    if (selected) {
      setCurrentMonth(selected.date);
    }
  };

  // カスタムツールチップ - 気分グラフ用
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        name: string;
        emoji: string;
        count: number;
      };
    }>;
    label?: string;
  }

  const CustomMoodTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="text-sm">{`${payload[0].payload.emoji} ${payload[0].payload.name}: ${payload[0].value}回`}</p>
        </div>
      );
    }
    return null;
  };

  // モチベーショングラフのカスタムツールチップ
  interface MotivationTooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        date: string;
        value: number;
        difficulty: number;
        hasEntry: boolean;
      };
    }>;
    label?: string;
  }

  const CustomMotivationTooltip = ({ active, payload, label }: MotivationTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{`モチベーション: ${data.value ? data.value : 'データなし'}`}</p>
          {data.difficulty > 0 && <p className="text-sm">{`難易度: ${data.difficulty}`}</p>}
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">統計とインサイト</h2>
        <Select
          value={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="月を選択" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 概要カード */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">記録数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{stats.entryCount}</div>
              <div className="text-xs text-gray-500">/ 30日</div>
            </div>
            <div className="progress-bar-container">
              <div ref={progressBarRef} className="record-progress progress-bar"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">平均難易度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDifficulty.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mt-1">
              レベル{stats.highDifficultyCount > 0 ? 4 : 3}以上: {stats.highDifficultyCount}件
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">目標設定数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              達成率: {goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">目標達成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedGoalsThisMonth}</div>
            <div className="text-xs text-gray-500 mt-1">今月の達成目標数</div>
          </CardContent>
        </Card>
      </div>

      {/* 目標分析セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            目標分析
          </CardTitle>
          <CardDescription>目標の設定・達成状況の分析</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={goalAnalysisTab} onValueChange={setGoalAnalysisTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="category">カテゴリー別</TabsTrigger>
              <TabsTrigger value="status">達成状況</TabsTrigger>
              <TabsTrigger value="timeline">期限タイムライン</TabsTrigger>
            </TabsList>

            <TabsContent value="category">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={goalCategoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {goalCategoryChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="status">
              <div className="flex gap-6">
                <div className="flex-1 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={goalStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {goalStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">期限の状況</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="text-2xl font-bold text-blue-500">
                          {upcomingGoals.length}
                        </div>
                        <div className="text-sm text-gray-500">期限内の目標</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold text-red-500">{overdueGoals.length}</div>
                        <div className="text-sm text-gray-500">期限切れの目標</div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">迫っている期限</h3>
                {nextDeadlines.length > 0 ? (
                  <div className="space-y-2">
                    {nextDeadlines.map((goal) => (
                      <Card key={goal.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{goal.description}</div>
                            <div className="text-sm text-gray-500">
                              {goal.category === 'daily'
                                ? '日常習慣'
                                : goal.category === 'weekly'
                                  ? '週間目標'
                                  : goal.category === 'monthly'
                                    ? '月間目標'
                                    : '長期目標'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {format(new Date(goal.targetDate!), 'yyyy/MM/dd')}
                            </div>
                            <div className="text-sm text-gray-500">
                              残り
                              {Math.ceil(
                                (new Date(goal.targetDate!).getTime() - today.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}
                              日
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    期限が設定された目標はありません
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* モチベーショングラフ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChartIcon className="h-5 w-5 mr-2" />
            モチベーション推移
          </CardTitle>
          <CardDescription>過去30日間の気分・モチベーションの変化</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={motivationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(value) => value} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                <Tooltip content={<CustomMotivationTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-5 text-xs text-center">
            <div>😞 とても悪い = 1</div>
            <div>😕 悪い = 2</div>
            <div>😐 普通 = 3</div>
            <div>🙂 良い = 4</div>
            <div>😄 とても良い = 5</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 気分分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              気分の分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomMoodTooltip />} />
                  <Bar dataKey="count" fill="#4ade80" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* タグ使用頻度 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              よく使われるタグ (上位5件)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tagChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#60a5fa" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 難易度分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              難易度の分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 週ごとの達成数 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowUp className="h-5 w-5 mr-2" />
              週ごとの達成数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(stats.weeklyAchievements).map(([week, count]) => ({
                    name: `第${week}週`,
                    count,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsView;
