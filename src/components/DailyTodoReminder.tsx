import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCcw, Trash2, Edit, Check, X, GripVertical } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchTodoItems,
  addTodoItem,
  updateTodoItem,
  deleteTodoItem,
  resetTodoList,
  reorderTodoItems,
  selectTodos,
  selectTodoStatus,
  selectTodoError,
  selectTodoHistory,
  updateTodoHistory,
} from "@/store/todoSlice";
import { AppDispatch } from "@/store";
import { TodoCalendar } from "@/components/calendar/TodoCalendar";
import { TodoChart } from "@/components/chart/TodoChart";
import "./DailyTodoReminder.css";
import { CSSProperties } from 'react';

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
      dispatch(updateTodoHistory());
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
            updates: { completed: !todoToUpdate.completed },
          })
        );
      }
    },
    [dispatch, todos]
  );

  const handleReset = useCallback(() => {
    dispatch(resetTodoList());
  }, [dispatch]);

  const handleAddTodo = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newTodo.trim()) {
        dispatch(addTodoItem(newTodo.trim()));
        setNewTodo("");
      }
    },
    [dispatch, newTodo]
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

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(todos);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      dispatch(reorderTodoItems(items));
    },
    [dispatch, todos]
  );

  const getItemStyle = (
    draggableStyle: CSSProperties | undefined
  ): CSSProperties => ({
    ...draggableStyle,
  });

  if (status === "loading") {
    return <div>読み込み中...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Card className="w-full mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            本日のToDoリスト
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset}>
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
              {/* リスト表示のコードは変更なし */}
            </TabsContent>
            <TabsContent value="calendar">
              <TodoCalendar todoHistory={todoHistory} />
            </TabsContent>
            <TabsContent value="chart">
              <TodoChart todoHistory={todoHistory} />
            </TabsContent>
          </Tabs>
          <form onSubmit={handleAddTodo} className="flex space-x-2 mb-4">
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="新しいタスクを追加"
            />
            <Button type="submit">追加</Button>
          </form>
          <Droppable droppableId="todos">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-4 ${
                  snapshot.isDraggingOver
                    ? "droppable-is-dragging-over"
                    : "droppable-is-not-dragging-over"
                }`}
              >
                {todos.map((todo, index) => (
                  <Draggable
                    key={todo._id}
                    draggableId={todo._id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`draggable-item flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm ${
                          snapshot.isDragging ? "bg-light-green" : ""
                        }`}
                        data-style={JSON.stringify(
                          getItemStyle(provided.draggableProps.style)
                        )}
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
                            <Button
                              size="sm"
                              onClick={() => handleEditSave(todo._id)}
                            >
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
                                todo.completed
                                  ? "line-through text-gray-500"
                                  : ""
                              }`}
                            >
                              {todo.task}
                            </Label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleEditStart(todo._id, todo.task)
                              }
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
        </CardContent>
      </Card>
    </DragDropContext>
  );
}
