"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCcw, Trash2, Edit, Check, X, ChevronUp, ChevronDown, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchTodoItems,
  addTodoItem,
  updateTodoItem,
  deleteTodoItem,
  resetTodoList,
  reorderTodoItems,
  toggleTodoPriority,
  selectTodos,
  selectTodoStatus,
  selectTodoError,
  selectTodoHistory,
  updateTodoHistory,
} from "@/store/todoSlice";
import { AppDispatch } from "@/store";
import { TodoCalendar } from "@/components/calendar/TodoCalendar";
import { TodoChart } from "@/components/chart/TodoChart";

export default function DailyTodoReminder() {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos);
  const status = useSelector(selectTodoStatus);
  const error = useSelector(selectTodoError);
  const todoHistory = useSelector(selectTodoHistory);

  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    dispatch(fetchTodoItems());
  }, [dispatch]);

  useEffect(() => {
    if (todos.length > 0) {
      const completedCount = todos.filter((todo) => todo.completed).length;
      const today = new Date().toISOString().split("T")[0];
      dispatch(updateTodoHistory({ date: today, count: completedCount }));
    }
  }, [todos, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleToggle = useCallback(
    (id: string) => {
      const todoToUpdate = todos.find((todo) => todo._id === id);
      if (todoToUpdate) {
        dispatch(
          updateTodoItem({
            _id: id,
            updates: {
              completed: !todoToUpdate.completed,
              completedDate: !todoToUpdate.completed ? new Date().toISOString() : null,
            },
          })
        );
      }
    },
    [dispatch, todos]
  );

  const handleAddTodo = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newTodo.trim()) {
        const maxPriority = Math.max(...todos.map((todo) => todo.priority), 0);
        dispatch(addTodoItem({ task: newTodo.trim(), priority: maxPriority + 1, isPrioritized: false }));
        setNewTodo("");
      }
    },
    [dispatch, newTodo, todos]
  );

  const handleDeleteTodo = useCallback(
    (id: string) => {
      dispatch(deleteTodoItem(id));
    },
    [dispatch]
  );

  const handleEditStart = useCallback((id: string, task: string) => {
    setEditingId(id);
    setEditingText(task);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditingText("");
  }, []);

  const handleEditSave = useCallback(
    (id: string) => {
      if (editingText.trim()) {
        dispatch(
          updateTodoItem({ _id: id, updates: { task: editingText.trim() } })
        );
        setEditingId(null);
        setEditingText("");
      }
    },
    [dispatch, editingText]
  );

  const handleMoveTodo = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = todos.findIndex((todo) => todo._id === id);
      if (index === -1) return;
  
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= todos.length) return;
  
      // タスクの順番を変更
      const updatedTodos = [...todos];
      const [movedTodo] = updatedTodos.splice(index, 1); // 対象のタスクを削除
      updatedTodos.splice(newIndex, 0, movedTodo); // 新しい位置に挿入
  
      // 優先度を再計算（順番通りの番号を付ける）
      const recalculatedTodos = updatedTodos.map((todo, idx) => ({
        ...todo,
        priority: idx + 1,
      }));
  
      // 更新したタスクリストをReduxストアに保存
      dispatch(reorderTodoItems(recalculatedTodos));
    },
    [dispatch, todos]
  );
  

  const handleTogglePriority = useCallback(
    (id: string) => {
      dispatch(toggleTodoPriority(id));
    },
    [dispatch]
  );

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) {
      if (a.isPrioritized === b.isPrioritized) {
        return a.priority - b.priority;
      }
      return a.isPrioritized ? -1 : 1;
    }
    return a.completed ? 1 : -1;
  });

  const todoHistoryArray = Object.entries(todoHistory).map(([date, count]) => ({ date, count }));

  if (status === "loading") {
    return <div>読み込み中...</div>;
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">本日のToDoリスト</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => dispatch(resetTodoList())}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">リスト</TabsTrigger>
            <TabsTrigger value="calendar">カレンダー</TabsTrigger>
            <TabsTrigger value="chart">グラフ</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
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
              {sortedTodos.map((todo, index) => (
                <div key={todo._id} className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm">
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
                      <Button size="sm" variant="outline" onClick={handleEditCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Label
                        htmlFor={`todo-${todo._id}`}
                        className={`flex-grow ${todo.completed ? "line-through text-gray-500" : ""}`}
                      >
                        {todo.task}
                      </Label>
                      <span className="text-sm text-gray-500">
                        {todo.completedDate ? new Date(todo.completedDate).toLocaleDateString() : "未完了"}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePriority(todo._id)}
                        className={todo.isPrioritized ? "text-yellow-500" : ""}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMoveTodo(todo._id, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMoveTodo(todo._id, "down")}
                        disabled={index === sortedTodos.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditStart(todo._id, todo.task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteTodo(todo._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="calendar">
            <TodoCalendar todoHistory={todoHistoryArray} />
          </TabsContent>
          <TabsContent value="chart">
            <TodoChart todoHistory={todoHistoryArray} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
