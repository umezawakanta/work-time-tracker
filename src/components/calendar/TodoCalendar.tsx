import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { TodoHistoryItem } from '@/store/todoSlice';

interface TodoCalendarProps {
  todoHistory: TodoHistoryItem[];
}

export const TodoCalendar: React.FC<TodoCalendarProps> = ({ todoHistory }) => {
  const completedDates = todoHistory.reduce((acc, item) => {
    item.completedTasks.forEach(task => {
      const date = new Date(task.completedDate);
      const dateString = date.toISOString().split('T')[0];
      if (!acc.includes(dateString)) {
        acc.push(dateString);
      }
    });
    return acc;
  }, [] as string[]);

  const selectedDates = completedDates.map(dateString => new Date(dateString));

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">タスク完了カレンダー</h2>
      <Calendar
        mode="multiple"
        selected={selectedDates}
        className="rounded-md border"
      />
    </div>
  );
};