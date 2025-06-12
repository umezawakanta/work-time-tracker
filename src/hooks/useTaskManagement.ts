import { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { Task, TaskFilter, TaskSort } from '@/types/task';
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
  const loading = useSelector((state: RootState) => state.todo.loading);
  const error = useSelector((state: RootState) => state.todo.error);

  const [filter, setFilter] = useState<TaskFilter>({});
  const [sort, setSort] = useState<TaskSort>({ field: 'createdAt', direction: 'desc' });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // フィルターとソートを適用したタスク一覧
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // フィルター適用
    if (filter.status?.length) {
      filtered = filtered.filter((task) => filter.status!.includes(task.status));
    }

    if (filter.priority?.length) {
      filtered = filtered.filter((task) => filter.priority!.includes(task.priority));
    }

    if (filter.tags?.length) {
      filtered = filtered.filter((task) => filter.tags!.some((tag) => task.tags.includes(tag)));
    }

    if (filter.assignee) {
      filtered = filtered.filter((task) => task.assignee === filter.assignee);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filter.dueDate) {
      filtered = filtered.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        if (filter.dueDate!.from && taskDate < filter.dueDate!.from) return false;
        if (filter.dueDate!.to && taskDate > filter.dueDate!.to) return false;
        return true;
      });
    }

    // ソート適用
    return filtered.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, filter, sort]);

  // タスク統計
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const inProgress = tasks.filter((task) => task.status === 'inProgress').length;
    const overdue = tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
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
    async (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => {
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
    async (id: string, updates: Partial<Task>) => {
      try {
        await dispatch(updateTodoItem({ id, updates })).unwrap();
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
  const bulkOperations = {
    markCompleted: useCallback(
      async (taskIds: string[]) => {
        try {
          await dispatch(
            bulkUpdateTasks({
              ids: taskIds,
              updates: { status: 'completed' as const },
            })
          ).unwrap();
          toast.success(`${taskIds.length}個のタスクを完了しました`);
          setSelectedTasks([]);
        } catch (error) {
          toast.error('一括完了操作に失敗しました');
        }
      },
      [dispatch]
    ),

    delete: useCallback(
      async (taskIds: string[]) => {
        if (!window.confirm(`${taskIds.length}個のタスクを削除しますか？`)) return;

        try {
          await Promise.all(taskIds.map((id) => dispatch(deleteTodoItem(id))));
          toast.success(`${taskIds.length}個のタスクを削除しました`);
          setSelectedTasks([]);
        } catch (error) {
          toast.error('一括削除操作に失敗しました');
        }
      },
      [dispatch]
    ),

    updateTags: useCallback(
      async (taskIds: string[], tags: string[]) => {
        try {
          await dispatch(
            bulkUpdateTasks({
              ids: taskIds,
              updates: { tags },
            })
          ).unwrap();
          toast.success(`${taskIds.length}個のタスクのタグを更新しました`);
          setSelectedTasks([]);
        } catch (error) {
          toast.error('タグの一括更新に失敗しました');
        }
      },
      [dispatch]
    ),
  };

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
