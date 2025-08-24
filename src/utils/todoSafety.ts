// src/utils/todoSafety.ts

import { TodoItem } from '@/types';

/**
 * TodoItemが有効かどうかを判定する型ガード関数
 */
export function isValidTodoItem(todo: any): todo is TodoItem {
  return (
    todo &&
    typeof todo === 'object' &&
    (todo._id || todo.id) &&
    typeof (todo.task || todo.title) === 'string'
  );
}

/**
 * TODOの操作を安全に行うためのユーティリティ関数
 */
export const safeTodoOperation = (todo: any): TodoItem | null => {
  if (!isValidTodoItem(todo)) {
    console.warn('Invalid todo item:', todo);
    return null;
  }

  // idまたは_idを安全に取得
  const todoId = (todo as any).id || (todo as any)._id;
  const todoTask = (todo as any).task || (todo as any).title || '';

  return {
    ...todo,
    _id: todoId,
    id: todoId,
    task: todoTask,
    title: todoTask,
  } as TodoItem;
};

/**
 * TODO配列を安全にフィルタリングする関数
 */
export const filterValidTodos = (todos: any[]): TodoItem[] => {
  if (!Array.isArray(todos)) {
    console.warn('filterValidTodos: Input is not an array:', todos);
    return [];
  }

  return todos
    .filter(isValidTodoItem)
    .map((todo) => safeTodoOperation(todo))
    .filter((todo): todo is TodoItem => todo !== null);
};

/**
 * TODO IDを安全に取得する関数
 */
export const getSafeTodoId = (todo: any): string | null => {
  if (!todo || typeof todo !== 'object') {
    return null;
  }

  const id = todo._id || todo.id;
  return typeof id === 'string' ? id : null;
};

/**
 * TODO配列から特定のIDのタスクを安全に検索する関数
 */
export const findTodoById = (todos: any[], targetId: string): TodoItem | null => {
  const validTodos = filterValidTodos(todos);
  return validTodos.find((todo) => getSafeTodoId(todo) === targetId) || null;
};

/**
 * TODO配列から完了していないタスクを安全に取得する関数
 */
export const getIncompleteTodos = (todos: any[]): TodoItem[] => {
  return filterValidTodos(todos).filter((todo) => !todo.completed);
};

/**
 * TODO配列から完了したタスクを安全に取得する関数
 */
export const getCompletedTodos = (todos: any[]): TodoItem[] => {
  return filterValidTodos(todos).filter((todo) => todo.completed);
};

/**
 * デバッグ用：TODO配列の状態を診断する関数
 */
export const diagnoseTodoArray = (todos: any[], context: string = '') => {
  console.log(`🔍 Todo Array Diagnosis${context ? ` [${context}]` : ''}:`, {
    isArray: Array.isArray(todos),
    length: todos?.length || 0,
    validItems: todos?.filter?.(isValidTodoItem).length || 0,
    invalidItems: todos?.filter?.((todo) => !isValidTodoItem(todo)).length || 0,
    sampleValid: todos?.find?.(isValidTodoItem),
    sampleInvalid: todos?.find?.((todo) => !isValidTodoItem(todo)),
  });
};
