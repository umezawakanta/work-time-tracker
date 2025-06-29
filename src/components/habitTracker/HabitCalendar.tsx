import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy } from 'lucide-react';
import HabitHeatmap from './HabitHeatmap';

// 習慣の統計情報の型定義
interface HabitStat {
  currentStreak: number;
  longestStreak: number;
  monthlyProgress: number;
}

/**
 * HabitCalendarコンポーネントのProps型定義
 */
interface HabitCalendarProps {
  currentDate: Date;
  handleMonthChange: (change: number) => void;
  getActiveHabits: () => string[];
  stats: Record<string, HabitStat>;
  getHabitData: (habit: string) => boolean[];
  toggleHabit: (habit: string, dayIndex: number) => void;
}

/**
 * 習慣のカレンダーを表示するコンポーネント
 */
const HabitCalendar = ({
  currentDate,
  handleMonthChange,
  getActiveHabits,
  stats,
  getHabitData,
  toggleHabit,
}: HabitCalendarProps) => {
  return (
    <>
      {/* 月選択ナビゲーション */}
      <div className="mb-4 flex items-center justify-center gap-4">
        <Button
          onClick={() => handleMonthChange(-1)}
          variant="outline"
          size="sm"
          aria-label="前月へ移動"
        >
          前月
        </Button>
        <span className="text-lg font-medium">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </span>
        <Button
          onClick={() => handleMonthChange(1)}
          variant="outline"
          size="sm"
          aria-label="次月へ移動"
        >
          次月
        </Button>
      </div>

      {/* 習慣カレンダー表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getActiveHabits()
          .slice(0, 4)
          .map((habit, index) => {
            const habitStats = stats[habit] || {
              currentStreak: 0,
              longestStreak: 0,
              monthlyProgress: 0,
            };

            return (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{habit}</span>
                    <Badge>{habitStats.monthlyProgress}% 達成</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    <HabitHeatmap
                      habit={habit}
                      habitData={getHabitData(habit)}
                      currentDate={currentDate}
                      toggleHabit={toggleHabit}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Flame className="h-3 w-3 text-orange-500 mr-1" />
                      <span>現在: {habitStats.currentStreak}日連続</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="h-3 w-3 text-yellow-500 mr-1" />
                      <span>最長: {habitStats.longestStreak}日</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

        {/* アクティブな習慣がない場合のフォールバック */}
        {getActiveHabits().length === 0 && (
          <div className="col-span-2 text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">表示するアクティブな習慣がありません</p>
          </div>
        )}
      </div>
    </>
  );
};

export default HabitCalendar;
