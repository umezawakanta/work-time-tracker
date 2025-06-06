import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
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
  Bell,
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
} from 'lucide-react';
import { logout } from '@/services/api/authApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/useAuth';
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
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: 'ホーム',
    path: '/',
    description: 'ダッシュボードホーム',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <CheckSquare className="h-5 w-5" />,
    label: 'ToDo管理',
    path: '/todos',
    description: 'タスクとToDoの管理',
    badge: 'NEW',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: '統合ダッシュボード',
    path: '/integrated-dashboard',
    description: 'プロジェクト統合管理',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: '勤怠管理',
    path: '/work-time',
    description: '時間の記録と管理',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: 'レポート',
    path: '/work-time-reports',
    description: '分析とインサイト',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    label: '禁欲管理',
    path: '/abstinence',
    description: '禁欲チャレンジの管理',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: '資産カレンダー',
    path: '/asset-calendar',
    description: '資産の増減をカレンダーで管理',
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: 'ブログ',
    path: '/blog',
    description: 'ブログ記事の閲覧と管理',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: '本棚',
    path: '/bookshelf',
    description: '読書管理と記録',
    gradient: 'from-violet-500 to-purple-500',
  },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, setLocale } = useLocale();
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('ログアウトしました');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const renderMenuItem = (item: MenuItem, isMobile: boolean = false) => {
    const isItemActive = isActive(item.path);

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
          isItemActive
            ? 'bg-white dark:bg-slate-800 shadow-lg'
            : 'hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-md',
          isMobile && 'px-5 py-4'
        )}
        onClick={() => isMobile && setIsMenuOpen(false)}
      >
        {isItemActive && (
          <div
            className={cn(
              'absolute left-0 top-0 bottom-0 w-1 rounded-r-lg bg-gradient-to-b',
              item.gradient
            )}
          />
        )}

        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
            isItemActive
              ? `bg-gradient-to-br ${item.gradient} text-white shadow-md`
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          )}
        >
          {item.icon}
        </div>

        <div className="flex-1">
          <span
            className={cn(
              'font-medium',
              isItemActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
            )}
          >
            {item.label}
          </span>
          {isMobile && item.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
          )}
        </div>

        {item.badge && (
          <Badge
            className={cn(
              'text-xs px-2 py-0.5',
              item.badge === 'NEW' &&
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            )}
          >
            {item.badge}
          </Badge>
        )}

        {item.isPremium && <Crown className="h-4 w-4 text-amber-500" />}
      </Link>
    );
  };

  const notifications = [
    { id: 1, title: '新しいタスクが追加されました', time: '5分前', unread: true, icon: '📋' },
    { id: 2, title: 'レポートの締切が近づいています', time: '1時間前', unread: true, icon: '⏰' },
    { id: 3, title: '目標を達成しました！', time: '3時間前', unread: false, icon: '🎉' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">{children}</div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen flex',
        isDarkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-slate-50 to-slate-100'
      )}
    >
      {/* サイドメニュー */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        {/* ロゴ */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                LifeSync
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">生産性プラットフォーム</p>
            </div>
          </Link>
        </div>

        {/* メニューアイテム */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.path}>{renderMenuItem(item)}</div>
          ))}
        </nav>

        {/* プロフィール */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name || 'ユーザー'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        <header
          className={cn(
            'sticky top-0 z-50 transition-all duration-300',
            isScrolled
              ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md',
            'border-b border-slate-200/50 dark:border-slate-700/50'
          )}
        >
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* ロゴセクション */}
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      LifeSync
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      生産性プラットフォーム
                    </p>
                  </div>
                </Link>

                {/* 検索バー */}
                <div className="hidden lg:flex relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 w-64 xl:w-80 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="検索をクリア"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 右側のアクション */}
              <div className="flex items-center gap-2">
                {/* クイックアクション */}
                <div className="hidden md:flex items-center gap-2 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative group"
                    onClick={() => navigate('/todos')}
                  >
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">クイック追加</span>
                    </div>
                  </Button>
                </div>

                {/* ダークモード切替 */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-600" />
                  )}
                </Button>

                {/* 通知 */}
                <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-xl">
                      <Bell className="h-5 w-5" />
                      {notifications.some((n) => n.unread) && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <DropdownMenuLabel className="flex items-center justify-between pb-3">
                      <span className="text-base font-semibold">通知</span>
                      <Badge variant="secondary" className="text-xs">
                        {notifications.filter((n) => n.unread).length} 件の未読
                      </Badge>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <DropdownMenuItem
                          key={notif.id}
                          className="cursor-pointer py-3 px-4 focus:bg-slate-50 dark:focus:bg-slate-800"
                        >
                          <div className="flex items-start gap-3 w-full">
                            <span className="text-xl">{notif.icon}</span>
                            <div className="flex-1">
                              <p
                                className={cn(
                                  'text-sm',
                                  notif.unread
                                    ? 'font-medium text-slate-900 dark:text-white'
                                    : 'text-slate-600 dark:text-slate-400'
                                )}
                              >
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {notif.time}
                              </p>
                            </div>
                            {notif.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer justify-center py-3 text-violet-600 dark:text-violet-400 font-medium">
                      すべての通知を見る
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 言語切替 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:flex items-center gap-2 rounded-xl"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {locale === 'ja-JP' ? 'JP' : 'EN'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setLocale('ja-JP' as Locale)}
                      className={cn(
                        'cursor-pointer',
                        locale === 'ja-JP' && 'bg-violet-50 dark:bg-violet-900/20'
                      )}
                    >
                      🇯🇵 日本語
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLocale('en-US' as Locale)}
                      className={cn(
                        'cursor-pointer',
                        locale === 'en-US' && 'bg-violet-50 dark:bg-violet-900/20'
                      )}
                    >
                      🇺🇸 English
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* ユーザーメニュー */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-violet-500/20 transition-all duration-200"
                    >
                      <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-md">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white font-semibold">
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72" align="end">
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14 border-2 border-slate-200 dark:border-slate-700">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-lg font-semibold">
                            {user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {user?.name || 'ユーザー'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {user?.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="text-xs bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-400 border-0">
                              <Crown className="h-3 w-3 mr-1" />
                              Pro会員
                            </Badge>
                            <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              7日連続
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer py-2.5"
                    >
                      <User className="mr-3 h-4 w-4" />
                      プロフィール
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/settings')}
                      className="cursor-pointer py-2.5"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      設定
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-2.5">
                      <Award className="mr-3 h-4 w-4" />
                      実績・バッジ
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer py-2.5 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* モバイルメニュー */}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-80 p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                  >
                    <SheetHeader className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                      <SheetTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">LifeSync</span>
                      </SheetTitle>
                    </SheetHeader>

                    {/* プロフィール */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white">
                            {user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user?.name || 'ユーザー'}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* モバイル検索 */}
                    <div className="p-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="検索..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    {/* メニューアイテム */}
                    <nav className="px-4 pb-6">
                      <div className="space-y-1">
                        {menuItems.map((item) => (
                          <div key={item.path}>{renderMenuItem(item, true)}</div>
                        ))}
                      </div>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
