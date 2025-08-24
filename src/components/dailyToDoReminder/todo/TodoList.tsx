import React, { useMemo, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ListChecks, Flag, Sparkles, CheckCircle2, Circle, Network } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { updateTodoItem, deleteTodoItem } from '@/store/todoSlice';
import { AppDispatch } from '@/store';
import { TodoItem } from '@/types';
import { getErrorMessage } from '../utils/errorUtils';

// Sub-components
import { TodoItem as TodoItemComponent } from './TodoItem';
import { TodoMindMap } from './TodoMindMap';

interface TodoListProps {
  readonly todos: readonly TodoItem[];
  readonly isPremium?: boolean;
  readonly onAnalyzeRequest?: () => void;
}

interface GroupedTodos {
  readonly prioritized: readonly TodoItem[];
  readonly active: readonly TodoItem[];
  readonly completed: readonly TodoItem[];
}

/**
 * Todo List Component
 * Advanced task list with drag & drop, grouping, and premium features
 */
export const TodoList: React.FC<TodoListProps> = ({
  todos,
  isPremium = false,
  onAnalyzeRequest,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showMindMap, setShowMindMap] = useState(false);

  // Group todos by status and priority
  const groupedTodos = useMemo((): GroupedTodos => {
    const prioritized: TodoItem[] = [];
    const active: TodoItem[] = [];
    const completed: TodoItem[] = [];

    todos.forEach((todo: TodoItem) => {
      if (todo.completed) {
        completed.push(todo);
      } else if (todo.isPrioritized) {
        prioritized.push(todo);
      } else {
        active.push(todo);
      }
    });

    // Sort each group by priority (descending) and creation date
    const sortTodos = (a: TodoItem, b: TodoItem): number => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return (
        new Date(b.createdAt || new Date()).getTime() -
        new Date(a.createdAt || new Date()).getTime()
      );
    };

    return {
      prioritized: prioritized.sort(sortTodos),
      active: active.sort(sortTodos),
      completed: completed.sort(sortTodos),
    };
  }, [todos]);

  const handleToggleComplete = useCallback(
    async (todo: TodoItem): Promise<void> => {
      try {
        // 安全性チェック
        const todoId = todo._id;
        if (!todoId) {
          toast.error('タスクIDが見つかりません');
          return;
        }

        // Toggle completion status using updateTodoItem
        await dispatch(
          updateTodoItem({
            _id: todoId,
            updates: { completed: !todo.completed },
          })
        ).unwrap();

        const message = todo.completed ? 'タスクを未完了に戻しました' : '🎉 タスクを完了しました！';
        toast.success(message);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(`操作に失敗しました: ${errorMessage}`);
      }
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    async (todoId: string): Promise<void> => {
      if (!window.confirm('このタスクを削除しますか？')) return;

      try {
        await dispatch(deleteTodoItem(todoId)).unwrap();
        toast.success('タスクを削除しました');
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(`削除に失敗しました: ${errorMessage}`);
      }
    },
    [dispatch]
  );

  const handleUpdate = useCallback(
    async (todoId: string, updates: Partial<TodoItem>): Promise<void> => {
      try {
        // 安全性チェック
        if (!todoId) {
          toast.error('更新対象のタスクIDが見つかりません');
          return;
        }

        // TodoItem型を直接使用（マッピング不要）
        const mappedUpdates: Partial<TodoItem> = {
          ...updates,
        };

        await dispatch(updateTodoItem({ _id: todoId, updates: mappedUpdates })).unwrap();
        toast.success('タスクを更新しました');
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(`更新に失敗しました: ${errorMessage}`);
      }
    },
    [dispatch]
  );

  const getEstimatedTime = (todos: readonly TodoItem[]): number => {
    return todos.reduce((total, todo) => {
      return total + (todo.estimatedDuration || 0);
    }, 0);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}分`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
  };

  if (todos.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Circle className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">タスクがありません</h3>
              <p className="text-sm text-gray-500">新しいタスクを追加して始めましょう</p>
            </div>
            {isPremium && onAnalyzeRequest && (
              <Button onClick={onAnalyzeRequest} variant="outline" className="mt-2">
                <Sparkles className="h-4 w-4 mr-2" />
                AI分析を開始
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* マインドマップモーダル */}
      {/* TODO: TodoMindMapをTodoItem型に対応させる必要があります */}
      {/* {showMindMap && <TodoMindMap todos={todos} onClose={() => setShowMindMap(false)} />} */}

      {/* Summary Stats */}
      {isPremium && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ListChecks className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">タスク概要</h3>
                  <p className="text-sm text-blue-700">
                    全{todos.length}件 • 完了{groupedTodos.completed.length}件 • 残り
                    {groupedTodos.prioritized.length + groupedTodos.active.length}件
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMindMap(true)}
                  className="gap-2"
                >
                  <Network className="h-4 w-4" />
                  マインドマップ表示
                </Button>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-900">予想作業時間</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatDuration(
                      getEstimatedTime([...groupedTodos.prioritized, ...groupedTodos.active])
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 非プレミアムユーザー向けのマインドマップボタン */}
      {!isPremium && todos.length > 0 && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Network className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-medium text-indigo-900">タスクマインドマップ</h3>
                  <p className="text-sm text-indigo-700">タスクを視覚的に整理して全体像を把握</p>
                </div>
              </div>
              <Button
                onClick={() => setShowMindMap(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                表示する
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Prioritized Tasks */}
        {groupedTodos.prioritized.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-500" />
              <h3 className="font-semibold text-gray-900">重要タスク</h3>
              <Badge variant="destructive" className="text-xs">
                {groupedTodos.prioritized.length}
              </Badge>
              {isPremium && (
                <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {groupedTodos.prioritized.map((todo, index) => (
                <TodoItemComponent
                  key={
                    todo._id || `prioritized-todo-${index}-${todo.task?.slice(0, 10) || 'unknown'}`
                  }
                  todo={todo}
                  onToggle={handleToggleComplete}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  isPremium={isPremium}
                  dragHandleProps={null}
                  isHighPriority={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active Tasks */}
        {groupedTodos.active.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold text-gray-900">今日のタスク</h3>
              <Badge variant="secondary" className="text-xs">
                {groupedTodos.active.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {groupedTodos.active.map((todo, index) => (
                <TodoItemComponent
                  key={todo._id || `active-todo-${index}-${todo.task?.slice(0, 10) || 'unknown'}`}
                  todo={todo}
                  onToggle={handleToggleComplete}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  isPremium={isPremium}
                  dragHandleProps={null}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {groupedTodos.completed.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold text-gray-700">完了済み</h3>
              <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                {groupedTodos.completed.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {groupedTodos.completed.slice(0, isPremium ? 10 : 3).map((todo, index) => (
                <TodoItemComponent
                  key={
                    todo._id || `completed-todo-${index}-${todo.task?.slice(0, 10) || 'unknown'}`
                  }
                  todo={todo}
                  onToggle={handleToggleComplete}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  isPremium={isPremium}
                  dragHandleProps={null}
                  isCompleted={true}
                />
              ))}

              {groupedTodos.completed.length > (isPremium ? 10 : 3) && (
                <p className="text-xs text-gray-500 text-center py-2">
                  ...他 {groupedTodos.completed.length - (isPremium ? 10 : 3)} 件の完了済みタスク
                  {!isPremium && <span className="ml-1 text-blue-500">(Premiumで全て表示)</span>}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Premium Analysis CTA */}
      {!isPremium && onAnalyzeRequest && todos.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="font-medium text-amber-900">AIタスク分析</h3>
                  <p className="text-sm text-amber-700">
                    タスクの傾向分析と最適化提案をAIが行います
                  </p>
                </div>
              </div>
              <Button onClick={onAnalyzeRequest} className="bg-amber-600 hover:bg-amber-700">
                分析を開始
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
