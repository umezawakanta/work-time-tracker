// src/hooks/useSafeTodoOperations.ts

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { updateTodoItem, deleteTodoItem } from '@/store/todoSlice';
import { AppDispatch, RootState } from '@/store';
import { TodoItem } from '@/types';
import { findTodoById, getSafeTodoId, isValidTodoItem } from '@/utils/todoSafety';

export const useSafeTodoOperations = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todo.items);

  /**
   * タスクの完了状態を安全にトグルする
   */
  const handleToggleComplete = useCallback(
    async (todoIdOrItem: string | any) => {
      try {
        let todoId: string | null;
        let todo: TodoItem | null;

        // IDが渡された場合
        if (typeof todoIdOrItem === 'string') {
          todoId = todoIdOrItem;
          todo = findTodoById(todos, todoId);
        }
        // Todoオブジェクトが渡された場合
        else {
          todoId = getSafeTodoId(todoIdOrItem);
          todo = isValidTodoItem(todoIdOrItem) ? todoIdOrItem : null;
        }

        if (!todoId || !todo) {
          console.error('Invalid todo for toggle operation:', { todoIdOrItem, todoId, todo });
          toast.error('タスクが見つかりません');
          return;
        }

        await dispatch(
          updateTodoItem({
            _id: todoId,
            updates: { completed: !todo.completed },
          })
        ).unwrap();

        toast.success(`タスクを${todo.completed ? '未完了' : '完了'}にしました`);
      } catch (error) {
        console.error('Toggle operation failed:', error);
        toast.error('操作に失敗しました。もう一度お試しください。');
      }
    },
    [todos, dispatch]
  );

  /**
   * タスクを安全に削除する
   */
  const handleDeleteTodo = useCallback(
    async (todoIdOrItem: string | any) => {
      try {
        let todoId: string | null;
        let todo: TodoItem | null;

        // IDが渡された場合
        if (typeof todoIdOrItem === 'string') {
          todoId = todoIdOrItem;
          todo = findTodoById(todos, todoId);
        }
        // Todoオブジェクトが渡された場合
        else {
          todoId = getSafeTodoId(todoIdOrItem);
          todo = isValidTodoItem(todoIdOrItem) ? todoIdOrItem : null;
        }

        if (!todoId) {
          console.error('Invalid todo ID for delete operation:', todoIdOrItem);
          toast.error('削除対象のタスクが特定できません');
          return;
        }

        await dispatch(deleteTodoItem(todoId)).unwrap();
        toast.success('タスクを削除しました');
      } catch (error) {
        console.error('Delete operation failed:', error);
        toast.error('削除に失敗しました。');
      }
    },
    [dispatch]
  );

  /**
   * タスクを安全に更新する
   */
  const handleUpdateTodo = useCallback(
    async (todoIdOrItem: string | any, updates: Partial<TodoItem>) => {
      try {
        let todoId: string | null;

        // IDが渡された場合
        if (typeof todoIdOrItem === 'string') {
          todoId = todoIdOrItem;
        }
        // Todoオブジェクトが渡された場合
        else {
          todoId = getSafeTodoId(todoIdOrItem);
        }

        if (!todoId) {
          console.error('Invalid todo ID for update operation:', todoIdOrItem);
          toast.error('更新対象のタスクが特定できません');
          return;
        }

        await dispatch(
          updateTodoItem({
            _id: todoId,
            updates,
          })
        ).unwrap();

        toast.success('タスクを更新しました');
      } catch (error) {
        console.error('Update operation failed:', error);
        toast.error('更新に失敗しました。');
      }
    },
    [dispatch]
  );

  /**
   * 安全な状態でのタスク取得
   */
  const getSafeTodo = useCallback(
    (todoIdOrItem: string | any): TodoItem | null => {
      if (typeof todoIdOrItem === 'string') {
        return findTodoById(todos, todoIdOrItem);
      } else {
        return isValidTodoItem(todoIdOrItem) ? todoIdOrItem : null;
      }
    },
    [todos]
  );

  return {
    handleToggleComplete,
    handleDeleteTodo,
    handleUpdateTodo,
    getSafeTodo,
    // ユーティリティ関数もエクスポート
    isValidTodoItem,
    getSafeTodoId,
    findTodoById: (targetId: string) => findTodoById(todos, targetId),
  };
};
