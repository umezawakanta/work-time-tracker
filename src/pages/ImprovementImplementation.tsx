import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  GitBranch,
  Github,
  MessageSquare,
  FileText,
  Users,
  Calendar,
  TrendingUp,
  Zap,
  Plus,
  ExternalLink,
  Download,
  Upload,
  Code,
  RefreshCw,
  Sparkles,
  Brain,
  CheckSquare,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Task, SuggestedTask, TeamMember } from '@/types/implementation';
import { useImplementation } from '@/hooks/useImplementation';

const ImprovementImplementation: React.FC = () => {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState('phase1');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newNote, setNewNote] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showAISuggestionsDialog, setShowAISuggestionsDialog] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    estimatedHours: 8,
    assignee: '',
  });

  // プロジェクトIDを設定（実際の実装では動的に取得）
  const currentProjectId = 'site-improvement-2024';

  // カスタムフックを使用
  const {
    tasks,
    logs: implementationLogs,
    currentProject,
    isLoading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    updateChecklist,
    refreshData,
  } = useImplementation(currentProjectId);

  // チームメンバー（実際の実装では、プロジェクトから取得またはユーザー管理から取得）
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'user1',
      name: '田中 太郎',
      email: 'tanaka@example.com',
      avatar: '',
      role: 'フロントエンド',
      skills: ['React', 'TypeScript', 'UI/UX'],
      availability: 'available',
      workload: 70,
    },
    {
      id: 'user2',
      name: '佐藤 花子',
      email: 'sato@example.com',
      avatar: '',
      role: 'バックエンド',
      skills: ['Node.js', 'Firebase', 'API'],
      availability: 'busy',
      workload: 90,
    },
    {
      id: 'user3',
      name: '鈴木 一郎',
      email: 'suzuki@example.com',
      avatar: '',
      role: 'フルスタック',
      skills: ['React', 'Node.js', 'DevOps'],
      availability: 'available',
      workload: 50,
    },
  ]);

  // 実装リソース
  const resources = [
    {
      title: 'shadcn-ui ドキュメント',
      url: 'https://ui.shadcn.com/',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: 'Next.js 15 移行ガイド',
      url: 'https://nextjs.org/docs/app/building-your-application/upgrading',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: '社内コーディング規約',
      url: '#',
      icon: <Code className="h-4 w-4" />,
    },
    {
      title: 'モノレポ構築ガイド',
      url: '#',
      icon: <GitBranch className="h-4 w-4" />,
    },
  ];

  // 初期化
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // フェーズごとの進捗計算
  const calculatePhaseProgress = (phase: string) => {
    const phaseTasks = tasks.filter((t) => t.phase === phase);
    if (phaseTasks.length === 0) return 0;

    const completedTasks = phaseTasks.filter((t) => t.status === 'completed').length;
    return Math.round((completedTasks / phaseTasks.length) * 100);
  };

  // タスクの進捗計算
  const calculateTaskProgress = (task: Task) => {
    if (task.checklist.length === 0) return 0;
    const completed = task.checklist.filter((item) => item.completed).length;
    return Math.round((completed / task.checklist.length) * 100);
  };

  // チェックリストの更新
  const handleUpdateChecklist = async (taskId: string, checklistId: string, completed: boolean) => {
    const success = await updateChecklist(taskId, checklistId, completed);
    if (success) {
      // UIは自動的に更新される（リアルタイム監視により）
    }
  };

  // タスクステータスの更新
  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    const success = await updateTaskStatus(taskId, status);
    if (success) {
      // UIは自動的に更新される
    }
  };

  // ノートの追加
  const addNote = async () => {
    if (!newNote.trim()) return;

    // 実装ログとしてメモを追加
    try {
      // implementationServiceのaddLogを直接呼び出す
      await import('@/services/implementationService').then(({ implementationService }) => {
        return implementationService.addLog({
          action: 'note_added',
          details: newNote,
          projectId: currentProjectId,
          userId: 'current-user', // 実際の実装では認証情報から取得
          user: 'Current User',
        });
      });

      setNewNote('');
      toast.success('メモを追加しました');
      refreshData();
    } catch (error) {
      toast.error('メモの追加に失敗しました');
    }
  };

  // GitHubブランチの作成（実装予定）
  const createBranch = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      // GitHub Service を使用してブランチを作成
      // const branchName = `feature/${task.id}`;
      // const result = await githubService.createBranch(branchName);

      // モックとして更新
      await updateTask(taskId, {
        branch: `feature/${task.id}`,
        notes: task.notes + '\nGitHubブランチを作成しました',
      });

      toast.success('GitHubブランチを作成しました');
    } catch (error) {
      toast.error('ブランチの作成に失敗しました');
    }
  };

  // プルリクエストの作成（実装予定）
  const createPR = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      // GitHub Service を使用してPRを作成
      const prUrl = `https://github.com/example/repo/pull/${Math.floor(Math.random() * 1000)}`;

      await updateTask(taskId, {
        pr: prUrl,
        notes: task.notes + '\nプルリクエストを作成しました',
      });

      toast.success('プルリクエストを作成しました');
    } catch (error) {
      toast.error('プルリクエストの作成に失敗しました');
    }
  };

  // AI分析とタスク提案のロジック
  const analyzeTasks = async () => {
    setIsAnalyzing(true);

    try {
      // 実際の実装では、AI分析サービスを使用
      // const result = await aiImplementationService.analyzeTasks(tasks, 'UIライブラリ統一プロジェクト');

      // モックデータを使用
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const suggestions: SuggestedTask[] = [
        {
          id: 'sg-1',
          title: 'UIコンポーネントのテスト戦略策定',
          description: '新しいUIライブラリに移行後のテスト方針とテストケースの整備',
          reason: '既存タスクにテスト関連の詳細が不足しています。品質保証のために必要です。',
          estimatedHours: 12,
          priority: 'high',
          dependencies: ['ui-audit', 'button-migration'],
          checklist: [
            'ユニットテストフレームワークの選定',
            'コンポーネントテストのベストプラクティス文書化',
            'スナップショットテストの導入検討',
            'E2Eテストの影響範囲確認',
          ],
          phase: activePhase,
          tags: ['testing', 'quality'],
          confidence: 0.9,
          source: 'ai_analysis',
        },
        {
          id: 'sg-2',
          title: 'デザインシステムドキュメントの更新',
          description: 'shadcn-ui移行に伴うデザインシステムドキュメントの更新',
          reason: 'UIライブラリの変更により、デザインガイドラインの更新が必要です。',
          estimatedHours: 8,
          priority: 'medium',
          dependencies: [],
          checklist: [
            'コンポーネントカタログの更新',
            'デザイントークンの整理',
            'Storybookの設定更新',
            '開発者向けガイドの作成',
          ],
          phase: activePhase,
          tags: ['documentation', 'design'],
          confidence: 0.8,
          source: 'ai_analysis',
        },
        {
          id: 'sg-3',
          title: 'パフォーマンス計測基準の設定',
          description: 'UIライブラリ移行前後のパフォーマンス比較のための計測環境構築',
          reason: '移行の効果を定量的に測定するために必要です。',
          estimatedHours: 6,
          priority: 'medium',
          dependencies: ['ui-audit'],
          checklist: [
            'Lighthouse CI の設定',
            '主要ページのベンチマーク取得',
            'バンドルサイズの計測',
            'ランタイムパフォーマンスの測定',
          ],
          phase: activePhase,
          tags: ['performance', 'metrics'],
          confidence: 0.7,
          source: 'ai_analysis',
        },
        {
          id: 'sg-4',
          title: '段階的移行のためのラッパーコンポーネント作成',
          description: '既存コンポーネントから新UIライブラリへの段階的移行を支援するラッパー',
          reason: '大規模な移行をリスクを抑えて実施するために推奨されます。',
          estimatedHours: 16,
          priority: 'high',
          dependencies: [],
          checklist: [
            'ラッパーコンポーネントの設計',
            'APIの互換性マッピング',
            '移行ヘルパー関数の実装',
            '段階的廃止計画の策定',
          ],
          phase: activePhase,
          tags: ['migration', 'components'],
          confidence: 0.85,
          source: 'ai_analysis',
        },
      ];

      setSuggestedTasks(suggestions);
      setShowAISuggestionsDialog(true);

      // ログに記録
      await import('@/services/implementationService').then(({ implementationService }) => {
        return implementationService.addLog({
          action: 'ai_analysis',
          details: `AIがタスクを分析し、${suggestions.length}件の追加タスクを提案しました`,
          projectId: currentProjectId,
          userId: 'current-user',
          user: 'Current User',
        });
      });
    } catch (error) {
      toast.error('AI分析でエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 選択された提案タスクを追加
  const addSuggestedTasks = async () => {
    const tasksToAdd = suggestedTasks.filter((st) => selectedSuggestions.includes(st.id));

    try {
      for (const suggestionTask of tasksToAdd) {
        const taskData = {
          title: suggestionTask.title,
          description: suggestionTask.description,
          phase: suggestionTask.phase,
          status: 'not-started' as const,
          estimatedHours: suggestionTask.estimatedHours,
          actualHours: 0,
          projectId: currentProjectId,
          checklist: suggestionTask.checklist.map((item, index) => ({
            id: `cl-${Date.now()}-${index}`,
            label: item,
            completed: false,
            createdAt: new Date().toISOString(),
          })),
          priority: suggestionTask.priority as Task['priority'],
          tags: suggestionTask.tags,
          dependencies: suggestionTask.dependencies,
          notes: `AI提案: ${suggestionTask.reason}`,
        };

        await createTask(taskData);
      }

      toast.success(`${tasksToAdd.length}件のタスクを追加しました`);
      setShowAISuggestionsDialog(false);
      setSelectedSuggestions([]);
      setSuggestedTasks([]);
    } catch (error) {
      toast.error('タスクの追加でエラーが発生しました');
    }
  };

  // 新しいタスクの作成
  const handleCreateTask = async () => {
    if (!newTaskData.title.trim()) {
      toast.error('タスク名を入力してください');
      return;
    }

    const taskData = {
      title: newTaskData.title,
      description: newTaskData.description,
      phase: activePhase,
      status: 'not-started' as const,
      estimatedHours: newTaskData.estimatedHours,
      actualHours: 0,
      projectId: currentProjectId,
      checklist: [],
      priority: 'medium' as const,
      tags: [activePhase],
      dependencies: [],
      notes: '',
      assignee: newTaskData.assignee || undefined,
    };

    const success = await createTask(taskData);
    if (success) {
      setShowTaskDialog(false);
      setNewTaskData({
        title: '',
        description: '',
        estimatedHours: 8,
        assignee: '',
      });
    }
  };

  // 提案の選択/解除
  const toggleSuggestionSelection = (suggestionId: string) => {
    setSelectedSuggestions((prev) =>
      prev.includes(suggestionId)
        ? prev.filter((id) => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/improvement-plan/detail')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            詳細に戻る
          </Button>
          <h1 className="text-3xl font-bold mb-2">実装管理ダッシュボード</h1>
          <p className="text-muted-foreground">サイト改善計画の実装進捗を管理</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            全体進捗:{' '}
            {Math.round(
              (tasks.filter((t) => t.status === 'completed').length / Math.max(tasks.length, 1)) *
                100
            )}
            %
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            レポート出力
          </Button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">エラー</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* フェーズ選択タブ */}
      <Tabs value={activePhase} onValueChange={setActivePhase} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phase1" className="relative">
            Phase 1
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 justify-center text-xs">
              {calculatePhaseProgress('phase1')}%
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="phase2" disabled>
            Phase 2
            <Badge variant="outline" className="ml-2 h-5 w-5 p-0 justify-center text-xs">
              {calculatePhaseProgress('phase2')}%
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="phase3" disabled>
            Phase 3
            <Badge variant="outline" className="ml-2 h-5 w-5 p-0 justify-center text-xs">
              {calculatePhaseProgress('phase3')}%
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phase1" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* タスク一覧 */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Phase 1: UIライブラリの統一</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={analyzeTasks}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            分析中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI提案
                          </>
                        )}
                      </Button>
                      <Button size="sm" onClick={() => setShowTaskDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        タスク追加
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>Material-UI、Radix UI、shadcn-uiの統合作業</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">タスクを読み込み中...</p>
                    </div>
                  ) : tasks.filter((task) => task.phase === activePhase).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        このフェーズにはまだタスクがありません
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTaskDialog(true)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        最初のタスクを追加
                      </Button>
                    </div>
                  ) : (
                    tasks
                      .filter((task) => task.phase === activePhase)
                      .map((task) => (
                        <Card
                          key={task.id}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedTask?.id === task.id ? 'border-primary' : ''
                          }`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-semibold flex items-center gap-2">
                                  {task.status === 'completed' && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  {task.status === 'in-progress' && (
                                    <Clock className="h-4 w-4 text-blue-500" />
                                  )}
                                  {task.status === 'blocked' && (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  {task.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={task.status}
                                  onValueChange={(value) =>
                                    handleUpdateTaskStatus(task.id, value as Task['status'])
                                  }
                                >
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not-started">未着手</SelectItem>
                                    <SelectItem value="in-progress">進行中</SelectItem>
                                    <SelectItem value="completed">完了</SelectItem>
                                    <SelectItem value="blocked">ブロック</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                {task.assignee && (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback>
                                        {teamMembers
                                          .find((m) => m.id === task.assignee)
                                          ?.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-muted-foreground">
                                      {teamMembers.find((m) => m.id === task.assignee)?.name}
                                    </span>
                                  </div>
                                )}
                                <span className="text-muted-foreground">
                                  {task.actualHours}/{task.estimatedHours}h
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {task.branch && (
                                  <Badge variant="outline" className="text-xs">
                                    <GitBranch className="h-3 w-3 mr-1" />
                                    {task.branch}
                                  </Badge>
                                )}
                                {task.pr && (
                                  <Badge variant="outline" className="text-xs">
                                    <Github className="h-3 w-3 mr-1" />
                                    PR
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span>進捗</span>
                                <span>{calculateTaskProgress(task)}%</span>
                              </div>
                              <Progress value={calculateTaskProgress(task)} className="h-2" />
                            </div>
                          </div>
                        </Card>
                      ))
                  )}
                </CardContent>
              </Card>

              {/* 選択されたタスクの詳細 */}
              {selectedTask && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">タスク詳細</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">チェックリスト</h4>
                      {selectedTask.checklist.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          チェックリスト項目がありません
                        </p>
                      ) : (
                        selectedTask.checklist.map((item) => (
                          <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={(checked) =>
                                handleUpdateChecklist(selectedTask.id, item.id, checked as boolean)
                              }
                            />
                            <span
                              className={item.completed ? 'line-through text-muted-foreground' : ''}
                            >
                              {item.label}
                            </span>
                          </label>
                        ))
                      )}
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      {!selectedTask.branch && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => createBranch(selectedTask.id)}
                        >
                          <GitBranch className="h-4 w-4 mr-2" />
                          ブランチ作成
                        </Button>
                      )}
                      {selectedTask.branch && !selectedTask.pr && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => createPR(selectedTask.id)}
                        >
                          <Github className="h-4 w-4 mr-2" />
                          PR作成
                        </Button>
                      )}
                      {selectedTask.pr && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={selectedTask.pr} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            PRを開く
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* サイドバー */}
            <div className="space-y-4">
              {/* チームメンバー */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    チームメンバー
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              member.availability === 'available'
                                ? 'text-green-700 border-green-200'
                                : member.availability === 'busy'
                                  ? 'text-red-700 border-red-200'
                                  : 'text-gray-700 border-gray-200'
                            }`}
                          >
                            {member.availability === 'available' && '空き'}
                            {member.availability === 'busy' && '多忙'}
                            {member.availability === 'unavailable' && '不在'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            負荷: {member.workload}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* リソース */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    実装リソース
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                    >
                      {resource.icon}
                      <span>{resource.title}</span>
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  ))}
                </CardContent>
              </Card>

              {/* メモ追加 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    実装メモ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="実装に関するメモを追加..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button
                      size="sm"
                      onClick={addNote}
                      className="w-full"
                      disabled={!newNote.trim()}
                    >
                      メモを追加
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 実装ログ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                実装ログ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {implementationLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    まだログがありません
                  </p>
                ) : (
                  implementationLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 text-sm">
                      <span className="text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('ja-JP', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="flex-1">
                        <span className="font-medium">{log.user}</span>
                        <span className="text-muted-foreground"> が </span>
                        <span>{log.details || log.action}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* タスク追加ダイアログ */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しいタスクを追加</DialogTitle>
            <DialogDescription>Phase 1の実装タスクを追加します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">タスク名</Label>
              <input
                id="task-title"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例: フォームコンポーネントの移行"
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">説明</Label>
              <Textarea
                id="task-description"
                placeholder="タスクの詳細な説明を入力..."
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated-hours">予定工数（時間）</Label>
                <input
                  id="estimated-hours"
                  type="number"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="8"
                  value={newTaskData.estimatedHours}
                  onChange={(e) =>
                    setNewTaskData({
                      ...newTaskData,
                      estimatedHours: parseInt(e.target.value) || 8,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">担当者</Label>
                <Select
                  value={newTaskData.assignee}
                  onValueChange={(value) => setNewTaskData({ ...newTaskData, assignee: value })}
                >
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder="選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreateTask} disabled={isLoading}>
              {isLoading ? '作成中...' : '追加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI提案ダイアログ */}
      <Dialog open={showAISuggestionsDialog} onOpenChange={setShowAISuggestionsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AIによるタスク提案
            </DialogTitle>
            <DialogDescription>
              現在のタスクを分析し、以下の追加タスクを提案します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {suggestedTasks.map((suggestion) => (
              <Card
                key={suggestion.id}
                className={`cursor-pointer transition-colors ${
                  selectedSuggestions.includes(suggestion.id) ? 'border-primary' : ''
                }`}
                onClick={() => toggleSuggestionSelection(suggestion.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedSuggestions.includes(suggestion.id)}
                        onCheckedChange={() => toggleSuggestionSelection(suggestion.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <CardTitle className="text-base">{suggestion.title}</CardTitle>
                        <CardDescription className="mt-1">{suggestion.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          suggestion.priority === 'high'
                            ? 'destructive'
                            : suggestion.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {suggestion.priority === 'high'
                          ? '高'
                          : suggestion.priority === 'medium'
                            ? '中'
                            : '低'}
                        優先度
                      </Badge>
                      <Badge variant="outline">{suggestion.estimatedHours}h</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert className="py-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">{suggestion.reason}</AlertDescription>
                    </Alert>

                    {suggestion.dependencies && suggestion.dependencies.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">依存タスク: </span>
                        <span className="text-muted-foreground">
                          {suggestion.dependencies
                            .map((dep) => tasks.find((t) => t.id === dep)?.title || dep)
                            .join(', ')}
                        </span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        予定される作業内容
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        {suggestion.checklist.map((item, index) => (
                          <li key={index} className="list-disc">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedSuggestions.length}件のタスクを選択中
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAISuggestionsDialog(false);
                  setSelectedSuggestions([]);
                }}
              >
                キャンセル
              </Button>
              <Button onClick={addSuggestedTasks} disabled={selectedSuggestions.length === 0}>
                選択したタスクを追加
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImprovementImplementation;
