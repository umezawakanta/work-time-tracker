/**
 * 🧠 ADHD/ASD生活支援サイト 完成計画
 * 認知特性に基づくパーソナライズされたタスク管理・資産管理・生活支援システム
 *
 * 🚀 Vercel デプロイ対応版 - リアルタイム進捗追跡統合
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import {
  Target,
  Package,
  Layers,
  Code,
  FileText,
  Rocket,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  GitBranch,
  Shield,
  Palette,
  Database,
  Globe,
  Play,
  Timer,
  Calendar,
  Bell,
  Users,
  FileSpreadsheet,
  Settings,
  Plus,
  ExternalLink,
  Activity,
  CheckCircle2,
  Brain,
  TrendingUp,
  RefreshCw,
  Circle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LiveImprovementPlanTracker from '@/components/progress/LiveImprovementPlanTracker';
import {
  ProgressReflectionService,
  ProgressUpdate,
} from '@/services/ci-cd/ProgressReflectionService';

interface TaskProgress {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  phase: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  lastUpdated: string;
  tags?: string[]; // 改善項目との関連付け用
}

interface ProjectProgress {
  id: string;
  name: string;
  description: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overallProgress: number;
  phases: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
    startDate?: string;
    endDate?: string;
    tasks: string[];
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    progress: number;
    tasks: string[];
  }>;
  lastUpdated: string;
}

const SiteImprovementPlan: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPhase, setSelectedPhase] = useState<string>('phase0');
  const [tasks, setTasks] = useState<TaskProgress[]>([]);
  const [projects, setProjects] = useState<ProjectProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [realtimeUpdates, setRealtimeUpdates] = useState<ProgressUpdate[]>([]);
  const [progressService] = useState(() => ProgressReflectionService.getInstance());

  // CI/CD進捗リアルタイム購読
  useEffect(() => {
    const unsubscribe = progressService.subscribe((update: ProgressUpdate) => {
      setRealtimeUpdates((prev) => {
        const filtered = prev.filter((u) => u.id !== update.id);
        return [update, ...filtered].slice(0, 20); // 最新20件を保持
      });

      // 進捗更新時の通知
      if (update.status === 'success') {
        toast.success(`${update.title}`);
      } else if (update.status === 'failure') {
        toast.error(`${update.title}`);
      }
    });

    // 初期履歴の取得
    setRealtimeUpdates(progressService.getProgressHistory().slice(0, 20));

    return unsubscribe;
  }, [progressService]);

  // リアルタイムデータ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [tasksResponse, projectsResponse] = await Promise.all([
          fetch('/api/progress/tracking?type=tasks', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
          }),
          fetch('/api/progress/tracking?type=projects', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
          }),
        ]);

        if (tasksResponse.ok && projectsResponse.ok) {
          const tasksData = await tasksResponse.json();
          const projectsData = await projectsResponse.json();

          if (tasksData.success) setTasks(tasksData.data);
          if (projectsData.success) setProjects(projectsData.data);

          setLastSync(new Date());
        } else {
          console.error('Failed to fetch progress data - Response not OK');
        }
      } catch (error) {
        console.error('Failed to fetch progress data:', error);
        toast.error('進捗データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // 30秒ごとに自動更新
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // フェーズ別進捗計算
  const calculatePhaseProgress = (phase: string): number => {
    const phaseTasks = tasks.filter((task) => task.phase === phase);
    if (phaseTasks.length === 0) return 0;

    const completedTasks = phaseTasks.filter((task) => task.status === 'completed').length;
    return Math.round((completedTasks / phaseTasks.length) * 100);
  };

  // フェーズデータ（動的生成）
  const generatePhaseData = () => {
    const phaseIds = ['phase0', 'phase1', 'phase2', 'phase3'];
    const phaseNames = {
      phase0: 'Phase 0: MVP機能完成',
      phase1: 'Phase 1: 基盤整備',
      phase2: 'Phase 2: 構造改善',
      phase3: 'Phase 3: アーキテクチャ刷新',
    };

    const phaseDescriptions = {
      phase0: '勤怠管理アプリとして必要最低限の機能を実装してリリース',
      phase1: 'UIライブラリの統一と不要な依存関係の削除',
      phase2: 'フォルダ構造の再編成とテストの追加',
      phase3: 'モノレポ構造への移行と機能の分離',
    };

    return phaseIds.map((phaseId) => {
      const progress = calculatePhaseProgress(phaseId);
      const phaseTasks = tasks.filter((task) => task.phase === phaseId);

      return {
        id: phaseId,
        title: phaseNames[phaseId as keyof typeof phaseNames],
        description: phaseDescriptions[phaseId as keyof typeof phaseDescriptions],
        progress,
        status:
          progress === 100
            ? 'completed'
            : phaseTasks.some((t) => t.status === 'in-progress')
              ? 'in-progress'
              : 'not-started',
        taskCount: phaseTasks.length,
        completedCount: phaseTasks.filter((t) => t.status === 'completed').length,
        inProgressCount: phaseTasks.filter((t) => t.status === 'in-progress').length,
        blockedCount: phaseTasks.filter((t) => t.status === 'blocked').length,
      };
    });
  };

  const phaseData = generatePhaseData();

  // タスクが実装タスクを持つかチェック
  const hasImplementationTasks = (taskId: string): boolean => {
    return tasks.some(
      (task) =>
        task.tags?.includes(taskId) ||
        task.title.toLowerCase().includes(taskId.toLowerCase()) ||
        task.description.toLowerCase().includes(taskId.toLowerCase())
    );
  };

  // 実装の開始
  const startImplementation = async (taskId: string) => {
    try {
      const response = await fetch('/api/progress/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          type: 'update',
          taskId,
          updates: {
            status: 'in-progress',
          },
          source: 'manual',
          reason: 'Implementation started from improvement plan',
        }),
      });

      if (response.ok) {
        toast.success('実装を開始しました');
        // データを再読み込み
        window.location.reload();
      } else {
        throw new Error('Failed to start implementation');
      }
    } catch (error) {
      toast.error('実装の開始に失敗しました');
    }
  };

  // 全体進捗の計算
  const overallProgress =
    tasks.length > 0
      ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* ヘッダー */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            サイト改善計画
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          リアルタイム進捗追跡システムによる動的な改善計画管理
        </p>

        {/* 全体進捗 */}
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
              <p className="text-sm text-gray-600">全体進捗</p>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-gray-500">最終更新: {lastSync.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>概要</span>
          </TabsTrigger>
          <TabsTrigger value="phases" className="flex items-center space-x-2">
            <Layers className="w-4 h-4" />
            <span>フェーズ</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>タスク</span>
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>リアルタイム</span>
          </TabsTrigger>
          <TabsTrigger value="cicd" className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4" />
            <span>CI/CD</span>
          </TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {phaseData.map((phase) => (
              <Card
                key={phase.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedPhase(phase.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{phase.title}</CardTitle>
                    <Badge
                      variant={
                        phase.status === 'completed'
                          ? 'default'
                          : phase.status === 'in-progress'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {phase.progress}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={phase.progress} />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">完了</p>
                      <p className="font-semibold text-green-600">{phase.completedCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">進行中</p>
                      <p className="font-semibold text-blue-600">{phase.inProgressCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* プロジェクト概要 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>進捗サマリー</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {tasks.filter((t) => t.status === 'completed').length}
                    </div>
                    <div className="text-sm text-green-700">完了タスク</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {tasks.filter((t) => t.status === 'in-progress').length}
                    </div>
                    <div className="text-sm text-blue-700">進行中</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>全体進捗</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>最近の活動</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks
                    .filter((task) => task.lastUpdated)
                    .sort(
                      (a, b) =>
                        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
                    )
                    .slice(0, 5)
                    .map((task) => (
                      <div key={task.id} className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            task.status === 'completed'
                              ? 'bg-green-500'
                              : task.status === 'in-progress'
                                ? 'bg-blue-500'
                                : task.status === 'blocked'
                                  ? 'bg-red-500'
                                  : 'bg-gray-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(task.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {task.progress}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* フェーズタブ */}
        <TabsContent value="phases" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {phaseData.map((phase) => (
              <Card
                key={phase.id}
                className={`${selectedPhase === phase.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{phase.title}</CardTitle>
                      <CardDescription>{phase.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{phase.progress}%</div>
                      <Badge
                        variant={
                          phase.status === 'completed'
                            ? 'default'
                            : phase.status === 'in-progress'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {phase.status === 'completed'
                          ? '完了'
                          : phase.status === 'in-progress'
                            ? '進行中'
                            : '未開始'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={phase.progress} />

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">総タスク</p>
                      <p className="font-semibold">{phase.taskCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">完了</p>
                      <p className="font-semibold text-green-600">{phase.completedCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">進行中</p>
                      <p className="font-semibold text-blue-600">{phase.inProgressCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">ブロック</p>
                      <p className="font-semibold text-red-600">{phase.blockedCount}</p>
                    </div>
                  </div>

                  {/* フェーズのタスク一覧 */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">タスク一覧</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {tasks
                        .filter((task) => task.phase === phase.id)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              {task.status === 'completed' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {task.status === 'in-progress' && (
                                <Clock className="w-4 h-4 text-blue-500" />
                              )}
                              {task.status === 'blocked' && (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              {task.status === 'not-started' && (
                                <Circle className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm">{task.title}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {task.progress}%
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* タスクタブ */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          task.priority === 'critical'
                            ? 'destructive'
                            : task.priority === 'high'
                              ? 'default'
                              : task.priority === 'medium'
                                ? 'secondary'
                                : 'outline'
                        }
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        variant={
                          task.status === 'completed'
                            ? 'default'
                            : task.status === 'in-progress'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">進捗</span>
                    <span className="text-sm font-medium">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">フェーズ</p>
                      <p className="font-medium">{task.phase}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">カテゴリ</p>
                      <p className="font-medium">{task.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">予定時間</p>
                      <p className="font-medium">{task.estimatedHours}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">実績時間</p>
                      <p className="font-medium">{task.actualHours}h</p>
                    </div>
                  </div>

                  {task.status !== 'completed' && task.status !== 'in-progress' && (
                    <Button
                      onClick={() => startImplementation(task.id)}
                      className="w-full"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      実装開始
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* リアルタイムタブ */}
        <TabsContent value="realtime" className="space-y-6">
          <LiveImprovementPlanTracker
            refreshInterval={30000}
            enableAutoSync={true}
            showDetailedMetrics={true}
          />
        </TabsContent>

        {/* CI/CD進捗タブ */}
        <TabsContent value="cicd" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 進捗サマリー */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5" />
                  <span>CI/CD進捗サマリー</span>
                </CardTitle>
                <CardDescription>GitHub、Vercel、テストシステムからの自動進捗反映</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const summary = progressService.getProgressSummary();
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {summary.totalCommits}
                          </div>
                          <div className="text-sm text-gray-500">コミット数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {summary.successfulDeployments}
                          </div>
                          <div className="text-sm text-gray-500">成功デプロイ</div>
                        </div>
                      </div>

                      {summary.failedDeployments > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {summary.failedDeployments}件のデプロイが失敗しています
                          </AlertDescription>
                        </Alert>
                      )}

                      {summary.lastTestResults && (
                        <div className="border rounded-lg p-3">
                          <h4 className="font-medium mb-2">最新テスト結果</h4>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-green-600">
                              ✓ {summary.lastTestResults.passed}件成功
                            </div>
                            <div className="text-red-600">
                              ✗ {summary.lastTestResults.failed}件失敗
                            </div>
                            <div className="text-gray-600">
                              カバレッジ: {summary.lastTestResults.coverage}%
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        最終更新: {new Date(summary.latestActivity).toLocaleString()}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* リアルタイム進捗フィード */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>リアルタイム進捗フィード</span>
                </CardTitle>
                <CardDescription>最新の開発・デプロイ・テスト活動</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {realtimeUpdates.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">進捗データがありません</div>
                  ) : (
                    realtimeUpdates.map((update) => (
                      <div key={update.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {update.type === 'commit' && (
                                <GitBranch className="w-4 h-4 text-gray-600" />
                              )}
                              {update.type === 'deployment' && (
                                <Rocket className="w-4 h-4 text-blue-600" />
                              )}
                              {update.type === 'test' && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {update.type === 'build' && (
                                <Package className="w-4 h-4 text-orange-600" />
                              )}

                              <Badge
                                variant={
                                  update.status === 'success'
                                    ? 'default'
                                    : update.status === 'failure'
                                      ? 'destructive'
                                      : update.status === 'in_progress'
                                        ? 'secondary'
                                        : 'outline'
                                }
                              >
                                {update.status}
                              </Badge>
                            </div>

                            <h4 className="font-medium mt-1">{update.title}</h4>
                            <p className="text-sm text-gray-600">{update.description}</p>

                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(update.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 手動進捗追加 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>手動進捗追加</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  progressService.addManualUpdate(
                    'build',
                    '手動ビルド実行',
                    '管理者による手動ビルドを実行しました',
                    'success',
                    { manual: true, timestamp: new Date().toISOString() }
                  );
                  toast.success('手動進捗を追加しました');
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                手動進捗を追加
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteImprovementPlan;
