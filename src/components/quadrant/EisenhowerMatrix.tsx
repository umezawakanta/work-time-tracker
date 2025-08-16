// src/components/quadrant/EisenhowerMatrix.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  RefreshCw,
  Clock,
  Target,
  AlertTriangle,
  Trash2,
  ArrowRight,
  Brain,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  Activity,
  BarChart3,
} from 'lucide-react';
import QuadrantClassificationService, {
  QuadrantType,
  TaskQuadrantClassification,
  QuadrantAnalysisResult,
  QUADRANT_DEFINITIONS,
  UnifiedTaskData,
  AIProvider,
} from '@/services/ai/QuadrantClassificationService';
import { toast } from 'sonner';

// プロパティの型定義
interface EisenhowerMatrixProps {
  tasks: any[]; // 様々なタスク形式に対応
  onTaskClick?: (task: any) => void;
  onQuadrantAnalysis?: (analysis: QuadrantAnalysisResult) => void;
  className?: string;
  showAnalytics?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
}

// 象限カードのプロパティ
interface QuadrantCardProps {
  quadrant: QuadrantType;
  tasks: TaskQuadrantClassification[];
  originalTasks: any[];
  onTaskClick?: (task: any) => void;
  totalTasks: number;
}

// タスクアイテムのプロパティ
interface TaskItemProps {
  task: TaskQuadrantClassification;
  originalTask: any;
  onTaskClick?: (task: any) => void;
}

/**
 * タスクアイテムコンポーネント
 */
