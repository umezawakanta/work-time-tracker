import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import {
  createCognitiveDataService,
  CognitiveDataPersistenceService,
} from '@/services/cognitive/CognitiveDataPersistenceService';
import type { ADHDTask } from '@/services/cognitive/CognitiveDataPersistenceService';
import {
  AdaptiveUIProvider,
  AdaptiveCard,
  AdaptiveButton,
  AdaptiveText,
} from '@/components/adaptive/AdaptiveUISystem';
import { CognitiveLoadDashboard } from '@/components/cognitive/CognitiveLoadDashboard';
import {
  Plus,
  Play,
  Pause,
  Square,
  Clock,
  Zap,
  Brain,
  Target,
  CheckCircle2,
  Circle,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Star,
  Award,
  Lightbulb,
  Scissors,
  Timer,
  Battery,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Filter,
  SortAsc,
  Calendar,
  AlertCircle,
  Coffee,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  BarChart3,
  PieChart,
  Trash2,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { format, addMinutes, differenceInMinutes } from 'date-fns';
import { ja } from 'date-fns/locale';

// ADHD/ASD特化型タスク管理の型定義は CognitiveDataPersistenceService からインポート

interface EnergyState {
  current: number; // 0-100
  optimal: number; // 最適レベル
  trend: 'rising' | 'stable' | 'falling';
}

interface FocusSession {
  taskId: string;
  startTime: Date;
  plannedDuration: number;
  actualDuration?: number;
  breaks: { start: Date; duration: number }[];
  productivity: number; // 1-10
  energy: { before: number; after: number };
}

interface TaskFilter {
  energy: 'any' | 'low' | 'medium' | 'high';
  priority: 'any' | 'low' | 'medium' | 'high' | 'urgent';
  category: 'any' | 'work' | 'personal' | 'health' | 'creative' | 'admin';
  sensoryLoad: 'any' | 'low' | 'medium' | 'high';
}

export const ADHDTaskManager: React.FC = () => {
  const { user } = useAuth();

  // State Management
  const [tasks, setTasks] = useState<ADHDTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [persistenceService, setPersistenceService] =
    useState<CognitiveDataPersistenceService | null>(null);

  const [energyState, setEnergyState] = useState<EnergyState>({
    current: 75,
    optimal: 80,
    trend: 'stable',
  });

  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [newTask, setNewTask] = useState<Partial<ADHDTask>>({});
  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState<TaskFilter>({
    energy: 'any',
    priority: 'any',
    category: 'any',
    sensoryLoad: 'any',
  });
  const [visualMode, setVisualMode] = useState<'board' | 'list' | 'timeline'>('board');
  const [sensoryFriendly, setSensoryFriendly] = useState(false);

  // 永続化サービスの初期化とデータロード
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializePersistence = async () => {
      try {
        setIsLoading(true);

        // 10秒のタイムアウトを設定
        timeoutId = setTimeout(() => {
          console.warn('認知データサービス初期化タイムアウト');
          setIsLoading(false);
        }, 10000);

        const userId = user?.id || 'demo-user';
        const service = createCognitiveDataService(userId, {
          storage: 'indexedDB', // IndexedDBを試してlocalStorageにフォールバック
          encryption: false,
          syncInterval: 5,
          backupEnabled: true,
        });

        setPersistenceService(service);

        // サービス初期化イベントリスナー
        service.on('initialized', async () => {
          clearTimeout(timeoutId);
          console.log('🧠 認知データサービス初期化完了');

          try {
            // 既存タスクの読み込み
            const savedTasks = await service.loadTasks();

            // 初回起動時はデモデータを作成
            if (savedTasks.length === 0) {
              const demoTasks: ADHDTask[] = [
                {
                  id: '1',
                  title: '朝のルーティン完了',
                  status: 'done',
                  priority: 'high',
                  energyRequired: 'low',
                  estimatedMinutes: 30,
                  actualMinutes: 25,
                  breakdownSteps: ['歯磨き', '薬服用', '朝食', '身支度'],
                  completedSteps: 4,
                  category: 'health',
                  sensoryLoad: 'low',
                  dopamineReward: 7,
                  executiveDifficulty: 'easy',
                  createdAt: new Date(),
                  completedAt: new Date(),
                  isHyperfocusRisk: false,
                },
                {
                  id: '2',
                  title: 'プロジェクトレポート作成',
                  status: 'today',
                  priority: 'high',
                  energyRequired: 'high',
                  estimatedMinutes: 120,
                  breakdownSteps: ['資料収集', '構成案作成', '本文執筆', '見直し'],
                  completedSteps: 1,
                  category: 'work',
                  sensoryLoad: 'medium',
                  dopamineReward: 9,
                  executiveDifficulty: 'hard',
                  createdAt: new Date(),
                  isHyperfocusRisk: true,
                },
                {
                  id: '3',
                  title: '部屋の片付け',
                  status: 'ideas',
                  priority: 'medium',
                  energyRequired: 'medium',
                  estimatedMinutes: 60,
                  breakdownSteps: ['机の上整理', '床の片付け', '掃除機かけ'],
                  completedSteps: 0,
                  category: 'personal',
                  sensoryLoad: 'high',
                  dopamineReward: 6,
                  executiveDifficulty: 'medium',
                  createdAt: new Date(),
                  isHyperfocusRisk: false,
                },
              ];
              await service.saveTasks(demoTasks);
              setTasks(demoTasks);
            } else {
              setTasks(savedTasks);
            }

            setIsLoading(false);
          } catch (taskLoadError) {
            console.error('タスク読み込みエラー:', taskLoadError);
            setIsLoading(false);
          }
        });

        service.on('error', (error) => {
          clearTimeout(timeoutId);
          console.error('認知データサービスエラー:', error);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('永続化サービス初期化エラー:', error);
        setIsLoading(false);
      }
    };

    initializePersistence();

    // クリーンアップ
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (persistenceService) {
        persistenceService.dispose();
      }
    };
  }, [user]);

  // Utility Functions
  const getEnergyColor = (energy: number) => {
    if (energy >= 80) return 'text-green-600 bg-green-100';
    if (energy >= 60) return 'text-blue-600 bg-blue-100';
    if (energy >= 40) return 'text-yellow-600 bg-yellow-100';
    if (energy >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'low':
        return <Snowflake className="h-4 w-4 text-blue-500" />;
      case 'medium':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'high':
        return <Flame className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  // Task Management Functions
  const addTask = useCallback(async () => {
    if (!newTask.title || !persistenceService) return;

    const task: ADHDTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || '',
      status: 'ideas',
      priority: newTask.priority || 'medium',
      energyRequired: newTask.energyRequired || 'medium',
      estimatedMinutes: newTask.estimatedMinutes || 30,
      breakdownSteps: newTask.breakdownSteps || [],
      completedSteps: 0,
      category: newTask.category || 'personal',
      sensoryLoad: newTask.sensoryLoad || 'medium',
      dopamineReward: newTask.dopamineReward || 5,
      executiveDifficulty: newTask.executiveDifficulty || 'medium',
      createdAt: new Date(),
      isHyperfocusRisk: newTask.executiveDifficulty === 'hard' && newTask.estimatedMinutes! > 60,
    };

    try {
      // 永続化サービスに保存
      await persistenceService.saveTask(task);

      // UI状態を更新
      setTasks((prev) => [...prev, task]);
      setNewTask({});
      setShowAddTask(false);

      console.log('✅ 新しいタスクを追加・保存しました:', task.title);
    } catch (error) {
      console.error('タスク追加エラー:', error);
    }
  }, [newTask, persistenceService]);

  const moveTask = useCallback(
    async (taskId: string, newStatus: ADHDTask['status']) => {
      if (!persistenceService) return;

      try {
        const updatedTasks = tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: newStatus,
                completedAt: newStatus === 'done' ? new Date() : undefined,
              }
            : task
        );

        // 永続化サービスに保存
        await persistenceService.saveTasks(updatedTasks);

        // UI状態を更新
        setTasks(updatedTasks);

        console.log(`✅ タスク状態を変更・保存しました: ${taskId} → ${newStatus}`);
      } catch (error) {
        console.error('タスク移動エラー:', error);
      }
    },
    [tasks, persistenceService]
  );

  const startTimeBox = useCallback(
    (taskId: string, duration: number) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const session: FocusSession = {
        taskId,
        startTime: new Date(),
        plannedDuration: duration,
        breaks: [],
        productivity: 1,
        energy: { before: energyState.current, after: energyState.current },
      };

      setActiveSession(session);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                timeBox: {
                  start: new Date(),
                  duration,
                  isActive: true,
                },
                status: 'doing',
              }
            : t
        )
      );
    },
    [tasks, energyState]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !persistenceService) return;

      // ドーパミン報酬の視覚的フィードバック
      const celebration = task.dopamineReward >= 7 ? '🎉' : task.dopamineReward >= 5 ? '✨' : '👍';

      try {
        // 学習データの記録
        await persistenceService.recordLearningData({
          taskId,
          completionTime: task.actualMinutes || task.estimatedMinutes,
          energyBefore: energyState.current,
          energyAfter: Math.min(100, energyState.current + task.dopamineReward),
          difficultyRating:
            task.executiveDifficulty === 'hard' ? 8 : task.executiveDifficulty === 'medium' ? 5 : 3,
          satisfactionRating: task.dopamineReward,
          cognitiveLoad: task.sensoryLoad === 'high' ? 8 : task.sensoryLoad === 'medium' ? 5 : 3,
          distractionEvents: Math.floor(Math.random() * 3), // 仮の値
          breaksTaken: Math.floor(task.estimatedMinutes / 25), // ポモドーロ基準
          timestamp: new Date(),
        });

        // タスクの完了処理
        await moveTask(taskId, 'done');

        // エネルギー更新（完了による回復）
        const newEnergyLevel = Math.min(100, energyState.current + task.dopamineReward);
        setEnergyState((prev) => ({
          ...prev,
          current: newEnergyLevel,
        }));

        // エネルギー状態の保存
        await persistenceService.saveEnergyState({
          current: newEnergyLevel,
          optimal: energyState.optimal,
          trend: newEnergyLevel > energyState.current ? 'rising' : 'stable',
        });

        // 成功フィードバック表示
        console.log(`${celebration} タスク完了！ドーパミン+${task.dopamineReward}`);
      } catch (error) {
        console.error('タスク完了処理エラー:', error);
      }
    },
    [tasks, moveTask, energyState, persistenceService]
  );

  // タスクのエネルギー適合性チェック
  const getTaskRecommendation = (task: ADHDTask) => {
    const energyMatch = () => {
      if (energyState.current >= 80) return task.energyRequired;
      if (energyState.current >= 60) return task.energyRequired !== 'high';
      if (energyState.current >= 40) return task.energyRequired === 'low';
      return task.energyRequired === 'low' && task.executiveDifficulty === 'easy';
    };

    const isRecommended = energyMatch();
    const reason = isRecommended
      ? 'エネルギーレベルに適しています'
      : energyState.current < 40
        ? '休憩してからがお勧めです'
        : 'より軽いタスクから始めませんか？';

    return { isRecommended, reason };
  };

  // フィルタリング
  const filteredTasks = tasks.filter((task) => {
    if (filter.energy !== 'any' && task.energyRequired !== filter.energy) return false;
    if (filter.priority !== 'any' && task.priority !== filter.priority) return false;
    if (filter.category !== 'any' && task.category !== filter.category) return false;
    if (filter.sensoryLoad !== 'any' && task.sensoryLoad !== filter.sensoryLoad) return false;
    return true;
  });

  // タスクボードのカラムデータ
  const columns = [
    { id: 'ideas', title: '💡 アイデア', tasks: filteredTasks.filter((t) => t.status === 'ideas') },
    { id: 'today', title: '📅 今日やる', tasks: filteredTasks.filter((t) => t.status === 'today') },
    { id: 'doing', title: '🚀 実行中', tasks: filteredTasks.filter((t) => t.status === 'doing') },
    { id: 'done', title: '✅ 完了', tasks: filteredTasks.filter((t) => t.status === 'done') },
  ];

  // ローディング状態の表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium mb-2">🧠 認知タスク管理システム初期化中...</p>
          <p className="text-sm text-gray-600">
            データの読み込みと永続化サービスの設定を行っています
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdaptiveUIProvider userId={user?.id || 'demo-user'} autoStart={true}>
      <div className="space-y-6">
        {/* リアルタイム認知負荷監視とヘッダー */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            {/* ヘッダー - エネルギー状態とコントロール */}
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Brain className="h-6 w-6" />
                    ADHD/ASD タスク管理システム
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4" />
                      <span className="text-sm">エネルギー: {energyState.current}%</span>
                      <div
                        className={`px-2 py-1 rounded text-xs ${getEnergyColor(energyState.current)}`}
                      >
                        {energyState.current >= 80
                          ? '絶好調'
                          : energyState.current >= 60
                            ? '良好'
                            : energyState.current >= 40
                              ? '普通'
                              : energyState.current >= 20
                                ? '疲労'
                                : '要休憩'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSensoryFriendly(!sensoryFriendly)}
                    className="flex items-center gap-2"
                  >
                    {sensoryFriendly ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {sensoryFriendly ? '通常表示' : '感覚配慮'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddTask(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    新しいタスク
                  </Button>
                </div>
              </div>

              {/* 今日の進捗サマリー */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{columns[3].tasks.length}</div>
                  <div className="text-sm text-blue-100">完了タスク</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{columns[2].tasks.length}</div>
                  <div className="text-sm text-blue-100">実行中</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{columns[1].tasks.length}</div>
                  <div className="text-sm text-blue-100">今日予定</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">
                    {Math.round(
                      columns[3].tasks.reduce((sum, task) => sum + task.dopamineReward, 0)
                    )}
                  </div>
                  <div className="text-sm text-blue-100">ドーパミン獲得</div>
                </div>
              </div>
            </div>
          </div>

          {/* 認知負荷ダッシュボード（コンパクト） */}
          <div className="lg:col-span-1">
            <CognitiveLoadDashboard
              userId={user?.id || 'demo-user'}
              compactMode={true}
              autoStart={true}
            />
          </div>
        </div>

        {/* フィルター・表示モード */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <Button
              variant={visualMode === 'board' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualMode('board')}
            >
              カンバン
            </Button>
            <Button
              variant={visualMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualMode('list')}
            >
              リスト
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">フィルター:</span>
            <select
              value={filter.energy}
              onChange={(e) => setFilter((prev) => ({ ...prev, energy: e.target.value as any }))}
              className="text-sm border rounded px-2 py-1"
              aria-label="エネルギーフィルター"
            >
              <option value="any">エネルギー: 全て</option>
              <option value="low">低エネルギー</option>
              <option value="medium">中エネルギー</option>
              <option value="high">高エネルギー</option>
            </select>

            <select
              value={filter.priority}
              onChange={(e) => setFilter((prev) => ({ ...prev, priority: e.target.value as any }))}
              className="text-sm border rounded px-2 py-1"
              aria-label="優先度フィルター"
            >
              <option value="any">優先度: 全て</option>
              <option value="urgent">緊急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>

        {/* メインタスクボード */}
        {visualMode === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <Card key={column.id} className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{column.title}</span>
                    <Badge variant="outline">{column.tasks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {column.tasks.map((task) => {
                    const recommendation = getTaskRecommendation(task);
                    const progressPercentage = Math.round(
                      (task.completedSteps / Math.max(task.breakdownSteps.length, 1)) * 100
                    );

                    return (
                      <Card
                        key={task.id}
                        className={`p-4 transition-all cursor-pointer ${
                          sensoryFriendly ? 'shadow-sm' : 'hover:shadow-md'
                        } ${!recommendation.isRecommended && task.status !== 'done' ? 'opacity-60' : ''}`}
                      >
                        <div className="space-y-3">
                          {/* タスクヘッダー */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                              {task.description && (
                                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                              )}
                            </div>
                            {task.isHyperfocusRisk && (
                              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            )}
                          </div>

                          {/* メタ情報 */}
                          <div className="flex items-center gap-2 text-xs">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getEnergyIcon(task.energyRequired)}
                              <span className="text-gray-600">{task.estimatedMinutes}分</span>
                            </div>
                          </div>

                          {/* 進捗バー */}
                          {task.breakdownSteps.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">進捗</span>
                                <span className="text-gray-600">
                                  {task.completedSteps}/{task.breakdownSteps.length}
                                </span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          )}

                          {/* アクションボタン */}
                          <div className="flex gap-2">
                            {task.status === 'today' && (
                              <Button
                                size="sm"
                                onClick={() => startTimeBox(task.id, task.estimatedMinutes)}
                                className="flex items-center gap-1 text-xs"
                                disabled={!recommendation.isRecommended}
                              >
                                <Play className="h-3 w-3" />
                                開始
                              </Button>
                            )}

                            {task.status === 'doing' && (
                              <Button
                                size="sm"
                                onClick={() => completeTask(task.id)}
                                className="flex items-center gap-1 text-xs"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                完了
                              </Button>
                            )}

                            {task.status === 'ideas' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => moveTask(task.id, 'today')}
                                className="flex items-center gap-1 text-xs"
                              >
                                <ArrowRight className="h-3 w-3" />
                                今日やる
                              </Button>
                            )}

                            {task.status === 'done' && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <Star className="h-3 w-3" />+{task.dopamineReward} ドーパミン
                              </div>
                            )}
                          </div>

                          {/* 推奨メッセージ */}
                          {!recommendation.isRecommended && task.status !== 'done' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                              <p className="text-xs text-yellow-800">{recommendation.reason}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 新しいタスク追加ダイアログ */}
        {showAddTask && (
          <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">新しいタスクを追加</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowAddTask(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">タスク名</label>
                  <Input
                    value={newTask.title || ''}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="タスク名を入力..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">説明（任意）</label>
                  <Textarea
                    value={newTask.description || ''}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="詳細説明..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">優先度</label>
                    <select
                      value={newTask.priority || 'medium'}
                      onChange={(e) =>
                        setNewTask((prev) => ({ ...prev, priority: e.target.value as any }))
                      }
                      className="w-full border rounded px-3 py-2"
                      aria-label="優先度"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                      <option value="urgent">緊急</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">必要エネルギー</label>
                    <select
                      value={newTask.energyRequired || 'medium'}
                      onChange={(e) =>
                        setNewTask((prev) => ({ ...prev, energyRequired: e.target.value as any }))
                      }
                      className="w-full border rounded px-3 py-2"
                      aria-label="必要エネルギー"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">予想時間（分）</label>
                    <Input
                      type="number"
                      value={newTask.estimatedMinutes || 30}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          estimatedMinutes: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">カテゴリ</label>
                    <select
                      value={newTask.category || 'personal'}
                      onChange={(e) =>
                        setNewTask((prev) => ({ ...prev, category: e.target.value as any }))
                      }
                      className="w-full border rounded px-3 py-2"
                      aria-label="カテゴリ"
                    >
                      <option value="work">仕事</option>
                      <option value="personal">個人</option>
                      <option value="health">健康</option>
                      <option value="creative">クリエイティブ</option>
                      <option value="admin">事務</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={addTask} className="flex-1">
                    追加
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddTask(false)}>
                    キャンセル
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* アクティブなタイムボックス表示 */}
        {activeSession && (
          <Card className="fixed bottom-4 right-4 w-80 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900">集中セッション</h3>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {Math.round(differenceInMinutes(new Date(), activeSession.startTime))}分経過
                  </span>
                </div>
              </div>

              <div className="text-sm text-blue-800 mb-3">
                {tasks.find((t) => t.id === activeSession.taskId)?.title}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Coffee className="h-4 w-4 mr-1" />
                  休憩
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    completeTask(activeSession.taskId);
                    setActiveSession(null);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  完了
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdaptiveUIProvider>
  );
};
