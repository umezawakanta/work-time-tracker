import React, { useState } from 'react';
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
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: 'ホーム',
    path: '/',
    description: 'ダッシュボードホーム',
  },
  {
    icon: <CheckSquare className="h-5 w-5" />,
    label: 'ToDo管理',
    path: '/todos',
    description: 'タスクとToDoの管理',
    badge: 'NEW',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: '統合ダッシュボード',
    path: '/integrated-dashboard',
    description: 'プロジェクト統合管理',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: '勤怠管理',
    path: '/work-time',
    description: '時間の記録と管理',
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: 'レポート',
    path: '/work-time-reports',
    description: '分析とインサイト',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: '禁欲管理',
    path: '/abstinence',
    description: '禁欲チャレンジの管理',
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: '資産カレンダー',
    path: '/asset-calendar',
    description: '資産の増減をカレンダーで管理',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: 'ブログ',
    path: '/blog',
    description: 'ブログ記事の閲覧と管理',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: '本棚',
    path: '/bookshelf',
    description: '読書管理と記録',
  },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, setLocale } = useLocale();
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    const baseClasses = isMobile
      ? 'group flex items-center gap-3 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300'
      : 'group flex items-center gap-3 px-4 py-3 text-sm rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300';

    const activeClasses = isActive(item.path)
      ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md'
      : 'text-slate-700 hover:text-slate-900';

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(baseClasses, activeClasses)}
        onClick={() => isMobile && setIsMenuOpen(false)}
        title={item.description}
      >
        <div
          className={cn(
            'transition-colors duration-200 p-2 rounded-lg',
            isActive(item.path)
              ? 'text-blue-600 bg-blue-100'
              : 'text-slate-500 group-hover:text-slate-700 group-hover:bg-slate-100'
          )}
        >
          {item.icon}
        </div>
        <div className="flex-1">
          <span className={cn('font-medium', isMobile ? 'text-base' : 'text-sm')}>
            {item.label}
          </span>
          {isMobile && item.description && (
            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
          )}
        </div>
        {item.isPremium && <Crown className="h-4 w-4 text-amber-500" />}
        {item.badge && (
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* 改良されたヘッダー */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴとナビゲーション */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full animate-pulse"></div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    LifeSync
                  </span>
                  <p className="text-xs text-slate-500 -mt-1">生産性プラットフォーム</p>
                </div>
              </Link>

              {/* 検索バー */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* デスクトップナビゲーション */}
              <nav className="hidden xl:flex items-center gap-2">
                {menuItems.map((item) => renderMenuItem(item))}
              </nav>
            </div>

            {/* ユーザーメニュー */}
            <div className="flex items-center gap-3">
              {/* 通知ベル */}
              <Button variant="ghost" size="sm" className="relative hover:bg-slate-100">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </Button>

              {/* 言語切替 */}
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                title="言語選択"
              >
                <option value="ja-JP">🇯🇵 日本語</option>
                <option value="en-US">🇺🇸 English</option>
              </select>

              {/* ユーザードロップダウン */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-blue-500/20 transition-all duration-200"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="font-medium text-sm">{user?.name || 'ユーザー'}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-3 h-4 w-4" />
                    プロフィール
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/settings')}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    設定
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    ログアウト
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
                <SheetContent side="left" className="w-80 bg-white/95 backdrop-blur-xl">
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-lg font-semibold">メニュー</SheetTitle>
                  </SheetHeader>

                  {/* モバイル検索 */}
                  <div className="relative mt-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <nav className="flex flex-col gap-2 mt-8">
                    {menuItems.map((item) => renderMenuItem(item, true))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 animate-fade-in">{children}</main>
    </div>
  );
}
