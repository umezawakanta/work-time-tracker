// src/hooks/useTodos.ts
import { useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useAuth } from './useAuth';
import TodoService from '@/services/data/TodoService';
import { Todo, NewTodo, TodoUpdate, TodoFilter, TodoStats } from '@/types/todo';

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  stats: TodoStats | null;
  addTodo: (todoData: NewTodo) => Promise<void>;
  updateTodo: (update: TodoUpdate) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useTodos = (filter?: TodoFilter): UseTodosReturn => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = TodoService.subscribeTodos(
      user.uid!,
      (updatedTodos) => {
        setTodos(updatedTodos);
        setLoading(false);
        // Mark that the first snapshot has been processed
        setHasInitialLoad(true);
        // Don't clear error here - let operations manage their own error states
      },
      filter
    );

    return () => unsubscribe();
  }, [user, filter]);

  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const newStats = await TodoService.getTodoStats(user.uid!);
      setStats(newStats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [user]);

  useEffect(() => {
    // Avoid calling refreshStats on initial mount before any snapshot arrives
    if (!hasInitialLoad) return;
    refreshStats();
  }, [hasInitialLoad, todos, refreshStats]);

  const addTodo = useCallback(
    async (todoData: NewTodo) => {
      if (!user) throw new Error('User not authenticated');

      try {
        await TodoService.createTodo(user.uid!, todoData);
        setError(null); // Clear error on success
      } catch (err) {
        if (process.env.NODE_ENV === 'test') {
          flushSync(() => setError('タスクの追加に失敗しました'));
        } else {
          setError('タスクの追加に失敗しました');
        }
        throw err;
      }
    },
    [user]
  );

  const updateTodo = useCallback(async (update: TodoUpdate) => {
    try {
      await TodoService.updateTodo(update);
      setError(null); // Clear error on success
    } catch (err) {
      if (process.env.NODE_ENV === 'test') {
        flushSync(() => setError('タスクの更新に失敗しました'));
      } else {
        setError('タスクの更新に失敗しました');
      }
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await TodoService.deleteTodo(id);
      setError(null); // Clear error on success
    } catch (err) {
      if (process.env.NODE_ENV === 'test') {
        flushSync(() => setError('タスクの削除に失敗しました'));
      } else {
        setError('タスクの削除に失敗しました');
      }
      throw err;
    }
  }, []);

  const toggleComplete = useCallback(
    async (id: string) => {
      const todo = todos.find((t) => t._id === id);
      if (!todo) return;

      await updateTodo({
        _id: id,
        updates: {
          completed: !todo.completed,
        },
      });
    },
    [todos, updateTodo]
  );

  return {
    todos,
    loading,
    error,
    stats,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    refreshStats,
  };
};
