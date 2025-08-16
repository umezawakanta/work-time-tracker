import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  GripVertical,
  MoreHorizontal,
  Edit3,
  Trash2,
  Flag,
  Calendar,
  Clock,
  Tag,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  X,
  Brain,
  Loader2,
  Plus,
  CheckSquare,
  ListTodo,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { TodoItem as Todo } from '@/types';
import { RateLimitedTaskAnalyzer } from '@/services/RateLimitedTaskAnalyzer';
import { AppDispatch } from '@/store';
import { addTodoItem } from '@/store/todoSlice';
import { SubTask } from '@/services/GeminiService';
import TodoWBSIntegrationService from '@/services/integration/TodoWBSIntegrationService';
import { useAuth } from '@/hooks/useAuth';

interface TodoItemProps {
  readonly todo: TodoItem;
  readonly onToggle?: (todo: TodoItem) => Promise<void> | void;
  readonly onToggleComplete?: (todoId: string) => Promise<void> | void;
  readonly onDelete: (todoId: string) => Promise<void>;
  readonly onUpdate: (todoId: string, updates: Partial<TodoItem>) => Promise<void>;
  readonly isPremium?: boolean;
  readonly dragHandleProps?: Record<string, unknown> | null;
  readonly isHighPriority?: boolean;
  readonly isCompleted?: boolean;
}

const PRIORITY_CONFIG: Record<number, { color: string; label: string }> = {
  5: { color: 'text-red-500', label: '最高' },
  4: { color: 'text-orange-500', label: '高' },
  3: { color: 'text-blue-500', label: '普通' },
  2: { color: 'text-green-500', label: '低' },
  1: { color: 'text-gray-500', label: '最低' },
};

/**
 * Todo Item Component
 * Individual task item with advanced features and interactions
 */
