import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Trash2, Edit, Check, X } from "lucide-react";

interface TodoItem {
  id: number;
  task: string;
  completed: boolean;
}

const defaultTodos: TodoItem[] = [
  { id: 1, task: "洗い物", completed: false },
  { id: 2, task: "掃除", completed: false },
  { id: 3, task: "ゴミ捨て", completed: false },
  { id: 4, task: "片づけ", completed: false },
];

export default function DailyTodoReminder() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    const storedTodos = localStorage.getItem("dailyTodos");
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    } else {
      setTodos(defaultTodos);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dailyTodos", JSON.stringify(todos));
  }, [todos]);

  const handleToggle = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleReset = () => {
    setTodos(defaultTodos);
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const newId =
        todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
      setTodos([
        ...todos,
        { id: newId, task: newTodo.trim(), completed: false },
      ]);
      setNewTodo("");
    }
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleEditStart = (id: number, task: string) => {
    setEditingId(id);
    setEditingText(task);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleEditSave = (id: number) => {
    if (editingText.trim()) {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, task: editingText.trim() } : todo
        )
      );
      setEditingId(null);
      setEditingText("");
    }
  };

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
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center space-x-2">
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.completed}
                onCheckedChange={() => handleToggle(todo.id)}
              />
              {editingId === todo.id ? (
                <>
                  <Input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-grow"
                  />
                  <Button size="sm" onClick={() => handleEditSave(todo.id)}>
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
                    htmlFor={`todo-${todo.id}`}
                    className={`flex-grow ${
                      todo.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {todo.task}
                  </Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditStart(todo.id, todo.task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTodo(todo.id)}
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
