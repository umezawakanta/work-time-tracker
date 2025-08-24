import React from 'react'; // Reactをインポートして、JSX名前空間を使用できるようにする
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, Flame, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import HabitHeatmap from './HabitHeatmap';

// 表示モードの型定義
type ViewMode = 'active' | 'all' | 'archived';

// 習慣の統計情報の型定義
interface HabitStat {
  currentStreak: number;
  longestStreak: number;
  monthlyProgress: number;
}

/**
 * HabitListコンポーネントのProps型定義
 */
interface HabitListProps {
  visibleHabits: string[];
  stats: Record<string, HabitStat>;
  currentDate: Date;
  getHabitData: (habit: string) => boolean[];
  toggleHabit: (habit: string, dayIndex: number) => void;
  archiveHabit: (habit: string) => void;
  unarchiveHabit: (habit: string) => void;
  deleteHabit: (habit: string) => void;
  viewMode: ViewMode;
}

/**
 * 習慣の達成率に応じたバッジを生成する関数
 * @param {number} percentage - 達成率（0-100）
 * @returns {React.ReactElement} バッジ要素
 */
const getAchievementBadge = (percentage: number): React.ReactElement => {
  if (percentage >= 90) {
    return <Badge className="bg-green-500">優秀</Badge>;
  } else if (percentage >= 70) {
    return <Badge className="bg-blue-500">良好</Badge>;
  } else if (percentage >= 50) {
    return <Badge className="bg-yellow-500">普通</Badge>;
  } else {
    return <Badge className="bg-red-500">要改善</Badge>;
  }
};

/**
 * 習慣一覧表示コンポーネント
 */
const HabitList = ({
  visibleHabits,
  stats,
  currentDate,
  getHabitData,
  toggleHabit,
  archiveHabit,
  unarchiveHabit,
  deleteHabit,
  viewMode,
}: HabitListProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">やらないこと</TableHead>
            <TableHead className="w-[80px]">今日</TableHead>
            <TableHead>継続状況</TableHead>
            <TableHead className="w-[100px]">ステータス</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleHabits.map((habit, index) => {
            const habitStats = stats[habit] || {
              currentStreak: 0,
              longestStreak: 0,
              monthlyProgress: 0,
            };

            return (
              <TableRow key={index} className="h-[60px]">
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <span>{habit}</span>
                    {habitStats.longestStreak >= 30 && (
                      <Badge variant="outline" className="ml-2 bg-yellow-50">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        マスター
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={getHabitData(habit)[currentDate.getDate() - 1] || false}
                    onCheckedChange={() => toggleHabit(habit, currentDate.getDate() - 1)}
                    aria-label={`${habit}を今日達成したかどうか`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap gap-1">
                      <HabitHeatmap
                        habit={habit}
                        habitData={getHabitData(habit)}
                        currentDate={currentDate}
                        toggleHabit={toggleHabit}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Flame className="h-3 w-3 text-orange-500" />
                      <span>{habitStats.currentStreak}日連続</span>
                      {habitStats.currentStreak >= 7 && (
                        <Badge variant="outline" className="h-5 px-1 bg-yellow-50 text-xs">
                          🔥
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Progress value={habitStats.monthlyProgress} className="h-2 w-full" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{habitStats.monthlyProgress}%</span>
                      {getAchievementBadge(habitStats.monthlyProgress)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">メニューを開く</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {viewMode !== 'archived' ? (
                        <DropdownMenuItem onClick={() => archiveHabit(habit)}>
                          アーカイブする
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => unarchiveHabit(habit)}>
                          アーカイブから戻す
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteHabit(habit)}>
                        削除する
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default HabitList;
