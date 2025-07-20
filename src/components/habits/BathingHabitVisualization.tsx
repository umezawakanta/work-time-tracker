/**
 * 🎯 入浴習慣可視化コンポーネント
 * 継続状況をカレンダー、グラフ、ヒートマップで可視化
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  TrendingUp,
  Award,
  Target,
  Flame, // Fire → Flame に修正
  Clock,
  BarChart3,
  Star,
  CheckCircle,
  XCircle,
  Zap,
  Trophy,
  Medal,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BathingRecord, HabitStats } from '@/services/habits/BathingHabitService';

interface BathingHabitVisualizationProps {
  stats: HabitStats;
  records: BathingRecord[];
}

interface CalendarDay {
  date: Date;
  hasRecord: boolean;
  recordType?: 'full_bath' | 'shower' | 'quick_rinse' | 'body_wipe';
  streakDay?: number;
  isToday: boolean;
  isThisMonth: boolean;
}

interface LevelInfo {
  level: number;
  title: string;
  icon: string;
  color: string;
  requirement: number;
  description: string;
}

export const BathingHabitVisualization: React.FC<BathingHabitVisualizationProps> = ({
  stats,
  records,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'heatmap' | 'progress'>('calendar');

  // レベルシステム
  const levels: LevelInfo[] = [
    {
      level: 1,
      title: '入浴ビギナー',
      icon: '🚿',
      color: 'blue',
      requirement: 3,
      description: '3日連続達成',
    },
    {
      level: 2,
      title: '習慣の芽',
      icon: '🌱',
      color: 'green',
      requirement: 7,
      description: '1週間連続達成',
    },
    {
      level: 3,
      title: '継続マスター',
      icon: '⭐',
      color: 'yellow',
      requirement: 14,
      description: '2週間連続達成',
    },
    {
      level: 4,
      title: '習慣チャンピオン',
      icon: '🏅',
      color: 'orange',
      requirement: 21,
      description: '3週間連続達成',
    },
    {
      level: 5,
      title: '入浴王',
      icon: '👑',
      color: 'purple',
      requirement: 30,
      description: '1ヶ月連続達成',
    },
    {
      level: 6,
      title: '継続レジェンド',
      icon: '🌟',
      color: 'pink',
      requirement: 50,
      description: '50日連続達成',
    },
    {
      level: 7,
      title: '入浴グランドマスター',
      icon: '💎',
      color: 'cyan',
      requirement: 100,
      description: '100日連続達成',
    },
  ];

  const getCurrentLevel = (): LevelInfo => {
    const currentStreak = stats.currentStreak;
    for (let i = levels.length - 1; i >= 0; i--) {
      if (currentStreak >= levels[i].requirement) {
        return levels[i];
      }
    }
    return levels[0];
  };

  const getNextLevel = (): LevelInfo | null => {
    const currentLevel = getCurrentLevel();
    const currentIndex = levels.findIndex((l) => l.level === currentLevel.level);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const getLevelProgress = (): number => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();

    if (!nextLevel) return 100;

    const currentStreak = stats.currentStreak;
    const levelStart = currentLevel.requirement;
    const levelEnd = nextLevel.requirement;

    const progress = ((currentStreak - levelStart) / (levelEnd - levelStart)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // カレンダーデータ生成
  const generateCalendarData = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 週の始まりに調整

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      // 6週間分
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateString = date.toDateString();
      const record = records.find(
        (r) => new Date(r.date).toDateString() === dateString && r.completed
      );

      days.push({
        date: new Date(date),
        hasRecord: !!record,
        recordType: record?.bathingType,
        streakDay: record?.streakDay,
        isToday: date.getTime() === today.getTime(),
        isThisMonth: date.getMonth() === month,
      });
    }

    return days;
  };

  // ヒートマップデータ生成（過去12週間）
  const generateHeatmapData = () => {
    const weeks = [];
    const today = new Date();

    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - w * 7);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // 日曜日から開始

      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d);

        const record = records.find(
          (r) => new Date(r.date).toDateString() === date.toDateString() && r.completed
        );

        weekDays.push({
          date: new Date(date),
          intensity: record ? 1 : 0,
          recordType: record?.bathingType,
        });
      }
      weeks.push(weekDays);
    }

    return weeks;
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'full_bath':
        return '🛁';
      case 'shower':
        return '🚿';
      case 'quick_rinse':
        return '⚡';
      case 'body_wipe':
        return '🧽';
      default:
        return '💧';
    }
  };

  const calendarData = generateCalendarData();
  const heatmapData = generateHeatmapData();
  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const levelProgress = getLevelProgress();

  return (
    <div className="space-y-6">
      {/* レベル表示 */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            習慣レベル
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{currentLevel.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-purple-900">
                  Lv.{currentLevel.level} {currentLevel.title}
                </h3>
                <p className="text-sm text-purple-700">{currentLevel.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}日</div>
              <div className="text-sm text-purple-500">連続記録</div>
            </div>
          </div>

          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">次のレベル: {nextLevel.title}</span>
                <span className="text-purple-600">
                  {stats.currentStreak}/{nextLevel.requirement}日
                </span>
              </div>
              <Progress value={levelProgress} className="h-3" />
              <p className="text-xs text-gray-500 text-center">
                あと{nextLevel.requirement - stats.currentStreak}日で次のレベル！
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 継続状況ダッシュボード */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              継続状況ダッシュボード
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="w-4 h-4 mr-1" />
                カレンダー
              </Button>
              <Button
                variant={viewMode === 'heatmap' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('heatmap')}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                ヒートマップ
              </Button>
              <Button
                variant={viewMode === 'progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('progress')}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                進捗
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* カレンダービュー */}
          {viewMode === 'calendar' && (
            <div className="space-y-4">
              {/* 月切り替え */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCurrentDate(newDate);
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold">
                  {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCurrentDate(newDate);
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
                {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                  <div key={day} className="p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* カレンダーグリッド */}
              <div className="grid grid-cols-7 gap-1">
                {calendarData.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      'relative aspect-square p-1 text-center text-sm rounded-lg transition-all duration-200 hover:scale-105 cursor-default',
                      day.isThisMonth ? 'text-gray-900' : 'text-gray-300',
                      day.isToday && 'ring-2 ring-blue-500 ring-offset-1',
                      day.hasRecord
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 shadow-sm'
                        : 'bg-gray-50 border border-gray-200',
                      !day.hasRecord && day.isThisMonth && 'hover:bg-gray-100'
                    )}
                    title={
                      day.hasRecord
                        ? `${day.date.getDate()}日: 入浴完了 (${getTypeIcon(day.recordType)})`
                        : `${day.date.getDate()}日: 未完了`
                    }
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      <span
                        className={cn('text-xs font-medium', day.hasRecord && 'text-green-800')}
                      >
                        {day.date.getDate()}
                      </span>
                      {day.hasRecord && (
                        <div className="text-lg leading-none">{getTypeIcon(day.recordType)}</div>
                      )}
                      {day.streakDay && day.streakDay % 7 === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="w-2 h-2 text-yellow-800" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 凡例 */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300 rounded"></div>
                  <span>完了</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                  <span>未完了</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>週間達成</span>
                </div>
              </div>
            </div>
          )}

          {/* ヒートマップビュー */}
          {viewMode === 'heatmap' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">過去12週間の活動</h3>

              {/* 曜日ラベル */}
              <div className="flex">
                <div className="w-8"></div>
                <div className="flex-1 grid grid-cols-12 gap-1">
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (11 - i) * 7);
                    return (
                      <div key={i} className="text-xs text-gray-500 text-center">
                        {date.getMonth() + 1}月
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex">
                {/* 曜日ラベル */}
                <div className="w-8 space-y-1">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                    <div
                      key={day}
                      className={cn(
                        'h-4 text-xs text-gray-500 flex items-center',
                        i % 2 === 0 ? 'visible' : 'invisible'
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* ヒートマップグリッド */}
                <div className="flex-1 grid grid-cols-12 gap-1">
                  {heatmapData.map((week, weekIndex) => (
                    <div key={weekIndex} className="space-y-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={cn(
                            'w-4 h-4 rounded-sm transition-all duration-200 hover:scale-125 cursor-default',
                            day.intensity > 0
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-gray-200 hover:bg-gray-300'
                          )}
                          title={`${day.date.toLocaleDateString()}: ${
                            day.intensity > 0 ? `入浴完了 ${getTypeIcon(day.recordType)}` : '未完了'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* ヒートマップ凡例 */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <span>少ない</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                </div>
                <span>多い</span>
              </div>
            </div>
          )}

          {/* 進捗ビュー */}
          {viewMode === 'progress' && (
            <div className="space-y-6">
              {/* 週間進捗 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">週間進捗パターン</h3>
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(stats.weeklyPattern).map(([day, count]) => {
                    const maxCount = Math.max(...Object.values(stats.weeklyPattern));
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                      <div key={day} className="text-center">
                        <div className="text-xs text-gray-600 mb-1">{day}</div>
                        <div className="h-20 bg-gray-200 rounded-lg relative overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                            style={{ height: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">{count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 成功率推移 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">継続統計</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-500">成功率（30日）</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.totalBaths}</div>
                    <div className="text-sm text-green-500">総入浴回数</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.averageTimeOfDay}
                    </div>
                    <div className="text-sm text-purple-500">平均時刻</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.longestStreak}</div>
                    <div className="text-sm text-orange-500">最長ストリーク</div>
                  </div>
                </div>
              </div>

              {/* 習慣の定着度 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">習慣の定着度</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">継続力</span>
                    <span className="text-sm text-gray-600">
                      {Math.min(stats.currentStreak * 4, 100)}%
                    </span>
                  </div>
                  <Progress value={Math.min(stats.currentStreak * 4, 100)} className="h-3" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">一貫性</span>
                    <span className="text-sm text-gray-600">{stats.successRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.successRate} className="h-3" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">習慣化レベル</span>
                    <span className="text-sm text-gray-600">
                      {Math.min((stats.longestStreak / 66) * 100, 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min((stats.longestStreak / 66) * 100, 100)}
                    className="h-3"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    習慣化には一般的に66日かかると言われています
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* マイルストーン */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-yellow-500" />
            達成マイルストーン
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {levels.map((level) => {
              const isAchieved = stats.currentStreak >= level.requirement;
              const isNext = !isAchieved && level.level === getCurrentLevel().level + 1;

              return (
                <div
                  key={level.level}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all duration-300',
                    isAchieved
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-md'
                      : isNext
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-sm'
                        : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('text-2xl', isAchieved ? 'grayscale-0' : 'grayscale')}>
                      {level.icon}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={cn(
                          'font-semibold',
                          isAchieved
                            ? 'text-yellow-800'
                            : isNext
                              ? 'text-blue-800'
                              : 'text-gray-600'
                        )}
                      >
                        Lv.{level.level} {level.title}
                      </h4>
                      <p
                        className={cn(
                          'text-xs',
                          isAchieved
                            ? 'text-yellow-600'
                            : isNext
                              ? 'text-blue-600'
                              : 'text-gray-500'
                        )}
                      >
                        {level.description}
                      </p>
                    </div>
                    {isAchieved && <CheckCircle className="w-6 h-6 text-yellow-600" />}
                    {isNext && (
                      <div className="text-xs text-blue-600 font-medium">
                        あと{level.requirement - stats.currentStreak}日
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BathingHabitVisualization;
