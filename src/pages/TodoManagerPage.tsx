import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import DailyTodoReminder from '@/components/dailyToDoReminder/DailyTodoReminder';
import AITaskSuggestions from '@/components/ai/AITaskSuggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  CheckSquare,
  Plus,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Settings,
  Play,
  Zap,
  Brain,
  MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gameLoopTaskService, GameLoopStats } from '@/services/productivity/GameLoopTaskService';
import { useState, useEffect } from 'react';

const TodoManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // ゲームループシステム連携
  const [gameLoopStats, setGameLoopStats] = useState<GameLoopStats | null>(null);
  const [showGameLoopIntegration, setShowGameLoopIntegration] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  useEffect(() => {
    try {
      const stats = gameLoopTaskService.getGameLoopStats();
      setGameLoopStats(stats);

      // ゲームループタスクが存在する場合、統合オプションを表示
      if (stats.totalTasksCompleted > 0) {
        setShowGameLoopIntegration(true);
      }
    } catch (error) {
      console.error('Failed to load game loop stats:', error);
    }
  }, []);

  return (
    <PageLayout
      title="ToDo管理"
      subtitle="日々のタスクを効率的に管理し、生産性を向上させましょう"
      badge={{
        text: hasActiveSubscription ? 'プレミアム' : 'スタンダード',
        variant: hasActiveSubscription ? 'default' : 'secondary',
        icon: <CheckSquare className="w-4 h-4" />,
      }}
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/ai-assistant')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            AIチャット
          </Button>
          <Button
            variant={showAIAnalysis ? 'default' : 'outline'}
            onClick={() => setShowAIAnalysis(!showAIAnalysis)}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            AI分析
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/integrated-dashboard')}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            プロジェクト
          </Button>
          <Button
            onClick={() => navigate('/work-time-reports')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            レポート
          </Button>
        </div>
      }
      headerGradient
    >
      <div className="space-y-8">
        {/* メインのDailyTodoReminder */}
        <div className="col-span-full">
          <DailyTodoReminder isPremium={hasActiveSubscription} />
        </div>

        {/* AI分析セクション */}
        {showAIAnalysis && (
          <div className="col-span-full">
            <AITaskSuggestions />
          </div>
        )}

        {/* ゲームループシステム統合 */}
        {showGameLoopIntegration && gameLoopStats && (
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Play className="w-5 h-5 text-white" />
                </div>
                🎮 ゲームループ・タスクシステム連携
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/game-loop-tasks')}
                    className="bg-white hover:bg-purple-50"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    切り替える
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-purple-700">
                    {gameLoopStats.tasksCompletedToday}
                  </div>
                  <div className="text-xs text-purple-600">今日の完了</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-orange-700">
                    {gameLoopStats.currentStreak}
                  </div>
                  <div className="text-xs text-orange-600">連続ストリーク</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-green-700">
                    {gameLoopStats.feedbackJarCount}
                  </div>
                  <div className="text-xs text-green-600">フィードバック瓶</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-blue-700">
                    {Math.round(gameLoopStats.averageTaskTime)}分
                  </div>
                  <div className="text-xs text-blue-600">平均実行時間</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  🧠 プロシージネーション対策
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  通常のToDoリストで先延ばしに悩んでいませんか？
                  ゲームループシステムはタスクを2-5分のマイクロタスクに分解し、
                  即座のフィードバックでやる気を維持します。
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate('/game-loop-tasks')}
                    className="bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    ゲームループを試す
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // 従来ToDoからゲームループへの変換機能
                      alert('従来ToDoのゲームループ変換機能は開発中です');
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    既存ToDoを変換
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 追加の機能カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                今日の予定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">カレンダーと連携してタスクを効率的に管理</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/calendar')}
                className="w-full"
              >
                カレンダーを見る
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                生産性分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">完了率やパフォーマンスの詳細分析</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/work-time-reports')}
                className="w-full"
              >
                レポートを見る
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-purple-600" />
                設定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">通知設定や表示オプションのカスタマイズ</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="w-full"
              >
                設定を開く
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* プレミアム機能の案内 */}
        {!hasActiveSubscription && (
          <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    プレミアム機能でさらに効率的に
                  </h3>
                  <p className="text-slate-600">
                    AI分析、無制限のプロジェクト、高度なレポート機能をご利用いただけます
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/subscription-management')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  アップグレード
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default TodoManagerPage;
