"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCcw,
  Trash2,
  Edit,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Star,
  AlertTriangle,
  Clock,
  Award,
} from "lucide-react";
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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  fetchTodoHistory,
  fetchDailyTodoHistory,
  selectDailyHistory,
} from "@/store/todoSlice";

export default function DailyTodoReminder({ isPremium = false }) {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos);
  const status = useSelector(selectTodoStatus);
  const error = useSelector(selectTodoError);
  const todoHistory = useSelector(selectTodoHistory);
  const dailyHistory = useSelector(selectDailyHistory);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [selectedTab, setSelectedTab] = useState("list");
  const [showCommitmentDialog, setShowCommitmentDialog] = useState(false);
  const [commitmentText, setCommitmentText] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "active", "completed"

  // ストリーク計算関数を先に定義
  const calculateStreak = useCallback(() => {
    const sortedDates = Object.keys(todoHistory).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    if (sortedDates.length === 0) {
      setStreakCount(0);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    // 今日か昨日にタスクを完了していない場合はストリークリセット
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      setStreakCount(0);
      return;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i - 1]);
      const prevDate = new Date(sortedDates[i]);

      const diffDays = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    setStreakCount(streak);
  }, [todoHistory]);

  useEffect(() => {
    dispatch(fetchTodoItems());
    // 履歴データも取得
    dispatch(fetchTodoHistory());
    dispatch(fetchDailyTodoHistory());
  }, [dispatch]);

  useEffect(() => {
    if (todos.length > 0) {
      const completedCount = todos.filter((todo) => todo.completed).length;
      const today = new Date().toISOString().split("T")[0];
      dispatch(updateTodoHistory({ date: today, count: completedCount }));

      // ストリーク計算
      calculateStreak();
    }
  }, [todos, dispatch, calculateStreak]);

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
              completedDate: !todoToUpdate.completed
                ? new Date().toISOString()
                : null,
            },
          })
        );

        if (!todoToUpdate.completed) {
          toast.success("お疲れ様でした！タスクを完了しました");
        }
      }
    },
    [dispatch, todos]
  );

  const handleAddTodo = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newTodo.trim()) {
        // 新規タスク追加時には確約ダイアログを表示
        setCommitmentText(newTodo.trim());
        setShowCommitmentDialog(true);
      }
    },
    [newTodo]
  );

  const confirmAddTodo = useCallback(() => {
    if (commitmentText.trim()) {
      const maxPriority = Math.max(...todos.map((todo) => todo.priority), 0);
      // TodoItemの型に合わせて、createdAtとdeadlineは含めない
      dispatch(
        addTodoItem({
          task: commitmentText.trim(),
          priority: maxPriority + 1,
          isPrioritized: false,
        })
      );
      setNewTodo("");
      setShowCommitmentDialog(false);
      toast.success("新しいタスクを追加しました。必ず完了させましょう！");
    }
  }, [dispatch, commitmentText, todos]);

  const handleDeleteTodo = useCallback(
    (id: string) => {
      const todoToDelete = todos.find((todo) => todo._id === id);
      if (todoToDelete && todoToDelete.completed) {
        dispatch(deleteTodoItem(id));
      } else {
        toast.error(
          "完了していないタスクは削除できません。必ず完了させてください。"
        );
      }
    },
    [dispatch, todos]
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
        toast.success("タスクを更新しました");
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

  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      const updatedTodos = [...todos];
      const [movedTodo] = updatedTodos.splice(sourceIndex, 1);
      updatedTodos.splice(destinationIndex, 0, movedTodo);

      const recalculatedTodos = updatedTodos.map((todo, idx) => ({
        ...todo,
        priority: idx + 1,
      }));

      dispatch(reorderTodoItems(recalculatedTodos));
    },
    [dispatch, todos]
  );

  // フィルター処理
  const filteredTodos = [...todos]
    .filter((todo) => {
      if (filterStatus === "active") return !todo.completed;
      if (filterStatus === "completed") return todo.completed;
      return true;
    })
    .sort((a, b) => {
      if (a.completed === b.completed) {
        if (a.isPrioritized === b.isPrioritized) {
          return a.priority - b.priority;
        }
        return a.isPrioritized ? -1 : 1;
      }
      return a.completed ? 1 : -1;
    });

  const todoHistoryArray = Object.entries(todoHistory).map(([date, count]) => ({
    date,
    count,
  }));

  // resetTodoList実行時の処理を修正
  const handleResetTodos = () => {
    if (
      confirm(
        "今日のタスクを締めくくり、新しい日を始めますか？\n完了したタスクはアーカイブされ、未完了のタスクは引き継がれます。"
      )
    ) {
      console.log("リセット開始...");
      dispatch(resetTodoList())
        .then(() => {
          console.log("リセット完了、履歴データを取得中...");
          // リセット後に履歴データを再取得し、明示的に待機
          return Promise.all([
            dispatch(fetchTodoHistory()),
            dispatch(fetchDailyTodoHistory()),
          ]);
        })
        .then(() => {
          console.log("履歴データ取得完了");
          toast.success("新しい日の準備ができました。今日も頑張りましょう！");
        })
        .catch((err) => {
          console.error("エラー発生:", err);
          toast.error("エラーが発生しました: " + err.message);
        });
    }
  };

  // 進捗状況の計算
  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">読み込み中...</div>
    );
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold">本日のToDoリスト</CardTitle>
          <CardDescription>登録したことは必ずやり遂げましょう</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {isPremium && (
            <Badge
              variant="outline"
              className="bg-amber-100 text-amber-800 flex items-center gap-1"
            >
              <Award className="h-3 w-3" />
              <span>プレミアム</span>
            </Badge>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  <Award className="h-4 w-4" />
                  <span>{streakCount}日連続</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>連続{streakCount}日間タスクを完了しています！</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="sm" onClick={handleResetTodos}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            <span>1日を締める</span>
          </Button>
        </div>
      </CardHeader>

      {/* 進捗バー */}
      <div className="px-4 pt-0 pb-2">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span>
            進捗状況: {completedCount}/{totalCount} タスク完了
          </span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <CardContent>
        <Tabs
          defaultValue="list"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
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

            {/* フィルターボタン */}
            <div className="flex mb-4 gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                すべて
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("active")}
              >
                未完了
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("completed")}
              >
                完了済み
              </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="todos">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={
                      snapshot.isDraggingOver
                        ? "droppable-is-dragging-over"
                        : "droppable-is-not-dragging-over"
                    }
                  >
                    <div className="space-y-2">
                      {filteredTodos.map((todo, index) => (
                        <Draggable
                          key={todo._id}
                          draggableId={todo._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center space-x-2 p-3 rounded-md shadow-sm border ${
                                todo.completed
                                  ? "bg-gray-50 border-gray-200"
                                  : todo.isPrioritized
                                  ? "bg-amber-50 border-amber-200"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <Checkbox
                                id={`todo-${todo._id}`}
                                checked={todo.completed}
                                onCheckedChange={() => handleToggle(todo._id)}
                              />
                              {editingId === todo._id ? (
                                <>
                                  <Input
                                    value={editingText}
                                    onChange={(e) =>
                                      setEditingText(e.target.value)
                                    }
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
                                  <div className="flex-grow">
                                    <Label
                                      htmlFor={`todo-${todo._id}`}
                                      className={`${
                                        todo.completed
                                          ? "line-through text-gray-500"
                                          : "font-medium"
                                      }`}
                                    >
                                      {todo.task}
                                    </Label>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        追加:{" "}
                                        {new Date(Date.now()).toLocaleString(
                                          "ja-JP",
                                          {
                                            month: "numeric",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )}
                                      </span>
                                      {todo.completedDate && (
                                        <>
                                          <Check className="h-3 w-3" />
                                          <span>
                                            完了:{" "}
                                            {new Date(
                                              todo.completedDate
                                            ).toLocaleString("ja-JP", {
                                              month: "numeric",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleTogglePriority(todo._id)
                                      }
                                      className={
                                        todo.isPrioritized
                                          ? "text-yellow-500"
                                          : ""
                                      }
                                    >
                                      <Star className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleMoveTodo(todo._id, "up")
                                      }
                                      disabled={index === 0}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleMoveTodo(todo._id, "down")
                                      }
                                      disabled={
                                        index === filteredTodos.length - 1
                                      }
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleEditStart(todo._id, todo.task)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="ghost">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            タスクの削除
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            {todo.completed
                                              ? "このタスクを削除してもよろしいですか？"
                                              : "完了していないタスクは削除できません。必ず完了させてください。"}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            キャンセル
                                          </AlertDialogCancel>
                                          {todo.completed && (
                                            <AlertDialogAction
                                              onClick={() =>
                                                handleDeleteTodo(todo._id)
                                              }
                                            >
                                              削除する
                                            </AlertDialogAction>
                                          )}
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </>
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

            {todos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>タスクがありません。新しいタスクを追加しましょう！</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="calendar">
            <TodoCalendar
              todoHistory={
                dailyHistory.length > 0 ? dailyHistory : todoHistoryArray
              }
            />
          </TabsContent>
          <TabsContent value="chart">
            <TodoChart
              todoHistory={
                dailyHistory.length > 0 ? dailyHistory : todoHistoryArray
              }
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* 確約ダイアログ */}
      <Dialog
        open={showCommitmentDialog}
        onOpenChange={setShowCommitmentDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タスクへのコミットメント</DialogTitle>
            <DialogDescription>
              このタスクを追加すると、必ず完了させる必要があります。削除はできません。
              本当にこのタスクを追加しますか？
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700">{commitmentText}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCommitmentDialog(false)}
            >
              キャンセル
            </Button>
            <Button onClick={confirmAddTodo}>コミットして追加する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
