import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  CheckCircle,
  Clock,
  AlertCircle,
  GitBranch,
  Github,
  MessageSquare,
  FileText,
  Users,
  Plus,
  ExternalLink,
  Download,
  RefreshCw,
  Sparkles,
  Brain,
  CheckSquare,
  Info,
  Save,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Task, SuggestedTask, TeamMember, ChecklistItem } from '@/types/implementation';
import { useImplementation } from '@/hooks/useImplementation';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAuth } from '@/hooks/useAuth';
import { useResources } from '@/hooks/useResources';
import { githubService } from '@/services/githubService';
import ResearchTaskService from '@/services/ai/ResearchTaskService';

// 新しいタスクデータの型定義
interface NewTaskData {
  title: string;
  description: string;
  estimatedHours: number;
  assignee: string;
  priority: Task['priority'];
}

// タスク作成データの型定義
interface TaskCreationData {
  title: string;
  description: string;
  phase: string;
  status: Task['status'];
  estimatedHours: number;
  actualHours: number;
  projectId: string;
  checklist: ChecklistItem[];
  priority: Task['priority'];
  tags: string[];
  dependencies: string[];
  notes: string;
  assignee?: string;
  createdBy: string;
}

// フェーズ情報の定義
const PHASE_CONFIG = {
  phase1: {
    title: 'UIライブラリの統一',
    description: 'Material-UI、Radix UI、shadcn-uiの統合作業',
    color: 'bg-blue-500',
    unlockThreshold: 0,
  },
  phase2: {
    title: 'パフォーマンス最適化',
    description: 'バンドルサイズ最適化とレンダリング改善',
    color: 'bg-green-500',
    unlockThreshold: 80,
  },
  phase3: {
    title: 'リファクタリング',
    description: 'コードベースの整理と保守性向上',
    color: 'bg-purple-500',
    unlockThreshold: 80,
  },
} as const;

