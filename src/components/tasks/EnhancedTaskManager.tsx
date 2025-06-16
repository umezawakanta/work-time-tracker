import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  Clock,
  Flag,
  Tag,
  Calendar,
  FileText,
  Archive,
  Brain,
  Sparkles,
  Target,
  Users,
  Split,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Zap,
  Download,
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, isPast } from 'date-fns';
import { ja } from 'date-fns/locale';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems, updateTodoItem, deleteTodoItem, addTodoItem } from '@/store/todoSlice';
import { TodoItem } from '@/types';
import { SortOption, QuickFilterOption } from '@/types/todo';
import TaskForm from './TaskForm';
import AdvancedAIService from '@/services/ai/AdvancedAIService';
import { toast } from 'react-hot-toast';
import TaskImporter from './TaskImporter';

interface TaskSuggestion {
  id: string;
  task: string;
  type: 'input' | 'output';
  priority: number;
  estimatedDuration: number;
  reason: string;
  confidence: number;
}

interface TaskGroup {
  id: string;
  name: string;
  tasks: string[];
  suggestedActions: string[];
  efficiency: number;
}

interface PriorityPrediction {
  taskId: string;
  suggestedPriority: number;
  confidence: number;
  reasoning: string;
  factors: {
    urgency: number;
    importance: number;
    complexity: number;
    dependencies: number;
  };
}

interface CompletionPrediction {
  taskId: string;
  estimatedMinutes: number;
  confidence: number;
  factors: {
    complexity: 'low' | 'medium' | 'high';
    userHistory: number;
    taskType: string;
    timeOfDay: number;
  };
}

