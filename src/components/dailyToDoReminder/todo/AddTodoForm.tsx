import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload, Calendar, Sparkles, RefreshCcw, X, AlertTriangle, Zap, ArrowUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { addTodoItem, selectTodos } from "@/store/todoSlice";
import { AppDispatch } from "@/store";

// GeminiServiceをインポート 
import GeminiService, { TaskClassification } from "@/services/GeminiService";
// TaskPriorityServiceをインポート
import TaskPriorityService, { PriorityAnalysis } from "@/services/TaskPriorityService";

// 共通の型をインポート
import { TaskType } from '@/types/todo';

// APIレート制限管理
const API_COOLDOWN = 5000; // 5秒間隔
let lastApiCallTime = 0;

interface AddTodoFormProps {
  onAddSuccess: () => void;
  isPremium: boolean;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAddSuccess, isPremium }) => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos);
  
  // 状態
  const [newTodo, setNewTodo] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("input");
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [showCommitmentDialog, setShowCommitmentDialog] = useState(false);
  const [commitmentText, setCommitmentText] = useState("");
  const [commitmentType, setCommitmentType] = useState<TaskType>("input");
  
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

  // タスク追加処理
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

  // 確定追加処理
  const confirmAddTodo = useCallback(() => {
    if (commitmentText.trim()) {
      // 最大の優先度を取得して、新しいタスクにはそれよりも大きな値を設定
      const maxPriority = Math.max(...todos.map((todo) => todo.priority), 0);
      const now = new Date().toISOString();

      dispatch(
        addTodoItem({
          task: commitmentText.trim(),
          priority: maxPriority + 1,
          isPrioritized: priorityEnabled,
          type: commitmentType,
          deadline: deadline || suggestedDeadline,
          createdAt: now, // createdAtを明示的に設定
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
      
      // 親コンポーネントに通知
      onAddSuccess();

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
    onAddSuccess
  ]);

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

  // AIの提案を表示するコンポーネント
  const AiSuggestionBadge = () => {
    if (!showAiSuggestion || !classification) return null;

    return (
      <div className="flex items-center mt-1 mb-2 bg-purple-50 p-2 rounded-md border border-purple-200 ai-suggestion">
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

  return (
    <>
      <div className="p-3 bg-gray-50 rounded-md mb-4 border border-gray-200 task-form">
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
            
            {isPremium && (
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
            )}
          </div>

          {/* AI提案バッジを表示 */}
          {isPremium && <AiSuggestionBadge />}

          {/* 優先度の提案 */}
          {isPremium && <PrioritySuggestionBadge />}
        </form>
      </div>

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
                <div
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
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
                </div>
              </div>
            </div>
          </div>

          {/* AI分析結果を表示 */}
          {isPremium && classification && (
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
          {isPremium && priorityAnalysis && priorityAnalysis.isPrioritized && (
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
    </>
  );
};

export default AddTodoForm;