import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useInternationalization } from '@/hooks/useInternationalization';
import { AccessibilityProvider, SkipLinks } from '@/components/accessibility';
import {
  Home,
  Clock,
  BarChart2,
  Menu,
  LogOut,
  Settings,
  User,
  Crown,
  Target,
  Sparkles,
  Search,
  CheckSquare,
  Calendar,
  FileText,
  BookOpen,
  Globe,
  X,
  TrendingUp,
  Sun,
  Moon,
  Activity,
  Shield,
  Award,
  Plus,
  Zap,
  Edit3,
  Zap as Lightning,
  Music,
  Bed,
  Twitter,
  Lightbulb,
  Code,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Store,
  Vote,
  UserPlus,
  Map,
  TestTube,
  BarChart3,
  Palette,
  Heart,
  Brain,
  Book,
  Wallet,
  PieChart,
  Trophy,
  AlertTriangle,
  Gauge,
  Droplets,
  Scissors,
} from 'lucide-react';
import { logout } from '@/services/api/authApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Locale } from '@/context/LocaleContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LanguageSwitcher } from '@/components/internationalization/LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  isPremium?: boolean;
  badge?: string;
  description?: string;
  gradient?: string;
  accentColor?: string;
}

// コアメニューアイテム - 翻訳対応
const getCoreMenuItems = (t: (key: string) => string): MenuItem[] => [
  {
    icon: <Home className="h-5 w-5" />,
    label: t('navigation.dashboard'),
    path: '/',
    description: t('navigation.dashboard'),
    gradient: 'from-blue-500 via-blue-600 to-cyan-500',
    accentColor: 'blue',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: t('navigation.integrated_dashboard'),
    path: '/integrated-dashboard',
    description: t('navigation.integrated_dashboard'),
    gradient: 'from-purple-500 via-violet-500 to-purple-600',
    accentColor: 'purple',
  },
  {
    icon: <CheckSquare className="h-5 w-5" />,
    label: t('navigation.tasks'),
    path: '/todos',
    description: t('navigation.tasks'),
    badge: 'NEW',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    accentColor: 'emerald',
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: t('navigation.automation'),
    path: '/automation-rules',
    description: t('navigation.automation'),
    badge: 'AUTO',
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    accentColor: 'purple',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: t('navigation.work_time'),
    path: '/work-time',
    description: t('navigation.work_time'),
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    accentColor: 'orange',
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: t('navigation.reports'),
    path: '/work-time-reports',
    description: t('navigation.reports'),
    gradient: 'from-indigo-500 via-blue-500 to-purple-500',
    accentColor: 'indigo',
  },
];

// バッジ・実績メニューアイテム
const badgeMenuItems: MenuItem[] = [
  {
    icon: <Trophy className="h-5 w-5" />,
    label: '開発バッジダッシュボード',
    path: '/development-badges',
    description: '開発進捗バッジとスキル管理',
    badge: 'HOT',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    accentColor: 'yellow',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: 'バッジ完了予測',
    path: '/badge-completion',
    description: '全バッジ獲得までの作業時間・達成予定日',
    badge: 'NEW',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    accentColor: 'blue',
  },
  {
    icon: <Award className="h-5 w-5" />,
    label: 'バッジショーケース',
    path: '/badge-showcase',
    description: '獲得済みバッジの詳細表示',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    accentColor: 'purple',
  },
];

// 開発・品質管理メニューアイテム
const devQualityMenuItems: MenuItem[] = [
  {
    icon: <Shield className="h-5 w-5" />,
    label: '品質ダッシュボード',
    path: '/quality-dashboard',
    description: '品質メトリクス・テスト・パフォーマンス',
    badge: 'QA',
    gradient: 'from-blue-500 via-blue-600 to-blue-700',
    accentColor: 'blue',
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: 'エラー監視',
    path: '/error-monitor',
    description: 'エラーエリミネーター・リアルタイム監視',
    badge: 'HOT',
    gradient: 'from-red-500 via-orange-500 to-red-600',
    accentColor: 'red',
  },
  {
    icon: <Gauge className="h-5 w-5" />,
    label: 'パフォーマンス監視',
    path: '/performance-monitor',
    description: 'パフォーマンス忍者・Core Web Vitals',
    badge: '🥷',
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    accentColor: 'purple',
  },
  {
    icon: <TestTube className="h-5 w-5" />,
    label: 'クロスブラウザテスト',
    path: '/cross-browser-test',
    description: 'ブラウザ互換性テスト',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    accentColor: 'cyan',
  },
  {
    icon: <Activity className="h-5 w-5" />,
    label: 'パフォーマンス最適化',
    path: '/performance-optimization',
    description: 'サイト最適化と高速化',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    accentColor: 'green',
  },
];