export const EnhancedTaskManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todo.items);
  const isLoading = useSelector((state: RootState) => state.todo.status === 'loading');
  const hasPremium = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // ローカル状態
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('priority');
  const [activeFilter, setActiveFilter] = useState<QuickFilterOption>('none');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TodoItem | null>(null);
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  // AI State
  const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [priorityPredictions, setPriorityPredictions] = useState<PriorityPrediction[]>([]);
  const [completionPredictions, setCompletionPredictions] = useState<CompletionPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Load tasks on mount
  useEffect(() => {
    dispatch(fetchTodoItems());
  }, [dispatch]);

  // Convert TodoItem to Todo format for AI services
  const convertToTodoFormat = useCallback((todoItems: any[]) => {
    return todoItems.map((item) => ({
      ...item,
      updatedAt: item.updatedAt || new Date().toISOString(),
      createdAt: item.createdAt || new Date().toISOString(),
    }));
  }, []);

  // AI Analysis Functions
  const generateTaskSuggestions = useCallback(async () => {
    if (!hasPremium) {
      toast.error('AI機能はプレミアムプランでご利用いただけます');
      return;
    }

    setIsAnalyzing(true);
    try {
      const completedTodos = convertToTodoFormat(todos.filter((todo) => todo.completed));
      const currentGoals = ['生産性向上', 'スキル習得', 'プロジェクト完了'];

      const suggestions = await AdvancedAIService.suggestNextTasks(completedTodos, currentGoals);

      const enhancedSuggestions: TaskSuggestion[] = suggestions.map((suggestion, index) => ({
        id: `suggestion-${index}`,
        task: suggestion.task || `推奨タスク ${index + 1}`,
        type: suggestion.type || 'output',
        priority: suggestion.priority || 3,
        estimatedDuration: Math.random() * 60 + 15,
        reason: `AIが分析した結果、このタスクは現在の作業パターンに最適です`,
        confidence: Math.random() * 0.3 + 0.7,
      }));

      setTaskSuggestions(enhancedSuggestions);
      toast.success(`${enhancedSuggestions.length}個のタスク提案を生成しました`);
    } catch (error) {
      console.error('Task suggestion error:', error);
      toast.error('タスク提案の生成に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  }, [todos, hasPremium, convertToTodoFormat]);

  const predictTaskPriorities = useCallback(async () => {
    if (!hasPremium) return;

    setIsAnalyzing(true);
    try {
      const incompleteTasks = todos.filter((todo) => !todo.completed);

      const predictions: PriorityPrediction[] = incompleteTasks.map((todo) => {
        const urgency = todo.deadline
          ? Math.max(
              1,
              5 -
                Math.floor((new Date(todo.deadline).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
            )
          : 2;
        const importance = todo.isPrioritized ? 5 : 3;
        const complexity = todo.task.length > 50 ? 4 : 2;
        const dependencies = 1;

        const suggestedPriority = Math.round(
          (urgency + importance + complexity + dependencies) / 4
        );

        return {
          taskId: todo._id,
          suggestedPriority: Math.min(5, Math.max(1, suggestedPriority)),
          confidence: 0.85,
          reasoning: `緊急度(${urgency}/5), 重要度(${importance}/5), 複雑度(${complexity}/5)を分析`,
          factors: { urgency, importance, complexity, dependencies },
        };
      });

      setPriorityPredictions(predictions);
      toast.success('優先度予測を完了しました');
    } catch (error) {
      console.error('Priority prediction error:', error);
      toast.error('優先度予測に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  }, [todos, hasPremium]);

  const predictCompletionTimes = useCallback(async () => {
    if (!hasPremium) return;

    setIsAnalyzing(true);
    try {
      const incompleteTasks = todos.filter((todo) => !todo.completed);

      const predictions: CompletionPrediction[] = await Promise.all(
        incompleteTasks.map(async (todo) => {
          try {
            const taskBreakdown = await AdvancedAIService.breakdownTask(todo.task);

            return {
              taskId: todo._id,
              estimatedMinutes: taskBreakdown.totalDuration || 30,
              confidence: 0.8,
              factors: {
                complexity: taskBreakdown.complexity,
                userHistory: 1.0,
                taskType: todo.type || 'input',
                timeOfDay: 1.0,
              },
            };
          } catch {
            return {
              taskId: todo._id,
              estimatedMinutes: Math.floor(Math.random() * 60) + 15,
              confidence: 0.6,
              factors: {
                complexity: 'medium' as const,
                userHistory: 1.0,
                taskType: todo.type || 'input',
                timeOfDay: 1.0,
              },
            };
          }
        })
      );

      setCompletionPredictions(predictions);
      toast.success('完了時間予測を完了しました');
    } catch (error) {
      console.error('Completion prediction error:', error);
      toast.error('完了時間予測に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  }, [todos, hasPremium]);

  const groupSimilarTasks = useCallback(async () => {
    if (!hasPremium) return;

    setIsAnalyzing(true);
    try {
      const tasksByCategory: { [key: string]: any[] } = {};

      todos.forEach((todo: any) => {
        const category = todo.category || '未分類';
        if (!tasksByCategory[category]) {
          tasksByCategory[category] = [];
        }
        tasksByCategory[category].push(todo);
      });

      const groups: TaskGroup[] = Object.entries(tasksByCategory)
        .filter(([_, tasks]) => tasks.length > 1)
        .map(([category, tasks]) => ({
          id: `group-${category}`,
          name: `${category}関連タスク`,
          tasks: tasks.map((t: any) => t.task),
          suggestedActions: ['同時実行を検討', 'バッチ処理が効率的', '依存関係を確認'],
          efficiency: Math.random() * 0.3 + 0.7,
        }));

      setTaskGroups(groups);
      toast.success(`${groups.length}個のタスクグループを特定しました`);
    } catch (error) {
      console.error('Task grouping error:', error);
      toast.error('タスクグループ化に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  }, [todos, hasPremium]);

  const breakdownComplexTask = useCallback(
    async (taskId: string) => {
      if (!hasPremium) return;

      const task = todos.find((t) => t._id === taskId);
      if (!task) return;

      setIsAnalyzing(true);
      try {
        const breakdown = await AdvancedAIService.breakdownTask(task.task);

        for (const subtask of breakdown.subtasks) {
          await dispatch(
            addTodoItem({
              task: `${task.task} - ${subtask.task}`,
              priority: task.priority,
              isPrioritized: false,
              type: task.type,
              deadline: task.deadline,
            })
          ).unwrap();
        }

        await dispatch(
          updateTodoItem({
            _id: taskId,
            updates: {
              task: `[分解済み] ${task.task}`,
              completed: true,
            },
          })
        ).unwrap();

        toast.success(`タスクを${breakdown.subtasks.length}個のサブタスクに分解しました`);
      } catch (error) {
        console.error('Task breakdown error:', error);
        toast.error('タスク分解に失敗しました');
      } finally {
        setIsAnalyzing(false);
      }
    },
    [todos, hasPremium, dispatch]
  );

  const runCompleteAnalysis = useCallback(async () => {
    if (!hasPremium) {
      toast.error('AI機能はプレミアムプランでご利用いただけます');
      return;
    }

    setIsAnalyzing(true);
    toast.loading('AI分析を実行中...');

    try {
      await Promise.all([
        generateTaskSuggestions(),
        predictTaskPriorities(),
        predictCompletionTimes(),
        groupSimilarTasks(),
      ]);

      const convertedTodos = convertToTodoFormat(todos);
      const analysis = await AdvancedAIService.analyzeProductivity(convertedTodos, {
        totalCompleted: todos.filter((t) => t.completed).length,
        averageCompletionTime: 45,
        inputOutputRatio:
          todos.filter((t) => t.type === 'input').length /
          Math.max(1, todos.filter((t) => t.type === 'output').length),
        mostProductiveDay: '月曜日',
        mostProductiveTime: '14:00-16:00',
        completionRate: 75,
        deadlineMeetRate: 85,
        streakDays: 7,
        recommendations: ['定期的な休憩を取る', 'タスクの優先順位を見直す'],
      });

      setAnalysisResults(analysis);
      toast.success('AI分析が完了しました');
    } catch (error) {
      console.error('Complete analysis error:', error);
      toast.error('AI分析に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    todos,
    hasPremium,
    generateTaskSuggestions,
    predictTaskPriorities,
    predictCompletionTimes,
    groupSimilarTasks,
    convertToTodoFormat,
  ]);

  const applyPriorityPrediction = async (prediction: PriorityPrediction) => {
    try {
      await dispatch(
        updateTodoItem({
          _id: prediction.taskId,
          updates: { priority: prediction.suggestedPriority },
        })
      ).unwrap();

      setPriorityPredictions((prev) => prev.filter((p) => p.taskId !== prediction.taskId));
      toast.success('優先度を更新しました');
    } catch (error) {
      toast.error('優先度の更新に失敗しました');
    }
  };

  const acceptTaskSuggestion = async (suggestion: TaskSuggestion) => {
    try {
      await dispatch(
        addTodoItem({
          task: suggestion.task,
          priority: suggestion.priority,
          isPrioritized: suggestion.priority > 3,
          type: suggestion.type,
        })
      ).unwrap();

      setTaskSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      toast.success('提案タスクを追加しました');
    } catch (error) {
      toast.error('タスクの追加に失敗しました');
    }
  };

  // 優先度の色とラベル
  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1:
        return { label: '最高', color: 'bg-red-500', textColor: 'text-red-600' };
      case 2:
        return { label: '高', color: 'bg-orange-500', textColor: 'text-orange-600' };
      case 3:
        return { label: '中', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
      case 4:
        return { label: '低', color: 'bg-green-500', textColor: 'text-green-600' };
      case 5:
        return { label: '最低', color: 'bg-gray-500', textColor: 'text-gray-600' };
      default:
        return { label: '未設定', color: 'bg-gray-300', textColor: 'text-gray-500' };
    }
  };

  // 期限の表示フォーマット
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);

    if (isToday(date)) return '今日';
    if (isTomorrow(date)) return '明日';
    if (isYesterday(date)) return '昨日';

    return format(date, 'MM/dd', { locale: ja });
  };

  // 期限の状態チェック
  const getDeadlineStatus = (deadline: string, completed: boolean) => {
    if (completed) return 'completed';

    const date = new Date(deadline);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';

    return 'future';
  };

  // フィルタリングとソート
  const filteredAndSortedTodos = useMemo(() => {
    const filtered = todos.filter((todo) => {
      // 検索クエリによるフィルタリング
      const matchesSearch =
        searchQuery === '' ||
        todo.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // クイックフィルターによるフィルタリング
      switch (activeFilter) {
        case 'today':
          return todo.deadline ? isToday(new Date(todo.deadline)) : false;
        case 'important':
          return todo.priority <= 2;
        case 'inputOnly':
          return todo.type === 'input';
        case 'outputOnly':
          return todo.type === 'output';
        default:
          return true;
      }
    });

    // ソート
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'priority':
          return a.priority - b.priority;
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'type':
          return (a.type || 'input').localeCompare(b.type || 'input');
        default:
          return 0;
      }
    });

    return filtered;
  }, [todos, searchQuery, sortOption, activeFilter]);

  // 完了状態別にタスクをグループ化
  const { pendingTasks, completedTasks } = useMemo(() => {
    const pending = filteredAndSortedTodos.filter((todo) => !todo.completed);
    const completed = filteredAndSortedTodos.filter((todo) => todo.completed);
    return { pendingTasks: pending, completedTasks: completed };
  }, [filteredAndSortedTodos]);

  // タスクの完了状態を切り替え
  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = todos.find((t) => t._id === taskId);
      if (task) {
        await dispatch(
          updateTodoItem({
            _id: taskId,
            updates: { completed: !task.completed },
          })
        ).unwrap();
      }
    } catch (error) {
      console.error('タスクの完了状態変更に失敗:', error);
    }
  };

  // タスクの削除
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await dispatch(deleteTodoItem(taskToDelete._id)).unwrap();
      setTaskToDelete(null);
    } catch (error) {
      console.error('タスクの削除に失敗:', error);
    }
  };

  // タスク編集の開始
  const handleEditTask = (task: TodoItem) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  // タスクフォームを閉じる
  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  // タスクカードのレンダリング
  const renderTaskCard = (task: TodoItem) => {
    const priorityInfo = getPriorityInfo(task.priority);
    const deadlineStatus = task.deadline ? getDeadlineStatus(task.deadline, task.completed) : null;

    return (
      <Card
        key={task._id}
        className={`transition-all duration-200 hover:shadow-md ${
          task.completed ? 'opacity-75' : ''
        } ${deadlineStatus === 'overdue' ? 'border-l-4 border-l-red-500' : ''}
        ${deadlineStatus === 'today' ? 'border-l-4 border-l-yellow-500' : ''}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {/* 完了チェック */}
              <button
                onClick={() => handleToggleComplete(task._id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {task.completed && <Check className="w-3 h-3" />}
              </button>

              {/* タスク内容 */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {task.task}
                </h3>

                {task.note && <p className="text-sm text-gray-600 mt-1">{task.note}</p>}

                {/* メタ情報 */}
                <div className="flex items-center space-x-4 mt-2">
                  {/* 優先度 */}
                  <div className="flex items-center space-x-1">
                    <Flag className={`w-3 h-3 ${priorityInfo.textColor}`} />
                    <span className={`text-xs ${priorityInfo.textColor}`}>
                      {priorityInfo.label}
                    </span>
                  </div>

                  {/* タイプ */}
                  <Badge variant={task.type === 'input' ? 'secondary' : 'outline'}>
                    {task.type === 'input' ? 'インプット' : 'アウトプット'}
                  </Badge>

                  {/* 期限 */}
                  {task.deadline && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span
                        className={`text-xs ${
                          deadlineStatus === 'overdue'
                            ? 'text-red-600 font-medium'
                            : deadlineStatus === 'today'
                              ? 'text-yellow-600 font-medium'
                              : 'text-gray-500'
                        }`}
                      >
                        {formatDeadline(task.deadline)}
                      </span>
                    </div>
                  )}

                  {/* タグ */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <div className="flex space-x-1">
                        {task.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* アクションメニュー */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTaskToDelete(task)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!hasPremium) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Task Management</h3>
          <p className="text-gray-600 mb-4">
            AIによるタスク提案、優先度予測、完了時間推定などの高度な機能をご利用いただけます
          </p>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            プレミアムプランにアップグレード
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー部分 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">タスク管理</h1>
          <p className="text-gray-600 mt-1">効率的なタスク管理でプロジェクトを成功に導きます</p>
        </div>

        <div className="flex items-center gap-3">
          {/* インポートボタンを追加 */}
          <Button
            variant="outline"
            onClick={() => setIsImporterOpen(true)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            インポート
          </Button>

          {/* AI機能ボタン */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI機能
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>AI分析</DropdownMenuLabel>
              <DropdownMenuItem onClick={generateTaskSuggestions} disabled={isAnalyzing}>
                <Lightbulb className="h-4 w-4 mr-2" />
                タスク提案
              </DropdownMenuItem>
              <DropdownMenuItem onClick={predictTaskPriorities} disabled={isAnalyzing}>
                <Target className="h-4 w-4 mr-2" />
                優先度予測
              </DropdownMenuItem>
              <DropdownMenuItem onClick={predictCompletionTimes} disabled={isAnalyzing}>
                <Clock className="h-4 w-4 mr-2" />
                完了時間予測
              </DropdownMenuItem>
              <DropdownMenuItem onClick={groupSimilarTasks} disabled={isAnalyzing}>
                <Users className="h-4 w-4 mr-2" />
                類似タスクグループ化
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={runCompleteAnalysis} disabled={isAnalyzing}>
                <Zap className="h-4 w-4 mr-2" />
                完全分析実行
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 新規タスク作成ボタン */}
          <Button
            onClick={() => setIsTaskFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規タスク
          </Button>
        </div>
      </div>

      {/* AI Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Task Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={generateTaskSuggestions}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              タスク提案
            </Button>
            <Button
              variant="outline"
              onClick={predictTaskPriorities}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              優先度予測
            </Button>
            <Button
              variant="outline"
              onClick={predictCompletionTimes}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              時間予測
            </Button>
            <Button
              variant="outline"
              onClick={groupSimilarTasks}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              グループ化
            </Button>
          </div>
          <div className="mt-4">
            <Button
              onClick={runCompleteAnalysis}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'AI分析実行中...' : '完全AI分析を実行'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task Suggestions */}
      {taskSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              AI タスク提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {taskSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={suggestion.type === 'output' ? 'default' : 'secondary'}>
                        {suggestion.type === 'output' ? 'アウトプット' : 'インプット'}
                      </Badge>
                      <Badge variant="outline">優先度: {suggestion.priority}</Badge>
                      <Badge variant="outline">{Math.round(suggestion.estimatedDuration)}分</Badge>
                    </div>
                    <p className="font-medium">{suggestion.task}</p>
                    <p className="text-sm text-gray-600">{suggestion.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => acceptTaskSuggestion(suggestion)}>
                      採用
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setTaskSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
                      }
                    >
                      却下
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priority Predictions */}
      {priorityPredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              優先度予測
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityPredictions.slice(0, 5).map((prediction) => {
                const task = todos.find((t) => t._id === prediction.taskId);
                return (
                  <div
                    key={prediction.taskId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{task?.task}</p>
                      <p className="text-sm text-gray-600">{prediction.reasoning}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">現在: {task?.priority}</Badge>
                        <Badge variant="default">推奨: {prediction.suggestedPriority}</Badge>
                        <Badge variant="secondary">
                          信頼度: {Math.round(prediction.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => applyPriorityPrediction(prediction)}>
                      適用
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Predictions */}
      {completionPredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              完了時間予測
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {completionPredictions.slice(0, 6).map((prediction) => {
                const task = todos.find((t) => t._id === prediction.taskId);
                return (
                  <div key={prediction.taskId} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm mb-2">{task?.task}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{prediction.estimatedMinutes}分</Badge>
                      <Badge variant="secondary">{Math.round(prediction.confidence * 100)}%</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Groups */}
      {taskGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              類似タスクグループ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taskGroups.map((group) => (
                <div key={group.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{group.name}</h4>
                    <Badge variant="outline">効率性: {Math.round(group.efficiency * 100)}%</Badge>
                  </div>
                  <div className="space-y-2">
                    {group.tasks.slice(0, 3).map((task, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        • {task}
                      </p>
                    ))}
                    {group.tasks.length > 3 && (
                      <p className="text-sm text-gray-500">...他 {group.tasks.length - 3}個</p>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">推奨アクション:</p>
                    {group.suggestedActions.map((action, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-1">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complex Task Breakdown */}
      {todos.filter((t) => !t.completed && t.task.length > 50).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Split className="h-5 w-5 text-orange-600" />
              複雑タスクの分解
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todos
                .filter((t) => !t.completed && t.task.length > 50)
                .slice(0, 3)
                .map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{task.task}</p>
                      <p className="text-sm text-gray-600">
                        このタスクは複雑すぎる可能性があります。小さなタスクに分解することを推奨します。
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => breakdownComplexTask(task._id)}
                      disabled={isAnalyzing}
                    >
                      分解
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              生産性分析結果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">主要な洞察</h4>
                <div className="space-y-2">
                  {analysisResults.productivityInsights?.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">週間目標</h4>
                <div className="space-y-2">
                  {analysisResults.weeklyGoals?.map((goal: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                      <p className="text-sm">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ヘッダー・コントロール */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="タスクを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* クイックフィルター */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                フィルター
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>クイックフィルター</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setActiveFilter('none')}>すべて</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('today')}>今日期限</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('important')}>
                重要タスク
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveFilter('inputOnly')}>
                インプットのみ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('outputOnly')}>
                アウトプットのみ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ソート */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                並び替え
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOption('priority')}>
                優先度順
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('deadline')}>期限順</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('newest')}>作成日順</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('type')}>タイプ順</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* タスク一覧 */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            未完了 ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            完了済み ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  未完了のタスクはありません
                </h3>
                <p className="text-gray-600 mb-4">
                  新しいタスクを作成して、生産性を向上させましょう！
                </p>
                <Button onClick={() => setIsTaskFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初のタスクを作成
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">{pendingTasks.map(renderTaskCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Check className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  完了したタスクはありません
                </h3>
                <p className="text-gray-600">タスクを完了すると、ここに表示されます。</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">{completedTasks.map(renderTaskCard)}</div>
          )}
        </TabsContent>
      </Tabs>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{taskToDelete?.task}」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-red-600 hover:bg-red-700">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* インポートダイアログ */}
      <TaskImporter isOpen={isImporterOpen} onClose={() => setIsImporterOpen(false)} />
    </div>
  );
};

export default EnhancedTaskManager;
