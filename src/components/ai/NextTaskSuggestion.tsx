import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TodoItem } from '@/types';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'deadline' | 'reminder';
}

interface NextTaskSuggestionProps {
  todos: TodoItem[];
  calendarEvents: CalendarEvent[];
  wbsItems?: any[]; // WBSの型定義は必要に応じて追加
}

export const NextTaskSuggestionComponent: React.FC<NextTaskSuggestionProps> = ({
  todos,
  calendarEvents,
  wbsItems = [],
}) => {
  const suggestedTask = useMemo(() => {
    // 1. 期限切れのタスクをチェック
    const overdueTasks = todos.filter(
      (todo) => !todo.completed && todo.deadline && new Date(todo.deadline) < new Date()
    );

    if (overdueTasks.length > 0) {
      return {
        task: overdueTasks[0].task,
        reason: '期限切れのタスクがあります',
        priority: 'high',
        type: 'overdue',
      };
    }

    // 2. 高優先度の未完了タスクをチェック
    const highPriorityTasks = todos.filter(
      (todo) => !todo.completed && (todo.isPrioritized || (todo.priority && todo.priority > 3))
    );

    if (highPriorityTasks.length > 0) {
      return {
        task: highPriorityTasks[0].task,
        reason: '高優先度のタスクがあります',
        priority: 'high',
        type: 'priority',
      };
    }

    // 3. 近日中のカレンダーイベントに関連するタスクをチェック
    const upcomingEvents = calendarEvents
      .filter((event) => event.start > new Date())
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (upcomingEvents.length > 0) {
      const nextEvent = upcomingEvents[0];
      const relatedTasks = todos.filter(
        (todo) => !todo.completed && todo.task.toLowerCase().includes(nextEvent.title.toLowerCase())
      );

      if (relatedTasks.length > 0) {
        return {
          task: relatedTasks[0].task,
          reason: `「${nextEvent.title}」の準備が必要です`,
          priority: 'medium',
          type: 'calendar',
        };
      }
    }

    // 4. その他の未完了タスク
    const incompleteTasks = todos.filter((todo) => !todo.completed);
    if (incompleteTasks.length > 0) {
      return {
        task: incompleteTasks[0].task,
        reason: '次のタスクに取り組みましょう',
        priority: 'normal',
        type: 'next',
      };
    }

    return null;
  }, [todos, calendarEvents, wbsItems]);

  if (!suggestedTask) {
    return (
      <Card className="bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">次のタスク</CardTitle>
          <Brain className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">すべてのタスクが完了しています！</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'transition-colors',
        suggestedTask.priority === 'high' && 'bg-red-50',
        suggestedTask.priority === 'medium' && 'bg-amber-50',
        suggestedTask.priority === 'normal' && 'bg-blue-50'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">次のタスク</CardTitle>
        {suggestedTask.priority === 'high' ? (
          <AlertTriangle className="h-4 w-4 text-red-600" />
        ) : (
          <Brain className="h-4 w-4 text-blue-600" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium">{suggestedTask.task}</p>
          <p className="text-xs text-gray-600">{suggestedTask.reason}</p>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              suggestedTask.priority === 'high' && 'border-red-200 text-red-600',
              suggestedTask.priority === 'medium' && 'border-amber-200 text-amber-600',
              suggestedTask.priority === 'normal' && 'border-blue-200 text-blue-600'
            )}
          >
            {suggestedTask.type === 'overdue' && '期限切れ'}
            {suggestedTask.type === 'priority' && '高優先度'}
            {suggestedTask.type === 'calendar' && 'カレンダー関連'}
            {suggestedTask.type === 'next' && '次のタスク'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
