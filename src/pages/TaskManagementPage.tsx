import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import {
  CheckSquare,
  Calendar,
  Brain,
  BarChart3,
  Target,
  Plus,
  Filter,
  Settings,
  TrendingUp,
} from 'lucide-react';

import { RootState } from '@/store';
import EnhancedTaskManager from '@/components/tasks/EnhancedTaskManager';
import TaskCalendarIntegration from '@/components/calendar/TaskCalendarIntegration';
import AITaskSuggestions from '@/components/ai/AITaskSuggestions';
import DailyTodoReminder from '@/components/dailyToDoReminder/DailyTodoReminder';

const TaskManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const todos = useSelector((state: RootState) => state.todo.items);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // タスク統計の計算
  const taskStats = React.useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const inProgress = 0;
    const pending = total - completed;
    const overdue = todos.filter(
      (t) => t.deadline && new Date(t.deadline) < new Date() && !t.completed
    ).length;

    return { total, completed, inProgress, pending, overdue };
  }, [todos]);

  return (
    <PageLayout
      title="タスク管理"
      subtitle="効率的なタスク管理でプロダクティビティを最大化"
      badge={{
        text: hasActiveSubscription ? 'プレミアム' : 'スタンダード',
        variant: hasActiveSubscription ? 'default' : 'secondary',
        icon: <CheckSquare className="w-4 h-4" />,
      }}
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            設定
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新規タスク
          </Button>
        </div>
      }
      headerGradient
    >
      <div className="space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
              <div className="text-sm text-gray-600">総タスク数</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-gray-600">完了済み</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{taskStats.inProgress}</div>
              <div className="text-sm text-gray-600">進行中</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{taskStats.pending}</div>
              <div className="text-sm text-gray-600">未着手</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
              <div className="text-sm text-gray-600">期限切れ</div>
            </CardContent>
          </Card>
        </div>

        {/* メインタブ */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              ダッシュボード
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              タスク管理
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              カレンダー
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI分析
              {hasActiveSubscription && (
                <Badge variant="secondary" className="ml-1">
                  Pro
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="dashboard">
            <DailyTodoReminder isPremium={hasActiveSubscription} />
          </TabsContent>

          <TabsContent value="tasks">
            <EnhancedTaskManager />
          </TabsContent>

          <TabsContent value="calendar">
            <TaskCalendarIntegration />
          </TabsContent>

          <TabsContent value="ai">
            <AITaskSuggestions />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default TaskManagementPage;
