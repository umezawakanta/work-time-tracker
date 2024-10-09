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
} from "lucide-react";
import { logout } from "@/services/api/authApi";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();

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
    {
      icon: <BarChart2 size={18} />,
      label: "作業時間レポート",
      path: "/work-time-reports",
      authRequired: true,
    },
    {
      icon: <BarChart2 size={18} />,
      label: "資産/負債レポート",
      path: "/asset-liability-report",
      authRequired: true,
    },
    {
      icon: <CreditCard size={18} />,
      label: "サブスクリプション管理",
      path: "/subscription-management",
      authRequired: true,
    },
    {
      icon: <Calendar size={18} />,
      label: "資産カレンダー",
      path: "/asset-calendar",
      authRequired: true,
    },
    {
      icon: <Vote size={18} />,
      label: "選挙候補者",
      path: "/election-candidates",
      authRequired: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2 flex items-center">
          <div className="flex-shrink-0 mr-10">
            <Link to="/" className="text-2xl font-bold text-primary">
              <div className="flex flex-col items-center">
                <span>作業時間</span>
                <span>トラッカー</span>
              </div>
            </Link>
          </div>
          <nav className="flex-grow flex justify-end items-center space-x-1">
            {menuItems.map((item) => (
              (isAuthenticated || !item.authRequired) && (
                <Button
                  key={item.path}
                  variant="ghost"
                  asChild
                  className="flex items-center px-3 py-2"
                >
                  <Link to={item.path}>
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Link>
                </Button>
              )
            ))}
            <Button
              variant="ghost"
              onClick={() =>
                handleLocaleChange(locale === "ja-JP" ? "en-US" : "ja-JP")
              }
            >
              {locale === "ja-JP" ? "日本語" : "English"}
            </Button>
            {isAuthenticated ? (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center px-3 py-2"
              >
                <LogOut size={18} />
                <span className="ml-2">ログアウト</span>
              </Button>
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