// ツール・ユーティリティメニューアイテム
const toolsMenuItems: MenuItem[] = [
  {
    icon: <Award className="h-5 w-5" />,
    label: 'WBS作成',
    path: '/wbs',
    description: 'プロジェクトのWBS管理',
    badge: 'HOT',
    gradient: 'from-rose-500 via-pink-500 to-rose-600',
    accentColor: 'rose',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    label: 'AI WBS生成',
    path: '/wbs-generator',
    description: 'AIによる自動WBS生成',
    badge: 'AI',
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    accentColor: 'violet',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: 'データ可視化',
    path: '/data-visualization',
    description: 'チャートとグラフ作成',
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    accentColor: 'teal',
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    label: 'ゲーミフィケーション',
    path: '/gamification',
    description: 'ゲーム要素とモチベーション',
    gradient: 'from-pink-500 via-purple-500 to-indigo-500',
    accentColor: 'pink',
  },
  {
    icon: <Brain className="h-5 w-5" />,
    label: '🚀 AI強化ゲーミフィケーション（進化版）',
    path: '/ai-gamification',
    description: 'リアルタイムAI分析・予測・パーソナライゼーション',
    gradient: 'from-blue-500 via-purple-500 to-pink-500',
    accentColor: 'blue',
  },
  {
    icon: <Crown className="h-5 w-5" />,
    label: '🎮 統合ゲーミフィケーション',
    path: '/integrated-gamification',
    description: 'AI・ゲーミフィケーション・タスク管理の完全統合',
    badge: 'NEW',
    gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    accentColor: 'purple',
  },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, setLocale, t } = useInternationalization();
  const { isAuthenticated, user, setIsAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('darkMode') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const unlockedBadgesCount = 0; // Or implement actual badge counting logic

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = async (): Promise<void> => {
    try {
      logout();
      setIsAuthenticated(false);
      navigate('/login');
      toast.success(t('success.saved'));
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('errors.generic'));
    }
  };

  const isActive = (path: string): boolean => location.pathname === path;

  const renderMenuItem = (item: MenuItem, isMobile: boolean = false) => {
    const isItemActive = isActive(item.path);

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          'group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out',
          'hover:scale-[1.02] active:scale-[0.98]',
          isItemActive
            ? 'bg-white/90 dark:bg-white/10 shadow-lg shadow-black/5 dark:shadow-white/5 backdrop-blur-md border border-white/20 dark:border-white/10'
            : 'hover:bg-white/50 dark:hover:bg-white/5 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-white/5 hover:backdrop-blur-sm',
          isMobile && 'px-6 py-4'
        )}
        onClick={() => isMobile && setIsMenuOpen(false)}
        role="menuitem"
        aria-current={isItemActive ? 'page' : undefined}
        aria-describedby={item.description ? `desc-${item.path}` : undefined}
        aria-label={`${item.label}${item.badge ? ` - ${item.badge}` : ''}${item.description ? ` - ${item.description}` : ''}`}
      >
        {/* Active indicator */}
        {isItemActive && (
          <div
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b',
              item.gradient,
              'shadow-lg'
            )}
          />
        )}

        {/* Icon container */}
        <div
          className={cn(
            'relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300',
            'shadow-sm group-hover:shadow-md',
            isItemActive
              ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg shadow-${item.accentColor}-500/25`
              : 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/50'
          )}
        >
          {item.icon}
          {/* Shimmer effect for active items */}
          {isItemActive && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-semibold text-sm truncate transition-colors duration-200',
                isItemActive
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
              )}
            >
              {item.label}
            </span>
            {item.badge && (
              <Badge
                className={cn(
                  'text-xs px-2 py-0.5 font-medium shadow-sm',
                  item.badge === 'NEW' &&
                    'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-400',
                  item.badge === 'HOT' &&
                    'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 dark:from-rose-900/30 dark:to-pink-900/30 dark:text-rose-400',
                  item.badge === 'AI' &&
                    'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-400'
                )}
              >
                {item.badge}
              </Badge>
            )}
          </div>
          {isMobile && item.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {item.description}
            </p>
          )}
        </div>

        {item.isPremium && <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />}
      </Link>
    );
  };

  const notifications = [
    {
      id: 1,
      title: '新しいタスクが追加されました',
      time: '5分前',
      unread: true,
      icon: '📋',
      type: 'info',
    },
    {
      id: 2,
      title: 'レポートの締切が近づいています',
      time: '1時間前',
      unread: true,
      icon: '⏰',
      type: 'warning',
    },
    {
      id: 3,
      title: '目標を達成しました！',
      time: '3時間前',
      unread: false,
      icon: '🎉',
      type: 'success',
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {children}
      </div>
    );
  }

  return (
    <AccessibilityProvider>
      <div
        className={cn(
          'min-h-screen flex transition-all duration-300',
          isDarkMode
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
            : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200'
        )}
      >
        {/* スキップリンク */}
        <SkipLinks />

        {/* アクセシビリティ用のランドマーク要素 */}
        <div className="sr-only" id="top">
          Work Time Tracker - ページの最上部
        </div>
        {/* Advanced floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-400/10 dark:bg-violet-400/5 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/10 dark:bg-cyan-400/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400/10 dark:bg-pink-400/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>

        {/* Enhanced Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-80 border-r border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-2xl relative z-10"
          role="navigation"
          aria-label="メインナビゲーション"
        >
          {/* Logo Section */}
          <div className="p-8 border-b border-white/20 dark:border-white/10">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Sparkles className="h-7 w-7 text-white" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full animate-pulse shadow-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  LifeSync
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  生産性プラットフォーム
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav
            className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide"
            aria-label="アプリケーションメニュー"
          >
            {/* コアメニュー */}
            {getCoreMenuItems(t).map((item) => (
              <div key={item.path}>{renderMenuItem(item)}</div>
            ))}

            {/* バッジ・実績セクション */}
            <div className="pt-6 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 flex items-center gap-2">
                <Trophy className="h-3 w-3" />
                {t('sidebar.badges_achievements')}
              </h3>
            </div>
            {badgeMenuItems.map((item) => (
              <div key={item.path}>{renderMenuItem(item)}</div>
            ))}

            {/* 開発・品質管理セクション */}
            <div className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 flex items-center gap-2">
                <Shield className="h-3 w-3" />
                {t('sidebar.development_quality')}
              </h3>
            </div>
            {devQualityMenuItems.map((item) => (
              <div key={item.path}>{renderMenuItem(item)}</div>
            ))}
            {/* データベース・インフラ管理 */}
            {renderMenuItem({
              icon: <AlertTriangle className="h-5 w-5" />,
              label: 'データベースバックアップ',
              path: '/database-backup',
              description: 'データベースバックアップ管理',
              badge: 'DB',
              gradient: 'from-orange-500 via-red-500 to-pink-500',
              accentColor: 'orange',
            })}
            {renderMenuItem({
              icon: <Activity className="h-5 w-5" />,
              label: 'システム監視',
              path: '/monitoring',
              description: 'システム監視マスター・SLO追跡',
              badge: 'SLO',
              gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
              accentColor: 'indigo',
            })}

            {/* ツール・ユーティリティセクション */}
            <div className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                {t('sidebar.tools_utilities')}
              </h3>
            </div>
            {toolsMenuItems.map((item) => (
              <div key={item.path}>{renderMenuItem(item)}</div>
            ))}

            {/* その他の機能 */}
            <div className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 flex items-center gap-2">
                <Globe className="h-3 w-3" />
                {t('sidebar.other_features')}
              </h3>
            </div>

            {/* 習慣管理セクション */}
            <div className="pt-2 pb-2">
              <h4 className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 flex items-center gap-2">
                <Target className="h-3 w-3" />
                習慣管理
              </h4>
            </div>
            {/* 入浴習慣 */}
            {renderMenuItem({
              icon: <Droplets className="h-5 w-5" />,
              label: '入浴習慣',
              path: '/bathing-habit',
              description: '毎日の入浴習慣を管理',
              badge: 'NEW',
              gradient: 'from-blue-500 via-cyan-500 to-teal-500',
              accentColor: 'blue',
            })}
            {/* 髭剃り習慣 */}
            {renderMenuItem({
              icon: <Scissors className="h-5 w-5" />,
              label: '髭剃り習慣',
              path: '/shaving-habit',
              description: '毎日の髭剃り習慣を管理',
              badge: 'NEW',
              gradient: 'from-orange-500 via-red-500 to-pink-500',
              accentColor: 'orange',
            })}

            {/* 本棚ページ */}
            {renderMenuItem({
              icon: <BookOpen className="h-5 w-5" />,
              label: '本棚',
              path: '/bookshelf',
              description: '読書管理と本の記録',
              gradient: 'from-amber-500 via-orange-500 to-red-500',
              accentColor: 'amber',
            })}
            {/* PWA・システム関連 */}
            {renderMenuItem({
              icon: <Lightbulb className="h-5 w-5" />,
              label: '改善計画',
              path: '/improvement-plan',
              description: 'サイト改善プランの管理',
              gradient: 'from-amber-500 via-yellow-500 to-orange-500',
              accentColor: 'amber',
            })}
            {renderMenuItem({
              icon: <Code className="h-5 w-5" />,
              label: 'システム設計',
              path: '/system-design',
              description: 'システム設計ドキュメント',
              gradient: 'from-slate-500 via-gray-500 to-zinc-500',
              accentColor: 'slate',
            })}
            {renderMenuItem({
              icon: <Activity className="h-5 w-5" />,
              label: 'PWA機能',
              path: '/pwa',
              description: 'プログレッシブWebアプリ機能',
              badge: 'PWA',
              gradient: 'from-indigo-500 via-blue-500 to-purple-500',
              accentColor: 'indigo',
            })}
            {renderMenuItem({
              icon: <Brain className="h-5 w-5" />,
              label: 'ニューロダイバーシティ',
              path: '/neurodiversity',
              description: '認知的多様性・アクセシビリティ',
              badge: 'A11Y',
              gradient: 'from-purple-500 via-indigo-500 to-blue-500',
              accentColor: 'purple',
            })}
            {renderMenuItem({
              icon: <Music className="h-5 w-5" />,
              label: 'ギター練習',
              path: '/guitar-practice',
              description: 'ギター練習の記録',
              gradient: 'from-green-500 via-emerald-500 to-teal-500',
              accentColor: 'green',
            })}
            {/* E-commerce・外部連携 */}
            {renderMenuItem({
              icon: <Store className="h-5 w-5" />,
              label: 'ショップ',
              path: '/shop',
              description: 'オンラインショップ',
              gradient: 'from-purple-500 via-pink-500 to-rose-500',
              accentColor: 'purple',
            })}
            {renderMenuItem({
              icon: <ShoppingCart className="h-5 w-5" />,
              label: '商品一覧',
              path: '/products',
              description: '商品カタログ',
              gradient: 'from-teal-500 via-cyan-500 to-blue-500',
              accentColor: 'teal',
            })}
            {renderMenuItem({
              icon: <Twitter className="h-5 w-5" />,
              label: 'Twitter',
              path: '/twitter',
              description: 'Twitter連携機能',
              gradient: 'from-sky-500 via-blue-500 to-indigo-500',
              accentColor: 'sky',
            })}
            {renderMenuItem({
              icon: <BarChart3 className="h-5 w-5" />,
              label: '政治トレンド',
              path: '/political-trends',
              description: '政治動向の分析',
              gradient: 'from-red-500 via-orange-500 to-yellow-500',
              accentColor: 'red',
            })}
            {renderMenuItem({
              icon: <Vote className="h-5 w-5" />,
              label: '選挙候補者',
              path: '/election-candidates',
              description: '選挙候補者情報',
              gradient: 'from-blue-500 via-indigo-500 to-purple-500',
              accentColor: 'blue',
            })}
            {renderMenuItem({
              icon: <UserPlus className="h-5 w-5" />,
              label: '候補者登録',
              path: '/candidate-registration',
              description: '候補者の新規登録',
              gradient: 'from-green-500 via-emerald-500 to-teal-500',
              accentColor: 'green',
            })}
            {renderMenuItem({
              icon: <Activity className="h-5 w-5" />,
              label: 'カレンダー',
              path: '/calendar',
              description: 'イベントカレンダー',
              gradient: 'from-lime-500 via-green-500 to-emerald-500',
              accentColor: 'lime',
            })}

            {/* 管理者専用メニュー */}
            {user?.isAdmin && (
              <>
                <div className="pt-6 pb-2">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 flex items-center gap-2">
                    <Crown className="h-3 w-3" />
                    {t('sidebar.admin_menu')}
                  </h3>
                </div>
                {getCoreMenuItems(t).map((item) => (
                  <div key={item.path}>{renderMenuItem(item)}</div>
                ))}
              </>
            )}
          </nav>

          {/* Enhanced Profile Section */}
          <div className="p-6 border-t border-white/20 dark:border-white/10">
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-r from-white/20 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg">
              <Avatar className="h-12 w-12 ring-2 ring-white/30 dark:ring-white/20 shadow-lg">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white font-bold text-lg">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate flex items-center gap-2 text-slate-900 dark:text-white">
                  {user?.name || 'ユーザー'}
                  {user?.isAdmin && <Crown className="h-4 w-4 text-amber-500" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative z-10">
          {/* Enhanced Header */}
          <header
            className={cn(
              'sticky top-0 z-50 transition-all duration-500',
              isScrolled
                ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-xl shadow-black/10 dark:shadow-white/5'
                : 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl',
              'border-b border-white/30 dark:border-white/10'
            )}
            role="banner"
            aria-label="ページヘッダー"
          >
            <div className="mx-auto px-6 sm:px-8 lg:px-10">
              <div className="flex justify-between items-center h-20">
                {/* Logo & Search Section */}
                <div className="flex items-center gap-10">
                  {/* Mobile Logo */}
                  <Link to="/" className="flex items-center gap-4 group lg:hidden">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full animate-pulse" />
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        LifeSync
                      </h1>
                    </div>
                  </Link>

                  {/* Enhanced Search Bar */}
                  <div className="hidden lg:flex relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors duration-200" />
                    <Input
                      placeholder={t('common.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-12 w-80 xl:w-96 h-12 bg-white/50 dark:bg-slate-800/50 border-white/30 dark:border-slate-700/50 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all duration-300 rounded-2xl shadow-lg backdrop-blur-md font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                        aria-label="検索をクリア"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Quick Action Button */}
                  <div className="hidden md:flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative group h-11 px-4 rounded-2xl bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/15 backdrop-blur-md border border-white/30 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate('/todos')}
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">{t('home.quick_add')}</span>
                      </div>
                    </Button>
                  </div>

                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="h-11 w-11 rounded-2xl bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/15 backdrop-blur-md border border-white/30 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {isDarkMode ? (
                      <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
                    ) : (
                      <Moon className="h-5 w-5 text-slate-600 group-hover:-rotate-12 transition-transform duration-300" />
                    )}
                  </Button>

                  {/* Language Switcher */}
                  <LanguageSwitcher
                    variant="compact"
                    className="h-11 rounded-2xl bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/15 backdrop-blur-md border border-white/30 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                  />

                  {/* User Menu - Enhanced */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-11 w-11 rounded-2xl hover:ring-2 hover:ring-violet-500/30 transition-all duration-300 group"
                      >
                        <Avatar className="h-11 w-11 border-2 border-white/30 dark:border-white/20 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white font-bold">
                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-lg" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-2"
                      align="end"
                    >
                      {/* Enhanced user profile section */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/20 dark:to-purple-900/20 m-2">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-white/50 dark:border-white/20 shadow-xl">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xl font-bold">
                              {user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                              {user?.name || 'ユーザー'}
                              {user?.isAdmin && (
                                <Badge className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 border-0 shadow-md">
                                  <Crown className="h-3 w-3 mr-1" />
                                  管理者
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                              {user?.email}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge className="text-xs bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-400 border-0 shadow-sm">
                                <Crown className="h-3 w-3 mr-1" />
                                Pro会員
                              </Badge>
                              <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 shadow-sm">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                7日連続
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DropdownMenuSeparator className="bg-white/20 dark:bg-white/10" />

                      {/* Menu items with enhanced styling */}
                      <DropdownMenuItem
                        onClick={() => navigate('/profile')}
                        className="cursor-pointer py-3 px-4 m-1 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-200"
                      >
                        <User className="mr-3 h-5 w-5" />
                        <span className="font-medium">プロフィール</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => navigate('/settings')}
                        className="cursor-pointer py-3 px-4 m-1 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-200"
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        <span className="font-medium">設定</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem className="cursor-pointer py-3 px-4 m-1 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-200">
                        <Award className="mr-3 h-5 w-5" />
                        <span className="font-medium">実績・バッジ</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-white/20 dark:bg-white/10" />

                      <DropdownMenuItem
                        onClick={() => setShowLogoutDialog(true)}
                        className="cursor-pointer py-3 px-4 m-1 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span className="font-medium">ログアウト</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Mobile Menu */}
                  <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-11 w-11 rounded-2xl bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/15 backdrop-blur-md border border-white/30 dark:border-white/20 shadow-lg"
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-80 p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-white/20 dark:border-white/10"
                    >
                      {/* Enhanced mobile content */}
                      {/* ... mobile content here ... */}
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main
            className="flex-1 relative z-10"
            role="main"
            tabIndex={-1}
            id="main-content"
            aria-label="メインコンテンツ"
          >
            {children}
          </main>
        </div>

        {/* Enhanced Logout Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">ログアウトの確認</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                本当にログアウトしますか？未保存のデータは失われる可能性があります。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500 rounded-xl shadow-lg"
              >
                ログアウト
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AccessibilityProvider>
  );
}
