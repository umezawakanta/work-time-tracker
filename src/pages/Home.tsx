import React, { useEffect, useState, useMemo } from 'react';
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
import { Progress } from '@/components/ui/progress';
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
  AlertTriangle,
  Users,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import DailyTodoReminder from '@/components/dailyToDoReminder/DailyTodoReminder';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useResponsive } from '@/hooks/useResponsive';

interface ActivityData {
  task: string;
  time: string;
  status: 'completed' | 'in-progress' | 'pending';
  type?: 'todo' | 'calendar' | 'wbs';
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'deadline' | 'reminder';
}

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const todos = useSelector((state: RootState) => state.todo.items) || [];
  const isUserLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  // Ensure todos is always an array for safety
  const safeTodos = Array.isArray(todos) ? todos : [];

  const { isMobile } = useResponsive();

  // ToDoデータの初期化
  useEffect(() => {
    if (isAuthenticated && isUserLoggedIn) {
      dispatch(fetchTodoItems());
      loadCalendarData();
    }
  }, [isAuthenticated, isUserLoggedIn, dispatch]);

  // カレンダーデータの読み込み
  const loadCalendarData = async () => {
    setIsLoadingCalendar(true);
    try {
      // 実際の実装では、カレンダーAPIからデータを取得
      // 現在はモックデータを使用
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'プロジェクトレビュー',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明日
          end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 明日+1時間
          type: 'meeting',
        },
        {
          id: '2',
          title: '月次報告会',
          start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5日後
          end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 5日後+2時間
          type: 'meeting',
        },
        {
          id: '3',
          title: 'タスクA期限',
          start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3日後
          end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          type: 'deadline',
        },
      ];
      setCalendarEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      toast.error('カレンダーデータの読み込みに失敗しました');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  // 連続記録の計算
  const calculateStreakDays = (): number => {
    // 簡易実装：実際にはより複雑なロジックが必要
    const completedDates = safeTodos
      .filter((todo) => todo.completed && todo.completedDate)
      .map((todo) => new Date(todo.completedDate!).toDateString())
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (completedDates.includes(today) || completedDates.includes(yesterday)) {
      streak = 1;
      for (let i = 1; i < 30; i++) {
        const checkDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
        if (completedDates.includes(checkDate)) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  };

  // 統合統計データの計算
  const calculateIntegratedStats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();

    // ToDo統計
    const todayTasks = safeTodos.filter((todo) => {
      const createdDate = todo.createdAt ? new Date(todo.createdAt).toDateString() : todayStr;
      return createdDate === todayStr;
    });

    const completedToday = todayTasks.filter((todo) => todo.completed).length;
    const totalToday = todayTasks.length;
    const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    // 期限切れタスク
    const overdueTasks = safeTodos.filter((todo) => {
      if (!todo.deadline || todo.completed) return false;
      return new Date(todo.deadline) < today;
    }).length;

    // 今週のイベント
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const thisWeekEvents = calendarEvents.filter(
      (event) => event.start >= weekStart && event.start <= weekEnd
    ).length;

    // 高優先度タスク
    const highPriorityTasks = safeTodos.filter(
      (todo) => !todo.completed && (todo.isPrioritized || (todo.priority && todo.priority > 3))
    ).length;

    // 連続記録の計算（簡易版）
    const streakDays = calculateStreakDays();

    return [
      {
        title: '今日のタスク',
        value: totalToday > 0 ? `${completedToday}/${totalToday}` : '0',
        icon: <CheckCircle className="h-6 w-6" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        progress: completionRate,
        change: { value: completionRate >= 70 ? 12 : -5, period: '先週比' },
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
        value: `${Math.max(completionRate, 50)}%`,
        icon: <TrendingUp className="h-6 w-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        progress: Math.max(completionRate, 50),
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
  }, [safeTodos, calendarEvents]);

  // 統合アクティビティの取得
  const getIntegratedActivities = (): ActivityData[] => {
    const activities: ActivityData[] = [];

    // 最近完了したToDo
    const recentTodos = safeTodos
      .filter((todo) => todo.completed && todo.completedDate)
      .sort((a, b) => {
        const dateA = new Date(a.completedDate!).getTime();
        const dateB = new Date(b.completedDate!).getTime();
        return dateB - dateA;
      })
      .slice(0, 3)
      .map((todo) => ({
        task: todo.task,
        time: todo.completedDate ? getTimeAgo(new Date(todo.completedDate)) : '不明',
        status: 'completed' as const,
        type: 'todo' as const,
      }));

    activities.push(...recentTodos);

    // 近日中のカレンダーイベント
    const upcomingEvents = calendarEvents
      .filter((event) => event.start > new Date())
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 2)
      .map((event) => ({
        task: event.title,
        time: getTimeUntil(event.start),
        status: 'pending' as const,
        type: 'calendar' as const,
      }));

    activities.push(...upcomingEvents);

    return activities.slice(0, 5);
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

  const getTimeUntil = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}日後`;
    } else if (diffHours > 0) {
      return `${diffHours}時間後`;
    } else {
      return '間もなく';
    }
  };

  const handleTaskSelect = (taskId: string) => {
    if (taskId && taskId !== 'default-task') {
      navigate(`/todos?highlight=${taskId}`);
    } else {
      navigate('/todos');
    }
  };

  // 緊急度の高いアラートを表示
  const getUrgentAlerts = () => {
    const alerts = [];
    const overdueTasks = safeTodos.filter((todo) => {
      if (!todo.deadline || todo.completed) return false;
      return new Date(todo.deadline) < new Date();
    });

    if (overdueTasks.length > 0) {
      alerts.push({
        type: 'error',
        title: '期限切れタスク',
        message: `${overdueTasks.length}件のタスクが期限を過ぎています`,
        action: () => navigate('/todos?filter=overdue'),
      });
    }

    const todayDeadlines = safeTodos.filter((todo) => {
      if (!todo.deadline || todo.completed) return false;
      const deadline = new Date(todo.deadline);
      const today = new Date();
      return deadline.toDateString() === today.toDateString();
    });

    if (todayDeadlines.length > 0) {
      alerts.push({
        type: 'warning',
        title: '今日が期限',
        message: `${todayDeadlines.length}件のタスクが今日期限です`,
        action: () => navigate('/todos?filter=today'),
      });
    }

    return alerts;
  };

  const stats = calculateIntegratedStats;
  const activities = getIntegratedActivities();
  const alerts = getUrgentAlerts();

  // 📱 モバイルファースト: プルツーリフレッシュで全データ更新
  const handleRefresh = async () => {
    try {
      // ダッシュボードデータを再取得
      await Promise.all([
        // TodoListの更新（既存のrefresh関数があれば使用）
        dispatch(fetchTodoItems() as any),
        // その他のデータ更新
        new Promise((resolve) => setTimeout(resolve, 1000)), // 更新シミュレーション
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

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
      {/* 緊急アラート */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert, index) => (
            <Card
              key={index}
              className={cn(
                'border-l-4 cursor-pointer hover:shadow-md transition-shadow',
                alert.type === 'error' && 'border-l-red-500 bg-red-50',
                alert.type === 'warning' && 'border-l-yellow-500 bg-yellow-50'
              )}
              onClick={alert.action}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle
                    className={cn(
                      'h-5 w-5',
                      alert.type === 'error' && 'text-red-600',
                      alert.type === 'warning' && 'text-yellow-600'
                    )}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    確認
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 統計セクション */}
      <StatsGrid stats={stats} className="mb-8" />

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* 左側：AIタスク提案 */}
        <div className="xl:col-span-1">
          <NextTaskSuggestionComponent
            todos={safeTodos}
            calendarEvents={calendarEvents}
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

        {/* 右側：統合アクティビティ */}
        <div className="xl:col-span-1 space-y-6">
          {/* 最近のアクティビティ */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                最近のアクティビティ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          activity.status === 'completed' && 'bg-emerald-500',
                          activity.status === 'pending' && 'bg-blue-500',
                          activity.status === 'in-progress' && 'bg-yellow-500'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {activity.task}
                          </p>
                          {activity.type && (
                            <Badge variant="outline" className="text-xs">
                              {activity.type === 'todo' && <CheckSquare className="h-3 w-3 mr-1" />}
                              {activity.type === 'calendar' && (
                                <Calendar className="h-3 w-3 mr-1" />
                              )}
                              {activity.type === 'wbs' && <Briefcase className="h-3 w-3 mr-1" />}
                              {activity.type}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">まだアクティビティがありません</p>
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
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                今週の予定
                {isLoadingCalendar && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {calendarEvents.length > 0 ? (
                  calendarEvents.slice(0, 3).map((event, index) => (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full',
                          event.type === 'meeting' && 'bg-blue-500',
                          event.type === 'deadline' && 'bg-red-500',
                          event.type === 'reminder' && 'bg-green-500'
                        )}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {event.start.toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">予定がありません</p>
                  </div>
                )}
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
                <ul className="text-sm text-slate-500 mt-2 space-y-1">
                  <li>• WBSとカレンダーの統合分析</li>
                  <li>• リアルタイムAI提案</li>
                  <li>• チーム協力機能</li>
                  <li>• 詳細レポート</li>
                </ul>
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

      {isMobile ? (
        // 📱 モバイル: プルツーリフレッシュ対応
        <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
          {/* 既存のコンテンツ */}
          <div className="container mx-auto px-4 py-8">{/* ... existing home content ... */}</div>
        </PullToRefresh>
      ) : (
        // デスクトップ: 通常レイアウト
        <div className="container mx-auto px-4 py-8">{/* ... existing home content ... */}</div>
      )}
    </PageLayout>
  );
};

export default Home;
