import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  GitCommit,
  GitPullRequest,
  Zap,
  Target,
  Calendar,
  Users,
  BarChart3,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  Square,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

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
  commits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
  }>;
  pullRequests: Array<{
    number: number;
    title: string;
    state: 'open' | 'closed' | 'merged';
    author: string;
    createdAt: string;
    mergedAt?: string;
  }>;
  metrics: {
    codeQuality: number;
    testCoverage: number;
    performance: number;
    security: number;
    accessibility: number;
  };
  lastUpdated: string;
  metadata: {
    source: 'manual' | 'github' | 'ci' | 'auto';
    reason: string;
    confidence: number;
  };
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
  metrics: {
    velocity: number;
    burndownRate: number;
    qualityScore: number;
    teamEfficiency: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  timeline: Array<{
    date: string;
    event: string;
    description: string;
    type: 'milestone' | 'task' | 'phase' | 'release';
    metadata: Record<string, any>;
  }>;
  lastUpdated: string;
}

interface ActivityItem {
  type: 'commit' | 'pullrequest' | 'task_completed';
  date: string;
  description: string;
  taskTitle: string;
  taskId: string;
  icon: any;
  color: 'blue' | 'green' | 'orange' | 'gray';
}

interface LiveImprovementPlanTrackerProps {
  refreshInterval?: number; // ミリ秒
  enableAutoSync?: boolean;
  showDetailedMetrics?: boolean;
}

