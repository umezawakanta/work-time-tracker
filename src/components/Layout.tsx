import React from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground shadow-md">
        <nav className="container mx-auto px-4 py-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:underline">
                ホーム
              </Link>
            </li>
            <li>
              <Link to="/work-time" className="hover:underline">
                作業時間
              </Link>
            </li>
            {/* 必要に応じてナビゲーション項目を追加 */}
          </ul>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>

      <footer className="bg-primary text-primary-foreground mt-auto">
        <div className="container mx-auto px-4 py-4 text-center">
          © {new Date().getFullYear()} 作業時間トラッカー
        </div>
      </footer>
    </div>
  );
}
