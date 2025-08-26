import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Calendar,
  momentLocalizer,
  Views,
  View,
  Event as BigCalendarEvent,
} from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems, updateTodoItem, deleteTodoItem, addTodoItem } from '@/store/todoSlice';
import { toast } from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '@/styles/calendar.css';

// 日本語設定
moment.locale('ja');
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar as any) as unknown as React.ComponentType<any>;

// カスタムイベント型
interface CalendarEvent extends BigCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    type: 'task' | 'event';
    taskId?: string;
    priority?: number;
    completed?: boolean;
    isPrioritized?: boolean;
    category?: string;
    tags?: string[];
    description?: string;
  };
}

interface TaskFormData {
  title: string;
  description: string;
  priority: number;
  category: string;
  tags: string;
  estimatedDuration: number;
  type: 'input' | 'output';
}

interface BigCalendarViewProps {
  className?: string;
}

export const BigCalendarView: React.FC<BigCalendarViewProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [_showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Task form state
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 3,
    category: '',
    tags: '',
    estimatedDuration: 30,
    type: 'output',
  });

  // Redux state
  const todos = useSelector((state: RootState) => state.todo.items);
  const todoStatus = useSelector((state: RootState) => state.todo.status);

  // Load todos
  useEffect(() => {
    if (todoStatus === 'idle') {
      dispatch(fetchTodoItems());
    }
  }, [dispatch, todoStatus]);

  // Load calendar events from localStorage
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('big-calendar-events');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        const eventsWithDates = parsedEvents.map(
          (event: {
            id: string;
            title: string;
            start: string;
            end: string;
            resource?: {
              type: 'task' | 'event';
              taskId?: string;
              priority?: number;
              completed?: boolean;
              isPrioritized?: boolean;
              category?: string;
              tags?: string[];
              description?: string;
            };
          }) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          })
        );
        setEvents(eventsWithDates);
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  }, []);

  // Save events to localStorage
  const saveEvents = useCallback((newEvents: CalendarEvent[]) => {
    try {
      const eventsToSave = newEvents.map((event) => ({
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
      }));
      localStorage.setItem('big-calendar-events', JSON.stringify(eventsToSave));
    } catch (error) {
      console.error('Error saving calendar events:', error);
    }
  }, []);

  // Convert todos to calendar events
  const taskEvents: CalendarEvent[] = useMemo(() => {
    return todos
      .filter((todo) => todo && todo._id) // 無効なtodoをフィルタリング
      .filter((todo) => {
        // Filter by completion status
        if (filterStatus === 'active' && todo.completed) return false;
        if (filterStatus === 'completed' && !todo.completed) return false;

        // Filter by priority
        if (filterPriority === 'high' && todo.priority < 4) return false;
        if (filterPriority === 'medium' && (todo.priority < 2 || todo.priority > 4)) return false;
        if (filterPriority === 'low' && todo.priority > 2) return false;

        return true;
      })
      .map((todo) => {
        const startDate = todo.deadline ? new Date(todo.deadline) : new Date();
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1時間後

        return {
          id: `task-${todo._id}`,
          title: `📋 ${todo.task}`,
          start: startDate,
          end: endDate,
          resource: {
            type: 'task' as const,
            taskId: todo._id,
            priority: todo.priority,
            completed: todo.completed,
            isPrioritized: todo.isPrioritized,
            category: todo.category,
            tags: todo.tags,
            description: todo.note,
          },
        } as CalendarEvent;
      });
  }, [todos, filterStatus, filterPriority]);

  // Combine task events and calendar events
  const allEvents = useMemo(() => {
    return [...taskEvents, ...events];
  }, [taskEvents, events]);

  // Event style getter
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const resource = event.resource;

    if (resource?.type === 'task') {
      if (resource.completed) {
        return {
          style: {
            backgroundColor: '#10b981',
            borderColor: '#059669',
            color: 'white',
            textDecoration: 'line-through',
          },
        };
      } else if (resource.isPrioritized) {
        return {
          style: {
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            color: 'white',
            fontWeight: 'bold',
          },
        };
      } else if (resource.priority && resource.priority > 3) {
        return {
          style: {
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            color: 'white',
          },
        };
      } else {
        return {
          style: {
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            color: 'white',
          },
        };
      }
    }

    // Default event style
    return {
      style: {
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        color: 'white',
      },
    };
  }, []);

  // Handle select slot (create new task/event)
  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setTaskForm({
      title: '',
      description: '',
      priority: 3,
      category: '',
      tags: '',
      estimatedDuration: 30,
      type: 'output',
    });
    setShowTaskModal(true);
  }, []);

  // Handle select event (edit existing)
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      setSelectedEvent(event);

      if (event.resource?.type === 'task') {
        const todo = todos.find((t) => t && t._id === event.resource?.taskId);
        if (todo) {
          setTaskForm({
            title: todo.task,
            description: todo.note || '',
            priority: todo.priority,
            category: todo.category || '',
            tags: todo.tags?.join(', ') || '',
            estimatedDuration: todo.estimatedDuration || 30,
            type: todo.type || 'output',
          });
          setShowTaskModal(true);
        }
      } else {
        setShowEventModal(true);
      }
    },
    [todos]
  );

  // Handle event move (drag and drop)
  const handleEventDrop = useCallback(
    async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      if (event.resource?.type === 'task' && event.resource.taskId) {
        try {
          await dispatch(
            updateTodoItem({
              _id: event.resource.taskId,
              updates: { deadline: start.toISOString() },
            })
          ).unwrap();
          toast.success('タスクの日付を変更しました');
        } catch (error) {
          toast.error('タスクの日付変更に失敗しました');
          console.error('Task update error:', error);
        }
      } else {
        // Update calendar event
        const updatedEvents = events.map((e) => (e.id === event.id ? { ...e, start, end } : e));
        setEvents(updatedEvents);
        saveEvents(updatedEvents);
        toast.success('イベントを移動しました');
      }
    },
    [dispatch, events, saveEvents]
  );

  // Handle event resize
  const handleEventResize = useCallback(
    ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      const updatedEvents = events.map((e) => (e.id === event.id ? { ...e, start, end } : e));
      setEvents(updatedEvents);
      saveEvents(updatedEvents);
      toast.success('イベントのサイズを変更しました');
    },
    [events, saveEvents]
  );

  // Handle task form submit
  const handleTaskSubmit = async () => {
    if (!taskForm.title.trim()) {
      toast.error('タスクタイトルを入力してください');
      return;
    }

    try {
      if (selectedEvent?.resource?.type === 'task' && selectedEvent.resource.taskId) {
        // Update existing task
        await dispatch(
          updateTodoItem({
            _id: selectedEvent.resource.taskId,
            updates: {
              task: taskForm.title,
              note: taskForm.description,
              priority: taskForm.priority,
              category: taskForm.category || undefined,
              tags: taskForm.tags
                ? taskForm.tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                : undefined,
              estimatedDuration: taskForm.estimatedDuration,
              type: taskForm.type,
            },
          })
        ).unwrap();
        toast.success('タスクを更新しました');
      } else {
        // Create new task
        const newTaskData = {
          task: taskForm.title,
          note: taskForm.description,
          priority: taskForm.priority,
          category: taskForm.category || undefined,
          tags: taskForm.tags
            ? taskForm.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            : undefined,
          estimatedDuration: taskForm.estimatedDuration,
          type: taskForm.type,
          deadline: selectedSlot?.start?.toISOString(),
          completed: false,
          isPrioritized: taskForm.priority >= 4,
        };

        await dispatch(addTodoItem(newTaskData)).unwrap();
        toast.success('新しいタスクを作成しました');
      }

      setShowTaskModal(false);
      setSelectedEvent(null);
      setSelectedSlot(null);
    } catch (error) {
      toast.error('タスクの保存に失敗しました');
      console.error('Task save error:', error);
    }
  };

  // Handle task delete
  const handleTaskDelete = async () => {
    if (!selectedEvent?.resource?.taskId) return;

    if (!window.confirm('このタスクを削除しますか？')) return;

    try {
      await dispatch(deleteTodoItem(selectedEvent.resource.taskId)).unwrap();
      toast.success('タスクを削除しました');
      setShowTaskModal(false);
      setSelectedEvent(null);
    } catch (error) {
      toast.error('タスクの削除に失敗しました');
      console.error('Task delete error:', error);
    }
  };

  // Handle task toggle completion
  const handleTaskToggle = async () => {
    if (!selectedEvent?.resource?.taskId) return;

    try {
      const todo = todos.find((t) => t && t._id === selectedEvent.resource?.taskId);
      if (todo) {
        await dispatch(
          updateTodoItem({
            _id: selectedEvent.resource.taskId,
            updates: { completed: !todo.completed },
          })
        ).unwrap();
        toast.success(todo.completed ? 'タスクを未完了に戻しました' : 'タスクを完了しました');
        setShowTaskModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      toast.error('タスクの状態変更に失敗しました');
      console.error('Task toggle error:', error);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              タスクカレンダー
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* Filters */}
              <Select
                value={filterStatus}
                onValueChange={(value: 'all' | 'active' | 'completed') => setFilterStatus(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">未完了</SelectItem>
                  <SelectItem value="completed">完了済み</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterPriority}
                onValueChange={(value: 'all' | 'high' | 'medium' | 'low') =>
                  setFilterPriority(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="high">高優先度</SelectItem>
                  <SelectItem value="medium">中優先度</SelectItem>
                  <SelectItem value="low">低優先度</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSlot({ start: new Date(), end: new Date() });
                  setShowTaskModal(true);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                新規タスク
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>通常タスク</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span>高優先度</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>緊急タスク</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>完了済み</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>イベント</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <div style={{ height: '600px' }}>
            <DnDCalendar
              localizer={localizer}
              events={allEvents}
              startAccessor={(event: object) => (event as CalendarEvent).start}
              endAccessor={(event: object) => (event as CalendarEvent).end}
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={(event: object) => handleSelectEvent(event as CalendarEvent)}
              onEventDrop={(args: object) =>
                handleEventDrop(args as { event: CalendarEvent; start: Date; end: Date })
              }
              onEventResize={(args: object) =>
                handleEventResize(args as { event: CalendarEvent; start: Date; end: Date })
              }
              selectable
              resizable
              eventPropGetter={(event: object) => eventStyleGetter(event as CalendarEvent)}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              messages={{
                next: '次へ',
                previous: '前へ',
                today: '今日',
                month: '月',
                week: '週',
                day: '日',
                agenda: '予定',
                date: '日付',
                time: '時間',
                event: 'イベント',
                noEventsInRange: 'この期間にイベントはありません',
                allDay: '終日',
              }}
              formats={{
                monthHeaderFormat: 'yyyy年M月',
                dayHeaderFormat: 'M月d日(EEE)',
                dayRangeHeaderFormat: ({ start, end }) => {
                  const startDate = new Date(start);
                  const endDate = new Date(end);
                  return `${startDate.getMonth() + 1}月${startDate.getDate()}日 - ${endDate.getMonth() + 1}月${endDate.getDate()}日`;
                },
                agendaDateFormat: 'M月d日(EEE)',
                agendaTimeFormat: 'HH:mm',
                agendaTimeRangeFormat: ({ start, end }) => {
                  const startTime = new Date(start);
                  const endTime = new Date(end);
                  return `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                },
              }}
              className="bg-white rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="max-w-2xl bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.resource?.type === 'task' ? 'タスク編集' : '新規タスク作成'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">タスクタイトル *</Label>
              <Input
                id="title"
                value={taskForm.title}
                onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="タスクのタイトルを入力"
              />
            </div>

            <div>
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="タスクの詳細説明"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">優先度</Label>
                <Select
                  value={taskForm.priority.toString()}
                  onValueChange={(value) =>
                    setTaskForm((prev) => ({ ...prev, priority: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">最高</SelectItem>
                    <SelectItem value="4">高</SelectItem>
                    <SelectItem value="3">普通</SelectItem>
                    <SelectItem value="2">低</SelectItem>
                    <SelectItem value="1">最低</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">タイプ</Label>
                <Select
                  value={taskForm.type}
                  onValueChange={(value: 'input' | 'output') =>
                    setTaskForm((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="output">アウトプット</SelectItem>
                    <SelectItem value="input">インプット</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">カテゴリ</Label>
                <Input
                  id="category"
                  value={taskForm.category}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="例: 仕事, 個人"
                />
              </div>

              <div>
                <Label htmlFor="estimatedDuration">予想時間（分）</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={taskForm.estimatedDuration}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      estimatedDuration: parseInt(e.target.value) || 30,
                    }))
                  }
                  min={5}
                  max={480}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">タグ（カンマ区切り）</Label>
              <Input
                id="tags"
                value={taskForm.tags}
                onChange={(e) => setTaskForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="例: 緊急, 重要, チーム"
              />
            </div>

            <div className="flex justify-between pt-4">
              <div className="flex gap-2">
                {selectedEvent?.resource?.type === 'task' && (
                  <>
                    <Button variant="outline" onClick={handleTaskToggle} className="gap-2">
                      {selectedEvent.resource.completed ? (
                        <>
                          <Clock className="h-4 w-4" />
                          未完了に戻す
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          完了にする
                        </>
                      )}
                    </Button>
                    <Button variant="destructive" onClick={handleTaskDelete} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      削除
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleTaskSubmit}>
                  {selectedEvent?.resource?.type === 'task' ? '更新' : '作成'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
