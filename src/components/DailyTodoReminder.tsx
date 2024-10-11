import React, { useState, useEffect, useCallback } from "react";
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
  TodoItem,
} from "@/store/todoSlice";
import { RootState, AppDispatch } from "@/store";

export default function DailyTodoReminder() {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todo.items);
  const status = useSelector((state: RootState) => state.todo.status);
  const error = useSelector((state: RootState) => state.todo.error);

  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    console.log("Component mounted, fetching todo items");
    dispatch(fetchTodoItems());
  }, [dispatch]);

  useEffect(() => {
    console.log("Todos updated:", todos);
  }, [todos]);

  useEffect(() => {
    if (error) {
      console.error("Error occurred:", error);
      toast.error(error);
    }
  }, [error]);

  const handleToggle = useCallback((_id: string) => {
    console.log("Toggling todo:", _id);
    const todoToUpdate = todos.find((todo) => todo._id === _id);
    if (todoToUpdate && _id) {
      dispatch(
        updateTodoItem({
          _id,
          updates: {
            completed: !todoToUpdate.completed,
            task: todoToUpdate.task,
          },
        })
      )
        .unwrap()
        .then(() => {
          console.log(`Todo item ${_id} updated successfully`);
          toast.success(`Todo item ${_id} updated successfully`);
        })
        .catch((error) => {
          console.error(`Error updating todo item ${_id}:`, error);
          toast.error(`Error updating todo item ${_id}: ${error}`);
        });
    } else {
      console.error(`Invalid todo item or ID: ${_id}`);
      toast.error(`Invalid todo item or ID: ${_id}`);
    }
  }, [dispatch, todos]);

  const handleReset = useCallback(() => {
    console.log("Resetting todo list");
    dispatch(resetTodoList())
      .unwrap()
      .then(() => {
        console.log("Todo list reset successfully");
        toast.success("Todo list reset successfully");
      })
      .catch((error) => {
        console.error("Error resetting todo list:", error);
        toast.error(`Error resetting todo list: ${error}`);
      });
  }, [dispatch]);

  const handleAddTodo = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      console.log("Adding new todo:", newTodo.trim());
      dispatch(addTodoItem(newTodo.trim()))
        .unwrap()
        .then(() => {
          console.log("New todo item added successfully");
          toast.success("New todo item added successfully");
          setNewTodo("");
        })
        .catch((error) => {
          console.error("Error adding new todo item:", error);
          toast.error(`Error adding new todo item: ${error}`);
        });
    }
  }, [dispatch, newTodo]);

  const handleDeleteTodo = useCallback((_id: string) => {
    if (_id) {
      console.log("Deleting todo:", _id);
      dispatch(deleteTodoItem(_id))
        .unwrap()
        .then(() => {
          console.log(`Todo item ${_id} deleted successfully`);
          toast.success(`Todo item ${_id} deleted successfully`);
        })
        .catch((error) => {
          console.error(`Error deleting todo item ${_id}:`, error);
          toast.error(`Error deleting todo item ${_id}: ${error}`);
        });
    } else {
      console.error(`Invalid todo item ID: ${_id}`);
      toast.error(`Invalid todo item ID: ${_id}`);
    }
  }, [dispatch]);

  const handleEditStart = useCallback((_id: string, task: string) => {
    console.log("Starting edit for todo:", _id);
    setEditingId(_id);
    setEditingText(task);
  }, []);

  const handleEditCancel = useCallback(() => {
    console.log("Cancelling edit");
    setEditingId(null);
    setEditingText("");
  }, []);

  const handleEditSave = useCallback((_id: string) => {
    if (editingText.trim() && _id) {
      console.log("Saving edit for todo:", _id);
      dispatch(updateTodoItem({ _id, updates: { task: editingText.trim() } }))
        .unwrap()
        .then(() => {
          console.log(`Todo item ${_id} updated successfully`);
          toast.success(`Todo item ${_id} updated successfully`);
          setEditingId(null);
          setEditingText("");
        })
        .catch((error) => {
          console.error(`Error updating todo item ${_id}:`, error);
          toast.error(`Error updating todo item ${_id}: ${error}`);
        });
    } else {
      console.error(`Invalid todo item or ID: ${_id}`);
      toast.error(`Invalid todo item or ID: ${_id}`);
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

    console.log("Reordered items:", items);
    // ここでReorderのアクションをディスパッチする必要があります
    // 例: dispatch(reorderTodoItems(items));
  }, [todos]);

  if (status === "loading") {
    return <div>Loading...</div>;
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
                {Array.isArray(todos) &&
                  todos.map((todo: TodoItem, index: number) => (
                    <Draggable key={todo._id} draggableId={todo._id.toString()} index={index}>
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
                            onCheckedChange={() => handleToggle(todo._id)}
                          />
                          {editingId === todo._id ? (
                            <>
                              <Input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="flex-grow"
                              />
                              <Button size="sm" onClick={() => handleEditSave(todo._id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEditCancel}
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
                                onClick={() => handleEditStart(todo._id, todo.task)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTodo(todo._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
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