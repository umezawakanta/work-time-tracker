import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Plus, RefreshCw, Clock, Target, GitBranch } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { AppDispatch } from '@/store';
import { addTodoItem, selectTodos, selectAnalysisSummary } from '@/store/todoSlice';
import AdvancedAIService from '@/services/ai/AdvancedAIService';
import WBSService from '@/services/wbs/WBSService';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';
import { WBSNode, WBSProject } from '@/types/wbs';
import { useAuth } from '@/hooks/useAuth';
import { RootState } from '@/store';

interface AISuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LocalTaskSuggestion {
  task: string;
  type: 'input' | 'output';
  priority: number;
  estimatedDuration?: number;
  reason?: string;
  deadline?: string;
  wbsNodeId?: string;
  wbsNodeName?: string;
}

// モックのWBSプロジェクトとノード（開発用）
const mockWBSProject: WBSProject = {
  id: 'site-dev-project',
  name: 'Work Time Tracker 開発計画',
  description: '世界最高のタスク管理サービスを構築するための開発計画',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'active',
  owner: 'mock-user',
  team: ['mock-user'],
  budget: 0,
  currency: 'JPY',
  visibility: 'private',
  tags: ['開発', 'プロジェクト管理'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockWBSNodes: WBSNode[] = [
  {
    id: 'node-1',
    projectId: 'site-dev-project',
    parentId: null,
    name: 'UI/UXの改善',
    description: 'ユーザビリティ向上のためのインターフェース改善',
    level: 1,
    orderIndex: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 14,
    progress: 30,
    status: 'in-progress',
    assignees: ['mock-user'],
    dependencies: [],
    estimatedHours: 40,
    actualHours: 12,
    budget: 0,
    actualCost: 0,
    deliverables: [],
    risks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'mock-user',
  },
  {
    id: 'node-2',
    projectId: 'site-dev-project',
    parentId: null,
    name: 'パフォーマンス最適化',
    description: 'アプリケーションの応答速度改善',
    level: 1,
    orderIndex: 1,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 7,
    progress: 0,
    status: 'not-started',
    assignees: ['mock-user'],
    dependencies: [],
    estimatedHours: 20,
    actualHours: 0,
    budget: 0,
    actualCost: 0,
    deliverables: [],
    risks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'mock-user',
  },
];

export const AISuggestionModal: React.FC<AISuggestionModalProps> = ({ open, onOpenChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos);
  const _analysisSummary = useSelector(selectAnalysisSummary);

  // Get user ID from Redux store
  const reduxUserId = useSelector((state: RootState) => state.user?.id);
  const { user: authUser } = useAuth();

  // Create user object with consistent structure
  const user = useMemo(() => {
    return reduxUserId
      ? { _id: reduxUserId, uid: reduxUserId }
      : authUser
        ? { _id: authUser.uid, uid: authUser.uid }
        : null;
  }, [reduxUserId, authUser]);

  // 開発環境用のフォールバック
  const effectiveUser = useMemo(
    () =>
      user ||
      (process.env.NODE_ENV === 'development' ? { uid: 'dev-user', _id: 'dev-user' } : null),
    [user]
  );

  const [suggestions, setSuggestions] = useState<LocalTaskSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [wbsProjects, setWbsProjects] = useState<WBSProject[]>([]);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([]);
  const [selectedProject, setSelectedProject] = useState<WBSProject | null>(null);
  const [autoAddToWBS, setAutoAddToWBS] = useState(true);
  const [isWBSDataLoaded, setIsWBSDataLoaded] = useState(false); // 無限ループを防ぐフラグ

  useEffect(() => {
    const loadWBSData = async () => {
      // モーダルが閉じているか、既に読み込み済みの場合はスキップ
      if (!open || isWBSDataLoaded) return;

      console.log('Loading WBS data...');
      console.log('User:', effectiveUser);
      console.log('Redux User:', reduxUserId);
      console.log('Auth User:', authUser);

      try {
        // 開発環境またはユーザーが存在しない場合はモックデータを使用
        if (!effectiveUser?._id || process.env.NODE_ENV === 'development') {
          console.log('Using mock WBS data for development');
          setWbsProjects([mockWBSProject]);
          setSelectedProject(mockWBSProject);
          setWbsNodes(mockWBSNodes);
          setIsWBSDataLoaded(true);
          return;
        }

        // MongoDBのユーザーIDを使用（_idを使用）
        const userId = effectiveUser._id || effectiveUser.uid;
        const projects = await WBSService.getProjects(userId!);
        console.log('Loaded WBS projects:', projects);
        setWbsProjects(projects);

        if (projects.length > 0) {
          setSelectedProject(projects[0]);
          const nodes = await WBSService.getProjectNodes(projects[0].id);
          console.log('Loaded WBS nodes:', nodes);
          setWbsNodes(nodes);
        }

        setIsWBSDataLoaded(true);
      } catch (error) {
        console.error('Failed to load WBS data:', error);
        // エラーの場合もモックデータを使用
        setWbsProjects([mockWBSProject]);
        setSelectedProject(mockWBSProject);
        setWbsNodes(mockWBSNodes);
        setIsWBSDataLoaded(true);
        toast.error('WBSデータの読み込みに失敗しました。モックデータを使用します。');
      }
    };

    loadWBSData();
  }, [open, effectiveUser?._id, effectiveUser?.uid]); // 必要最小限の依存関係のみ

  // モーダルが閉じたときにフラグをリセット
  useEffect(() => {
    if (!open) {
      setIsWBSDataLoaded(false);
    }
  }, [open]);

  const generateSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const completedTodos = todos.filter((t) => t.completed);
      const currentGoals = ['生産性向上', 'スキルアップ', 'タスク効率化'];

      // WBSノードのフィルタリング条件を修正
      const incompleteWBSTasks = wbsNodes.filter(
        (node) => node.status !== 'completed' // level条件を削除
      );

      // 既存のAI提案を取得
      const todosForAI = completedTodos.map((todo) => ({
        ...todo,
        type: todo.type || 'input',
        createdAt: todo.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      console.log('=== Generating AI Suggestions ===');
      console.log('Completed todos count:', completedTodos.length);
      console.log('Incomplete WBS tasks count:', incompleteWBSTasks.length);

      const aiSuggestions = await AdvancedAIService.suggestNextTasks(
        todosForAI as unknown as any,
        currentGoals
      );

      console.log('AI suggestions received:', aiSuggestions.length);
      console.log('AI suggestions:', aiSuggestions);

      const formattedSuggestions: LocalTaskSuggestion[] = aiSuggestions.map((s) => ({
        task: s.task,
        type: s.type || 'output',
        priority: s.priority || 3,
        deadline: s.deadline,
        // wbsNodeIdは設定されない（新規タスクのため）
      }));

      console.log('Formatted AI suggestions:', formattedSuggestions);

      // WBSタスクを提案の先頭に追加（最大5個）
      const wbsSuggestions = incompleteWBSTasks.slice(0, 5).map((node) => ({
        task: node.name,
        type: 'output' as const,
        priority: node.estimatedHours > 8 ? 5 : node.estimatedHours > 4 ? 4 : 3,
        estimatedDuration: node.estimatedHours * 60,
        reason: `WBSタスク: ${node.description || 'プロジェクトの重要なタスク'}`,
        deadline: node.endDate,
        wbsNodeId: node.id,
        wbsNodeName: node.name,
      }));

      console.log('WBS suggestions:', wbsSuggestions);

      // WBSタスクを優先的に表示
      const allSuggestions = [...wbsSuggestions, ...formattedSuggestions];

      console.log('All suggestions combined:', allSuggestions.length);
      console.log('Suggestions breakdown:');
      console.log('- WBS tasks (with wbsNodeId):', wbsSuggestions.length);
      console.log('- AI generated tasks (without wbsNodeId):', formattedSuggestions.length);

      // 提案が少ない場合のフォールバック
      if (allSuggestions.length === 0) {
        const needsMoreOutput =
          todos.filter((t) => t.type === 'input').length >
          todos.filter((t) => t.type === 'output').length * 1.5;

        allSuggestions.push(
          {
            task: needsMoreOutput
              ? '学んだことをブログ記事やドキュメントにまとめる'
              : '新しいスキルやツールについて学習する',
            type: needsMoreOutput ? 'output' : 'input',
            priority: 4,
            estimatedDuration: 60,
            reason: needsMoreOutput
              ? 'インプットとアウトプットのバランスを改善'
              : '継続的な学習による成長',
          },
          {
            task: '週次振り返りとプランニング',
            type: 'output',
            priority: 5,
            estimatedDuration: 30,
            reason: '定期的な振り返りで生産性を向上',
          },
          {
            task: 'タスクの優先順位を見直す',
            type: 'output',
            priority: 4,
            estimatedDuration: 20,
            reason: '効率的なタスク管理の実現',
          }
        );
      }

      setSuggestions(allSuggestions);
      setSelectedSuggestions(new Set());
      toast.success(
        `${allSuggestions.length}個の提案を生成しました（WBS: ${wbsSuggestions.length}個）`
      );
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast.error('提案の生成に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [todos, wbsNodes]);

  React.useEffect(() => {
    if (open && suggestions.length === 0) {
      generateSuggestions();
    }
  }, [open, suggestions.length, generateSuggestions]);

  const toggleSelection = (index: number) => {
    const newSelection = new Set(selectedSuggestions);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedSuggestions(newSelection);
  };

  const addSelectedTasks = async () => {
    const tasksToAdd = Array.from(selectedSuggestions).map((index) => suggestions[index]);

    if (tasksToAdd.length === 0) {
      toast.error('追加するタスクを選択してください');
      return;
    }

    const currentUserId = effectiveUser?._id || effectiveUser?.uid || 'dev-user';

    try {
      for (const suggestion of tasksToAdd) {
        // TodoListに追加
        console.log('Adding task to TodoList:', suggestion.task);
        const addedTodo = await dispatch(
          addTodoItem({
            task: suggestion.task,
            type: suggestion.type,
            priority: suggestion.priority,
            isPrioritized: suggestion.priority >= 4,
            deadline: suggestion.deadline,
          })
        ).unwrap();
        console.log('Task added to TodoList:', addedTodo);

        // WBS追加条件の詳細ログ
        console.log('=== WBS Addition Debug Info ===');
        console.log('suggestion.wbsNodeId:', suggestion.wbsNodeId);
        console.log('selectedProject:', selectedProject);
        console.log('autoAddToWBS:', autoAddToWBS);
        console.log('Will add to WBS:', !suggestion.wbsNodeId && selectedProject && autoAddToWBS);

        // WBSへの追加処理（autoAddToWBSフラグをチェック）
        if (!suggestion.wbsNodeId && selectedProject && autoAddToWBS) {
          console.log('Attempting to add task to WBS...');
          console.log('Selected project:', selectedProject);
          console.log('User:', effectiveUser);
          console.log('Using user ID:', currentUserId);

          const wbsNode: Partial<WBSNode> = {
            projectId: selectedProject.id,
            parentId: null,
            name: suggestion.task,
            description: `AI提案タスク: ${suggestion.reason || ''}`,
            level: 1,
            orderIndex: wbsNodes.length,
            startDate: new Date().toISOString(),
            endDate:
              suggestion.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            duration: suggestion.estimatedDuration
              ? Math.ceil(suggestion.estimatedDuration / 60 / 24)
              : 7,
            progress: 0,
            status: 'not-started' as const,
            assignees: [currentUserId],
            dependencies: [],
            estimatedHours: suggestion.estimatedDuration
              ? Math.ceil(suggestion.estimatedDuration / 60)
              : 8,
            actualHours: 0,
            budget: 0,
            actualCost: 0,
            deliverables: [],
            risks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: currentUserId,
            // 追加: タスクタイプに応じた色とアイコン
            color: suggestion.type === 'output' ? '#3b82f6' : '#10b981',
            icon: suggestion.type === 'output' ? '📤' : '📥',
          };

          console.log('WBS Node to create:', JSON.stringify(wbsNode, null, 2));

          try {
            console.log('Creating WBS node via API...');
            console.log('Calling WBSService.createNode with:', {
              wbsNode: wbsNode,
              userId: currentUserId,
            });

            const createdNode = await WBSService.createNode(wbsNode, currentUserId);
            console.log('WBS node created successfully!');
            console.log('Created node ID:', createdNode);

            // ノードリストを更新して画面に反映
            const newNode: WBSNode = {
              ...(wbsNode as WBSNode),
              id: createdNode, // createdNode is the ID string
            };
            console.log('New node object:', newNode);

            setWbsNodes((prev) => {
              console.log('Previous nodes count:', prev.length);
              const updated = [...prev, newNode];
              console.log('Updated nodes count:', updated.length);
              return updated;
            });

            toast.success(`タスク「${suggestion.task}」をWBSに追加しました`);
          } catch (error) {
            console.error('Failed to add task to WBS:', error);
            console.error('Error type:', error?.constructor?.name);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

            // エラーの詳細をログ出力
            if (error instanceof Error) {
              console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
              });
            } else {
              console.error('Unknown error type:', error);
            }

            toast.error('WBSへの追加に失敗しました。もう一度お試しください。');
          }
        } else {
          console.log('Skipping WBS addition for this task');
          if (suggestion.wbsNodeId) {
            console.log('Reason: Task already has WBS node ID');
          } else if (!selectedProject) {
            console.log('Reason: No project selected');
          } else if (!autoAddToWBS) {
            console.log('Reason: Auto add to WBS is disabled');
          }
        }
        console.log('=== End WBS Addition Debug Info ===\n');
      }

      toast.success(`${tasksToAdd.length}個のタスクを追加しました`);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add tasks:', error);
      toast.error('タスクの追加に失敗しました');
    }
  };

  const getTypeIcon = (type: 'input' | 'output') => {
    return type === 'output' ? '🚀' : '📚';
  };

  const getPriorityBadgeVariant = (priority: number): 'destructive' | 'secondary' | 'outline' => {
    if (priority >= 4) return 'destructive';
    if (priority >= 3) return 'secondary';
    return 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI タスク提案
          </DialogTitle>
          <DialogDescription>
            あなたの作業履歴とWBSタスクに基づいて、次に取り組むべきタスクを提案します
          </DialogDescription>
        </DialogHeader>

        {wbsProjects.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              連携プロジェクト: {wbsNodes.length}個のタスク
            </span>
            <select
              aria-label="WBSプロジェクト選択"
              value={selectedProject?.id || ''}
              onChange={async (e) => {
                const project = wbsProjects.find((p) => p.id === e.target.value);
                setSelectedProject(project || null);
                if (project) {
                  const nodes = await WBSService.getProjectNodes(project.id);
                  setWbsNodes(nodes);
                }
              }}
              className="text-sm border rounded px-2 py-1"
            >
              {wbsProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>提案を生成中です...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className={cn(
                    'p-4 cursor-pointer transition-all',
                    selectedSuggestions.has(index)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => toggleSelection(index)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.has(index)}
                      onChange={() => toggleSelection(index)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`選択: ${suggestion.task}`}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                        <h4 className="font-medium">{suggestion.task}</h4>
                        {suggestion.wbsNodeId && (
                          <Badge variant="outline" className="text-xs">
                            <GitBranch className="h-3 w-3 mr-1" />
                            WBS
                          </Badge>
                        )}
                      </div>

                      {suggestion.reason && (
                        <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                      )}

                      {/* タスクの種類を明示的に表示 */}
                      {!suggestion.wbsNodeId && (
                        <p className="text-xs text-blue-600 mb-2">
                          💡 AI生成タスク（WBSに新規追加されます）
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getPriorityBadgeVariant(suggestion.priority)}>
                          優先度 {suggestion.priority}
                        </Badge>

                        {suggestion.estimatedDuration && (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {suggestion.estimatedDuration}分
                          </Badge>
                        )}

                        {suggestion.deadline && (
                          <Badge variant="outline">
                            <Target className="h-3 w-3 mr-1" />
                            {new Date(suggestion.deadline).toLocaleDateString('ja-JP')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={generateSuggestions} disabled={loading} size="sm">
              <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
              再生成
            </Button>

            {selectedProject && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-add-to-wbs"
                  checked={autoAddToWBS}
                  onCheckedChange={(checked) => setAutoAddToWBS(checked as boolean)}
                />
                <label
                  htmlFor="auto-add-to-wbs"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  WBSに自動追加
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button onClick={addSelectedTasks} disabled={selectedSuggestions.size === 0}>
              <Plus className="h-4 w-4 mr-2" />
              {selectedSuggestions.size > 0
                ? `${selectedSuggestions.size}個のタスクを追加`
                : 'タスクを選択してください'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
