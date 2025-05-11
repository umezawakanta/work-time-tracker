import React, { useState, useCallback } from 'react';
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle } from "lucide-react";
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult  // DropResult型をインポート
} from "@hello-pangea/dnd";
import { 
  updateTodoItem, 
  deleteTodoItem, 
  reorderTodoItems, 
  toggleTodoPriority
} from "@/store/todoSlice";
import { toast } from "react-hot-toast";
import TodoItemComponent from './TodoItem';
import TodoEditor from './TodoEditor';
import { Button } from "@/components/ui/button";

// 共通の型をインポート
import { Todo, TaskType } from '@/types/todo';

interface TodoListProps {
  todos: Todo[];
  isPremium: boolean;
  onAnalyzeRequest?: () => void;
}

const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  isPremium,
  onAnalyzeRequest 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingType, setEditingType] = useState<TaskType>("input");
  const [editingDeadline, setEditingDeadline] = useState<string | undefined>(undefined);
  const [isDragEnabled, setIsDragEnabled] = useState(isPremium);

  // タスクの完了/未完了のトグル
  const handleToggle = useCallback(
    (id: string) => {
      const todoToUpdate = todos.find((todo) => todo._id === id);
      if (todoToUpdate) {
        dispatch(
          updateTodoItem({
            _id: id,
            updates: {
              completed: !todoToUpdate.completed,
              completedDate: !todoToUpdate.completed
                ? new Date().toISOString()
                : null,
            },
          })
        ).then(() => {
          if (!todoToUpdate.completed) {
            // タスク完了時にAI分析（プレミアム機能）
            if (isPremium && onAnalyzeRequest) {
              // analyzeTodoEfficiencyの代わりにonAnalyzeRequestを使用
              onAnalyzeRequest();
            }
            toast.success("お疲れ様でした！タスクを完了しました");
          }
        });
      }
    },
    [dispatch, todos, isPremium, onAnalyzeRequest]
  );

  // タスクの優先度トグル
  const handleTogglePriority = useCallback(
    (id: string) => {
      dispatch(toggleTodoPriority(id)).then(() => {
        toast.success("優先度を変更しました");
      });
    },
    [dispatch]
  );

  // 編集モード開始
  const handleEditStart = useCallback(
    (
      id: string,
      task: string,
      type: TaskType | undefined,
      deadline: string | undefined
    ) => {
      setEditingId(id);
      setEditingText(task);
      setEditingType(type || "input");
      setEditingDeadline(deadline);
    },
    []
  );

  // 編集キャンセル
  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditingText("");
    setEditingType("input");
    setEditingDeadline(undefined);
  }, []);

  // 編集保存
  const handleEditSave = useCallback(
    (id: string) => {
      if (editingText.trim()) {
        dispatch(
          updateTodoItem({
            _id: id,
            updates: {
              task: editingText.trim(),
              type: editingType,
              deadline: editingDeadline,
            },
          })
        ).then(() => {
          setEditingId(null);
          setEditingText("");
          setEditingType("input");
          setEditingDeadline(undefined);
          toast.success("タスクを更新しました");
        });
      }
    },
    [dispatch, editingText, editingType, editingDeadline]
  );

  // タスク削除
  const handleDeleteTodo = useCallback(
    (id: string) => {
      const todoToDelete = todos.find((todo) => todo._id === id);
      
      // プレミアム機能：未完了タスクも削除可能
      if (todoToDelete && (todoToDelete.completed || isPremium)) {
        dispatch(deleteTodoItem(id)).then(() => {
          toast.success("タスクを削除しました");
        });
      } else {
        toast.error(
          "完了していないタスクは削除できません。必ず完了させてください。"
        );
      }
    },
    [dispatch, todos, isPremium]
  );

  // ドラッグ＆ドロップによる並べ替え処理
  const handleDragEnd = useCallback(
    (result: DropResult) => { // anyの代わりにDropResult型を使用
      if (!result.destination || !isPremium || !isDragEnabled) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      const updatedTodos = [...todos];
      const [movedTodo] = updatedTodos.splice(sourceIndex, 1);
      updatedTodos.splice(destinationIndex, 0, movedTodo);

      // 優先度の再計算
      const recalculatedTodos = updatedTodos.map((todo, idx) => ({
        ...todo,
        priority: idx + 1,
      }));

      dispatch(reorderTodoItems(recalculatedTodos)).then(() => {
        toast.success("タスクの順序を変更しました");
      });
    },
    [dispatch, todos, isPremium, isDragEnabled]
  );

  // タスク分析ボタン
  const handleAnalyzeClick = useCallback(() => {
    if (isPremium && onAnalyzeRequest) {
      onAnalyzeRequest();
    }
  }, [isPremium, onAnalyzeRequest]);

  // タスクがない場合の表示
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-300 empty-state">
        <div className="mb-2">
          <PlusCircle className="h-10 w-10 mx-auto text-gray-400" />
        </div>
        <p>
          タスクがありません。新しいタスクを追加しましょう！
        </p>
      </div>
    );
  }

  return (
    <>
      {isPremium && (
        <div className="flex justify-between items-center mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDragEnabled(!isDragEnabled)}
            className="text-xs"
          >
            {isDragEnabled ? "並べ替えを無効にする" : "並べ替えを有効にする"}
          </Button>
          
          {onAnalyzeRequest && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyzeClick}
              className="text-xs ml-2"
            >
              タスク効率分析
            </Button>
          )}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos" isDropDisabled={!isPremium || !isDragEnabled}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`rounded-md ${
                snapshot.isDraggingOver ? "droppable-is-dragging-over" : "droppable-is-not-dragging-over"
              }`}
            >
              <div className="space-y-2">
                {todos.map((todo, index) => (
                  <Draggable
                    key={todo._id}
                    draggableId={todo._id}
                    index={index}
                    isDragDisabled={!isPremium || !isDragEnabled}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`todo-card flex items-start p-3 rounded-md shadow-sm border ${
                          todo.completed
                            ? "bg-gray-50 border-gray-200"
                            : todo.isPrioritized
                            ? "priority-task"
                            : todo.type === "input"
                            ? "input-type"
                            : "output-type"
                        }`}
                      >
                        <Checkbox
                          id={`todo-${todo._id}`}
                          checked={todo.completed}
                          onCheckedChange={() => handleToggle(todo._id)}
                          className="mt-1"
                        />
                        
                        {editingId === todo._id ? (
                          <TodoEditor
                            text={editingText}
                            type={editingType}
                            deadline={editingDeadline}
                            onTextChange={setEditingText}
                            onTypeChange={setEditingType}
                            onDeadlineChange={setEditingDeadline}
                            onCancel={handleEditCancel}
                            onSave={() => handleEditSave(todo._id)}
                          />
                        ) : (
                          <TodoItemComponent 
                            todo={todo}
                            isPremium={isPremium}
                            onTogglePriority={() => handleTogglePriority(todo._id)}
                            onEditStart={() => handleEditStart(
                              todo._id,
                              todo.task,
                              todo.type,
                              todo.deadline
                            )}
                            onDelete={() => handleDeleteTodo(todo._id)}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default TodoList;