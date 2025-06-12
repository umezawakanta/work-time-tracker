import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems } from '@/store/todoSlice';
import { useAuth } from '@/hooks/useAuth';
import { PageLayout } from '@/components/layout/PageLayout';
import { EnhancedCard } from '@/components/common/EnhancedCard';
import { StatsGrid } from '@/components/common/StatsGrid';
import { NextTaskSuggestionComponent } from '@/components/ai/NextTaskSuggestion';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Target,
  BarChart3,
  CheckCircle,
  Award,
  TrendingUp,
  CheckSquare,
  Brain,
  Calendar,
  Zap,
  Plus,
} from 'lucide-react';
import DailyTodoReminder from '@/components/dailyToDoReminder/DailyTodoReminder';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const todos = useSelector((state: RootState) => state.todo.items);
  const isUserLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // ToDoデータの初期化
  useEffect(() => {
    if (isAuthenticated && isUserLoggedIn) {
      dispatch(fetchTodoItems());
    }
  }, [isAuthenticated, isUserLoggedIn, dispatch]);

  // 統計データの計算
  const calculateStats = () => {
    const todayTasks = todos.filter((todo) => {
      const today = new Date().toDateString();
      const createdDate = todo.createdAt ? new Date(todo.createdAt).toDateString() : today;
      return createdDate === today;
    });

    const completedToday = todayTasks.filter((todo) => todo.completed).length;
    const totalToday = todayTasks.length;
    const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    const overdueTasks = todos.filter((todo) => {
      if (!todo.deadline || todo.completed) return false;
      return new Date(todo.deadline) < new Date();
    }).length;

    // 連続記録の計算（簡易版）
    const streakDays = 7; // 実際にはより複雑な計算が必要

    return [
      {
        title: '今日のタスク',
        value: `${completedToday}/${totalToday}`,
        icon: <CheckCircle className="h-6 w-6" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        progress: completionRate,
        change: { value: 12, period: '先週比' },
      },
      {
        title: '作業時間',
        value: '6.5h',
        icon: <Clock className="h-6 w-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        progress: 81,
        change: { value: 8, period: '昨日比' },
      },
      {
        title: '生産性スコア',
        value: `${completionRate}%`,
        icon: <TrendingUp className="h-6 w-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        progress: completionRate,
        change: { value: 5, period: '今月平均' },
      },
      {
        title: '連続記録',
        value: `${streakDays}日`,
        icon: <Award className="h-6 w-6" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        progress: Math.round((streakDays / 30) * 100),
        change: { value: 0, period: '目標30日' },
      },
    ];
  };

  // 最近のアクティビティの計算
  const getRecentActivities = () => {
    const recentTodos = todos
      .filter((todo) => todo.completed && todo.completedDate)
      .sort((a, b) => {
        const dateA = new Date(a.completedDate!).getTime();
        const dateB = new Date(b.completedDate!).getTime();
        return dateB - dateA;
      })
      .slice(0, 4);

    return recentTodos.map((todo) => ({
      task: todo.task,
      time: todo.completedDate ? getTimeAgo(new Date(todo.completedDate)) : '不明',
      status: 'completed' as const,
    }));
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}日前`;
    } else if (diffHours > 0) {
      return `${diffHours}時間前`;
    } else {
      return '1時間未満前';
    }
  };

  const handleTaskSelect = (taskId: string) => {
    if (taskId) {
      navigate(`/todos?highlight=${taskId}`);
    } else {
      navigate('/todos');
    }
  };

  const stats = calculateStats();
  const recentActivities = getRecentActivities();

  return (
    <PageLayout
      title={`おはようございます、${user?.name || 'ユーザー'}さん！`}
      subtitle="今日も生産的な一日にしましょう 🚀"
      badge={{
        text: hasActiveSubscription ? 'プレミアム' : 'フリー',
        variant: hasActiveSubscription ? 'default' : 'secondary',
      }}
      headerGradient
    >
      {/* 統計セクション */}
      <StatsGrid stats={stats} className="mb-8" />

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* 左側：AIタスク提案 */}
        <div className="xl:col-span-1">
          <NextTaskSuggestionComponent
            todos={todos}
            onTaskSelect={handleTaskSelect}
            className="h-fit"
          />
        </div>

        {/* 中央：DailyTodoReminder */}
        <div className="xl:col-span-1">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">今日のToDo</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/todos')}
                className="flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                詳細管理
              </Button>
            </div>
            <DailyTodoReminder isPremium={hasActiveSubscription} />
          </div>
        </div>

        {/* 右側：最近のアクティビティ */}
        <div className="xl:col-span-1">
          <Card className="border-0 shadow-md h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                最近のアクティビティ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          activity.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.task}
                        </p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">完了したタスクがありません</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate('/todos')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      タスクを追加
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* カレンダープレビュー */}
          <Card className="border-0 shadow-md mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                今週の予定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">プロジェクトレビュー</p>
                    <p className="text-xs text-gray-500">明日 10:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">月次報告会</p>
                    <p className="text-xs text-gray-500">金曜日 14:00</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/calendar')}
                  className="w-full mt-3"
                >
                  カレンダーを開く
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* クイックアクションセクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <CheckSquare className="h-6 w-6" />,
            title: 'ToDo管理',
            description: 'タスクの詳細管理',
            path: '/todos',
            gradient: 'from-green-500 to-green-600',
          },
          {
            icon: <Clock className="h-6 w-6" />,
            title: '勤怠記録',
            description: '今日の作業を記録',
            path: '/work-time',
            gradient: 'from-blue-500 to-blue-600',
          },
          {
            icon: <Target className="h-6 w-6" />,
            title: 'プロジェクト管理',
            description: 'WBSとプロジェクト',
            path: '/integrated-dashboard',
            gradient: 'from-purple-500 to-purple-600',
          },
          {
            icon: <BarChart3 className="h-6 w-6" />,
            title: 'レポート分析',
            description: '生産性の分析',
            path: '/work-time-reports',
            gradient: 'from-emerald-500 to-emerald-600',
          },
        ].map((action, index) => (
          <EnhancedCard
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            gradient={action.gradient}
            action={{
              text: '開く',
              onClick: () => navigate(action.path),
            }}
          />
        ))}
      </div>

      {/* プレミアム機能の案内 */}
      {!hasActiveSubscription && (
        <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-purple-50 mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AIプレミアム機能
                </h3>
                <p className="text-slate-600">
                  高度なAI分析、チーム協力、自動WBS生成などの機能をご利用いただけます
                </p>
              </div>
              <Button
                onClick={() => navigate('/subscription-management')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                アップグレード
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default Home;
