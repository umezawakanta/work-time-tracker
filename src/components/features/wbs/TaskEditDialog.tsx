import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import {
  Brain,
  Save,
  X,
  Plus,
  Trash,
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  Package,
  Users,
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  FileText,
  Lightbulb,
  Settings2,
  StopCircle,
  Edit3,
  Eye,
} from 'lucide-react';
import { WBSNode, WBSRisk } from '@/types/wbs';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import TaskExecutionAIService from '@/services/ai/TaskExecutionAIService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import KnowledgeService from '@/services/knowledge/KnowledgeService';

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: WBSNode | null;
  onSave: (nodeId: string, updates: Partial<WBSNode>) => Promise<void>;
  onDelete?: (nodeId: string) => Promise<void>;
  onAIAnalyze?: (task: WBSNode) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  open,
  onOpenChange,
  task,
  onSave,
  onDelete,
  onAIAnalyze,
}) => {
  // フォームの状態管理
  const [formData, setFormData] = useState<Partial<WBSNode>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newRisk, setNewRisk] = useState<Partial<WBSRisk>>({
    description: '',
    probability: 'medium',
    impact: 'medium',
    mitigation: '',
    owner: '',
  });
  const [canExecuteWithAI, setCanExecuteWithAI] = useState(false);
  const [executingAI, setExecutingAI] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // AI実行関連の新しい状態
  const [showAIConfirm, setShowAIConfirm] = useState(false);
  const [showAIProgress, setShowAIProgress] = useState(false);
  const [showAIResult, setShowAIResult] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiCurrentStep, setAiCurrentStep] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiExecutionId, setAiExecutionId] = useState<string | null>(null);

  // Add this missing line:
  const abortControllerRef = useRef<AbortController | null>(null);

  // AI実行オプション
  const [aiOptions, setAiOptions] = useState({
    includeResearch: true,
    generateDeliverables: true,
    createSubtasks: false,
    updateProgress: true,
    autoComplete: false,
  });

  const { toast } = useToast();

  // タスクが変更されたらフォームデータを更新（最適化）
  useEffect(() => {
    if (task && open) {
      // openの時のみ実行
      setFormData({
        name: task.name,
        description: task.description,
        status: task.status,
        startDate: task.startDate,
        endDate: task.endDate,
        progress: task.progress,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        budget: task.budget,
        actualCost: task.actualCost,
        deliverables: [...(task.deliverables || [])],
        risks: [...(task.risks || [])],
        color: task.color,
        icon: task.icon,
      });
    }
  }, [task?.id, open]); // task全体ではなくidのみ監視

  // AI実行可能チェック（最適化）
  useEffect(() => {
    let isMounted = true;

    const checkAIExecutability = async () => {
      if (task && open && isMounted) {
        try {
          const canExecute = await TaskExecutionAIService.canExecuteTask(task);
          if (isMounted) {
            setCanExecuteWithAI(canExecute);
          }
        } catch (error) {
          console.error('AI実行可能性チェックエラー:', error);
        }
      }
    };

    checkAIExecutability();

    return () => {
      isMounted = false;
    };
  }, [task?.id, open]); // task全体ではなくidのみ監視

  // フォームフィールドの更新（メモ化）
  const updateField = useCallback((field: keyof WBSNode, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 成果物の追加（メモ化）
  const addDeliverable = useCallback(() => {
    if (newDeliverable.trim()) {
      updateField('deliverables', [...(formData.deliverables || []), newDeliverable.trim()]);
      setNewDeliverable('');
    }
  }, [newDeliverable, formData.deliverables, updateField]);

  // 成果物の削除（メモ化）
  const removeDeliverable = useCallback(
    (index: number) => {
      const updated = [...(formData.deliverables || [])];
      updated.splice(index, 1);
      updateField('deliverables', updated);
    },
    [formData.deliverables, updateField]
  );

  // リスクの追加（メモ化）
  const addRisk = useCallback(() => {
    if (newRisk.description?.trim()) {
      const risk: WBSRisk = {
        id: `risk-${Date.now()}`,
        description: newRisk.description,
        probability: newRisk.probability as 'low' | 'medium' | 'high',
        impact: newRisk.impact as 'low' | 'medium' | 'high',
        mitigation: newRisk.mitigation || '',
        owner: newRisk.owner || '',
      };
      updateField('risks', [...(formData.risks || []), risk]);
      setNewRisk({
        description: '',
        probability: 'medium',
        impact: 'medium',
        mitigation: '',
        owner: '',
      });
    }
  }, [newRisk, formData.risks, updateField]);

  // リスクの削除（メモ化）
  const removeRisk = useCallback(
    (riskId: string) => {
      const updated = (formData.risks || []).filter((r) => r.id !== riskId);
      updateField('risks', updated);
    },
    [formData.risks, updateField]
  );

  // 保存処理（メモ化）
  const handleSave = useCallback(async () => {
    if (!task) return;

    setSaving(true);
    try {
      await onSave(task.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('保存エラー:', error);
      toast({
        variant: 'destructive',
        title: '保存エラー',
        description: '保存中にエラーが発生しました。',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  }, [task, formData, onSave, onOpenChange, toast]);

  // AI実行確認処理（メモ化）
  const handleAIExecuteConfirm = useCallback(() => {
    setShowAIConfirm(true);
  }, []);

  // AI実行メイン処理（メモ化）
  const handleAIExecute = useCallback(async () => {
    if (!task) return;

    console.log('AI実行開始:', task.name);
    setShowAIConfirm(false);
    setShowAIProgress(true);
    setExecutingAI(true);
    setAiProgress(0);
    setAiCurrentStep('AI実行の準備中...');

    // AbortControllerを作成してキャンセル機能を有効化
    abortControllerRef.current = new AbortController();
    const executionId = `ai-exec-${Date.now()}`;
    setAiExecutionId(executionId);

    try {
      // Step 1: タスク分析
      setAiCurrentStep('タスクを分析中...');
      setAiProgress(20);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('実行がキャンセルされました');
      }

      // Step 2: AI実行
      setAiCurrentStep('AIでタスクを実行中...');
      setAiProgress(50);

      console.log('TaskExecutionAIService.executeTask実行中...');
      const result = await TaskExecutionAIService.executeTask(task);
      console.log('AI実行結果:', result);

      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('実行がキャンセルされました');
      }

      // Step 3: 結果処理
      setAiCurrentStep('実行結果を処理中...');
      setAiProgress(80);

      if (result.success) {
        console.log('AI実行成功、結果を処理中...');
        const enhancedResult = await processAIResult(result, task);
        console.log('拡張結果:', enhancedResult);
        setAiResult(enhancedResult);

        setAiCurrentStep('完了');
        setAiProgress(100);

        toast({
          title: 'AI実行完了',
          description: `「${task.name}」のAI実行が正常に完了しました。${result.knowledgeEntries ? result.knowledgeEntries.length + '件のナレッジエントリーを作成しました。' : ''}`,
          duration: 5000,
        });

        setShowAIProgress(false);
        setShowAIResult(true);
      } else {
        throw new Error(result.error || 'AI実行に失敗しました');
      }
    } catch (error: any) {
      console.error('AI実行エラー:', error);
      setShowAIProgress(false);

      toast({
        variant: 'destructive',
        title: 'AI実行エラー',
        description: error.message || 'AI実行中にエラーが発生しました',
        duration: 8000,
      });
    } finally {
      setExecutingAI(false);
      setAiExecutionId(null);
      abortControllerRef.current = null;
    }
  }, [task, aiOptions, formData, toast]);

  // AI実行結果の処理（メモ化）
  const processAIResult = useCallback(
    async (result: any, task: WBSNode) => {
      console.log('AI実行結果を処理中:', result);

      const enhancements: any = {
        originalResult: result,
        suggestedUpdates: {},
        confidence: 0.85,
        timestamp: new Date().toISOString(),
      };

      // 成果物の生成
      const newDeliverables = [...(formData.deliverables || [])];

      if (
        aiOptions.generateDeliverables &&
        result.knowledgeEntries &&
        result.knowledgeEntries.length > 0
      ) {
        console.log('ナレッジエントリーから成果物を生成:', result.knowledgeEntries);

        // ナレッジエントリーのリンクを成果物として追加
        for (const entry of result.knowledgeEntries) {
          const knowledgeUrl = KnowledgeService.generateKnowledgeUrl(entry.id);
          const deliverableText = `📚 ${entry.term} (調査結果) - ${knowledgeUrl}`;
          newDeliverables.push(deliverableText);
        }

        // メインの調査結果も成果物として追加
        if (result.result) {
          newDeliverables.push(`✅ ${task.name} - 調査完了`);
        }
      }

      enhancements.suggestedUpdates.deliverables = newDeliverables;

      if (aiOptions.updateProgress) {
        enhancements.suggestedUpdates.progress = 100;
        enhancements.suggestedUpdates.status = 'completed';
      }

      if (aiOptions.autoComplete) {
        enhancements.suggestedUpdates.actualHours = formData.estimatedHours || 1;
      }

      console.log('生成された成果物:', enhancements.suggestedUpdates.deliverables);
      return enhancements;
    },
    [aiOptions, formData.deliverables, formData.estimatedHours]
  );

  // AI実行のキャンセル（メモ化）
  const handleAICancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setShowAIProgress(false);
      setExecutingAI(false);

      toast({
        title: 'AI実行キャンセル',
        description: 'AI実行がキャンセルされました。',
        duration: 3000,
      });
    }
  }, [toast]);

  // AI実行結果の適用（メモ化）
  const handleApplyAIResult = useCallback(async () => {
    if (!task || !aiResult?.suggestedUpdates) return;

    try {
      await onSave(task.id, aiResult.suggestedUpdates);

      toast({
        title: '変更を適用',
        description: 'AI実行結果がタスクに適用されました。',
        duration: 3000,
      });

      setShowAIResult(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '適用エラー',
        description: 'AI実行結果の適用に失敗しました。',
        duration: 5000,
      });
    }
  }, [task, aiResult, onSave, onOpenChange, toast]);

  // AI分析を開く（メモ化）
  const handleAIAnalyze = useCallback(() => {
    if (task && onAIAnalyze) {
      onAIAnalyze(task);
      onOpenChange(false);
    }
  }, [task, onAIAnalyze, onOpenChange]);

  // 削除処理（メモ化）
  const handleDelete = useCallback(async () => {
    if (!task || !onDelete) return;

    setDeleting(true);
    try {
      await onDelete(task.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('削除エラー:', error);
      toast({
        variant: 'destructive',
        title: '削除エラー',
        description: '削除中にエラーが発生しました。',
        duration: 5000,
      });
    } finally {
      setDeleting(false);
    }
  }, [task, onDelete, onOpenChange, toast]);

  // ダイアログを閉じる際のクリーンアップ
  useEffect(() => {
    if (!open) {
      // ダイアログが閉じられた時のクリーンアップ
      setActiveTab('basic');
      setShowAIConfirm(false);
      setShowAIProgress(false);
      setShowAIResult(false);
      setExecutingAI(false);
      setAiProgress(0);
      setAiCurrentStep('');
      setAiResult(null);

      // AI実行をキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [open]);

  // メモ化されたコンポーネントの条件付きレンダリング
  if (!task) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {task.icon && <span>{task.icon}</span>}
              タスクの編集: {task.name}
              {canExecuteWithAI && (
                <Badge variant="secondary" className="ml-2">
                  <Bot className="h-3 w-3 mr-1" />
                  AI実行可能
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>タスクの詳細情報を編集し、AI機能を活用できます。</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">基本情報</TabsTrigger>
              <TabsTrigger value="schedule">スケジュール</TabsTrigger>
              <TabsTrigger value="resources">リソース</TabsTrigger>
              <TabsTrigger value="risks">リスク・成果物</TabsTrigger>
            </TabsList>

            {/* 基本情報タブ */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">タスク名</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="タスク名を入力"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="タスクの詳細な説明を入力"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">ステータス</Label>
                <Select
                  value={formData.status || 'not-started'}
                  onValueChange={(value) => updateField('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">未着手</SelectItem>
                    <SelectItem value="in-progress">進行中</SelectItem>
                    <SelectItem value="completed">完了</SelectItem>
                    <SelectItem value="delayed">遅延</SelectItem>
                    <SelectItem value="cancelled">中止</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">進捗率: {formData.progress || 0}%</Label>
                <Slider
                  id="progress"
                  min={0}
                  max={100}
                  step={5}
                  value={[formData.progress || 0]}
                  onValueChange={(values) => updateField('progress', values[0])}
                  className="w-full"
                />
              </div>
            </TabsContent>

            {/* スケジュールタブ */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    <Calendar className="inline-block w-4 h-4 mr-2" />
                    開始日
                  </Label>
                  <DatePicker
                    date={formData.startDate ? new Date(formData.startDate) : undefined}
                    setDate={(date) => updateField('startDate', date ? date.toISOString() : '')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    <Calendar className="inline-block w-4 h-4 mr-2" />
                    終了日
                  </Label>
                  <DatePicker
                    date={formData.endDate ? new Date(formData.endDate) : undefined}
                    setDate={(date) => updateField('endDate', date ? date.toISOString() : '')}
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="p-3 bg-muted rounded-md text-sm">
                  期間:{' '}
                  {Math.ceil(
                    (new Date(formData.endDate).getTime() -
                      new Date(formData.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                  日間
                </div>
              )}
            </TabsContent>

            {/* リソースタブ */}
            <TabsContent value="resources" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">
                    <Clock className="inline-block w-4 h-4 mr-2" />
                    見積工数（時間）
                  </Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={formData.estimatedHours || 0}
                    onChange={(e) => updateField('estimatedHours', Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualHours">
                    <Clock className="inline-block w-4 h-4 mr-2" />
                    実績工数（時間）
                  </Label>
                  <Input
                    id="actualHours"
                    type="number"
                    value={formData.actualHours || 0}
                    onChange={(e) => updateField('actualHours', Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">
                    <DollarSign className="inline-block w-4 h-4 mr-2" />
                    予算
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget || 0}
                    onChange={(e) => updateField('budget', Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualCost">
                    <DollarSign className="inline-block w-4 h-4 mr-2" />
                    実績コスト
                  </Label>
                  <Input
                    id="actualCost"
                    type="number"
                    value={formData.actualCost || 0}
                    onChange={(e) => updateField('actualCost', Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              {/* 効率性の表示 */}
              {formData.estimatedHours && formData.actualHours && formData.estimatedHours > 0 && (
                <Card className="p-3 bg-muted">
                  <p className="text-sm">
                    工数効率: {Math.round((formData.actualHours / formData.estimatedHours) * 100)}%
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* リスク・成果物タブ */}
            <TabsContent value="risks" className="space-y-4">
              {/* 成果物 */}
              <div className="space-y-2">
                <Label>
                  <Package className="inline-block w-4 h-4 mr-2" />
                  成果物
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    placeholder="成果物を追加"
                    onKeyPress={(e) => e.key === 'Enter' && addDeliverable()}
                  />
                  <Button onClick={addDeliverable} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.deliverables?.map((item, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      {item}
                      <button
                        onClick={() => removeDeliverable(index)}
                        className="ml-2 hover:text-destructive"
                        aria-label="削除"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* リスク */}
              <div className="space-y-2">
                <Label>
                  <AlertCircle className="inline-block w-4 h-4 mr-2" />
                  リスク
                </Label>
                <Card className="p-4 space-y-3">
                  <Input
                    value={newRisk.description}
                    onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                    placeholder="リスクの説明"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={newRisk.probability}
                      onValueChange={(value) =>
                        setNewRisk({ ...newRisk, probability: value as 'low' | 'medium' | 'high' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="発生確率" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">低</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={newRisk.impact}
                      onValueChange={(value) =>
                        setNewRisk({ ...newRisk, impact: value as 'low' | 'medium' | 'high' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="影響度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">低</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    value={newRisk.mitigation}
                    onChange={(e) => setNewRisk({ ...newRisk, mitigation: e.target.value })}
                    placeholder="対策"
                  />
                  <Button onClick={addRisk} size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    リスクを追加
                  </Button>
                </Card>

                {/* リスク一覧 */}
                <div className="space-y-2">
                  {formData.risks?.map((risk) => (
                    <Card key={risk.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{risk.description}</p>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>確率: {risk.probability}</span>
                            <span>影響: {risk.impact}</span>
                          </div>
                          {risk.mitigation && (
                            <p className="text-xs mt-1">対策: {risk.mitigation}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRisk(risk.id)}
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={saving || deleting || executingAI}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  削除
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              {canExecuteWithAI && (
                <Button variant="outline" onClick={handleAIExecuteConfirm} disabled={executingAI}>
                  {executingAI ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      AI実行中...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      AIで実行
                    </>
                  )}
                </Button>
              )}
              {onAIAnalyze && (
                <Button variant="outline" onClick={handleAIAnalyze}>
                  <Brain className="h-4 w-4 mr-2" />
                  AI分析
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving || executingAI}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI実行確認ダイアログ */}
      <AlertDialog open={showAIConfirm} onOpenChange={setShowAIConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              AI実行の確認
            </AlertDialogTitle>
            <AlertDialogDescription>「{task?.name}」をAIで実行しますか？</AlertDialogDescription>
          </AlertDialogHeader>

          {/* Move complex content outside AlertDialogDescription */}
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">実行オプション:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="research"
                    checked={aiOptions.includeResearch}
                    onCheckedChange={(checked) =>
                      setAiOptions((prev) => ({ ...prev, includeResearch: checked as boolean }))
                    }
                  />
                  <Label htmlFor="research" className="text-sm">
                    詳細調査を含む
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deliverables"
                    checked={aiOptions.generateDeliverables}
                    onCheckedChange={(checked) =>
                      setAiOptions((prev) => ({
                        ...prev,
                        generateDeliverables: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="deliverables" className="text-sm">
                    成果物を自動生成
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="progress"
                    checked={aiOptions.updateProgress}
                    onCheckedChange={(checked) =>
                      setAiOptions((prev) => ({ ...prev, updateProgress: checked as boolean }))
                    }
                  />
                  <Label htmlFor="progress" className="text-sm">
                    進捗を100%に更新
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="complete"
                    checked={aiOptions.autoComplete}
                    onCheckedChange={(checked) =>
                      setAiOptions((prev) => ({ ...prev, autoComplete: checked as boolean }))
                    }
                  />
                  <Label htmlFor="complete" className="text-sm">
                    自動的に完了状態にする
                  </Label>
                </div>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">注意事項:</p>
                  <div className="mt-1 space-y-1">
                    <div>• AI実行には数分かかる場合があります</div>
                    <div>• 実行結果は事前にプレビューできます</div>
                    <div>• 必要に応じて手動で調整できます</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleAIExecute}>実行開始</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI実行進捗ダイアログ */}
      <Dialog open={showAIProgress} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
              AI実行中
            </DialogTitle>
            <DialogDescription>
              AIがタスクを実行しています。しばらくお待ちください。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>進捗</span>
                <span>{aiProgress}%</span>
              </div>
              <Progress value={aiProgress} className="w-full" />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse" />
              {aiCurrentStep}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                タスク「{task?.name}」をAIが分析・実行中です。
                <br />
                調査結果はナレッジベースに保存され、成果物として追加されます。
              </p>
            </div>

            {/* 実行中の詳細情報 */}
            {aiProgress > 50 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  💡 調査対象: {task?.name || ''}
                  <br />
                  📚 ナレッジベースに保存予定
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleAICancel}>
              <StopCircle className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI実行結果プレビューダイアログ */}
      <Sheet open={showAIResult} onOpenChange={setShowAIResult}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              AI実行結果
            </SheetTitle>
            <SheetDescription>
              以下の変更内容を確認して、適用するかどうかを選択してください。
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* 実行サマリー */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium">実行サマリー</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>実行タイプ:</span>
                  <Badge variant="secondary">{aiResult?.originalResult?.executionType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>信頼度:</span>
                  <span>{Math.round((aiResult?.confidence || 0) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>実行時間:</span>
                  <span>
                    {aiResult?.timestamp
                      ? format(new Date(aiResult.timestamp), 'HH:mm:ss', { locale: ja })
                      : '-'}
                  </span>
                </div>
              </div>
            </Card>

            {/* 提案された変更 */}
            {aiResult?.suggestedUpdates && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Edit3 className="h-4 w-4 text-green-500" />
                  <h3 className="font-medium">提案された変更</h3>
                </div>
                <div className="space-y-3">
                  {aiResult.suggestedUpdates.status && (
                    <div>
                      <Label className="text-sm">ステータス</Label>
                      <div className="mt-1">
                        <Badge variant="outline">{aiResult.suggestedUpdates.status}</Badge>
                      </div>
                    </div>
                  )}

                  {aiResult.suggestedUpdates.progress && (
                    <div>
                      <Label className="text-sm">進捗率</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={aiResult.suggestedUpdates.progress} className="flex-1" />
                        <span className="text-sm">{aiResult.suggestedUpdates.progress}%</span>
                      </div>
                    </div>
                  )}

                  {aiResult.suggestedUpdates.deliverables && (
                    <div>
                      <Label className="text-sm">成果物</Label>
                      <div className="mt-1 space-y-1">
                        {aiResult.suggestedUpdates.deliverables.map(
                          (item: string, index: number) => (
                            <Badge key={index} variant="secondary" className="mr-1 mb-1">
                              {item}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* AI生成コンテンツ */}
            {aiResult?.originalResult?.result && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <h3 className="font-medium">AI生成コンテンツ</h3>
                </div>
                <div className="bg-muted p-3 rounded text-sm max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{aiResult.originalResult.result}</pre>
                </div>
              </Card>
            )}

            {/* アクションボタン */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleApplyAIResult} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                変更を適用
              </Button>
              <Button variant="outline" onClick={() => setShowAIResult(false)}>
                <Eye className="h-4 w-4 mr-2" />
                確認のみ
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクの削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{task?.name}」を削除してもよろしいですか？
              <br />
              この操作は取り消すことができません。
            </AlertDialogDescription>
            {task && task.level < 3 && (
              <div className="mt-2 text-destructive text-sm">
                注意：このタスクに関連する子タスクも削除される可能性があります。
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// React.memoでコンポーネント全体をメモ化
export default React.memo(TaskEditDialog, (prevProps, nextProps) => {
  // 必要なプロパティのみを比較
  return (
    prevProps.open === nextProps.open &&
    prevProps.task?.id === nextProps.task?.id &&
    prevProps.task?.name === nextProps.task?.name &&
    prevProps.task?.status === nextProps.task?.status &&
    prevProps.task?.progress === nextProps.task?.progress
  );
});
