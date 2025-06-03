import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
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

  // タスクが変更されたらフォームデータを更新
  useEffect(() => {
    if (task) {
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
  }, [task]);

  // タスクが変更されたらAI実行可能かチェック
  useEffect(() => {
    const checkAIExecutability = async () => {
      if (task) {
        const canExecute = await TaskExecutionAIService.canExecuteTask(task);
        setCanExecuteWithAI(canExecute);
      }
    };
    checkAIExecutability();
  }, [task]);

  // フォームフィールドの更新
  const updateField = (field: keyof WBSNode, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 成果物の追加
  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      updateField('deliverables', [...(formData.deliverables || []), newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  // 成果物の削除
  const removeDeliverable = (index: number) => {
    const updated = [...(formData.deliverables || [])];
    updated.splice(index, 1);
    updateField('deliverables', updated);
  };

  // リスクの追加
  const addRisk = () => {
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
  };

  // リスクの削除
  const removeRisk = (riskId: string) => {
    const updated = (formData.risks || []).filter((r) => r.id !== riskId);
    updateField('risks', updated);
  };

  // 保存処理
  const handleSave = async () => {
    if (!task) return;

    setSaving(true);
    try {
      await onSave(task.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('保存エラー:', error);
    } finally {
      setSaving(false);
    }
  };

  // AI実行処理
  const handleAIExecute = async () => {
    if (!task) return;

    setExecutingAI(true);
    try {
      const result = await TaskExecutionAIService.executeTask(task);

      if (result.success) {
        // 知識ベースに保存（後で実装）
        if (result.knowledgeEntries) {
          // await KnowledgeService.saveEntries(result.knowledgeEntries);
        }

        // タスクを完了状態に更新
        await onSave(task.id, {
          status: 'completed',
          progress: 100,
          actualHours: formData.estimatedHours || 1,
          deliverables: [
            ...(formData.deliverables || []),
            `AI実行結果: ${result.knowledgeEntries?.[0]?.term || 'completed'}`,
          ],
        });

        // ダイアログを閉じる
        onOpenChange(false);
      } else {
        alert(`AI実行エラー: ${result.error}`);
      }
    } catch (error) {
      console.error('AI実行エラー:', error);
      alert('AI実行中にエラーが発生しました');
    } finally {
      setExecutingAI(false);
    }
  };

  // AI分析を開く
  const handleAIAnalyze = () => {
    if (task && onAIAnalyze) {
      onAIAnalyze(task);
      onOpenChange(false);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!task || !onDelete) return;

    setDeleting(true);
    try {
      await onDelete(task.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('削除エラー:', error);
      // エラー処理
    } finally {
      setDeleting(false);
    }
  };

  if (!task) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                  disabled={saving || deleting}
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
                <Button variant="outline" onClick={handleAIExecute} disabled={executingAI}>
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
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default TaskEditDialog;
