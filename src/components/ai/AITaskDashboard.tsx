import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  Lightbulb,
  Zap,
  Award,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { RootState } from '@/store';
import {
  taskSuggestionService,
  TaskAnalysis,
  TaskSuggestion,
} from '@/services/ai/TaskSuggestionService';
import { toast } from 'react-hot-toast';

interface AITaskDashboardProps {
  className?: string;
}

export const AITaskDashboard: React.FC<AITaskDashboardProps> = ({ className }) => {
  const [analysis, setAnalysis] = useState<TaskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<TaskSuggestion | null>(null);

  // Redux state
  const todos = useSelector((state: RootState) => state.todo.items);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // Load AI analysis
  useEffect(() => {
    const loadAnalysis = async () => {
      setLoading(true);
      try {
        const result = await taskSuggestionService.generateInsights(todos);
        setAnalysis(result);
      } catch (error) {
        console.error('Failed to load AI analysis:', error);
        toast.error('AI分析の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [todos]);

  // Performance metrics with color coding
  const performanceMetrics = useMemo(() => {
    if (!analysis) return [];

    return [
      {
        label: '生産性',
        value: analysis.overallProductivity,
        icon: TrendingUp,
        color:
          analysis.overallProductivity >= 80
            ? 'text-green-600'
            : analysis.overallProductivity >= 60
              ? 'text-yellow-600'
              : 'text-red-600',
        bgColor:
          analysis.overallProductivity >= 80
            ? 'bg-green-50'
            : analysis.overallProductivity >= 60
              ? 'bg-yellow-50'
              : 'bg-red-50',
      },
      {
        label: '時間管理',
        value: analysis.timeManagement,
        icon: Clock,
        color:
          analysis.timeManagement >= 80
            ? 'text-green-600'
            : analysis.timeManagement >= 60
              ? 'text-yellow-600'
              : 'text-red-600',
        bgColor:
          analysis.timeManagement >= 80
            ? 'bg-green-50'
            : analysis.timeManagement >= 60
              ? 'bg-yellow-50'
              : 'bg-red-50',
      },
      {
        label: '優先順位付け',
        value: analysis.prioritization,
        icon: Target,
        color:
          analysis.prioritization >= 80
            ? 'text-green-600'
            : analysis.prioritization >= 60
              ? 'text-yellow-600'
              : 'text-red-600',
        bgColor:
          analysis.prioritization >= 80
            ? 'bg-green-50'
            : analysis.prioritization >= 60
              ? 'bg-yellow-50'
              : 'bg-red-50',
      },
      {
        label: 'ワークロードバランス',
        value: analysis.workloadBalance,
        icon: BarChart3,
        color:
          analysis.workloadBalance >= 80
            ? 'text-green-600'
            : analysis.workloadBalance >= 60
              ? 'text-yellow-600'
              : 'text-red-600',
        bgColor:
          analysis.workloadBalance >= 80
            ? 'bg-green-50'
            : analysis.workloadBalance >= 60
              ? 'bg-yellow-50'
              : 'bg-red-50',
      },
    ];
  }, [analysis]);

  const handleApplySuggestion = async (suggestion: TaskSuggestion) => {
    // Phase 2で実装: 実際の提案適用
    toast.success('提案の適用機能はPhase 2で実装予定です');
  };

  const renderSuggestionCard = (suggestion: TaskSuggestion) => (
    <Card
      key={suggestion.id}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        selectedSuggestion?.id === suggestion.id && 'ring-2 ring-blue-500'
      )}
      onClick={() => setSelectedSuggestion(suggestion)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {suggestion.type === 'priority' && <Target className="h-4 w-4 text-red-500" />}
            {suggestion.type === 'scheduling' && <Calendar className="h-4 w-4 text-blue-500" />}
            {suggestion.type === 'breakdown' && <Zap className="h-4 w-4 text-yellow-500" />}
            {suggestion.type === 'optimization' && (
              <TrendingUp className="h-4 w-4 text-green-500" />
            )}
            <span className="font-medium text-sm">{suggestion.title}</span>
          </div>
          <Badge
            variant={
              suggestion.confidence >= 90
                ? 'default'
                : suggestion.confidence >= 70
                  ? 'secondary'
                  : 'outline'
            }
            className="text-xs"
          >
            {suggestion.confidence}%
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {suggestion.estimatedTimeImpact > 0
              ? `+${suggestion.estimatedTimeImpact}分`
              : `${suggestion.estimatedTimeImpact}分`}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleApplySuggestion(suggestion);
            }}
          >
            適用
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">AI分析を実行中...</span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>AI分析データを読み込むことができませんでした。</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">AIタスク分析</CardTitle>
                <p className="text-gray-600 text-sm">
                  あなたのタスク管理パフォーマンスをAIが分析し、改善提案を行います
                </p>
              </div>
            </div>
            <Badge variant={hasActiveSubscription ? 'default' : 'secondary'} className="gap-1">
              <Sparkles className="h-3 w-3" />
              {hasActiveSubscription ? 'プレミアム' : 'ベーシック'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.label} className={metric.bgColor}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={cn('h-5 w-5', metric.color)} />
                <span className={cn('text-2xl font-bold', metric.color)}>{metric.value}%</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                <Progress value={metric.value} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="suggestions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            AI提案
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            インサイト
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            予測
          </TabsTrigger>
        </TabsList>

        {/* AI Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI提案 ({analysis.suggestions.length}件)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">素晴らしいです！現在改善提案はありません。</p>
                </div>
              ) : (
                <div className="grid gap-4">{analysis.suggestions.map(renderSuggestionCard)}</div>
              )}
            </CardContent>
          </Card>

          {/* Phase 2 Preview */}
          <Alert className="border-dashed border-blue-200 bg-blue-50">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>Phase 2で追加予定:</strong> より高度なAI提案
                  <br />
                  <span className="text-sm text-gray-600">
                    • タスクの自動分割 • 最適なスケジューリング • パフォーマンス予測
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-500" />
              </div>
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📈 完了率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analysis.insights.completionRate.toFixed(1)}%
                </div>
                <Progress value={analysis.insights.completionRate} className="mb-2" />
                <p className="text-sm text-gray-600">全タスクのうち完了したタスクの割合</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⏰ 期限切れ率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {analysis.insights.overdueRate.toFixed(1)}%
                </div>
                <Progress value={analysis.insights.overdueRate} className="mb-2" />
                <p className="text-sm text-gray-600">期限を過ぎてしまったタスクの割合</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📅 1日平均タスク数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analysis.insights.averageTasksPerDay}
                </div>
                <p className="text-sm text-gray-600">今後30日間の1日あたりの予定タスク数</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔥 忙しい日 & 📅 余裕のある日</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">忙しい日:</p>
                    {analysis.insights.busyDays.length === 0 ? (
                      <p className="text-sm text-gray-500">なし</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {analysis.insights.busyDays.map((day) => (
                          <Badge key={day} variant="destructive" className="text-xs">
                            {new Date(day).toLocaleDateString('ja-JP', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">余裕のある日:</p>
                    {analysis.insights.lightDays.length === 0 ? (
                      <p className="text-sm text-gray-500">なし</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {analysis.insights.lightDays.map((day) => (
                          <Badge key={day} variant="secondary" className="text-xs">
                            {new Date(day).toLocaleDateString('ja-JP', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions (Phase 2 Preview) */}
        <TabsContent value="predictions" className="space-y-4">
          <Alert className="border-dashed border-purple-200 bg-purple-50">
            <Brain className="h-4 w-4 text-purple-500" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium text-purple-800">🔮 Phase 2で実装予定の機能</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>タスク完了時間の機械学習予測</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>最適な作業時間帯の提案</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>ワークロード予測と調整提案</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>パフォーマンストレンド分析</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mock prediction cards */}
            {['今週の予測', '来月の傾向', 'パフォーマンス予測'].map((title, index) => (
              <Card key={title} className="opacity-50 relative">
                <CardContent className="p-6 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg" />
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <LineChart className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-600 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500">Phase 2で利用可能</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
