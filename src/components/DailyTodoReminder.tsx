import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleToggle = (_id: string) => {
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
          toast.success(`Todo項目 ${_id} が正常に更新されました`);
        })
        .catch((error) => {
          toast.error(`Todo項目 ${_id} の更新中にエラーが発生しました: ${error}`);
        });
    } else {
      toast.error(`無効なTodo項目またはID: ${_id}`);
    }
  };

  const handleReset = () => {
    dispatch(resetTodoList())
      .unwrap()
      .then(() => {
        toast.success("Todoリストが正常にリセットされました");
      })
      .catch((error) => {
        toast.error(`Todoリストのリセット中にエラーが発生しました: ${error}`);
      });
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      dispatch(addTodoItem(newTodo.trim()))
        .unwrap()
        .then(() => {
          toast.success("新しいTodo項目が正常に追加されました");
          setNewTodo("");
        })
        .catch((error) => {
          toast.error(`新しいTodo項目の追加中にエラーが発生しました: ${error}`);
        });
    }
  };

  const handleDeleteTodo = (_id: string) => {
    if (_id) {
      dispatch(deleteTodoItem(_id))
        .unwrap()
        .then(() => {
          toast.success(`Todo項目 ${_id} が正常に削除されました`);
        })
        .catch((error) => {
          toast.error(`Todo項目 ${_id} の削除中にエラーが発生しました: ${error}`);
        });
    } else {
      toast.error(`無効なTodo項目ID: ${_id}`);
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
          toast.success(`Todo項目 ${_id} が正常に更新されました`);
          setEditingId(null);
          setEditingText("");
        })
        .catch((error) => {
          toast.error(`Todo項目 ${_id} の更新中にエラーが発生しました: ${error}`);
        });
    } else {
      toast.error(`無効なTodo項目またはID: ${_id}`);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    dispatch(reorderTodoItems(items))
      .unwrap()
      .then(() => {
        toast.success("Todoリストが正常に並べ替えられました");
      })
      .catch((error) => {
        toast.error(`Todoリストの並べ替え中にエラーが発生しました: ${error}`);
      });
  };

  if (status === "loading") {
    return <div>読み込み中...</div>;
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
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {todos.map((todo, index) => (
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