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
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Zap,
  RefreshCw,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { TodoItem } from '@/types';
import {
  nextTaskSuggestionService,
  NextTaskSuggestion,
  TaskPriority,
} from '@/services/ai/nextTaskSuggestionService';
import { cn } from '@/lib/utils';

interface NextTaskSuggestionProps {
  todos: TodoItem[];
  onTaskSelect?: (taskId: string) => void;
  className?: string;
}

export const NextTaskSuggestionComponent: React.FC<NextTaskSuggestionProps> = ({
  todos,
  onTaskSelect,
  className,
}) => {
  const [suggestion, setSuggestion] = useState<NextTaskSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const currentTime = new Date();
      const context = {
        todos,
        currentTime,
        workingHours: { start: 9, end: 18 },
        userPreferences: {
          focusTime: 90,
          breakInterval: 25,
          preferredTaskTypes: ['output' as const, 'input' as const],
        },
      };

      const result = await nextTaskSuggestionService.generateSuggestions(context);
      setSuggestion(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load task suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (todos.length > 0) {
      loadSuggestions();
    }
  }, [todos.length]);

  const getUrgencyColor = (urgency: TaskPriority['urgency']) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getUrgencyIcon = (urgency: TaskPriority['urgency']) => {
    switch (urgency) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <Clock className="h-4 w-4" />;
      case 'medium':
        return <Target className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const renderTaskCard = (task: TaskPriority, isMain = false) => (
    <div
      key={task.taskId}
      className={cn(
        'p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer',
        isMain
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
          : 'bg-white border-gray-200 hover:border-blue-300'
      )}
      onClick={() => onTaskSelect?.(task.taskId)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4
            className={cn(
              'font-medium truncate',
              isMain ? 'text-lg text-blue-900' : 'text-sm text-gray-900'
            )}
          >
            {task.task}
          </h4>
          <p className="text-xs text-gray-600 mt-1">{task.reason}</p>
        </div>
        <Badge className={cn('ml-2 flex items-center gap-1', getUrgencyColor(task.urgency))}>
          {getUrgencyIcon(task.urgency)}
          {task.urgency}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.estimatedDuration}分
          </div>
          {task.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {task.deadline.toLocaleDateString()}
            </div>
          )}
        </div>
        {isMain && <ChevronRight className="h-4 w-4 text-blue-600" />}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
            <span className="text-gray-600">AIが最適なタスクを分析中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestion || todos.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">AIタスク提案</h3>
          <p className="text-gray-600 mb-4">
            タスクを追加すると、AIが最適な次のアクションを提案します
          </p>
          <Button onClick={() => onTaskSelect?.('')}>
            <Target className="h-4 w-4 mr-2" />
            タスクを追加
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI タスク提案
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{lastUpdated.toLocaleTimeString()}更新</span>
            <Button variant="ghost" size="sm" onClick={loadSuggestions}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="main" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="main">今すぐ</TabsTrigger>
            <TabsTrigger value="schedule">スケジュール</TabsTrigger>
            <TabsTrigger value="insights">分析</TabsTrigger>
            <TabsTrigger value="time">時間割</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4">
            <div>
              <h3 className="flex items-center gap-2 font-semibold mb-3">
                <Zap className="h-4 w-4 text-yellow-500" />
                推奨タスク
              </h3>
              {renderTaskCard(suggestion.mainTask, true)}
            </div>

            {suggestion.alternativeTasks.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">代替タスク</h4>
                <div className="space-y-2">
                  {suggestion.alternativeTasks.map((task) => renderTaskCard(task))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="grid gap-4">
              {suggestion.schedule.nextHour && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">次の1時間</h4>
                  {renderTaskCard(suggestion.schedule.nextHour)}
                </div>
              )}

              {suggestion.schedule.today.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">今日の予定</h4>
                  <div className="space-y-2">
                    {suggestion.schedule.today.slice(0, 3).map((task) => renderTaskCard(task))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {suggestion.insights.totalPendingTasks}
                </p>
                <p className="text-sm text-gray-600">未完了タスク</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {suggestion.insights.overdueCount}
                </p>
                <p className="text-sm text-gray-600">期限切れ</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">生産性スコア</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {suggestion.insights.productivity.score}%
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <Progress value={suggestion.insights.productivity.score} className="mb-3" />
            </div>

            <div>
              <h4 className="flex items-center gap-2 font-medium text-sm text-gray-700 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                AIからの提案
              </h4>
              <div className="space-y-2">
                {suggestion.insights.productivity.recommendations.map((rec, index) => (
                  <p key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {rec}
                  </p>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">🌅 午前 (9-12時)</h4>
                <div className="space-y-1">
                  {suggestion.insights.timeBlocking.morning.slice(0, 2).map((task) => (
                    <div key={task.taskId} className="text-sm p-2 bg-yellow-50 rounded">
                      {task.task}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">☀️ 午後 (13-17時)</h4>
                <div className="space-y-1">
                  {suggestion.insights.timeBlocking.afternoon.slice(0, 2).map((task) => (
                    <div key={task.taskId} className="text-sm p-2 bg-blue-50 rounded">
                      {task.task}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">🌆 夕方 (17-19時)</h4>
                <div className="space-y-1">
                  {suggestion.insights.timeBlocking.evening.slice(0, 2).map((task) => (
                    <div key={task.taskId} className="text-sm p-2 bg-purple-50 rounded">
                      {task.task}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
