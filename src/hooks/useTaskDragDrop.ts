import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { DropResult } from '@hello-pangea/dnd';
import { AppDispatch } from '@/store';
import { updateTodoItem } from '@/store/todoSlice';
import { toast } from 'react-hot-toast';
import { format, parse, isValid } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { TodoItem } from '@/types';

interface TaskDragDropHookProps {
  todos: TodoItem[];
  onDateChange?: (taskId: string, newDate: Date) => void;
}

export const useTaskDragDrop = ({ todos, onDateChange }: TaskDragDropHookProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;

      // ドロップ先がない場合は何もしない
      if (!destination) {
        return;
      }

      // 同じ位置にドロップした場合は何もしない
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      try {
        // タスクIDを取得（draggableIdから"task-"プレフィックスを除去）
        const taskId = draggableId.replace('task-', '');
        const task = todos.find((t) => t._id === taskId);

        if (!task) {
          toast.error('タスクが見つかりません');
          return;
        }

        // ドロップ先の日付を解析
        const droppableId = destination.droppableId;
        let newDate: Date;

        if (droppableId.startsWith('date-')) {
          // 日付セルにドロップした場合
          const dateString = droppableId.replace('date-', '');
          newDate = parse(dateString, 'yyyy-MM-dd', new Date());

          if (!isValid(newDate)) {
            toast.error('無効な日付です');
            return;
          }
        } else {
          toast.error('無効なドロップ先です');
          return;
        }

        // 完了済みタスクの移動を制限（オプション）
        if (task.completed) {
          const confirmMove = window.confirm(
            '完了済みのタスクを移動しますか？この操作により、タスクは未完了状態に戻ります。'
          );
          if (!confirmMove) {
            return;
          }
        }

        // タスクの期限を更新
        const updates: Partial<TodoItem> = {
          deadline: newDate.toISOString(),
        };

        // 完了済みタスクを移動する場合は未完了にする
        if (task.completed) {
          updates.completed = false;
          updates.completedDate = null;
        }

        await dispatch(
          updateTodoItem({
            _id: taskId,
            updates,
          })
        ).unwrap();

        // カスタムコールバックがある場合は実行
        onDateChange?.(taskId, newDate);

        // 成功メッセージ
        const dateFormatted = format(newDate, 'yyyy年MM月dd日', {
          locale: ja,
        });
        toast.success(`タスクを${dateFormatted}に移動しました`);
      } catch (error) {
        console.error('タスクの移動に失敗しました:', error);
        toast.error('タスクの移動に失敗しました');
      }
    },
    [dispatch, todos, onDateChange]
  );

  const isDragDisabled = useCallback(
    (taskId: string) => {
      const _task = todos.find((t) => t._id === taskId);
      // 必要に応じてドラッグを無効化する条件を追加
      return false;
    },
    [todos]
  );

  const getDragStyle = useCallback(
    (isDragging: boolean, draggableStyle: React.CSSProperties | undefined) => ({
      // ドラッグ中のスタイル
      opacity: isDragging ? 0.8 : 1,
      transform: isDragging ? 'rotate(5deg)' : 'none',
      ...draggableStyle,
    }),
    []
  );

  const getDropStyle = useCallback(
    (isDragOver: boolean) => ({
      // ドロップゾーンのスタイル
      backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      borderColor: isDragOver ? '#3b82f6' : 'transparent',
      borderWidth: isDragOver ? '2px' : '1px',
      borderStyle: 'dashed',
    }),
    []
  );

  return {
    handleDragEnd,
    isDragDisabled,
    getDragStyle,
    getDropStyle,
  };
};
