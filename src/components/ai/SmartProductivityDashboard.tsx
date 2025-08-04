// src/components/ai/SmartProductivityDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Calendar,
  TrendingUp,
  Lightbulb,
  Clock,
  Target,
  Zap,
  BarChart3,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  smartProductivityService,
  ProductivityInsight,
  SmartSchedule,
  WeeklyProductivityReport,
  ProactiveTaskSuggestion,
} from '@/services/ai/SmartProductivityService';
import { Todo } from '@/types/todo';

interface SmartProductivityDashboardProps {
  todos: Todo[];
  userId: string;
  className?: string;
}

export const SmartProductivityDashboard: React.FC<SmartProductivityDashboardProps> = ({
  todos,
  userId,
  className,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');

  // State for different AI features
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);
  const [schedule, setSchedule] = useState<SmartSchedule[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyProductivityReport | null>(null);
  const [proactiveSuggestions, setProactiveSuggestions] = useState<ProactiveTaskSuggestion[]>([]);
  const [realTimeOptimization, setRealTimeOptimization] = useState<string[]>([]);

  // Load AI data
  useEffect(() => {
    loadAIAnalysis();
  }, [todos, userId]);

  const loadAIAnalysis = async () => {
    setLoading(true);
    try {
      // 並列でAI分析を実行
      const [
        personalizedInsights,
        smartScheduleResult,
        weeklyReportResult,
        proactiveSuggestionsResult,
      ] = await Promise.allSettled([
        smartProductivityService.generatePersonalizedInsights(todos, {
          userId,
          recentActivity: true,
        }),
        smartProductivityService.generateSmartSchedule(
          todos.filter((todo) => !todo.completed),
          { workingHours: '9-17', timezone: 'Asia/Tokyo' },
          {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ),
        smartProductivityService.generateWeeklyReport(userId, []),
        smartProductivityService.generateProactiveTaskSuggestions(userId, {
          currentTodos: todos.length,
          completedToday: todos.filter((t) => t.completed).length,
        }),
      ]);

      // 結果を安全に設定
      if (personalizedInsights.status === 'fulfilled') {
        setInsights(personalizedInsights.value);
      }
      if (smartScheduleResult.status === 'fulfilled') {
        setSchedule(smartScheduleResult.value);
      }
      if (weeklyReportResult.status === 'fulfilled') {
        setWeeklyReport(weeklyReportResult.value);
      }
      if (proactiveSuggestionsResult.status === 'fulfilled') {
        setProactiveSuggestions(proactiveSuggestionsResult.value);
      }
    } catch (error) {
      console.error('AI分析読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: ProductivityInsight['impact']) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getImpactIcon = (impact: ProductivityInsight['impact']) => {
    switch (impact) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <TrendingUp className="h-4 w-4" />;
      case 'medium':
        return <Target className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card
        className={cn('border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50', className)}
      >
        <CardContent className="p-8 text-center">
          <div className="animate-spin mx-auto mb-4">
            <Brain className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Gemini 2.5 Pro で分析中...</h3>
          <p className="text-slate-600">あなたの生産性を最適化するための洞察を生成しています</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* ヘッダー */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI 生産性ダッシュボード</h2>
                <p className="text-purple-100">Gemini 2.5 Pro による高度な分析</p>
              </div>
            </div>
            <Button
              onClick={loadAIAnalysis}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              再分析
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* メインタブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            洞察
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            スケジュール
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            週次レポート
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            提案
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            最適化
          </TabsTrigger>
        </TabsList>

        {/* 洞察タブ */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getImpactIcon(insight.impact)}
                      {insight.title}
                    </CardTitle>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">{insight.description}</p>

                  {insight.actionItems.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">アクションアイテム</h4>
                      <ul className="space-y-1">
                        {insight.actionItems.map((action, actionIndex) => (
                          <li
                            key={actionIndex}
                            className="flex items-start gap-2 text-sm text-slate-600"
                          >
                            <ArrowRight className="h-3 w-3 mt-1 text-blue-500 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      推定時間節約: {insight.estimatedTimesSaved}分
                    </span>
                    <span className="text-slate-500">
                      信頼度: {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* スマートスケジュールタブ */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                AI 最適化スケジュール
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.slice(0, 6).map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="text-sm font-medium text-slate-900">
                        {new Date(item.timeSlot.start).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-xs text-slate-500">
                        {Math.round(
                          (new Date(item.timeSlot.end).getTime() -
                            new Date(item.timeSlot.start).getTime()) /
                            60000
                        )}
                        分
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {todos.find((t) => t && t._id === item.taskId)?.task || 'タスク'}
                      </div>
                      <div className="text-sm text-slate-600">{item.reason}</div>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.energyLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.focusRequired}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.estimatedProductivity}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 週次レポートタブ */}
        <TabsContent value="report" className="space-y-4">
          {weeklyReport && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    生産性スコア
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {weeklyReport.productivityScore}
                    </div>
                    <div className="text-slate-600 mb-4">今週の総合スコア</div>
                    <Progress value={weeklyReport.productivityScore} className="mb-4" />

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {weeklyReport.trends.taskCompletion}%
                        </div>
                        <div className="text-xs text-slate-500">タスク完了率</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {weeklyReport.trends.efficiency}%
                        </div>
                        <div className="text-xs text-slate-500">効率性</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {weeklyReport.trends.focusTime}%
                        </div>
                        <div className="text-xs text-slate-500">集中時間</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    今週の成果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weeklyReport.achievements.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* プロアクティブ提案タブ */}
        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid gap-4">
            {proactiveSuggestions.slice(0, 4).map((suggestion, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">
                        {suggestion.suggestedTask.title}
                      </h3>
                      <p className="text-slate-600 mb-3">{suggestion.suggestedTask.description}</p>
                      <div className="text-sm text-slate-500">理由: {suggestion.reason}</div>
                    </div>
                    <Badge
                      className={cn(
                        'ml-4',
                        suggestion.urgency === 'high'
                          ? 'bg-red-100 text-red-800'
                          : suggestion.urgency === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      )}
                    >
                      {suggestion.urgency}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {suggestion.suggestedTask.estimatedDuration}分
                      </span>
                      <span>信頼度: {Math.round(suggestion.confidence * 100)}%</span>
                    </div>
                    <Button size="sm" variant="outline">
                      タスクとして追加
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* リアルタイム最適化タブ */}
        <TabsContent value="optimize" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                リアルタイム最適化提案
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realTimeOptimization.length > 0 ? (
                  realTimeOptimization.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{tip}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    現在のタスクを選択すると、リアルタイム最適化提案が表示されます
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
