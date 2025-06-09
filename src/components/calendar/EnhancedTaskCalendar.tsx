import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Trash2,
  GripVertical,
  Brain,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems, updateTodoItem, deleteTodoItem, addTodoItem } from '@/store/todoSlice';
import { toast } from 'react-hot-toast';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ja';
import TaskForm from '../tasks/TaskForm';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface TaskFormData {
  title: string;
  description: string;
  priority: number;
  category: string;
  tags: string;
  estimatedDuration: number;
  type: 'input' | 'output';
  deadline?: Date;
}

interface TaskEvent {
  id: string;
  title: string;
  date: Date;
  taskId: string;
  completed: boolean;
  priority: number;
  isPrioritized: boolean;
  category?: string;
  tags?: string[];
  estimatedDuration?: number;
}

interface EnhancedTaskCalendarProps {
  className?: string;
}

// Momentローカライザーの設定
moment.locale('ja');
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'task' | 'event';
    priority: number;
    completed: boolean;
    category: string;
  };
}

export const EnhancedTaskCalendar: React.FC<EnhancedTaskCalendarProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  // Task form state
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 3,
    category: '',
    tags: '',
    estimatedDuration: 60,
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

  // Convert todos to task events with date filtering
  const taskEvents: TaskEvent[] = useMemo(() => {
    return todos
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
      .map((todo) => ({
        id: todo._id,
        title: todo.task,
        date: todo.deadline ? new Date(todo.deadline) : new Date(),
        taskId: todo._id,
        completed: todo.completed,
        priority: todo.priority,
        isPrioritized: todo.isPrioritized,
        category: todo.category,
        tags: todo.tags,
        estimatedDuration: todo.estimatedDuration,
      }));
  }, [todos, filterStatus, filterPriority]);

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

  // Get tasks for a specific date
  const getTasksForDate = useCallback(
    (date: Date) => {
      return taskEvents.filter((task) => {
        const taskDate = new Date(task.date);
        return taskDate.toDateString() === date.toDateString();
      });
    },
    [taskEvents]
  );

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

      // Find the task
      const task = taskEvents.find((t) => t.id === draggableId);
      if (!task) {
        toast.error('タスクが見つかりません');
        return;
      }

      // Update task deadline
      try {
        await dispatch(
          updateTodoItem({
            _id: task.taskId,
            updates: { deadline: destinationDate.toISOString() },
          })
        ).unwrap();

        toast.success('タスクの日付を変更しました');
      } catch (error) {
        toast.error('タスクの日付変更に失敗しました');
        console.error('Task date update error:', error);
      }
    },
    [taskEvents, dispatch]
  );

  // Handle task click
  const handleTaskClick = useCallback(
    (task: TaskEvent) => {
      setSelectedTask(task);
      const todo = todos.find((t) => t._id === task.taskId);
      if (todo) {
        setTaskForm({
          title: todo.task,
          description: todo.note || '',
          priority: todo.priority,
          category: todo.category || '',
          tags: todo.tags?.join(', ') || '',
          estimatedDuration: todo.estimatedDuration || 60,
          type: todo.type || 'output',
          deadline: todo.deadline ? new Date(todo.deadline) : undefined,
        });
      }
      setShowTaskModal(true);
    },
    [todos]
  );

  // Handle date click
  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTask(null);
    setTaskForm({
      title: '',
      description: '',
      priority: 3,
      category: '',
      tags: '',
      estimatedDuration: 60,
      type: 'output',
      deadline: date,
    });
    setShowTaskModal(true);
  }, []);

  // Handle task form submit
  const handleTaskSubmit = async () => {
    if (!taskForm.title.trim()) {
      toast.error('タスクタイトルを入力してください');
      return;
    }

    try {
      if (selectedTask) {
        // Update existing task
        await dispatch(
          updateTodoItem({
            _id: selectedTask.taskId,
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
              deadline: taskForm.deadline?.toISOString(),
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
          deadline: (taskForm.deadline || selectedDate)?.toISOString(),
          completed: false,
          isPrioritized: taskForm.priority >= 4,
        };

        await dispatch(addTodoItem(newTaskData as any)).unwrap();
        toast.success('新しいタスクを作成しました');
      }

      setShowTaskModal(false);
      setSelectedTask(null);
      setSelectedDate(null);
    } catch (error) {
      toast.error('タスクの保存に失敗しました');
      console.error('Task save error:', error);
    }
  };

  // Handle task delete
  const handleTaskDelete = async () => {
    if (!selectedTask) return;

    if (!window.confirm('このタスクを削除しますか？')) return;

    try {
      await dispatch(deleteTodoItem(selectedTask.taskId)).unwrap();
      toast.success('タスクを削除しました');
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (error) {
      toast.error('タスクの削除に失敗しました');
      console.error('Task delete error:', error);
    }
  };

  // Handle task toggle completion
  const handleTaskToggle = async () => {
    if (!selectedTask) return;

    try {
      await dispatch(
        updateTodoItem({
          _id: selectedTask.taskId,
          updates: { completed: !selectedTask.completed },
        })
      ).unwrap();
      toast.success(selectedTask.completed ? 'タスクを未完了に戻しました' : 'タスクを完了しました');
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (error) {
      toast.error('タスクの状態変更に失敗しました');
      console.error('Task toggle error:', error);
    }
  };

  // AI Suggestions (placeholder for Phase 2)
  const generateAISuggestions = useCallback(() => {
    // This will be implemented in Phase 2
    setShowAISuggestions(true);
    toast.success('AI機能はPhase 2で実装予定です');
  }, []);

  // Render task card
  const renderTaskCard = (task: TaskEvent, index: number, dateStr: string) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'group p-2 mb-2 rounded-md cursor-pointer transition-all duration-200',
            task.completed
              ? 'bg-green-100 text-green-800 line-through opacity-75'
              : task.isPrioritized
                ? 'bg-red-100 text-red-800 border border-red-200'
                : task.priority > 3
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-blue-800',
            snapshot.isDragging && 'shadow-lg scale-105 rotate-2',
            'hover:shadow-md hover:scale-102'
          )}
          onClick={() => handleTaskClick(task)}
        >
          <div className="flex items-center gap-2">
            <div
              {...provided.dragHandleProps}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-3 w-3" />
            </div>

            {task.completed ? (
              <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
            ) : task.isPrioritized ? (
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
            ) : (
              <Clock className="h-3 w-3 flex-shrink-0" />
            )}

            <span className="text-xs font-medium truncate flex-1">{task.title}</span>

            {task.estimatedDuration && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {task.estimatedDuration}m
              </Badge>
            )}
          </div>

          {task.category && (
            <div className="mt-1">
              <Badge variant="outline" className="text-xs">
                {task.category}
              </Badge>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );

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

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-1">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={index} className="text-center font-semibold p-3 bg-gray-50 rounded-md">
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-32 bg-gray-50 opacity-50 rounded-md"></div>;
            }

            const dateStr = day.toISOString().split('T')[0];
            const dayTasks = getTasksForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <Droppable key={index} droppableId={`date-${dateStr}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'h-32 border border-gray-200 p-2 rounded-md relative overflow-hidden cursor-pointer transition-all duration-200',
                      isToday && 'bg-blue-50 border-blue-300',
                      snapshot.isDraggingOver && 'bg-green-50 border-green-300 scale-105',
                      'hover:bg-gray-50'
                    )}
                    onClick={() => handleDateClick(day)}
                  >
                    <div
                      className={cn(
                        'text-sm font-medium mb-1',
                        isToday ? 'text-blue-600' : 'text-gray-700'
                      )}
                    >
                      {day.getDate()}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {dayTasks
                        .slice(0, 3)
                        .map((task, taskIndex) => renderTaskCard(task, taskIndex, dateStr))}

                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>

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

  const monthYear = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  // ToDoをカレンダーイベントに変換
  const events: CalendarEvent[] = todos
    .filter((todo) => todo.deadline)
    .map((todo) => ({
      id: todo._id,
      title: todo.task,
      start: new Date(todo.deadline!),
      end: new Date(todo.deadline!),
      resource: {
        type: 'task' as const,
        priority: todo.priority,
        completed: todo.completed,
        category: todo.category || 'general',
      },
    }));

  // イベントスタイルの設定
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const { priority, completed, category } = event.resource;

    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    if (completed) {
      backgroundColor = '#10b981';
      borderColor = '#10b981';
    } else {
      switch (priority) {
        case 1:
          backgroundColor = '#ef4444';
          borderColor = '#dc2626';
          break;
        case 2:
          backgroundColor = '#f97316';
          borderColor = '#ea580c';
          break;
        case 3:
          backgroundColor = '#eab308';
          borderColor = '#ca8a04';
          break;
        case 4:
          backgroundColor = '#22c55e';
          borderColor = '#16a34a';
          break;
        case 5:
          backgroundColor = '#6b7280';
          borderColor = '#4b5563';
          break;
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        opacity: completed ? 0.7 : 1,
        fontSize: '12px',
        padding: '2px 4px',
        borderRadius: '4px',
      },
    };
  }, []);

  // ドラッグ&ドロップでタスク日付を変更
  const handleEventDrop = useCallback(
    async ({ event, start, end }: any) => {
      try {
        await dispatch(
          updateTodoItem({
            _id: event.id,
            updates: { deadline: start.toISOString() },
          })
        ).unwrap();
      } catch (error) {
        console.error('Failed to update task deadline:', error);
      }
    },
    [dispatch]
  );

  // スロット選択（新しいタスク作成）
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedDate(start);
    setShowTaskModal(true);
  }, []);

  // タスク選択（編集）
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      const task = todos.find((todo) => todo._id === event.id);
      if (task) {
        // Convert TodoItem to TaskEvent format or use task directly
        setSelectedTask(task as any); // Quick fix
        setShowTaskModal(true);
      }
    },
    [todos]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              拡張タスクカレンダー
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={generateAISuggestions} className="gap-2">
                <Brain className="h-4 w-4" />
                AI提案
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateClick(new Date())}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                新規タスク
              </Button>
            </div>
          </div>

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
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
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
                onValueChange={(value: any) => setFilterPriority(value)}
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
            </div>
          </div>

          {/* Stats and Legend */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>通常タスク</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                <span>高優先度</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                <span>緊急</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>完了済み</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              総タスク: {taskEvents.length} | 完了: {taskEvents.filter((t) => t.completed).length} |
              残り: {taskEvents.filter((t) => !t.completed).length}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            view={view}
            date={currentDate}
            onView={setView}
            onNavigate={setCurrentDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            selectable
            style={{ height: 600 }}
            messages={{
              next: '次',
              previous: '前',
              today: '今日',
              month: '月',
              week: '週',
              day: '日',
              agenda: 'アジェンダ',
              noEventsInRange: 'この期間にイベントはありません',
            }}
            formats={{
              monthHeaderFormat: 'YYYY年 M月',
              dayHeaderFormat: 'M月D日 (ddd)',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${moment(start).format('M月D日')} - ${moment(end).format('M月D日')}`,
            }}
          />
        </CardContent>
      </Card>

      {/* Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'タスク編集' : '新規タスク作成'}</DialogTitle>
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
                      estimatedDuration: parseInt(e.target.value) || 60,
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
                {selectedTask && (
                  <>
                    <Button variant="outline" onClick={handleTaskToggle} className="gap-2">
                      {selectedTask.completed ? (
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
                <Button onClick={handleTaskSubmit}>{selectedTask ? '更新' : '作成'}</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
