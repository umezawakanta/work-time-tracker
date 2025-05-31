import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Target,
  Award,
  Flame,
  BarChart3,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';

export interface TodoHistoryItem {
  date: string;
  count: number;
  completed?: number;
  categories?: string[];
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

interface TodoCalendarProps {
  todoHistory: TodoHistoryItem[];
  isLoading?: boolean;
  onDateSelect?: (date: Date, item?: TodoHistoryItem) => void;
  onMonthChange?: (date: Date) => void;
  className?: string;
}

// カラーグラデーションの定義
const getIntensityColor = (ratio: number): string => {
  if (ratio === 0) return 'bg-gray-100';
  if (ratio < 0.25) return 'bg-emerald-100';
  if (ratio < 0.5) return 'bg-emerald-200';
  if (ratio < 0.75) return 'bg-emerald-300';
  if (ratio < 1) return 'bg-emerald-400';
  return 'bg-emerald-500';
};

const getIntensityTextColor = (ratio: number): string => {
  if (ratio === 0) return 'text-gray-400';
  if (ratio < 0.5) return 'text-emerald-700';
  return 'text-white';
};

export const TodoCalendar: React.FC<TodoCalendarProps> = ({
  todoHistory,
  isLoading = false,
  onDateSelect,
  onMonthChange,
  className,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState(false);

  // todoHistoryデータをmemoize
  const { historyMap, statistics, streak, monthlyProgress } = useMemo(() => {
    // 履歴データからMapを作成（日付をキーに、データを値に）
    const map = new Map(todoHistory.map((item) => [item.date, item]));

    // 統計データの計算
    const totalTasks = todoHistory.reduce((sum, item) => sum + item.count, 0);
    const completedTasks = todoHistory.reduce((sum, item) => sum + (item.completed || 0), 0);
    const activeDays = todoHistory.filter((item) => item.count > 0).length;
    const perfectDays = todoHistory.filter(
      (item) => item.count > 0 && item.completed === item.count
    ).length;

    // ストリーク計算
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');

    // 日付を降順にソート
    const sortedHistory = [...todoHistory].sort((a, b) => b.date.localeCompare(a.date));

    for (const item of sortedHistory) {
      if (item.count > 0 && item.completed && item.completed > 0) {
        tempStreak++;
        if (item.date === today || tempStreak === 1) {
          currentStreak = tempStreak;
        }
      } else if (item.date < today) {
        tempStreak = 0;
      }
      maxStreak = Math.max(maxStreak, tempStreak);
    }

    // 月間進捗
    const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    const monthlyTasks = todoHistory.filter(
      (item) => item.date >= monthStart && item.date <= monthEnd
    );
    const monthlyCompleted = monthlyTasks.reduce((sum, item) => sum + (item.completed || 0), 0);
    const monthlyTotal = monthlyTasks.reduce((sum, item) => sum + item.count, 0);

    return {
      historyMap: map,
      statistics: {
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        activeDays,
        perfectDays,
      },
      streak: {
        current: currentStreak,
        max: maxStreak,
      },
      monthlyProgress: {
        completed: monthlyCompleted,
        total: monthlyTotal,
        rate: monthlyTotal > 0 ? (monthlyCompleted / monthlyTotal) * 100 : 0,
      },
    };
  }, [todoHistory, currentMonth]);

  // 月の切り替え
  const handleMonthChange = useCallback(
    (direction: 'prev' | 'next') => {
      const newMonth =
        direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
      setCurrentMonth(newMonth);
      onMonthChange?.(newMonth);
    },
    [currentMonth, onMonthChange]
  );

  // 日付クリックハンドラ
  const handleDateClick = useCallback(
    (date: Date) => {
      const dateString = format(date, 'yyyy-MM-dd');
      const historyItem = historyMap.get(dateString);

      setSelectedDate(date);
      setShowDetails(true);
      onDateSelect?.(date, historyItem);
    },
    [historyMap, onDateSelect]
  );

  // カレンダーの日付セルをカスタマイズ
  const DayContent = ({ date }: { date: Date }) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const item = historyMap.get(dateString);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isTodayDate = isToday(date);

    if (!isCurrentMonth) {
      return <div className="text-gray-300 p-2">{format(date, 'd')}</div>;
    }

    const hasData = item && item.count > 0;
    const completionRatio = hasData && item.completed ? item.completed / item.count : 0;
    const isCompleted = hasData && item.completed === item.count;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleDateClick(date)}
              className={cn(
                'relative w-full h-full p-2 transition-all duration-200',
                'hover:scale-105 hover:shadow-lg rounded-lg',
                hasData && getIntensityColor(completionRatio),
                hasData && getIntensityTextColor(completionRatio),
                !hasData && 'hover:bg-gray-50',
                isTodayDate && 'ring-2 ring-indigo-500 ring-offset-2'
              )}
            >
              <div className="text-sm font-medium">{format(date, 'd')}</div>
              {hasData && (
                <>
                  <div className="text-xs mt-1">
                    {item.completed || 0}/{item.count}
                  </div>
                  {isCompleted && <CheckCircle2 className="absolute top-1 right-1 h-3 w-3" />}
                </>
              )}
              {isTodayDate && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="h-1 w-1 bg-indigo-500 rounded-full" />
                </div>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{format(date, 'M月d日（E）', { locale: ja })}</p>
              {hasData ? (
                <>
                  <p>
                    タスク: {item.completed || 0}/{item.count}個完了
                  </p>
                  <p>達成率: {Math.round(completionRatio * 100)}%</p>
                </>
              ) : (
                <p className="text-gray-500">タスクなし</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg shadow-lg">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              タスク完了カレンダー
            </h2>
            <p className="text-sm text-gray-500">日々の達成を可視化</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="completed">完了のみ</SelectItem>
              <SelectItem value="incomplete">未完了</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">月間達成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {monthlyProgress.rate.toFixed(1)}%
            </div>
            <Progress value={monthlyProgress.rate} className="mt-2 h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {monthlyProgress.completed}/{monthlyProgress.total} タスク
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">現在のストリーク</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{streak.current}日</div>
                <p className="text-xs text-gray-500">最長: {streak.max}日</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">総タスク数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{statistics.totalTasks}</div>
                <p className="text-xs text-gray-500">完了: {statistics.completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">パーフェクト達成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{statistics.perfectDays}日</div>
                <p className="text-xs text-gray-500">/ {statistics.activeDays}日中</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* カレンダー本体 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>{format(currentMonth, 'yyyy年 M月', { locale: ja })}</span>
              <Sparkles className="h-5 w-5 text-amber-500" />
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                今月
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div
                key={day}
                className={cn(
                  'text-center text-sm font-medium py-2',
                  index === 0 && 'text-red-500',
                  index === 6 && 'text-blue-500'
                )}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {eachDayOfInterval({
              start: startOfMonth(currentMonth),
              end: endOfMonth(currentMonth),
            }).map((date) => {
              // 月初の曜日に合わせて空のセルを追加
              const startDay = startOfMonth(currentMonth).getDay();
              const dateOfMonth = date.getDate();

              if (dateOfMonth === 1) {
                return (
                  <React.Fragment key={date.toISOString()}>
                    {Array.from({ length: startDay }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    <DayContent date={date} />
                  </React.Fragment>
                );
              }

              return <DayContent key={date.toISOString()} date={date} />;
            })}
          </div>
        </CardContent>
      </Card>

      {/* 凡例 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">達成率の見方</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-100 rounded" />
              <span>0%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-emerald-100 rounded" />
              <span>25%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-emerald-200 rounded" />
              <span>50%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-emerald-300 rounded" />
              <span>75%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 詳細ダイアログ */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'yyyy年M月d日（E）', { locale: ja })}
            </DialogTitle>
            <DialogDescription>この日のタスク詳細</DialogDescription>
          </DialogHeader>

          {selectedDate &&
            (() => {
              const dateString = format(selectedDate, 'yyyy-MM-dd');
              const item = historyMap.get(dateString);

              if (!item) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>この日のタスクデータはありません</p>
                  </div>
                );
              }

              const completionRate = item.completed ? (item.completed / item.count) * 100 : 0;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">タスク数</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{item.count}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">完了数</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                          {item.completed || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>達成率</span>
                      <span className="font-medium">{completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-3" />
                  </div>

                  {item.categories && item.categories.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">カテゴリ</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.categories.map((category, index) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.priority && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">優先度</h4>
                      <Badge
                        className={cn(
                          item.priority === 'high' && 'bg-red-100 text-red-700',
                          item.priority === 'medium' && 'bg-yellow-100 text-yellow-700',
                          item.priority === 'low' && 'bg-green-100 text-green-700'
                        )}
                      >
                        {item.priority === 'high' && '高'}
                        {item.priority === 'medium' && '中'}
                        {item.priority === 'low' && '低'}
                      </Badge>
                    </div>
                  )}

                  {item.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">メモ</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodoCalendar;
