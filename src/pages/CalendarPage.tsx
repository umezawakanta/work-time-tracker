'use client';

import React, { useState, useEffect } from 'react';
import TaskCalendarView from '@/components/calendar/TaskCalendarView';
import {
  Calendar,
  Target,
  CheckSquare,
  Gamepad2,
  Clock,
  Zap,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { gameLoopTaskService, GameLoopStats } from '@/services/productivity/GameLoopTaskService';
import { toast } from 'react-hot-toast';

export default function CalendarPage() {
  const todos = useSelector((state: RootState) => state.todo.items);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // ゲームループシステム統合状態
  const [gameLoopStats, setGameLoopStats] = useState<GameLoopStats | null>(null);
  const [showGameLoopIntegration, setShowGameLoopIntegration] = useState(false);

  // ゲームループ統合初期化
  useEffect(() => {
    initializeGameLoopIntegration();
  }, []);

  const initializeGameLoopIntegration = () => {
    try {
      const stats = gameLoopTaskService.getGameLoopStats();
      setGameLoopStats(stats);
      setShowGameLoopIntegration(true);
      console.log('📅 Calendar × Game Loop統合完了:', stats);
    } catch (error) {
      console.error('Game Loop統合エラー:', error);
    }
  };

  // ゲームループによるスケジュール管理効果計算
  const calculateScheduleEffects = () => {
    if (!gameLoopStats) return null;

    const completedToday = gameLoopStats.tasksCompletedToday || 0;
    const streakDays = gameLoopStats.currentStreak || 0;
    const totalCompleted = gameLoopStats.totalTasksCompleted || 0;

    // スケジュール管理への影響計算
    const timeManagementImprovement = Math.min(streakDays * 4, 50); // 最大50%向上
    const procrastinationReduction = Math.min(completedToday * 10, 70); // 最大70%削減
    const planningAccuracy = Math.min(totalCompleted * 0.15, 40); // 最大40%向上
    const scheduleAdherence = Math.min(streakDays * 3 + completedToday * 7, 60); // 最大60%向上

    return {
      timeManagementImprovement,
      procrastinationReduction,
      planningAccuracy,
      scheduleAdherence,
      overallScheduleBoost:
        (timeManagementImprovement +
          procrastinationReduction +
          planningAccuracy +
          scheduleAdherence) /
        4,
    };
  };

  const scheduleEffects = calculateScheduleEffects();

  // カレンダー統計を計算
  const stats = React.useMemo(() => {
    const today = new Date();
    const todayTasks = todos.filter((todo) => {
      if (!todo.deadline) return false;
      const taskDate = new Date(todo.deadline);
      return taskDate.toDateString() === today.toDateString();
    });

    const overdueTasks = todos.filter((todo) => {
      if (!todo.deadline || todo.completed) return false;
      const taskDate = new Date(todo.deadline);
      return taskDate < today;
    });

    const upcomingTasks = todos.filter((todo) => {
      if (!todo.deadline || todo.completed) return false;
      const taskDate = new Date(todo.deadline);
      const daysAhead = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysAhead > 0 && daysAhead <= 7;
    });

    return {
      todayTasks: todayTasks.length,
      overdueTasks: overdueTasks.length,
      upcomingTasks: upcomingTasks.length,
      completedToday: todayTasks.filter((task) => task.completed).length,
    };
  }, [todos]);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">今日のタスク</p>
              <p className="text-2xl font-bold text-blue-700">{stats.todayTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">今日完了</p>
              <p className="text-2xl font-bold text-green-700">{stats.completedToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">期限切れ</p>
              <p className="text-2xl font-bold text-red-700">{stats.overdueTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-900">今週予定</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.upcomingTasks}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">ゲームループ統合</p>
              <Badge variant="secondary">
                {hasActiveSubscription ? 'プレミアム' : 'スタンダード'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-900">継続ストリーク</p>
              <p className="text-2xl font-bold text-orange-700">
                {gameLoopStats?.currentStreak || 0}日
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-sm font-medium text-teal-900">今日のマイクロタスク</p>
              <p className="text-2xl font-bold text-teal-700">
                {gameLoopStats?.tasksCompletedToday || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-indigo-900">累積完了数</p>
              <p className="text-2xl font-bold text-indigo-700">
                {gameLoopStats?.totalTasksCompleted || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">時間管理向上</p>
              <p className="text-2xl font-bold text-blue-700">
                +{scheduleEffects ? Math.round(scheduleEffects.timeManagementImprovement) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">開始障壁削減</p>
              <p className="text-2xl font-bold text-green-700">
                -{scheduleEffects ? Math.round(scheduleEffects.procrastinationReduction) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">計画精度向上</p>
              <p className="text-2xl font-bold text-purple-700">
                +{scheduleEffects ? Math.round(scheduleEffects.planningAccuracy) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-900">遵守率向上</p>
              <p className="text-2xl font-bold text-orange-700">
                +{scheduleEffects ? Math.round(scheduleEffects.scheduleAdherence) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-indigo-900">ゲームループタスク</p>
              <Button variant="outline" onClick={() => window.open('/game-loop-tasks', '_blank')}>
                <Gamepad2 className="h-4 w-4 mr-2" />
                ゲームループタスク
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-sm font-medium text-teal-900">統合ダッシュボード</p>
              <Button
                variant="outline"
                onClick={() => window.open('/integrated-dashboard', '_blank')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                統合ダッシュボード
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">効果更新</p>
              <Button variant="outline" onClick={initializeGameLoopIntegration}>
                <RefreshCw className="h-4 w-4 mr-2" />
                効果更新
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-900 mb-4">カレンダーの使い方</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">基本操作</h4>
              <ul className="space-y-1">
                <li>• 日付をクリックして新しいイベントを作成</li>
                <li>• タスクをクリックして完了状態を切り替え</li>
                <li>• 月/週/日 ビューで表示を切り替え</li>
                <li>• フィルターでタスクとイベントを絞り込み</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">タスク管理</h4>
              <ul className="space-y-1">
                <li>
                  • <span className="inline-block w-3 h-3 bg-blue-100 rounded mr-1"></span>
                  進行中のタスク
                </li>
                <li>
                  • <span className="inline-block w-3 h-3 bg-green-100 rounded mr-1"></span>
                  完了したタスク
                </li>
                <li>
                  • <span className="inline-block w-3 h-3 bg-red-100 rounded mr-1"></span>
                  期限切れのタスク
                </li>
                <li>
                  • <span className="inline-block w-3 h-3 bg-purple-100 rounded mr-1"></span>
                  イベント
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-900 mb-4">
            ゲームループ効果によるスケジュール効率化予測
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h5 className="font-semibold mb-1">時間節約効果</h5>
              <div className="text-2xl font-bold text-green-600 mb-1">
                +{scheduleEffects ? Math.round(scheduleEffects.procrastinationReduction * 0.3) : 0}
                時間/週
              </div>
              <p className="text-xs text-gray-600">プロシージネーション削減効果</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h5 className="font-semibold mb-1">予定達成率</h5>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {scheduleEffects ? Math.round(85 + scheduleEffects.scheduleAdherence * 0.2) : 85}%
              </div>
              <p className="text-xs text-gray-600">従来85%から改善</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h5 className="font-semibold mb-1">生産性向上</h5>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                +{scheduleEffects ? Math.round(scheduleEffects.overallScheduleBoost) : 0}%
              </div>
              <p className="text-xs text-gray-600">総合的な効率向上</p>
            </div>
          </div>
        </div>
      </div>

      <TaskCalendarView />
    </div>
  );
}
