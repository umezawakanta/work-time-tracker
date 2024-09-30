import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/hooks/useLocale";
import { Locale } from "@/context/LocaleContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { locale, setLocale } = useLocale();

  const handleLocaleChange = (value: string) => {
    setLocale(value as Locale);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            作業時間トラッカー
          </Link>
          <nav className="flex items-center space-x-4">
            <ul className="flex space-x-4">
              <li>
                <Button variant="ghost" asChild>
                  <Link to="/">ホーム</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild>
                  <Link to="/work-time">作業時間入力</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild>
                  <Link to="/reports">レポート</Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" asChild>
                  <Link to="/login">ログイン</Link>
                </Button>
              </li>
            </ul>
            <Select onValueChange={handleLocaleChange} value={locale}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="言語を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ja-JP">日本語</SelectItem>
                <SelectItem value="en-US">English</SelectItem>
              </SelectContent>
            </Select>
          </nav>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-secondary text-secondary-foreground mt-8">
        <div className="container mx-auto px-4 py-6 text-center">
          &copy; 2024 作業時間トラッカー. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
