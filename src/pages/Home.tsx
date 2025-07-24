import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems } from '@/store/todoSlice';
import { useAuth } from '@/hooks/useAuth';
import { useInternationalization } from '@/hooks/useInternationalization';
import { PageLayout } from '@/components/layout/PageLayout';
import { EnhancedCard } from '@/components/common/EnhancedCard';
import { StatsGrid } from '@/components/common/StatsGrid';
import { NextTaskSuggestionComponent } from '@/components/ai/NextTaskSuggestion';
import { DailyMotivationGamification } from '@/components/gamification/DailyMotivationGamification';
import { DashboardGuide } from '@/components/dashboard/DashboardGuide';
import { UnifiedHomeDashboard } from '@/components/dashboard/UnifiedHomeDashboard';
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
  Trophy,
  Star,
  Flame,
  Crown,
  Gem,
  Gamepad2,
  Activity,
  Shield,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useResponsive } from '@/hooks/useResponsive';
import ADHDExecutionAssistant from '@/components/adhd/ADHDExecutionAssistant';
import { ImpulseControlDashboard } from '@/components/adhd/ImpulseControlDashboard';

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

interface GamificationStats {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streakDays: number;
  todayTasksCompleted: number;
  todayTasksTotal: number;
  weeklyXP: number;
  unlockedBadges: number;
  totalBadges: number;
}

