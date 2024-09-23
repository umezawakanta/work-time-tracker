import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            作業時間トラッカー
          </Link>
          <nav>
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
