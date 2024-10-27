import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/useLocale";
import { Locale } from "@/context/LocaleContext";
import {
  Home,
  Clock,
  BarChart2,
  CreditCard,
  Calendar,
  Vote,
  LogIn,
  LogOut,
  BookOpen,
  Moon,
  Menu,
  X,
  Pen,
  User,
  GitBranch,
} from "lucide-react";
import { logout } from "@/services/api/authApi";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, user, fetchUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  const handleLocaleChange = (value: string) => {
    setLocale(value as Locale);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    toast.success("ログアウトしました");
    navigate("/login");
  };

  const menuItems = [
    { icon: <Home size={18} />, label: "ホーム", path: "/", authRequired: true },
    { icon: <Clock size={18} />, label: "作業時間入力", path: "/work-time", authRequired: true },
    { icon: <BarChart2 size={18} />, label: "作業時間レポート", path: "/work-time-reports", authRequired: true },
    { icon: <BarChart2 size={18} />, label: "資産/負債レポート", path: "/asset-liability-report", authRequired: true },
    { icon: <CreditCard size={18} />, label: "サブスクリプション管理", path: "/subscription-management", authRequired: true },
    { icon: <Calendar size={18} />, label: "資産カレンダー", path: "/asset-calendar", authRequired: true },
    { icon: <Vote size={18} />, label: "選挙候補者", path: "/election-candidates", authRequired: false },
    { icon: <BookOpen size={18} />, label: "ネット本棚", path: "/bookshelf", authRequired: true },
    { icon: <Moon size={18} />, label: "睡眠トラッカー", path: "/sleep-tracker", authRequired: true },
    { icon: <Pen size={18} />, label: "ブログ", path: "/blog", authRequired: true },
    { icon: <User size={18} />, label: "プロフィール", path: "/profile", authRequired: true },
    { icon: <GitBranch size={18} />, label: "WBS作成ツール", path: "/wbs-creator", authRequired: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">
              <div className="flex flex-col items-center">
                <span>作業時間</span>
                <span>トラッカー</span>
              </div>
            </Link>
            <div className="md:hidden">
              <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
            <nav className="hidden md:flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">メニュー</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {menuItems.map((item) =>
                    (isAuthenticated || !item.authRequired) && (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="flex items-center px-3 py-2">
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                onClick={() => handleLocaleChange(locale === "ja-JP" ? "en-US" : "ja-JP")}
              >
                {locale === "ja-JP" ? "日本語" : "English"}
              </Button>
              {isAuthenticated ? (
                <>
                  <span className="text-sm font-medium text-gray-700 mr-4">
                    ようこそ、{user?.name || '読み込み中...'}さん
                  </span>
                  <Button variant="ghost" onClick={handleLogout} className="flex items-center px-3 py-2">
                    <LogOut size={18} />
                    <span className="ml-2">ログアウト</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="flex items-center px-3 py-2"
                >
                  <LogIn size={18} />
                  <span className="ml-2">ログイン</span>
                </Button>
              )}
            </nav>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map(
                (item) =>
                  (isAuthenticated || !item.authRequired) && (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Link>
                  )
              )}
              <Button
                variant="ghost"
                onClick={() => handleLocaleChange(locale === "ja-JP" ? "en-US" : "ja-JP")}
                className="w-full justify-start"
              >
                {locale === "ja-JP" ? "日本語" : "English"}
              </Button>
              {isAuthenticated ? (
                <>
                  <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-700">
                    ようこそ、{user?.name || '読み込み中...'}さん
                  </span>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start flex items-center px-3 py-2"
                  >
                    <LogOut size={18} />
                    <span className="ml-2">ログアウト</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="w-full justify-start flex items-center px-3 py-2"
                >
                  <LogIn size={18} />
                  <span className="ml-2">ログイン</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-gray-100 text-gray-600">
        <div className="container mx-auto px-4 py-6 text-center">
          &copy; 2024 作業時間トラッカー. All rights reserved.
        </div>
      </footer>
    </div>
  );
}