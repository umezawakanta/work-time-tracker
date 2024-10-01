import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

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

  return (
    <Card className="w-full mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">本日のToDoリスト</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center space-x-2">
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.completed}
                onCheckedChange={() => handleToggle(todo.id)}
              />
              <Label
                htmlFor={`todo-${todo.id}`}
                className={`${
                  todo.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {todo.task}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
