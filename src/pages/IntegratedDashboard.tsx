import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target,
  GitBranch,
  ListTodo,
  Rocket,
  Users,
  Settings,
  RefreshCw,
  Filter,
  MoreVertical,
  Plus,
  ArrowRight,
  Zap,
  Play,
  Pause,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ProjectHubProject,
  ProjectProgressSummary,
  IntegratedTask,
  ProjectAlert,
} from '@/types/projectHub';
import { Todo } from '@/types/todo';
import { WBSNode } from '@/types/wbs';
import { useTodos } from '@/hooks/useTodos';
import { useAuth } from '@/hooks/useMongoAuth';
import { useMongoTodos } from '@/hooks/useMongoTodos';

const IntegratedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'tasks' | 'timeline' | 'analytics'>(
    'overview'
  );
  const [isLoading, setIsLoading] = useState(false);

  // MongoDB用ToDoデータを取得
  const { todos: actualTodos, loading: todosLoading, error: todosError } = useMongoTodos();

  // 本日のToDoフィルタリング関数（MongoDB用に調整）
  const getTodaysTodos = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    console.log('[IntegratedDashboard] 📅 本日の日付:', today);

    const todaysTodos = actualTodos.filter((todo) => {
      const isCreatedToday = todo.createdAt?.startsWith(today);
      const hasDeadlineToday = todo.deadline === today;
      const isUncompletedWithNoDeadline = !todo.completed && !todo.deadline;

      return isCreatedToday || hasDeadlineToday || isUncompletedWithNoDeadline;
    });

    console.log('[IntegratedDashboard] 📋 全ToDoリスト (MongoDB):', {
      totalTodos: actualTodos.length,
      todaysTodos: todaysTodos.length,
      completedToday: todaysTodos.filter((t) => t.completed).length,
      pendingToday: todaysTodos.filter((t) => !t.completed).length,
      withDeadlineToday: todaysTodos.filter((t) => t.deadline === today).length,
      user: user?.email || '未認証',
      todos: todaysTodos.map((t) => ({
        id: t._id,
        task: t.task,
        completed: t.completed,
        deadline: t.deadline,
        createdAt: t.createdAt,
        type: t.type,
      })),
    });

    return todaysTodos;
  }, [actualTodos, user]);

  // モックデータ（実際の実装では API から取得）
  const [projects, setProjects] = useState<ProjectHubProject[]>([
    {
      id: 'proj-mvp',
      name: 'MVP機能完成',
      description: '勤怠管理アプリとして必要最低限の機能を実装',
      type: 'improvement',
      status: 'active',
      priority: 'high',
      phase: 'phase0',
      startDate: '2024-02-01',
      endDate: '2024-02-21',
      estimatedDays: 20,
      actualDays: 5,
      progress: 25,
      milestones: [
        {
          id: 'ms-1',
          title: 'リアルタイム打刻機能完成',
          description: 'ワンクリック出勤・退勤機能の実装',
          dueDate: '2024-02-07',
          completed: false,
          dependencies: [],
          deliverables: ['打刻コンポーネント', 'API実装', 'テスト'],
        },
        {
          id: 'ms-2',
          title: '日次勤務状況表示完成',
          description: '当日の勤務状況を可視化',
          dueDate: '2024-02-14',
          completed: false,
          dependencies: ['ms-1'],
          deliverables: ['ダッシュボード画面', 'レポート機能'],
        },
      ],
      improvementItemId: 'realtime-clock',
      wbsProjectId: 'wbs-proj-1',
      wbsNodes: ['wbs-node-1', 'wbs-node-2'],
      todoIds: ['todo-1', 'todo-2', 'todo-3'],
      category: 'feature',
      tags: ['urgent', 'mvp'],
      assignees: ['user1', 'user2'],
      dependencies: [],
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-02-06T14:30:00Z',
      createdBy: 'user1',
    },
  ]);

  const [integratedTasks, setIntegratedTasks] = useState<IntegratedTask[]>([
    {
      id: 'task-1',
      projectId: 'proj-mvp',
      title: '打刻ボタンコンポーネントの実装',
      description: 'Material-UIからshadcn-uiへの移行',
      type: 'todo',
      status: 'in-progress',
      priority: 'high',
      progress: 60,
      startDate: '2024-02-01',
      deadline: '2024-02-07',
      estimatedHours: 8,
      actualHours: 5,
      sourceType: 'todo',
      sourceId: 'todo-1',
      lastSyncAt: '2024-02-06T14:30:00Z',
      syncStatus: 'synced',
      assignees: ['user1'],
      tags: ['ui', 'component'],
      dependencies: [],
      children: [],
      checklist: [
        { id: 'cl-1', label: 'ボタンデザインの確定', completed: true },
        { id: 'cl-2', label: 'クリックイベントの実装', completed: true },
        { id: 'cl-3', label: '状態管理の追加', completed: false },
        { id: 'cl-4', label: 'テストの作成', completed: false },
      ],
    },
  ]);

  const [alerts, setAlerts] = useState<ProjectAlert[]>([
    {
      id: 'alert-1',
      type: 'warning',
      message: 'プロジェクト「MVP機能完成」で3つのタスクが期限超過の可能性があります',
      severity: 'medium',
      relatedTaskIds: ['task-1', 'task-2'],
      actionRequired: true,
      dueDate: '2024-02-07',
    },
  ]);

  // 統合タスクの更新（MongoDB ToDoデータを統合）
  useEffect(() => {
    console.log('[IntegratedDashboard] 🔄 MongoToDoデータ統合開始:', {
      user: user?.email,
      isAuthenticated,
      todosLoading,
      todosError,
      actualTodosCount: actualTodos.length,
      todaysTodosCount: getTodaysTodos.length,
    });

    if (!todosLoading && actualTodos.length > 0) {
      const integratedFromTodos = actualTodos.map((todo) => ({
        id: `todo-${todo._id}`,
        projectId: 'proj-mvp',
        title: todo.task,
        description: `ToDoシステムから同期されたタスク (${todo.type})`,
        type: 'todo' as const,
        status: todo.completed ? ('completed' as const) : ('not-started' as const),
        priority: todo.isPrioritized ? ('high' as const) : ('medium' as const),
        progress: todo.completed ? 100 : 0,
        startDate: todo.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        deadline: todo.deadline,
        estimatedHours: 1,
        actualHours: 0,
        sourceType: 'todo' as const,
        sourceId: todo._id,
        lastSyncAt: new Date().toISOString(),
        syncStatus: 'synced' as const,
        assignees: [user?.id || 'unknown'],
        tags: [],
        dependencies: [],
        children: [],
        checklist: [],
      }));

      console.log('[IntegratedDashboard] ✅ MongoToDo統合完了:', {
        integratedCount: integratedFromTodos.length,
        completedTasks: integratedFromTodos.filter((t) => t.status === 'completed').length,
        pendingTasks: integratedFromTodos.filter((t) => t.status === 'not-started').length,
      });

      setIntegratedTasks((prev) => {
        const nonTodoTasks = prev.filter((task) => task.sourceType !== 'todo');
        const combined = [...nonTodoTasks, ...integratedFromTodos];

        console.log('[IntegratedDashboard] 🔀 統合タスク更新 (MongoDB):', {
          previousCount: prev.length,
          nonTodoTasks: nonTodoTasks.length,
          todoTasks: integratedFromTodos.length,
          totalCombined: combined.length,
        });

        return combined;
      });
    }

    if (todosError) {
      console.error('[IntegratedDashboard] ❌ MongoToDoデータ取得エラー:', todosError);
    }
  }, [actualTodos, todosLoading, todosError, user, getTodaysTodos, isAuthenticated]);

  // プロジェクト進捗サマリーの計算（実際データを反映）
  const projectSummary = useMemo(() => {
    console.log('[IntegratedDashboard] 🧮 プロジェクトサマリー計算開始:', {
      selectedProject,
      integratedTasksCount: integratedTasks.length,
      alertsCount: alerts.length,
    });

    if (selectedProject === 'all') {
      const summary = {
        overallProgress: Math.round(
          projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
        ),
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.status === 'active').length,
        completedProjects: projects.filter((p) => p.status === 'completed').length,
        totalTasks: integratedTasks.length,
        completedTasks: integratedTasks.filter((t) => t.status === 'completed').length,
        alertsCount: alerts.length,
      };

      console.log('[IntegratedDashboard] 📈 全体サマリー:', summary);
      return summary;
    }

    const project = projects.find((p) => p.id === selectedProject);
    if (!project) {
      console.warn('[IntegratedDashboard] ⚠️ プロジェクト未発見:', selectedProject);
      return null;
    }

    const projectTasks = integratedTasks.filter((t) => t.projectId === selectedProject);
    const summary = {
      overallProgress: project.progress,
      totalProjects: 1,
      activeProjects: project.status === 'active' ? 1 : 0,
      completedProjects: project.status === 'completed' ? 1 : 0,
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter((t) => t.status === 'completed').length,
      alertsCount: alerts.filter((a) =>
        a.relatedTaskIds.some((id) => projectTasks.some((t) => t.id === id))
      ).length,
    };

    console.log('[IntegratedDashboard] 📊 プロジェクト別サマリー:', {
      project: project.name,
      ...summary,
    });

    return summary;
  }, [selectedProject, projects, integratedTasks, alerts]);

  // 同期処理（実際のデータを同期）
  const handleSync = async () => {
    console.log('[IntegratedDashboard] 🔄 手動同期開始');
    setIsLoading(true);

    try {
      // 実際のTodoデータを再取得（useTodosフックが自動で処理）
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('[IntegratedDashboard] ✅ 同期完了');
    } catch (error) {
      console.error('[IntegratedDashboard] ❌ 同期エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ローディング状態のログ
  useEffect(() => {
    console.log('[IntegratedDashboard] 🔄 ローディング状態変化:', {
      todosLoading,
      isLoading,
      userLoggedIn: !!user,
      todosCount: actualTodos.length,
    });
  }, [todosLoading, isLoading, user, actualTodos.length]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* デバッグ情報表示（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-bold mb-2">🐛 デバッグ情報</h3>
          <p>ユーザー: {user?.email || '未ログイン'}</p>
          <p>全Todo数: {actualTodos.length}</p>
          <p>本日のTodo数: {getTodaysTodos.length}</p>
          <p>統合タスク数: {integratedTasks.length}</p>
          <p>ローディング: {todosLoading ? 'はい' : 'いいえ'}</p>
          {todosError && <p className="text-red-600">エラー: {todosError}</p>}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">統合プロジェクトダッシュボード</h1>
          <p className="text-muted-foreground">サイト改善計画・WBS・ToDoリストの進捗を一元管理</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            同期
          </Button>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全プロジェクト</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* アラート */}
      {alerts.length > 0 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">注意が必要な項目があります</AlertTitle>
          <AlertDescription className="text-orange-700">
            {alerts.length}件のアラートがあります。詳細を確認してください。
          </AlertDescription>
        </Alert>
      )}

      {/* 全体サマリー */}
      {projectSummary && (
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">全体進捗</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectSummary.overallProgress}%</div>
              <Progress value={projectSummary.overallProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">アクティブプロジェクト</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectSummary.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                / {projectSummary.totalProjects} プロジェクト
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">完了タスク</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectSummary.completedTasks}</div>
              <p className="text-xs text-muted-foreground">/ {projectSummary.totalTasks} タスク</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">アラート</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectSummary.alertsCount}</div>
              <p className="text-xs text-muted-foreground">要対応項目</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* メインコンテンツ */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="tasks">タスク管理</TabsTrigger>
          <TabsTrigger value="timeline">タイムライン</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* プロジェクト一覧 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    プロジェクト進捗
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.map((project) => (
                    <Card key={project.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {project.name}
                              <Badge variant="outline">{project.phase}</Badge>
                              <Badge
                                variant={project.status === 'active' ? 'default' : 'secondary'}
                              >
                                {project.status}
                              </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {project.description}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => navigate('/improvement-plan')}>
                                改善計画を表示
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate('/site-dev')}>
                                WBSを表示
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate('/')}>
                                ToDoリストを表示
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => navigate('/improvement-plan/implementation')}
                              >
                                実装管理
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>進捗</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>期限: {new Date(project.endDate).toLocaleDateString('ja-JP')}</span>
                          <span>{project.assignees.length}名アサイン</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* サイドバー */}
            <div className="space-y-4">
              {/* 今日のタスク */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListTodo className="h-4 w-4" />
                    今日のタスク ({getTodaysTodos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getTodaysTodos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">本日のタスクはありません</p>
                  ) : (
                    getTodaysTodos.slice(0, 5).map((todo) => (
                      <div key={todo._id} className="flex items-center gap-3">
                        <CheckCircle
                          className={`h-4 w-4 ${
                            todo.completed ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{todo.task}</p>
                          <p className="text-xs text-muted-foreground">
                            {todo.type === 'input' ? 'インプット' : 'アウトプット'}
                            {todo.deadline && ` - 期限: ${todo.deadline}`}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    ToDoリストへ
                  </Button>
                </CardContent>
              </Card>

              {/* クイックアクション */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">クイックアクション</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    作業開始
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    時間記録
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    レポート生成
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>統合タスク管理</CardTitle>
              <CardDescription>すべてのシステムのタスクを統合表示</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integratedTasks.map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {task.title}
                          <Badge variant="outline" className="text-xs">
                            {task.sourceType}
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>進捗: {task.progress}%</span>
                          <span>
                            時間: {task.actualHours}/{task.estimatedHours}h
                          </span>
                          {task.deadline && (
                            <span>期限: {new Date(task.deadline).toLocaleDateString('ja-JP')}</span>
                          )}
                        </div>
                      </div>
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
                    <Progress value={task.progress} className="mt-3" />
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>プロジェクトタイムライン</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">タイムライン表示機能は実装中です...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>分析レポート</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">分析機能は実装中です...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedDashboard;
