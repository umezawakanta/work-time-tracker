/**
 * 🧭 統一システムナビゲーション
 *
 * ゲームループ、従来タスク、自動化、勤怠管理、ダッシュボード間のシームレスな移動
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { gameLoopTaskService, GameLoopStats } from '@/services/productivity/GameLoopTaskService';
import {
  gameLoopAutomationIntegration,
  GameLoopAutomationStats,
} from '@/services/productivity/GameLoopAutomationIntegration';
import {
  Play,
  BarChart3,
  CheckSquare,
  Clock,
  Settings,
  Target,
  Home,
  Calendar,
  Brain,
  Zap,
  Workflow,
  TrendingUp,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  Activity,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface SystemStatus {
  name: string;
  path: string;
  icon: React.ReactNode;
  status: 'active' | 'available' | 'disabled';
  stats?: string;
  description: string;
  category: 'core' | 'productivity' | 'automation' | 'analysis';
}

interface UnifiedSystemNavigationProps {
  compactMode?: boolean;
  showStats?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const UnifiedSystemNavigation: React.FC<UnifiedSystemNavigationProps> = ({
  compactMode = false,
  showStats = true,
  orientation = 'horizontal',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(!compactMode);
  const [gameLoopStats, setGameLoopStats] = useState<GameLoopStats | null>(null);
  const [automationStats, setAutomationStats] = useState<GameLoopAutomationStats | null>(null);

  // Load system statistics
  useEffect(() => {
    try {
      const stats = gameLoopTaskService.getGameLoopStats();
      const autoStats = gameLoopAutomationIntegration.getStats();

      setGameLoopStats(stats);
      setAutomationStats(autoStats);
    } catch (error) {
      console.error('Failed to load system stats:', error);
    }
  }, []);

  // System definitions
  const systems: SystemStatus[] = [
    {
      name: 'ホーム',
      path: '/',
      icon: <Home className="w-4 h-4" />,
      status: 'active',
      description: 'メインダッシュボード',
      category: 'core',
    },
    {
      name: '統合ダッシュボード',
      path: '/integrated-dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
      status: 'active',
      description: 'プロジェクト統合管理',
      category: 'core',
    },
    {
      name: 'ゲームループタスク',
      path: '/game-loop-tasks',
      icon: <Play className="w-4 h-4" />,
      status: gameLoopStats?.totalTasksCompleted ? 'active' : 'available',
      stats: gameLoopStats ? `${gameLoopStats.tasksCompletedToday}完了` : undefined,
      description: 'プロシージネーション対策',
      category: 'productivity',
    },
    {
      name: '従来タスク',
      path: '/todos',
      icon: <CheckSquare className="w-4 h-4" />,
      status: 'active',
      description: '標準ToDo管理',
      category: 'productivity',
    },
    {
      name: '自動化ルール',
      path: '/automation-rules',
      icon: <Settings className="w-4 h-4" />,
      status: 'active',
      stats: automationStats ? `${automationStats.activeRules}稼働中` : undefined,
      description: 'システム自動化',
      category: 'automation',
    },
    {
      name: '勤怠管理',
      path: '/work-time-reports',
      icon: <Clock className="w-4 h-4" />,
      status: 'active',
      description: '作業時間分析',
      category: 'analysis',
    },
    {
      name: 'カレンダー',
      path: '/calendar',
      icon: <Calendar className="w-4 h-4" />,
      status: 'active',
      description: 'スケジュール管理',
      category: 'core',
    },
    {
      name: 'AI統合',
      path: '/multi-ai',
      icon: <Brain className="w-4 h-4" />,
      status: 'available',
      description: 'AI機能統合',
      category: 'automation',
    },
    {
      name: '開発バッジ',
      path: '/development-badges',
      icon: <Trophy className="w-4 h-4" />,
      status: 'active',
      description: '開発進捗管理',
      category: 'analysis',
    },
  ];

  const currentSystem = systems.find((system) => system.path === location.pathname);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core':
        return <Home className="w-3 h-3" />;
      case 'productivity':
        return <Target className="w-3 h-3" />;
      case 'automation':
        return <Zap className="w-3 h-3" />;
      case 'analysis':
        return <TrendingUp className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core':
        return 'text-blue-600 bg-blue-50';
      case 'productivity':
        return 'text-purple-600 bg-purple-50';
      case 'automation':
        return 'text-green-600 bg-green-50';
      case 'analysis':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'available':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'disabled':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const groupedSystems = systems.reduce(
    (acc, system) => {
      if (!acc[system.category]) {
        acc[system.category] = [];
      }
      acc[system.category].push(system);
      return acc;
    },
    {} as Record<string, SystemStatus[]>
  );

  if (compactMode && !isExpanded) {
    return (
      <Card className="w-fit">
        <CardContent className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2"
          >
            <Workflow className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">🧭 システムナビゲーション</h3>
            {currentSystem && (
              <Badge variant="outline" className="ml-2">
                現在: {currentSystem.name}
              </Badge>
            )}
          </div>

          {compactMode && (
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
              <ChevronUp className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* システム統計概要 */}
        {showStats && gameLoopStats && automationStats && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3 text-purple-600" />
                <span>今日: {gameLoopStats.tasksCompletedToday}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-green-600" />
                <span>自動化: {automationStats.todayTriggers}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-orange-600" />
                <span>ストリーク: {gameLoopStats.currentStreak}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>効率: {gameLoopStats.currentStreak > 5 ? '高' : '標準'}</span>
              </div>
            </div>
          </div>
        )}

        {/* システム一覧 */}
        <div className={orientation === 'horizontal' ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
          {Object.entries(groupedSystems).map(([category, systemList]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1 rounded ${getCategoryColor(category)}`}>
                  {getCategoryIcon(category)}
                </div>
                <h4 className="text-sm font-medium capitalize">{category}</h4>
              </div>

              <div
                className={
                  orientation === 'horizontal'
                    ? 'grid grid-cols-2 md:grid-cols-4 gap-2'
                    : 'space-y-2'
                }
              >
                {systemList.map((system) => (
                  <Button
                    key={system.path}
                    variant={system.path === location.pathname ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => navigate(system.path)}
                    disabled={system.status === 'disabled'}
                    className={`justify-start h-auto p-3 ${
                      system.path === location.pathname ? 'bg-purple-600 hover:bg-purple-700' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <div className="mt-0.5">{system.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-medium">{system.name}</div>
                        <div className="text-xs opacity-75 truncate">{system.description}</div>
                        {system.stats && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {system.stats}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* クイックアクション */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/game-loop-tasks')}
              className="flex items-center gap-2"
            >
              <Play className="w-3 h-3" />
              ゲームループ開始
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/integrated-dashboard')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-3 h-3" />
              統合分析
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // すべてのシステムを新しいタブで開く
                [
                  '/game-loop-tasks',
                  '/integrated-dashboard',
                  '/automation-rules',
                  '/work-time-reports',
                  '/development-badges',
                ].forEach((path) => {
                  window.open(path, '_blank');
                });
              }}
              className="flex items-center gap-2"
            >
              <Users className="w-3 h-3" />
              一括表示
            </Button>
          </div>
        </div>

        {/* システム統合効果 */}
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">🔗 システム統合効果</span>
          </div>
          <p className="text-xs text-gray-700">
            すべてのシステムが連携してプロシージネーション対策、生産性向上、
            自動化の最適化を実現。データは相互に共有され、
            あなたの作業パターンに最適化されたサポートを提供します。
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
