import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Trash2, Edit, Check, X, GripVertical } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchTodoItems,
  addTodoItem,
  updateTodoItem,
  deleteTodoItem,
  resetTodoList,
  reorderTodoItems,
  TodoItem,
} from "@/store/todoSlice";
import { RootState, AppDispatch } from "@/store";

interface TodoItemComponentProps {
  todo: TodoItem;
  index: number;
  onToggle: (id: string) => void;
  onEdit: (id: string, task: string) => void;
  onDelete: (id: string) => void;
  editingId: string | null;
  editingText: string;
  onEditSave: (id: string) => void;
  onEditCancel: () => void;
}

const TodoItemComponent = memo(({ 
  todo, 
  index, 
  onToggle, 
  onEdit, 
  onDelete, 
  editingId, 
  editingText, 
  onEditSave, 
  onEditCancel 
}: TodoItemComponentProps) => {
  return (
    <Draggable key={todo._id} draggableId={todo._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
          <Checkbox
            id={`todo-${todo._id}`}
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo._id)}
          />
          {editingId === todo._id ? (
            <>
              <Input
                value={editingText}
                onChange={(e) => onEdit(todo._id, e.target.value)}
                className="flex-grow"
              />
              <Button size="sm" onClick={() => onEditSave(todo._id)}>
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onEditCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Label
                htmlFor={`todo-${todo._id}`}
                className={`flex-grow ${
                  todo.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {todo.task}
              </Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(todo._id, todo.task)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(todo._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
});

export default function DailyTodoReminder() {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todo.items);
  const status = useSelector((state: RootState) => state.todo.status);
  const error = useSelector((state: RootState) => state.todo.error);

  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    console.log("Component mounted or status changed. Status:", status);
    if (status === 'idle') {
      console.log("Fetching todo items...");
      dispatch(fetchTodoItems());
    }
  }, [dispatch, status]);

  useEffect(() => {
    console.log("Todos updated:", todos);
  }, [todos]);

  useEffect(() => {
    if (error) {
      console.error("Error occurred:", error);
      toast.error(error);
    }
  }, [error]);

  const handleToggle = useCallback((id: string) => {
    console.log("Toggling todo:", id);
    const todoToUpdate = todos.find((todo) => todo._id === id);
    if (todoToUpdate) {
      dispatch(
        updateTodoItem({
          _id: id,
          updates: {
            completed: !todoToUpdate.completed,
          },
        })
      );
    } else {
      console.error("Failed to find todo for toggling:", id);
    }
  }, [dispatch, todos]);

  const handleReset = useCallback(() => {
    console.log("Resetting todo list");
    dispatch(resetTodoList());
  }, [dispatch]);

  const handleAddTodo = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      console.log("Adding new todo:", newTodo.trim());
      dispatch(addTodoItem(newTodo.trim()));
      setNewTodo("");
    }
  }, [dispatch, newTodo]);

  const handleDeleteTodo = useCallback((id: string) => {
    if (id) {
      console.log("Deleting todo:", id);
      dispatch(deleteTodoItem(id));
    } else {
      console.error("Invalid todo ID for deletion");
    }
  }, [dispatch]);

  const handleEditStart = useCallback((id: string, task: string) => {
    console.log("Starting edit for todo:", id);
    setEditingId(id);
    setEditingText(task);
  }, []);

  const handleEditCancel = useCallback(() => {
    console.log("Cancelling edit");
    setEditingId(null);
    setEditingText("");
  }, []);

  const handleEditSave = useCallback((id: string) => {
    if (editingText.trim() && id) {
      console.log("Saving edit for todo:", id);
      dispatch(updateTodoItem({ _id: id, updates: { task: editingText.trim() } }));
      setEditingId(null);
      setEditingText("");
    } else {
      console.error("Invalid edit data:", { id, editingText });
    }
  }, [dispatch, editingText]);

  const onDragEnd = useCallback((result: DropResult) => {
    console.log("Drag ended:", result);
    if (!result.destination) {
      return;
    }

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    console.log("Reordering todos:", items);
    dispatch(reorderTodoItems(items));
  }, [dispatch, todos]);

  const memoizedTodos = useMemo(() => todos, [todos]);

  if (status === "loading") {
    return <div>読み込み中...</div>;
  }

  console.log("Rendering DailyTodoReminder. Todos count:", todos.length);

  return (
    <Card className="w-full mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">本日のToDoリスト</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTodo} className="flex space-x-2 mb-4">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="新しいタスクを追加"
          />
          <Button type="submit">追加</Button>
        </form>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {memoizedTodos.map((todo, index) => (
                  <TodoItemComponent
                    key={todo._id}
                    todo={todo}
                    index={index}
                    onToggle={handleToggle}
                    onEdit={handleEditStart}
                    onDelete={handleDeleteTodo}
                    editingId={editingId}
                    editingText={editingText}
                    onEditSave={handleEditSave}
                    onEditCancel={handleEditCancel}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}