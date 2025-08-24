// WeeklyView.tsx
import React from 'react';
import { format } from 'date-fns';
import { startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DiaryEntry } from '@/types';

interface WeeklyViewProps {
  entries: DiaryEntry[];
  moodEmojis: Record<string, string>;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({ entries, moodEmojis }) => {
  if (entries.length === 0) return null;

  // 今週の日付範囲を取得
  const today = new Date();
  const startDay = startOfWeek(today, { locale: ja });
  const endDay = endOfWeek(today, { locale: ja });
  const weekDays = eachDayOfInterval({ start: startDay, end: endDay });

  // エントリーを日付ごとにマッピング
  const entriesByDate: Record<string, DiaryEntry> = {};
  entries.forEach((entry) => {
    entriesByDate[entry.date] = entry;
  });

  return (
    <div className="grid grid-cols-7 gap-2 mt-4">
      {weekDays.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const entry = entriesByDate[dateStr];

        return (
          <Card
            key={dateStr}
            className={`relative ${
              entry ? 'border-primary' : 'border-gray-200'
            } ${isToday(day) ? 'bg-blue-50' : ''}`}
          >
            <CardHeader className="p-2">
              <CardTitle className="text-xs text-center">
                {format(day, 'E', { locale: ja })}
              </CardTitle>
              <p className="text-center text-sm">{format(day, 'd', { locale: ja })}</p>
            </CardHeader>
            <CardContent className="p-2 text-center">
              {entry ? (
                <>
                  <div className="text-xl">{moodEmojis[entry.mood] || '📝'}</div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="w-full">
                        <p className="text-xs truncate">
                          {entry.achievement.substring(0, 20)}
                          {entry.achievement.length > 20 ? '...' : ''}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{entry.achievement}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                <p className="text-xs text-gray-400">記録なし</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WeeklyView;