interface AlertData {
  type: 'error' | 'warning';
  title: string;
  message: string;
  action: () => void;
}

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useInternationalization();

  const todos = useSelector((state: RootState) => state.todo.items) || [];
  const isUserLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [gamificationStats, setGamificationStats] = useState<GamificationStats>({
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    streakDays: 0,
    todayTasksCompleted: 0,
    todayTasksTotal: 0,
    weeklyXP: 0,
    unlockedBadges: 0,
    totalBadges: 0,
  });
  const [showGuide, setShowGuide] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  const { isMobile } = useResponsive();

  // Ensure todos is always an array for safety
  const safeTodos = useMemo(() => (Array.isArray(todos) ? todos : []), [todos]);

  // データ初期化の最適化
  const initializeData = useCallback(async () => {
    if (!isAuthenticated || !isUserLoggedIn) return;

    try {
      await Promise.all([dispatch(fetchTodoItems()), loadCalendarData(), loadGamificationStats()]);
    } catch (error) {
      console.error('Failed to initialize data:', error);
      toast.error('データの読み込みに失敗しました');
    }
  }, [isAuthenticated, isUserLoggedIn, dispatch]);

  useEffect(() => {
    initializeData();

    // 初回訪問の判定
    const hasVisitedBefore = localStorage.getItem('lifesync-visited');
    if (!hasVisitedBefore) {
      setIsFirstVisit(true);
      setShowGuide(true);
      localStorage.setItem('lifesync-visited', 'true');
    }
  }, [initializeData]);

  // ゲーミフィケーション統計の定期更新を最適化
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadGamificationStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // カレンダーデータの読み込みを型安全に
  const loadCalendarData = useCallback(async (): Promise<void> => {
    setIsLoadingCalendar(true);
    try {
      // 実際の実装では、カレンダーAPIからデータを取得
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'プロジェクトレビュー',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          type: 'meeting',
        },
        {
          id: '2',
          title: '月次報告会',
          start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          type: 'meeting',
        },
        {
          id: '3',
          title: 'タスクA期限',
          start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
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
  }, []);

  // ゲーミフィケーション統計の読み込みを型安全に
  const loadGamificationStats = useCallback((): void => {
    try {
      const savedPlayerStats = localStorage.getItem('playerStats');
      const savedTasks = localStorage.getItem('dailyTasks');
      const savedAchievements = localStorage.getItem('achievements');

      if (savedPlayerStats) {
        const playerStats = JSON.parse(savedPlayerStats);

        let todayTasksCompleted = 0;
        let todayTasksTotal = 0;

        if (savedTasks) {
          const tasks = JSON.parse(savedTasks);
          const today = new Date().toDateString();

          tasks.forEach((task: any) => {
            if (task.completedAt && new Date(task.completedAt).toDateString() === today) {
              todayTasksCompleted++;
            }
            if (
              task.isHabit ||
              (task.completedAt && new Date(task.completedAt).toDateString() === today)
            ) {
              todayTasksTotal++;
            }
          });
        }

        let unlockedBadges = 0;
        let totalBadges = 0;

        if (savedAchievements) {
          const achievements = JSON.parse(savedAchievements);
          achievements.forEach((achievement: any) => {
            totalBadges++;
            if (achievement.unlocked) {
              unlockedBadges++;
            }
          });
        }

        setGamificationStats({
          level: playerStats.level || 1,
          currentXP: playerStats.currentXP || 0,
          xpToNextLevel: playerStats.xpToNextLevel || 100,
          totalXP: playerStats.totalXP || 0,
          streakDays: playerStats.streakDays || 0,
          todayTasksCompleted,
          todayTasksTotal: Math.max(todayTasksTotal, 10),
          weeklyXP: playerStats.weeklyXP || 0,
          unlockedBadges,
          totalBadges: Math.max(totalBadges, 20),
        });
      }
    } catch (error) {
      console.error('Failed to load gamification stats:', error);
      toast.error('ゲーミフィケーション統計の読み込みに失敗しました');
    }
  }, []);

  // 連続記録の計算を最適化
  const calculateStreakDays = useCallback((): number => {
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
  }, [safeTodos]);

  // 統合統計データの計算を最適化
  const calculateIntegratedStats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();

    const todayTasks = safeTodos.filter((todo) => {
      const createdDate = todo.createdAt ? new Date(todo.createdAt).toDateString() : todayStr;
      return createdDate === todayStr;
    });

    const completedToday = todayTasks.filter((todo) => todo.completed).length;
    const totalToday = todayTasks.length;
    const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const thisWeekEvents = calendarEvents.filter(
      (event) => event.start >= weekStart && event.start <= weekEnd
    ).length;

    return [
      {
        title: `レベル ${gamificationStats.level}`,
        value: `${gamificationStats.currentXP}/${gamificationStats.xpToNextLevel} XP`,
        icon: <Trophy className="h-6 w-6" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        progress: Math.round((gamificationStats.currentXP / gamificationStats.xpToNextLevel) * 100),
        change: { value: gamificationStats.weeklyXP, period: t('home.weekly_xp_gained') },
      },
      {
        title: t('home.game_tasks'),
        value: `${gamificationStats.todayTasksCompleted}/${gamificationStats.todayTasksTotal}`,
        icon: <Gamepad2 className="h-6 w-6" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        progress: Math.round(
          (gamificationStats.todayTasksCompleted / gamificationStats.todayTasksTotal) * 100
        ),
        change: {
          value: gamificationStats.todayTasksCompleted >= 5 ? 15 : -5,
          period: t('home.yesterday'),
        },
      },
      {
        title: t('home.streak'),
        value: `${gamificationStats.streakDays}${t('home.days')}`,
        icon: <Flame className="h-6 w-6" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        progress: Math.round((gamificationStats.streakDays / 30) * 100),
        change: {
          value: gamificationStats.streakDays >= 3 ? 10 : 0,
          period: t('home.target_30_days'),
        },
      },
      {
        title: t('home.badges'),
        value: `${gamificationStats.unlockedBadges}/${gamificationStats.totalBadges}`,
        icon: <Crown className="h-6 w-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        progress: Math.round(
          (gamificationStats.unlockedBadges / gamificationStats.totalBadges) * 100
        ),
        change: { value: 2, period: t('home.new_this_month') },
      },
      {
        title: 'Todo完了',
        value: totalToday > 0 ? `${completedToday}/${totalToday}` : '0',
        icon: <CheckCircle className="h-6 w-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        progress: completionRate,
        change: { value: completionRate >= 70 ? 12 : -5, period: '先週比' },
      },
      {
        title: '生産性スコア',
        value: `${Math.max(completionRate, 50)}%`,
        icon: <TrendingUp className="h-6 w-6" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        progress: Math.max(completionRate, 50),
        change: { value: 5, period: '今月平均' },
      },
    ];
  }, [safeTodos, calendarEvents, gamificationStats, t]);

  // 時間表示ユーティリティ関数を最適化
  const getTimeAgo = useCallback((date: Date): string => {
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
  }, []);

  const getTimeUntil = useCallback((date: Date): string => {
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
  }, []);

  // 統合アクティビティの取得を最適化
  const getIntegratedActivities = useCallback((): ActivityData[] => {
    const activities: ActivityData[] = [];

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
  }, [safeTodos, calendarEvents, getTimeAgo, getTimeUntil]);

  // ナビゲーション関数を最適化
  const handleTaskSelect = useCallback(
    (taskId: string) => {
      if (taskId && taskId !== 'default-task') {
        navigate(`/todos?highlight=${taskId}`);
      } else {
        navigate('/todos');
      }
    },
    [navigate]
  );

  // 緊急アラートの取得を最適化
  const getUrgentAlerts = useCallback((): AlertData[] => {
    const alerts: AlertData[] = [];
    const now = new Date();

    const overdueTasks = safeTodos.filter((todo) => {
      if (!todo.deadline || todo.completed) return false;
      return new Date(todo.deadline) < now;
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
      return deadline.toDateString() === now.toDateString();
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
  }, [safeTodos, navigate]);

  // カスタムイベントハンドラーを最適化
  const handleLifeSupportAction = useCallback((action: string) => {
    const event = new CustomEvent('openLifeSupportBot', {
      detail: { action },
    });
    window.dispatchEvent(event);
  }, []);

  // データ更新を最適化
  const handleRefresh = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([dispatch(fetchTodoItems()), loadCalendarData(), loadGamificationStats()]);
      toast.success('データを更新しました');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('更新に失敗しました');
    }
  }, [dispatch, loadCalendarData, loadGamificationStats]);

  const stats = calculateIntegratedStats;
  const activities = getIntegratedActivities();
  const alerts = getUrgentAlerts();

  // 早期リターンでパフォーマンス向上
  if (!isAuthenticated) {
    return (
      <PageLayout title="ログインが必要です" subtitle="アクセスするにはログインしてください">
        <div className="text-center py-8">
          <Button onClick={() => navigate('/login')}>ログイン</Button>
        </div>
      </PageLayout>
    );
  }

  const renderContent = () => (
    <>
      {/* 統一ダッシュボード */}
      <div className="mb-8">
        <UnifiedHomeDashboard compactMode={isMobile} showWelcome={true} enableAnimations={true} />
      </div>

      {/* ライフサポート - クイックアクセス */}
      <div className="mb-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-50 via-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 shadow-lg">
                  <span className="text-2xl">🤗</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    今、何をすべきか迷っていませんか？
                  </h3>
                  <p className="text-sm text-gray-600">
                    誰でも幸せな人生を送れるよう、AIが最適なサポートを提供します
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLifeSupportAction('life-support')}
                  className="bg-white border-pink-300 hover:bg-pink-50 text-pink-800"
                >
                  🤗 相談する
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLifeSupportAction('daily-plan')}
                  className="bg-white border-orange-300 hover:bg-orange-50 text-orange-800"
                >
                  🌅 今日の計画
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLifeSupportAction('emergency-help')}
                  className="bg-white border-red-300 hover:bg-red-50 text-red-800"
                >
                  🚨 緊急時
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 使い方ガイド - 初回訪問または手動表示 */}
      {(showGuide || isFirstVisit) && (
        <div className="mb-6">
          <DashboardGuide
            onClose={() => {
              setShowGuide(false);
              setIsFirstVisit(false);
            }}
            className="max-w-4xl mx-auto"
          />
        </div>
      )}

      {/* 使い方ガイドトリガー + Language Test Links */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGuide(true)}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 flex items-center gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          📖 使い方ガイド
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/quick-language-test')}
          className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:from-green-100 hover:to-blue-100"
        >
          🚀 Quick Language Test
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/language-test')}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
        >
          🌍 Advanced Language Test
        </Button>
      </div>

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

      {/* 資産形成クエスト */}
      <div className="mb-8">
        <Card
          className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/asset-quest')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    🏰 {t('home.asset_formation_quest')}
                  </h3>
                  <p className="text-slate-600">{t('home.asset_quest_description')}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      💰 {t('home.household_management')}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      🐉 {t('home.dr_quest_bot')}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700">
                      📈 {t('home.asset_visualization')}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('home.quest_start')}
                </Button>
                <p className="text-xs text-slate-500 mt-2">{t('home.dr_quest_support')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 統一システムナビゲーション - Layout.tsxのサイドメニューで管理されるため削除 */}

      {/* 統合タスクダッシュボード */}
      <div className="mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                {t('home.integrated_task_dashboard')}
                <Badge variant="outline" className="ml-2 bg-white/50">
                  レベル {gamificationStats.level}
                </Badge>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/gamification')}
                  className="flex items-center gap-2 bg-white/70 hover:bg-white/90"
                >
                  <Gamepad2 className="h-4 w-4" />
                  {t('home.game')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/todos')}
                  className="flex items-center gap-2 bg-white/70 hover:bg-white/90"
                >
                  <CheckSquare className="h-4 w-4" />
                  {t('home.todo_management')}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {gamificationStats.currentXP} / {gamificationStats.xpToNextLevel} XP
                  </p>
                  <Progress
                    value={Math.round(
                      (gamificationStats.currentXP / gamificationStats.xpToNextLevel) * 100
                    )}
                    className="h-2 bg-white/50 mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{t('home.streak')}</p>
                  <p className="text-lg font-bold text-orange-600">
                    {gamificationStats.streakDays}
                    {t('home.days')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{t('home.today_tasks')}</p>
                  <p className="text-lg font-bold text-green-600">
                    {gamificationStats.todayTasksCompleted}/{gamificationStats.todayTasksTotal}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{t('home.badges')}</p>
                  <p className="text-lg font-bold text-purple-600">
                    {gamificationStats.unlockedBadges}/{gamificationStats.totalBadges}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DailyMotivationGamification />
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* 左側：AIタスク提案 */}
        <div className="xl:col-span-1">
          <NextTaskSuggestionComponent
            todos={safeTodos}
            calendarEvents={calendarEvents}
            onTaskSelect={handleTaskSelect}
            className="h-fit"
          />
        </div>

        {/* 右側：AI提案とクイックアクション */}
        <div className="xl:col-span-1 space-y-6">
          {/* クイックToDo追加 */}
          <Card className="border-0 shadow-md bg-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                クイックタスク追加
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  統合タスクダッシュボードで全てのタスクを管理できます。
                  上記のダッシュボードからタスクを追加・管理してください。
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/todos')}
                    className="flex items-center gap-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    詳細ToDo管理
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/gamification')}
                    className="flex items-center gap-2"
                  >
                    <Gamepad2 className="h-4 w-4" />
                    ゲーム詳細
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 統計サマリー */}
          <Card className="border-0 shadow-md bg-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                {t('home.today_progress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('home.level_progress')}</span>
                  <span className="font-semibold">Lv.{gamificationStats.level}</span>
                </div>
                <Progress
                  value={Math.round(
                    (gamificationStats.currentXP / gamificationStats.xpToNextLevel) * 100
                  )}
                  className="h-2"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{gamificationStats.currentXP} XP</span>
                  <span>{gamificationStats.xpToNextLevel} XP</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-lg font-bold text-orange-600">
                        {gamificationStats.streakDays}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {t('home.days')} {t('home.streak')}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Crown className="h-4 w-4 text-purple-500" />
                      <span className="text-lg font-bold text-purple-600">
                        {gamificationStats.unlockedBadges}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{t('home.badges')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 追加コンテンツ：アクティビティとカレンダー */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* 最近のアクティビティ */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              {t('home.recent_activity')}
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600">
                {t('home.integrated_view')}
              </Badge>
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
                            {activity.type === 'calendar' && <Calendar className="h-3 w-3 mr-1" />}
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
                calendarEvents.slice(0, 3).map((event) => (
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

      {/* クイックアクションセクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <Crown className="h-6 w-6" />,
            title: '🏰 資産形成クエスト',
            description: '毎月の収支管理でレベルアップ',
            path: '/asset-quest',
            gradient: 'from-green-500 to-emerald-600',
          },
          {
            icon: <Gamepad2 className="h-6 w-6" />,
            title: 'ゲーミフィケーション',
            description: 'レベルアップとバッジ獲得',
            path: '/gamification',
            gradient: 'from-purple-500 to-pink-500',
          },
          {
            icon: <Brain className="h-6 w-6" />,
            title: '🚀 AI強化ゲーミフィケーション（進化版）',
            description: 'リアルタイム感情分析・予測・スマートコーチング',
            path: '/ai-gamification',
            gradient: 'from-blue-500 via-purple-500 to-pink-500',
          },
          {
            icon: <Trophy className="h-6 w-6" />,
            title: 'バッジコレクション',
            description: 'アチーブメント確認',
            path: '/badge-completion',
            gradient: 'from-yellow-500 to-orange-500',
          },
          {
            icon: <CheckSquare className="h-6 w-6" />,
            title: 'ToDo管理',
            description: 'タスクの詳細管理',
            path: '/todos',
            gradient: 'from-green-500 to-green-600',
          },
          {
            icon: <Target className="h-6 w-6" />,
            title: '🎯 ADHD実行力支援',
            description: '計画から実行まで細かくサポート',
            path: '/adhd-execution',
            gradient: 'from-purple-500 to-pink-600',
          },
          {
            icon: <Clock className="h-6 w-6" />,
            title: '勤怠記録',
            description: '今日の作業を記録',
            path: '/work-time',
            gradient: 'from-teal-500 to-cyan-600',
          },
          {
            icon: <BarChart3 className="h-6 w-6" />,
            title: 'レポート分析',
            description: '生産性の分析',
            path: '/work-time-reports',
            gradient: 'from-emerald-500 to-emerald-600',
          },
          {
            icon: <AlertTriangle className="h-6 w-6" />,
            title: '🔍 固定データ分析',
            description: 'ハードコード箇所の可視化',
            path: '/hardcoded-data',
            gradient: 'from-red-500 to-pink-600',
          },
          {
            icon: <BarChart3 className="h-6 w-6" />,
            title: '📊 カバレッジレポート',
            description: 'テストカバレッジの詳細分析',
            path: '/coverage-report',
            gradient: 'from-indigo-500 to-purple-600',
          },
          {
            icon: <Shield className="h-6 w-6" />,
            title: '🛡️ 衝動抑制システム',
            description: '睡眠時間を守り生活バランスを保護',
            path: '/impulse-control',
            gradient: 'from-blue-500 to-indigo-600',
          },
          {
            icon: <HelpCircle className="h-6 w-6" />,
            title: '📖 使い方ガイド',
            description: 'LifeSyncの機能を詳しく学ぶ',
            path: '#',
            gradient: 'from-gray-500 to-slate-600',
          },
        ].map((action, index) => (
          <EnhancedCard
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            gradient={action.gradient}
            action={{
              text: action.title.includes('使い方ガイド') ? '表示' : '開く',
              onClick: () => {
                if (action.path === '#') {
                  setShowGuide(true);
                } else {
                  navigate(action.path);
                }
              },
            }}
          />
        ))}
      </div>

      {/* プレミアム機能の案内 */}
      {!hasActiveSubscription && (
        <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50 mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  プレミアムゲーミフィケーション
                </h3>
                <p className="text-slate-600">
                  より多くのバッジ、専用チャレンジ、チーム競争などの特別機能をお楽しみください
                </p>
                <ul className="text-sm text-slate-500 mt-2 space-y-1">
                  <li>• 限定バッジとアチーブメント</li>
                  <li>• カスタムチャレンジ作成</li>
                  <li>• チーム対戦モード</li>
                  <li>• 詳細統計とランキング</li>
                  <li>• AI提案とWBS統合分析</li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/subscription-management')}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-700"
              >
                <Gem className="h-4 w-4 mr-2" />
                プレミアム開始
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 新機能ハイライト */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 mt-8">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              🚀 NEW: AI強化ゲーミフィケーション（進化版）
            </h3>
            <p className="text-gray-600">次世代のAI技術で、あなたに最適化されたゲーム体験を提供</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">リアルタイムAI分析</h4>
              <p className="text-sm text-gray-600">
                行動パターン・感情状態・ストレスレベルをAIが常時分析
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">予測分析</h4>
              <p className="text-sm text-gray-600">
                バーンアウトリスク予測・最適作業パターン・パフォーマンス傾向
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">スマートコーチング</h4>
              <p className="text-sm text-gray-600">
                パーソナライズされたアドバイス・介入タイミング・成長戦略
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button
              onClick={() => navigate('/ai-gamification')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Zap className="w-5 h-5" />
              進化版を体験する
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <PageLayout
      title={`${t('home.greeting')}, ${user?.name || t('common.user')}!`}
      subtitle={t('home.subtitle')}
      badge={{
        text: hasActiveSubscription ? t('home.premium') : t('home.free'),
        variant: hasActiveSubscription ? 'default' : 'secondary',
      }}
      headerGradient
    >
      {isMobile ? (
        <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
          <div className="container mx-auto px-4 py-8">{renderContent()}</div>
        </PullToRefresh>
      ) : (
        <div className="container mx-auto px-4 py-8">{renderContent()}</div>
      )}
    </PageLayout>
  );
};

export default Home;
