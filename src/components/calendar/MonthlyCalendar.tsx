// MonthlyCalendar.tsx
import React from 'react';
import { format } from 'date-fns';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  subMonths,
  addMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DiaryEntry } from '@/types';

interface MonthlyCalendarProps {
  entries: DiaryEntry[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  handleEdit: (entry: DiaryEntry) => void;
  setEditingEntry: (entry: DiaryEntry | null) => void;
  moodEmojis: Record<string, string>;
  showDetailed?: boolean; // オプショナルプロパティとして追加
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  entries,
  currentMonth,
  setCurrentMonth,
  handleEdit,
  setEditingEntry,
  moodEmojis,
  showDetailed = false, // デフォルト値を設定s
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { locale: ja });
  const endDate = endOfWeek(monthEnd, { locale: ja });

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  // エントリーを日付ごとにマッピング
  const entriesByDate: Record<string, DiaryEntry> = {};
  entries.forEach((entry) => {
    entriesByDate[entry.date] = entry;
  });

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">
          {format(currentMonth, 'yyyy年MM月', { locale: ja })}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
          <div key={index} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dateRange.map((date, idx) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const entry = entriesByDate[dateStr];
          const isCurrentMonth = isSameMonth(date, currentMonth);

          return (
            <div
              key={idx}
              className={`p-1 text-center rounded-md cursor-pointer hover:bg-gray-100 ${
                !isCurrentMonth ? 'text-gray-300' : ''
              } ${isToday(date) ? 'bg-blue-50 font-bold' : ''}`}
              onClick={() => {
                if (entry) {
                  handleEdit(entry);
                } else if (isCurrentMonth) {
                  // 新規エントリー作成（日付を指定）
                  setEditingEntry({
                    id: Date.now().toString(),
                    date: dateStr,
                    achievement: '',
                    mood: '',
                    tags: [],
                    difficulty: 1,
                    isImportant: false,
                  });
                }
              }}
            >
              <div className="text-sm">{format(date, 'd')}</div>
              {entry && (
                <div className="text-xs mt-1">
                  {moodEmojis[entry.mood] || '📝'}
                  {showDetailed && entry.tags && entry.tags.length > 0 && (
                    <div className="mt-1 text-[10px] text-blue-600">{entry.tags.length}タグ</div>
                  )}
                  {showDetailed && entry.isImportant && (
                    <div className="mt-1 text-[10px] text-amber-600">重要</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyCalendar;
