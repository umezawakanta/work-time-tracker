'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
// import { useLocale } from '../hooks/useLocale'; // LocaleProvider issue - using default locale
import { WorkTimeList } from '@/components/list/WorkTimeList';
import { WorkTimeCharts } from '@/components/chart/WorkTimeChars';
import { PomodoroStatsWidget } from '@/components/pomodoro/PomodoroStatsWidget';
import { useReportData } from '@/hooks/useReportData';
import { fetchWorkTimeEntries } from '@/store/workTimeSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { gameLoopTaskService, GameLoopStats } from '@/services/productivity/GameLoopTaskService';
import { Play, Target, Clock, CheckCircle, BarChart3, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WorkTimeReports() {
  const navigate = useNavigate();
  // const { locale } = useLocale(); // LocaleProvider issue - using default locale
  const locale = 'ja-JP'; // デフォルトロケール設定
  const workTimeEntries = useSelector((state: RootState) => state.workTime.entries);
  const isLoading = useSelector((state: RootState) => state.workTime.isLoading);
  const error = useSelector((state: RootState) => state.workTime.error);
  const dispatch = useDispatch<AppDispatch>();

  // ゲームループシステム統計
  const [gameLoopStats, setGameLoopStats] = useState<GameLoopStats | null>(null);
  const [showGameLoopIntegration, setShowGameLoopIntegration] = useState(false);

  useReportData();

  useEffect(() => {
    // ページ表示時に最新データを取得
    dispatch(fetchWorkTimeEntries());
  }, [dispatch]);

  // ゲームループ統計読み込み
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

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">作業時間レポート</h1>

      {/* ポモドーロ統計 */}
      <div className="mb-6">
        <PomodoroStatsWidget />
      </div>

      {/* ゲームループシステム統計 */}
      {showGameLoopIntegration && gameLoopStats && (
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">🎮 ゲームループ・生産性分析</h3>
                  <p className="text-sm text-purple-700">プロシージネーション対策効果の測定</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/game-loop-tasks')}
                className="bg-white hover:bg-purple-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                詳細表示
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">今日完了</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  {gameLoopStats.tasksCompletedToday}
                </div>
                <div className="text-xs text-blue-600">マイクロタスク</div>
              </div>

              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">平均時間</span>
                </div>
                <div className="text-2xl font-bold text-green-800">
                  {Math.round(gameLoopStats.averageTaskTime)}分
                </div>
                <div className="text-xs text-green-600">実行時間</div>
              </div>

              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">ストリーク</span>
                </div>
                <div className="text-2xl font-bold text-purple-800">
                  {gameLoopStats.currentStreak}
                </div>
                <div className="text-xs text-purple-600">連続完了</div>
              </div>

              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">総完了</span>
                </div>
                <div className="text-2xl font-bold text-orange-800">
                  {gameLoopStats.totalTasksCompleted}
                </div>
                <div className="text-xs text-orange-600">累計</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                🧠 作業効率への影響
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">プロシージネーション削減</span>
                    <Badge variant="secondary">
                      {gameLoopStats.currentStreak > 5 ? '高効果' : '改善中'}
                    </Badge>
                  </div>
                  <Progress
                    value={Math.min(gameLoopStats.currentStreak * 20, 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    マイクロタスク分解により開始障壁を削減
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">モチベーション維持</span>
                    <Badge variant="secondary">
                      {gameLoopStats.feedbackJarCount > 10 ? '安定' : '構築中'}
                    </Badge>
                  </div>
                  <Progress
                    value={Math.min(gameLoopStats.feedbackJarCount * 5, 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    即座フィードバックでドーパミン分泌促進
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>💡 統合効果:</strong>
                  従来の勤怠管理とゲームループタスクを組み合わせることで、 作業時間の
                  <strong>質的向上</strong>と<strong>継続性</strong>の両方を実現。
                  プロシージネーションの根本的解決により、実質的な生産性向上を達成。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <WorkTimeCharts workTimeEntries={workTimeEntries} locale={locale} />

      {workTimeEntries.length > 0 ? (
        <WorkTimeList workTimeEntries={workTimeEntries} />
      ) : (
        <div className="text-center mt-4">作業時間のエントリがありません</div>
      )}
    </div>
  );
}
