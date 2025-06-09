import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Clock,
  Target,
  Users,
  Lightbulb,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { RootState, AppDispatch } from '@/store';
import { updateTodoItem, addTodoItem, selectTodos } from '@/store/todoSlice';
import taskAIService, {
  AITaskSuggestion,
  TaskTimeEstimate,
  TaskGroup,
  TaskBreakdown,
  SubTask,
  smartTaskBreakdown,
  evaluateTaskComplexity,
} from '@/services/ai/taskAIService';

interface AIAnalysisResult {
  prioritySuggestions: AITaskSuggestion[];
  timeEstimates: TaskTimeEstimate[];
  taskGroups: TaskGroup[];
  taskBreakdowns: TaskBreakdown[];
  recommendations: string[];
}

const AITaskSuggestions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  // AI分析の実行
  const handleAnalyze = useCallback(async () => {
    if (todos.length === 0) {
      toast.error('分析するタスクがありません');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await taskAIService.analyzeTasksComprehensively(todos);

      // タスク分解の候補を検出
      const breakdownCandidates = todos.filter(
        (task) => !task.completed && evaluateTaskComplexity(task).score >= 3
      );

      const taskBreakdowns: TaskBreakdown[] = [];
      for (const task of breakdownCandidates.slice(0, 3)) {
        // 最大3つまで
        try {
          const breakdown = await smartTaskBreakdown(task);
          taskBreakdowns.push(breakdown);
        } catch (error) {
          // 分解が不要なタスクはスキップ
        }
      }

      setAnalysisResult({ ...result, taskBreakdowns });
      toast.success(`${todos.length}個のタスクの分析が完了しました`);
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('AI分析に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  }, [todos]);

  // 提案の適用
  const handleApplySuggestion = useCallback(
    async (suggestion: AITaskSuggestion) => {
      try {
        await dispatch(
          updateTodoItem({
            _id: suggestion.originalTaskId,
            updates: suggestion.suggestedChanges,
          })
        ).unwrap();

        toast.success('提案を適用しました');

        // 分析結果から適用済みの提案を削除
        if (analysisResult) {
          setAnalysisResult({
            ...analysisResult,
            prioritySuggestions: analysisResult.prioritySuggestions.filter(
              (s) => s.id !== suggestion.id
            ),
          });
        }
      } catch (error) {
        toast.error('提案の適用に失敗しました');
      }
    },
    [dispatch, analysisResult]
  );

  // タスクブレイクダウンの適用
  const handleApplyBreakdown = useCallback(
    async (breakdown: TaskBreakdown) => {
      try {
        // 元のタスクを削除
        await dispatch(
          updateTodoItem({
            _id: breakdown.originalTaskId,
            updates: { completed: true },
          })
        ).unwrap();

        // サブタスクを作成
        for (const subtask of breakdown.subtasks) {
          await dispatch(
            addTodoItem({
              task: subtask.title,
              priority: subtask.priority,
              isPrioritized: subtask.priority >= 4,
              type: 'input',
              createdAt: new Date().toISOString(),
            })
          ).unwrap();
        }

        toast.success(`${breakdown.subtasks.length}個のサブタスクを作成しました`);
      } catch (error) {
        toast.error('タスクブレイクダウンの適用に失敗しました');
      }
    },
    [dispatch]
  );

  // 信頼度に基づくバッジ色
  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'outline';
  };

  // 時間の表示フォーマット
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins > 0 ? mins + '分' : ''}`;
    }
    return `${mins}分`;
  };

  if (!analysisResult && !isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI タスク分析</h3>
          <p className="text-gray-600 mb-6">AIがあなたのタスクを分析し、最適化の提案を行います</p>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || todos.length === 0}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            {isAnalyzing ? '分析中...' : 'AI分析を開始'}
          </Button>
          {todos.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">分析するタスクがありません</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI分析中...</h3>
          <p className="text-gray-600 mb-4">{todos.length}個のタスクを分析しています</p>
          <Progress value={66} className="w-64 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI タスク分析結果
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAnalyze}>
            <RefreshCw className="h-4 w-4 mr-2" />
            再分析
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="priority">優先度</TabsTrigger>
            <TabsTrigger value="time">時間予測</TabsTrigger>
            <TabsTrigger value="groups">グループ化</TabsTrigger>
            <TabsTrigger value="breakdown">タスク分解</TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {analysisResult?.prioritySuggestions.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">優先度提案</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {formatDuration(
                      analysisResult?.timeEstimates.reduce(
                        (sum, est) => sum + est.estimatedMinutes,
                        0
                      ) || 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">総予想時間</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{analysisResult?.taskGroups.length || 0}</div>
                  <div className="text-sm text-gray-600">推奨グループ</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {analysisResult?.taskBreakdowns.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">タスク分解</div>
                </CardContent>
              </Card>
            </div>

            {/* 推奨事項 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  AI推奨事項
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult?.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 優先度提案タブ */}
          <TabsContent value="priority" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">優先度調整の提案</h3>
              <Badge variant="outline">
                {analysisResult?.prioritySuggestions.length || 0}件の提案
              </Badge>
            </div>

            <div className="space-y-3">
              {analysisResult?.prioritySuggestions.map((suggestion) => {
                const task = todos.find((t) => t._id === suggestion.originalTaskId);
                return (
                  <Card key={suggestion.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{task?.task}</h4>
                          <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">現在: {task?.priority || 3}</Badge>
                            <span>→</span>
                            <Badge variant="default">
                              提案: {suggestion.suggestedChanges.priority}
                            </Badge>
                            <Badge variant={getConfidenceBadgeVariant(suggestion.confidence)}>
                              信頼度: {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="ml-4"
                        >
                          適用
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) || []}

              {!analysisResult?.prioritySuggestions.length && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>優先度の調整提案はありません</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 時間予測タブ */}
          <TabsContent value="time" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">タスク時間予測</h3>
              <Badge variant="outline">
                総時間:{' '}
                {formatDuration(
                  analysisResult?.timeEstimates.reduce(
                    (sum, est) => sum + est.estimatedMinutes,
                    0
                  ) || 0
                )}
              </Badge>
            </div>

            <div className="space-y-3">
              {analysisResult?.timeEstimates.map((estimate) => {
                const task = todos.find((t) => t._id === estimate.taskId);
                return (
                  <Card key={estimate.taskId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{task?.task}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>予想時間: {formatDuration(estimate.estimatedMinutes)}</span>
                            <Badge variant={getConfidenceBadgeVariant(estimate.confidence)}>
                              {Math.round(estimate.confidence * 100)}%
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">考慮要因:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {estimate.factors.map((factor, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatDuration(estimate.estimatedMinutes)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) || []}
            </div>
          </TabsContent>

          {/* グループ化タブ */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">タスクグループ化の提案</h3>
              <Badge variant="outline">{analysisResult?.taskGroups.length || 0}個のグループ</Badge>
            </div>

            <div className="space-y-4">
              {analysisResult?.taskGroups.map((group) => (
                <Card key={group.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {group.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{group.category}</Badge>
                          <Badge variant="default">優先度: {group.priority}</Badge>
                          <Badge variant="secondary">{group.taskIds.length}個のタスク</Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">含まれるタスク:</div>
                      <div className="space-y-1">
                        {group.taskIds.map((taskId) => {
                          const task = todos.find((t) => t._id === taskId);
                          return (
                            <div
                              key={taskId}
                              className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded"
                            >
                              <CheckCircle className="h-3 w-3 text-gray-400" />
                              <span>{task?.task}</span>
                              {task?.priority && (
                                <Badge variant="outline" className="ml-auto">
                                  P{task.priority}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <strong>提案:</strong> これらのタスクをまとめて処理することで、
                          コンテキストスイッチを減らし、効率性を向上させることができます。
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || []}

              {!analysisResult?.taskGroups.length && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>グループ化の提案はありません</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* タスク分解タブ */}
          <TabsContent value="breakdown" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">スマートタスク分解</h3>
              <Badge variant="outline">
                {analysisResult?.taskBreakdowns.length || 0}個の分解提案
              </Badge>
            </div>

            <div className="space-y-4">
              {analysisResult?.taskBreakdowns.map((breakdown) => (
                <Card key={breakdown.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* 元のタスク情報 */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                          📋 元のタスク: {breakdown.originalTaskTitle}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-blue-700">
                          <Badge variant="outline">
                            難易度:{' '}
                            {breakdown.difficulty === 'high'
                              ? '高'
                              : breakdown.difficulty === 'medium'
                                ? '中'
                                : '低'}
                          </Badge>
                          <Badge variant="outline">
                            信頼度: {Math.round(breakdown.confidence * 100)}%
                          </Badge>
                          <Badge variant="outline">
                            総予想時間: {Math.floor(breakdown.estimatedTotalTime / 60)}時間
                            {breakdown.estimatedTotalTime % 60}分
                          </Badge>
                        </div>
                      </div>

                      {/* 分解理由 */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div className="text-sm text-gray-700">
                            <strong>分解理由:</strong> {breakdown.reasoning}
                          </div>
                        </div>
                      </div>

                      {/* サブタスク一覧 */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">提案されるサブタスク:</h5>
                        {breakdown.subtasks.map((subtask, index) => (
                          <div
                            key={subtask.id}
                            className="flex items-start gap-3 p-3 border rounded-lg bg-white"
                          >
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h6 className="font-medium text-gray-900 mb-1">{subtask.title}</h6>
                              <p className="text-sm text-gray-600 mb-2">{subtask.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  優先度: {subtask.priority}
                                </Badge>
                                <Badge
                                  variant={subtask.type === 'input' ? 'secondary' : 'default'}
                                  className="text-xs"
                                >
                                  {subtask.type === 'input' ? 'インプット' : 'アウトプット'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {Math.floor(subtask.estimatedMinutes / 60) > 0
                                    ? `${Math.floor(subtask.estimatedMinutes / 60)}時間${subtask.estimatedMinutes % 60 > 0 ? `${subtask.estimatedMinutes % 60}分` : ''}`
                                    : `${subtask.estimatedMinutes}分`}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {subtask.category}
                                </Badge>
                              </div>
                              {subtask.dependencies.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500">
                                  依存: {subtask.dependencies.length}個の前提タスクあり
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* アクションボタン */}
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          後で確認
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApplyBreakdown(breakdown)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          分解を適用
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || []}

              {!analysisResult?.taskBreakdowns.length && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>分解可能な複雑なタスクはありません</p>
                  <p className="text-sm mt-1">
                    大きなタスクやプロジェクトを作成すると、AIが自動で分解提案を行います
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AITaskSuggestions;