const LiveImprovementPlanTracker: React.FC<LiveImprovementPlanTrackerProps> = ({
  refreshInterval = 30000, // 30秒
  enableAutoSync = true,
  showDetailedMetrics = true,
}) => {
  const { user } = useAuth();

  // State管理
  const [projects, setProjects] = useState<ProjectProgress[]>([]);
  const [tasks, setTasks] = useState<TaskProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(enableAutoSync);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // リアルタイム進捗取得
  const fetchProgressData = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      setError(null);

      console.log('🔄 Fetching live progress data...');

      // プロジェクトとタスクを並行取得
      const [projectsResponse, tasksResponse] = await Promise.all([
        fetch('/api/progress/tracking?type=projects', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
        fetch('/api/progress/tracking?type=tasks', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
      ]);

      if (!projectsResponse.ok || !tasksResponse.ok) {
        throw new Error('Failed to fetch progress data');
      }

      const projectsData = await projectsResponse.json();
      const tasksData = await tasksResponse.json();

      if (projectsData.success && tasksData.success) {
        setProjects(projectsData.data);
        setTasks(tasksData.data);
        setLastRefresh(new Date());
        setSyncStatus('idle');

        console.log('✅ Progress data updated:', {
          projects: projectsData.data.length,
          tasks: tasksData.data.length,
        });
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch progress data:', error);
      setError(error.message);
      setSyncStatus('error');
      toast.error('進捗データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // GitHub同期
  const triggerGitHubSync = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      console.log('🔄 Triggering GitHub sync...');

      const response = await fetch('/api/progress/tracking?type=sync', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('GitHub sync failed');
      }

      const result = await response.json();

      if (result.success) {
        toast.success(`GitHub同期完了: ${result.data.syncedTasks}件のタスクを更新`);

        // 同期後にデータを再取得
        await fetchProgressData();
      } else {
        throw new Error(result.message || 'GitHub sync failed');
      }
    } catch (error: any) {
      console.error('❌ GitHub sync failed:', error);
      setError(error.message);
      setSyncStatus('error');
      toast.error('GitHub同期に失敗しました');
    }
  }, [fetchProgressData]);

  // 自動リフレッシュ設定
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchProgressData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchProgressData, refreshInterval, isAutoRefreshEnabled]);

  // 初期データ取得
  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  // 計算された値
  const overallMetrics = useMemo(() => {
    if (projects.length === 0) return null;

    const totalProgress = projects.reduce((sum, project) => sum + project.overallProgress, 0);
    const averageProgress = Math.round(totalProgress / projects.length);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
    const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;

    const averageQuality =
      tasks.length > 0
        ? Math.round(tasks.reduce((sum, task) => sum + task.metrics.codeQuality, 0) / tasks.length)
        : 0;

    const recentActivity = tasks.filter((task) => {
      const lastUpdated = new Date(task.lastUpdated);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastUpdated > oneDayAgo;
    }).length;

    return {
      averageProgress,
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      averageQuality,
      recentActivity,
    };
  }, [projects, tasks]);

  // フェーズ別進捗
  const phaseProgress = useMemo(() => {
    const phases = new Map<string, { total: number; completed: number; inProgress: number }>();

    tasks.forEach((task) => {
      if (!phases.has(task.phase)) {
        phases.set(task.phase, { total: 0, completed: 0, inProgress: 0 });
      }

      const phaseData = phases.get(task.phase)!;
      phaseData.total++;

      if (task.status === 'completed') {
        phaseData.completed++;
      } else if (task.status === 'in-progress') {
        phaseData.inProgress++;
      }
    });

    return Array.from(phases.entries()).map(([phase, data]) => ({
      phase,
      progress: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      total: data.total,
      completed: data.completed,
      inProgress: data.inProgress,
    }));
  }, [tasks]);

  // 最近のアクティビティ
  const recentActivity = useMemo(() => {
    const activities: ActivityItem[] = [];

    // コミット活動
    tasks.forEach((task) => {
      task.commits.forEach((commit) => {
        activities.push({
          type: 'commit',
          date: commit.date,
          description: `${commit.author}: ${commit.message}`,
          taskTitle: task.title,
          taskId: task.id,
          icon: GitCommit,
          color: 'blue',
        });
      });
    });

    // プルリクエスト活動
    tasks.forEach((task) => {
      task.pullRequests.forEach((pr) => {
        activities.push({
          type: 'pullrequest',
          date: pr.mergedAt || pr.createdAt,
          description: `PR #${pr.number}: ${pr.title}`,
          taskTitle: task.title,
          taskId: task.id,
          icon: GitPullRequest,
          color: pr.state === 'merged' ? 'green' : 'orange',
        });
      });
    });

    // タスク完了
    tasks
      .filter((task) => task.completedDate)
      .forEach((task) => {
        activities.push({
          type: 'task_completed',
          date: task.completedDate!,
          description: `タスク完了: ${task.title}`,
          taskTitle: task.title,
          taskId: task.id,
          icon: CheckCircle,
          color: 'green',
        });
      });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // 最新10件
  }, [tasks]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 animate-spin" />
            進捗データ読み込み中...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                リアルタイム進捗追跡
              </CardTitle>
              <CardDescription>
                最終更新: {lastRefresh.toLocaleString()}
                {syncStatus === 'syncing' && (
                  <span className="ml-2 text-blue-600 flex items-center">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    同期中...
                  </span>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
                className={isAutoRefreshEnabled ? 'text-green-600' : 'text-gray-600'}
              >
                {isAutoRefreshEnabled ? (
                  <PauseCircle className="w-4 h-4 mr-1" />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-1" />
                )}
                自動更新
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchProgressData}
                disabled={syncStatus === 'syncing'}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
                />
                更新
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={triggerGitHubSync}
                disabled={syncStatus === 'syncing'}
              >
                <Zap className="w-4 h-4 mr-1" />
                GitHub同期
              </Button>
            </div>
          </div>
        </CardHeader>

        {error && (
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center text-red-700">
                <AlertCircle className="w-4 h-4 mr-2" />
                エラー: {error}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 全体メトリクス */}
      {overallMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">全体進捗</p>
                  <p className="text-2xl font-bold">{overallMetrics.averageProgress}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={overallMetrics.averageProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">完了率</p>
                  <p className="text-2xl font-bold">{overallMetrics.completionRate}%</p>
                  <p className="text-xs text-gray-500">
                    {overallMetrics.completedTasks}/{overallMetrics.totalTasks} タスク
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">品質スコア</p>
                  <p className="text-2xl font-bold">{overallMetrics.averageQuality}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">24時間活動</p>
                  <p className="text-2xl font-bold">{overallMetrics.recentActivity}</p>
                  <p className="text-xs text-gray-500">アクティビティ</p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* フェーズ別進捗 */}
      <Card>
        <CardHeader>
          <CardTitle>フェーズ別進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phaseProgress.map((phase) => (
              <div key={phase.phase} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{phase.phase}</h3>
                    <Badge variant={phase.progress === 100 ? 'default' : 'secondary'}>
                      {phase.progress}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {phase.completed}/{phase.total} 完了
                    {phase.inProgress > 0 && (
                      <span className="ml-2 text-blue-600">({phase.inProgress} 進行中)</span>
                    )}
                  </div>
                </div>
                <Progress value={phase.progress} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* プロジェクト進捗 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>プロジェクト進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{project.name}</h3>
                    <Badge
                      variant={
                        project.overallProgress === 100
                          ? 'default'
                          : project.overallProgress > 50
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {project.overallProgress}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>

                  <Progress value={project.overallProgress} className="mb-2" />

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">完了</p>
                      <p className="font-medium text-green-600">{project.completedTasks}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">進行中</p>
                      <p className="font-medium text-blue-600">{project.inProgressTasks}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">ブロック</p>
                      <p className="font-medium text-red-600">{project.blockedTasks}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 最近のアクティビティ */}
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`p-1 rounded-full ${
                        activity.color === 'green'
                          ? 'bg-green-100 text-green-600'
                          : activity.color === 'blue'
                            ? 'bg-blue-100 text-blue-600'
                            : activity.color === 'orange'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}

              {recentActivity.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  最近のアクティビティはありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveImprovementPlanTracker;
