import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  Brain,
  BarChart3,
  Zap,
  RefreshCw,
  BookOpen,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Lightbulb,
  Coffee,
  Sun,
  Moon,
  AlertCircle,
  ChevronRight,
  Star,
  ArrowRight,
} from 'lucide-react';

// 日次タスク関連のインターフェース
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
  difficulty: number;
  energyLevel: 'high' | 'medium' | 'low';
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'flexible';
}

interface EnergyState {
  currentLevel: number;
  optimalLevel: number;
  consumption: number;
  recovery: number;
  timeToRecharge: number;
  recommendations: string[];
}

// 基本インターフェース定義
interface BadgePredictionPlan {
  date: string;
  plannedBadges: string[];
  actualBadges: string[];
  plannedHours: number;
  actualHours: number;
  completionRate: number;
  efficiency: number;
}

interface WeeklyPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  plannedBadges: Array<{
    badgeId: string;
    badgeName: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    estimatedHours: number;
    targetDate: string;
    emoji: string;
  }>;
  actualProgress: number;
  targetProgress: number;
  efficiency: number;
  totalHours: number;
  completedBadges: number;
}

interface MonthlyOverview {
  month: string;
  totalBadges: number;
  completedBadges: number;
  inProgressBadges: number;
  plannedHours: number;
  actualHours: number;
  categories: Array<{
    name: string;
    progress: number;
    count: number;
    icon: string;
  }>;
}

// 週次計画のインターフェース
interface WeeklyBadgePlan {
  badgeId: string;
  badgeName: string;
  badgeEmoji: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  actualHours: number;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  dependencies: string[];
  progress: number;
  confidence: number;
}

interface WeeklySchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  theme: string;
  plannedBadges: WeeklyBadgePlan[];
  totalPlannedHours: number;
  totalActualHours: number;
  completionRate: number;
  efficiency: number;
  onTrackScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  keyMilestones: string[];
  notes: string;
}

export const ExtendedBadgePredictionSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'daily' | 'weekly' | 'monthly' | 'vs' | 'timeline' | 'analysis'
  >('daily');
  const [focusMode, setFocusMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [predictionAccuracy, setPredictionAccuracy] = useState(85.0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 日次計画関連のstate
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [streakDays, setStreakDays] = useState(3);
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

  // 週次計画関連のstate
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);

  // メインメトリクス
  const mainMetrics = {
    totalPredictedBadges: 75,
    completedBadges: 93,
    totalLearningHours: 620,
    accuracy: predictionAccuracy,
  };

  // 週次スケジュールデータの初期化
  const initializeWeeklySchedules = () => {
    const schedules: WeeklySchedule[] = [
      {
        weekNumber: 1,
        startDate: '2025-06-28',
        endDate: '2025-07-04',
        theme: 'セキュリティ基盤構築',
        plannedBadges: [
          {
            badgeId: 'security-basics',
            badgeName: 'セキュリティ基礎',
            badgeEmoji: '🔐',
            category: 'セキュリティ',
            priority: 'high',
            estimatedHours: 12,
            actualHours: 8,
            targetDate: '2025-07-02',
            status: 'in_progress',
            dependencies: [],
            progress: 65,
            confidence: 85,
          },
          {
            badgeId: 'network-security',
            badgeName: 'ネットワークセキュリティ',
            badgeEmoji: '🛡️',
            category: 'セキュリティ',
            priority: 'high',
            estimatedHours: 8,
            actualHours: 0,
            targetDate: '2025-07-04',
            status: 'not_started',
            dependencies: ['security-basics'],
            progress: 0,
            confidence: 75,
          },
        ],
        totalPlannedHours: 20,
        totalActualHours: 8,
        completionRate: 40,
        efficiency: 85,
        onTrackScore: 78,
        riskLevel: 'low',
        keyMilestones: ['セキュリティ基礎概念の理解', 'ネットワーク脆弱性スキャン実践'],
        notes: '基礎から着実に積み上げる週。理論と実践のバランスを重視。',
      },
      {
        weekNumber: 2,
        startDate: '2025-07-05',
        endDate: '2025-07-11',
        theme: 'ペネトレーションテスト実践',
        plannedBadges: [
          {
            badgeId: 'penetration-testing',
            badgeName: 'ペネトレーションテスト',
            badgeEmoji: '🔍',
            category: 'セキュリティ',
            priority: 'high',
            estimatedHours: 15,
            actualHours: 0,
            targetDate: '2025-07-11',
            status: 'not_started',
            dependencies: ['network-security'],
            progress: 0,
            confidence: 70,
          },
          {
            badgeId: 'vulnerability-assessment',
            badgeName: '脆弱性評価',
            badgeEmoji: '🎯',
            category: 'セキュリティ',
            priority: 'medium',
            estimatedHours: 5,
            actualHours: 0,
            targetDate: '2025-07-09',
            status: 'not_started',
            dependencies: ['security-basics'],
            progress: 0,
            confidence: 80,
          },
        ],
        totalPlannedHours: 20,
        totalActualHours: 0,
        completionRate: 0,
        efficiency: 85,
        onTrackScore: 72,
        riskLevel: 'medium',
        keyMilestones: ['Kali Linuxツール習得', '実際のシステムでのテスト実施'],
        notes: '実践的なスキル構築。ハンズオン重視で進める。',
      },
      {
        weekNumber: 3,
        startDate: '2025-07-12',
        endDate: '2025-07-18',
        theme: 'セキュリティツール習得',
        plannedBadges: [
          {
            badgeId: 'security-tools-mastery',
            badgeName: 'セキュリティツールマスター',
            badgeEmoji: '⚒️',
            category: 'セキュリティ',
            priority: 'high',
            estimatedHours: 18,
            actualHours: 0,
            targetDate: '2025-07-18',
            status: 'not_started',
            dependencies: ['penetration-testing'],
            progress: 0,
            confidence: 75,
          },
        ],
        totalPlannedHours: 20,
        totalActualHours: 0,
        completionRate: 0,
        efficiency: 85,
        onTrackScore: 70,
        riskLevel: 'medium',
        keyMilestones: ['複数ツールの組み合わせ活用', 'カスタムスクリプト作成'],
        notes: 'ツールの深い理解と応用力を身につける。',
      },
      {
        weekNumber: 4,
        startDate: '2025-07-19',
        endDate: '2025-07-25',
        theme: 'セキュリティ統合・完成',
        plannedBadges: [
          {
            badgeId: 'security-specialist-final',
            badgeName: 'サイバーセキュリティスペシャリスト',
            badgeEmoji: '🔐',
            category: 'セキュリティ',
            priority: 'high',
            estimatedHours: 10,
            actualHours: 0,
            targetDate: '2025-07-25',
            status: 'not_started',
            dependencies: ['security-tools-mastery'],
            progress: 0,
            confidence: 85,
          },
          {
            badgeId: 'skill-map-expert',
            badgeName: 'スキルマップエキスパート',
            badgeEmoji: '🗺️',
            category: 'プロジェクト管理',
            priority: 'medium',
            estimatedHours: 8,
            actualHours: 0,
            targetDate: '2025-07-25',
            status: 'not_started',
            dependencies: [],
            progress: 0,
            confidence: 90,
          },
        ],
        totalPlannedHours: 18,
        totalActualHours: 0,
        completionRate: 0,
        efficiency: 85,
        onTrackScore: 88,
        riskLevel: 'low',
        keyMilestones: ['セキュリティ分野完全習得', 'スキルマップ作成開始'],
        notes: 'セキュリティ分野の集大成。次のフェーズの準備も開始。',
      },
      {
        weekNumber: 5,
        startDate: '2025-07-26',
        endDate: '2025-08-01',
        theme: 'UX・アクセシビリティ強化',
        plannedBadges: [
          {
            badgeId: 'accessibility-champion',
            badgeName: 'アクセシビリティチャンピオン',
            badgeEmoji: '♿',
            category: 'アクセシビリティ',
            priority: 'high',
            estimatedHours: 7,
            actualHours: 0,
            targetDate: '2025-08-01',
            status: 'not_started',
            dependencies: [],
            progress: 0,
            confidence: 85,
          },
          {
            badgeId: 'ux-researcher',
            badgeName: 'UXリサーチスペシャリスト',
            badgeEmoji: '🔍',
            category: 'デザイン',
            priority: 'medium',
            estimatedHours: 7,
            actualHours: 0,
            targetDate: '2025-08-01',
            status: 'not_started',
            dependencies: [],
            progress: 0,
            confidence: 80,
          },
          {
            badgeId: 'requirements-specialist',
            badgeName: '要件定義スペシャリスト',
            badgeEmoji: '📊',
            category: 'PM',
            priority: 'high',
            estimatedHours: 6,
            actualHours: 0,
            targetDate: '2025-08-01',
            status: 'not_started',
            dependencies: [],
            progress: 0,
            confidence: 90,
          },
        ],
        totalPlannedHours: 20,
        totalActualHours: 0,
        completionRate: 0,
        efficiency: 85,
        onTrackScore: 85,
        riskLevel: 'low',
        keyMilestones: ['WCAG準拠サイト構築', 'ユーザビリティテスト実施'],
        notes: 'ユーザー中心設計の理解を深める。実践的なUXスキル習得。',
      },
      {
        weekNumber: 6,
        startDate: '2025-08-02',
        endDate: '2025-08-08',
        theme: 'AI・機械学習基礎',
        plannedBadges: [
          {
            badgeId: 'ai-fundamentals',
            badgeName: 'AI基礎',
            badgeEmoji: '🤖',
            category: 'AI・機械学習',
            priority: 'high',
            estimatedHours: 15,
            actualHours: 0,
            targetDate: '2025-08-08',
            status: 'not_started',
            dependencies: [],
            progress: 0,
            confidence: 70,
          },
        ],
        totalPlannedHours: 15,
        totalActualHours: 0,
        completionRate: 0,
        efficiency: 85,
        onTrackScore: 75,
        riskLevel: 'medium',
        keyMilestones: ['Python機械学習環境構築', '基本アルゴリズム理解'],
        notes: 'AI分野への本格参入。数学的基礎も並行して学習。',
      },
    ];
    setWeeklySchedules(schedules);
  };

  // 日次タスクの初期化
  const initializeDailyTasks = () => {
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
    setDailyTasks(sampleTasks);
  };

  useEffect(() => {
    initializeDailyTasks();
    initializeWeeklySchedules();
  }, [selectedDate]);

  // タイマー機能
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && currentTask) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
        setDailyTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === currentTask ? { ...task, actualMinutes: task.actualMinutes + 1 / 60 } : task
          )
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentTask]);

  // タスク操作ハンドラー
  const handleStartTask = (taskId: string) => {
    setCurrentTask(taskId);
    setIsTimerRunning(true);
    setSessionTime(0);
    setDailyTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: 'in_progress', startTime: new Date() } : task
      )
    );
  };

  const handlePauseTask = (taskId: string) => {
    setIsTimerRunning(false);
    setDailyTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, status: 'paused' } : task))
    );
  };

  const handleCompleteTask = (taskId: string) => {
    setIsTimerRunning(false);
    setCurrentTask(null);
    setSessionTime(0);
    setCompletedPomodoros((prev) => prev + 1);
    setDailyTasks((prevTasks) =>
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
    setDailyTasks((prevTasks) =>
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

  // ユーティリティ関数
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getEnergyIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <Zap className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Zap className="w-4 h-4 text-green-500" />;
      default:
        return <Zap className="w-4 h-4 text-gray-500" />;
    }
  };

  // 日次メトリクス計算
  const calculateDailyMetrics = () => {
    const totalPlannedMinutes = dailyTasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
    const totalActualMinutes = dailyTasks.reduce((sum, task) => sum + task.actualMinutes, 0);
    const completedTasks = dailyTasks.filter((task) => task.status === 'completed').length;
    const totalTasks = dailyTasks.length;
    const efficiency =
      totalPlannedMinutes > 0 ? (totalActualMinutes / totalPlannedMinutes) * 100 : 0;

    return {
      totalPlannedMinutes,
      totalActualMinutes,
      completedTasks,
      totalTasks,
      efficiency,
    };
  };

  const dailyMetrics = calculateDailyMetrics();

  const recalculatePredictions = () => {
    setLastUpdated(new Date());
    setPredictionAccuracy(Math.random() * 10 + 80);
  };

  // 日次計画ビューのレンダリング
  const renderDailyView = () => (
    <div className="space-y-6">
      {/* 日次サマリー */}
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
                {Math.floor(dailyMetrics.totalPlannedMinutes / 60)}h{' '}
                {dailyMetrics.totalPlannedMinutes % 60}m
              </div>
              <div className="text-xs text-muted-foreground">予定時間</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {dailyMetrics.completedTasks}/{dailyMetrics.totalTasks}
              </div>
              <div className="text-xs text-muted-foreground">完了タスク</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {dailyMetrics.efficiency.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">効率</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{streakDays}日</div>
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
                  {dailyTasks.find((t) => t.id === currentTask)?.badgeEmoji}
                </span>
                <div>
                  <div className="font-medium">
                    {dailyTasks.find((t) => t.id === currentTask)?.taskName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dailyTasks.find((t) => t.id === currentTask)?.badgeName}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {formatSessionTime(sessionTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  目標:{' '}
                  {formatTime(dailyTasks.find((t) => t.id === currentTask)?.estimatedMinutes || 0)}
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

      {/* タスク一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            📋 今日のタスク
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{task.badgeEmoji}</span>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{task.taskName}</span>
                      <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <Badge variant="outline" className="text-xs">
                        難易度 {task.difficulty}/5
                      </Badge>
                      {getEnergyIcon(task.energyLevel)}
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {task.badgeName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(task.estimatedMinutes)}
                      </span>
                      {task.actualMinutes > 0 && (
                        <span className="text-green-600">
                          実績: {formatTime(task.actualMinutes)}
                        </span>
                      )}
                    </div>

                    {/* 進捗バー */}
                    {task.status !== 'not_started' && (
                      <div className="mt-2">
                        <Progress
                          value={(task.actualMinutes / task.estimatedMinutes) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>

                  {/* アクションボタン */}
                  <div className="flex flex-col gap-2">
                    {task.status === 'not_started' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartTask(task.id)}
                        className="flex items-center gap-1"
                      >
                        <PlayCircle className="w-4 h-4" />
                        開始
                      </Button>
                    )}

                    {task.status === 'in_progress' && currentTask === task.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePauseTask(task.id)}
                        className="flex items-center gap-1"
                      >
                        <PauseCircle className="w-4 h-4" />
                        停止
                      </Button>
                    )}

                    {task.status === 'in_progress' && currentTask !== task.id && (
                      <Button
                        size="sm"
                        onClick={() => handleStartTask(task.id)}
                        className="flex items-center gap-1"
                      >
                        <PlayCircle className="w-4 h-4" />
                        再開
                      </Button>
                    )}

                    {(task.status === 'in_progress' || task.status === 'paused') && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleCompleteTask(task.id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          完了
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResetTask(task.id)}
                          className="flex items-center gap-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          リセット
                        </Button>
                      </>
                    )}

                    {task.status === 'completed' && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        完了済み
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI推奨事項 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            🤖 今日のAI推奨事項
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Sun className="w-4 h-4 text-orange-500 mt-1" />
                <div>
                  <div className="font-medium text-sm">🌅 朝の集中時間を活用</div>
                  <div className="text-xs text-muted-foreground">
                    高エネルギータスク「ペネトレーションテスト学習」を今すぐ開始することをお勧めします
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-red-500 mt-1" />
                <div>
                  <div className="font-medium text-sm">🔥 高優先度タスクに集中</div>
                  <div className="text-xs text-muted-foreground">
                    2個の高優先度タスクが残っています。順序良く取り組みましょう
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-green-500 mt-1" />
                <div>
                  <div className="font-medium text-sm">⚡ エネルギーレベル良好</div>
                  <div className="text-xs text-muted-foreground">
                    現在のエネルギーレベル({energyState.currentLevel}
                    %)で難しいタスクに挑戦する絶好のタイミングです
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            🔮 拡張バッジ完了予測システム
          </h1>
          <p className="text-muted-foreground mt-2">
            AI駆動の12週間詳細予測 • 精度: {predictionAccuracy.toFixed(1)}% • 最終更新:{' '}
            {lastUpdated.toLocaleString('ja-JP')}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={recalculatePredictions}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            再計算
          </Button>
          <Button
            variant={focusMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFocusMode(!focusMode)}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            集中モード {focusMode ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* メトリクスダッシュボード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mainMetrics.totalPredictedBadges}
              </div>
              <div className="text-sm text-muted-foreground">総予測バッジ数</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mainMetrics.completedBadges}</div>
              <div className="text-sm text-muted-foreground">完了済みバッジ</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mainMetrics.totalLearningHours}h
              </div>
              <div className="text-sm text-muted-foreground">総学習時間</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mainMetrics.accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">予測精度</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="daily">日次計画</TabsTrigger>
          <TabsTrigger value="weekly">週次スケジュール</TabsTrigger>
          <TabsTrigger value="monthly">月次概要</TabsTrigger>
          <TabsTrigger value="vs">予定vs実績</TabsTrigger>
          <TabsTrigger value="timeline">バッジタイムライン</TabsTrigger>
          <TabsTrigger value="analysis">分析ダッシュボード</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          {renderDailyView()}
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>📅 週次スケジュール</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <p>週次スケジュール表示機能を実装中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 月次概要</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p>月次概要機能を実装中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>📈 予定vs実績</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                <p>予定vs実績分析機能を実装中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>⏰ バッジタイムライン</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <p>詳細なタイムライン表示機能を実装中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>🔍 分析ダッシュボード</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p>高度な分析機能を実装中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 使い方ガイド */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            📚 使い方ガイド
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Step 1</h4>
              <p className="text-sm text-muted-foreground">スケジュール設定</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 右上の「設定」から週間作業時間を設定</li>
                <li>• 集中モードを有効にすると1.5倍速で進捗</li>
                <li>• 個人のペースに合わせて調整することで予測精度が向上</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Step 2</h4>
              <p className="text-sm text-muted-foreground">優先度確認</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 「週次スケジュール」で最適化された獲得順序を確認</li>
                <li>• 🔥高優先度バッジから着手することを推奨</li>
                <li>• 依存関係のあるバッジは前提条件を先に完了</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Step 3</h4>
              <p className="text-sm text-muted-foreground">マイルストーン活用</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 「バッジタイムライン」で短期・中期・長期の目標を確認</li>
                <li>• マイルストーン達成時にモチベーションを維持</li>
                <li>• 「月次概要」で累積進捗率を把握</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Step 4</h4>
              <p className="text-sm text-muted-foreground">週次計画実行</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 「日次計画」で具体的な作業スケジュールを確認</li>
                <li>• カテゴリフォーカスで集中的に学習領域を絞る</li>
                <li>• 「予定vs実績」で予想完了数を目標に作業効率を最適化</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtendedBadgePredictionSystem;
