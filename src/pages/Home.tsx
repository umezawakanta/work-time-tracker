/**
 * 🏠 統一ホームダッシュボード
 * Work Time Tracker の核心価値を即座に体験できるメインページ
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems } from '@/store/todoSlice';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Target,
  CheckCircle,
  Trophy,
  TrendingUp,
  Brain,
  Calendar,
  Zap,
  Star,
  Flame,
  Crown,
  Plus,
  ArrowRight,
  BarChart3,
  Users,
  Shield,
  Sparkles,
  PlayCircle,
  BookOpen,
  Gamepad2,
  Activity,
  Home as HomeIcon,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  streakDays: number;
  currentLevel: number;
  xp: number;
  nextLevelXP: number;
  badgesEarned: number;
  totalBadges: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  gradient: string;
  featured?: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useAuth();

  // Redux state
  const todos = useSelector((state: RootState) => state.todo.items) || [];
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // Local state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    if (isAuthenticated) {
      initializeDashboard();
    }
  }, [isAuthenticated]);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      await dispatch(fetchTodoItems());
      calculateStats();
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
      toast.error('ダッシュボードの初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate real stats from data
  const calculateStats = () => {
    const today = new Date().toDateString();

    const todayTodos = todos.filter(
      (todo) => todo.createdAt && new Date(todo.createdAt).toDateString() === today
    );

    const completedToday = todayTodos.filter((todo) => todo.completed).length;
    const totalToday = Math.max(todayTodos.length, 1);
    const completionRate = Math.round((completedToday / totalToday) * 100);

    // Calculate streak (simple implementation)
    let streakDays = 0;
    const recentDays = 7;
    for (let i = 0; i < recentDays; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dayStr = checkDate.toDateString();

      const dayCompleted = todos.some(
        (todo) =>
          todo.completed &&
          todo.completedDate &&
          new Date(todo.completedDate).toDateString() === dayStr
      );

      if (dayCompleted) streakDays++;
      else break;
    }

    // Simple gamification stats
    const totalCompleted = todos.filter((todo) => todo.completed).length;
    const currentLevel = Math.floor(totalCompleted / 10) + 1;
    const xp = totalCompleted * 25;
    const nextLevelXP = currentLevel * 250;
    const badgesEarned = Math.floor(totalCompleted / 5);

    setStats({
      tasksCompleted: completedToday,
      totalTasks: totalToday,
      completionRate,
      streakDays,
      currentLevel,
      xp,
      nextLevelXP,
      badgesEarned,
      totalBadges: 20,
    });
  };

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      id: 'todos',
      title: 'タスク管理',
      description: 'やることを整理して効率的に進めよう',
      icon: <CheckCircle className="w-6 h-6" />,
      path: '/todos',
      color: 'text-emerald-600',
      gradient: 'from-emerald-500 to-teal-600',
      featured: true,
    },
    {
      id: 'gamification',
      title: 'ゲーミフィケーション',
      description: 'レベルアップとバッジでモチベーション向上',
      icon: <Trophy className="w-6 h-6" />,
      path: '/gamification',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-pink-600',
      featured: true,
    },
    {
      id: 'work-time',
      title: '勤怠管理',
      description: '作業時間を記録して生産性を把握',
      icon: <Clock className="w-6 h-6" />,
      path: '/work-time',
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'calendar',
      title: 'カレンダー',
      description: 'スケジュール管理とプランニング',
      icon: <Calendar className="w-6 h-6" />,
      path: '/calendar',
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'reports',
      title: 'レポート分析',
      description: '生産性の傾向を分析・改善',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/work-time-reports',
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      id: 'ai-gamification',
      title: 'AI強化ゲーミフィケーション',
      description: 'AI技術で最適化されたゲーム体験',
      icon: <Brain className="w-6 h-6" />,
      path: '/ai-gamification',
      color: 'text-pink-600',
      gradient: 'from-pink-500 to-rose-600',
    },
  ];

  // Welcome message based on time
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'おはようございます';
    if (hour < 18) return 'こんにちは';
    return 'こんばんは';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <HomeIcon className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Work Time Tracker</h1>
            <p className="text-gray-600 mb-6">ログインしてダッシュボードにアクセスしてください</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              ログイン
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ダッシュボードを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {getWelcomeMessage()}, {user?.name || 'ユーザー'}さん！
          </h1>
          <p className="text-xl text-gray-600 mb-6">今日も生産性を向上させていきましょう</p>

          {/* Level badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-lg">
            <Crown className="w-5 h-5" />
            レベル {stats.currentLevel}
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Tasks Progress */}
          <Card className="bg-white/70 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">今日</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.tasksCompleted}/{stats.totalTasks}
              </h3>
              <p className="text-gray-600 text-sm mb-3">タスク完了</p>
              <Progress value={stats.completionRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">{stats.completionRate}% 完了</p>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="bg-white/70 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <Badge className="bg-orange-100 text-orange-700">連続</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.streakDays}</h3>
              <p className="text-gray-600 text-sm mb-3">日間継続</p>
              <div className="flex items-center gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-3 h-3 rounded-full',
                      i < stats.streakDays ? 'bg-orange-500' : 'bg-gray-200'
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* XP Progress */}
          <Card className="bg-white/70 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-700">XP</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.xp}</h3>
              <p className="text-gray-600 text-sm mb-3">経験値</p>
              <Progress value={((stats.xp % 250) / 250) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                次のレベルまで {stats.nextLevelXP - stats.xp} XP
              </p>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="bg-white/70 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">バッジ</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.badgesEarned}/{stats.totalBadges}
              </h3>
              <p className="text-gray-600 text-sm mb-3">獲得済み</p>
              <Progress value={(stats.badgesEarned / stats.totalBadges) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {Math.round((stats.badgesEarned / stats.totalBadges) * 100)}% コンプリート
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            クイックアクション
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Card
                key={action.id}
                className={cn(
                  'group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105',
                  action.featured
                    ? 'bg-gradient-to-br from-white via-white to-blue-50'
                    : 'bg-white/70 backdrop-blur'
                )}
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        'p-3 rounded-xl bg-gradient-to-r',
                        action.gradient,
                        'shadow-lg'
                      )}
                    >
                      <div className="text-white">{action.icon}</div>
                    </div>
                    {action.featured && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        おすすめ
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{action.description}</p>

                  <div className="flex items-center justify-between">
                    <span className={cn('text-sm font-medium', action.color)}>開始する</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* AI Enhancement */}
          <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI強化機能</h3>
                  <Badge className="bg-blue-100 text-blue-700">NEW</Badge>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                AIがあなたの行動パターンを分析し、最適なタスク提案と生産性向上をサポートします
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">行動分析</p>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">最適化提案</p>
                </div>
              </div>

              <Button
                onClick={() => navigate('/ai-gamification')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                AI機能を体験
              </Button>
            </CardContent>
          </Card>

          {/* Community */}
          <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">コミュニティ機能</h3>
                  <Badge className="bg-emerald-100 text-emerald-700">準備中</Badge>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                他のユーザーと進捗を共有し、モチベーションを高め合うコミュニティに参加しましょう
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <Trophy className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">ランキング</p>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <Shield className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">チーム戦</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                disabled
              >
                近日公開予定
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Premium CTA */}
        {!hasActiveSubscription && (
          <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 border-0 shadow-2xl text-white">
            <CardContent className="p-8 text-center">
              <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-200" />
              <h3 className="text-2xl font-bold mb-4">プレミアムでさらに強力に</h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                限定バッジ、高度なAI分析、チーム機能など、プレミアム限定の機能で生産性を次のレベルへ
              </p>
              <Button
                onClick={() => navigate('/subscription-management')}
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-3"
              >
                プレミアムを始める
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Add Todo */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => navigate('/todos')}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
