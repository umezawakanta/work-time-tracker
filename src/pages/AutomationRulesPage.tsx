/**
 * 🤖 統合自動化ルール管理ページ
 * ダッシュボード、タスク、ゲーミフィケーション、AI機能の完全自動化
 */

import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { RootState, AppDispatch } from '@/store';
import { addTodoItem } from '@/store/todoSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAutomatedTaskManagement } from '@/hooks/useAutomatedTaskManagement';
import { IntegratedAutomationDashboard } from '@/components/automation/IntegratedAutomationDashboard';
import { integratedAutomationService } from '@/services/automation/IntegratedAutomationService';
import {
  gameLoopAutomationIntegration,
  GameLoopAutomationStats,
} from '@/services/productivity/GameLoopAutomationIntegration';
import {
  Bot,
  Settings,
  Play,
  Pause,
  BarChart3,
  Zap,
  Crown,
  Shield,
  Activity,
  RefreshCw,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  Users,
  Globe,
  Lock,
} from 'lucide-react';

const AutomationRulesPage: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalRules: 0,
    activeRules: 0,
    executionsToday: 0,
    successRate: 0,
  });

  // ゲームループ自動化統計
  const [gameLoopAutomationStats, setGameLoopAutomationStats] =
    useState<GameLoopAutomationStats | null>(null);

  // Auth and User Data
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // Automated Task Management
  const { config, isAutomationActive, getAutomationStats } = useAutomatedTaskManagement();

  // モック統計データ
  const stats = getAutomationStats();

  // 自動化制御関数（実装済み）
  const startAutomation = async () => {
    setIsInitialized(false);
    try {
      console.log('🚀 Automation starting...');

      // 自動化サービスを開始
      const result = await fetch('/api/automation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          userId: user?.uid,
          config: config,
        }),
      });

      if (result.ok) {
        console.log('✅ Automation started successfully');
        toast.success('自動化が開始されました');
        // 統計データを更新
        const newStats = getAutomationStats();
        setAutomationStats(newStats);
      } else {
        throw new Error('自動化の開始に失敗しました');
      }
    } catch (error) {
      console.error('❌ Failed to start automation:', error);
      toast.error('自動化の開始に失敗しました');
    } finally {
      setIsInitialized(true);
    }
  };

  const stopAutomation = async () => {
    setIsInitialized(false);
    try {
      console.log('⏹️ Automation stopping...');

      const result = await fetch('/api/automation/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          userId: user?.uid,
        }),
      });

      if (result.ok) {
        console.log('✅ Automation stopped successfully');
        toast.success('自動化が停止されました');
      } else {
        throw new Error('自動化の停止に失敗しました');
      }
    } catch (error) {
      console.error('❌ Failed to stop automation:', error);
      toast.error('自動化の停止に失敗しました');
    } finally {
      setIsInitialized(true);
    }
  };

  const triggerAutomatedTaskGeneration = async () => {
    setIsInitialized(false);
    try {
      console.log('⚡ Manual task generation triggering...');

      const result = await fetch('/api/automation/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          userId: user?.uid,
          config: config,
        }),
      });

      if (result.ok) {
        const data = await result.json();
        console.log('✅ Tasks generated successfully:', data);
        toast.success(`${data.tasksGenerated}個のタスクが生成されました`);

        // タスクリストを更新
        if (data.tasks && data.tasks.length > 0) {
          // Redux storeにタスクを追加
          data.tasks.forEach((task) => {
            dispatch(addTodoItem(task));
          });
        }
      } else {
        throw new Error('タスク生成に失敗しました');
      }
    } catch (error) {
      console.error('❌ Failed to generate tasks:', error);
      toast.error('タスク生成に失敗しました');
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    initializeAutomationPage();
  }, []);

  const initializeAutomationPage = async () => {
    try {
      setIsInitialized(true);

      // Get automation system stats
      const dashboardData = integratedAutomationService.getDashboardData();
      setSystemStats({
        totalRules: dashboardData.totalRules,
        activeRules: dashboardData.activeRules,
        executionsToday: dashboardData.executionsToday,
        successRate: dashboardData.successRate,
      });

      // Get game loop automation stats
      const gameLoopStats = gameLoopAutomationIntegration.getStats();
      setGameLoopAutomationStats(gameLoopStats);

      console.log('🤖 Automation rules page initialized', {
        systemStats: dashboardData,
        gameLoopStats,
      });
    } catch (error) {
      console.error('Automation page initialization failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout title="統合自動化ルール" subtitle="ログインが必要です">
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            自動化ルール管理機能を利用するにはログインが必要です。
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="🤖 統合自動化ルール管理"
      subtitle="ダッシュボード・タスク・ゲーミフィケーション・AI機能の完全自動化"
      badge={{
        text: hasActiveSubscription ? 'プレミアム' : 'スタンダード',
        variant: hasActiveSubscription ? 'default' : 'secondary',
        icon: <Bot className="w-4 h-4" />,
      }}
      actions={
        <div className="flex items-center gap-3">
          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span>ルール: {systemStats.totalRules}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>有効: {systemStats.activeRules}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>今日: {systemStats.executionsToday}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              <span>成功率: {Math.round(systemStats.successRate)}%</span>
            </div>
          </div>

          {/* Automation Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={isAutomationActive ? 'default' : 'outline'}
              onClick={isAutomationActive ? stopAutomation : startAutomation}
              className="flex items-center gap-2"
            >
              {isAutomationActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  停止
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  開始
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={triggerAutomatedTaskGeneration}
              disabled={!isAutomationActive}
            >
              <Zap className="w-4 h-4 mr-2" />
              手動実行
            </Button>

            <Button variant="outline" onClick={initializeAutomationPage}>
              <RefreshCw className="w-4 h-4 mr-2" />
              更新
            </Button>
          </div>
        </div>
      }
      headerGradient
    >
      <div className="space-y-6">
        {/* ゲームループ自動化統計 */}
        {gameLoopAutomationStats && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">🎮 ゲームループ自動化システム</h3>
                  <p className="text-sm text-purple-700">プロシージネーション対策の自動化</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/game-loop-tasks', '_blank')}
                className="bg-white hover:bg-purple-50"
              >
                <Play className="w-4 h-4 mr-2" />
                ダッシュボード
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">アクティブルール</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  {gameLoopAutomationStats.activeRules}
                </div>
                <div className="text-xs text-blue-600">
                  / {gameLoopAutomationStats.totalRules} 総ルール
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">今日のトリガー</span>
                </div>
                <div className="text-2xl font-bold text-green-800">
                  {gameLoopAutomationStats.todayTriggers}
                </div>
                <div className="text-xs text-green-600">実行回数</div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">自動分解</span>
                </div>
                <div className="text-2xl font-bold text-purple-800">
                  {gameLoopAutomationStats.autoBreakdownsCreated}
                </div>
                <div className="text-xs text-purple-600">タスク生成</div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">支援実行</span>
                </div>
                <div className="text-2xl font-bold text-orange-800">
                  {gameLoopAutomationStats.motivationBoostsDelivered}
                </div>
                <div className="text-xs text-orange-600">モチベーション向上</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                🧠 自動化ルール詳細
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>プロシージネーション警告</strong>
                  <p className="text-gray-600">30分未着手タスクへの自動介入</p>
                </div>
                <div>
                  <strong>ストリーク祝福システム</strong>
                  <p className="text-gray-600">連続完了時の自動ご褒美</p>
                </div>
                <div>
                  <strong>朝ルーチン自動生成</strong>
                  <p className="text-gray-600">毎朝6時の自動タスク作成</p>
                </div>
                <div>
                  <strong>フロー継続支援</strong>
                  <p className="text-gray-600">完了時の次タスク自動提案</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* System Status Alert */}
        {!isInitialized && (
          <Alert>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <AlertDescription>統合自動化システムを初期化中...</AlertDescription>
          </Alert>
        )}

        {/* Automation Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">自動化状態</h3>
                <p className="text-sm text-blue-700">{isAutomationActive ? '実行中' : '停止中'}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">自動タスク</h3>
                <p className="text-sm text-green-700">{stats.automatedTasksCreated}個作成済み</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">時間短縮</h3>
                <p className="text-sm text-purple-700">{stats.timeSaved}分節約</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">成功率</h3>
                <p className="text-sm text-orange-700">{stats.automationSuccessRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Automation Dashboard */}
        <IntegratedAutomationDashboard
          compactMode={false}
          showAdvancedFeatures={hasActiveSubscription}
        />

        {/* Integration Benefits Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-blue-600" />
            統合自動化の効果
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">時間効率化</h4>
              <p className="text-sm text-gray-600">
                ルーチンタスクの自動化により、創造的作業に集中できます
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">精度向上</h4>
              <p className="text-sm text-gray-600">
                人的ミスを削減し、一貫性のあるワークフローを実現
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">継続的改善</h4>
              <p className="text-sm text-gray-600">
                AI分析により自動化ルールが継続的に最適化されます
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Features for Premium Users */}
        {hasActiveSubscription && (
          <div className="p-6 bg-gradient-to-r from-gold-50 to-yellow-50 rounded-xl border border-yellow-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-600" />
              プレミアム自動化機能
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Bot className="w-4 h-4 text-yellow-600" />
                <span>AI駆動自動化</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-yellow-600" />
                <span>チーム自動化</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-yellow-600" />
                <span>クラウド同期</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-yellow-600" />
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
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">プレミアムで自動化を極める</h3>
                  <p className="text-sm text-gray-600">
                    AI駆動自動化、チーム機能、高度なカスタマイズで生産性を革命的に向上
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

export default AutomationRulesPage;
