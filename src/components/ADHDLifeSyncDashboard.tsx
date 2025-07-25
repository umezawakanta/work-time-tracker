import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import {
  Play,
  Pause,
  Square,
  Timer,
  Brain,
  Heart,
  Zap,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Coffee,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Battery,
  Target,
  Lightbulb,
  Headphones,
  Eye,
  Shield,
  Calendar,
  ListChecks,
  RotateCcw,
  TrendingUp,
  Award,
  Star,
  Plus,
  Minus,
  Settings,
  Home,
  Sparkles,
  Activity,
  BarChart3,
  PieChart,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Smile,
  Meh,
  Frown,
  RefreshCw,
  Maximize2,
  Minimize2,
  HelpCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// ADHD/ASD特化型の型定義
interface ExecutiveFunctionState {
  currentTask: string | null;
  isPomodoro: boolean;
  pomodoroTime: number;
  pomodoroState: 'work' | 'break' | 'stopped';
  taskBreakdown: string[];
  completedSteps: number;
  totalSteps: number;
}

interface SensoryEnvironment {
  noiseLevel: 'quiet' | 'normal' | 'white_noise' | 'nature';
  lighting: 'dim' | 'normal' | 'bright';
  visualComplexity: 'minimal' | 'normal' | 'detailed';
  focusMode: boolean;
}

interface EnergyLevel {
  current: number; // 0-100
  trend: 'increasing' | 'stable' | 'decreasing';
  lastUpdate: Date;
  hyperfocusRisk: boolean;
  burnoutRisk: boolean;
}

interface RoutineItem {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  category: 'morning' | 'work' | 'evening' | 'self_care';
  isFlexible: boolean;
}

interface ADHDMetrics {
  executiveFunction: number; // 0-100
  sensoryComfort: number; // 0-100
  routineAdherence: number; // 0-100
  energyBalance: number; // 0-100
  overallWellbeing: number; // 0-100
}

export const ADHDLifeSyncDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Executive Function State
  const [executiveState, setExecutiveState] = useState<ExecutiveFunctionState>({
    currentTask: null,
    isPomodoro: false,
    pomodoroTime: 25 * 60, // 25分
    pomodoroState: 'stopped',
    taskBreakdown: [],
    completedSteps: 0,
    totalSteps: 0,
  });

  // Sensory Environment State
  const [sensoryEnv, setSensoryEnv] = useState<SensoryEnvironment>({
    noiseLevel: 'normal',
    lighting: 'normal',
    visualComplexity: 'minimal',
    focusMode: false,
  });

  // Energy Level State
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>({
    current: 75,
    trend: 'stable',
    lastUpdate: new Date(),
    hyperfocusRisk: false,
    burnoutRisk: false,
  });

  // Daily Routine State
  const [dailyRoutine, setDailyRoutine] = useState<RoutineItem[]>([
    {
      id: '1',
      title: '朝の薬を飲む',
      time: '08:00',
      completed: true,
      category: 'morning',
      isFlexible: false,
    },
    {
      id: '2',
      title: '朝食を取る',
      time: '08:30',
      completed: true,
      category: 'morning',
      isFlexible: true,
    },
    {
      id: '3',
      title: '今日のタスク確認',
      time: '09:00',
      completed: false,
      category: 'work',
      isFlexible: false,
    },
    {
      id: '4',
      title: '重要タスク実行',
      time: '10:00',
      completed: false,
      category: 'work',
      isFlexible: true,
    },
    {
      id: '5',
      title: '昼食・休憩',
      time: '12:00',
      completed: false,
      category: 'self_care',
      isFlexible: true,
    },
  ]);

  // ADHD Metrics
  const [adhdMetrics, setAdhdMetrics] = useState<ADHDMetrics>({
    executiveFunction: 72,
    sensoryComfort: 85,
    routineAdherence: 60,
    energyBalance: 45,
    overallWellbeing: 66,
  });

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (executiveState.pomodoroState === 'work' || executiveState.pomodoroState === 'break') {
      interval = setInterval(() => {
        setExecutiveState((prev) => ({
          ...prev,
          pomodoroTime: Math.max(0, prev.pomodoroTime - 1),
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [executiveState.pomodoroState]);

  // Current Time Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Utility Functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEnergyColor = (level: number) => {
    if (level >= 80) return 'text-green-600 bg-green-100';
    if (level >= 60) return 'text-blue-600 bg-blue-100';
    if (level >= 40) return 'text-yellow-600 bg-yellow-100';
    if (level >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return { text: '夜更かし中ですね', emoji: '🌙', advice: '睡眠は大切です' };
    if (hour < 12) return { text: 'おはようございます', emoji: '🌅', advice: '良いスタートを' };
    if (hour < 18) return { text: 'こんにちは', emoji: '☀️', advice: '集中の時間です' };
    return { text: 'こんばんは', emoji: '🌆', advice: 'お疲れ様でした' };
  };

  // Event Handlers
  const handlePomodoroStart = () => {
    setExecutiveState((prev) => ({
      ...prev,
      pomodoroState: 'work',
      pomodoroTime: 25 * 60,
    }));
  };

  const handlePomodoroPause = () => {
    setExecutiveState((prev) => ({
      ...prev,
      pomodoroState: prev.pomodoroState === 'work' ? 'stopped' : prev.pomodoroState,
    }));
  };

  const handleEnergyUpdate = (change: number) => {
    setEnergyLevel((prev) => ({
      ...prev,
      current: Math.max(0, Math.min(100, prev.current + change)),
      lastUpdate: new Date(),
      trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
    }));
  };

  const toggleRoutineItem = (id: string) => {
    setDailyRoutine((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const greeting = getTimeGreeting();
  const routineProgress = Math.round(
    (dailyRoutine.filter((item) => item.completed).length / dailyRoutine.length) * 100
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ADHD特化ヘッダー - シンプルで安心感のあるデザイン */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              {greeting.emoji} {greeting.text}、{user?.displayName || user?.name}さん
            </h1>
            <p className="text-blue-100 text-sm mb-2">{greeting.advice}</p>
            <p className="text-blue-200 text-lg font-mono">
              {format(currentTime, 'yyyy年M月d日(E) HH:mm', { locale: ja })}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{adhdMetrics.overallWellbeing}</div>
            <div className="text-blue-100 text-sm">総合ウェルビーイング</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {adhdMetrics.overallWellbeing >= 80 && <Smile className="h-5 w-5 text-green-300" />}
              {adhdMetrics.overallWellbeing >= 50 && adhdMetrics.overallWellbeing < 80 && (
                <Meh className="h-5 w-5 text-yellow-300" />
              )}
              {adhdMetrics.overallWellbeing < 50 && <Frown className="h-5 w-5 text-red-300" />}
            </div>
          </div>
        </div>
      </div>

      {/* クリティカルアラート・ステータス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {energyLevel.hyperfocusRisk && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div>
                  <div className="font-semibold text-orange-800">過集中リスク</div>
                  <div className="text-sm text-orange-600">休憩を取ることをお勧めします</div>
                </div>
                <Button size="sm" onClick={() => navigate('/break-reminder')} className="ml-auto">
                  休憩
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {energyLevel.burnoutRisk && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Battery className="h-6 w-6 text-red-600" />
                <div>
                  <div className="font-semibold text-red-800">エネルギー不足</div>
                  <div className="text-sm text-red-600">セルフケアが必要です</div>
                </div>
                <Button size="sm" onClick={() => navigate('/self-care')} className="ml-auto">
                  ケア
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* メインコンテンツエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 実行機能アシスタント */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              実行機能アシスタント
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ポモドーロタイマー */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-800">集中タイマー</span>
                <Badge
                  className={
                    executiveState.pomodoroState === 'work'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {executiveState.pomodoroState === 'work' ? '作業中' : '停止中'}
                </Badge>
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl font-mono font-bold text-gray-900">
                  {formatTime(executiveState.pomodoroTime)}
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  onClick={handlePomodoroStart}
                  disabled={executiveState.pomodoroState === 'work'}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  開始
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePomodoroPause}
                  disabled={executiveState.pomodoroState === 'stopped'}
                  className="flex items-center gap-2"
                >
                  <Pause className="h-4 w-4" />
                  停止
                </Button>
              </div>
            </div>

            {/* 現在のタスク */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">今のタスク</span>
                <Button size="sm" variant="ghost" onClick={() => navigate('/todos')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {executiveState.currentTask ? (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="font-medium text-blue-900 mb-2">{executiveState.currentTask}</div>
                  <Progress
                    value={(executiveState.completedSteps / executiveState.totalSteps) * 100}
                    className="h-2"
                  />
                  <div className="text-sm text-blue-700 mt-1">
                    {executiveState.completedSteps}/{executiveState.totalSteps} ステップ完了
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-gray-600 text-sm mb-2">タスクが設定されていません</div>
                  <Button size="sm" onClick={() => navigate('/todos')}>
                    タスクを選ぶ
                  </Button>
                </div>
              )}
            </div>

            {/* クイックアクション */}
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                細分化
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                ヒント
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* エネルギー管理 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              エネルギー管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* エネルギーレベル */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">現在のエネルギー</span>
                <Badge className={getEnergyColor(energyLevel.current)}>
                  {energyLevel.current}%
                </Badge>
              </div>

              <Progress value={energyLevel.current} className="h-3 mb-2" />

              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={() => handleEnergyUpdate(10)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEnergyUpdate(-10)}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEnergyUpdate(0)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 疲労度チェック */}
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-sm font-medium text-yellow-800 mb-2">疲労度チェック</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-700">集中困難</span>
                  <span className="text-yellow-800">軽度</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-700">過集中リスク</span>
                  <span className="text-yellow-800">
                    {energyLevel.hyperfocusRisk ? '高' : '低'}
                  </span>
                </div>
              </div>
            </div>

            {/* 休憩提案 */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">休憩提案</div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  <Coffee className="h-3 w-3 mr-1" />
                  短い休憩
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Heart className="h-3 w-3 mr-1" />
                  深呼吸
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 感覚調整センター */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600" />
              感覚調整センター
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 環境設定 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">環境設定</div>

              <div className="space-y-3">
                {/* 音環境 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">音環境</span>
                    <Headphones className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {(['quiet', 'normal', 'white_noise', 'nature'] as const).map((noise) => (
                      <Button
                        key={noise}
                        size="sm"
                        variant={sensoryEnv.noiseLevel === noise ? 'default' : 'outline'}
                        onClick={() => setSensoryEnv((prev) => ({ ...prev, noiseLevel: noise }))}
                        className="text-xs"
                      >
                        {noise === 'quiet' && '静寂'}
                        {noise === 'normal' && '通常'}
                        {noise === 'white_noise' && 'ホワイト'}
                        {noise === 'nature' && '自然音'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 照明 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">照明</span>
                    <Sun className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['dim', 'normal', 'bright'] as const).map((light) => (
                      <Button
                        key={light}
                        size="sm"
                        variant={sensoryEnv.lighting === light ? 'default' : 'outline'}
                        onClick={() => setSensoryEnv((prev) => ({ ...prev, lighting: light }))}
                        className="text-xs"
                      >
                        {light === 'dim' && '暗め'}
                        {light === 'normal' && '標準'}
                        {light === 'bright' && '明るめ'}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 集中モード */}
            <div className="bg-indigo-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-indigo-900">集中モード</div>
                  <div className="text-sm text-indigo-700">刺激を最小限に</div>
                </div>
                <Button
                  size="sm"
                  variant={sensoryEnv.focusMode ? 'default' : 'outline'}
                  onClick={() => setSensoryEnv((prev) => ({ ...prev, focusMode: !prev.focusMode }))}
                >
                  {sensoryEnv.focusMode ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 日常ルーティン */}
        <Card className="lg:col-span-2 xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-green-600" />
              今日のルーティン
              <Badge className="ml-2">{routineProgress}% 完了</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Progress value={routineProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {dailyRoutine.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-3 transition-all cursor-pointer ${
                    item.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => toggleRoutineItem(item.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                    )}
                    <div className="text-sm font-medium">{item.time}</div>
                    {!item.isFlexible && <div className="w-2 h-2 bg-red-400 rounded-full" />}
                  </div>
                  <div className={`text-sm ${item.completed ? 'text-green-800' : 'text-gray-700'}`}>
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.category === 'morning' && '朝のルーティン'}
                    {item.category === 'work' && '仕事'}
                    {item.category === 'evening' && '夜のルーティン'}
                    {item.category === 'self_care' && 'セルフケア'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate('/routine-manager')}>
                ルーティン編集
              </Button>
              <Button size="sm" variant="outline">
                新しいルーティン追加
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ADHD/ASD メトリクス */}
        <Card className="lg:col-span-2 xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              ADHD/ASD ウェルビーイングメトリクス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {adhdMetrics.executiveFunction}
                </div>
                <div className="text-sm text-gray-600">実行機能</div>
                <Progress value={adhdMetrics.executiveFunction} className="h-2 mt-2" />
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {adhdMetrics.sensoryComfort}
                </div>
                <div className="text-sm text-gray-600">感覚快適性</div>
                <Progress value={adhdMetrics.sensoryComfort} className="h-2 mt-2" />
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {adhdMetrics.routineAdherence}
                </div>
                <div className="text-sm text-gray-600">ルーティン遵守</div>
                <Progress value={adhdMetrics.routineAdherence} className="h-2 mt-2" />
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {adhdMetrics.energyBalance}
                </div>
                <div className="text-sm text-gray-600">エネルギー調整</div>
                <Progress value={adhdMetrics.energyBalance} className="h-2 mt-2" />
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {adhdMetrics.overallWellbeing}
                </div>
                <div className="text-sm text-gray-600">総合ウェルビーイング</div>
                <Progress value={adhdMetrics.overallWellbeing} className="h-2 mt-2" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">今日のAIインサイト</span>
              </div>
              <p className="text-sm text-blue-800">
                あなたの感覚快適性が高く維持されています。この調子で集中環境を保ちましょう。
                実行機能については、タスクの細分化を意識することで更なる向上が期待できます。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 緊急サポート・リソース */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-600" />
            サポート・リソース
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/crisis-support')}
            >
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <span className="font-medium">緊急サポート</span>
              <span className="text-sm text-gray-600">パニック・メルトダウン時</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/coping-strategies')}
            >
              <Brain className="h-6 w-6 text-blue-500" />
              <span className="font-medium">対処法ガイド</span>
              <span className="text-sm text-gray-600">実行機能サポート</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/community')}
            >
              <Heart className="h-6 w-6 text-pink-500" />
              <span className="font-medium">コミュニティ</span>
              <span className="text-sm text-gray-600">同じ体験を持つ仲間</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
