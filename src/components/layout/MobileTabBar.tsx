import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Calendar, Settings } from 'lucide-react';

const MobileTabBar: React.FC = () => {
  const { pathname } = useLocation();
  const is = (p: string) => pathname === p || pathname.startsWith(p + '/');
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sm:hidden">
      <ul className="grid grid-cols-4">
        <li>
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-2 text-xs ${is('/') ? 'text-blue-600' : 'text-slate-600'}`}
            aria-label="ホーム"
          >
            <Home className="h-5 w-5" />
            <span className="mt-0.5">ホーム</span>
          </Link>
        </li>
        <li>
          <Link
            to="/tasks"
            className={`flex flex-col items-center justify-center py-2 text-xs ${is('/tasks') ? 'text-blue-600' : 'text-slate-600'}`}
            aria-label="タスク"
          >
            <Target className="h-5 w-5" />
            <span className="mt-0.5">タスク</span>
          </Link>
        </li>
        <li>
          <Link
            to="/calendar"
            className={`flex flex-col items-center justify-center py-2 text-xs ${is('/calendar') ? 'text-blue-600' : 'text-slate-600'}`}
            aria-label="カレンダー"
          >
            <Calendar className="h-5 w-5" />
            <span className="mt-0.5">予定</span>
          </Link>
        </li>
        <li>
          <Link
            to="/settings"
            className={`flex flex-col items-center justify-center py-2 text-xs ${is('/settings') ? 'text-blue-600' : 'text-slate-600'}`}
            aria-label="設定"
          >
            <Settings className="h-5 w-5" />
            <span className="mt-0.5">設定</span>
          </Link>
        </li>
      </ul>
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  );
};

export default MobileTabBar;
