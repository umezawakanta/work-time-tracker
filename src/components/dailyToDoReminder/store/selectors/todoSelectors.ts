import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Todo } from '@/types/todo';
import type { TodoItem as StoreTodoItem } from '@/types';

// LocalTodoItem型定義（Daily Todo Reminder用）
interface LocalTodoItem {
  id: string;
  _id?: string;
  task: string;
  completed: boolean;
  priority: number;
  isPrioritized: boolean;
  type: 'input' | 'output';
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  estimatedTime?: number;
  actualTime?: number;
  notes?: string;
}

// TodosState型定義
type GlobalTodo = Todo | StoreTodoItem;

interface TodosState {
  todos?: GlobalTodo[];
  loading?: boolean;
  error?: string | null;
}

// 型ガード
const isDomainTodo = (todo: GlobalTodo): todo is Todo => 'id' in (todo as any);
const isStoreTodo = (todo: GlobalTodo): todo is StoreTodoItem => '_id' in (todo as any);

// 最適化: mapGlobalToLocalTodoItem関数（メモ化のため外部に定義）
const mapGlobalToLocalTodoItem = (todo: GlobalTodo): LocalTodoItem => {
  if (!todo) {
    return {
      id: 'temp-' + Date.now() + '-' + Math.random(),
      _id: 'temp-' + Date.now() + '-' + Math.random(),
      task: '',
      completed: false,
      priority: 3,
      isPrioritized: false,
      type: 'input',
      category: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const id =
    (isDomainTodo(todo) ? todo.id : isStoreTodo(todo) ? todo._id : undefined) ||
    'temp-' + Date.now();
  const _id = (isStoreTodo(todo) ? todo._id : isDomainTodo(todo) ? todo.id : undefined) || id;

  const createdAt = (
    isDomainTodo(todo) ? todo.createdAt : isStoreTodo(todo) ? todo.createdAt : undefined
  ) as string | Date | undefined;

  const updatedAt = isDomainTodo(todo) ? (todo as Todo).updatedAt : undefined;
  const dueDate = isDomainTodo(todo)
    ? (todo as Todo).dueDate
    : isStoreTodo(todo)
      ? (todo as StoreTodoItem).deadline
      : undefined;

  const estimatedTime = isDomainTodo(todo)
    ? (todo as Todo).estimatedTime
    : isStoreTodo(todo)
      ? (todo as StoreTodoItem).estimatedDuration
      : undefined;

  const notes = isDomainTodo(todo)
    ? (todo as Todo).notes
    : isStoreTodo(todo)
      ? (todo as StoreTodoItem).note
      : undefined;

  return {
    id,
    _id,
    task: (todo as any).task || '',
    completed: (todo as any).completed ?? false,
    priority: (todo as any).priority || 3,
    isPrioritized: (todo as any).isPrioritized ?? false,
    type: (todo as any).type || 'input',
    category: (todo as any).category || '',
    tags: (todo as any).tags || [],
    createdAt: createdAt ? createdAt.toString() : new Date().toISOString(),
    updatedAt: updatedAt ? updatedAt.toString() : new Date().toISOString(),
    dueDate: dueDate ? dueDate.toString() : undefined,
    estimatedTime,
    actualTime: isDomainTodo(todo) ? (todo as Todo).actualTime : undefined,
    notes,
  };
};

// 基本セレクター - todos状態を取得
const selectTodosState = createSelector(
  (state: RootState) => state.todo,
  (todosState): TodosState => ({
    todos: todosState?.items ?? [],
    loading: todosState?.status === 'loading',
    error: todosState?.error ?? null,
  })
);

// todos配列を取得するセレクター（安定した参照を返す）
const selectTodosArray = createSelector(
  [selectTodosState],
  (todosState) => todosState?.todos || []
);

// ローディング状態を取得
export const selectTodosLoading = createSelector(
  [selectTodosState],
  (todosState) => todosState?.loading || false
);

// エラー状態を取得
export const selectTodosError = createSelector(
  [selectTodosState],
  (todosState) => todosState?.error || null
);

// 全てのTODOを取得するセレクター（最適化済み）
export const selectAllTodos = createSelector([selectTodosArray], (todos): LocalTodoItem[] => {
  // 配列のフィルタリングとマッピングを一度に実行
  return (todos as GlobalTodo[]).filter((todo) => todo != null).map(mapGlobalToLocalTodoItem);
});

// 完了状態別のTODOを取得
export const selectTodosByStatus = createSelector(
  [selectAllTodos, (_state: RootState, completed: boolean) => completed],
  (todos, completed) => {
    return todos.filter((todo) => todo.completed === completed);
  }
);

// 完了済みTODOを取得
export const selectCompletedTodos = createSelector([selectAllTodos], (todos) =>
  todos.filter((todo) => todo.completed)
);

// 未完了TODOを取得
export const selectActiveTodos = createSelector([selectAllTodos], (todos) =>
  todos.filter((todo) => !todo.completed)
);

// 優先度別のTODOを取得
export const selectTodosByPriority = createSelector(
  [selectAllTodos, (_state: RootState, priority: number) => priority],
  (todos, priority) => {
    return todos.filter((todo) => todo.priority === priority);
  }
);

// カテゴリ別のTODOを取得
export const selectTodosByCategory = createSelector(
  [selectAllTodos, (_state: RootState, category: string) => category],
  (todos, category) => {
    if (!category) return todos;
    return todos.filter((todo) => todo.category === category);
  }
);

// TODOの統計情報
export const selectTodoStats = createSelector([selectAllTodos], (todos) => {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const pending = total - completed;
  const inputCount = todos.filter((todo) => todo.type === 'input').length;
  const outputCount = todos.filter((todo) => todo.type === 'output').length;

  return {
    total,
    completed,
    pending,
    inputCount,
    outputCount,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
});

// 今日期限のTODOを取得
export const selectTodaysTodos = createSelector([selectAllTodos], (todos) => {
  const today = new Date().toISOString().split('T')[0];
  return todos.filter((todo) => todo.dueDate && todo.dueDate.startsWith(today));
});

// 優先度の高いTODOを取得
export const selectHighPriorityTodos = createSelector([selectAllTodos], (todos) =>
  todos.filter((todo) => todo.priority >= 4 || todo.isPrioritized)
);
