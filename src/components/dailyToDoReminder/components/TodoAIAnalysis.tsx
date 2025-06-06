import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Split,
  Trash2,
  Edit,
  Sparkles,
  TrendingUp,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TodoAnalysisResult, TaskRecommendation } from '@/services/ai/todoAnalysisService';

interface TodoAIAnalysisProps {
  analysisResult: TodoAnalysisResult | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onApplyRecommendation: (taskId: string, recommendation: TaskRecommendation) => void;
  onDismissRecommendation: (taskId: string, recommendationIndex: number) => void;
}

export const TodoAIAnalysis: React.FC<TodoAIAnalysisProps> = ({
  analysisResult,
  isLoading,
  onAnalyze,
  onApplyRecommendation,
  onDismissRecommendation,
}) => {
  console.log('[DEBUG] TodoAIAnalysis レンダリング開始:', {
    analysisResult: !!analysisResult,
    isLoading,
    analysisResultData: analysisResult,
  });

  const [selectedTab, setSelectedTab] = useState('overview');

  const getRecommendationIcon = (type: TaskRecommendation['type']) => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'split':
        return <Split className="h-4 w-4" />;
      case 'clarify':
      case 'rewrite':
        return <Edit className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: TaskRecommendation['type']) => {
    switch (type) {
      case 'delete':
        return 'text-red-600 bg-red-50';
      case 'split':
        return 'text-blue-600 bg-blue-50';
      case 'clarify':
      case 'rewrite':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  if (!analysisResult && !isLoading) {
    console.log('[DEBUG] TodoAIAnalysis: 初期状態を表示');
    return (
      <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">AI分析でToDoを改善</h3>
          <p className="text-slate-600 mb-4">
            抽象的なタスクを削除し、複雑なタスクを実行可能なステップに分割します
          </p>
          <Button
            onClick={onAnalyze}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI分析を開始
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    console.log('[DEBUG] TodoAIAnalysis: ローディング状態を表示');
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">AI分析中...</p>
        </CardContent>
      </Card>
    );
  }

  console.log('[DEBUG] TodoAIAnalysis: 分析結果を表示');
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI分析結果
          <Badge variant="secondary" className="ml-2">
            改善スコア: {analysisResult!.summary.improvementScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="recommendations">詳細提案</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* サマリー統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-red-900">削除対象</p>
                <p className="text-xl font-bold text-red-600">
                  {analysisResult!.summary.tasksToDelete}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Split className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-blue-900">分割対象</p>
                <p className="text-xl font-bold text-blue-600">
                  {analysisResult!.summary.tasksToSplit}
                </p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <Edit className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-amber-900">明確化対象</p>
                <p className="text-xl font-bold text-amber-600">
                  {analysisResult!.summary.tasksToClarify}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-900">改善度</p>
                <p className="text-xl font-bold text-green-600">
                  {analysisResult!.summary.improvementScore}%
                </p>
              </div>
            </div>

            {/* 全体の改善度 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>全体の実行可能性</span>
                <span>{analysisResult!.summary.improvementScore}%</span>
              </div>
              <Progress value={analysisResult!.summary.improvementScore} className="h-2" />
            </div>

            <Button onClick={onAnalyze} variant="outline" size="sm" className="w-full">
              再分析
            </Button>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {analysisResult!.analyzedTasks
              .filter((task) => task.recommendations.length > 0)
              .map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{task.originalTask}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={task.clarity === 'clear' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {task.clarity === 'clear'
                            ? '明確'
                            : task.clarity === 'vague'
                              ? '曖昧'
                              : '抽象的'}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          実行可能性: {task.actionability}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {task.issues.length > 0 && (
                    <div className="flex items-start gap-2 p-2 bg-amber-50 rounded">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">問題点:</p>
                        <ul className="text-sm text-amber-800 list-disc list-inside">
                          {task.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {task.recommendations.map((rec, index) => (
                      <div key={index} className="border rounded p-3 bg-slate-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn('p-1 rounded', getRecommendationColor(rec.type))}>
                              {getRecommendationIcon(rec.type)}
                            </div>
                            <span className="text-sm font-medium">
                              {rec.type === 'delete'
                                ? '削除'
                                : rec.type === 'split'
                                  ? '分割'
                                  : rec.type === 'clarify'
                                    ? '明確化'
                                    : '書き換え'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              信頼度: {rec.confidence}%
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onApplyRecommendation(task.id, rec)}
                              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDismissRecommendation(task.id, index)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-2">{rec.reason}</p>

                        {rec.rewrittenTask && (
                          <div className="p-2 bg-green-50 rounded text-sm">
                            <strong>改善案:</strong> {rec.rewrittenTask}
                          </div>
                        )}

                        {rec.newTasks && (
                          <div className="p-2 bg-blue-50 rounded text-sm">
                            <strong>分割案:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {rec.newTasks.map((newTask, i) => (
                                <li key={i}>{newTask}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
