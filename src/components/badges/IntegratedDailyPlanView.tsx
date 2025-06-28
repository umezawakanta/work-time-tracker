import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Lightbulb,
  TrendingUp,
  Brain,
  Zap,
  Coffee,
  Sun,
  Moon,
  AlertCircle,
} from 'lucide-react';

// 基本インターフェース
interface DailyTask {
  id: string;
  badgeId: string;
  badgeName: string;
  badgeEmoji: string;
  category: string;
  taskName: string;
  description: string;
  estimatedMinutes: number;
  actualMinutes: number;
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  startTime?: Date;
  endTime?: Date;
  difficulty: number; // 1-5
  energyLevel: 'high' | 'medium' | 'low';
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'flexible';
}

interface DailyMetrics {
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  completedTasks: number;
  totalTasks: number;
  currentStreak: number;
  efficiency: number;
  focusScore: number;
  energyConsumption: number;
}

interface EnergyState {
  currentLevel: number;
  optimalLevel: number;
  consumption: number;
  recovery: number;
  timeToRecharge: number;
  recommendations: string[];
}

interface IntegratedDailyPlanViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const IntegratedDailyPlanView: React.FC<IntegratedDailyPlanViewProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'energy' | 'insights'>(
    'overview'
  );
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [streakDays, setStreakDays] = useState(3);

  // サンプルタスクデータ
  const initializeTasks = () => {
    const sampleTasks: DailyTask[] = [
      {
        id: 'task-1',
        badgeId: 'security-specialist',
        badgeName: 'サイバーセキュリティスペシャリスト',
        badgeEmoji: '🔐',
        category: 'セキュリティ',
        taskName: 'ペネトレーションテスト基礎学習',
        description: 'Kali Linuxを使用した基本的なネットワークスキャン手法の学習',
        estimatedMinutes: 120,
        actualMinutes: 75,
        priority: 'high',
        status: 'in_progress',
        difficulty: 4,
        energyLevel: 'high',
        timeSlot: 'morning',
      },
      {
        id: 'task-2',
        badgeId: 'ux-researcher',
        badgeName: 'UXリサーチスペシャリスト',
        badgeEmoji: '🔍',
        category: 'デザイン',
        taskName: 'ユーザーインタビュー実施',
        description: 'プロダクトの使用感に関するユーザーインタビュー3件の実施',
        estimatedMinutes: 90,
        actualMinutes: 0,
        priority: 'medium',
        status: 'not_started',
        difficulty: 2,
        energyLevel: 'medium',
        timeSlot: 'afternoon',
      },
      {
        id: 'task-3',
        badgeId: 'requirements-specialist',
        badgeName: '要件定義スペシャリスト',
        badgeEmoji: '📊',
        category: 'PM',
        taskName: '機能仕様書作成',
        description: '新機能の詳細仕様書ドラフト作成と関係者レビュー準備',
        estimatedMinutes: 60,
        actualMinutes: 0,
        priority: 'high',
        status: 'not_started',
        difficulty: 3,
        energyLevel: 'medium',
        timeSlot: 'evening',
      },
      {
        id: 'task-4',
        badgeId: 'ai-specialist',
        badgeName: 'AIスペシャリスト',
        badgeEmoji: '🤖',
        category: 'AI・機械学習',
        taskName: '機械学習モデル実装',
        description: 'Pythonでの分類モデル作成、訓練、評価の一連の流れ',
        estimatedMinutes: 150,
        actualMinutes: 0,
        priority: 'medium',
        status: 'not_started',
        difficulty: 5,
        energyLevel: 'high',
        timeSlot: 'flexible',
      },
    ];
    setTasks(sampleTasks);
  };

  // エネルギー状態の初期化
  const [energyState, setEnergyState] = useState<EnergyState>({
    currentLevel: 75,
    optimalLevel: 80,
    consumption: 15,
    recovery: 10,
    timeToRecharge: 25,
    recommendations: [
      '高エネルギータスクは午前中に実行',
      '90分集中→20分休憩のサイクルが効果的',
      '水分補給を忘れずに',
    ],
  });

  useEffect(() => {
    initializeTasks();
  }, [selectedDate]);

  // タイマー機能
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && currentTask) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
        // 実際の時間更新
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === currentTask ? { ...task, actualMinutes: task.actualMinutes + 1 / 60 } : task
          )
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentTask]);

  // メトリクス計算
  const calculateMetrics = (): DailyMetrics => {
    const totalPlannedMinutes = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
    const totalActualMinutes = tasks.reduce((sum, task) => sum + task.actualMinutes, 0);
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    const totalTasks = tasks.length;
    const efficiency =
      totalPlannedMinutes > 0 ? (totalActualMinutes / totalPlannedMinutes) * 100 : 0;

    return {
      totalPlannedMinutes,
      totalActualMinutes,
      completedTasks,
      totalTasks,
      currentStreak: streakDays,
      efficiency,
      focusScore: 85,
      energyConsumption: 70,
    };
  };

  const metrics = calculateMetrics();

  // タスク操作ハンドラー
  const handleStartTask = (taskId: string) => {
    setCurrentTask(taskId);
    setIsTimerRunning(true);
    setSessionTime(0);
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: 'in_progress', startTime: new Date() } : task
      )
    );
  };

  const handlePauseTask = (taskId: string) => {
    setIsTimerRunning(false);
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, status: 'paused' } : task))
    );
  };

  const handleCompleteTask = (taskId: string) => {
    setIsTimerRunning(false);
    setCurrentTask(null);
    setSessionTime(0);
    setCompletedPomodoros((prev) => prev + 1);
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: 'completed', endTime: new Date() } : task
      )
    );
  };

  const handleResetTask = (taskId: string) => {
    if (currentTask === taskId) {
      setIsTimerRunning(false);
      setCurrentTask(null);
      setSessionTime(0);
    }
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'not_started',
              actualMinutes: 0,
              startTime: undefined,
              endTime: undefined,
            }
          : task
      )
    );
  };

  // 時間フォーマット関数
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatSessionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            📅{' '}
            {selectedDate.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}{' '}
            の計画
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {Math.floor(metrics.totalPlannedMinutes / 60)}h {metrics.totalPlannedMinutes % 60}m
              </div>
              <div className="text-xs text-muted-foreground">予定時間</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {metrics.completedTasks}/{metrics.totalTasks}
              </div>
              <div className="text-xs text-muted-foreground">完了タスク</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {metrics.efficiency.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">効率</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{metrics.currentStreak}日</div>
              <div className="text-xs text-muted-foreground">連続実行</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アクティブタスクタイマー */}
      {currentTask && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              ⏱️ 実行中のタスク
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {tasks.find((t) => t.id === currentTask)?.badgeEmoji}
                </span>
                <div>
                  <div className="font-medium">
                    {tasks.find((t) => t.id === currentTask)?.taskName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tasks.find((t) => t.id === currentTask)?.badgeName}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {formatSessionTime(sessionTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  目標: {formatTime(tasks.find((t) => t.id === currentTask)?.estimatedMinutes || 0)}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant={isTimerRunning ? 'outline' : 'default'}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex items-center gap-1"
              >
                {isTimerRunning ? (
                  <>
                    <PauseCircle className="w-4 h-4" />
                    一時停止
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    再開
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleCompleteTask(currentTask)}
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                完了
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* タブ切り替え */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="tasks">タスク</TabsTrigger>
          <TabsTrigger value="energy">エネルギー</TabsTrigger>
          <TabsTrigger value="insights">AI分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* 概要タブの内容は次のセクションで実装 */}
          <Card>
            <CardHeader>
              <CardTitle>📊 今日の概要</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">概要情報を準備中...</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          {/* タスクタブの内容 */}
          <Card>
            <CardHeader>
              <CardTitle>📋 タスク管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">タスク詳細を準備中...</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy" className="mt-6">
          {/* エネルギータブの内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />⚡ エネルギー管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">現在のエネルギーレベル</span>
                    <span className="text-sm font-bold text-green-600">
                      {energyState.currentLevel}%
                    </span>
                  </div>
                  <Progress value={energyState.currentLevel} className="h-3" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{energyState.consumption}%</div>
                    <div className="text-muted-foreground">消費率</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{energyState.recovery}%</div>
                    <div className="text-muted-foreground">回復率</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{energyState.timeToRecharge}m</div>
                    <div className="text-muted-foreground">回復時間</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          {/* AI分析タブの内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                🤖 AI分析・推奨事項
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">AI分析結果を準備中...</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedDailyPlanView;
