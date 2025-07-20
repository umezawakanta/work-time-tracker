/**
 * 🚀 究極統合ダッシュボードページ
 * ホーム、統合ダッシュボード、タスク管理、ゲーミフィケーションの完全統合ページ
 */

import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import SuperIntegratedDashboard from '@/components/dashboard/SuperIntegratedDashboard';
import {
  Crown,
  Sparkles,
  Shield,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Activity,
  BarChart3,
  Brain,
  CheckSquare,
  Trophy,
  Star,
  Flame,
  Target,
  Users,
  Globe,
  Lightbulb,
  Zap,
} from 'lucide-react';

const SuperIntegratedDashboardPage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<
    'overview' | 'tasks' | 'gamification' | 'ai' | 'analytics' | 'settings'
  >('overview');
  const [isInitialized, setIsInitialized] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // Auth and User Data
  const { user, isAuthenticated } = useAuth();
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);
  const todos = useSelector((state: RootState) => state.todo.items);

  // Statistics for header
  const todayCompletedTasks = todos.filter(
    (todo) =>
      todo.completed &&
      todo.completedDate &&
      new Date(todo.completedDate).toDateString() === new Date().toDateString()
  ).length;

  const totalPendingTasks = todos.filter((todo) => !todo.completed).length;
  const highPriorityTasks = todos.filter((todo) => !todo.completed && todo.priority >= 4).length;

  useEffect(() => {
    // Initialize super dashboard system
    const initializeSystem = async () => {
      if (isAuthenticated && user) {
        try {
          setIsInitialized(true);
          console.log('🚀 Super Integrated Dashboard system initialized for:', user.email);
        } catch (error) {
          console.error('Super dashboard initialization failed:', error);
        }
      }
    };

    initializeSystem();
  }, [isAuthenticated, user]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exportDashboardData = () => {
    // Export dashboard configuration and data
    console.log('Exporting dashboard data...');
    // Implementation would go here
  };

  const importDashboardData = () => {
    // Import dashboard configuration
    console.log('Importing dashboard data...');
    // Implementation would go here
  };

  const shareDashboard = () => {
    // Share dashboard view or configuration
    console.log('Sharing dashboard...');
    // Implementation would go here
  };

  const resetDashboard = () => {
    // Reset to default configuration
    console.log('Resetting dashboard...');
    // Implementation would go here
  };

  if (!isAuthenticated) {
    return (
      <PageLayout title="究極統合ダッシュボード" subtitle="ログインが必要です">
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            究極統合ダッシュボードを利用するにはログインが必要です。
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="🚀 究極統合ダッシュボード"
      subtitle="すべてのシステムが統合された次世代プラットフォーム"
      badge={{
        text: hasActiveSubscription ? 'プレミアム' : 'スタンダード',
        variant: hasActiveSubscription ? 'default' : 'secondary',
        icon: <Crown className="w-4 h-4" />,
      }}
      actions={
        <div className="flex items-center gap-3">
          {/* Quick Stats in Header */}
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-green-500" />
              <span>完了: {todayCompletedTasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span>保留: {totalPendingTasks}</span>
            </div>
            {highPriorityTasks > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500" />
                <span>緊急: {highPriorityTasks}</span>
              </div>
            )}
          </div>

          {/* Dashboard Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompactMode(!compactMode)}
              title="コンパクトモード切り替え"
            >
              {compactMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title="フルスクリーン切り替え"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportDashboardData}
              title="データエクスポート"
            >
              <Download className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={shareDashboard} title="ダッシュボード共有">
              <Share2 className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={resetDashboard} title="リセット">
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              設定
            </Button>
          </div>
        </div>
      }
      headerGradient
    >
      <div className="space-y-6">
        {/* System Status Alert */}
        {!isInitialized && (
          <Alert>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <AlertDescription>究極統合ダッシュボードシステムを初期化中...</AlertDescription>
          </Alert>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">リアルタイム分析</h3>
                <p className="text-sm text-blue-700">瞬時にデータを可視化</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">AI統合</h3>
                <p className="text-sm text-green-700">知能的な支援機能</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">ゲーミフィケーション</h3>
                <p className="text-sm text-purple-700">モチベーション向上</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckSquare className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">統合管理</h3>
                <p className="text-sm text-orange-700">すべてを一元化</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Component */}
        <SuperIntegratedDashboard
          userId={user?.uid || 'anonymous'}
          defaultView={dashboardMode}
          compactMode={compactMode}
          enableCustomization={true}
        />

        {/* Integration Benefits Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            統合の力
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">リアルタイム同期</h4>
              <p className="text-sm text-gray-600">
                すべてのシステムがリアルタイムで同期し、常に最新の情報を提供
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">知能的分析</h4>
              <p className="text-sm text-gray-600">
                AIがユーザーの行動を分析し、最適な提案とインサイトを提供
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">効率化の極致</h4>
              <p className="text-sm text-gray-600">
                統合されたワークフローにより、作業効率を最大限に向上
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Features for Premium Users */}
        {hasActiveSubscription && (
          <div className="p-6 bg-gradient-to-r from-gold-50 to-yellow-50 rounded-xl border border-yellow-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-600" />
              プレミアム限定機能
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <span>高度なAI分析</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-yellow-600" />
                <span>チーム協力機能</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-yellow-600" />
                <span>クラウド同期</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-yellow-600" />
                <span>高度なセキュリティ</span>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Prompt for Standard Users */}
        {!hasActiveSubscription && (
          <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">プレミアムでさらなる可能性を</h3>
                  <p className="text-sm text-gray-600">
                    高度なAI分析、チーム機能、クラウド同期などの機能でワークフローを劇的に改善
                  </p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">アップグレード</Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SuperIntegratedDashboardPage;
