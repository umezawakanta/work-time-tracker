import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Task } from '@/types/task';
import { useTaskDragDrop } from '@/hooks/useTaskDragDrop';

const localizer = momentLocalizer(moment);

interface TaskCalendarProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate: (date: Date) => void;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  onTaskUpdate,
  onTaskCreate,
}) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // カレンダーイベントへの変換
  const events = tasks.map((task) => ({
    id: task._id,
    title: task.title,
    start: task.scheduledStart || task.deadline || new Date(),
    end: task.scheduledEnd || task.deadline || new Date(),
    resource: task,
    allDay: !task.scheduledStart,
    backgroundColor: getPriorityColor(task.priority),
  }));

  // ドラッグ&ドロップ処理
  const handleEventDrop = useCallback(
    ({ event, start, end }: any) => {
      onTaskUpdate(event.id, {
        scheduledStart: start,
        scheduledEnd: end,
      });
    },
    [onTaskUpdate]
  );

  // 期限による色分け
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="h-screen p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onEventDrop={handleEventDrop}
        onSelectSlot={({ start }) => onTaskCreate(start)}
        selectable
        resizable
        dragFromOutsideItem={() => ({ title: 'New Task' })}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.backgroundColor,
            border: 'none',
            borderRadius: '4px',
          },
        })}
        components={{
          event: TaskEventComponent,
          toolbar: CustomToolbar,
        }}
      />
    </div>
  );
};
