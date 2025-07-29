import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Code,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Bug,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Database,
  Globe,
  Shield,
  TestTube,
  Package,
  Terminal,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Play,
  Settings,
  FileText,
  Download,
  Target,
  Calendar,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DeveloperMetrics {
  development: {
    openPRs: number;
    mergedToday: number;
    codeReviews: number;
    deployments: number;
  };
  quality: {
    testCoverage: number;
    codeQuality: number;
    bugs: number;
    technicalDebt: number;
  };
  performance: {
    buildTime: number;
    deployTime: number;
    apiLatency: number;
    errorRate: number;
  };
  velocity: {
    sprintProgress: number;
    storiesCompleted: number;
    velocityTrend: number;
    blockers: number;
  };
}

interface Task {
  id: string;
  title: string;
  type: 'feature' | 'bug' | 'hotfix' | 'improvement';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  assignee: string;
  estimate: string;
  deadline: string;
  branch?: string;
  prNumber?: number;
}

const DeveloperDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DeveloperMetrics | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // メトリクス取得
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/developer/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setTasks(data.tasks);
      } else {
        // フォールバック: デモデータ
        setMetrics({
          development: {
            openPRs: 7,
            mergedToday: 3,
            codeReviews: 5,
            deployments: 2,
          },
          quality: {
            testCoverage: 84,
            codeQuality: 91,
            bugs: 12,
            technicalDebt: 23,
          },
          performance: {
            buildTime: 320,
            deployTime: 145,
            apiLatency: 180,
            errorRate: 0.12,
          },
          velocity: {
            sprintProgress: 78,
            storiesCompleted: 12,
            velocityTrend: 5,
            blockers: 2,
          },
        });

        setTasks([
          {
            id: 'task-1',
            title: 'ユーザー認証システムの改善',
            type: 'feature',
            priority: 'high',
            status: 'in-progress',
            assignee: '開発者A',
            estimate: '5pt',
            deadline: '2025-02-01',
            branch: 'feature/auth-improvement',
            prNumber: 123,
          },
          {
            id: 'task-2',
            title: 'データベース接続エラーの修正',
            type: 'bug',
            priority: 'critical',
            status: 'todo',
            assignee: '開発者B',
            estimate: '3pt',
            deadline: '2025-01-30',
          },
          {
            id: 'task-3',
            title: 'パフォーマンス最適化',
            type: 'improvement',
            priority: 'medium',
            status: 'in-review',
            assignee: '開発者C',
            estimate: '8pt',
            deadline: '2025-02-05',
            branch: 'improvement/performance-opt',
            prNumber: 124,
          },
        ]);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch developer metrics:', error);
      toast.error('メトリクスの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // タスクステータス更新
  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/developer/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? { ...task, status: status as any } : task))
        );
        toast.success('タスクステータスを更新しました');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('タスクの更新に失敗しました');
    }
  };

  // デプロイ実行
  const triggerDeploy = async (environment: string) => {
    try {
      const response = await fetch('/api/developer/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ environment }),
      });

      if (response.ok) {
        toast.success(`${environment}環境へのデプロイを開始しました`);
      }
    } catch (error) {
      console.error('Failed to trigger deploy:', error);
      toast.error('デプロイの開始に失敗しました');
    }
  };

  useEffect(() => {
    fetchMetrics();

    // 15秒ごとに自動更新
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">開発ダッシュボード</h1>
          <p className="text-gray-600">
            最終更新: {lastUpdate.toLocaleString()} | 自動更新: 15秒間隔
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <Button variant="outline" size="sm" onClick={() => triggerDeploy('staging')}>
            <Play className="w-4 h-4 mr-1" />
            Staging Deploy
          </Button>
          <Button variant="default" size="sm" onClick={() => triggerDeploy('production')}>
            <Zap className="w-4 h-4 mr-1" />
            本番Deploy
          </Button>
        </div>
      </div>

      {/* 緊急アラート */}
      {metrics && metrics.quality.bugs > 10 && (
        <Alert className="border-red-500 bg-red-50">
          <Bug className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">バグ件数が高い状態です</AlertTitle>
          <AlertDescription className="text-red-700">
            現在{metrics.quality.bugs}件のバグが報告されています。優先的に対応してください。
          </AlertDescription>
        </Alert>
      )}

      {/* メトリクス概要 */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">オープンPR</p>
                  <p className="text-2xl font-bold">{metrics.development.openPRs}</p>
                  <p className="text-xs text-green-600">
                    今日: {metrics.development.mergedToday} マージ
                  </p>
                </div>
                <GitPullRequest className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                レビュー待ち: {metrics.development.codeReviews}件
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">テストカバレッジ</p>
                  <p className="text-2xl font-bold">{metrics.quality.testCoverage}%</p>
                  <p className="text-xs text-blue-600">
                    コード品質: {metrics.quality.codeQuality}%
                  </p>
                </div>
                <TestTube className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={metrics.quality.testCoverage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ビルド時間</p>
                  <p className="text-2xl font-bold">{metrics.performance.buildTime}s</p>
                  <p className="text-xs text-orange-600">
                    デプロイ: {metrics.performance.deployTime}s
                  </p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                API遅延: {metrics.performance.apiLatency}ms
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">スプリント進捗</p>
                  <p className="text-2xl font-bold">{metrics.velocity.sprintProgress}%</p>
                  <p className="text-xs text-green-600">
                    完了: {metrics.velocity.storiesCompleted}件
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={metrics.velocity.sprintProgress} className="mt-2" />
              <div className="mt-1 text-xs text-gray-600">
                ブロッカー: {metrics.velocity.blockers}件
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* タブコンテンツ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="tasks">タスク管理</TabsTrigger>
          <TabsTrigger value="quality">品質管理</TabsTrigger>
          <TabsTrigger value="deployment">デプロイ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 今日のアクション */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  今日のアクション
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-red-800">データベース接続エラー修正</p>
                      <p className="text-sm text-red-600">クリティカル - 今日中に対応</p>
                    </div>
                    <Badge variant="destructive">緊急</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                    <div>
                      <p className="font-medium text-orange-800">PR #123のレビュー対応</p>
                      <p className="text-sm text-orange-600">コメント修正が必要</p>
                    </div>
                    <Badge variant="secondary">高</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div>
                      <p className="font-medium text-yellow-800">技術的負債の整理</p>
                      <p className="text-sm text-yellow-600">リファクタリング実施</p>
                    </div>
                    <Badge variant="outline">中</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* リポジトリ状況 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitBranch className="w-5 h-5 mr-2" />
                  リポジトリ状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">main ブランチ</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">安定</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">develop ブランチ</span>
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-sm text-orange-600">テスト中</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CI/CD パイプライン</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">テスト実行</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">成功 (247/250)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>開発タスク一覧</CardTitle>
              <CardDescription>現在のスプリント中のタスク</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{task.title}</h3>
                            <Badge
                              variant={
                                task.type === 'bug'
                                  ? 'destructive'
                                  : task.type === 'feature'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {task.type}
                            </Badge>
                            <Badge
                              variant={
                                task.priority === 'critical'
                                  ? 'destructive'
                                  : task.priority === 'high'
                                    ? 'default'
                                    : 'outline'
                              }
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <span>担当: {task.assignee}</span>
                            <span>見積: {task.estimate}</span>
                            <span>期限: {task.deadline}</span>
                          </div>
                          {task.branch && (
                            <div className="text-sm text-blue-600">
                              <GitBranch className="w-3 h-3 inline mr-1" />
                              {task.branch}
                              {task.prNumber && (
                                <span className="ml-2">
                                  <GitPullRequest className="w-3 h-3 inline mr-1" />
                                  PR #{task.prNumber}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Badge
                            variant={
                              task.status === 'done'
                                ? 'default'
                                : task.status === 'in-progress'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {task.status}
                          </Badge>
                          {task.status !== 'done' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const nextStatus =
                                  task.status === 'todo'
                                    ? 'in-progress'
                                    : task.status === 'in-progress'
                                      ? 'in-review'
                                      : 'done';
                                updateTaskStatus(task.id, nextStatus);
                              }}
                            >
                              次へ
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>品質メトリクス</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">テストカバレッジ</span>
                        <span className="text-sm">{metrics.quality.testCoverage}%</span>
                      </div>
                      <Progress value={metrics.quality.testCoverage} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">コード品質</span>
                        <span className="text-sm">{metrics.quality.codeQuality}%</span>
                      </div>
                      <Progress value={metrics.quality.codeQuality} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">オープンバグ</span>
                      <span
                        className={`text-sm ${metrics.quality.bugs > 10 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {metrics.quality.bugs}件
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">技術的負債</span>
                      <span className="text-sm text-orange-600">
                        {metrics.quality.technicalDebt}時間
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>パフォーマンス</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ビルド時間</span>
                      <span className="text-sm">{metrics.performance.buildTime}秒</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">デプロイ時間</span>
                      <span className="text-sm">{metrics.performance.deployTime}秒</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">API遅延</span>
                      <span className="text-sm">{metrics.performance.apiLatency}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">エラー率</span>
                      <span
                        className={`text-sm ${metrics.performance.errorRate > 0.5 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {metrics.performance.errorRate}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>デプロイ管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Staging環境</p>
                      <p className="text-sm text-gray-600">最新のdevelopブランチ</p>
                      <p className="text-xs text-gray-500">最終デプロイ: 2時間前</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => triggerDeploy('staging')}>
                      デプロイ
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">本番環境</p>
                      <p className="text-sm text-gray-600">mainブランチ v1.2.3</p>
                      <p className="text-xs text-gray-500">最終デプロイ: 1日前</p>
                    </div>
                    <Button size="sm" onClick={() => triggerDeploy('production')}>
                      本番デプロイ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>デプロイ履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">v1.2.3 → 本番</p>
                      <p className="text-gray-600">1日前</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">develop → Staging</p>
                      <p className="text-gray-600">2時間前</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">v1.2.2 → 本番</p>
                      <p className="text-gray-600">3日前</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperDashboard;
