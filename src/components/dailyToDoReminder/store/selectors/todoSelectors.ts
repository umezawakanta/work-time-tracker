import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { TodoItem as GlobalTodoItem } from '@/types';
import { TodoItem, Todo, todoItemsToTodos } from '../../types';

// Extended TodoState interface to include additional properties
interface ExtendedTodoState {
  items?: GlobalTodoItem[];
  status?: string;
  error?: string | null;
  history?: Record<string, number>;
  dailyHistory?: Array<{ date: string; count: number }>;
  isPremium?: boolean;
}

// Mapper function to convert global TodoItem to local TodoItem
const mapGlobalToLocalTodoItem = (globalItem: GlobalTodoItem): TodoItem => {
  // 緊急修正: undefined/nullチェックを追加
  if (!globalItem) {
    console.warn('Todo item is undefined or null');
    return {
      id: 'temp-' + Date.now(),
      text: '',
      completed: false,
      priority: 3,
      isPrioritized: false,
      type: 'output',
      deadline: undefined,
      createdAt: new Date().toISOString(),
      category: undefined,
      tags: undefined,
    };
  }

  return {
    // _idとidの両方をサポートし、undefined時はtemporary IDを生成
    id: globalItem._id || globalItem.id || 'temp-' + Date.now(),
    text: globalItem.task || '',
    completed: globalItem.completed || false,
    priority: globalItem.priority || 3,
    isPrioritized: globalItem.isPrioritized || false,
    type: globalItem.type || 'output',
    deadline: globalItem.deadline,
    createdAt: globalItem.createdAt || new Date().toISOString(),
    category: undefined, // Global TodoItem doesn't have category
    tags: undefined, // Global TodoItem doesn't have tags
  };
};

// Base selectors
const selectRawTodoItems = (state: RootState): readonly GlobalTodoItem[] => {
  const todoState = state.todo as unknown as ExtendedTodoState;
  const items = todoState?.items;

  if (!Array.isArray(items)) {
    return [];
  }

  // 緊急修正: null/undefined要素をフィルタリング
  return items.filter(item => item != null);
};

export const selectTodoItems = createSelector(
  [selectRawTodoItems],
  (items: readonly GlobalTodoItem[]): readonly TodoItem[] => {
    // 緊急修正: 安全性チェックを追加
    if (!Array.isArray(items)) {
      console.warn('selectTodoItems: items is not an array', items);
      return [];
    }

    // Map global TodoItems to local TodoItems with additional filtering
    return items
      .filter(item => item != null) // 二重フィルタリングで確実性を向上
      .map(mapGlobalToLocalTodoItem);
  }
);

export const selectTodoStatus = (state: RootState): string => {
  const todoState = state.todo as unknown as ExtendedTodoState;
  return todoState?.status || 'idle';
};

export const selectTodoError = (state: RootState): string | null => {
  const todoState = state.todo as unknown as ExtendedTodoState;
  return todoState?.error || null;
};

export const selectTodoHistory = (state: RootState): Record<string, number> => {
  const todoState = state.todo as unknown as ExtendedTodoState;
  return todoState?.history || {};
};

export const selectDailyHistory = (
  state: RootState
): readonly { date: string; count: number }[] => {
  const todoState = state.todo as unknown as ExtendedTodoState;
  return todoState?.dailyHistory || [];
};

export const selectIsPremium = (state: RootState): boolean => {
  const todoState = state.todo as unknown as ExtendedTodoState;
  return todoState?.isPremium || false;
};

// Memoized selector for converting TodoItems to Todos
export const selectTodos = createSelector(
  [selectTodoItems],
  (todoItems: readonly TodoItem[]): readonly Todo[] => {
    return todoItemsToTodos(todoItems);
  }
);

// Additional computed selectors
export const selectActiveTodos = createSelector(
  [selectTodos],
  (todos: readonly Todo[]): readonly Todo[] => {
    return todos.filter((todo: Todo) => !todo.completed);
  }
);

export const selectCompletedTodos = createSelector(
  [selectTodos],
  (todos: readonly Todo[]): readonly Todo[] => {
    return todos.filter((todo: Todo) => todo.completed);
  }
);

export const selectTodoStats = createSelector([selectTodos], (todos: readonly Todo[]) => {
  const total = todos.length;
  const completed = todos.filter((todo: Todo) => todo.completed).length;
  const active = total - completed;
  const inputCount = todos.filter((todo: Todo) => todo.type === 'input').length;
  const outputCount = todos.filter((todo: Todo) => todo.type === 'output').length;

  return {
    total,
    completed,
    active,
    inputCount,
    outputCount,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
});