export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onToggleComplete,
  onDelete,
  onUpdate,
  isPremium = false,
  dragHandleProps,
  isHighPriority = false,
  isCompleted = false,
}) => {
  // 安全性チェック: todoオブジェクトの検証
  if (!todo || !todo._id || (!todo.task && todo.task !== '')) {
    console.warn('TodoItem: Invalid todo object', todo);
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">エラー: 無効なタスクデータです</p>
      </div>
    );
  }

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isAIAnalysisDialogOpen, setIsAIAnalysisDialogOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    description?: string;
    category?: string;
    tags?: string[];
    estimatedDuration?: number;
    deadline?: string;
    confidence?: number;
    improvedTitle?: string;
    subtasks?: SubTask[];
    actionItems?: string[];
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState<{
    text: string;
    type: 'input' | 'output';
    priority: number;
    deadline?: Date;
    category?: string;
    tags?: string;
    estimatedDuration?: number;
  }>({
    text: todo.task,
    type: todo.type,
    priority: todo.priority,
    deadline: todo.deadline ? new Date(todo.deadline) : undefined,
    category: todo.category || '',
    tags: todo.tags?.join(', ') || '',
    estimatedDuration: todo.estimatedDuration || undefined,
  });

  const handleToggle = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const identifiable = todo as unknown as { _id?: string; id?: string };
      const todoId = identifiable._id ?? identifiable.id;

      if (onToggle) {
        await onToggle(todo);
      } else if (onToggleComplete && todoId) {
        await onToggleComplete(todoId);
      }
    } finally {
      setIsLoading(false);
    }
  }, [todo, onToggle, onToggleComplete, isLoading]);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    const todoId = todo._id || todo._id || todo.id;
    if (!todoId) {
      toast.error('削除対象のタスクIDが見つかりません');
      return;
    }

    setIsLoading(true);
    try {
      await onDelete(todoId);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [todo._id, todo._id || todo.id, onDelete, isLoading]);

  const handleEdit = useCallback((): void => {
    // Reset form data when opening
    setEditFormData({
      text: todo.task,
      type: todo.type,
      priority: todo.priority,
      deadline: todo.deadline ? new Date(todo.deadline) : undefined,
      category: todo.category || '',
      tags: todo.tags?.join(', ') || '',
      estimatedDuration: todo.estimatedDuration || undefined,
    });
    setIsEditDialogOpen(true);
  }, [todo]);

  const handleSaveEdit = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const updates: Partial<Todo> = {
        text: editFormData.text,
        type: editFormData.type,
        priority: editFormData.priority,
        deadline: editFormData.deadline?.toISOString(),
        category: editFormData.category || undefined,
        tags: editFormData.tags
          ? editFormData.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
        estimatedDuration: editFormData.estimatedDuration || undefined,
      };

      await onUpdate(todo._id || todo.id, updates);
      setIsEditDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [todo._id || todo.id, editFormData, onUpdate, isLoading]);

  const formatDeadline = (deadline: string): string => {
    const date = new Date(deadline);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '期限切れ';
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '明日';
    if (diffDays <= 7) return `${diffDays}日後`;

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = todo.deadline && new Date(todo.deadline) < new Date();
  const isToday =
    todo.deadline && new Date(todo.deadline).toDateString() === new Date().toDateString();

  const priorityConfig =
    PRIORITY_CONFIG[(todo as unknown as { priority: number }).priority] || PRIORITY_CONFIG[3];

  const cardClassName = [
    'group relative transition-all duration-200 hover:shadow-md bg-white',
    isCompleted ? 'opacity-60 bg-gray-50' : '',
    isHighPriority ? 'border-l-4 border-l-red-500 bg-red-50/50' : '',
    isOverdue && !isCompleted ? 'border-l-4 border-l-red-500 bg-red-50' : '',
    isToday && !isCompleted ? 'border-l-4 border-l-orange-500 bg-orange-50' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // AI分析ハンドラー
  const handleAIAnalysis = useCallback(async (): Promise<void> => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setIsAIAnalysisDialogOpen(true);
    setAiAnalysisResult(null);

    try {
      // 完全な分析を実行
      const result = await RateLimitedTaskAnalyzer.analyzeComplete(todo.task);

      // 詳細分析結果を設定（新しいフィールドも含む）
      if (result.detailAnalysis) {
        setAiAnalysisResult({
          description: result.detailAnalysis.description,
          category: result.detailAnalysis.category,
          tags: result.detailAnalysis.tags,
          estimatedDuration: result.detailAnalysis.estimatedDuration,
          deadline: result.detailAnalysis.deadline || undefined,
          confidence: result.detailAnalysis.confidence,
          improvedTitle: result.detailAnalysis.improvedTitle,
          subtasks: result.detailAnalysis.subtasks,
          actionItems: result.detailAnalysis.actionItems,
        });
      }
    } catch (error) {
      console.error('AI分析エラー:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [todo.task, isAnalyzing]);

  // AI分析結果を保存（拡張版）
  const handleSaveAIAnalysis = useCallback(async (): Promise<void> => {
    if (!aiAnalysisResult || isLoading) return;

    setIsLoading(true);
    try {
      const updates: Partial<Todo> = {
        text: aiAnalysisResult.improvedTitle || todo.task,
        category: aiAnalysisResult.category || 'サイト開発',
        tags: aiAnalysisResult.tags ? [...aiAnalysisResult.tags] : undefined,
        estimatedDuration: aiAnalysisResult.estimatedDuration,
        deadline: aiAnalysisResult.deadline,
      };

      await onUpdate(todo._id || todo.id, updates);

      // 成功時のフィードバック
      const updatedItems = [];
      if (aiAnalysisResult.improvedTitle && aiAnalysisResult.improvedTitle !== todo.task) {
        updatedItems.push('タイトル');
      }
      if (aiAnalysisResult.category) updatedItems.push('カテゴリ');
      if (aiAnalysisResult.tags?.length) updatedItems.push('タグ');
      if (aiAnalysisResult.estimatedDuration) updatedItems.push('推定時間');
      if (aiAnalysisResult.deadline) updatedItems.push('期限');

      toast.success(`${updatedItems.join('、')}を更新しました`);
      setIsAIAnalysisDialogOpen(false);
    } catch (error) {
      console.error('AI分析結果の適用エラー:', error);
      toast.error('更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [
    todo._id || todo.id,
    todo.task,
    todo.category,
    todo.tags,
    todo.estimatedDuration,
    todo.deadline,
    aiAnalysisResult,
    onUpdate,
    isLoading,
  ]);

  // 子タスクを作成する関数を修正
  const handleCreateSubtasks = useCallback(async (): Promise<void> => {
    if (!aiAnalysisResult?.subtasks || isLoading) return;

    setIsLoading(true);
    try {
      // 各子タスクを新しいTodoとして作成
      for (const subtask of aiAnalysisResult.subtasks) {
        const newTodo = {
          task: subtask.title,
          type: subtask.type,
          priority: todo.priority, // 親タスクの優先度を継承
          isPrioritized: false,
          estimatedDuration: subtask.estimatedDuration,
          category: aiAnalysisResult.category || todo.category,
          tags: aiAnalysisResult.tags || todo.tags,
          // 親タスクへの参照を説明に含める
          description: `${subtask.description || ''} (親タスク: ${todo.task})`,
        };

        // TodoListに追加
        const result = await dispatch(addTodoItem(newTodo)).unwrap();

        // WBSに連携（サイト開発関連のタスクの場合）
        if (user && result) {
          try {
            await TodoWBSIntegrationService.handleTodoCreation(
              {
                ...result,
                updatedAt: new Date().toISOString(),
                type: result.type || 'output',
                createdAt: result.createdAt || new Date().toISOString(),
              },
              user.uid || 'dev-user'
            );
          } catch (error) {
            console.error('WBS連携エラー:', error);
            // WBS連携が失敗してもTodo作成は成功とする
          }
        }
      }

      // 親タスクを完了状態にするか確認
      const shouldCompleteParent = window.confirm(
        '子タスクを作成しました。親タスクを完了にしますか？'
      );

      if (shouldCompleteParent) {
        await onToggle(todo);
        // 親タスクの完了もWBSに同期
        if (user) {
          await TodoWBSIntegrationService.syncTodoToWBS({
            _id: todo._id || todo.id,
            task: todo.task,
            completed: true,
            priority: todo.priority,
            type: todo.type,
            completedDate: new Date().toISOString(),
            isPrioritized: todo.isPrioritized,
            createdAt: todo.createdAt,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      setIsAIAnalysisDialogOpen(false);
      toast.success(`${aiAnalysisResult.subtasks.length}個の子タスクを作成しました`);
    } catch (error) {
      console.error('子タスク作成エラー:', error);
      toast.error('子タスクの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [aiAnalysisResult, todo, dispatch, onToggle, isLoading, user]);

  // タスクテキストが長いかどうかを判定する関数
  const isLongText = (text: string | undefined | null): boolean => {
    if (!text || typeof text !== 'string') return false;
    return text.length > 100 || text.includes('\n');
  };

  // タスクテキストの最初の部分を取得する関数
  const getTruncatedText = (text: string | undefined | null, maxLength: number = 100): string => {
    if (!text || typeof text !== 'string') return '';
    const firstLine = text.split('\n')[0];
    if (firstLine.length > maxLength) {
      return firstLine.substring(0, maxLength) + '...';
    }
    return firstLine + (text.includes('\n') ? '...' : '');
  };

  return (
    <>
      <Card role="article" data-testid="todo-item" className={cardClassName}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            {dragHandleProps && (
              <div
                {...dragHandleProps}
                className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            )}

            {/* Checkbox */}
            <div className="flex-shrink-0 pt-0.5">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={handleToggle}
                disabled={isLoading}
                className="h-5 w-5"
                aria-label={`タスク「${todo.task}」の完了を切り替え`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Task Text */}
                  <div>
                    <h4
                      className={`font-medium text-sm leading-tight ${
                        todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {isExpanded || !isLongText(todo.task)
                        ? todo.task
                        : getTruncatedText(todo.task)}
                    </h4>

                    {todo.description && (
                      <p className="mt-1 text-xs text-gray-600">{todo.description}</p>
                    )}

                    {/* 展開/折りたたみボタン */}
                    {isLongText(todo.task) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-6 px-2 mt-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            折りたたむ
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            詳細を表示
                          </>
                        )}
                      </Button>
                    )}

                    {/* 詳細説明エリア（展開時のみ表示） */}
                    {isExpanded && isLongText(todo.task) && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{todo.task}</p>
                      </div>
                    )}
                  </div>

                  {/* Meta Information */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Type Badge */}
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        todo.type === 'input'
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-orange-100 text-orange-700 border-orange-300'
                      }`}
                    >
                      {todo.type === 'input' ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {todo.type === 'input' ? 'インプット' : 'アウトプット'}
                    </Badge>

                    {/* Priority Badge */}
                    {typeof (todo as any).priority === 'number' ? (
                      (todo as any).priority > 3 && (
                        <Badge variant="outline" className="text-xs">
                          <Flag className={`h-3 w-3 mr-1 ${priorityConfig.color}`} />
                          {priorityConfig.label}
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {(todo as any).priority}
                      </Badge>
                    )}

                    {/* Priority Mark */}
                    {todo.isPrioritized && (
                      <Badge variant="destructive" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        重要
                      </Badge>
                    )}

                    {/* Deadline */}
                    {todo.deadline && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          isOverdue
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : isToday
                              ? 'bg-orange-100 text-orange-700 border-orange-300'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDeadline(todo.deadline)}{' '}
                        {new Date(todo.deadline).toISOString().slice(0, 4)}
                      </Badge>
                    )}

                    {/* Estimated Duration */}
                    {todo.estimatedDuration && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-purple-100 text-purple-700 border-purple-300"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {todo.estimatedDuration}分
                      </Badge>
                    )}

                    {/* Category */}
                    {todo.category && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-100 text-green-700 border-green-300"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {todo.category}
                      </Badge>
                    )}
                  </div>

                  {/* Tags */}
                  {todo.tags && todo.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {todo.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {todo.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                          +{todo.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Completion Time */}
                  {todo.completed && todo.completedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      完了:{' '}
                      {new Date(todo.completedAt).toLocaleString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="more"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleEdit} aria-label="edit" role="menuitem">
                      <Edit3 className="h-4 w-4 mr-2" />
                      編集
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleAIAnalysis}
                      aria-label="analyze"
                      role="menuitem"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      タスク分析
                    </DropdownMenuItem>

                    {!todo.isPrioritized && (
                      <DropdownMenuItem
                        onClick={() => onUpdate(todo._id || todo.id, { isPrioritized: true })}
                        aria-label="prioritize"
                        role="menuitem"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        重要タスクにする
                      </DropdownMenuItem>
                    )}

                    {todo.isPrioritized && (
                      <DropdownMenuItem
                        onClick={() => onUpdate(todo._id || todo.id, { isPrioritized: false })}
                        aria-label="unprioritize"
                        role="menuitem"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        重要タスクを解除
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-red-600 focus:text-red-600"
                      aria-label="delete"
                      role="menuitem"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog for tests */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
            <DialogDescription>Are you sure you want to delete this task?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              aria-label="cancel"
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} aria-label="confirm">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>タスクを編集</DialogTitle>
            <DialogDescription>タスクの詳細を編集してください。</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Task Text */}
            <div className="grid gap-2">
              <Label htmlFor="edit-text">タスク内容</Label>
              <Textarea
                id="edit-text"
                value={editFormData.text}
                onChange={(e) => setEditFormData({ ...editFormData, text: e.target.value })}
                placeholder="タスクの内容を入力...&#10;複数行で詳細な説明を追加できます"
                className="min-h-[120px] resize-y"
              />
              <p className="text-xs text-gray-500">
                Shift+Enterで改行、詳細な説明を含めることができます
              </p>
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">タイプ</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value: 'input' | 'output') =>
                    setEditFormData({ ...editFormData, type: value })
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="input">
                      <div className="flex items-center">
                        <TrendingDown className="h-4 w-4 mr-2" />
                        インプット
                      </div>
                    </SelectItem>
                    <SelectItem value="output">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        アウトプット
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-priority">優先度</Label>
                <Select
                  value={editFormData.priority.toString()}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, priority: parseInt(value) })
                  }
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center">
                          <Flag className={`h-4 w-4 mr-2 ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deadline */}
            <div className="grid gap-2">
              <Label htmlFor="edit-deadline">期限</Label>
              <div className="flex gap-2">
                <DatePicker
                  date={editFormData.deadline}
                  setDate={(date) => setEditFormData({ ...editFormData, deadline: date })}
                />
                {editFormData.deadline && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditFormData({ ...editFormData, deadline: undefined })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Premium Fields */}
            <>
              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="edit-category">カテゴリ</Label>
                <Input
                  id="edit-category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  placeholder="例: 仕事、勉強、趣味"
                />
              </div>

              {/* Estimated Duration */}
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">推定時間（分）</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editFormData.estimatedDuration || ''}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      estimatedDuration: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="例: 30"
                  min="1"
                />
              </div>

              {/* Tags */}
              <div className="grid gap-2">
                <Label htmlFor="edit-tags">タグ（カンマ区切り）</Label>
                <Input
                  id="edit-tags"
                  value={editFormData.tags}
                  onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                  placeholder="例: 重要, 月次レポート, 会議"
                />
              </div>
            </>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI分析ダイアログ（拡張版） */}
      <Dialog open={isAIAnalysisDialogOpen} onOpenChange={setIsAIAnalysisDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI分析結果</DialogTitle>
            <DialogDescription>AIがタスクを分析し、詳細情報を抽出しました。</DialogDescription>
          </DialogHeader>

          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">分析中...</span>
            </div>
          ) : aiAnalysisResult ? (
            <div className="grid gap-4 py-4">
              {/* 分析結果の信頼度 */}
              {aiAnalysisResult.confidence !== undefined && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">分析の信頼度</span>
                  <Badge variant={aiAnalysisResult.confidence > 0.7 ? 'default' : 'secondary'}>
                    {Math.round(aiAnalysisResult.confidence * 100)}%
                  </Badge>
                </div>
              )}

              {/* 改善されたタイトル */}
              {aiAnalysisResult.improvedTitle && aiAnalysisResult.improvedTitle !== todo.task && (
                <div className="grid gap-2">
                  <Label>改善されたタスクタイトル</Label>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">
                      {aiAnalysisResult.improvedTitle}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      より具体的で実行可能なタイトルに改善されました
                    </p>
                  </div>
                </div>
              )}

              {/* タスクの説明 */}
              {aiAnalysisResult.description && (
                <div className="grid gap-2">
                  <Label>タスクの詳細説明</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{aiAnalysisResult.description}</p>
                  </div>
                </div>
              )}

              {/* 子タスク */}
              {aiAnalysisResult.subtasks && aiAnalysisResult.subtasks.length > 0 && (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4" />
                      推奨される子タスク
                    </Label>
                    <Badge variant="outline">{aiAnalysisResult.subtasks.length}個</Badge>
                  </div>
                  <div className="space-y-2">
                    {aiAnalysisResult.subtasks.map((subtask, index) => (
                      <div
                        key={`${subtask.title}-${subtask.type}-${index}`}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start gap-2">
                          <CheckSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{subtask.title}</p>
                            {subtask.description && (
                              <p className="text-xs text-gray-600 mt-1">{subtask.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  subtask.type === 'input'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {subtask.type === 'input' ? 'インプット' : 'アウトプット'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {subtask.estimatedDuration}分
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* アクションアイテム */}
              {aiAnalysisResult.actionItems && aiAnalysisResult.actionItems.length > 0 && (
                <div className="grid gap-2">
                  <Label>具体的なアクションアイテム</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <ul className="space-y-1">
                      {aiAnalysisResult.actionItems.map((item, index) => (
                        <li key={`${item}-${index}`} className="text-sm flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* カテゴリ */}
              {aiAnalysisResult.category && (
                <div className="grid gap-2">
                  <Label>カテゴリ</Label>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700 border-green-300"
                    >
                      {aiAnalysisResult.category}
                    </Badge>
                  </div>
                </div>
              )}

              {/* タグ */}
              {aiAnalysisResult.tags && aiAnalysisResult.tags.length > 0 && (
                <div className="grid gap-2">
                  <Label>推奨タグ</Label>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysisResult.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 推定所要時間 */}
              {aiAnalysisResult.estimatedDuration && (
                <div className="grid gap-2">
                  <Label>推定所要時間</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-700 border-purple-300"
                    >
                      {aiAnalysisResult.estimatedDuration}分
                    </Badge>
                  </div>
                </div>
              )}

              {/* 推奨期限 */}
              {aiAnalysisResult.deadline && (
                <div className="grid gap-2">
                  <Label>推奨期限</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-700 border-orange-300"
                    >
                      {new Date(aiAnalysisResult.deadline).toLocaleDateString('ja-JP')}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">分析結果を取得できませんでした</div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAIAnalysisDialogOpen(false)}
              disabled={isLoading}
            >
              閉じる
            </Button>
            {aiAnalysisResult?.subtasks && aiAnalysisResult.subtasks.length > 0 && (
              <Button
                onClick={handleCreateSubtasks}
                disabled={isLoading || isAnalyzing}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                子タスクを作成
              </Button>
            )}
            {aiAnalysisResult && (
              <Button onClick={handleSaveAIAnalysis} disabled={isLoading || isAnalyzing}>
                分析結果を適用
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
