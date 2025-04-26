import { useState, useEffect, useCallback, useRef } from "react";
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
  X,

  Star,
  AlertTriangle,
  Clock,
  Award,
  Download,
  Upload,
  Sparkles,
  Calendar,
  Zap,
  ArrowUp,
  Filter,
  PlusCircle,
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
  DeadlineUtils,
  adjustDeadlinePriorities,
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

// CSSクラス
import "./DailyTodoReminder.css";

// TaskType型を定義
type TaskType = "input" | "output";

// APIレート制限管理
const API_COOLDOWN = 5000; // 5秒間隔
let lastApiCallTime = 0;

export default function DailyTodoReminder({ isPremium = false }) {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos);
  const status = useSelector(selectTodoStatus);
  const error = useSelector(selectTodoError);
  const todoHistory = useSelector(selectTodoHistory);
  const dailyHistory = useSelector(selectDailyHistory);
  
  // 状態管理
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
  const [categoryFilter, setCategoryFilter] = useState("all"); // "all", "input", "output", "deadline"
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // 期限関連の状態
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [editingDeadline, setEditingDeadline] = useState<string | undefined>(undefined);
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(true);

  // AI分析関連の状態
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<TaskClassification | null>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [priorityAnalysis, setPriorityAnalysis] = useState<PriorityAnalysis | null>(null);
  const [isAnalyzingPriority, setIsAnalyzingPriority] = useState(false);
  const [showPrioritySuggestion, setShowPrioritySuggestion] = useState(false);
  const [suggestedDeadline, setSuggestedDeadline] = useState<string | undefined>(undefined);
  const [priorityEnabled, setPriorityEnabled] = useState(false);
  const [analysisButtonEnabled, setAnalysisButtonEnabled] = useState(true);

  const initialAdjustmentDone = useRef(false);

  // 副作用
  useEffect(() => {
    dispatch(fetchTodoItems());
    dispatch(fetchTodoHistory());
    dispatch(fetchDailyTodoHistory());
  }, [dispatch]);

  // 自動優先度調整のためのeffect
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

  // タスク入力ハンドラー
  const handleTaskInput = useCallback((value: string) => {
    setNewTodo(value);

    // 入力時は分析を行わず、UIの状態のみクリア
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
            suggestedDeadline: undefined
          });
          setShowPrioritySuggestion(true);
        }
      } catch (localError) {
        console.error("ローカル分析エラー:", localError);
      }
    } finally {
      setIsClassifying(false);
      setIsAnalyzingPriority(false);

      // 一定時間後にボタンを再有効化
      setTimeout(() => {
        setAnalysisButtonEnabled(true);
      }, API_COOLDOWN);
    }
  }, [newTodo, isClassifying, isAnalyzingPriority]);

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
          deadline: deadline || suggestedDeadline, // 手動で設定した期限または推奨期限
        })
      );

      // 状態のリセット
      setNewTodo("");
      setShowAiSuggestion(false);
      setShowPrioritySuggestion(false);
      setClassification(null);
      setPriorityAnalysis(null);
      setSuggestedDeadline(undefined);
      setPriorityEnabled(false);
      setDeadline(undefined);
      setShowCommitmentDialog(false);
      setShowAddForm(false);

      toast.success(
        `新しい${
          commitmentType === "input" ? "インプット" : "アウトプット"
        }タスクを追加しました`
      );
    }
  }, [
    dispatch,
    commitmentText,
    commitmentType,
    todos,
    priorityEnabled,
    suggestedDeadline,
    deadline,
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
    (
      id: string,
      task: string,
      type: TaskType | undefined,
      deadline: string | undefined
    ) => {
      setEditingId(id);
      setEditingText(task);
      setEditingType(type || "input");
      setEditingDeadline(deadline);
    },
    []
  );

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditingText("");
    setEditingType("input");
    setEditingDeadline(undefined);
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
              deadline: editingDeadline,
            },
          })
        );
        setEditingId(null);
        setEditingText("");
        setEditingType("input");
        setEditingDeadline(undefined);
        toast.success("タスクを更新しました");
      }
    },
    [dispatch, editingText, editingType, editingDeadline]
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

  // 期限表示のレンダリング関数
  const renderDeadlineBadge = (deadlineDate) => {
    if (!deadlineDate) return null;

    const daysRemaining = DeadlineUtils.getDaysRemaining(deadlineDate);
    const deadlineClassName = DeadlineUtils.getDeadlineClassName(daysRemaining);

    return (
      <Badge
        variant="outline"
        className={`deadline-badge ${deadlineClassName}`}
      >
        <Calendar className="h-3 w-3" />
        <span>{DeadlineUtils.getDeadlineText(deadlineDate)}</span>
      </Badge>
    );
  };

  // フィルター処理
  const filteredTodos = [...todos]
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

  // todoHistoryを配列形式に変換するヘルパー関数
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

  return (
    <Card className="w-full shadow-sm border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
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
              <span className="hidden sm:inline">1日を締める</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* 進捗バー */}
      <div className="px-4 pb-2">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span>
            進捗状況: {completedCount}/{totalCount} タスク
          </span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* インプット/アウトプットバランス */}
      <div className="px-4 pb-3">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span>
            インプット/アウトプット:
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 text-xs">{inputPercentage}%</span>
            <span>:</span>
            <span className="text-green-600 text-xs">{outputPercentage}%</span>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="float-left h-full bg-blue-500"
            style={{ width: `${inputPercentage}%` }}
          ></div>
          <div
            className="float-left h-full bg-green-500"
            style={{ width: `${outputPercentage}%` }}
          ></div>
        </div>
      </div>

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
            {/* クイック追加ボタン */}
            <div className="flex justify-between items-center mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">フィルター</span>
              </Button>
              
              <Button 
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                <span>新しいタスク</span>
              </Button>
            </div>
            
            {/* フィルターエリア（トグル式） */}
            {showFilters && (
              <div className="p-3 bg-gray-50 rounded-md mb-4 border border-gray-200">
                <h4 className="font-medium text-sm mb-2">フィルター</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">状態</p>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant={filterStatus === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("all")}
                        className="h-7 text-xs px-2"
                      >
                        すべて
                      </Button>
                      <Button
                        variant={filterStatus === "active" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("active")}
                        className="h-7 text-xs px-2"
                      >
                        未完了
                      </Button>
                      <Button
                        variant={filterStatus === "completed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("completed")}
                        className="h-7 text-xs px-2"
                      >
                        完了済み
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">種別</p>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant={categoryFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter("all")}
                        className="h-7 text-xs px-2"
                      >
                        全種別
                      </Button>
                      <Button
                        variant={categoryFilter === "input" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter("input")}
                        className="h-7 text-xs px-2 flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>インプット</span>
                      </Button>
                      <Button
                        variant={categoryFilter === "output" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter("output")}
                        className="h-7 text-xs px-2 flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        <span>アウトプット</span>
                      </Button>
                      <Button
                        variant={categoryFilter === "deadline" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter("deadline")}
                        className="h-7 text-xs px-2 flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        <span>期限あり</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* 自動優先度調整設定 */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center">
                    <Checkbox
                      id="auto-adjust-toggle"
                      checked={autoAdjustEnabled}
                      onCheckedChange={(checked) => setAutoAdjustEnabled(!!checked)}
                    />
                    <label
                      htmlFor="auto-adjust-toggle"
                      className="ml-2 text-xs text-gray-600"
                    >
                      期限に基づいて優先度を自動調整する
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      dispatch(adjustDeadlinePriorities());
                      toast.success("タスクの優先度を調整しました");
                    }}
                    className="h-7 text-xs"
                  >
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    <span>再計算</span>
                  </Button>
                </div>
              </div>
            )}
            
            {/* タスク追加フォーム（トグル式） */}
            {showAddForm && (
              <div className="p-3 bg-gray-50 rounded-md mb-4 border border-gray-200">
                <form onSubmit={handleAddTodo} className="space-y-3">
                  <div className="flex flex-col gap-2">
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
                        <SelectTrigger className="w-32">
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

                    {/* 期限入力フィールド */}
                    <div className="flex items-center">
                      <label
                        htmlFor="task-deadline"
                        className="text-sm mr-2 whitespace-nowrap"
                      >
                        期限:
                      </label>
                      <input
                        type="date"
                        id="task-deadline"
                        value={deadline || ""}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="flex-1 p-1 text-sm border rounded"
                      />
                      {deadline && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => setDeadline("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">タスクを追加</Button>
                    
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
                    >
                      {isClassifying || isAnalyzingPriority ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin mr-2">
                            <RefreshCcw className="h-3 w-3" />
                          </div>
                          <span>分析中...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Sparkles className="h-4 w-4 mr-2" />
                          <span>AI分析</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* AI提案バッジを表示 */}
                  <AiSuggestionBadge />

                  {/* 優先度の提案 */}
                  <PrioritySuggestionBadge />
                </form>
              </div>
            )}

            {/* タスクリスト */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="todos">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`rounded-md ${
                      snapshot.isDraggingOver ? "bg-blue-50" : "bg-transparent"
                    }`}
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
                              className={`flex items-start p-3 rounded-md shadow-sm border ${
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
                                className="mt-1"
                              />
                              {editingId === todo._id ? (
                                // 編集モード
                                <div className="flex-grow pl-3">
                                  <div className="space-y-2">
                                    <Input
                                      value={editingText}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      className="w-full"
                                    />
                                    
                                    <div className="flex gap-2">
                                      <Select
                                        value={editingType}
                                        onValueChange={(value: TaskType) => setEditingType(value)}
                                      >
                                        <SelectTrigger className="w-full">
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
                                      
                                      <input
                                        type="date"
                                        value={editingDeadline || ""}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setEditingDeadline(e.target.value)}
                                        className="p-2 text-sm border rounded flex-1"
                                        placeholder="期限日を選択"
                                      />
                                    </div>
                                    
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleEditCancel}
                                      >
                                        キャンセル
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleEditSave(todo._id)}
                                      >
                                        保存
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // 表示モード
                                <>
                                  <div className="flex-grow pl-3">
                                    <div className="flex flex-col">
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
                                      
                                      <div className="flex flex-wrap gap-1 mt-1">
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
                                        
                                        {todo.deadline && renderDeadlineBadge(todo.deadline)}
                                      </div>
                                      
                                      <div className="text-xs text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {new Date(todo.createdAt || Date.now()).toLocaleString(
                                            "ja-JP",
                                            {
                                              month: "numeric",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            }
                                          )}
                                          追加
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start space-x-1 ml-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleTogglePriority(todo._id)}
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
                                      onClick={() => handleEditStart(
                                        todo._id,
                                        todo.task,
                                        todo.type,
                                        todo.deadline
                                      )}
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
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-300">
                <div className="mb-2">
                  <PlusCircle className="h-10 w-10 mx-auto text-gray-400" />
                </div>
                <p>
                  タスクがありません。新しいタスクを追加しましょう！
                </p>
              </div>
            )}
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

          {/* 期限表示 */}
          {(deadline || suggestedDeadline) && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-blue-700">
                  タスクの期限
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {deadline
                  ? `手動で設定された期限: ${deadline}`
                  : `AIが提案した期限: ${suggestedDeadline}`}
              </p>
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