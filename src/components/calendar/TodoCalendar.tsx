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
  // todoHistory繝・・繧ｿ繧樽emoize
  const { historyMap, selectedDates } = useMemo(() => {
    // 螻･豁ｴ繝・・繧ｿ縺九ｉMap繧剃ｽ懈・・域律莉倥ｒ繧ｭ繝ｼ縺ｫ縲√ち繧ｹ繧ｯ謨ｰ繧貞､縺ｫ・・
    const map = new Map(todoHistory.map(item => [item.date, item.count]));
    
    // 螳御ｺ・ち繧ｹ繧ｯ縺ｮ縺ゅｋ譌･莉倥□縺代ｒ驕ｸ謚橸ｼ・ount > 0・・
    const dates = todoHistory
      .filter(item => item.count > 0)
      .map(item => new Date(item.date));
    
    return { historyMap: map, selectedDates: dates };
  }, [todoHistory]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">繧ｿ繧ｹ繧ｯ螳御ｺ・き繝ｬ繝ｳ繝繝ｼ</h2>
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
          Day: ({ date }) => {
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
