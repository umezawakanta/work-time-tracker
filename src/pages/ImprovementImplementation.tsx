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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
  checklist: ChecklistItem[];
  startDate?: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  branch?: string;
  pr?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface ImplementationLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details?: string;
}

const ImprovementImplementation: React.FC = () => {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState('phase1');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [implementationLogs, setImplementationLogs] = useState<ImplementationLog[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  // タスクデータ（実際の実装では、バックエンドから取得）
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'ui-audit',
      title: 'UIコンポーネント監査',
      description: '全てのコンポーネントをリストアップし、使用しているUIライブラリを特定',
      phase: 'phase1',
      status: 'in-progress',
      assignee: 'user1',
      estimatedHours: 16,
      actualHours: 8,
      checklist: [
        { id: 'c1', label: 'Material-UIコンポーネントのリストアップ', completed: true },
        { id: 'c2', label: 'Radix UIコンポーネントのマッピング', completed: true },
        { id: 'c3', label: 'shadcn-ui相当品の特定', completed: false },
        { id: 'c4', label: '移行優先順位の決定', completed: false },
      ],
      startDate: '2024-02-01',
      branch: 'feature/ui-library-audit',
    },
    {
      id: 'button-migration',
      title: 'ボタンコンポーネントの移行',
      description: 'Material-UIのButtonコンポーネントをshadcn-uiに置き換え',
      phase: 'phase1',
      status: 'not-started',
      estimatedHours: 8,
      actualHours: 0,
      checklist: [
        { id: 'b1', label: 'ボタンコンポーネントの使用箇所特定', completed: false },
        { id: 'b2', label: 'shadcn-ui Buttonの実装', completed: false },
        { id: 'b3', label: 'スタイルの調整', completed: false },
        { id: 'b4', label: 'テストの更新', completed: false },
      ],
    },
  ]);

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
  const updateChecklist = (taskId: string, checklistId: string, completed: boolean) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            checklist: task.checklist.map((item) =>
              item.id === checklistId ? { ...item, completed } : item
            ),
          };
        }
        return task;
      })
    );

    // ログに記録
    addLog('checklist_update', `チェックリスト項目を${completed ? '完了' : '未完了'}に更新`);
  };

  // タスクステータスの更新
  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updates: Partial<Task> = { status };
          if (status === 'in-progress' && !task.startDate) {
            updates.startDate = new Date().toISOString().split('T')[0];
          }
          if (status === 'completed') {
            updates.completedDate = new Date().toISOString().split('T')[0];
          }
          return { ...task, ...updates };
        }
        return task;
      })
    );

    const task = tasks.find((t) => t.id === taskId);
    addLog('status_update', `「${task?.title}」のステータスを${status}に更新`);
    toast.success('タスクステータスを更新しました');
  };

  // ログの追加
  const addLog = (action: string, details?: string) => {
    const newLog: ImplementationLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: 'current-user', // 実際の実装では認証情報から取得
      action,
      details,
    };
    setImplementationLogs((prev) => [newLog, ...prev]);
  };

  // ノートの追加
  const addNote = () => {
    if (!newNote.trim()) return;
    addLog('note_added', newNote);
    setNewNote('');
    toast.success('メモを追加しました');
  };

  // GitHubブランチの作成（モック）
  const createBranch = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const branchName = `feature/${task.id}`;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, branch: branchName } : t)));

    addLog('branch_created', `ブランチ「${branchName}」を作成`);
    toast.success('GitHubブランチを作成しました');
  };

  // プルリクエストの作成（モック）
  const createPR = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const prUrl = `https://github.com/example/repo/pull/${Math.floor(Math.random() * 1000)}`;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, pr: prUrl } : t)));

    addLog('pr_created', `「${task.title}」のPRを作成`);
    toast.success('プルリクエストを作成しました');
  };

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

  // チームメンバー（モック）
  const teamMembers = [
    { id: 'user1', name: '田中 太郎', avatar: '', role: 'フロントエンド' },
    { id: 'user2', name: '佐藤 花子', avatar: '', role: 'バックエンド' },
    { id: 'user3', name: '鈴木 一郎', avatar: '', role: 'フルスタック' },
  ];

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
            全体進捗: 25%
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            レポート出力
          </Button>
        </div>
      </div>

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
              0%
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="phase3" disabled>
            Phase 3
            <Badge variant="outline" className="ml-2 h-5 w-5 p-0 justify-center text-xs">
              0%
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
                    <Button size="sm" onClick={() => setShowTaskDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      タスク追加
                    </Button>
                  </CardTitle>
                  <CardDescription>Material-UI、Radix UI、shadcn-uiの統合作業</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tasks
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
                                  updateTaskStatus(task.id, value as Task['status'])
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
                    ))}
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
                      {selectedTask.checklist.map((item) => (
                        <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={(checked) =>
                              updateChecklist(selectedTask.id, item.id, checked as boolean)
                            }
                          />
                          <span
                            className={item.completed ? 'line-through text-muted-foreground' : ''}
                          >
                            {item.label}
                          </span>
                        </label>
                      ))}
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
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
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
                    <Button size="sm" onClick={addNote} className="w-full">
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

      {/* タスク追加ダイアログ（簡易版） */}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">説明</Label>
              <Textarea id="task-description" placeholder="タスクの詳細な説明を入力..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated-hours">予定工数（時間）</Label>
                <input
                  id="estimated-hours"
                  type="number"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">担当者</Label>
                <Select>
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
            <Button
              onClick={() => {
                setShowTaskDialog(false);
                toast.success('タスクを追加しました');
              }}
            >
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImprovementImplementation;
