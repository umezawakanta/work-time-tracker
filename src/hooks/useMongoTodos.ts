import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useMongoAuth';
import { todoApi } from '@/services/api/todoApi';
import { TodoItem } from '@/types';

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

  // ToDoリストの取得
  const fetchTodos = useCallback(async () => {
    if (!isAuthenticated) {
      setTodos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await todoApi.getAll();
      setTodos(response.data);
      setError(null);

      console.log('[MongoTodos] 📋 ToDo取得成功:', {
        count: response.data.length,
        todos: response.data.slice(0, 3).map((t) => ({
          id: t._id,
          task: t.task,
          completed: t.completed,
        })),
      });
    } catch (err: any) {
      console.error('[MongoTodos] ❌ ToDo取得エラー:', err);
      setError(err.response?.data?.message || 'ToDoの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ToDoの追加
  const addTodo = useCallback(
    async (task: string, type: 'input' | 'output' = 'input', deadline?: string) => {
      try {
        const response = await todoApi.create(task, 3, false, type, deadline);
        setTodos((prev) => [response.data.todo, ...prev]);

        console.log('[MongoTodos] ✅ ToDo追加成功:', response.data.todo);
      } catch (err: any) {
        console.error('[MongoTodos] ❌ ToDo追加エラー:', err);
        throw new Error(err.response?.data?.message || 'ToDoの追加に失敗しました');
      }
    },
    []
  );

  // ToDoの更新
  const updateTodo = useCallback(async (id: string, updates: Partial<TodoItem>) => {
    try {
      const response = await todoApi.update(id, updates);
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? { ...todo, ...response.data.todo } : todo))
      );

      console.log('[MongoTodos] ✅ ToDo更新成功:', { id, updates });
    } catch (err: any) {
      console.error('[MongoTodos] ❌ ToDo更新エラー:', err);
      throw new Error(err.response?.data?.message || 'ToDoの更新に失敗しました');
    }
  }, []);

  // ToDoの削除
  const deleteTodo = useCallback(async (id: string) => {
    try {
      await todoApi.delete(id);
      setTodos((prev) => prev.filter((todo) => todo._id !== id));

      console.log('[MongoTodos] 🗑️ ToDo削除成功:', id);
    } catch (err: any) {
      console.error('[MongoTodos] ❌ ToDo削除エラー:', err);
      throw new Error(err.response?.data?.message || 'ToDoの削除に失敗しました');
    }
  }, []);

  // 完了状態の切り替え
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

  // 初期データの取得
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
