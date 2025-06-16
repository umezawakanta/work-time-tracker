import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Event, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { updateTodoItem } from '@/store/todoSlice';
import { TodoItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const localizer = momentLocalizer(moment);

interface CalendarEvent extends Event {
  resource: TodoItem;
}

interface TaskCalendarProps {
  onTaskSelect?: (task: TodoItem) => void;
  onDateSelect?: (date: Date) => void;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ onTaskSelect, onDateSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todo.items);
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // TodoをCalendarEventに変換
  const events = useMemo<CalendarEvent[]>(() => {
    return todos
      .filter((todo: TodoItem) => todo.deadline || todo.createdAt)
      .map((todo: TodoItem) => {
        const deadline = todo.deadline
          ? new Date(todo.deadline)
          : new Date(todo.createdAt || new Date());
        const start = new Date(deadline);
        start.setHours(9, 0, 0, 0); // デフォルト開始時間

        const end = new Date(deadline);
        end.setHours(
          todo.estimatedDuration ? 9 + Math.ceil(todo.estimatedDuration / 60) : 10,
          0,
          0,
          0
        );

        return {
          id: todo._id,
          title: todo.task,
          start,
          end,
          resource: todo,
          allDay: !todo.estimatedDuration,
        };
      });
  }, [todos]);

  // イベントのスタイリング
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const todo = event.resource;
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    if (todo.completed) {
      backgroundColor = '#10b981';
      borderColor = '#10b981';
    } else if (todo.isPrioritized) {
      backgroundColor = '#ef4444';
      borderColor = '#ef4444';
    } else if (todo.priority <= 2) {
      backgroundColor = '#f59e0b';
      borderColor = '#f59e0b';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        borderRadius: '6px',
        border: 'none',
        fontSize: '12px',
        padding: '2px 6px',
      },
    };
  }, []);

  // イベントドロップハンドラー
  const handleEventDrop = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      try {
        await dispatch(
          updateTodoItem({
            _id: event.resource._id,
            updates: {
              deadline: start.toISOString(),
              estimatedDuration: end.getTime() - start.getTime(),
            },
          })
        ).unwrap();

        toast.success('タスクの日時を更新しました');
      } catch (error) {
        console.error('Failed to update task date:', error);
        toast.error('日時の更新に失敗しました');
      }
    },
    [dispatch]
  );

  // イベントリサイズハンドラー
  const handleEventResize = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      try {
        await dispatch(
          updateTodoItem({
            _id: event.resource._id,
            updates: {
              deadline: start.toISOString(),
              estimatedDuration: end.getTime() - start.getTime(),
            },
          })
        ).unwrap();

        toast.success('タスクの時間を更新しました');
      } catch (error) {
        console.error('Failed to resize task:', error);
        toast.error('時間の更新に失敗しました');
      }
    },
    [dispatch]
  );

  // イベント選択ハンドラー
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onTaskSelect?.(event.resource);
    },
    [onTaskSelect]
  );

  // 日付選択ハンドラー
  const handleSelectSlot = useCallback(
    ({ start }: { start: Date }) => {
      onDateSelect?.(start);
    },
    [onDateSelect]
  );

  // カスタムツールバー
  const CustomToolbar: React.FC<any> = ({ label, onNavigate, onView }) => {
    return (
      <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{label}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate('PREV')}>
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('TODAY')}>
            今日
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('NEXT')}>
            →
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {['month', 'week', 'day'].map((view) => (
            <Button
              key={view}
              variant={currentView === view ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCurrentView(view as View);
                onView(view);
              }}
            >
              {view === 'month' ? '月' : view === 'week' ? '週' : '日'}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  // 統計表示
  const stats = useMemo(() => {
    const today = new Date();
    const todayTasks = todos.filter((todo) => {
      if (!todo.deadline) return false;
      const deadline = new Date(todo.deadline);
      return deadline.toDateString() === today.toDateString();
    });

    const overdueTasks = todos.filter((todo) => {
      if (!todo.deadline || todo.completed) return false;
      return new Date(todo.deadline) < today;
    });

    return {
      todayTasks: todayTasks.length,
      overdueTasks: overdueTasks.length,
      completedToday: todayTasks.filter((t) => t.completed).length,
    };
  }, [todos]);

  return (
    <div className="space-y-4">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">今日のタスク</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.todayTasks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">完了済み</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.completedToday}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">期限超過</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.overdueTasks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* メインカレンダー */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              selectable
              popup
              views={['month', 'week', 'day']}
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              components={{
                toolbar: CustomToolbar,
              }}
              messages={{
                next: '次',
                previous: '前',
                today: '今日',
                month: '月',
                week: '週',
                day: '日',
                agenda: 'アジェンダ',
                date: '日付',
                time: '時間',
                event: 'イベント',
                noEventsInRange: 'この期間にタスクはありません',
                showMore: (total) => `+${total} 件のタスク`,
              }}
              formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }) =>
                  `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                dayRangeHeaderFormat: ({ start, end }) =>
                  `${moment(start).format('M/D')} - ${moment(end).format('M/D')}`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 凡例 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">凡例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">通常タスク</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-sm">高優先度</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">最優先</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">完了済み</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCalendar;
