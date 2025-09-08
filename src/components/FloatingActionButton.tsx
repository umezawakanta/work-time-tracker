import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle2,
  Plus,
  X,
  Home,
  BarChart3,
  Clock,
  Target,
  Calendar,
  BookOpen,
  Settings,
} from 'lucide-react';

interface FloatingActionButtonProps {
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      name: '毎日20のこと',
      path: '/daily-10-tasks',
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      description: '毎日必ずやる20のタスク',
    },
    {
      name: 'ホーム',
      path: '/',
      icon: <Home className="w-5 h-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'メインダッシュボード',
    },
    {
      name: '統合ダッシュボード',
      path: '/integrated-dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'プロジェクト統合管理',
    },
    {
      name: '勤怠管理',
      path: '/work-time-reports',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: '作業時間分析',
    },
    {
      name: '4象限マトリックス',
      path: '/quadrant-dashboard',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'AI駆動タスク分類',
    },
    {
      name: 'カレンダー',
      path: '/calendar',
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-pink-500 hover:bg-pink-600',
      description: 'スケジュール管理',
    },
    {
      name: '本棚',
      path: '/bookshelf',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-teal-500 hover:bg-teal-600',
      description: '読書習慣管理',
    },
    {
      name: 'サイトマップ',
      path: '/sitemap',
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: '全機能一覧',
    },
  ];

  return (
    <>
      <style>{`
        /* フローティングボタンのモバイル対応 */
        @media (max-width: 768px) {
          .floating-action-button {
            bottom: calc(5rem + env(safe-area-inset-bottom)) !important;
            right: 1rem !important;
          }
          
          .floating-action-menu {
            bottom: calc(9rem + env(safe-area-inset-bottom)) !important;
            right: 1rem !important;
            width: calc(100vw - 2rem) !important;
            max-width: 20rem !important;
          }
        }
        
        @media (min-width: 769px) {
          .floating-action-button {
            bottom: 1.5rem !important;
            right: 1.5rem !important;
          }
        }
      `}</style>
      <div className={`fixed z-50 floating-action-button ${className}`}>
        {/* 展開されたメニュー */}
        {isExpanded && (
          <Card className="mb-4 w-80 shadow-2xl border-0 bg-white/95 backdrop-blur-sm floating-action-menu">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">クイックアクセス</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.path}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate(action.path);
                      setIsExpanded(false);
                    }}
                    className="h-auto p-3 justify-start hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={`p-1 rounded ${action.color} text-white`}>{action.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-medium">{action.name}</div>
                        <div className="text-xs text-gray-500 truncate">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* メインボタン */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
            isExpanded
              ? 'bg-red-500 hover:bg-red-600 rotate-45'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          {isExpanded ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>
    </>
  );
};
