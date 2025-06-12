import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Zap,
  BarChart3,
} from 'lucide-react';
import { taskAnalysisService, TaskAnalysisResponse } from '@/services/ai/taskAnalysisService';
import { TodoItem } from '@/types';
import { cn } from '@/lib/utils';

interface AITaskAnalysisProps {
  tasks: TodoItem[];
  onApplySuggestion?: (taskId: string, suggestion: any) => void;
  className?: string;
}

export const AITaskAnalysis: React.FC<AITaskAnalysisProps> = ({
  tasks,
  onApplySuggestion,
  className,
}) => {
  const [analysis, setAnalysis] = useState<TaskAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const runAnalysis = async () => {
    if (tasks.length === 0) return;

    setIsAnalyzing(true);
    try {
      const result = await taskAnalysisService.analyzeTasksAdvanced({
        tasks,
        context: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          workingHours: { start: '09:00', end: '18:00' },
        },
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (tasks.length > 0) {
      runAnalysis();
    }
  }, [tasks.length]);

  if (!analysis && !isAnalyzing) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center mb-4">AIによるタスク分析を開始しましょう</p>
          <Button onClick={runAnalysis} disabled={tasks.length === 0}>
            <Brain className="h-4 w-4 mr-2" />
            分析を開始
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">AIがタスクを分析中...</p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI タスク分析
          <Button variant="outline" size="sm" onClick={runAnalysis} className="ml-auto">
            <Zap className="h-4 w-4 mr-1" />
            再分析
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="suggestions">提案</TabsTrigger>
            <TabsTrigger value="insights">洞察</TabsTrigger>
            <TabsTrigger value="recommendations">推奨</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">生産性スコア</span>
                  </div>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-bold">
                      {analysis.insights.productivity.score}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">/100</span>
                    {getTrendIcon(analysis.insights.productivity.trend)}
                  </div>
                  <Progress value={analysis.insights.productivity.score} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">平均作業時間</span>
                  </div>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-bold">
                      {analysis.insights.timeManagement.averageTaskTime}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">分</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">優先度精度</span>
                  </div>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-bold">
                      {analysis.insights.prioritization.accuracy}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">主な改善要因</h4>
              {analysis.insights.productivity.factors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {factor}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            {analysis.suggestions.map((suggestion) => {
              const task = tasks.find((t) => t._id === suggestion.taskId);
              if (!task) return null;

              return (
                <Card key={suggestion.taskId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium truncate">{task.task}</h4>
                        <p className="text-sm text-gray-500">
                          AI推奨優先度: {suggestion.smartPriority} | 予想時間:{' '}
                          {suggestion.timeEstimate}分
                        </p>
                      </div>
                      <Badge variant="outline">
                        信頼度: {Math.round(suggestion.suggestions[0]?.confidence * 100 || 0)}%
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {suggestion.suggestions.map((sug, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm">{sug.content}</p>
                            {onApplySuggestion && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => onApplySuggestion(suggestion.taskId, sug)}
                              >
                                適用
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {suggestion.breakdown && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">推奨サブタスク:</p>
                        <ul className="text-sm space-y-1">
                          {suggestion.breakdown.map((subtask, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                              {subtask}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">時間管理</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">過大見積もり率</span>
                      <Progress
                        value={analysis.insights.timeManagement.overestimationRate * 100}
                        className="mt-1"
                      />
                      <span className="text-xs text-gray-500">
                        {Math.round(analysis.insights.timeManagement.overestimationRate * 100)}%
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">改善提案:</p>
                      {analysis.insights.timeManagement.suggestions.map((suggestion, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          • {suggestion}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">優先度管理</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">期限超過タスク</span>
                      <span className="text-lg font-bold text-red-600">
                        {analysis.insights.prioritization.missedDeadlines}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">改善提案:</p>
                      {analysis.insights.prioritization.suggestions.map((suggestion, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          • {suggestion}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {analysis.recommendations.map((recommendation, index) => {
              const icons = {
                schedule: <Clock className="h-4 w-4" />,
                break: <AlertCircle className="h-4 w-4" />,
                focus: <Target className="h-4 w-4" />,
                delegate: <Zap className="h-4 w-4" />,
              };

              const colors = {
                high: 'border-red-200 bg-red-50',
                medium: 'border-yellow-200 bg-yellow-50',
                low: 'border-green-200 bg-green-50',
              };

              return (
                <Card key={index} className={colors[recommendation.priority]}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white">{icons[recommendation.type]}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              recommendation.priority === 'high' ? 'destructive' : 'secondary'
                            }
                          >
                            {recommendation.priority === 'high'
                              ? '高優先度'
                              : recommendation.priority === 'medium'
                                ? '中優先度'
                                : '低優先度'}
                          </Badge>
                          {recommendation.actionable && <Badge variant="outline">実行可能</Badge>}
                        </div>
                        <p className="text-sm">{recommendation.content}</p>
                        {recommendation.actionable && (
                          <Button variant="outline" size="sm" className="mt-2">
                            実行する
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
