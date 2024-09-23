import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/"
                className="hover:text-secondary-foreground transition-colors"
              >
                ホーム
              </Link>
            </li>
            <li>
              <Link
                to="/work-time"
                className="hover:text-secondary-foreground transition-colors"
              >
                作業時間トラッカー
              </Link>
            </li>
            <li>
              <Link
                to="/reports"
                className="hover:text-secondary-foreground transition-colors"
              >
                レポート
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="flex-grow bg-background">{children}</main>
      <footer className="bg-primary text-primary-foreground p-4 text-center">
        © 2024 作業時間トラッカー
      </footer>
    </div>
  );
}
