// src/components/DailyTodoReminderWithRateLimit.tsx
// レート制限を考慮したDailyTodoReminderコンポーネント

import { useState, useEffect, useCallback } from "react";
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
  Download,
  Upload,
  BarChart2,
  Sparkles,
  Calendar,
  Zap,
  ArrowUp,
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
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchTodoHistory,
  fetchDailyTodoHistory,
  selectDailyHistory,
} from "@/store/todoSlice";

// GeminiServiceをインポート
import GeminiService, { TaskClassification } from "@/services/GeminiService";
// TaskPriorityServiceをインポート
import TaskPriorityService, {
  PriorityAnalysis,
} from "@/services/TaskPriorityService";

// CSS をインポート
import "./DailyTodoReminder.css";

// TaskType型を定義
type TaskType = "input" | "output";

// APIレート制限管理
const API_COOLDOWN = 5000; // 5秒間隔
let lastApiCallTime = 0;

export default function DailyTodoReminderWithRateLimit({ isPremium = false }) {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos);
  const status = useSelector(selectTodoStatus);
  const error = useSelector(selectTodoError);
  const todoHistory = useSelector(selectTodoHistory);
  const dailyHistory = useSelector(selectDailyHistory);
  const [newTodo, setNewTodo] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("input");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingType, setEditingType] = useState<TaskType>("input");
  const [selectedTab, setSelectedTab] = useState("list");
  const [showCommitmentDialog, setShowCommitmentDialog] = useState(false);
  const [commitmentText, setCommitmentText] = useState("");
  const [commitmentType, setCommitmentType] = useState<TaskType>("input");
  const [streakCount, setStreakCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "active", "completed"
  const [categoryFilter, setCategoryFilter] = useState("all"); // "all", "input", "output"

  // Gemini関連の状態を追加
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] =
    useState<TaskClassification | null>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  // 優先度分析関連の状態を追加
  const [priorityAnalysis, setPriorityAnalysis] =
    useState<PriorityAnalysis | null>(null);
  const [isAnalyzingPriority, setIsAnalyzingPriority] = useState(false);
  const [showPrioritySuggestion, setShowPrioritySuggestion] = useState(false);
  const [suggestedDeadline, setSuggestedDeadline] = useState<
    string | undefined
  >(undefined);
  const [priorityEnabled, setPriorityEnabled] = useState(false);

  // 手動分析用の状態
  const [analysisButtonEnabled, setAnalysisButtonEnabled] = useState(true);
  const [isManualAnalysis, setIsManualAnalysis] = useState(false);

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

  // タスク入力ハンドラー（自動分析なし）
  const handleTaskInput = useCallback((value: string) => {
    setNewTodo(value);

    // 入力時は分析を行わず、UIの状態のみクリア（必要に応じて）
    if (value.trim() === "") {
      setClassification(null);
      setShowAiSuggestion(false);
      setPriorityAnalysis(null);
      setShowPrioritySuggestion(false);
    }
  }, []);

  // 手動分析ボタンのハンドラー
  const handleManualAnalysis = useCallback(async () => {
    if (!newTodo.trim() || newTodo.trim().length < 5) {
      toast.error("分析するには、より詳細なタスク内容を入力してください");
      return;
    }

    if (isClassifying || isAnalyzingPriority) {
      return; // 既に分析中なら実行しない
    }

    // レート制限チェック
    const now = Date.now();
    if (now - lastApiCallTime < API_COOLDOWN) {
      toast.error(
        `APIリクエストの間隔が短すぎます。あと${Math.ceil(
          (API_COOLDOWN - (now - lastApiCallTime)) / 1000
        )}秒お待ちください`
      );
      return;
    }

    setIsManualAnalysis(true);
    setIsClassifying(true);
    setIsAnalyzingPriority(true);
    setAnalysisButtonEnabled(false);
    lastApiCallTime = now;

    try {
      // タスクタイプの分類
      const typeResult = await GeminiService.classifyTaskType(newTodo);
      setClassification(typeResult);
      setTaskType(typeResult.type);

      if (typeResult.confidence > 0.65) {
        setShowAiSuggestion(true);
      }

      // タスク優先度の分析（少し遅延させて連続リクエストを避ける）
      await new Promise((resolve) => setTimeout(resolve, 500));
      const priorityResult = await TaskPriorityService.analyzePriority(newTodo);
      setPriorityAnalysis(priorityResult);
      setSuggestedDeadline(priorityResult.suggestedDeadline);
      setPriorityEnabled(priorityResult.isPrioritized);

      if (priorityResult.isPrioritized) {
        setShowPrioritySuggestion(true);
      }

      toast.success("タスク分析が完了しました");
    } catch (error) {
      console.error("タスク分析エラー:", error);
      toast.error("分析中にエラーが発生しました");

      // エラー時はローカル分析を試行
      try {
        // タイプの簡易判定
        const lowerText = newTodo.toLowerCase();
        let detectedType: TaskType = "input";

        // 単純なキーワードベースで判定
        const outputKeywords = [
          "作る",
          "書く",
          "開発",
          "コード",
          "投稿",
          "実践",
          "発表",
        ];
        if (outputKeywords.some((keyword) => lowerText.includes(keyword))) {
          detectedType = "output";
        }

        setTaskType(detectedType);
        setClassification({
          type: detectedType,
          confidence: 0.6,
          explanation: `キーワード分析により${
            detectedType === "input" ? "インプット" : "アウトプット"
          }タスクと判断しました（ローカル分析）`,
        });
        setShowAiSuggestion(true);

        // 優先度の簡易判定
        const isPriority =
          lowerText.includes("重要") ||
          lowerText.includes("緊急") ||
          lowerText.includes("今日") ||
          lowerText.includes("明日");
        setPriorityEnabled(isPriority);

        if (isPriority) {
          setPriorityAnalysis({
            isPrioritized: true,
            importance: 7,
            urgency: 7,
            explanation:
              "キーワード分析により優先タスクと判断しました（ローカル分析）",
          });
          setShowPrioritySuggestion(true);
        }
      } catch (localError) {
        console.error("ローカル分析エラー:", localError);
      }
    } finally {
      setIsManualAnalysis(false);
      setIsClassifying(false);
      setIsAnalyzingPriority(false);

      // 一定時間後にボタンを再有効化
      setTimeout(() => {
        setAnalysisButtonEnabled(true);
      }, API_COOLDOWN); // クールダウン時間後
    }
  }, [newTodo, isClassifying, isAnalyzingPriority]); // 依存配列に状態変数を追加

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
        setCommitmentType(taskType);
        setShowCommitmentDialog(true);
      }
    },
    [newTodo, taskType]
  );

  const confirmAddTodo = useCallback(() => {
    if (commitmentText.trim()) {
      // 最大の優先度を取得して、新しいタスクにはそれよりも大きな値を設定
      const maxPriority = Math.max(...todos.map((todo) => todo.priority), 0);

      dispatch(
        addTodoItem({
          task: commitmentText.trim(),
          priority: maxPriority + 1,
          isPrioritized: priorityEnabled,
          type: commitmentType,
          deadline: suggestedDeadline, // deadline プロパティを正しく渡す
        })
      );

      setNewTodo("");
      setShowAiSuggestion(false);
      setShowPrioritySuggestion(false);
      setClassification(null);
      setPriorityAnalysis(null);
      setSuggestedDeadline(undefined);
      setPriorityEnabled(false);
      setShowCommitmentDialog(false);

      toast.success(
        `新しい${
          commitmentType === "input" ? "インプット" : "アウトプット"
        }タスクを追加しました。必ず完了させましょう！${
          priorityEnabled ? "（優先タスク）" : ""
        }${
          suggestedDeadline ? `（期限: ${suggestedDeadline}）` : "" // 期限情報をトーストにも表示
        }`
      );
    }
  }, [
    dispatch,
    commitmentText,
    commitmentType,
    todos,
    priorityEnabled,
    suggestedDeadline,
  ]);

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

  const handleEditStart = useCallback(
    (id: string, task: string, type: TaskType | undefined) => {
      setEditingId(id);
      setEditingText(task);
      setEditingType(type || "input");
    },
    []
  );

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditingText("");
    setEditingType("input");
  }, []);

  const handleEditSave = useCallback(
    (id: string) => {
      if (editingText.trim()) {
        dispatch(
          updateTodoItem({
            _id: id,
            updates: {
              task: editingText.trim(),
              type: editingType,
            },
          })
        );
        setEditingId(null);
        setEditingText("");
        setEditingType("input");
        toast.success("タスクを更新しました");
      }
    },
    [dispatch, editingText, editingType]
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
      // Status filter
      if (filterStatus === "active" && todo.completed) return false;
      if (filterStatus === "completed" && !todo.completed) return false;

      // Category filter
      if (categoryFilter === "input" && todo.type !== "input") return false;
      if (categoryFilter === "output" && todo.type !== "output") return false;

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

      // 最後に優先度の逆順（大きい数値が新しいタスク）でソート
      // より大きな優先度（新しいタスク）が上に来るようにする
      return b.priority - a.priority;
    });

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

  // インプット/アウトプットのバランス計算
  const inputCount = todos.filter((todo) => todo.type === "input").length;
  const outputCount = todos.filter((todo) => todo.type === "output").length;
  const totalTypeCount = inputCount + outputCount;
  const inputPercentage =
    totalTypeCount > 0 ? Math.round((inputCount / totalTypeCount) * 100) : 50;
  const outputPercentage =
    totalTypeCount > 0 ? Math.round((outputCount / totalTypeCount) * 100) : 50;

  const getTaskTypeIcon = (type: TaskType | undefined) => {
    if (type === "input") return <Download className="h-3 w-3 text-blue-500" />;
    if (type === "output") return <Upload className="h-3 w-3 text-green-500" />;
    return null;
  };

  const getTaskTypeColor = (type: TaskType | undefined) => {
    if (type === "input") return "bg-blue-50 text-blue-700 border-blue-200";
    if (type === "output") return "bg-green-50 text-green-700 border-green-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  // AIの提案を表示するコンポーネント
  const AiSuggestionBadge = () => {
    if (!showAiSuggestion || !classification) return null;

    return (
      <div className="flex items-center mt-1 mb-2 bg-purple-50 p-2 rounded-md border border-purple-200">
        <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
        <div>
          <p className="text-sm text-purple-700">
            AIによる提案: この内容は
            <span className="font-medium">
              {classification.type === "input" ? "インプット" : "アウトプット"}
            </span>
            タスクです
          </p>
          <p className="text-xs text-purple-600">
            {classification.explanation}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={() => setShowAiSuggestion(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  // 優先度提案を表示するコンポーネント
  const PrioritySuggestionBadge = () => {
    if (!showPrioritySuggestion || !priorityAnalysis) return null;

    const { importance, urgency, explanation, suggestedDeadline } =
      priorityAnalysis;

    return (
      <div className="flex items-start mt-1 mb-2 bg-amber-50 p-2 rounded-md border border-amber-200">
        <ArrowUp className="h-4 w-4 text-amber-500 mr-2 mt-1 flex-shrink-0" />
        <div className="flex-grow">
          <p className="text-sm text-amber-700 font-medium">
            優先タスク候補として検出しました
          </p>
          <p className="text-xs text-amber-600 mt-1">{explanation}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="flex items-center">
              <Zap className="h-3 w-3 text-amber-500 mr-1" />
              <span className="text-xs text-amber-700">
                重要度: {importance}/10
              </span>
            </div>
            <div className="flex items-center">
              <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
              <span className="text-xs text-amber-700">
                緊急度: {urgency}/10
              </span>
            </div>
            {suggestedDeadline && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 text-amber-500 mr-1" />
                <span className="text-xs text-amber-700">
                  推奨期限: {suggestedDeadline}
                </span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 flex-shrink-0"
          onClick={() => setShowPrioritySuggestion(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  // 以下はUIの返却部分（既存コードを流用して一部を修正）
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">読み込み中...</div>
    );
  }

  // 動的な幅を最も近いCSSクラスに変換する関数
  const getWidthClass = (percentage: number): string => {
    // 0から100までの値を5刻みで丸める
    const roundedPercentage = Math.round(percentage / 5) * 5;

    // 対応するクラス名を返す
    return `w-${roundedPercentage}`;
  };

  // todoHistoryを配列形式に変換するヘルパー関数を追加
  const convertTodoHistoryToArray = (
    history: Record<string, number>
  ): { date: string; count: number }[] => {
    return Object.entries(history).map(([date, count]) => ({
      date,
      count,
    }));
  };

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

      {/* インプット/アウトプットバランス */}
      <div className="px-4 pt-0 pb-3">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span>
            インプット/アウトプットバランス: {inputCount}/{outputCount} タスク
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">{inputPercentage}%</span>
            <span>:</span>
            <span className="text-green-600">{outputPercentage}%</span>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`progress-bar-input ${getWidthClass(inputPercentage)}`}
          ></div>
          <div
            className={`progress-bar-output ${getWidthClass(outputPercentage)}`}
          ></div>
        </div>
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
            <form onSubmit={handleAddTodo} className="space-y-2 mb-4">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={newTodo}
                  onChange={(e) => handleTaskInput(e.target.value)}
                  placeholder="新しいタスクを追加"
                  className="flex-1"
                />
                <Select
                  value={taskType}
                  onValueChange={(value: TaskType) => setTaskType(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="input">
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-2 text-blue-500" />
                        <span>インプット</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="output">
                      <div className="flex items-center">
                        <Upload className="h-4 w-4 mr-2 text-green-500" />
                        <span>アウトプット</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit">追加</Button>
              </div>

              {/* AI分析ボタン */}
              <Button
                type="button"
                variant="outline"
                onClick={handleManualAnalysis}
                disabled={
                  !analysisButtonEnabled ||
                  isClassifying ||
                  isAnalyzingPriority ||
                  newTodo.trim().length < 5
                }
                className="w-full mt-2"
              >
                {isClassifying || isAnalyzingPriority ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2">
                      <RefreshCcw className="h-3 w-3" />
                    </div>
                    <span>タスク分析中...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>AIでタスクを分析する</span>
                  </div>
                )}
              </Button>

              {/* AI提案バッジを表示 */}
              <AiSuggestionBadge />

              {/* 優先度の提案 */}
              <PrioritySuggestionBadge />

              {/* 分析中の表示 */}
              {(isClassifying || isAnalyzingPriority) && isManualAnalysis && (
                <div className="flex items-center mt-1 justify-center">
                  <div className="animate-spin mr-2">
                    <RefreshCcw className="h-3 w-3 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-500">
                    {isClassifying && isAnalyzingPriority
                      ? "タスクを総合的に分析中..."
                      : isClassifying
                      ? "タイプを分析中..."
                      : "優先度を分析中..."}
                  </span>
                </div>
              )}
            </form>

            {/* フィルターボタン */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
              <div className="flex gap-2">
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
              <div className="flex gap-2">
                <Button
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("all")}
                >
                  全種別
                </Button>
                <Button
                  variant={categoryFilter === "input" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("input")}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  インプット
                </Button>
                <Button
                  variant={categoryFilter === "output" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("output")}
                  className="flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  アウトプット
                </Button>
              </div>
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
                                  : getTaskTypeColor(todo.type)
                              }`}
                            >
                              <Checkbox
                                id={`todo-${todo._id}`}
                                checked={todo.completed}
                                onCheckedChange={() => handleToggle(todo._id)}
                              />
                              {editingId === todo._id ? (
                                <>
                                  <div className="flex-grow flex gap-2">
                                    <Input
                                      value={editingText}
                                      onChange={(e) =>
                                        setEditingText(e.target.value)
                                      }
                                      className="flex-grow"
                                    />
                                    <Select
                                      value={editingType}
                                      onValueChange={(value: TaskType) =>
                                        setEditingType(value)
                                      }
                                    >
                                      <SelectTrigger className="w-40">
                                        <SelectValue placeholder="タイプを選択" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="input">
                                          <div className="flex items-center">
                                            <Download className="h-4 w-4 mr-2 text-blue-500" />
                                            <span>インプット</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="output">
                                          <div className="flex items-center">
                                            <Upload className="h-4 w-4 mr-2 text-green-500" />
                                            <span>アウトプット</span>
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
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
                                    <div className="flex items-center gap-2">
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
                                      <div className="flex items-center gap-1">
                                        <Badge
                                          variant="outline"
                                          className={`flex items-center gap-1 text-xs ${
                                            todo.type === "input"
                                              ? "bg-blue-50 text-blue-700 border-blue-200"
                                              : "bg-green-50 text-green-700 border-green-200"
                                          }`}
                                        >
                                          {getTaskTypeIcon(todo.type)}
                                          <span>
                                            {todo.type === "input"
                                              ? "インプット"
                                              : "アウトプット"}
                                          </span>
                                        </Badge>
                                        {todo.isPrioritized && (
                                          <Badge
                                            variant="outline"
                                            className="priority-badge flex items-center gap-1"
                                          >
                                            <Star className="h-3 w-3" />
                                            <span>優先</span>
                                          </Badge>
                                        )}
                                        {todo.deadline && (
                                          <Badge
                                            variant="outline"
                                            className="deadline-badge"
                                          >
                                            <Calendar className="h-3 w-3" />
                                            <span>{todo.deadline}</span>
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        追加:{" "}
                                        {new Date(
                                          todo.createdAt || Date.now()
                                        ).toLocaleString("ja-JP", {
                                          month: "numeric",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
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
                                        handleEditStart(
                                          todo._id,
                                          todo.task,
                                          todo.type
                                        )
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

            {filteredTodos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>
                  表示できるタスクがありません。条件を変更するか、新しいタスクを追加しましょう！
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="calendar">
            // TodoCalendarコンポーネントを使用する部分
            <TodoCalendar
              todoHistory={
                dailyHistory.length > 0
                  ? dailyHistory
                  : convertTodoHistoryToArray(todoHistory)
              }
            />
          </TabsContent>
          <TabsContent value="chart">
            <div className="space-y-6">
              <TodoChart
                todoHistory={
                  dailyHistory.length > 0
                    ? dailyHistory
                    : convertTodoHistoryToArray(todoHistory)
                }
              />
              {/* インプット/アウトプット比率グラフ */}
              <Card className="p-4">
                <CardTitle className="text-md mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    <span>インプット/アウトプット比率</span>
                  </div>
                </CardTitle>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">
                      インプット: {inputCount}タスク ({inputPercentage}%)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      アウトプット: {outputCount}タスク ({outputPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div
                      className={`progress-bar-input progress-bar-label ${getWidthClass(
                        inputPercentage
                      )}`}
                    >
                      {inputPercentage > 15 ? `${inputPercentage}%` : ""}
                    </div>
                    <div
                      className={`progress-bar-output progress-bar-label ${getWidthClass(
                        outputPercentage
                      )}`}
                    >
                      {outputPercentage > 15 ? `${outputPercentage}%` : ""}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
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
            <div className="flex flex-col">
              <p className="text-sm text-yellow-700">{commitmentText}</p>
              <div className="flex items-center mt-1">
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 text-xs ${
                    commitmentType === "input"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {commitmentType === "input" ? (
                    <Download className="h-3 w-3 text-blue-500" />
                  ) : (
                    <Upload className="h-3 w-3 text-green-500" />
                  )}
                  <span>
                    {commitmentType === "input" ? "インプット" : "アウトプット"}
                  </span>
                </Badge>
              </div>
            </div>
          </div>

          {/* AI分析結果を表示 */}
          {classification && (
            <div className="bg-purple-50 p-3 rounded-md border border-purple-200 mt-2">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
                <span className="text-sm font-medium text-purple-700">
                  AIによる分析
                </span>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                {classification.explanation}
              </p>
            </div>
          )}

          {/* 優先度情報の表示 */}
          {priorityAnalysis && priorityAnalysis.isPrioritized && (
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mt-2">
              <div className="flex items-center">
                <ArrowUp className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm font-medium text-amber-700">
                  優先タスクとして検出
                </span>
              </div>
              <p className="text-xs text-amber-600 mt-1">
                {priorityAnalysis.explanation}
              </p>

              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex items-center">
                  <Zap className="h-3 w-3 text-amber-500 mr-1" />
                  <span className="text-xs">
                    重要度: {priorityAnalysis.importance}/10
                  </span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                  <span className="text-xs">
                    緊急度: {priorityAnalysis.urgency}/10
                  </span>
                </div>
                {priorityAnalysis.suggestedDeadline && (
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 text-amber-500 mr-1" />
                    <span className="text-xs">
                      推奨期限: {priorityAnalysis.suggestedDeadline}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-2">
                <div className="flex items-center">
                  <Checkbox
                    id="priority-checkbox"
                    checked={priorityEnabled}
                    onCheckedChange={(checked) => setPriorityEnabled(!!checked)}
                  />
                  <label
                    htmlFor="priority-checkbox"
                    className="ml-2 text-xs text-amber-700"
                  >
                    優先タスクとして登録
                  </label>
                </div>
              </div>
            </div>
          )}

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
