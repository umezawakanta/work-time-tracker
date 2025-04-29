import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCcw,
  Award,
  Brain
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchTodoItems,
  resetTodoList,
  adjustDeadlinePriorities,
  selectTodos,
  selectTodoStatus,
  selectTodoError,
  selectTodoHistory,
  updateTodoHistory,
  fetchTodoHistory,
  fetchDailyTodoHistory,
  selectDailyHistory,
  fetchAnalysisSummary,
  checkPremiumStatus,
  selectIsPremium
} from "@/store/todoSlice";
import { AppDispatch } from "@/store";
import { TodoCalendar } from "@/components/calendar/TodoCalendar";
import { TodoChart } from "@/components/chart/TodoChart";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// サブコンポーネントのインポート
import TodoList from "./todo/TodoList";
import ProgressSection from "./sections/ProgressSection";
import StreakDisplay from "./sections/StreakDisplay";
import TodoAnalysis from "./analysis/TodoAnalysis";
import TodoViewControls from "./controls/TodoViewControls";

// 共通の型定義をインポート
import { Todo } from '@/types/todo';

// CSSスタイル
import "./DailyTodoReminder.css";

interface DailyTodoReminderProps {
  isPremium?: boolean;
}

export default function DailyTodoReminder({ isPremium = false }: DailyTodoReminderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos) as Todo[];
  const status = useSelector(selectTodoStatus);
  const error = useSelector(selectTodoError);
  const todoHistory = useSelector(selectTodoHistory);
  const dailyHistory = useSelector(selectDailyHistory);
  const hasPremium = useSelector(selectIsPremium) || isPremium;
  
  // 状態管理
  const [selectedTab, setSelectedTab] = useState("list");
  const [filterStatus, setFilterStatus] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const initialAdjustmentDone = useRef(false);

  // データ取得
  useEffect(() => {
    dispatch(fetchTodoItems());
    dispatch(fetchTodoHistory());
    dispatch(fetchDailyTodoHistory());
    
    // プレミアム状態チェック
    dispatch(checkPremiumStatus());
    
    // プレミアムユーザーの場合は分析データも取得
    if (hasPremium) {
      dispatch(fetchAnalysisSummary());
    }
  }, [dispatch, hasPremium]);

  // ストリーク計算関数
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

  // 自動優先度調整
  useEffect(() => {
    if (!autoAdjustEnabled) return;

    // 初回読み込み完了時のみ優先度調整を実行
    if (
      todos.length > 0 &&
      status === "succeeded" &&
      !initialAdjustmentDone.current
    ) {
      initialAdjustmentDone.current = true;
      dispatch(adjustDeadlinePriorities());
    }

    // 4時間おきに優先度を再調整
    const intervalId = setInterval(() => {
      if (todos.length > 0) {
        dispatch(adjustDeadlinePriorities());
        toast.success("タスクの優先度を期限に基づいて自動調整しました", {
          duration: 3000,
        });
      }
    }, 4 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [dispatch, autoAdjustEnabled, todos, status]);

  // Todo完了状態の更新
  useEffect(() => {
    if (todos.length > 0) {
      const completedCount = todos.filter((todo) => todo.completed).length;
      const today = new Date().toISOString().split("T")[0];
      dispatch(updateTodoHistory({ date: today, count: completedCount }));

      // ストリーク計算
      calculateStreak();
    }
  }, [todos, dispatch, calculateStreak]);

  // エラー処理
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // タスクリスト リセット
  const handleResetTodos = () => {
    if (
      confirm(
        "今日のタスクを締めくくり、新しい日を始めますか？\n完了したタスクはアーカイブされ、未完了のタスクは引き継がれます。"
      )
    ) {
      dispatch(resetTodoList())
        .then(() => {
          return Promise.all([
            dispatch(fetchTodoHistory()),
            dispatch(fetchDailyTodoHistory()),
          ]);
        })
        .then(() => {
          toast.success("新しい日の準備ができました。今日も頑張りましょう！");
        })
        .catch((err) => {
          console.error("エラー発生:", err);
          toast.error("エラーが発生しました: " + (err as Error).message);
        });
    }
  };

  // フィルター処理
  const getFilteredTodos = () => {
    return [...todos]
      .filter((todo) => {
        // Status filter
        if (filterStatus === "active" && todo.completed) return false;
        if (filterStatus === "completed" && !todo.completed) return false;

        // Category filter
        if (categoryFilter === "input" && todo.type !== "input") return false;
        if (categoryFilter === "output" && todo.type !== "output") return false;
        if (categoryFilter === "deadline" && !todo.deadline) return false;

        return true;
      })
      .sort((a, b) => {
        // まず完了状態でソート
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1; // 未完了タスクを上に
        }

        // 次に優先状態でソート
        if (a.isPrioritized !== b.isPrioritized) {
          return a.isPrioritized ? -1 : 1; // 優先タスクを上に
        }

        // 最後に優先度の逆順でソート
        return b.priority - a.priority;
      });
  };

  // todoHistoryを配列形式に変換
  const convertTodoHistoryToArray = (
    history: Record<string, number>
  ): { date: string; count: number }[] => {
    return Object.entries(history).map(([date, count]) => ({
      date,
      count,
    }));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCcw className="h-6 w-6 animate-spin mr-2" />
        <span>読み込み中...</span>
      </div>
    );
  }

  // 進捗状況の計算
  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // インプット/アウトプットのバランス計算
  const inputCount = todos.filter((todo) => todo.type === "input").length;
  const outputCount = todos.filter((todo) => todo.type === "output").length;

  return (
    <Card className="w-full shadow-sm border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">本日のToDoリスト</CardTitle>
            <CardDescription>登録したことは必ずやり遂げましょう</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {hasPremium && (
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-800 flex items-center gap-1"
              >
                <Award className="h-3 w-3" />
                <span>プレミアム</span>
              </Badge>
            )}
            <StreakDisplay streakCount={streakCount} />
            <Button variant="outline" size="sm" onClick={handleResetTodos}>
              <RefreshCcw className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">1日を締める</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* 進捗セクション */}
      <ProgressSection 
        completedCount={completedCount}
        totalCount={totalCount}
        progressPercentage={progressPercentage}
        inputCount={inputCount}
        outputCount={outputCount}
      />

      <CardContent className="pb-2 pt-0">
        <Tabs
          defaultValue="list"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="list">リスト</TabsTrigger>
            <TabsTrigger value="calendar">カレンダー</TabsTrigger>
            <TabsTrigger value="chart">グラフ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="m-0">
            {hasPremium && (
              <div className="flex justify-end mb-3">
                <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex items-center gap-1"
                    >
                      <Brain className="h-4 w-4" />
                      <span>タスク分析</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px]">
                    <TodoAnalysis />
                  </DialogContent>
                </Dialog>
              </div>
            )}
            
            <TodoViewControls
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              showAddForm={showAddForm}
              setShowAddForm={setShowAddForm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              autoAdjustEnabled={autoAdjustEnabled}
              setAutoAdjustEnabled={setAutoAdjustEnabled}
              onAdjustPriorities={() => {
                dispatch(adjustDeadlinePriorities());
                toast.success("タスクの優先度を調整しました");
              }}
            />
            
            <TodoList 
              todos={getFilteredTodos()}
              isPremium={hasPremium}
              onAnalyzeRequest={() => setShowAnalysis(true)}
            />
          </TabsContent>
          
          <TabsContent value="calendar">
            <TodoCalendar
              todoHistory={
                dailyHistory.length > 0
                  ? dailyHistory
                  : convertTodoHistoryToArray(todoHistory)
              }
            />
          </TabsContent>
          
          <TabsContent value="chart">
            <TodoChart
              todoHistory={
                dailyHistory.length > 0
                  ? dailyHistory
                  : convertTodoHistoryToArray(todoHistory)
              }
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}