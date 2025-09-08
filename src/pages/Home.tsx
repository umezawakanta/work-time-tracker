/**
 * 🏠 統一ホームダッシュボード
 * Work Time Tracker の核心価値を即座に体験できるメインページ
 */

import React, { useState, useEffect, useMemo } from 'react';
import { trackPageViewHome } from '@/lib/track';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems } from '@/store/todoSlice';
import { selectAllTodos } from '@/components/dailyToDoReminder/store/selectors/todoSelectors';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import SocialProof from '@/components/home/SocialProof';
import MagicLinkCta from '@/components/home/MagicLinkCta';
import InstallBanner from '@/components/pwa/InstallBanner';
import InlineNPS from '@/components/feedback/InlineNPS';
import VersionInfo from '@/components/footer/VersionInfo';
import { ensureOwnReferralCode, buildOwnInviteUrl } from '@/services/share/referral';
import { getVariant } from '@/lib/ab';
import { useAnalytics } from '@/lib/analytics';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import IntegratedDashboard from '@/pages/IntegratedDashboard';
import {
  isFeatureAccessible,
  getFeatureByPath,
  FeatureStatus,
  featuresRegistry,
} from '@/config/features';
import { NEW_STATUS_ORDER } from '@/services/dev/featureStatusEngine';
import {
  generateDevProgressShareText,
  openShare,
  getCanonicalUrl,
} from '@/services/share/generateDevProgressShareText';

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
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [showNextStep, setShowNextStep] = useState(false);
  const [ownRef, setOwnRef] = useState<string | null>(null);
  const [showDailyNudge, setShowDailyNudge] = useState(false);
  const [showStreakNudge, setShowStreakNudge] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSending, setNewsletterSending] = useState(false);
  const { trackEvent } = useAnalytics();

  const isFeatureCompleteVisible = (path: string): boolean => {
    try {
      const f = getFeatureByPath(path);
      if (!f) return false;
      if ((f as any).disabled) return false;
      return f.status === 'complete';
    } catch {
      return false;
    }
  };

  // Tabs: sync with ?tab=
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabParam = searchParams.get('tab');
  const initialTab: 'home' | 'dashboard' = initialTabParam === 'dashboard' ? 'dashboard' : 'home';
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard'>(initialTab);

  useEffect(() => {
    const param = searchParams.get('tab');
    const next = param === 'dashboard' ? 'dashboard' : 'home';
    if (next !== activeTab) setActiveTab(next);
  }, [searchParams, activeTab]);

  const handleTabChange = (value: string) => {
    const next = value === 'dashboard' ? 'dashboard' : 'home';
    setActiveTab(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'home') params.delete('tab');
    else params.set('tab', 'dashboard');
    setSearchParams(params, { replace: true });
  };

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
      // 3ステップオンボーディング（初回のみ）
      const completed = localStorage.getItem('onboarding:tour_completed') === 'true';
      if (!completed) {
        setOnboardingStep(1);
        setShowOnboarding(true);
        // 旧キーがある場合は新ツアーに統合
        localStorage.setItem('onboarding:assessments_shown', 'true');
      }
      // Next step card
      const nextStep = localStorage.getItem('next_step_card') === 'true';
      setShowNextStep(nextStep);
      // Referral banner
      const code = ensureOwnReferralCode();
      setOwnRef(code || null);

      // Daily nudge banner
      const today = new Date().toISOString().slice(0, 10);
      const lastShown = localStorage.getItem('nudge:last_shown');
      if (lastShown !== today) setShowDailyNudge(true);
      if (showDailyNudge) {
        trackEvent('daily_nudge_viewed', { day: today });
      }
    } catch {}
  }, []);

  // オンボーディングステップのトラッキング
  useEffect(() => {
    if (!showOnboarding) return;
    try {
      trackEvent('onboarding_step_view', { step: onboardingStep });
    } catch {}
  }, [showOnboarding, onboardingStep]);

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
          try {
            // Completed flag first
            if (!todo.completed) return false;
            const completedDateRaw =
              (todo as any).completedDate ?? (todo as any).completedAt ?? (todo as any).updatedAt;
            if (completedDateRaw) {
              const d = new Date(completedDateRaw);
              if (!isNaN(d.getTime()) && d.toDateString() === dayStr) return true;
            }
            const createdAtRaw = (todo as any).createdAt;
            if (createdAtRaw) {
              const d2 = new Date(createdAtRaw);
              if (!isNaN(d2.getTime()) && d2.toDateString() === dayStr) return true;
            }
            return false;
          } catch (error) {
            console.warn('Invalid date on todo when computing streak');
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

  // Streak milestone nudge (e.g., 7/10/30 days)
  useEffect(() => {
    if (!stats) return;
    try {
      const nextMilestones = [7, 10, 30];
      const next = stats.streakDays + 1;
      const today = new Date().toISOString().slice(0, 10);
      const lastShownKey = 'streak:nudge:last_date';
      const lastShown = localStorage.getItem(lastShownKey);
      const shouldShow = nextMilestones.includes(next) && lastShown !== today;
      setShowStreakNudge(shouldShow);
      if (shouldShow) {
        trackEvent('streak_milestone_nudge_view', { next });
      }
    } catch {}
  }, [stats?.streakDays]);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      id: 'daily-10-tasks',
      title: '毎日20のこと',
      description: '毎日必ずやる20のタスクを管理',
      icon: <CheckCircle className="w-6 h-6" />,
      path: '/daily-10-tasks',
      color: 'text-green-600',
      gradient: 'from-green-500 to-emerald-600',
      featured: true,
    },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style>{`
        /* ホームページ専用のモバイルファーストスタイル */
        
        /* モバイルでの下部ナビゲーションとの重なり防止 */
        @media (max-width: 768px) {
          body {
            padding-bottom: calc(6rem + env(safe-area-inset-bottom)) !important;
            margin-bottom: calc(6rem + env(safe-area-inset-bottom)) !important;
          }
          
          .min-h-screen {
            min-height: calc(100vh - 6rem - env(safe-area-inset-bottom)) !important;
          }
          
          /* 下部ナビゲーションの高さを確保 */
          .home-container {
            margin-bottom: calc(6rem + env(safe-area-inset-bottom)) !important;
          }
        }
        
        .home-container {
          width: 100vw !important;
          max-width: 100vw !important;
          padding: 0.5rem !important;
          padding-bottom: calc(6rem + env(safe-area-inset-bottom)) !important;
          margin: 0 !important;
          margin-bottom: calc(6rem + env(safe-area-inset-bottom)) !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
        
        .home-quick-actions {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin-bottom: 2rem !important;
        }
        
        .home-quick-actions .grid {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        
        .home-quick-action-card {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 1rem !important;
          border-radius: 12px !important;
          background: white !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid #e5e7eb !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
          touch-action: manipulation !important;
          -webkit-tap-highlight-color: transparent !important;
          min-height: 120px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
        }
        
        .home-quick-action-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
        }
        
        .home-quick-action-card:active {
          transform: translateY(0) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }
        
        .home-quick-action-header {
          display: flex !important;
          align-items: flex-start !important;
          justify-content: space-between !important;
          margin-bottom: 0.75rem !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        .home-quick-action-icon {
          width: 2.5rem !important;
          height: 2.5rem !important;
          border-radius: 8px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }
        
        .home-quick-action-badge {
          padding: 0.25rem 0.5rem !important;
          border-radius: 6px !important;
          font-size: 0.6rem !important;
          font-weight: 600 !important;
          flex-shrink: 0 !important;
          white-space: nowrap !important;
        }
        
        .home-quick-action-title {
          font-size: 1rem !important;
          font-weight: 700 !important;
          color: #1f2937 !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.3 !important;
          word-break: break-word !important;
        }
        
        .home-quick-action-description {
          font-size: 0.8rem !important;
          color: #6b7280 !important;
          line-height: 1.4 !important;
          margin-bottom: 0.75rem !important;
          word-break: break-word !important;
        }
        
        .home-quick-action-footer {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        .home-quick-action-link {
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          color: #3b82f6 !important;
        }
        
        .home-quick-action-arrow {
          width: 1rem !important;
          height: 1rem !important;
          color: #9ca3af !important;
          transition: all 0.3s ease !important;
        }
        
        .home-quick-action-card:hover .home-quick-action-arrow {
          color: #3b82f6 !important;
          transform: translateX(2px) !important;
        }
        
        /* タブレット対応 */
        @media (min-width: 640px) {
          .home-container {
            padding: 1rem !important;
          }
          
          .home-quick-actions .grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem !important;
          }
          
          .home-quick-action-card {
            min-height: 140px !important;
            padding: 1.25rem !important;
          }
          
          .home-quick-action-title {
            font-size: 1.1rem !important;
          }
          
          .home-quick-action-description {
            font-size: 0.85rem !important;
          }
        }
        
        /* デスクトップ対応 */
        @media (min-width: 1024px) {
          .home-quick-actions .grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1.5rem !important;
          }
          
          .home-quick-action-card {
            min-height: 160px !important;
            padding: 1.5rem !important;
          }
          
          .home-quick-action-title {
            font-size: 1.2rem !important;
          }
          
          .home-quick-action-description {
            font-size: 0.9rem !important;
          }
        }
        
        /* プレミアムCTAのモバイル最適化 */
        .home-premium-cta {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin: 1rem 0 !important;
          padding: 1.5rem !important;
          border-radius: 16px !important;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%) !important;
          color: white !important;
          text-align: center !important;
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3) !important;
        }
        
        .home-premium-cta h3 {
          font-size: 1.5rem !important;
          font-weight: 800 !important;
          margin-bottom: 0.75rem !important;
          line-height: 1.2 !important;
        }
        
        .home-premium-cta p {
          font-size: 0.9rem !important;
          margin-bottom: 1.5rem !important;
          opacity: 0.9 !important;
          line-height: 1.4 !important;
        }
        
        .home-premium-cta button {
          padding: 0.75rem 2rem !important;
          font-size: 1rem !important;
          font-weight: 700 !important;
          border-radius: 12px !important;
          background: white !important;
          color: #8b5cf6 !important;
          border: none !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
          touch-action: manipulation !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        .home-premium-cta button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
        }
        
        .home-premium-cta button:active {
          transform: translateY(0) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
        }
        
        @media (min-width: 640px) {
          .home-premium-cta {
            padding: 2rem !important;
          }
          
          .home-premium-cta h3 {
            font-size: 1.75rem !important;
          }
          
          .home-premium-cta p {
            font-size: 1rem !important;
          }
        }
      `}</style>
      <InstallBanner />
      <div className="home-container">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="home">ホーム</TabsTrigger>
            {isFeatureAccessible('/integrated-dashboard').allowed && (
              <TabsTrigger value="dashboard">ダッシュボード</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="home">
            {/* Onboarding Modal */}
            <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
              <DialogContent aria-modal="true" role="dialog">
                <DialogHeader>
                  {onboardingStep === 1 && (
                    <>
                      <DialogTitle>ステップ1: AI秘書で今日の計画を作成</DialogTitle>
                      <DialogDescription>
                        1分で今日の最優先タスクを決めましょう。AIが提案します。
                      </DialogDescription>
                    </>
                  )}
                  {onboardingStep === 2 && (
                    <>
                      <DialogTitle>ステップ2: 自己診断（IQ/MBTI）を実施</DialogTitle>
                      <DialogDescription>
                        5〜10分で診断を行い、あなたに合わせて最適化された案内にします。
                      </DialogDescription>
                    </>
                  )}
                  {onboardingStep === 3 && (
                    <>
                      <DialogTitle>ステップ3: 友だちを招待して一緒に始めよう</DialogTitle>
                      <DialogDescription>
                        招待リンクを共有して、継続の仲間を増やしましょう。
                      </DialogDescription>
                    </>
                  )}
                </DialogHeader>
                <DialogFooter>
                  <div className="flex w-full justify-between gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowOnboarding(false)}
                      aria-label="あとで"
                    >
                      あとで
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={onboardingStep === 1}
                        onClick={() => setOnboardingStep((s) => Math.max(1, s - 1))}
                      >
                        戻る
                      </Button>
                      {onboardingStep < 3 ? (
                        <Button
                          onClick={() => {
                            try {
                              trackEvent('onboarding_step_complete', { step: onboardingStep });
                            } catch {}
                            setOnboardingStep((s) => s + 1);
                          }}
                        >
                          次へ
                        </Button>
                      ) : (
                        <Button
                          onClick={async () => {
                            try {
                              trackEvent('onboarding_step_complete', { step: onboardingStep });
                            } catch {}
                            try {
                              localStorage.setItem('onboarding:tour_completed', 'true');
                            } catch {}
                            setShowOnboarding(false);
                          }}
                        >
                          完了
                        </Button>
                      )}
                      {onboardingStep === 1 && (
                        <Button
                          onClick={() => {
                            try {
                              trackEvent('onboarding_action', { step: 1, action: 'open_ai' });
                            } catch {}
                            setShowOnboarding(false);
                            navigate('/ai-assistant');
                          }}
                        >
                          AI秘書を開く
                        </Button>
                      )}
                      {onboardingStep === 2 && isFeatureAccessible('/assessments').allowed && (
                        <Button
                          onClick={() => {
                            try {
                              trackEvent('onboarding_action', {
                                step: 2,
                                action: 'open_assessments',
                              });
                            } catch {}
                            setShowOnboarding(false);
                            navigate('/assessments');
                          }}
                        >
                          自己診断を始める
                        </Button>
                      )}
                      {onboardingStep === 3 && isFeatureCompleteVisible('/invite') && (
                        <Button
                          onClick={async () => {
                            try {
                              trackEvent('onboarding_action', { step: 3, action: 'share_invite' });
                            } catch {}
                            try {
                              const url = buildOwnInviteUrl();
                              if (navigator.share)
                                await navigator.share({ title: 'Work Time Tracker', url });
                              else {
                                await navigator.clipboard.writeText(url);
                                toast.success('招待リンクをコピーしました');
                              }
                            } catch {}
                          }}
                        >
                          招待リンクを共有
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* Mission Hero */}
            <div className="bg-gradient-to-b from-white to-blue-50 border-b">
              <div className="container mx-auto px-4 max-w-7xl py-14 md:py-20 text-center">
                {isFeatureCompleteVisible('/_bg/hero-headline') && (
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
                    人生のコントロールを取り戻そう
                  </h1>
                )}
                {isFeatureCompleteVisible('/_bg/hero-kicker') && (
                  <p className="text-sm font-semibold text-emerald-600 mb-2">無料で始める</p>
                )}
                {isFeatureCompleteVisible('/_bg/hero-subtitle') && (
                  <p className="text-base md:text-xl text-gray-700 max-w-3xl mx-auto mb-8">
                    生成AIと連携したパーソナル秘書サービスで、計画・仕事・学習・自己診断までを一元管理。
                    IQ/MBTIなどの診断結果に基づいて、あなた専用に最適化された体験を提供します。
                  </p>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {isFeatureAccessible('/ai-assistant').allowed && (
                    <Button
                      size="lg"
                      className="px-6 py-6 text-base md:text-lg w-full sm:w-auto"
                      onClick={() => navigate('/ai-assistant')}
                      aria-label="AI秘書を使う"
                    >
                      AI秘書を使う
                    </Button>
                  )}
                  {isFeatureAccessible('/assessments').allowed && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-6 py-6 text-base md:text-lg w-full sm:w-auto"
                      onClick={() => navigate('/assessments')}
                      aria-label="自己診断を始める"
                    >
                      自己診断を始める
                      <Badge variant="secondary" className="ml-2 align-middle">
                        5–10分
                      </Badge>
                    </Button>
                  )}
                  {isFeatureCompleteVisible('/invite') && (
                    <div className="w-full sm:w-auto min-w-[280px]">
                      <MagicLinkCta />
                    </div>
                  )}
                </div>
                {isFeatureCompleteVisible('/_bg/hero-disclaimer') && stats?.streakDays > 0 && (
                  <div className="mt-3 flex justify-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-sm">
                      <Flame className="w-4 h-4" /> 連続 {stats.streakDays} 日
                    </span>
                  </div>
                )}
                {isFeatureCompleteVisible('/_bg/hero-disclaimer') && (
                  <p className="mt-2 text-xs text-gray-500">無料・匿名OK・いつでも退会可能</p>
                )}
              </div>
            </div>
            {/* 3 Benefits (with lazy images for LCP optimization below-the-fold) */}
            <div className="container mx-auto px-4 max-w-7xl py-10">
              {showStreakNudge && (
                <div className="mb-6">
                  <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-amber-100">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Flame className="w-5 h-5 text-orange-600" />
                      <div className="text-sm text-gray-800">
                        あと1日で連続{(stats?.streakDays || 0) + 1}日達成！ 今日も記録しよう。
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            try {
                              localStorage.setItem(
                                'streak:nudge:last_date',
                                new Date().toISOString().slice(0, 10)
                              );
                            } catch {}
                            trackEvent('streak_milestone_nudge_action', {
                              next: (stats?.streakDays || 0) + 1,
                            });
                            navigate('/work-time');
                          }}
                        >
                          今日も記録
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            try {
                              localStorage.setItem(
                                'streak:nudge:last_date',
                                new Date().toISOString().slice(0, 10)
                              );
                            } catch {}
                            trackEvent('streak_milestone_nudge_dismiss');
                            setShowStreakNudge(false);
                          }}
                        >
                          閉じる
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {ownRef && isFeatureCompleteVisible('/invite') && (
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
                        {isFeatureCompleteVisible('/invite') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate('/invite')}
                            aria-label="招待ページを開く"
                          >
                            詳細を見る
                          </Button>
                        )}
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
                        {isFeatureAccessible('/ai-assistant').allowed && (
                          <Button
                            size="sm"
                            onClick={() => navigate('/ai-assistant')}
                            aria-label="AI秘書を開く"
                          >
                            開く
                          </Button>
                        )}
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

              {showDailyNudge && isFeatureCompleteVisible('/_bg/daily-nudge') && (
                <div className="mb-6">
                  <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-100">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Target className="w-5 h-5 text-amber-600" />
                      <div className="text-sm text-gray-800">
                        今日の一手を作る？ 1分でAIが提案します。
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            try {
                              const today = new Date().toISOString().slice(0, 10);
                              localStorage.setItem('nudge:last_shown', today);
                            } catch {}
                            trackEvent('daily_nudge_action');
                            navigate('/ai-assistant');
                          }}
                          aria-label="今日の一手を作る"
                        >
                          今やる
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            try {
                              const today = new Date().toISOString().slice(0, 10);
                              localStorage.setItem('nudge:last_shown', today);
                            } catch {}
                            trackEvent('daily_nudge_snooze');
                            setShowDailyNudge(false);
                          }}
                          aria-label="あとで"
                        >
                          あとで
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isFeatureCompleteVisible('/_bg/hero-benefit-1') && (
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
                      <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                        人生の再設計
                      </h3>
                      <p className="text-gray-600 text-sm text-center">
                        衝動に流されない日々を。AIが時間配分と優先順位を設計し、再現可能な習慣へ導きます。
                      </p>
                    </CardContent>
                  </Card>
                )}

                {isFeatureCompleteVisible('/_bg/hero-benefit-2') && (
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
                )}

                {isFeatureCompleteVisible('/_bg/hero-benefit-3') && (
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
                )}
              </div>
            </div>
            {isFeatureCompleteVisible('/_bg/how-it-works') && <HowItWorks />}
            {isFeatureCompleteVisible('/invite') && (
              <div className="container mx-auto px-4 max-w-7xl py-6">
                <MagicLinkCta />
              </div>
            )}
            {isFeatureCompleteVisible('/_bg/testimonials') && <SocialProof />}
            <div className="container mx-auto px-4 max-w-7xl mb-8">
              {isFeatureCompleteVisible('/_bg/weekly-report') && <WeeklyReportPreview />}
              {isFeatureCompleteVisible('/_bg/testimonials') && (
                <div className="mt-8">
                  <UserStories />
                </div>
              )}
              {isFeatureCompleteVisible('/_bg/focus-timer-quick') && (
                <div className="mt-8">
                  <FocusTimerQuick />
                </div>
              )}
            </div>

            <div className="container mx-auto px-4 py-6 pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:py-8 max-w-7xl">
              {/* Newsletter signup CTA */}
              {isFeatureCompleteVisible('/_bg/newsletter') && (
                <div className="mb-10 max-w-2xl mx-auto">
                  <Card className="bg-white/90 border shadow-sm">
                    <CardContent className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                        ニュースレターに登録
                      </h3>
                      <p className="text-gray-600 text-sm text-center mb-3">
                        最新機能と生産性Tipsをお届けします（週1回程度）
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <Input
                          placeholder="メールアドレス"
                          value={newsletterEmail}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewsletterEmail(e.target.value)
                          }
                          type="email"
                          aria-label="ニュースレターのメールアドレス"
                        />
                        <Button
                          onClick={async () => {
                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) return;
                            setNewsletterSending(true);
                            try {
                              trackEvent('newsletter_subscribe', {
                                domain: newsletterEmail.split('@')[1],
                              });
                              toast.success('登録ありがとうございます！');
                              setNewsletterEmail('');
                            } catch {}
                            setNewsletterSending(false);
                          }}
                          disabled={newsletterSending || !newsletterEmail}
                          aria-label="ニュースレターに登録"
                        >
                          {newsletterSending ? '送信中...' : '登録する'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Header Section (subsequent heading after Hero's h1) */}
              <div className="text-center mb-12">
                {isFeatureCompleteVisible('/_bg/home-greeting') && (
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {getWelcomeMessage()}, {user?.name || 'ユーザー'}さん！
                  </h2>
                )}
                {isFeatureCompleteVisible('/_bg/planning-suggestion') && (
                  <p className="text-xl text-gray-600 mb-6">
                    {pz.prefersPlanning
                      ? '今日の時間割を確認し、計画通りに進めましょう'
                      : 'まずは優先タスクを1つだけ着手しましょう'}
                  </p>
                )}

                {/* Level badge */}
                {isFeatureCompleteVisible('/_bg/level-badge') && (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-lg"
                    role="status"
                    aria-label="ユーザーレベル"
                  >
                    <Crown className="w-5 h-5" />
                    レベル {stats?.currentLevel ?? 1}
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Stats Overview */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {/* Tasks Progress */}
                  {isFeatureCompleteVisible('/_bg/stats-today') && (
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
                  )}

                  {/* Streak */}
                  {isFeatureCompleteVisible('/_bg/stats-streak') && (
                    <Card className="bg-white/70 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-orange-100 rounded-full">
                            <Flame className="w-6 h-6 text-orange-600" />
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">連続</Badge>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {stats.streakDays}
                        </h3>
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
                  )}

                  {/* XP Progress */}
                  {isFeatureCompleteVisible('/_bg/stats-xp') && (
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
                  )}

                  {/* Badges */}
                  {isFeatureCompleteVisible('/_bg/stats-badges') && (
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
                        <Progress
                          value={(stats.badgesEarned / stats.totalBadges) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          {Math.round((stats.badgesEarned / stats.totalBadges) * 100)}% コンプリート
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              {isFeatureCompleteVisible('/_bg/quick-actions') && (
                <div className="home-quick-actions mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-blue-600" />
                    クイックアクション
                  </h2>

                  <div className="grid">
                    {quickActions
                      .filter((action) => isFeatureAccessible(action.path).allowed)
                      .map((action) => (
                        <div
                          key={action.id}
                          className="home-quick-action-card"
                          onClick={() => navigate(action.path)}
                        >
                          <div className="home-quick-action-header">
                            <div
                              className={cn(
                                'home-quick-action-icon bg-gradient-to-r',
                                action.gradient
                              )}
                            >
                              <div className="text-white">{action.icon}</div>
                            </div>
                            {action.featured && (
                              <div className="home-quick-action-badge bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                おすすめ
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="home-quick-action-title">{action.title}</h3>
                            <p className="home-quick-action-description">{action.description}</p>
                          </div>

                          <div className="home-quick-action-footer">
                            <span className="home-quick-action-link">開始する</span>
                            <ArrowRight className="home-quick-action-arrow" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* AI Enhancement */}
                {isFeatureCompleteVisible('/_bg/ai-enhancements') && (
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
                )}

                {/* Community */}
                {isFeatureCompleteVisible('/community') && (
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
                )}
              </div>

              {/* Premium CTA */}
              {!hasActiveSubscription &&
                isFeatureAccessible('/subscription-management').allowed && (
                  <div className="home-premium-cta">
                    <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-200" />
                    <h3>生産性を次のレベルへ</h3>
                    <p>
                      限定バッジ、高度なAI分析、チーム機能など、プレミアム限定の機能で生産性を次のレベルへ
                    </p>
                    <button onClick={() => navigate('/subscription-management')}>
                      プレミアムを始める
                    </button>
                  </div>
                )}

              {/* Quick Add Todo */}
              {isFeatureCompleteVisible('/_bg/quick-add-todo') && (
                <div className="fixed bottom-6 right-6">
                  <Button
                    onClick={() => navigate('/todos')}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
                  >
                    <Plus className="w-8 h-8" />
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom CTA duplicate */}
            <div className="bg-white border-t">
              <div className="container mx-auto px-4 max-w-7xl py-10 text-center">
                {isFeatureCompleteVisible('/_bg/nps-inline') && (
                  <div className="mb-6 text-left">
                    <InlineNPS />
                  </div>
                )}
                {isFeatureCompleteVisible('/_bg/bottom-cta-heading') && (
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    今日からはじめよう
                  </h2>
                )}
                {isFeatureCompleteVisible('/_bg/bottom-tagline') && (
                  <p className="text-gray-600 mb-6">AI秘書と自己診断で、最短60秒の一歩から。</p>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {isFeatureAccessible('/ai-assistant').allowed && (
                    <Button
                      className="px-6 py-6 text-base md:text-lg"
                      onClick={() => navigate('/ai-assistant')}
                      aria-label="AI秘書を使う"
                    >
                      AI秘書を使う
                    </Button>
                  )}
                  {isFeatureAccessible('/assessments').allowed && (
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
                  )}
                </div>
                {isFeatureCompleteVisible('/_bg/hero-disclaimer') && (
                  <p className="mt-2 text-xs text-gray-500">無料・匿名OK・いつでも退会可能</p>
                )}
              </div>
            </div>

            {/* Footer: Version Info */}
            {isFeatureCompleteVisible('/_bg/version-info') && (
              <div className="bg-white border-t">
                <div className="container mx-auto px-4 max-w-7xl py-6">
                  <VersionInfo />
                </div>
              </div>
            )}

            {/* Share Dev Progress */}
            {getFeatureByPath('/_bg/share-dev-progress') && (
              <div className="bg-white border-t">
                <div className="container mx-auto px-4 max-w-7xl py-6 text-center">
                  <Button
                    variant="outline"
                    data-testid="share-dev-progress-home-btn"
                    onClick={async () => {
                      try {
                        const shareText = await generateDevProgressShareText();
                        const url = getCanonicalUrl();
                        openShare(shareText, url);
                      } catch {}
                    }}
                    aria-label="開発状況をシェア"
                  >
                    開発状況をシェア
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="dashboard">
            <div className="bg-white">
              <div className="container mx-auto px-4 max-w-7xl py-6">
                <IntegratedDashboard />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
