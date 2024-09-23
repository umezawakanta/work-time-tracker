import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:text-gray-300">
                ホーム
              </Link>
            </li>
            <li>
              <Link to="/work-time" className="hover:text-gray-300">
                作業時間トラッカー
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2024 作業時間トラッカー
      </footer>
    </div>
  );
}
