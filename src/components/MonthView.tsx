'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { EventModal } from '@/components/EventModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems, updateTodoItem } from '@/store/todoSlice';
import { toast } from 'react-hot-toast';
import '@/styles/event.css';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  type: 'event' | 'task';
  taskId?: string;
  priority?: number;
  completed?: boolean;
}

interface TaskDisplayProps {
  task: {
    _id: string;
    deadline?: string;
    completed: boolean;
    text?: string;
    task?: string;
    isPrioritized?: boolean;
  };
  onClick: (e: React.MouseEvent) => void;
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({ task, onClick }) => {
  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntil = task.deadline ? getDaysUntilDeadline(task.deadline) : null;
  const isOverdue = daysUntil !== null && daysUntil < 0;
  const isDueToday = daysUntil === 0;
  const isDueSoon = daysUntil !== null && daysUntil > 0 && daysUntil <= 3;

  return (
    <div
      className={cn(
        'text-xs p-1 mb-1 rounded cursor-pointer transition-all hover:opacity-80',
        task.completed
          ? 'bg-green-100 text-green-800 line-through'
          : isOverdue
            ? 'bg-red-100 text-red-800'
            : isDueToday
              ? 'bg-orange-100 text-orange-800'
              : isDueSoon
                ? 'bg-yellow-100 text-yellow-800'
                : task.isPrioritized
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        {task.completed ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : isOverdue ? (
          <AlertCircle className="h-3 w-3" />
        ) : (
          <Clock className="h-3 w-3" />
        )}
        <span className="truncate">{task.text || task.task}</span>
        {task.isPrioritized && !task.completed && (
          <Badge variant="secondary" className="h-4 text-xs px-1">
            !
          </Badge>
        )}
      </div>
    </div>
  );
};

export function MonthView() {
  const dispatch = useDispatch<AppDispatch>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'tasks' | 'events'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  // Redux state
  const todos = useSelector((state: RootState) => state.todo.items);
  const todoStatus = useSelector((state: RootState) => state.todo.status);

  // Load todos when component mounts
  useEffect(() => {
    if (todoStatus === 'idle') {
      dispatch(fetchTodoItems());
    }
  }, [dispatch, todoStatus]);

  // Load events from localStorage
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('calendar-events');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        const eventsWithDates = parsedEvents.map(
          (event: Omit<Event, 'start' | 'end'> & { start: string; end: string }) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            type: event.type || 'event',
          })
        );
        setEvents(eventsWithDates);
      }
    } catch {
      console.error('Error loading events');
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    if (events.length > 0) {
      try {
        const eventsToSave = events.map((event) => ({
          ...event,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
        }));
        localStorage.setItem('calendar-events', JSON.stringify(eventsToSave));
      } catch {
        console.error('Error saving events');
      }
    }
  }, [events]);

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getTasksForDate = (date: Date) => {
    return todos
      .filter((todo) => {
        if (!todo.deadline) return false;
        const taskDate = new Date(todo.deadline);
        return taskDate.toDateString() === date.toDateString();
      })
      .filter((todo) => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') return !todo.completed;
        if (filterStatus === 'completed') return todo.completed;
        return true;
      });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getItemsForDate = (date: Date) => {
    const tasks = filterType === 'events' ? [] : getTasksForDate(date);
    const dayEvents = filterType === 'tasks' ? [] : getEventsForDate(date);
    return { tasks, events: dayEvents };
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(event.start);
    setIsModalOpen(true);
  };

  const handleTaskClick = async (task: { _id: string; completed: boolean }) => {
    try {
      await dispatch(
        updateTodoItem({
          _id: task._id,
          updates: { completed: !task.completed },
        })
      ).unwrap();

      const message = task.completed ? 'タスクを未完了に戻しました' : '🎉 タスクを完了しました！';
      toast.success(message);
    } catch {
      toast.error('タスクの更新に失敗しました');
    }
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id' | 'type'>) => {
    try {
      const eventWithType = { ...eventData, type: 'event' as const };

      if (selectedEvent) {
        const updatedEvents = events.map((event) =>
          event.id === selectedEvent.id ? { ...eventWithType, id: selectedEvent.id } : event
        );
        setEvents(updatedEvents);
      } else {
        const newEvent: Event = {
          ...eventWithType,
          id: Math.random().toString(36).substr(2, 9),
          start: new Date(eventData.start),
          end: new Date(eventData.end),
        };
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      }
      toast.success('イベントを保存しました');
    } catch {
      console.error('Error saving event');
      toast.error('イベントの保存に失敗しました');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  return (
    <div className="flex-1 overflow-hidden">
      {/* Calendar Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {monthYear}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilter(!showFilter)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                フィルター
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                今日
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                ‹
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                ›
              </Button>
              <Button size="sm" onClick={() => handleDayClick(new Date())} className="gap-2">
                <Plus className="h-4 w-4" />
                イベント追加
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilter && (
            <div className="flex items-center gap-4 pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">表示:</span>
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  すべて
                </Button>
                <Button
                  variant={filterType === 'tasks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('tasks')}
                >
                  タスク
                </Button>
                <Button
                  variant={filterType === 'events' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('events')}
                >
                  イベント
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">状態:</span>
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  すべて
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                >
                  進行中
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('completed')}
                >
                  完了
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-7 gap-1 p-4">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={index} className="text-center font-semibold p-2 bg-gray-50 rounded">
              {day}
            </div>
          ))}
          {daysInMonth.map((day, index) => {
            const { tasks, events: dayEvents } = day
              ? getItemsForDate(day)
              : { tasks: [], events: [] };
            const isToday = day && day.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={cn(
                  'h-32 border p-1 relative overflow-hidden cursor-pointer transition-colors hover:bg-gray-50',
                  day && day.getMonth() !== currentDate.getMonth() && 'bg-gray-100 opacity-50',
                  isToday && 'bg-blue-50 border-blue-300'
                )}
                onClick={() => day && handleDayClick(day)}
              >
                {day && (
                  <>
                    <div
                      className={cn(
                        'text-right text-sm font-medium',
                        isToday ? 'text-blue-600' : 'text-gray-700'
                      )}
                    >
                      {day.getDate()}
                    </div>
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {/* Display tasks */}
                      {tasks.slice(0, 2).map((task) => (
                        <TaskDisplay
                          key={task._id}
                          task={task}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskClick(task);
                          }}
                        />
                      ))}

                      {/* Display events */}
                      {dayEvents.slice(0, 3 - tasks.length).map((event) => (
                        <div
                          key={event.id}
                          className="event-item text-xs"
                          ref={(el) => {
                            if (el) {
                              el.style.setProperty('--event-color', event.color || '#3b82f6');
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}

                      {/* Show more indicator */}
                      {tasks.length + dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{tasks.length + dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Event Modal */}
      {selectedDate && (
        <EventModal
          isPremium={false}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveEvent}
          selectedDate={selectedDate}
          selectedTime=""
          event={selectedEvent}
        />
      )}
    </div>
  );
}
