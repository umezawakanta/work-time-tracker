import { Link } from "react-router-dom";
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
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { locale, setLocale } = useLocale();

  const handleLocaleChange = (value: string) => {
    setLocale(value as Locale);
  };

  const menuItems = [
    { icon: <Home size={18} />, label: "ホーム", path: "/" },
    { icon: <Clock size={18} />, label: "作業時間入力", path: "/work-time" },
    {
      icon: <BarChart2 size={18} />,
      label: "作業時間レポート",
      path: "/work-time-reports",
    },
    {
      icon: <BarChart2 size={18} />,
      label: "資産/負債レポート",
      path: "/asset-liability-report",
    },
    {
      icon: <CreditCard size={18} />,
      label: "サブスクリプション管理",
      path: "/subscription-management",
    },
    {
      icon: <Calendar size={18} />,
      label: "資産カレンダー",
      path: "/asset-calendar",
    },
    {
      icon: <Vote size={18} />,
      label: "選挙候補者",
      path: "/election-candidates",
    },
    { icon: <LogIn size={18} />, label: "ログイン", path: "/login" },
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
            ))}
            <Button
              variant="ghost"
              onClick={() =>
                handleLocaleChange(locale === "ja-JP" ? "en-US" : "ja-JP")
              }
            >
              {locale === "ja-JP" ? "日本語" : "English"}
            </Button>
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
