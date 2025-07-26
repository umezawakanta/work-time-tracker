/**
 * 🧠 最適化ADHD/ASDタスクマネージャー
 * 認知統合サービスと完全統合した個人最適化タスク管理システム
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Zap,
  Target,
  Clock,
  Calendar,
  Star,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Plus,
  Edit,
  Trash2,
  Timer,
  Battery,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Coffee,
  Sparkles,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Heart,
  Award,
  X,
} from 'lucide-react';
import { format, addMinutes, differenceInMinutes, isToday, isTomorrow } from 'date-fns';
import { ja } from 'date-fns/locale';
import CognitiveIntegrationService from '@/services/cognitive/CognitiveIntegrationService';

// 最適化されたタスク型定義
interface OptimizedTask {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'today' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // 認知特性関連
  cognitiveLoad: number; // 1-100
  energyRequired: 'low' | 'medium' | 'high';
  executiveDifficulty: 'easy' | 'medium' | 'hard';
  attentionSpan: number; // minutes

  // タスク詳細
  estimatedMinutes: number;
  actualMinutes?: number;
  breakdownSteps: string[];
  completedSteps: number;
  category: 'work' | 'personal' | 'health' | 'creative' | 'admin';

  // スケジューリング
  dueDate?: Date;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  optimalTimeSlot?: {
    start: string;
    end: string;
    reason: string;
    confidence: number;
  };

  // 認知最適化
  isOptimized: boolean;
  originalCognitiveLoad?: number;
  optimizedCognitiveLoad?: number;
  subtasks?: OptimizedTask[];
  recommendations: string[];

  // ADHD特化
  dopamineReward: number; // 1-10
  sensoryLoad: 'low' | 'medium' | 'high';
  isHyperfocusRisk: boolean;
  distractionLevel: 'low' | 'medium' | 'high';

  // メタデータ
  createdAt: Date;
  completedAt?: Date;
  tags: string[];
  notes?: string;
}

interface TaskSession {
  taskId: string;
  startTime: Date;
  plannedDuration: number;
  actualDuration?: number;
  breaks: { start: Date; duration: number }[];
  productivity: number; // 1-10
  energy: { before: number; after: number };
  cognitiveState: {
    focus: number; // 1-10
    overwhelm: number; // 1-10
    motivation: number; // 1-10
  };
}

export const OptimizedADHDTaskManager: React.FC = () => {
  // Core state
  const [tasks, setTasks] = useState<OptimizedTask[]>([]);
  const [cognitiveService] = useState(() => new CognitiveIntegrationService());
  const [activeSession, setActiveSession] = useState<TaskSession | null>(null);
  const [currentEnergy, setCurrentEnergy] = useState(7);
  const [currentFocus, setCurrentFocus] = useState(8);
  const [isOptimizationEnabled, setIsOptimizationEnabled] = useState(true);

  // UI state
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<OptimizedTask | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'timeline' | 'focus'>('board');
  const [filterEnergy, setFilterEnergy] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sensoryFriendly, setSensoryFriendly] = useState(false);

  // Form state
  const [newTask, setNewTask] = useState<Partial<OptimizedTask>>({});

  // Initialize sample data and cognitive service
  useEffect(() => {
    const initializeSystem = async () => {
      // デモ認知プロファイル設定
      const demoCognitiveProfile = {
        id: 'demo-profile',
        userId: 'demo-user',
        date: new Date(),
        verbalComprehension: 110,
        perceptualReasoning: 95,
        workingMemory: 85,
        processingSpeed: 80,
        executiveFunction: 75,
        attentionalControl: 70,
        sensoryProcessing: 85,
        socialCognition: 90,
        personalizedSettings: {
          optimalTaskDuration: 45,
          preferredBreakFrequency: 25,
          visualComplexityLevel: 'medium' as const,
          auditoryProcessingPreference: 'minimal' as const,
          multitaskingCapacity: 'dual' as const,
          timeStructureNeed: 'flexible' as const,
          cognitiveLoadThreshold: 70,
          distractionSensitivity: 'high' as const,
        },
        strengths: ['言語理解', '論理的思考', '創造性'],
        challenges: ['注意持続', '実行機能', '時間管理'],
        recommendations: [
          'タスクを小さく分割する',
          '定期的な休憩を取る',
          '視覚的なリマインダーを活用する',
        ],
      };

      await cognitiveService.updateCognitiveProfile(demoCognitiveProfile);

      // サンプルタスクデータ
      const sampleTasks: OptimizedTask[] = [
        {
          id: '1',
          title: '朝のルーティン完了',
          status: 'done',
          priority: 'high',
          cognitiveLoad: 30,
          energyRequired: 'low',
          executiveDifficulty: 'easy',
          attentionSpan: 30,
          estimatedMinutes: 30,
          actualMinutes: 25,
          breakdownSteps: ['歯磨き', '薬服用', '朝食', '身支度'],
          completedSteps: 4,
          category: 'health',
          isOptimized: true,
          originalCognitiveLoad: 40,
          optimizedCognitiveLoad: 30,
          recommendations: ['毎日同じ時間に実行して習慣化'],
          dopamineReward: 7,
          sensoryLoad: 'low',
          isHyperfocusRisk: false,
          distractionLevel: 'low',
          createdAt: new Date(),
          completedAt: new Date(),
          tags: ['routine', 'health', 'morning'],
        },
        {
          id: '2',
          title: '重要プロジェクト企画書作成',
          status: 'today',
          priority: 'urgent',
          cognitiveLoad: 85,
          energyRequired: 'high',
          executiveDifficulty: 'hard',
          attentionSpan: 45,
          estimatedMinutes: 120,
          breakdownSteps: ['資料収集', '構成案作成', '本文執筆', '見直し・修正'],
          completedSteps: 1,
          category: 'work',
          isOptimized: true,
          originalCognitiveLoad: 95,
          optimizedCognitiveLoad: 40,
          subtasks: [
            {
              id: '2-1',
              title: '企画書作成 - 段階 1（資料収集）',
              status: 'today',
              priority: 'urgent',
              cognitiveLoad: 40,
              energyRequired: 'medium',
              executiveDifficulty: 'medium',
              attentionSpan: 30,
              estimatedMinutes: 30,
              breakdownSteps: ['関連資料検索', '重要ポイント抽出'],
              completedSteps: 0,
              category: 'work',
              isOptimized: true,
              recommendations: ['集中できる午前中に実施'],
              dopamineReward: 6,
              sensoryLoad: 'medium',
              isHyperfocusRisk: false,
              distractionLevel: 'medium',
              createdAt: new Date(),
              tags: ['work', 'research'],
            },
          ] as OptimizedTask[],
          optimalTimeSlot: {
            start: '09:00',
            end: '11:00',
            reason: '認知機能が最も高い時間帯です',
            confidence: 0.9,
          },
          recommendations: [
            '📱 通知をオフにして集中環境を作りましょう',
            '📝 タスクを細かく分割して記録を取りながら進めましょう',
            '⏰ タイマーを使って時間を区切って作業しましょう',
          ],
          dopamineReward: 9,
          sensoryLoad: 'high',
          isHyperfocusRisk: true,
          distractionLevel: 'low',
          createdAt: new Date(),
          tags: ['work', 'important', 'writing'],
          scheduledStart: new Date(2024, 11, 18, 9, 0),
          scheduledEnd: new Date(2024, 11, 18, 11, 0),
        },
        {
          id: '3',
          title: '部屋の整理整頓',
          status: 'backlog',
          priority: 'medium',
          cognitiveLoad: 50,
          energyRequired: 'medium',
          executiveDifficulty: 'medium',
          attentionSpan: 25,
          estimatedMinutes: 60,
          breakdownSteps: ['机の上整理', '床の片付け', '掃除機かけ', '物の定位置決め'],
          completedSteps: 0,
          category: 'personal',
          isOptimized: false,
          recommendations: ['好きな音楽をかけながら実施'],
          dopamineReward: 6,
          sensoryLoad: 'high',
          isHyperfocusRisk: false,
          distractionLevel: 'high',
          createdAt: new Date(),
          tags: ['cleaning', 'environment'],
        },
      ];

      // 認知最適化を適用
      const optimizedTasks = sampleTasks.map((task) => {
        if (isOptimizationEnabled) {
          return cognitiveService.optimizeTask('demo-user', task);
        }
        return task;
      });

      setTasks(optimizedTasks);
    };

    initializeSystem();
  }, [cognitiveService, isOptimizationEnabled]);

  // タスクのエネルギー適合性チェック
  const getTaskRecommendation = useCallback(
    (task: OptimizedTask) => {
      if (!isOptimizationEnabled) {
        return { isRecommended: true, reason: '最適化機能が無効です' };
      }

      const energyMatch = () => {
        if (currentEnergy >= 8) return true;
        if (currentEnergy >= 6) return task.energyRequired !== 'high';
        if (currentEnergy >= 4) return task.energyRequired === 'low';
        return task.energyRequired === 'low' && task.executiveDifficulty === 'easy';
      };

      const isRecommended = energyMatch();
      const reason = isRecommended
        ? 'エネルギーレベルに適しています'
        : currentEnergy < 4
          ? '休憩してからがお勧めです'
          : 'より軽いタスクから始めませんか？';

      return { isRecommended, reason };
    },
    [currentEnergy, isOptimizationEnabled]
  );

  // フィルタリング
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterEnergy !== 'all' && task.energyRequired !== filterEnergy) return false;
      return true;
    });
  }, [tasks, filterEnergy]);

  // タスクボードのカラム
  const taskColumns = useMemo(() => {
    const columns = [
      {
        id: 'backlog',
        title: '💡 バックログ',
        tasks: filteredTasks.filter((t) => t.status === 'backlog'),
      },
      {
        id: 'today',
        title: '📅 今日やる',
        tasks: filteredTasks.filter((t) => t.status === 'today'),
      },
      { id: 'doing', title: '🚀 実行中', tasks: filteredTasks.filter((t) => t.status === 'doing') },
      { id: 'done', title: '✅ 完了', tasks: filteredTasks.filter((t) => t.status === 'done') },
    ];

    // 認知最適化による並び替え
    if (isOptimizationEnabled) {
      columns.forEach((column) => {
        column.tasks.sort((a, b) => {
          const aRecommendation = getTaskRecommendation(a);
          const bRecommendation = getTaskRecommendation(b);

          if (aRecommendation.isRecommended && !bRecommendation.isRecommended) return -1;
          if (!aRecommendation.isRecommended && bRecommendation.isRecommended) return 1;

          // 優先度順
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      });
    }

    return columns;
  }, [filteredTasks, isOptimizationEnabled, getTaskRecommendation]);

  // 今日のフォーカス提案
  const todaysFocusSuggestion = useMemo(() => {
    const todayTasks = taskColumns.find((col) => col.id === 'today')?.tasks || [];
    const recommendedTasks = todayTasks.filter((task) => getTaskRecommendation(task).isRecommended);

    if (recommendedTasks.length === 0) return null;

    const highPriorityTask = recommendedTasks.find(
      (task) => task.priority === 'urgent' || task.priority === 'high'
    );
    const suggestion = highPriorityTask || recommendedTasks[0];

    return {
      task: suggestion,
      reason: suggestion.optimalTimeSlot
        ? suggestion.optimalTimeSlot.reason
        : 'エネルギーレベルに適しています',
      confidence: suggestion.optimalTimeSlot ? suggestion.optimalTimeSlot.confidence : 0.7,
    };
  }, [taskColumns, getTaskRecommendation]);

  // タスク追加
  const addTask = useCallback(() => {
    if (!newTask.title) return;

    const task: OptimizedTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || '',
      status: 'backlog',
      priority: newTask.priority || 'medium',
      cognitiveLoad: 50, // デフォルト値
      energyRequired: newTask.energyRequired || 'medium',
      executiveDifficulty: newTask.executiveDifficulty || 'medium',
      attentionSpan: newTask.attentionSpan || 30,
      estimatedMinutes: newTask.estimatedMinutes || 30,
      breakdownSteps: newTask.breakdownSteps || [],
      completedSteps: 0,
      category: newTask.category || 'personal',
      isOptimized: false,
      recommendations: [],
      dopamineReward: newTask.dopamineReward || 5,
      sensoryLoad: newTask.sensoryLoad || 'medium',
      isHyperfocusRisk:
        newTask.executiveDifficulty === 'hard' && (newTask.estimatedMinutes || 30) > 60,
      distractionLevel: 'medium',
      createdAt: new Date(),
      tags: newTask.tags || [],
    };

    // 認知最適化を適用
    const optimizedTask = isOptimizationEnabled
      ? cognitiveService.optimizeTask('demo-user', task)
      : task;

    setTasks((prev) => [...prev, optimizedTask]);
    setNewTask({});
    setShowAddTask(false);
  }, [newTask, cognitiveService, isOptimizationEnabled]);

  // タスク状態変更
  const updateTaskStatus = useCallback((taskId: string, newStatus: OptimizedTask['status']) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              completedAt: newStatus === 'done' ? new Date() : undefined,
            }
          : task
      )
    );
  }, []);

  // タスクセッション開始
  const startTaskSession = useCallback(
    (task: OptimizedTask) => {
      const session: TaskSession = {
        taskId: task.id,
        startTime: new Date(),
        plannedDuration: task.attentionSpan,
        breaks: [],
        productivity: 1,
        energy: { before: currentEnergy, after: currentEnergy },
        cognitiveState: {
          focus: currentFocus,
          overwhelm: 3,
          motivation: 7,
        },
      };

      setActiveSession(session);
      updateTaskStatus(task.id, 'doing');
    },
    [currentEnergy, currentFocus, updateTaskStatus]
  );

  // タスク完了
  const completeTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      updateTaskStatus(taskId, 'done');
      setActiveSession(null);

      // ドーパミン報酬フィードバック
      const celebration = task.dopamineReward >= 7 ? '🎉' : task.dopamineReward >= 5 ? '✨' : '👍';
      console.log(`${celebration} タスク完了！ドーパミン+${task.dopamineReward}`);
    },
    [tasks, updateTaskStatus]
  );

  // 統計情報
  const statistics = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'done');
    const totalDopamine = completed.reduce((sum, task) => sum + task.dopamineReward, 0);
    const totalFocusTime = completed.reduce((sum, task) => sum + (task.actualMinutes || 0), 0);
    const optimizedTasks = tasks.filter((t) => t.isOptimized);

    return {
      completedToday: completed.length,
      totalDopamine,
      totalFocusTime,
      optimizationRate:
        tasks.length > 0 ? Math.round((optimizedTasks.length / tasks.length) * 100) : 0,
      averageCognitiveLoad:
        optimizedTasks.length > 0
          ? Math.round(
              optimizedTasks.reduce(
                (sum, task) => sum + (task.optimizedCognitiveLoad || task.cognitiveLoad),
                0
              ) / optimizedTasks.length
            )
          : 0,
    };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Brain className="h-8 w-8" />
              認知最適化タスクマネージャー
            </h1>
            <p className="text-purple-100">ADHD/ASD認知特性に基づく個人最適化システム</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsOptimizationEnabled(!isOptimizationEnabled)}
              className={`${isOptimizationEnabled ? 'bg-white text-purple-600' : ''}`}
            >
              <Zap className="h-4 w-4 mr-2" />
              {isOptimizationEnabled ? '最適化ON' : '最適化OFF'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSensoryFriendly(!sensoryFriendly)}
            >
              {sensoryFriendly ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowAddTask(true)}>
              <Plus className="h-4 w-4" />
              新規タスク
            </Button>
          </div>
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{statistics.completedToday}</div>
            <div className="text-sm text-purple-100">今日の完了</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{statistics.totalDopamine}</div>
            <div className="text-sm text-purple-100">ドーパミン獲得</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {Math.round((statistics.totalFocusTime / 60) * 10) / 10}h
            </div>
            <div className="text-sm text-purple-100">集中時間</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{statistics.optimizationRate}%</div>
            <div className="text-sm text-purple-100">最適化率</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{statistics.averageCognitiveLoad}</div>
            <div className="text-sm text-purple-100">平均認知負荷</div>
          </div>
        </div>
      </div>

      {/* 今日のフォーカス提案 */}
      {isOptimizationEnabled && todaysFocusSuggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              今日のフォーカス提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-green-800">{todaysFocusSuggestion.task.title}</h3>
                <p className="text-sm text-green-600">{todaysFocusSuggestion.reason}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-green-700">
                  <span>推定時間: {todaysFocusSuggestion.task.estimatedMinutes}分</span>
                  <span>認知負荷: {todaysFocusSuggestion.task.cognitiveLoad}</span>
                  <span>信頼度: {Math.round(todaysFocusSuggestion.confidence * 100)}%</span>
                </div>
              </div>
              <Button
                onClick={() => startTaskSession(todaysFocusSuggestion.task)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                開始
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* フィルター */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'board' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('board')}
          >
            カンバン
          </Button>
          <Button
            variant={viewMode === 'focus' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('focus')}
          >
            フォーカス
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">エネルギー:</span>
          <select
            value={filterEnergy}
            onChange={(e) => setFilterEnergy(e.target.value as any)}
            className="text-sm border rounded px-2 py-1"
            aria-label="エネルギーフィルター"
          >
            <option value="all">全て</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
      </div>

      {/* タスクボード */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {taskColumns.map((column) => (
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
                      } ${!recommendation.isRecommended && task.status !== 'done' ? 'opacity-60' : ''} ${
                        task.isOptimized ? 'border-l-4 border-l-purple-500' : ''
                      }`}
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
                          <div className="flex items-center gap-1 ml-2">
                            {task.isOptimized && <Sparkles className="h-3 w-3 text-purple-500" />}
                            {task.isHyperfocusRisk && (
                              <AlertTriangle className="h-3 w-3 text-orange-500" />
                            )}
                          </div>
                        </div>

                        {/* 認知負荷表示 */}
                        {task.isOptimized && (
                          <div className="text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">認知負荷</span>
                              <span className="font-medium">
                                {task.originalCognitiveLoad} → {task.optimizedCognitiveLoad}
                              </span>
                            </div>
                            <Progress value={task.optimizedCognitiveLoad} className="h-1" />
                          </div>
                        )}

                        {/* 最適時間帯 */}
                        {task.optimalTimeSlot && task.status === 'today' && (
                          <div className="bg-green-50 p-2 rounded text-xs">
                            <div className="flex items-center gap-1 text-green-700">
                              <Clock className="h-3 w-3" />
                              最適時間: {task.optimalTimeSlot.start} - {task.optimalTimeSlot.end}
                            </div>
                            <div className="text-green-600 mt-1">{task.optimalTimeSlot.reason}</div>
                          </div>
                        )}

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

                        {/* 推奨事項 */}
                        {task.recommendations.length > 0 && task.status === 'today' && (
                          <div className="bg-blue-50 p-2 rounded text-xs">
                            <div className="text-blue-700 font-medium mb-1">推奨アクション:</div>
                            <ul className="text-blue-600 space-y-1">
                              {task.recommendations.slice(0, 2).map((rec, index) => (
                                <li key={index}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* アクションボタン */}
                        <div className="flex gap-2">
                          {task.status === 'today' && (
                            <Button
                              size="sm"
                              onClick={() => startTaskSession(task)}
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

                          {task.status === 'backlog' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, 'today')}
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

                        {/* エネルギー不適合メッセージ */}
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

      {/* アクティブセッション表示 */}
      {activeSession && (
        <Card className="fixed bottom-4 right-4 w-80 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-900">🎯 集中セッション</h3>
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

      {/* タスク追加モーダル */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>新しいタスクを追加</span>
                <Button variant="ghost" size="sm" onClick={() => setShowAddTask(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
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
                  <label className="text-sm font-medium text-gray-700">集中可能時間（分）</label>
                  <Input
                    type="number"
                    value={newTask.attentionSpan || 30}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        attentionSpan: parseInt(e.target.value),
                      }))
                    }
                  />
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OptimizedADHDTaskManager;
