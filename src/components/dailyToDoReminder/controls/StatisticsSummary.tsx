import React from 'react';
import { BarChart4, Zap, Trophy, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

import { TodoStats } from '@/types/todo';
import { StatisticsDetail } from './StatisticsDetail';

interface StatisticsSummaryProps {
  stats: TodoStats;
  achievementDetails: boolean;
  setAchievementDetails: (show: boolean) => void;
  onShowFullStats?: () => void;
  getCompletionRateStyle: (rate: number) => string;
}

/**
 * タスク統計の概要表示コンポーネント
 */
export const StatisticsSummary: React.FC<StatisticsSummaryProps> = ({
  stats,
  achievementDetails,
  setAchievementDetails,
  onShowFullStats,
  getCompletionRateStyle,
}) => {
  return (
    <div className="py-2 space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <BarChart4 className="h-3 w-3 text-gray-500" />
          <span className="text-xs">完了タスク数</span>
        </div>
        <Badge variant="outline" className="bg-blue-50">
          {stats.completedTasks}
        </Badge>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-gray-500" />
          <span className="text-xs">連続達成日数</span>
        </div>
        <Badge variant="outline" className="bg-green-50">
          {stats.streakDays}日
        </Badge>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Trophy className="h-3 w-3 text-gray-500" />
          <span className="text-xs">最長達成記録</span>
        </div>
        <Badge variant="outline" className="bg-purple-50">
          {stats.longestStreak}日
        </Badge>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-gray-500" />
          <span className="text-xs">平均タスク完了時間</span>
        </div>
        <Badge variant="outline" className="bg-amber-50">
          {stats.averageCompletionTime < 60
            ? `${stats.averageCompletionTime}分`
            : `${(stats.averageCompletionTime / 60).toFixed(1)}時間`}
        </Badge>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-500" />
          <span className="text-xs">期限内完了率</span>
        </div>
        <Badge variant="outline" className={getCompletionRateStyle(stats.deadlineMeetRate)}>
          {stats.deadlineMeetRate}%
        </Badge>
      </div>

      {/* 詳細統計ダイアログ */}
      <Dialog open={achievementDetails} onOpenChange={setAchievementDetails}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs mt-2 flex items-center justify-center gap-1"
            onClick={() => setAchievementDetails(true)}
          >
            <span>詳細な統計を表示</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>タスク統計</DialogTitle>
            <DialogDescription>あなたのタスク管理の詳細な統計情報</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* 詳細な統計情報 */}
            <StatisticsDetail stats={stats} />

            {/* フル統計表示ボタン */}
            {onShowFullStats && (
              <DialogFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setAchievementDetails(false);
                    onShowFullStats();
                  }}
                >
                  <BarChart4 className="mr-2 h-4 w-4" />
                  分析ダッシュボードを表示
                </Button>
              </DialogFooter>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
