import { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { TodoItem } from '@/types';
import { TaskSort } from '@/types/task';
import {
  fetchTodoItems,
  addTodoItem,
  updateTodoItem,
  deleteTodoItem,
  // bulkUpdateTasks など一括操作が必要ならここに追加
} from '@/store/todoSlice';
import { toast } from 'react-hot-toast';

export const useTaskManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) => state.todo.items);
  const status = useSelector((state: RootState) => state.todo.status);
  const loading = status === 'loading';
  const error = useSelector((state: RootState) => state.todo.error);

  const [filter, setFilter] = useState<{ priority?: number[]; [key: string]: any }>({});
  const [sort, setSort] = useState<TaskSort>({ field: 'createdAt', direction: 'desc' });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // フィルターとソートを適用したタスク一覧
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // フィルター適用
    if (filter.status?.length) {
      filtered = filtered.filter((task) => {
        // Only 'completed' is supported for now
        if (filter.status!.includes('completed')) {
          return task.completed;
        }
        // If you want to support 'incomplete', add that logic here
        return true;
      });
    }

    if (filter.priority?.length) {
      // Ensure filter.priority is number[]
      filtered = filtered.filter((task) => (filter.priority as number[]).includes(task.priority));
    }

    if (filter.tags?.length) {
      filtered = filtered.filter(
        (task) => task.tags && filter.tags!.some((tag: string) => task.tags!.includes(tag))
      );
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.task.toLowerCase().includes(searchLower) ||
          (task.note?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    if (filter.dueDate) {
      filtered = filtered.filter((task) => {
        if (!task.deadline) return false;
        const taskDate = new Date(task.deadline);
        if (filter.dueDate!.from && taskDate < filter.dueDate!.from) return false;
        if (filter.dueDate!.to && taskDate > filter.dueDate!.to) return false;
        return true;
      });
    }

    // ソート適用
    return filtered.sort((a, b) => {
      // Only allow sorting by fields that exist on TodoItem
      const allowedFields: (keyof typeof a)[] = ['priority', 'createdAt', 'deadline', 'task'];
      if (!allowedFields.includes(sort.field as any)) return 0;
      const aValue = a[sort.field as keyof typeof a];
      const bValue = b[sort.field as keyof typeof b];
      if (aValue == null || bValue == null) return 0;
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, filter, sort]);

  // タスク統計
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const inProgress = 0; // TodoItemにはinProgressの概念がない場合
    const overdue = tasks.filter(
      (task) => task.deadline && new Date(task.deadline) < new Date() && !task.completed
    ).length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  // タスク作成
  const createTask = useCallback(
    async (taskData: Omit<TodoItem, '_id' | 'createdAt' | 'updatedAt'>) => {
      try {
        await dispatch(addTodoItem(taskData)).unwrap();
        toast.success('タスクを作成しました');
      } catch (error) {
        toast.error('タスクの作成に失敗しました');
        throw error;
      }
    },
    [dispatch]
  );

  // タスク更新
  const editTask = useCallback(
    async (_id: string, updates: Partial<TodoItem>) => {
      try {
        await dispatch(updateTodoItem({ _id, updates })).unwrap();
        toast.success('タスクを更新しました');
      } catch (error) {
        toast.error('タスクの更新に失敗しました');
        throw error;
      }
    },
    [dispatch]
  );

  // タスク削除
  const removeTask = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteTodoItem(id)).unwrap();
        toast.success('タスクを削除しました');
      } catch (error) {
        toast.error('タスクの削除に失敗しました');
        throw error;
      }
    },
    [dispatch]
  );

  // 一括操作
  const bulkOperations = {};

  return {
    // データ
    tasks: filteredAndSortedTasks,
    allTasks: tasks,
    loading,
    error,
    taskStats,

    // フィルター・ソート
    filter,
    setFilter,
    sort,
    setSort,

    // 選択
    selectedTasks,
    setSelectedTasks,

    // 操作
    createTask,
    editTask,
    removeTask,
    bulkOperations,

    // ユーティリティ
    refreshTasks: useCallback(() => dispatch(fetchTodoItems()), [dispatch]),
  };
};
