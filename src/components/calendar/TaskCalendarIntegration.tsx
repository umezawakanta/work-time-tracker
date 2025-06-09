import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock, CheckCircle, Plus } from 'lucide-react';

import { RootState, AppDispatch } from '@/store';
import { updateTodoItem, addTodoItem, selectTodos } from '@/store/todoSlice';
import { TodoItem } from '@/types';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// 日本語のローカライザーを設定
const locales = {
  ja: ja,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// カレンダーイベントの型定義
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: TodoItem;
  type: 'task' | 'deadline';
}

interface TaskCalendarIntegrationProps {
  height?: number;
}

const TaskCalendarIntegration: React.FC<TaskCalendarIntegrationProps> = ({ height = 600 }) => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos);

  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // 新規タスク作成フォーム
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 3,
    allDay: true,
    startTime: '',
    endTime: '',
  });

  // TodoItemをカレンダーイベントに変換
  const calendarEvents = useMemo(() => {
    return todos.reduce((events: CalendarEvent[], todo) => {
      // 期限のあるタスクを期限日にイベントとして表示
      if (todo.deadline) {
        const deadlineDate = new Date(todo.deadline);
        events.push({
          id: `deadline-${todo._id}`,
          title: `📅 ${todo.task}`,
          start: deadlineDate,
          end: deadlineDate,
          resource: todo,
          type: 'deadline',
        });
      }

      // 進行中または今日作成されたタスクを今日のイベントとして表示
      if (todo.createdAt && new Date(todo.createdAt).toDateString() === new Date().toDateString()) {
        const today = new Date();
        events.push({
          id: `task-${todo._id}`,
          title: `${todo.completed ? '✅' : '🔘'} ${todo.task}`,
          start: today,
          end: today,
          resource: todo,
          type: 'task',
        });
      }

      return events;
    }, []);
  }, [todos]);

  // イベントの色を決定
  const eventStyleGetter = (event: CalendarEvent) => {
    const { resource, type } = event;

    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    if (type === 'deadline') {
      const daysUntilDeadline = Math.ceil(
        (event.start.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline < 0) {
        backgroundColor = '#dc2626'; // 期限切れ - 赤
        borderColor = '#dc2626';
      } else if (daysUntilDeadline === 0) {
        backgroundColor = '#ea580c'; // 今日期限 - オレンジ
        borderColor = '#ea580c';
      } else if (daysUntilDeadline <= 3) {
        backgroundColor = '#d97706'; // 3日以内 - 黄色
        borderColor = '#d97706';
      } else {
        backgroundColor = '#2563eb'; // 余裕あり - 青
        borderColor = '#2563eb';
      }
    } else if (type === 'task') {
      if (resource.completed) {
        backgroundColor = '#16a34a'; // 完了 - 緑
        borderColor = '#16a34a';
      } else {
        backgroundColor = '#6b7280'; // 未着手 - グレー
        borderColor = '#6b7280';
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        opacity: resource.completed ? 0.7 : 1,
      },
    };
  };

  // イベントをクリックした時の処理
  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // スロット（日付）を選択した時の処理
  const handleSlotSelect = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setNewTaskForm({
      title: '',
      description: '',
      priority: 3,
      allDay: true,
      startTime: format(start, 'HH:mm'),
      endTime: format(end, 'HH:mm'),
    });
    setIsCreateModalOpen(true);
  };

  // 新規タスクの作成
  const handleCreateTask = async () => {
    if (!newTaskForm.title.trim() || !selectedSlot) {
      toast.error('タイトルを入力してください');
      return;
    }

    try {
      const deadline = newTaskForm.allDay
        ? selectedSlot.start.toISOString()
        : new Date(
            selectedSlot.start.getFullYear(),
            selectedSlot.start.getMonth(),
            selectedSlot.start.getDate(),
            parseInt(newTaskForm.endTime.split(':')[0]),
            parseInt(newTaskForm.endTime.split(':')[1])
          ).toISOString();

      await dispatch(
        addTodoItem({
          task: newTaskForm.title,
          priority: newTaskForm.priority,
          isPrioritized: newTaskForm.priority >= 4,
          type: 'input',
          deadline,
          createdAt: new Date().toISOString(),
        })
      ).unwrap();

      toast.success('タスクを作成しました');
      setIsCreateModalOpen(false);
      setSelectedSlot(null);
      setNewTaskForm({
        title: '',
        description: '',
        priority: 3,
        allDay: true,
        startTime: '',
        endTime: '',
      });
    } catch (error) {
      toast.error('タスクの作成に失敗しました');
    }
  };

  // タスクの状態変更
  const handleTaskStatusChange = async (taskId: string, completed: boolean) => {
    try {
      await dispatch(
        updateTodoItem({
          _id: taskId,
          updates: { completed },
        })
      ).unwrap();

      toast.success(completed ? 'タスクを完了しました' : 'タスクを未完了に戻しました');
      setIsEventModalOpen(false);
    } catch (error) {
      toast.error('タスクの更新に失敗しました');
    }
  };

  // 優先度バッジの色
  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'destructive';
    if (priority === 3) return 'default';
    return 'secondary';
  };

  // メッセージ表示
  const messages = {
    allDay: '終日',
    previous: '前へ',
    next: '次へ',
    today: '今日',
    month: '月',
    week: '週',
    day: '日',
    agenda: 'アジェンダ',
    date: '日付',
    time: '時間',
    event: 'イベント',
    noEventsInRange: 'この期間にはイベントがありません',
    showMore: (total: number) => `他 ${total} 件`,
  };

  return (
    <div className="space-y-6">
      {/* カレンダーヘッダー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              タスクカレンダー
            </CardTitle>
            <div className="flex gap-2">
              <Select
                value={view}
                onValueChange={(value: 'month' | 'week' | 'day') => setView(value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">月</SelectItem>
                  <SelectItem value="week">週</SelectItem>
                  <SelectItem value="day">日</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 凡例 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>期限切れ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-600 rounded"></div>
              <span>今日期限</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-600 rounded"></div>
              <span>3日以内期限</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>期限まで余裕</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>完了済み</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <span>進行中</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メインカレンダー */}
      <Card>
        <CardContent className="p-4">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height }}
            onSelectEvent={handleEventSelect}
            onSelectSlot={handleSlotSelect}
            eventPropGetter={eventStyleGetter}
            selectable
            view={view}
            onView={(newView) => {
              if (newView === 'month' || newView === 'week' || newView === 'day') {
                setView(newView);
              }
            }}
            date={currentDate}
            onNavigate={setCurrentDate}
            messages={messages}
            culture="ja"
            formats={{
              monthHeaderFormat: 'YYYY年M月',
              dayHeaderFormat: 'M月D日(ddd)',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${format(start, 'M月D日', { locale: ja })} - ${format(end, 'M月D日', { locale: ja })}`,
            }}
          />
        </CardContent>
      </Card>

      {/* イベント詳細モーダル */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タスク詳細</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{selectedEvent.resource.task}</h3>
                {selectedEvent.resource.category && (
                  <p className="text-gray-600 mt-1">{selectedEvent.resource.category}</p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge variant={getPriorityColor(selectedEvent.resource.priority || 3)}>
                  優先度 {selectedEvent.resource.priority || 3}
                </Badge>

                {selectedEvent.type === 'deadline' && (
                  <Badge variant="outline">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    期限: {format(selectedEvent.start, 'M月D日', { locale: ja })}
                  </Badge>
                )}

                {selectedEvent.resource.completed && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    完了済み
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {!selectedEvent.resource.completed ? (
                  <Button
                    onClick={() => handleTaskStatusChange(selectedEvent.resource._id, true)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    完了にする
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleTaskStatusChange(selectedEvent.resource._id, false)}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    未完了に戻す
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 新規タスク作成モーダル */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規タスク作成</DialogTitle>
            <DialogDescription>
              {selectedSlot && format(selectedSlot.start, 'M月D日', { locale: ja })}{' '}
              にタスクを作成します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">タスクタイトル *</label>
              <Input
                value={newTaskForm.title}
                onChange={(e) => setNewTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="タスクのタイトルを入力"
              />
            </div>

            <div>
              <label className="text-sm font-medium">説明</label>
              <Textarea
                value={newTaskForm.description}
                onChange={(e) =>
                  setNewTaskForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="タスクの説明（任意）"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">優先度</label>
                <Select
                  value={newTaskForm.priority.toString()}
                  onValueChange={(value) =>
                    setNewTaskForm((prev) => ({ ...prev, priority: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">最高 (5)</SelectItem>
                    <SelectItem value="4">高 (4)</SelectItem>
                    <SelectItem value="3">中 (3)</SelectItem>
                    <SelectItem value="2">低 (2)</SelectItem>
                    <SelectItem value="1">最低 (1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newTaskForm.allDay}
                  onChange={(e) =>
                    setNewTaskForm((prev) => ({ ...prev, allDay: e.target.checked }))
                  }
                />
                <label htmlFor="allDay" className="text-sm font-medium">
                  終日
                </label>
              </div>
            </div>

            {!newTaskForm.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">開始時間</label>
                  <Input
                    type="time"
                    value={newTaskForm.startTime}
                    onChange={(e) =>
                      setNewTaskForm((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">終了時間</label>
                  <Input
                    type="time"
                    value={newTaskForm.endTime}
                    onChange={(e) =>
                      setNewTaskForm((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskCalendarIntegration;
