import React, { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';

export interface TodoHistoryItem {
  date: string;
  count: number;
}

interface TodoCalendarProps {
  todoHistory: TodoHistoryItem[];
}

export const TodoCalendar: React.FC<TodoCalendarProps> = ({ todoHistory }) => {
  // todoHistoryデータをMemoize
  const { historyMap, selectedDates } = useMemo(() => {
    // 履歴データからMapを作成（日付をキーに、タスク数を値に）
    const map = new Map(todoHistory.map(item => [item.date, item.count]));
    
    // 完了タスクのある日付だけを選択（count > 0）
    const dates = todoHistory
      .filter(item => item.count > 0)
      .map(item => new Date(item.date));
    
    return { historyMap: map, selectedDates: dates };
  }, [todoHistory]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">タスク完了カレンダー</h2>
      <Calendar
        mode="multiple"
        selected={selectedDates}
        className="rounded-md border"
        modifiers={{
          completed: (date) => {
            const dateString = date.toISOString().split('T')[0];
            return historyMap.has(dateString) && historyMap.get(dateString)! > 0;
          },
        }}
        modifiersClassNames={{
          completed: 'bg-green-500 text-white',
        }}
        components={{
          DayContent: ({ date }) => {
            const dateString = date.toISOString().split('T')[0];
            const count = historyMap.get(dateString) || 0;
            return (
              <div className="flex flex-col items-center">
                <span>{date.getDate()}</span>
                {count > 0 && <span className="text-xs">{count}</span>}
              </div>
            );
          },
        }}
      />
    </div>
  );
};