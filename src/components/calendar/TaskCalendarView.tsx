import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Target,
  Edit3,
  Trash2,
  GripVertical,
  Brain,
  Sparkles,
} from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems, updateTodoItem, deleteTodoItem } from '@/store/todoSlice';
import { EventModal } from '@/components/EventModal';
import { toast } from 'react-hot-toast';
import { createSafeDate, normalizeDateTimeLocal } from '@/utils/dateUtils';

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
  description?: string;
}

interface StoredEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  type?: 'event' | 'task';
  taskId?: string;
  priority?: number;
  completed?: boolean;
  description?: string;
}

interface TaskCalendarViewProps {
  className?: string;
}

const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'tasks' | 'events'>('all');

  // Redux state
  const todos = useSelector((state: RootState) => state.todo.items);
  const todoStatus = useSelector((state: RootState) => state.todo.status);

  // Load todos
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
        const eventsWithDates = parsedEvents.map((event: StoredEvent) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          type: event.type || 'event',
        }));
        setEvents(eventsWithDates);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    if (events.length > 0) {
      try {
        const eventsToSave = events.map((event) => {
          // Validate Date objects before calling toISOString()
          const startDate =
            event.start instanceof Date && !isNaN(event.start.getTime()) ? event.start : new Date();
          const endDate =
            event.end instanceof Date && !isNaN(event.end.getTime()) ? event.end : new Date();

          return {
            ...event,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          };
        });
        localStorage.setItem('calendar-events', JSON.stringify(eventsToSave));
      } catch (error) {
        console.error('Error saving events:', error);
      }
    }
  }, [events]);

  // Convert todos to calendar events
  const taskEvents: Event[] = useMemo(() => {
    return todos
      .filter((todo) => {
        // Filter by status
        if (filterStatus === 'active' && todo.completed) return false;
        if (filterStatus === 'completed' && !todo.completed) return false;

        // Include tasks with deadlines or all tasks for current day view
        return todo.deadline || view === 'day';
      })
      .map((todo) => {
        const startDate = createSafeDate(todo.deadline);
        const endDate = createSafeDate(todo.deadline);

        return {
          id: `task-${todo._id}`,
          title: todo.task || 'Untitled Task',
          start: startDate,
          end: endDate,
          type: 'task' as const,
          taskId: todo._id,
          priority: todo.priority,
          completed: todo.completed,
          color: todo.completed
            ? '#10b981'
            : todo.isPrioritized
              ? '#ef4444'
              : todo.priority > 3
                ? '#f59e0b'
                : '#3b82f6',
        };
      });
  }, [todos, filterStatus, view]);

  // Combine events and tasks
  const allItems = useMemo(() => {
    const filteredEvents = filterType === 'tasks' ? [] : events;
    const filteredTasks = filterType === 'events' ? [] : taskEvents;
    return [...filteredEvents, ...filteredTasks];
  }, [events, taskEvents, filterType]);

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (view) {
        case 'month':
          newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'day':
          newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
          break;
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleItemClick = async (item: Event) => {
    if (item.type === 'task' && item.taskId) {
      // Toggle task completion
      try {
        const todo = todos.find((t) => t && t._id === item.taskId);
        if (todo) {
          await dispatch(
            updateTodoItem({
              _id: item.taskId,
              updates: { completed: !todo.completed },
            })
          ).unwrap();

          const message = todo.completed
            ? 'タスクを未完了に戻しました'
            : '🎉 タスクを完了しました！';
          toast.success(message);
        }
      } catch {
        toast.error('タスクの更新に失敗しました');
      }
    } else {
      // Edit event
      setSelectedEvent(item);
      setSelectedDate(item.start);
      setIsModalOpen(true);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('このタスクを削除しますか？')) return;

    try {
      await dispatch(deleteTodoItem(taskId)).unwrap();
      toast.success('タスクを削除しました');
    } catch {
      toast.error('タスクの削除に失敗しました');
    }
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id' | 'type'>) => {
    try {
      const eventWithType = { ...eventData, type: 'event' as const };

      if (selectedEvent && selectedEvent.type === 'event') {
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
        setEvents((prev) => [...prev, newEvent]);
      }
      toast.success('イベントを保存しました');
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('イベントの保存に失敗しました');
    }
  };

  // Handle drag and drop
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination, draggableId } = result;

      // Extract date from destination droppableId (format: "date-YYYY-MM-DD")
      const destinationDateStr = destination.droppableId.replace('date-', '');
      const destinationDate = new Date(destinationDateStr);

      if (isNaN(destinationDate.getTime())) {
        toast.error('無効な日付です');
        return;
      }

      // Find the task (draggableId format: "task-{todoId}")
      const taskId = draggableId.replace('task-', '');
      const todo = todos.find((t) => t && t._id === taskId);

      if (!todo) {
        toast.error('タスクが見つかりません');
        return;
      }

      // Skip if dropping on the same date
      const currentDate = todo.deadline ? new Date(todo.deadline) : new Date();
      if (currentDate.toDateString() === destinationDate.toDateString()) {
        return;
      }

      // Update task deadline
      try {
        await dispatch(
          updateTodoItem({
            _id: taskId,
            updates: { deadline: destinationDate.toISOString() },
          })
        ).unwrap();

        toast.success(`タスクを${destinationDate.toLocaleDateString('ja-JP')}に移動しました`);
      } catch (error) {
        toast.error('タスクの日付変更に失敗しました');
        console.error('Task date update error:', error);
      }
    },
    [todos, dispatch]
  );

  const monthYear = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  // Render month view
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    const getItemsForDate = (date: Date) => {
      return allItems.filter((item) => {
        return item.start.toDateString() === date.toDateString();
      });
    };

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-1">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={index} className="text-center font-semibold p-2 bg-gray-50 rounded">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            const items = day ? getItemsForDate(day) : [];
            const isToday = day && day.toDateString() === new Date().toDateString();
            const dateStr = day ? day.toISOString().split('T')[0] : `empty-${index}`;

            return (
              <Droppable key={index} droppableId={day ? `date-${dateStr}` : `empty-${index}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'h-32 border p-1 relative overflow-hidden cursor-pointer transition-all duration-200',
                      day && day.getMonth() !== currentDate.getMonth() && 'bg-gray-100 opacity-50',
                      isToday && 'bg-blue-50 border-blue-300',
                      snapshot.isDraggingOver && 'bg-green-50 border-green-300 scale-105 shadow-md',
                      !day && 'bg-gray-50',
                      'hover:bg-gray-50'
                    )}
                    onClick={() => day && handleDateClick(day)}
                  >
                    {day && (
                      <>
                        <div
                          className={cn(
                            'text-right text-sm font-medium mb-1',
                            isToday ? 'text-blue-600' : 'text-gray-700'
                          )}
                        >
                          {day.getDate()}
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          {items.slice(0, 3).map((item, itemIndex) =>
                            item.type === 'task' ? (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={itemIndex}
                                isDragDisabled={item.completed}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      'text-xs p-1 rounded cursor-pointer transition-all hover:opacity-80 truncate group',
                                      item.completed
                                        ? 'bg-green-100 text-green-800 line-through opacity-75'
                                        : 'bg-blue-100 text-blue-800',
                                      snapshot.isDragging && 'shadow-lg scale-105 rotate-2 z-50'
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleItemClick(item);
                                    }}
                                  >
                                    <div className="flex items-center gap-1">
                                      <div
                                        {...provided.dragHandleProps}
                                        className={cn(
                                          'opacity-0 transition-opacity cursor-grab active:cursor-grabbing',
                                          !item.completed && 'group-hover:opacity-100'
                                        )}
                                      >
                                        <GripVertical className="h-3 w-3" />
                                      </div>
                                      {item.completed ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                      ) : (
                                        <Clock className="h-3 w-3" />
                                      )}
                                      <span className="truncate flex-1">{item.title}</span>
                                      {item.priority && item.priority > 3 && (
                                        <Badge variant="destructive" className="h-3 text-xs px-1">
                                          !
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ) : (
                              <div
                                key={item.id}
                                className="text-xs p-1 rounded cursor-pointer transition-all hover:opacity-80 truncate bg-purple-100 text-purple-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemClick(item);
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span className="truncate">{item.title}</span>
                                </div>
                              </div>
                            )
                          )}
                          {items.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{items.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    );
  };

  // Render week view (simplified)
  const renderWeekView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - currentDate.getDay() + i);
      return date;
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const items = allItems.filter(
              (item) => item.start.toDateString() === day.toDateString()
            );
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <Card
                key={index}
                className={cn(
                  'min-h-[200px] cursor-pointer transition-colors hover:bg-gray-50',
                  isToday && 'border-blue-300 bg-blue-50'
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle
                    className={cn(
                      'text-sm text-center',
                      isToday ? 'text-blue-600' : 'text-gray-700'
                    )}
                  >
                    {day.toLocaleDateString('ja-JP', { weekday: 'short', day: 'numeric' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'text-xs p-2 rounded cursor-pointer transition-all hover:opacity-80',
                          item.type === 'task'
                            ? item.completed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        )}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex items-center gap-1">
                          {item.type === 'task' ? (
                            item.completed ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )
                          ) : (
                            <Calendar className="h-3 w-3" />
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayItems = allItems.filter(
      (item) => item.start.toDateString() === currentDate.toDateString()
    );

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {currentDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </span>
              <Badge variant="outline">{dayItems.length}件のアイテム</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dayItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  この日にはタスクやイベントがありません
                </p>
              ) : (
                dayItems.map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.type === 'task' ? (
                            item.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-blue-500" />
                            )
                          ) : (
                            <Calendar className="h-5 w-5 text-purple-500" />
                          )}
                          <div>
                            <h4
                              className={cn(
                                'font-medium',
                                item.type === 'task' &&
                                  item.completed &&
                                  'line-through text-gray-500'
                              )}
                            >
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.type === 'task' ? 'タスク' : 'イベント'}
                              </Badge>
                              {item.type === 'task' && item.priority && item.priority > 3 && (
                                <Badge variant="destructive" className="text-xs">
                                  <Target className="h-3 w-3 mr-1" />
                                  重要
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleItemClick(item)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          {item.type === 'task' && item.taskId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(item.taskId!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  今日
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold">{monthYear}</h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateClick(new Date())}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                新規作成
              </Button>
            </div>
          </div>

          {/* Filters and View Tabs */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Tabs
              value={view}
              onValueChange={(value) => setView(value as 'month' | 'week' | 'day')}
            >
              <TabsList>
                <TabsTrigger value="month">月</TabsTrigger>
                <TabsTrigger value="week">週</TabsTrigger>
                <TabsTrigger value="day">日</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-4">
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
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Content */}
      <Card>
        <CardContent className="p-6">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </CardContent>
      </Card>

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
          event={selectedEvent?.type === 'event' ? selectedEvent : null}
        />
      )}
    </div>
  );
};

export default TaskCalendarView;
