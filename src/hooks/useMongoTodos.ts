import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/useAuth';
import { todoApi } from '@/services/api/todoApi';
import { TodoItem } from '@/types';
import { AxiosError } from 'axios';

interface UseMongoTodosReturn {
  todos: TodoItem[];
  loading: boolean;
  error: string | null;
  addTodo: (task: string, type?: 'input' | 'output', deadline?: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<TodoItem>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  refreshTodos: () => Promise<void>;
}

export const useMongoTodos = (): UseMongoTodosReturn => {
  const { isAuthenticated } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('[useMongoTodos] 🚫 認証されていません');
      setTodos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[useMongoTodos] 📡 ToDo取得開始');
      const response = await todoApi.getAll();
      setTodos(response.data);
      setError(null);

      console.log('[useMongoTodos] 📋 ToDo取得成功:', {
        count: response.data.length,
        todos: response.data.slice(0, 3).map((t) => ({
          id: t._id,
          task: t.task,
          completed: t.completed,
        })),
      });
    } catch (err: unknown) {
      const errorMessage =
        (err as AxiosError<{ message: string }>).response?.data?.message ||
        'ToDoの取得に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addTodo = useCallback(
    async (task: string, type: 'input' | 'output' = 'input', deadline?: string) => {
      try {
        const response = await todoApi.create(task, 3, false, type, deadline);
        setTodos((prev) => [response.data.todo, ...prev]);
        console.log('[useMongoTodos] ✅ ToDo追加成功:', response.data.todo);
      } catch (err: unknown) {
        const errorMessage =
          (err as AxiosError<{ message: string }>).response?.data?.message ||
          'ToDoの追加に失敗しました';
        console.error('[useMongoTodos] ❌ ToDo追加エラー:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const updateTodo = useCallback(async (id: string, updates: Partial<TodoItem>) => {
    try {
      const response = await todoApi.update(id, updates);
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? { ...todo, ...response.data.todo } : todo))
      );
      console.log('[useMongoTodos] ✅ ToDo更新成功:', { id, updates });
    } catch (err: unknown) {
      const errorMessage =
        (err as AxiosError<{ message: string }>).response?.data?.message ||
        'ToDoの更新に失敗しました';
      console.error('[useMongoTodos] ❌ ToDo更新エラー:', errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await todoApi.delete(id);
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
      console.log('[useMongoTodos] 🗑️ ToDo削除成功:', id);
    } catch (err: unknown) {
      const errorMessage =
        (err as AxiosError<{ message: string }>).response?.data?.message ||
        'ToDoの削除に失敗しました';
      console.error('[useMongoTodos] ❌ ToDo削除エラー:', errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const toggleComplete = useCallback(
    async (id: string) => {
      const todo = todos.find((t) => t._id === id);
      if (!todo) return;

      const updates = {
        completed: !todo.completed,
        completedDate: !todo.completed ? new Date().toISOString() : null,
      };

      await updateTodo(id, updates);
    },
    [todos, updateTodo]
  );

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    refreshTodos: fetchTodos,
  };
};
