import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Todo } from '@/types/todo';

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
interface TodosState {
  todos?: Todo[];
  loading?: boolean;
  error?: string | null;
}

// 最適化: mapGlobalToLocalTodoItem関数（メモ化のため外部に定義）
const mapGlobalToLocalTodoItem = (todo: Todo): LocalTodoItem => {
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
      updatedAt: new Date().toISOString()
    };
  }

  return {
    id: todo.id || todo._id || 'temp-' + Date.now(),
    _id: todo._id || todo.id || 'temp-' + Date.now(),
    task: todo.task || '',
    completed: todo.completed ?? false,
    priority: todo.priority || 3,
    isPrioritized: todo.isPrioritized ?? false,
    type: todo.type || 'input',
    category: todo.category || '',
    tags: todo.tags || [],
    createdAt: todo.createdAt?.toString() || new Date().toISOString(),
    updatedAt: todo.updatedAt?.toString() || new Date().toISOString(),
    dueDate: todo.dueDate?.toString(),
    estimatedTime: todo.estimatedTime,
    actualTime: todo.actualTime,
    notes: todo.notes
  };
};

// 基本セレクター - todos状態を取得
const selectTodosState = createSelector(
  (state: RootState) => state.todos,
  (todosState): TodosState => todosState || { todos: [], loading: false, error: null }
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
export const selectAllTodos = createSelector(
  [selectTodosArray],
  (todos): LocalTodoItem[] => {
    // 配列のフィルタリングとマッピングを一度に実行
    return todos
      .filter((todo: Todo) => todo != null)
      .map(mapGlobalToLocalTodoItem);
  }
);

// 完了状態別のTODOを取得
export const selectTodosByStatus = createSelector(
  [selectAllTodos, (_state: RootState, completed: boolean) => completed],
  (todos, completed) => {
    return todos.filter(todo => todo.completed === completed);
  }
);

// 完了済みTODOを取得
export const selectCompletedTodos = createSelector(
  [selectAllTodos],
  (todos) => todos.filter(todo => todo.completed)
);

// 未完了TODOを取得
export const selectActiveTodos = createSelector(
  [selectAllTodos],
  (todos) => todos.filter(todo => !todo.completed)
);

// 優先度別のTODOを取得
export const selectTodosByPriority = createSelector(
  [selectAllTodos, (_state: RootState, priority: number) => priority],
  (todos, priority) => {
    return todos.filter(todo => todo.priority === priority);
  }
);

// カテゴリ別のTODOを取得
export const selectTodosByCategory = createSelector(
  [selectAllTodos, (_state: RootState, category: string) => category],
  (todos, category) => {
    if (!category) return todos;
    return todos.filter(todo => todo.category === category);
  }
);

// TODOの統計情報
export const selectTodoStats = createSelector(
  [selectAllTodos],
  (todos) => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const inputCount = todos.filter(todo => todo.type === 'input').length;
    const outputCount = todos.filter(todo => todo.type === 'output').length;
    
    return {
      total,
      completed,
      pending,
      inputCount,
      outputCount,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
);

// 今日期限のTODOを取得
export const selectTodaysTodos = createSelector(
  [selectAllTodos],
  (todos) => {
    const today = new Date().toISOString().split('T')[0];
    return todos.filter(todo => 
      todo.dueDate && todo.dueDate.startsWith(today)
    );
  }
);

// 優先度の高いTODOを取得
export const selectHighPriorityTodos = createSelector(
  [selectAllTodos],
  (todos) => todos.filter(todo => todo.priority >= 4 || todo.isPrioritized)
);
