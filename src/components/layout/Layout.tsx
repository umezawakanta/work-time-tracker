import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import {
  Home,
  Clock,
  BarChart2,
  Menu,
  X,
  LogOut,
  Settings,
  User,
  Crown,
  Target,
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
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  isPremium?: boolean;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: 'ホーム',
    path: '/',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: '統合ダッシュボード',
    path: '/integrated-dashboard',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: '勤怠管理',
    path: '/work-time',
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: 'レポート',
    path: '/work-time-reports',
  },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, setLocale } = useLocale();
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      ? 'flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors'
      : 'flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors';

    const activeClasses = isActive(item.path) ? 'bg-blue-100 text-blue-700' : 'text-gray-700';

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(baseClasses, activeClasses)}
        onClick={() => isMobile && setIsMenuOpen(false)}
      >
        {item.icon}
        <span className={isMobile ? 'text-base' : ''}>{item.label}</span>
        {item.isPremium && <Crown className="h-4 w-4 text-amber-500" />}
        {item.badge && (
          <Badge variant="secondary" className="text-xs">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴとナビゲーション */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">LifeSync</span>
              </Link>

              {/* デスクトップナビゲーション */}
              <nav className="hidden lg:flex items-center gap-1">
                {menuItems.map((item) => renderMenuItem(item))}
              </nav>
            </div>

            {/* ユーザーメニュー */}
            <div className="flex items-center gap-4">
              {/* 言語切替 */}
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
                title="言語選択"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>

              {/* ユーザードロップダウン */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name || 'ユーザー'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    プロフィール
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    設定
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* モバイルメニュー */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetHeader>
                    <SheetTitle className="text-left">メニュー</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-2 mt-6">
                    {menuItems.map((item) => renderMenuItem(item, true))}
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
  );
}
