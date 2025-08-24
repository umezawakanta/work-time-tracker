/**
 * 🏠 統一ホームダッシュボード
 * Work Time Tracker の核心価値を即座に体験できるメインページ
 */

import React, { useState, useEffect, useMemo } from 'react';
import { trackPageViewHome } from '@/lib/track';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems } from '@/store/todoSlice';
import { selectAllTodos } from '@/components/dailyToDoReminder/store/selectors/todoSelectors';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import Hero from '@/components/hero/Hero';
import Benefits from '@/components/hero/Benefits';
import HowItWorks from '@/components/hero/HowItWorks';
import WeeklyReportPreview from '@/components/home/WeeklyReportPreview';
import UserStories from '@/components/home/UserStories';
import FocusTimerQuick from '@/components/home/FocusTimerQuick';
import { ensureOwnReferralCode, buildOwnInviteUrl } from '@/services/share/referral';

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
  const pz = usePersonalization(user as any);

  // Redux state
  const todos = useSelector(selectAllTodos);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // Local state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNextStep, setShowNextStep] = useState(false);
  const [ownRef, setOwnRef] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    trackPageViewHome();
    if (isAuthenticated) {
      initializeDashboard();
    }
  }, [isAuthenticated]);

  // Onboarding modal (first visit → link to /assessments)
  useEffect(() => {
    try {
      const key = 'onboarding:assessments_shown';
      const shown = localStorage.getItem(key) === 'true';
      if (!shown) {
        setShowOnboarding(true);
        localStorage.setItem(key, 'true');
      }
      // Next step card
      const nextStep = localStorage.getItem('next_step_card') === 'true';
      setShowNextStep(nextStep);
      // Referral banner
      const code = ensureOwnReferralCode();
      setOwnRef(code || null);
    } catch {}
  }, []);

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
    try {
      const today = new Date().toDateString();

      // 安全な null/undefined チェックを追加
      const validTodos = todos.filter((todo) => todo != null && typeof todo === 'object');

      const todayTodos = validTodos.filter((todo) => {
        if (!todo.createdAt) return false;
        try {
          const todoDate = new Date(todo.createdAt);
          return !isNaN(todoDate.getTime()) && todoDate.toDateString() === today;
        } catch (error) {
          console.warn('Invalid date format in todo:', todo.createdAt);
          return false;
        }
      });

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

        const dayCompleted = validTodos.some((todo) => {
          if (!todo.completed) return false;
          try {
            return false;
          } catch (error) {
            console.warn('Invalid completedDate format in todo');
            return false;
          }
        });

        if (dayCompleted) streakDays++;
        else break;
      }

      // Simple gamification stats
      const totalCompleted = validTodos.filter((todo) => todo.completed).length;
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
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      // デフォルト値を設定
      setStats({
        tasksCompleted: 0,
        totalTasks: 1,
        completionRate: 0,
        streakDays: 0,
        currentLevel: 1,
        xp: 0,
        nextLevelXP: 250,
        badgesEarned: 0,
        totalBadges: 20,
      });
    }
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
      {/* Onboarding Modal */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>最初の一歩: 自己診断を実施</DialogTitle>
            <DialogDescription>
              5〜10分でIQ/MBTIを把握し、AI秘書をあなた用に最適化します。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowOnboarding(false)}
                aria-label="あとで"
              >
                あとで
              </Button>
              <Button
                onClick={() => {
                  setShowOnboarding(false);
                  navigate('/assessments');
                }}
                aria-label="自己診断を始める"
              >
                自己診断を始める
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Mission Hero (copy refreshed) */}
      <div className="bg-gradient-to-b from-white to-blue-50 border-b">
        <div className="container mx-auto px-4 max-w-7xl py-14 md:py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            人生のコントロールを取り戻そう
          </h1>
          <p className="text-sm font-semibold text-emerald-600 mb-2">無料で始める</p>
          <p className="text-base md:text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            生成AIと連携したパーソナル秘書サービスで、計画・仕事・学習・自己診断までを一元管理。
            IQ/MBTIなどの診断結果に基づいて、あなた専用に最適化された体験を提供します。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="px-6 py-6 text-base md:text-lg"
              onClick={() => navigate('/ai-assistant')}
              aria-label="AI秘書を使う"
            >
              AI秘書を使う
            </Button>
            <Button
              variant="outline"
              className="px-6 py-6 text-base md:text-lg"
              onClick={() => navigate('/assessments')}
              aria-label="自己診断を始める"
            >
              自己診断を始める
              <Badge variant="secondary" className="ml-2 align-middle">
                5–10分
              </Badge>
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">無料・匿名OK・いつでも退会可能</p>
        </div>
      </div>

      {/* 3 Benefits (with lazy images for LCP optimization below-the-fold) */}
      <div className="container mx-auto px-4 max-w-7xl py-10">
        {ownRef && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <div className="text-sm text-gray-800">
                  友だちを招待して一緒に始めよう（あなたの招待コード: {ownRef}）
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        const url = buildOwnInviteUrl();
                        if (navigator.share) {
                          await navigator.share({ title: 'AI秘書と自己診断', url });
                        } else {
                          await navigator.clipboard.writeText(url);
                          toast.success('招待リンクをコピーしました');
                        }
                      } catch {}
                    }}
                    aria-label="招待リンクを共有"
                  >
                    招待を送る
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/invite')}
                    aria-label="招待ページを開く"
                  >
                    詳細を見る
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {showNextStep && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
              <CardContent className="p-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div className="text-sm text-gray-800">
                  明日の次の一手: 「AI秘書で今日の計画を1分で作成」
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate('/ai-assistant')}
                    aria-label="AI秘書を開く"
                  >
                    開く
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      try {
                        localStorage.removeItem('next_step_card');
                      } catch {}
                      setShowNextStep(false);
                    }}
                    aria-label="非表示にする"
                  >
                    非表示
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 border shadow-sm">
            <CardContent className="p-6">
              <img
                src="/icons/icon-128x128.svg"
                alt="人生の再設計"
                loading="lazy"
                width="64"
                height="64"
                className="mb-4 mx-auto"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">人生の再設計</h3>
              <p className="text-gray-600 text-sm text-center">
                衝動に流されない日々を。AIが時間配分と優先順位を設計し、再現可能な習慣へ導きます。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border shadow-sm">
            <CardContent className="p-6">
              <img
                src="/icons/icon-128x128.svg"
                alt="統合管理"
                loading="lazy"
                width="64"
                height="64"
                className="mb-4 mx-auto"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">統合管理</h3>
              <p className="text-gray-600 text-sm text-center">
                タスク、予定、学習、自己診断、記録をひとつのハブに。もう他のアプリは不要です。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border shadow-sm">
            <CardContent className="p-6">
              <img
                src="/icons/icon-128x128.svg"
                alt="AI学習"
                loading="lazy"
                width="64"
                height="64"
                className="mb-4 mx-auto"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">AI学習</h3>
              <p className="text-gray-600 text-sm text-center">
                ビジネススクールの要点をAIが自動要約。IQ/MBTIに合わせたカリキュラムで効率良く学ぶ。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <HowItWorks />
      <div className="container mx-auto px-4 max-w-7xl mb-8">
        <WeeklyReportPreview />
        <div className="mt-8">
          <UserStories />
        </div>
        <div className="mt-8">
          <FocusTimerQuick />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section (subsequent heading after Hero's h1) */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {getWelcomeMessage()}, {user?.name || 'ユーザー'}さん！
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            {pz.prefersPlanning
              ? '今日の時間割を確認し、計画通りに進めましょう'
              : 'まずは優先タスクを1つだけ着手しましょう'}
          </p>

          {/* Level badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-lg"
            role="status"
            aria-label="ユーザーレベル"
          >
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

      {/* Bottom CTA duplicate */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 max-w-7xl py-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">今日からはじめよう</h2>
          <p className="text-gray-600 mb-6">AI秘書と自己診断で、最短60秒の一歩から。</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="px-6 py-6 text-base md:text-lg"
              onClick={() => navigate('/ai-assistant')}
              aria-label="AI秘書を使う"
            >
              AI秘書を使う
            </Button>
            <Button
              variant="outline"
              className="px-6 py-6 text-base md:text-lg"
              onClick={() => navigate('/assessments')}
              aria-label="自己診断を始める"
            >
              自己診断を始める
              <Badge variant="secondary" className="ml-2 align-middle">
                5–10分
              </Badge>
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">無料・匿名OK・いつでも退会可能</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
