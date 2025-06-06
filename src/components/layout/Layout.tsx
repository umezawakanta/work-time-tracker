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
  ChevronRight,
  Globe,
  X,
  Zap,
  TrendingUp,
  Sun,
  Moon,
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
  color?: string;
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: 'ホーム',
    path: '/',
    description: 'ダッシュボードホーム',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <CheckSquare className="h-5 w-5" />,
    label: 'ToDo管理',
    path: '/todos',
    description: 'タスクとToDoの管理',
    badge: 'NEW',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: '統合ダッシュボード',
    path: '/integrated-dashboard',
    description: 'プロジェクト統合管理',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: '勤怠管理',
    path: '/work-time',
    description: '時間の記録と管理',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: 'レポート',
    path: '/work-time-reports',
    description: '分析とインサイト',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: '禁欲管理',
    path: '/abstinence',
    description: '禁欲チャレンジの管理',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: '資産カレンダー',
    path: '/asset-calendar',
    description: '資産の増減をカレンダーで管理',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: 'ブログ',
    path: '/blog',
    description: 'ブログ記事の閲覧と管理',
    color: 'from-teal-500 to-green-500',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: '本棚',
    path: '/bookshelf',
    description: '読書管理と記録',
    color: 'from-violet-500 to-purple-500',
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

    const baseClasses = isMobile
      ? 'group relative flex items-center gap-3 p-4 rounded-2xl transition-all duration-300'
      : 'group relative flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-300';

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          baseClasses,
          isItemActive
            ? 'bg-white shadow-lg shadow-slate-200/50'
            : 'hover:bg-white/60 hover:shadow-md hover:shadow-slate-200/30'
        )}
        onClick={() => isMobile && setIsMenuOpen(false)}
        title={item.description}
      >
        {/* アクティブインジケーター */}
        {isItemActive && (
          <div
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b',
              item.color
            )}
          />
        )}

        <div
          className={cn(
            'transition-all duration-200 p-2 rounded-lg',
            isItemActive
              ? `bg-gradient-to-br ${item.color} text-white shadow-lg`
              : 'text-slate-600 group-hover:text-slate-800 bg-slate-100 group-hover:bg-slate-200'
          )}
        >
          {item.icon}
        </div>
        <div className="flex-1">
          <span
            className={cn(
              'font-medium transition-colors',
              isItemActive ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900',
              isMobile ? 'text-base' : 'text-sm'
            )}
          >
            {item.label}
          </span>
          {isMobile && item.description && (
            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
          )}
        </div>
        {item.isPremium && <Crown className="h-4 w-4 text-amber-500 animate-pulse" />}
        {item.badge && (
          <Badge
            variant="secondary"
            className={cn(
              'text-xs font-semibold',
              item.badge === 'NEW'
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'
                : ''
            )}
          >
            {item.badge}
          </Badge>
        )}
        {!isMobile && (
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-all duration-200 opacity-0 -translate-x-2',
              'group-hover:opacity-100 group-hover:translate-x-0',
              isItemActive ? 'opacity-100 translate-x-0' : ''
            )}
          />
        )}
      </Link>
    );
  };

  // 通知ダミーデータ
  const notifications = [
    { id: 1, title: '新しいタスクが追加されました', time: '5分前', unread: true },
    { id: 2, title: 'レポートの締切が近づいています', time: '1時間前', unread: true },
    { id: 3, title: '目標を達成しました！', time: '3時間前', unread: false },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-300',
        isDarkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'
      )}
    >
      {/* 改良されたヘッダー */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg'
            : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md',
          'border-b border-slate-200/60 dark:border-slate-700/60'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴとナビゲーション */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      LifeSync
                    </span>
                    <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 text-xs">
                      Pro
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                    <Zap className="inline h-3 w-3 mr-1" />
                    生産性プラットフォーム
                  </p>
                </div>
              </Link>

              {/* 検索バー */}
              <div className="hidden md:flex relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-64 lg:w-80 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    aria-label="検索をクリア"
                  >
                    <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>

              {/* デスクトップナビゲーション */}
              <nav className="hidden xl:flex items-center gap-2">
                {menuItems.slice(0, 5).map((item) => renderMenuItem(item))}
              </nav>
            </div>

            {/* ユーザーメニュー */}
            <div className="flex items-center gap-3">
              {/* ダークモード切替 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="relative hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </Button>

              {/* 通知ベル */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Bell className="h-5 w-5" />
                    <div className="absolute -top-1 -right-1 flex items-center justify-center">
                      <div className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      <div className="relative w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>通知</span>
                    <Badge variant="secondary" className="text-xs">
                      {notifications.filter((n) => n.unread).length} 件の未読
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((notif) => (
                    <DropdownMenuItem key={notif.id} className="cursor-pointer p-3">
                      <div className="flex items-start gap-3 w-full">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full mt-1.5',
                            notif.unread ? 'bg-blue-500' : 'bg-transparent'
                          )}
                        />
                        <div className="flex-1">
                          <p
                            className={cn(
                              'text-sm',
                              notif.unread ? 'font-medium' : 'text-slate-600'
                            )}
                          >
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-center justify-center text-blue-600 hover:text-blue-700">
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
                    className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-medium">{locale === 'ja-JP' ? 'JP' : 'EN'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setLocale('ja-JP' as Locale)}
                    className={cn('cursor-pointer', locale === 'ja-JP' && 'bg-slate-100')}
                  >
                    <span className="mr-2">🇯🇵</span> 日本語
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocale('en-US' as Locale)}
                    className={cn('cursor-pointer', locale === 'en-US' && 'bg-slate-100')}
                  >
                    <span className="mr-2">🇺🇸</span> English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ユーザードロップダウン */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-transparent hover:ring-blue-500/30 focus:ring-blue-500/30 transition-all duration-200"
                  >
                    <Avatar className="h-10 w-10 shadow-md">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end">
                  <DropdownMenuLabel className="pb-0">
                    <div className="flex items-center gap-3 p-2">
                      <Avatar className="h-12 w-12 shadow-md">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg">
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-base">{user?.name || 'ユーザー'}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-0"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Pro会員
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-700 border-0"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            7日連続
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-3 h-4 w-4" />
                    <span>プロフィール</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/settings')}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span>設定</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>ログアウト</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* モバイルメニュー */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="xl:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-0"
                >
                  <SheetHeader className="p-6 pb-0">
                    <SheetTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl font-bold">メニュー</span>
                    </SheetTitle>
                  </SheetHeader>

                  {/* モバイル検索 */}
                  <div className="px-6 py-4">
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

                  {/* プロフィール情報 */}
                  <div className="px-6 pb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                            {user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{user?.name || 'ユーザー'}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-2 px-6 pb-6">
                    {menuItems.map((item) => renderMenuItem(item, true))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 animate-fade-in">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