const TaskItem: React.FC<TaskItemProps> = ({ task, originalTask, onTaskClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const quadrantInfo = QUADRANT_DEFINITIONS[task.quadrant];

  const getPriorityBadgeVariant = (priority: number) => {
    if (priority >= 80) return 'destructive';
    if (priority >= 60) return 'default';
    if (priority >= 40) return 'secondary';
    return 'outline';
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'outline';
  };

  return (
    <div
      className="border rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => onTaskClick?.(originalTask)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm">{quadrantInfo.icon}</span>
            <h4 className="font-medium text-sm truncate">
              {originalTask?.title || originalTask?.task || '無題'}
            </h4>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs">
              優先度 {task.priority}
            </Badge>
            <Badge variant={getConfidenceBadgeVariant(task.confidence)} className="text-xs">
              信頼度 {Math.round(task.confidence * 100)}%
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
            <div className="flex items-center">
              <Target className="w-3 h-3 mr-1" />
              重要度: {task.importance}/10
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              緊急度: {task.urgency}/10
            </div>
          </div>

          {isExpanded && (
            <div className="mt-2 space-y-2">
              <div className="text-xs text-gray-600">
                <strong>分析理由:</strong> {task.reasoning}
              </div>

              {task.recommendations.length > 0 && (
                <div className="text-xs">
                  <strong>推奨アクション:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {task.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-600">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {originalTask?.deadline && (
                <div className="flex items-center text-xs text-gray-600">
                  <Calendar className="w-3 h-3 mr-1" />
                  期限: {new Date(originalTask.deadline).toLocaleDateString()}
                </div>
              )}

              {task.timeAllocation && (
                <div className="text-xs text-gray-600">推奨時間配分: {task.timeAllocation}%</div>
              )}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="ml-2"
        >
          <ArrowRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

/**
 * 象限カードコンポーネント
 */
const QuadrantCard: React.FC<QuadrantCardProps> = ({
  quadrant,
  tasks,
  originalTasks,
  onTaskClick,
  totalTasks,
}) => {
  const quadrantInfo = QUADRANT_DEFINITIONS[quadrant];
  const percentage = totalTasks > 0 ? Math.round((tasks.length / totalTasks) * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{quadrantInfo.icon}</span>
            <div>
              <CardTitle className="text-lg" style={{ color: quadrantInfo.color }}>
                {quadrantInfo.name}
              </CardTitle>
              <CardDescription className="text-xs">{quadrantInfo.description}</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: quadrantInfo.color }}>
              {tasks.length}
            </div>
            <div className="text-xs text-gray-500">{percentage}%</div>
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>重要度: {quadrantInfo.importance.toUpperCase()}</span>
            <span>緊急度: {quadrantInfo.urgency.toUpperCase()}</span>
          </div>
          <Progress
            value={percentage}
            className="h-2"
            style={{
              background: `linear-gradient(to right, ${quadrantInfo.color}20, ${quadrantInfo.color}40)`,
            }}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          {tasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">タスクはありません</p>
            </div>
          ) : (
            tasks.map((task, index) => {
              const originalTask = originalTasks.find(
                (t) =>
                  t && ((t._id || t.id) === task.taskId || String(t._id || t.id) === task.taskId)
              );
              return (
                <TaskItem
                  key={`${quadrant}-${task.taskId}-${index}`}
                  task={task}
                  originalTask={originalTask}
                  onTaskClick={onTaskClick}
                />
              );
            })
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

/**
 * メインのアイゼンハワーマトリックスコンポーネント
 */
export const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({
  tasks = [],
  onTaskClick,
  onQuadrantAnalysis,
  className = '',
  showAnalytics = true,
  autoRefresh = false,
  refreshInterval = 5,
}) => {
  const [analysis, setAnalysis] = useState<QuadrantAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [classificationService] = useState(() => QuadrantClassificationService.getInstance());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(
    classificationService.getProvider()
  );
  const [availableProviders] = useState(() => classificationService.getAvailableProviders());

  // タスクを統一形式に変換（完了済みタスクは除外）
  const unifiedTasks = useMemo(() => {
    if (!Array.isArray(tasks)) {
      console.warn('🚨 EisenhowerMatrix: tasks が配列ではありません:', typeof tasks);
      return [];
    }

    if (tasks.length === 0) {
      return [];
    }

    // 完了済みタスクをフィルタリング
    const incompleteTasks = tasks.filter((task) => {
      // 様々なタスク形式に対応
      return (
        task && task._id && !task.completed && !task.isCompleted && task.status !== 'completed'
      );
    });

    console.log(
      `📊 分析対象: ${incompleteTasks.length}件（完了済み除外: ${tasks.length - incompleteTasks.length}件）`
    );

    const converted = incompleteTasks
      .map((task) => classificationService.convertToUnifiedTask(task))
      .filter((task): task is UnifiedTaskData => task !== null);

    return converted;
  }, [tasks, classificationService]);

  // AIプロバイダー変更ハンドラー
  const handleProviderChange = (provider: AIProvider) => {
    setCurrentProvider(provider);
    classificationService.setProvider(provider);
    const providerName =
      provider === 'claude' ? 'Claude' : provider === 'openai' ? 'GPT-4' : 'Gemini';
    toast.info(`AIプロバイダーを ${providerName} に切り替えました`);
  };

  // 分析の実行
  const runAnalysis = useCallback(async () => {
    // 既に分析中の場合はスキップ
    if (isAnalyzing) {
      console.log('⏳ 分析が既に実行中です...');
      return;
    }

    try {
      if (unifiedTasks.length === 0) {
        setAnalysis(null);
        setIsLoading(false);
        console.log('📝 分析対象のタスクがありません');
        return;
      }

      setIsAnalyzing(true);
      setIsLoading(true);

      const completedCount = tasks.filter(
        (t) => t?.completed || t?.isCompleted || t?.status === 'completed'
      ).length;
      console.log('🎯 4象限分析を開始します...', {
        taskCount: unifiedTasks.length,
        originalTaskCount: tasks?.length || 0,
        completedCount: completedCount,
      });

      const result = await classificationService.analyzeQuadrants(unifiedTasks);
      setAnalysis(result);
      setLastUpdate(new Date());
      onQuadrantAnalysis?.(result);

      // タスク数の制限について通知
      if (unifiedTasks.length > 15) {
        toast.info(
          `未完了タスク${unifiedTasks.length}件中、最初の15件を分析しました（完了済み${completedCount}件は除外）`,
          { duration: 5000 }
        );
      } else if (completedCount > 0) {
        toast.success(
          `4象限分析完了: 未完了${result.totalTasks}件を分類（完了済み${completedCount}件は除外）`
        );
      } else {
        toast.success(`4象限分析完了: ${result.totalTasks}件のタスクを分類しました`);
      }
    } catch (error) {
      console.error('🚨 4象限分析エラー:', error);
      toast.error(
        `4象限分析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
      setAnalysis(null);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  }, [unifiedTasks, classificationService, onQuadrantAnalysis, isAnalyzing]);

  // 初回実行とタスク変更時の更新を統合
  useEffect(() => {
    // 初回実行
    if (!hasInitialized && unifiedTasks.length > 0) {
      setHasInitialized(true);
      runAnalysis();
    }
    // タスクがない場合
    else if (unifiedTasks.length === 0) {
      setIsLoading(false);
      setAnalysis(null);
    }
    // タスク数が大きく変更された場合（初回以降）
    else if (hasInitialized) {
      const prevTaskCount = analysis?.totalTasks || 0;
      if (Math.abs(unifiedTasks.length - prevTaskCount) >= 5) {
        console.log('📊 タスク数が大きく変更されたため再分析します');
        runAnalysis();
      }
    }
  }, [unifiedTasks.length, hasInitialized, analysis?.totalTasks, runAnalysis]);

  // 自動更新（独立して管理）
  useEffect(() => {
    if (!autoRefresh || unifiedTasks.length === 0 || !hasInitialized) return;

    const interval = setInterval(
      () => {
        console.log('🔄 自動更新: 4象限分析を再実行');
        runAnalysis();
      },
      refreshInterval * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, hasInitialized, unifiedTasks.length, runAnalysis]);

  // チャートデータの準備
  const chartData = useMemo(() => {
    if (!analysis) return [];

    return Object.entries(analysis.quadrantBreakdown).map(([key, data]) => ({
      name: QUADRANT_DEFINITIONS[key as QuadrantType].name,
      count: data.count,
      percentage: data.percentage,
      time: data.totalEstimatedTime,
      color: QUADRANT_DEFINITIONS[key as QuadrantType].color,
    }));
  }, [analysis]);

  const pieData = useMemo(() => {
    if (!analysis) return [];

    return Object.entries(analysis.timeDistribution).map(([key, percentage]) => ({
      name: QUADRANT_DEFINITIONS[key as QuadrantType].name,
      value: percentage,
      color: QUADRANT_DEFINITIONS[key as QuadrantType].color,
    }));
  }, [analysis]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">AI による4象限分析実行中...</p>
              <p className="text-sm text-gray-600 mt-2">
                {currentProvider === 'claude'
                  ? 'Claude AI'
                  : currentProvider === 'openai'
                    ? 'GPT-4'
                    : 'Gemini AI'}
                が未完了タスク
                {unifiedTasks.length}件を分析しています
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="w-6 h-6" />
            <span>アイゼンハワーマトリックス</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Gemini AIによる4象限タスク分類とパフォーマンス分析
            {tasks.length > 0 && (
              <span className="ml-2 text-sm">
                （未完了: {unifiedTasks.length}件
                {tasks.filter((t) => t?.completed || t?.isCompleted || t?.status === 'completed')
                  .length > 0 &&
                  ` / 完了済み: ${tasks.filter((t) => t?.completed || t?.isCompleted || t?.status === 'completed').length}件`}
                ）
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              最終更新: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-2">
            {/* AIプロバイダー選択 */}
            <Select
              value={currentProvider}
              onValueChange={(value) => handleProviderChange(value as AIProvider)}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="AI選択" />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map((p) => (
                  <SelectItem key={p.provider} value={p.provider} disabled={!p.available}>
                    <div className="flex items-center gap-2">
                      <span>
                        {p.provider === 'claude' ? '🤖' : p.provider === 'openai' ? '🧠' : '✨'}
                      </span>
                      <span>{p.name}</span>
                      {!p.available && <span className="text-xs text-red-500">(未設定)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={runAnalysis} disabled={isLoading || isAnalyzing} size="sm">
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading || isAnalyzing ? 'animate-spin' : ''}`}
              />
              {isAnalyzing ? '分析中...' : '再分析'}
            </Button>
            <Button
              onClick={() => {
                classificationService.clearCache();
                toast.success(
                  'キャッシュをクリアしました。次回の分析時に新規APIコールが実行されます。'
                );
              }}
              variant="outline"
              size="sm"
              title="分析キャッシュをクリア"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* サマリーカード */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">総タスク数</p>
                  <p className="text-2xl font-bold">{analysis.totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">生産性スコア</p>
                  <p className="text-2xl font-bold">{analysis.productivity.score}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">効果性タスク</p>
                  <p className="text-2xl font-bold">
                    {analysis.quadrantBreakdown.effectiveness.count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">必須タスク</p>
                  <p className="text-2xl font-bold">{analysis.quadrantBreakdown.essential.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* メインコンテンツ */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix">4象限マトリックス</TabsTrigger>
          <TabsTrigger value="analytics">分析レポート</TabsTrigger>
          <TabsTrigger value="recommendations">改善提案</TabsTrigger>
        </TabsList>

        {/* 4象限マトリックス */}
        <TabsContent value="matrix" className="space-y-4">
          {analysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <QuadrantCard
                quadrant="essential"
                tasks={analysis.quadrantBreakdown.essential.tasks}
                originalTasks={tasks}
                onTaskClick={onTaskClick}
                totalTasks={analysis.totalTasks}
              />
              <QuadrantCard
                quadrant="effectiveness"
                tasks={analysis.quadrantBreakdown.effectiveness.tasks}
                originalTasks={tasks}
                onTaskClick={onTaskClick}
                totalTasks={analysis.totalTasks}
              />
              <QuadrantCard
                quadrant="illusion"
                tasks={analysis.quadrantBreakdown.illusion.tasks}
                originalTasks={tasks}
                onTaskClick={onTaskClick}
                totalTasks={analysis.totalTasks}
              />
              <QuadrantCard
                quadrant="waste"
                tasks={analysis.quadrantBreakdown.waste.tasks}
                originalTasks={tasks}
                onTaskClick={onTaskClick}
                totalTasks={analysis.totalTasks}
              />
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>タスクが登録されていないか、分析に失敗しました。</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* 分析レポート */}
        <TabsContent value="analytics" className="space-y-4">
          {showAnalytics && analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* タスク分布チャート */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>象限別タスク分布</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 時間配分チャート */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>時間配分</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 生産性インサイト */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>生産性インサイト</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.productivity.insights.map((insight, index) => (
                      <Alert key={index}>
                        <AlertDescription>{insight}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 改善提案 */}
        <TabsContent value="recommendations" className="space-y-4">
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* フォーカス */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-600">
                    <Target className="w-5 h-5" />
                    <span>優先実行</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.focus.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 委任 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-amber-600">
                    <Users className="w-5 h-5" />
                    <span>委任検討</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.delegate.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <ArrowRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* スケジュール */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-600">
                    <Calendar className="w-5 h-5" />
                    <span>計画実行</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.schedule.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Calendar className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 排除 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <Trash2 className="w-5 h-5" />
                    <span>排除検討</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.eliminate.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Trash2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EisenhowerMatrix;
