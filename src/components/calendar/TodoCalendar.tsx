import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { TodoHistoryItem } from '@/store/todoSlice';

interface TodoCalendarProps {
  todoHistory: TodoHistoryItem[];
}

export const TodoCalendar: React.FC<TodoCalendarProps> = ({ todoHistory }) => {
  const completedDates = todoHistory
    .filter(item => item.completedTasks > 0)
    .map(item => new Date(item.date));

  return (
    <Calendar
      mode="multiple"
      selected={completedDates}
      className="rounded-md border"
    />
  );
};