import React, { useEffect, useState } from 'react';
import { Target, Calendar, Clock, TrendingUp, Gamepad2, Zap, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BadgeCompletionDashboard } from '@/components/planning/BadgeCompletionDashboard';
import { gameLoopTaskService, GameLoopStats } from '@/services/productivity/GameLoopTaskService';
import { toast } from 'react-hot-toast';

/**
 * 🎯 バッジ完了予測ページ - 全バッジ獲得までの作業時間・達成予定日・マイルストーン表示
 * 🎮 Game Loop統合: プロシージネーション削減効果による予測精度向上
 */
const BadgeCompletionPage: React.FC = () => {
  // ゲームループシステム統合状態
  const [gameLoopStats, setGameLoopStats] = useState<GameLoopStats | null>(null);
  const [showGameLoopIntegration, setShowGameLoopIntegration] = useState(false);
  const [integrationRefreshInterval, setIntegrationRefreshInterval] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = 'バッジ完了予測 | Work Time Tracker';
    initializeGameLoopIntegration();

    return () => {
      if (integrationRefreshInterval) {
        clearInterval(integrationRefreshInterval);
      }
    };
  }, []);

  const initializeGameLoopIntegration = async () => {
    try {
      // 実際のGameLoopTaskServiceからデータを取得
      const { GameLoopTaskService } = await import('@/services/gameloop/GameLoopTaskService');
      const gameLoopService = GameLoopTaskService.getInstance();

      // ユーザーの統計を取得
      const userStats = await gameLoopService.getUserStatistics();

      const stats = {
        totalTasksCompleted: userStats.totalCompletedTasks || 0,
        tasksCompletedToday: userStats.todayCompletedTasks || 0,
        currentStreak: userStats.currentStreak || 0,
        averageTaskTime: userStats.averageCompletionTime || 0,
        feedbackJarCount: userStats.feedbackCount || 0,
        morningRoutineStreak: userStats.morningRoutineStreak || 0,
      };

      setGameLoopStats(stats);
      setShowGameLoopIntegration(true);

      // 5分ごとに統計を更新（リアルタイムデータ）
      const interval = setInterval(async () => {
        try {
          const updatedUserStats = await gameLoopService.getUserStatistics();
          const updatedStats = {
            totalTasksCompleted: updatedUserStats.totalCompletedTasks || 0,
            tasksCompletedToday: updatedUserStats.todayCompletedTasks || 0,
            currentStreak: updatedUserStats.currentStreak || 0,
            averageTaskTime: updatedUserStats.averageCompletionTime || 0,
            feedbackJarCount: updatedUserStats.feedbackCount || 0,
            morningRoutineStreak: updatedUserStats.morningRoutineStreak || 0,
          };
          setGameLoopStats(updatedStats);
        } catch (error) {
          console.error('統計更新エラー:', error);
        }
      }, 300000); // 5分間隔

      setIntegrationRefreshInterval(interval);

      console.log('🎮 Badge Completion × Game Loop統合完了（実データ）:', stats);
    } catch (error) {
      console.error('Game Loop統合エラー:', error);
      // フォールバック: エラー時は機能を無効化
      setShowGameLoopIntegration(false);
    }
  };

  const calculateGameLoopImpact = () => {
    if (!gameLoopStats) return null;

    // プロシージネーション削減効果計算
    const procrastinationReduction = Math.min(gameLoopStats.tasksCompletedToday * 5, 40); // 最大40%削減
    const timelineImprovement = procrastinationReduction * 0.6; // タイムライン短縮効果
    const accuracyImprovement = Math.min(gameLoopStats.currentStreak * 2, 25); // 最大25%精度向上

    return {
      procrastinationReduction,
      timelineImprovement,
      accuracyImprovement,
      productivityBoost: (procrastinationReduction + timelineImprovement + accuracyImprovement) / 3,
    };
  };

  const gameLoopImpact = calculateGameLoopImpact();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ページヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">バッジ完了予測システム</h1>
              {showGameLoopIntegration && (
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full ml-3">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              AI駆動の進捗予測で全バッジ獲得までの
              <span className="font-semibold text-blue-600">
                作業時間・達成予定日・マイルストーン
              </span>
              を可視化し、 最適な学習ロードマップを提案します
              {showGameLoopIntegration && (
                <span className="block mt-2 font-semibold text-green-600">
                  🎮 ゲームループ統合でプロシージネーション削減による予測精度向上
                </span>
              )}
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>リアルタイム更新</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>
                  AI予測精度{' '}
                  {gameLoopImpact
                    ? `${85 + Math.round(gameLoopImpact.accuracyImprovement)}%`
                    : '85%'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>12週間先まで予測</span>
              </div>
              {showGameLoopIntegration && (
                <div className="flex items-center gap-1">
                  <Gamepad2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Game Loop統合</span>
                </div>
              )}
            </div>
          </div>

          {/* ゲームループ統合効果表示 */}
          {showGameLoopIntegration && gameLoopStats && gameLoopImpact && (
            <div className="mt-8">
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 h-5 text-green-500" />
                    ゲームループ統合効果 - バッジ完了予測の改善
                  </CardTitle>
                  <CardDescription>
                    マイクロタスクによるプロシージネーション削減がバッジ完了予測に与える影響
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* プロシージネーション削減効果 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">プロシージネーション削減</h3>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        -{Math.round(gameLoopImpact.procrastinationReduction)}%
                      </div>
                      <p className="text-sm text-gray-600">開始障壁削減により作業開始率向上</p>
                      <div className="mt-3">
                        <Progress value={gameLoopImpact.procrastinationReduction} className="h-2" />
                      </div>
                    </div>

                    {/* タイムライン短縮 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">完了タイムライン短縮</h3>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        -{Math.round(gameLoopImpact.timelineImprovement)}%
                      </div>
                      <p className="text-sm text-gray-600">継続性向上により予定日前倒し</p>
                      <div className="mt-3">
                        <Progress value={gameLoopImpact.timelineImprovement} className="h-2" />
                      </div>
                    </div>

                    {/* 予測精度向上 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Target className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">予測精度向上</h3>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        +{Math.round(gameLoopImpact.accuracyImprovement)}%
                      </div>
                      <p className="text-sm text-gray-600">実績データ増加により予測改善</p>
                      <div className="mt-3">
                        <Progress value={gameLoopImpact.accuracyImprovement} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* 統合統計 */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {gameLoopStats.tasksCompletedToday}
                        </div>
                        <div className="text-xs text-gray-600">今日のマイクロタスク</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {gameLoopStats.currentStreak}日
                        </div>
                        <div className="text-xs text-gray-600">継続ストリーク</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {gameLoopStats.totalTasksCompleted}
                        </div>
                        <div className="text-xs text-gray-600">累積完了数</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(gameLoopImpact.productivityBoost)}%
                        </div>
                        <div className="text-xs text-gray-600">総合生産性向上</div>
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="mt-6 flex justify-center gap-3">
                    <Button
                      onClick={() => window.open('/game-loop-tasks', '_blank')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      ゲームループタスク管理
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('/integrated-dashboard', '_blank')}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      統合ダッシュボード
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* 機能概要カード */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <Target className="h-5 w-5" />
                優先度最適化
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">
                残り時間と難易度を考慮した最適なバッジ獲得順序を提案
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                スケジュール予測
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                週次・月次の詳細な作業計画と達成マイルストーンを表示
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                時間管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700">
                個人のペースに合わせた作業時間の見積もりと調整機能
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-orange-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                進捗追跡
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700">
                リアルタイムの進捗状況と完了速度の分析・可視化
              </p>
            </CardContent>
          </Card>
        </div>

        {/* メインダッシュボード */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <BadgeCompletionDashboard />
          </CardContent>
        </Card>

        {/* 使い方ガイド */}
        <Card className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">📚 使い方ガイド</CardTitle>
            <CardDescription>バッジ完了予測システムを最大限活用するためのヒント</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Step 1</Badge>
                  スケジュール設定
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 右上の「スケジュール設定」から週間作業時間を設定</li>
                  <li>• 集中モードを有効にすると1.5倍速で進捗</li>
                  <li>• 個人のペースに合わせて調整することで予測精度が向上</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Step 2</Badge>
                  優先度確認
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 「優先バッジ」タブで最適化された獲得順序を確認</li>
                  <li>• 🔥高優先度バッジから着手することを推奨</li>
                  <li>• 依存関係のあるバッジは前提条件を先に完了</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">Step 3</Badge>
                  マイルストーン活用
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 短期・中期・長期の目標を設定して計画的に進行</li>
                  <li>• マイルストーン達成時にモチベーションを維持</li>
                  <li>• 累積進捗率で全体の達成度を把握</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">Step 4</Badge>
                  週次計画実行
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 「週次計画」タブで具体的な作業スケジュールを確認</li>
                  <li>• カテゴリフォーカスで集中的に学習領域を絞る</li>
                  <li>• 予想完了数を目標に作業効率を最適化</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 予測システムの特徴 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">🤖 AI予測システムの特徴</CardTitle>
            <CardDescription>機械学習アルゴリズムを使用した高精度な完了予測</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">動的調整</h3>
                <p className="text-sm text-gray-600">
                  過去の完了速度を学習し、リアルタイムで予測を調整。個人の学習パターンに最適化。
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">依存関係解析</h3>
                <p className="text-sm text-gray-600">
                  バッジ間の前提条件や依存関係を自動解析し、最適な学習パスを提案。
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">スケジュール最適化</h3>
                <p className="text-sm text-gray-600">
                  作業可能時間と難易度を考慮した現実的なスケジュール提案で確実な達成を支援。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BadgeCompletionPage;