const ImprovementImplementation: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();

  // State管理
  const [activePhase, setActivePhase] = useState<keyof typeof PHASE_CONFIG>('phase1');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newNote, setNewNote] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showAISuggestionsDialog, setShowAISuggestionsDialog] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newTaskData, setNewTaskData] = useState<NewTaskData>({
    title: '',
    description: '',
    estimatedHours: 8,
    assignee: '',
    priority: 'medium',
  });
  const [isAddingTasks, setIsAddingTasks] = useState(false);
  const [_isExecutingResearch, setIsExecutingResearch] = useState(false);
  const [_showResearchDialog, _setShowResearchDialog] = useState(false);
  const [_researchTask, _setResearchTask] = useState<Task | null>(null);

  // プロジェクトIDを安全に取得
  const currentProjectId = useMemo(() => projectId || 'site-improvement-2024', [projectId]);

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
    addLog,
  } = useImplementation(currentProjectId);

  // チームメンバーを実データから取得
  const {
    teamMembers,
    isLoading: membersLoading,
    error: membersError,
    refreshMembers,
  } = useTeamMembers(currentProjectId);

  // 実装リソースを設定から取得
  const {
    resources,
    isLoading: resourcesLoading,
    refreshResources,
  } = useResources('implementation');

  // メモ化された計算処理
  const phaseProgress = useMemo(() => {
    const calculateProgress = (phase: keyof typeof PHASE_CONFIG) => {
      const phaseTasks = tasks.filter((t) => t.phase === phase);
      if (phaseTasks.length === 0) return 0;
      const completedTasks = phaseTasks.filter((t) => t.status === 'completed').length;
      return Math.round((completedTasks / phaseTasks.length) * 100);
    };

    return {
      phase1: calculateProgress('phase1'),
      phase2: calculateProgress('phase2'),
      phase3: calculateProgress('phase3'),
    };
  }, [tasks]);

  const overallProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  }, [tasks]);

  const currentPhaseTasks = useMemo(
    () => tasks.filter((task) => task.phase === activePhase),
    [tasks, activePhase]
  );

  // フェーズのロック状態を判定
  const isPhaseUnlocked = useCallback(
    (phase: keyof typeof PHASE_CONFIG) => {
      if (phase === 'phase1') return true;
      const prevPhase = phase === 'phase2' ? 'phase1' : 'phase2';
      return phaseProgress[prevPhase] >= PHASE_CONFIG[phase].unlockThreshold;
    },
    [phaseProgress]
  );

  // タスクの進捗計算をメモ化
  const calculateTaskProgress = useCallback((task: Task) => {
    if (task.checklist.length === 0) return 0;
    const completed = task.checklist.filter((item) => item.completed).length;
    return Math.round((completed / task.checklist.length) * 100);
  }, []);

  // ステータス別タスク数の計算
  const taskCounts = useMemo(() => {
    const phaseTasks = currentPhaseTasks;
    return {
      total: phaseTasks.length,
      notStarted: phaseTasks.filter((t) => t.status === 'not-started').length,
      inProgress: phaseTasks.filter((t) => t.status === 'in-progress').length,
      completed: phaseTasks.filter((t) => t.status === 'completed').length,
      blocked: phaseTasks.filter((t) => t.status === 'blocked').length,
    };
  }, [currentPhaseTasks]);

  // 初期化処理
  useEffect(() => {
    if (currentProjectId && user) {
      Promise.all([refreshData(), refreshMembers(), refreshResources()]).catch((error) => {
        console.error('Failed to initialize data:', error);
        toast.error('データの初期化に失敗しました');
      });
    }
  }, [currentProjectId, user, refreshData, refreshMembers, refreshResources]);

  // フェーズ進捗の計算ヘルパー
  const calculatePhaseProgress = useCallback((phase: string, taskList: Task[]) => {
    const phaseTasks = taskList.filter((t) => t.phase === phase);
    if (phaseTasks.length === 0) return 0;
    const completedTasks = phaseTasks.filter((t) => t.status === 'completed').length;
    return Math.round((completedTasks / phaseTasks.length) * 100);
  }, []);

  // タスクステータスの更新
  const handleUpdateTaskStatus = useCallback(
    async (taskId: string, status: Task['status']) => {
      try {
        const success = await updateTaskStatus(taskId, status);
        if (success && user) {
          const task = tasks.find((t) => t.id === taskId);
          await addLog(
            'task_status_updated',
            `タスク「${task?.title}」のステータスを「${status}」に変更`,
            user.uid!,
            user.displayName || user.email || 'Unknown User'
          );

          // 完了時の特別処理
          if (status === 'completed') {
            toast.success('タスクが完了しました！🎉');

            // フェーズ進捗をチェックして次フェーズのアンロック通知
            const updatedPhaseProgress = calculatePhaseProgress(
              activePhase,
              tasks.map((t) => (t.id === taskId ? { ...t, status } : t))
            );

            if (updatedPhaseProgress >= 80) {
              const nextPhase = activePhase === 'phase1' ? 'phase2' : 'phase3';
              if (nextPhase in PHASE_CONFIG) {
                toast.success(`🚀 Phase ${nextPhase.slice(-1)}がアンロックされました！`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Task status update error:', error);
        toast.error('タスクステータスの更新に失敗しました');
      }
    },
    [updateTaskStatus, tasks, addLog, user, activePhase, calculatePhaseProgress]
  );

  // チェックリストの更新
  const handleUpdateChecklist = useCallback(
    async (taskId: string, checklistId: string, completed: boolean) => {
      try {
        const success = await updateChecklist(taskId, checklistId, completed);
        if (success && user) {
          const task = tasks.find((t) => t.id === taskId);
          const checklistItem = task?.checklist.find((item) => item.id === checklistId);
          const action = completed
            ? 'チェックリスト項目を完了'
            : 'チェックリスト項目を未完了に変更';
          await addLog(
            'checklist_updated',
            `${task?.title}: ${checklistItem?.label} - ${action}`,
            user.uid!,
            user.displayName || user.email || 'Unknown User'
          );

          // タスクの進捗が100%になった場合の自動ステータス更新提案
          if (completed && task) {
            const newProgress = calculateTaskProgress({
              ...task,
              checklist: task.checklist.map((item) =>
                item.id === checklistId ? { ...item, completed } : item
              ),
            });

            if (newProgress === 100 && task.status !== 'completed') {
              toast.success('チェックリストが完了しました。タスクを完了状態にしますか？', {
                duration: 5000,
                icon: '🎉',
              });
              setTimeout(() => {
                if (
                  window.confirm(
                    'すべてのチェックリストが完了しました。このタスクを完了状態にしますか？'
                  )
                ) {
                  handleUpdateTaskStatus(taskId, 'completed');
                }
              }, 2000);
            }
          }
        }
      } catch (error) {
        console.error('Checklist update error:', error);
        toast.error('チェックリストの更新に失敗しました');
      }
    },
    [updateChecklist, tasks, addLog, user, calculateTaskProgress, handleUpdateTaskStatus]
  );

  // ノートの追加
  const addNote = useCallback(async () => {
    if (!newNote.trim() || !user) return;

    try {
      const success = await addLog(
        'note_added',
        newNote,
        user.uid!,
        user.displayName || user.email || 'Unknown User'
      );

      if (success) {
        setNewNote('');
        toast.success('メモを追加しました');
      } else {
        toast.error('メモの追加に失敗しました');
      }
    } catch (error) {
      toast.error('メモの追加に失敗しました');
      console.error('Add note error:', error);
    }
  }, [newNote, user, addLog]);

  // GitHubブランチの作成
  const createBranch = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !user) return;

      try {
        const branchName = `feature/${task.id}-${task.title.toLowerCase().replace(/\s+/g, '-')}`;
        await githubService.createBranch(branchName, {
          projectId: currentProjectId,
          taskId: task.id,
          description: task.description,
        });

        await updateTask(taskId, {
          branch: branchName,
          notes:
            task.notes + `\n[${new Date().toLocaleString()}] GitHubブランチ「${branchName}」を作成`,
        });

        await addLog(
          'branch_created',
          `タスク「${task.title}」のGitHubブランチ「${branchName}」を作成`,
          user.uid!,
          user.displayName || user.email || 'Unknown User'
        );

        toast.success('GitHubブランチを作成しました');
      } catch (error) {
        toast.error('ブランチの作成に失敗しました');
        console.error('Branch creation error:', error);
      }
    },
    [tasks, user, currentProjectId, updateTask, addLog]
  );

  // プルリクエストの作成
  const createPR = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !task.branch || !user) return;

      try {
        const prResult = await githubService.createPullRequest({
          branchName: task.branch,
          title: `${task.title} (#${task.id})`,
          description: `${task.description}\n\n## チェックリスト\n${task.checklist.map((item) => `- [${item.completed ? 'x' : ' '}] ${item.label}`).join('\n')}`,
          projectId: currentProjectId,
        });

        await updateTask(taskId, {
          pr: prResult.url,
          notes:
            task.notes + `\n[${new Date().toLocaleString()}] プルリクエストを作成: ${prResult.url}`,
        });

        await addLog(
          'pr_created',
          `タスク「${task.title}」のプルリクエストを作成: ${prResult.url}`,
          user.uid!,
          user.displayName || user.email || 'Unknown User'
        );

        toast.success('プルリクエストを作成しました');
      } catch (error) {
        toast.error('プルリクエストの作成に失敗しました');
        console.error('PR creation error:', error);
      }
    },
    [tasks, user, currentProjectId, updateTask, addLog]
  );

  // AI分析とタスク提案のロジック
  const generateTaskSuggestions = useCallback(
    async (
      currentTasks: Task[],
      phase: keyof typeof PHASE_CONFIG,
      members: TeamMember[]
    ): Promise<SuggestedTask[]> => {
      const completedTasks = currentTasks.filter((t) => t.status === 'completed');
      const inProgressTasks = currentTasks.filter((t) => t.status === 'in-progress');
      const blockedTasks = currentTasks.filter((t) => t.status === 'blocked');
      const suggestions: SuggestedTask[] = [];

      // フェーズ固有の提案ロジック
      if (phase === 'phase1') {
        // Phase 1: UIライブラリ統一の提案
        if (currentTasks.length === 0) {
          suggestions.push({
            id: `suggestion-${Date.now()}-1`,
            title: 'UIライブラリ調査',
            description: '既存のUIコンポーネントライブラリの使用状況を調査し、統合方針を策定する',
            reason: 'まず現状把握から始める必要があります。効率的な統合計画を立てるため',
            estimatedHours: 8,
            priority: 'high',
            dependencies: [],
            checklist: [
              'Material-UI使用箇所の特定と調査',
              'Radix UI使用箇所の特定と調査',
              'shadcn-ui使用箇所の特定と調査',
              '各ライブラリの依存関係分析',
              '統合方針の策定とドキュメント化',
              'チームメンバーへの共有',
            ],
            phase,
            tags: ['research', 'ui-library', 'planning'],
            confidence: 0.95,
            source: 'ai_analysis',
          });
        }

        if (!currentTasks.some((t) => t.tags.includes('design-system'))) {
          suggestions.push({
            id: `suggestion-${Date.now()}-2`,
            title: 'デザインシステム構築',
            description:
              'shadcn-uiベースの統一デザインシステムを構築し、再利用可能なコンポーネントライブラリを作成',
            reason: 'UIライブラリ統一にはデザインシステムが必要です。開発効率と品質向上のため',
            estimatedHours: 16,
            priority: 'high',
            dependencies: [],
            checklist: [
              'デザイントークンの定義（カラー、フォント、スペーシング）',
              'コンポーネント一覧の作成',
              'shadcn-uiベースのコンポーネント実装',
              'Storybookの設定と文書化',
              '使用ガイドラインの作成',
              'チーム向けの勉強会開催',
            ],
            phase,
            tags: ['design-system', 'documentation', 'components'],
            confidence: 0.9,
            source: 'ai_analysis',
          });
        }

        // 既存タスクの状況に応じた追加提案
        if (completedTasks.length > 0) {
          suggestions.push({
            id: `suggestion-${Date.now()}-7`,
            title: 'コンポーネント移行計画',
            description: '既存コンポーネントを新しいデザインシステムに段階的に移行する計画を策定',
            reason: '調査が完了したため、具体的な移行計画が必要です',
            estimatedHours: 6,
            priority: 'medium',
            dependencies: completedTasks.map((t) => t.id),
            checklist: [
              '移行優先度の設定',
              '移行スケジュールの作成',
              'リスク評価と対策',
              'テスト計画の策定',
            ],
            phase,
            tags: ['migration', 'planning'],
            confidence: 0.85,
            source: 'ai_analysis',
          });
        }
      }

      if (phase === 'phase2') {
        // Phase 2: パフォーマンス最適化の提案
        suggestions.push({
          id: `suggestion-${Date.now()}-3`,
          title: 'バンドル分析とサイズ最適化',
          description: 'webpack-bundle-analyzerを使用したバンドルサイズ分析と最適化施策の実施',
          reason: 'パフォーマンス最適化には現状分析が必要です。ユーザー体験向上のため',
          estimatedHours: 6,
          priority: 'high',
          dependencies: [],
          checklist: [
            'webpack-bundle-analyzerの導入',
            'バンドルサイズの現状測定',
            '大きなライブラリの特定',
            'tree-shakingの設定確認',
            'コード分割の実装',
            '最適化結果の測定とレポート作成',
          ],
          phase,
          tags: ['performance', 'analysis', 'optimization'],
          confidence: 0.9,
          source: 'ai_analysis',
        });

        suggestions.push({
          id: `suggestion-${Date.now()}-8`,
          title: 'レンダリング最適化',
          description: 'React.memo、useMemo、useCallbackを活用したレンダリングパフォーマンスの改善',
          reason: 'UIライブラリ統合後のパフォーマンス回復が必要です',
          estimatedHours: 8,
          priority: 'medium',
          dependencies: [],
          checklist: [
            'React DevToolsでのプロファイリング',
            '無駄な再レンダリングの特定',
            'メモ化の適用',
            'カスタムフックの最適化',
            'パフォーマンステストの実行',
          ],
          phase,
          tags: ['performance', 'react', 'optimization'],
          confidence: 0.8,
          source: 'ai_analysis',
        });
      }

      if (phase === 'phase3') {
        // Phase 3: リファクタリングの提案
        suggestions.push({
          id: `suggestion-${Date.now()}-9`,
          title: 'TypeScript型強化',
          description: 'any型の排除と厳密な型定義による型安全性の向上',
          reason: 'コードの保守性と品質向上のため',
          estimatedHours: 10,
          priority: 'medium',
          dependencies: [],
          checklist: [
            'any型の使用箇所を特定',
            'インターフェースの定義',
            'ジェネリクスの活用',
            'ESLintルールの強化',
            '型エラーの修正',
          ],
          phase,
          tags: ['typescript', 'refactoring', 'quality'],
          confidence: 0.8,
          source: 'ai_analysis',
        });
      }

      // 共通の提案ロジック
      if (inProgressTasks.length > 0 && !currentTasks.some((t) => t.tags.includes('testing'))) {
        suggestions.push({
          id: `suggestion-${Date.now()}-4`,
          title: 'テスト戦略の策定と実装',
          description: '実装中のタスクに対する包括的なテスト方針の策定と自動テストの実装',
          reason: '実装が進んでいますが、テスト関連のタスクが不足しています。品質保証のため',
          estimatedHours: 12,
          priority: 'medium',
          dependencies: inProgressTasks.map((t) => t.id),
          checklist: [
            'テストフレームワークの選定（Jest, Testing Library等）',
            'テストケース設計とカバレッジ目標設定',
            'ユニットテストの実装',
            '統合テストの実装',
            'CI/CDパイプラインでの自動テスト設定',
            'テストドキュメントの作成',
          ],
          phase,
          tags: ['testing', 'quality', 'automation'],
          confidence: 0.8,
          source: 'ai_analysis',
        });
      }

      if (blockedTasks.length > 0) {
        suggestions.push({
          id: `suggestion-${Date.now()}-5`,
          title: 'ブロック解除アクション実行',
          description: 'ブロックされたタスクの根本原因分析と具体的な解決策の実行',
          reason: `${blockedTasks.length}件のブロックタスクがあります。プロジェクト進行のため早急な対応が必要`,
          estimatedHours: 4,
          priority: 'high',
          dependencies: [],
          checklist: [
            'ブロック要因の詳細分析',
            'ステークホルダーとの問題共有',
            '代替解決策の検討',
            '外部依存の解決',
            'リスク対策の実施',
            '進捗の定期確認',
          ],
          phase,
          tags: ['blocked', 'resolution', 'risk-management'],
          confidence: 0.7,
          source: 'ai_analysis',
        });
      }

      // チームメンバーの負荷に基づく提案
      const overloadedMembers = members.filter((m) => m.workload > 80);
      if (overloadedMembers.length > 0) {
        suggestions.push({
          id: `suggestion-${Date.now()}-6`,
          title: 'チーム負荷調整とリソース最適化',
          description: '過負荷メンバーからのタスク再配分とチーム全体のワークロード最適化',
          reason: `${overloadedMembers.length}名のメンバーが過負荷状態です。チーム効率とメンバーの健康のため`,
          estimatedHours: 3,
          priority: 'medium',
          dependencies: [],
          checklist: [
            '各メンバーの現在の負荷状況詳細分析',
            'タスクの優先度再評価',
            '負荷軽減のための再配分案作成',
            'メンバーとの1on1面談実施',
            '新しい配分での進捗見直し',
            '今後の負荷管理ルール策定',
          ],
          phase,
          tags: ['workload', 'team-management', 'resource-optimization'],
          confidence: 0.75,
          source: 'ai_analysis',
        });
      }

      // プロジェクト進捗に応じた追加提案
      const overallTaskProgress =
        currentTasks.length > 0 ? (completedTasks.length / currentTasks.length) * 100 : 0;

      if (overallTaskProgress > 70) {
        suggestions.push({
          id: `suggestion-${Date.now()}-10`,
          title: '品質レビューと最終調整',
          description: 'プロジェクト完了に向けた品質レビューと最終調整作業',
          reason: 'プロジェクトが70%以上完了しているため、品質担保が重要です',
          estimatedHours: 6,
          priority: 'medium',
          dependencies: [],
          checklist: [
            'コードレビューの実施',
            'セキュリティチェック',
            'パフォーマンステスト',
            'ユーザビリティテスト',
            'ドキュメント最終確認',
          ],
          phase,
          tags: ['quality', 'review', 'finalization'],
          confidence: 0.85,
          source: 'ai_analysis',
        });
      }

      return suggestions.slice(0, 8); // 最大8つまでの提案に制限
    },
    []
  );

  // 選択された提案タスクを追加（エラーハンドリング強化）
  const addSuggestedTasks = useCallback(async () => {
    if (!user) {
      toast.error('ユーザー認証が必要です');
      return;
    }

    const tasksToAdd = suggestedTasks.filter((st) => selectedSuggestions.includes(st.id));

    if (tasksToAdd.length === 0) {
      toast.error('追加するタスクを選択してください');
      return;
    }

    setIsAddingTasks(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const suggestionTask of tasksToAdd) {
        try {
          const taskData: TaskCreationData = {
            title: suggestionTask.title,
            description: suggestionTask.description,
            phase: suggestionTask.phase,
            status: 'not-started',
            estimatedHours: suggestionTask.estimatedHours,
            actualHours: 0,
            projectId: currentProjectId,
            checklist: suggestionTask.checklist.map((item, index) => ({
              id: `cl-${Date.now()}-${index}-${Math.random()}`,
              label: item,
              completed: false,
              createdAt: new Date().toISOString(),
            })),
            priority: suggestionTask.priority,
            tags: suggestionTask.tags,
            dependencies: suggestionTask.dependencies,
            notes: `AI提案 (信頼度: ${Math.round(suggestionTask.confidence * 100)}%)\n理由: ${suggestionTask.reason}\n作成日時: ${new Date().toLocaleString()}`,
            createdBy: user.uid!,
          };

          const success = await createTask(taskData);
          if (success) {
            successCount++;
            // ログ記録
            await addLog(
              'ai_task_added',
              `AI提案タスク「${suggestionTask.title}」を追加`,
              user.uid!,
              user.displayName || user.email || 'Unknown User'
            );
          } else {
            errorCount++;
            console.error('Failed to create task:', suggestionTask.title);
          }
        } catch (taskError) {
          errorCount++;
          console.error('Error creating individual task:', taskError);
        }
      }

      if (successCount > 0) {
        toast.success(
          `${successCount}件のタスクを正常に追加しました${errorCount > 0 ? `（${errorCount}件の追加に失敗）` : ''}`
        );

        // 成功した場合のみダイアログを閉じてリセット
        if (errorCount === 0) {
          setShowAISuggestionsDialog(false);
          setSelectedSuggestions([]);
          setSuggestedTasks([]);
        }
      } else {
        toast.error('タスクの追加に失敗しました');
      }
    } catch (error) {
      console.error('Add suggested tasks error:', error);
      toast.error('タスクの追加でエラーが発生しました');
    } finally {
      setIsAddingTasks(false);
    }
  }, [user, suggestedTasks, selectedSuggestions, currentProjectId, createTask, addLog]);

  // AI分析とタスク提案のロジック（エラーハンドリング強化）
  const analyzeTasks = useCallback(async () => {
    if (!user) {
      toast.error('ユーザー認証が必要です');
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysisResult = await generateTaskSuggestions(
        currentPhaseTasks,
        activePhase,
        teamMembers
      );

      setSuggestedTasks(analysisResult);

      if (analysisResult.length > 0) {
        setShowAISuggestionsDialog(true);

        await addLog(
          'ai_analysis',
          `AIがタスクを分析し、${analysisResult.length}件の追加タスクを提案しました (Phase: ${activePhase})`,
          user.uid!,
          user.displayName || user.email || 'Unknown User'
        );

        toast.success(`${analysisResult.length}件のタスク提案を生成しました`);
      } else {
        toast('現在のフェーズでは追加提案がありません', {
          icon: 'ℹ️',
        });
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('タスク分析でエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, currentPhaseTasks, activePhase, teamMembers, addLog, generateTaskSuggestions]);

  // Add this function before the return statement
  const exportReport = useCallback(async () => {
    try {
      const reportData = {
        exportInfo: {
          projectId: currentProjectId,
          projectName: currentProject?.name || 'サイト改善計画',
          exportDate: new Date().toISOString(),
          exportedBy: user?.displayName || user?.email || 'Unknown User',
        },
        progress: {
          overall: overallProgress,
          phases: phaseProgress,
        },
        tasks: tasks.map((task) => ({
          ...task,
          progress: calculateTaskProgress(task),
          assigneeName: teamMembers.find((m) => m.id === task.assignee)?.name,
        })),
        summary: {
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t) => t.status === 'completed').length,
          inProgressTasks: tasks.filter((t) => t.status === 'in-progress').length,
          blockedTasks: tasks.filter((t) => t.status === 'blocked').length,
        },
      };

      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `implementation-report-${currentProjectId}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      toast.success('レポートをエクスポートしました');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('レポートのエクスポートに失敗しました');
    }
  }, [
    currentProjectId,
    currentProject,
    overallProgress,
    phaseProgress,
    tasks,
    teamMembers,
    calculateTaskProgress,
    user,
  ]);

  // Add this function before the return statement
  const handleCreateTask = useCallback(async () => {
    if (!newTaskData.title.trim()) {
      toast.error('タスク名を入力してください');
      return;
    }

    if (!user) {
      toast.error('ユーザー認証が必要です');
      return;
    }

    const taskData: TaskCreationData = {
      title: newTaskData.title,
      description: newTaskData.description,
      phase: activePhase,
      status: 'not-started',
      estimatedHours: newTaskData.estimatedHours,
      actualHours: 0,
      projectId: currentProjectId,
      checklist: [],
      priority: newTaskData.priority,
      tags: [activePhase],
      dependencies: [],
      notes: '',
      assignee: newTaskData.assignee || undefined,
      createdBy: user.uid!,
    };

    const success = await createTask(taskData);
    if (success) {
      setShowTaskDialog(false);
      setNewTaskData({
        title: '',
        description: '',
        estimatedHours: 8,
        assignee: '',
        priority: 'medium',
      });
      toast.success('新しいタスクを追加しました');
    }
  }, [newTaskData, user, activePhase, currentProjectId, createTask]);

  // Add this function before the return statement
  const toggleSuggestionSelection = useCallback((suggestionId: string) => {
    setSelectedSuggestions((prev) =>
      prev.includes(suggestionId)
        ? prev.filter((id) => id !== suggestionId)
        : [...prev, suggestionId]
    );
  }, []);

  // AI調査実行
  const _executeAIResearch = useCallback(
    async (task: Task) => {
      if (!user) {
        toast.error('ユーザー認証が必要です');
        return;
      }

      setIsExecutingResearch(true);

      try {
        const result = await ResearchTaskService.executeResearch(task, user.uid!);

        if (result.success) {
          // タスクに調査結果を保存
          const updatedTask = {
            ...task,
            researchResult: {
              content: result.content,
              knowledgeEntries: result.knowledgeEntries.map((entry) => entry.id),
              executedAt: new Date().toISOString(),
              executedBy: user.uid,
              confidence: result.confidence,
            },
            status: 'completed' as Task['status'],
            actualHours: task.estimatedHours, // 調査完了として工数を設定
            completedDate: new Date().toISOString(),
            notes:
              task.notes +
              `\n[${new Date().toLocaleString()}] AI調査を実行し、${result.knowledgeEntries.length}件のナレッジエントリーを生成しました。`,
          };

          const success = await updateTask(task.id, updatedTask);
          if (success && user) {
            await addLog(
              'research_result_added',
              `タスク「${task.title}」にAI調査結果を追加`,
              user.uid!,
              user.displayName || user.email || 'Unknown User'
            );
            toast.success('AI調査結果をタスクに追加しました');
          }
        }
      } catch (error) {
        console.error('AI調査実行エラー:', error);
        toast.error('AI調査実行中にエラーが発生しました');
      } finally {
        setIsExecutingResearch(false);
      }
    },
    [user, updateTask, addLog]
  );

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
          <p className="text-muted-foreground">
            {currentProject?.name || 'サイト改善計画'}の実装進捗を管理
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            全体進捗: {overallProgress}%
          </Badge>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            レポート出力
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/improvement-plan')}>
            <Settings className="h-4 w-4 mr-2" />
            計画設定
          </Button>
        </div>
      </div>

      {/* エラー表示 */}
      {(error || membersError) && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">エラー</AlertTitle>
          <AlertDescription className="text-red-700">{error || membersError}</AlertDescription>
        </Alert>
      )}

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{taskCounts.total}</div>
            <div className="text-sm text-muted-foreground">総タスク数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{taskCounts.notStarted}</div>
            <div className="text-sm text-muted-foreground">未着手</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{taskCounts.inProgress}</div>
            <div className="text-sm text-muted-foreground">進行中</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{taskCounts.completed}</div>
            <div className="text-sm text-muted-foreground">完了</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{taskCounts.blocked}</div>
            <div className="text-sm text-muted-foreground">ブロック</div>
          </CardContent>
        </Card>
      </div>

      {/* フェーズ選択タブ */}
      <Tabs
        value={activePhase}
        onValueChange={(value) => setActivePhase(value as keyof typeof PHASE_CONFIG)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(PHASE_CONFIG).map(([phase, _config]) => (
            <TabsTrigger
              key={phase}
              value={phase}
              className="relative"
              disabled={!isPhaseUnlocked(phase as keyof typeof PHASE_CONFIG)}
            >
              Phase {phase.slice(-1)}
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 justify-center text-xs">
                {phaseProgress[phase as keyof typeof phaseProgress]}%
              </Badge>
              {!isPhaseUnlocked(phase as keyof typeof PHASE_CONFIG) && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-75 rounded flex items-center justify-center">
                  <span className="text-xs">🔒</span>
                </div>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activePhase} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* タスク一覧 */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span>{PHASE_CONFIG[activePhase].title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={phaseProgress[activePhase]} className="w-48 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {phaseProgress[activePhase]}%
                        </span>
                      </div>
                    </div>
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
                  <CardDescription>{PHASE_CONFIG[activePhase].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">タスクを読み込み中...</p>
                    </div>
                  ) : currentPhaseTasks.length === 0 ? (
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
                    currentPhaseTasks.map((task) => (
                      <Card
                        key={task.id}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedTask?.id === task.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : ''
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
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
                                {task.status === 'not-started' && (
                                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                )}
                                {task.title}
                                <Badge
                                  variant={
                                    task.priority === 'high'
                                      ? 'destructive'
                                      : task.priority === 'medium'
                                        ? 'default'
                                        : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {task.priority === 'high'
                                    ? '高'
                                    : task.priority === 'medium'
                                      ? '中'
                                      : '低'}
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                              {task.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {task.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {task.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{task.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
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
                                    <AvatarImage
                                      src={teamMembers.find((m) => m.id === task.assignee)?.avatar}
                                    />
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
                              {task.estimatedHours > 0 && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-xs text-muted-foreground">
                                    効率:{' '}
                                    {Math.round((task.actualHours / task.estimatedHours) * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {task.branch && (
                                <Badge variant="outline" className="text-xs">
                                  <GitBranch className="h-3 w-3 mr-1" />
                                  branch
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
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>タスク詳細</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          ID: {selectedTask.id}
                        </Badge>
                        <Badge
                          variant={
                            selectedTask.priority === 'high'
                              ? 'destructive'
                              : selectedTask.priority === 'medium'
                                ? 'default'
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {selectedTask.priority === 'high'
                            ? '高優先度'
                            : selectedTask.priority === 'medium'
                              ? '中優先度'
                              : '低優先度'}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* タスク基本情報 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">作成日:</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(selectedTask.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">更新日:</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(selectedTask.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">予定工数:</span>
                        <span className="ml-2 text-muted-foreground">
                          {selectedTask.estimatedHours}時間
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">実績工数:</span>
                        <span className="ml-2 text-muted-foreground">
                          {selectedTask.actualHours}時間
                        </span>
                      </div>
                    </div>

                    <Separator />

                    {/* チェックリスト */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">チェックリスト</h4>
                        <span className="text-sm text-muted-foreground">
                          {selectedTask.checklist.filter((item) => item.completed).length}/
                          {selectedTask.checklist.length} 完了
                        </span>
                      </div>
                      {selectedTask.checklist.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          チェックリスト項目がありません
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedTask.checklist.map((item) => (
                            <label
                              key={item.id}
                              className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50"
                            >
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={(checked) =>
                                  handleUpdateChecklist(
                                    selectedTask.id,
                                    item.id,
                                    checked as boolean
                                  )
                                }
                              />
                              <span
                                className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                              >
                                {item.label}
                              </span>
                              {item.completed && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    item.completedAt || item.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* タグと依存関係 */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-2">タグ</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedTask.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedTask.dependencies.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">依存タスク</h4>
                          <div className="space-y-1">
                            {selectedTask.dependencies.map((depId) => {
                              const depTask = tasks.find((t) => t.id === depId);
                              return depTask ? (
                                <div key={depId} className="flex items-center gap-2 text-sm">
                                  {depTask.status === 'completed' ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Clock className="h-3 w-3 text-yellow-500" />
                                  )}
                                  <span>{depTask.title}</span>
                                </div>
                              ) : (
                                <div key={depId} className="text-sm text-muted-foreground">
                                  依存タスクが見つかりません: {depId}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* GitHub連携アクション */}
                    <div className="flex gap-2 flex-wrap">
                      {!selectedTask.branch && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => createBranch(selectedTask.id)}
                          disabled={!user}
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
                          disabled={!user}
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/wbs-creator?taskId=${selectedTask.id}`)}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        WBS詳細
                      </Button>
                    </div>

                    {/* ノート表示 */}
                    {selectedTask.notes && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">メモ</h4>
                          <div className="p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                            {selectedTask.notes}
                          </div>
                        </div>
                      </>
                    )}
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
                  {membersLoading ? (
                    <div className="text-center py-4">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">読み込み中...</p>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        チームメンバーが登録されていません
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => navigate('/profile')}
                      >
                        プロフィール設定
                      </Button>
                    </div>
                  ) : (
                    teamMembers.map((member) => {
                      const memberTasks = tasks.filter((task) => task.assignee === member.id);
                      const memberCompletedTasks = memberTasks.filter(
                        (task) => task.status === 'completed'
                      );

                      return (
                        <div
                          key={member.id}
                          className="flex items-start gap-3 p-2 rounded hover:bg-gray-50"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.role}</p>
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
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              タスク: {memberCompletedTasks.length}/{memberTasks.length}(
                              {memberTasks.length > 0
                                ? Math.round(
                                    (memberCompletedTasks.length / memberTasks.length) * 100
                                  )
                                : 0}
                              %)
                            </div>
                            <div className="text-xs text-muted-foreground">
                              負荷: {member.workload}%
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
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
                  {resourcesLoading ? (
                    <div className="text-center py-4">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">読み込み中...</p>
                    </div>
                  ) : resources.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">リソースが登録されていません</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open('https://ui.shadcn.com/', '_blank')}
                      >
                        shadcn-ui ドキュメント
                      </Button>
                    </div>
                  ) : (
                    resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors p-2 rounded hover:bg-gray-50"
                      >
                        {resource.icon || <FileText className="h-3 w-3" />}
                        <span className="flex-1">{resource.title}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))
                  )}
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
                      className="min-h-[80px] resize-none"
                    />
                    <Button
                      size="sm"
                      onClick={addNote}
                      className="w-full"
                      disabled={!newNote.trim() || !user}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      メモを追加
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* クイックアクション */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">クイックアクション</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/improvement-plan')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    改善計画に戻る
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/wbs-creator')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    WBS作成ツール
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      window.open('https://github.com/umezawakanta/work-time-tracker', '_blank')
                    }
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHubリポジトリ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 実装ログ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  実装ログ
                </div>
                <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
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
                    <div key={log.id} className="flex gap-3 text-sm p-2 rounded hover:bg-gray-50">
                      <span className="text-muted-foreground whitespace-nowrap text-xs">
                        {new Date(log.timestamp || Date.now()).toLocaleString('ja-JP', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{log.user}</span>
                        <span className="text-muted-foreground"> が </span>
                        <span className="break-words">{log.details || log.action}</span>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新しいタスクを追加</DialogTitle>
            <DialogDescription>
              {PHASE_CONFIG[activePhase].title}の実装タスクを追加します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">タスク名 *</Label>
              <Input
                id="task-title"
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
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated-hours">予定工数（時間）</Label>
                <Input
                  id="estimated-hours"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="8"
                  value={newTaskData.estimatedHours.toString()}
                  onChange={(e) =>
                    setNewTaskData({
                      ...newTaskData,
                      estimatedHours: Math.max(1, parseInt(e.target.value) || 8),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority">優先度</Label>
                <Select
                  value={newTaskData.priority}
                  onValueChange={(value) =>
                    setNewTaskData({ ...newTaskData, priority: value as Task['priority'] })
                  }
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低優先度</SelectItem>
                    <SelectItem value="medium">中優先度</SelectItem>
                    <SelectItem value="high">高優先度</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">担当者</Label>
              <Select
                value={newTaskData.assignee}
                onValueChange={(value) =>
                  setNewTaskData({ ...newTaskData, assignee: value === 'unassigned' ? '' : value })
                }
              >
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="担当者を選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">未割り当て</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreateTask} disabled={isLoading || !newTaskData.title.trim()}>
              {isLoading ? '作成中...' : '追加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI提案ダイアログ */}
      <Dialog open={showAISuggestionsDialog} onOpenChange={setShowAISuggestionsDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AIによるタスク提案
            </DialogTitle>
            <DialogDescription>
              {PHASE_CONFIG[activePhase].title}の現在のタスクを分析し、以下の追加タスクを提案します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {suggestedTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">現在提案できるタスクはありません</p>
                <p className="text-sm text-muted-foreground mt-2">
                  既存のタスクを進めてから再度分析してください
                </p>
              </div>
            ) : (
              suggestedTasks.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedSuggestions.includes(suggestion.id)
                      ? 'border-primary ring-2 ring-primary/20'
                      : ''
                  }`}
                  onClick={() => toggleSuggestionSelection(suggestion.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedSuggestions.includes(suggestion.id)}
                          onCheckedChange={() => toggleSuggestionSelection(suggestion.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <CardTitle className="text-base">{suggestion.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {suggestion.description}
                          </CardDescription>
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
                            ? '高優先度'
                            : suggestion.priority === 'medium'
                              ? '中優先度'
                              : '低優先度'}
                        </Badge>
                        <Badge variant="outline">{suggestion.estimatedHours}h</Badge>
                        <Badge variant="outline" className="text-xs">
                          信頼度: {Math.round(suggestion.confidence * 100)}%
                        </Badge>
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

                      {suggestion.tags && suggestion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suggestion.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
              <Button
                onClick={addSuggestedTasks}
                disabled={selectedSuggestions.length === 0 || isAddingTasks}
              >
                {isAddingTasks
                  ? '追加中...'
                  : `選択したタスクを追加 (${selectedSuggestions.length})`}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImprovementImplementation;
