import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Trash2, Edit, Check, X } from "lucide-react";
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
    dispatch(fetchTodoItems());
  }, [dispatch]);

  const handleToggle = (_id: string) => {
    const todoToUpdate = todos.find((todo) => todo._id === _id);
    if (todoToUpdate && _id) {
      dispatch(
        updateTodoItem({
          _id,
          updates: { completed: !todoToUpdate.completed },
        })
      )
        .unwrap()
        .then(() => {
          console.log(`Todo item ${_id} updated successfully`);
        })
        .catch((error) => {
          console.error(`Error updating todo item ${_id}:`, error);
        });
    } else {
      console.error(`Invalid todo item or ID: ${_id}`);
    }
  };

  const handleReset = () => {
    dispatch(resetTodoList());
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      dispatch(addTodoItem(newTodo.trim()));
      setNewTodo("");
    }
  };

  const handleDeleteTodo = (_id: string) => {
    if (_id) {
      dispatch(deleteTodoItem(_id));
    } else {
      console.error("削除しようとしたTODOアイテムのIDが不正です:", _id);
    }
  };

  const handleEditStart = (_id: string, task: string) => {
    setEditingId(_id);
    setEditingText(task);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleEditSave = (_id: string) => {
    if (editingText.trim() && _id) {
      dispatch(updateTodoItem({ _id, updates: { task: editingText.trim() } }))
        .unwrap()
        .then(() => {
          console.log(`Todo item ${_id} updated successfully`);
          setEditingId(null);
          setEditingText("");
        })
        .catch((error) => {
          console.error(`Error updating todo item ${_id}:`, error);
        });
    } else {
      console.error(`Invalid todo item or ID: ${_id}`);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

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
        <div className="space-y-4">
          {todos.map((todo: TodoItem) => (
            <div key={todo._id} className="flex items-center space-x-2">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
