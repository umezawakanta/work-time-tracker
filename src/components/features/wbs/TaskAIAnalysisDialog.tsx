import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, Loader2, Edit, Save, X, AlertTriangle, Package, GitBranch } from 'lucide-react';
import { WBSNode } from '@/types/wbs';
import WBSAIService from '@/services/ai/WBSAIService';
import WBSService from '@/services/wbs/WBSService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface TaskAIAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: WBSNode;
  onTaskUpdated?: (nodeId: string, updates: Partial<WBSNode>) => void;
  onSubtasksCreated?: (parentId: string, subtasks: WBSNode[]) => void;
}

export const TaskAIAnalysisDialog: React.FC<TaskAIAnalysisDialogProps> = ({
  open,
  onOpenChange,
  task,
  onTaskUpdated,
  onSubtasksCreated,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open && task) {
      analyzeTask();
    }
  }, [open, task]);

  const analyzeTask = async () => {
    setLoading(true);
    try {
      const result = await WBSAIService.analyzeAndBreakdownTask(task);
      setAnalysis(result);
      setEditedData(result);
    } catch (error) {
      console.error('Task analysis failed:', error);
      toast.error('タスクの分析に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user || !editedData) return;

    try {
      // タスク本体を更新
      const updates: Partial<WBSNode> = {
        description: editedData.enhancedDescription,
        deliverables: editedData.suggestedDeliverables,
        risks: editedData.risks.map((risk: any, index: number) => ({
          id: `risk-ai-${Date.now()}-${index}`,
          ...risk,
          owner: user.uid,
        })),
      };

      await WBSService.updateNode(task.id, updates);
      onTaskUpdated?.(task.id, updates);

      // 子タスクを作成
      if (editedData.subtasks && editedData.subtasks.length > 0) {
        const createdSubtasks: WBSNode[] = [];

        for (const [index, subtask] of editedData.subtasks.entries()) {
          const newNode: Partial<WBSNode> = {
            projectId: task.projectId,
            parentId: task.id,
            name: subtask.name,
            description: subtask.description,
            level: task.level + 1,
            orderIndex: index,
            startDate: task.startDate,
            endDate: task.endDate,
            duration: Math.ceil(subtask.estimatedHours / 8), // 日数に変換
            progress: 0,
            status: 'not-started',
            assignees: task.assignees,
            dependencies: [],
            estimatedHours: subtask.estimatedHours,
            actualHours: 0,
            budget: 0,
            actualCost: 0,
            deliverables: subtask.deliverables,
            risks: [],
            createdBy: user.uid,
          };

          const nodeId = await WBSService.createNode(newNode, user.uid);
          createdSubtasks.push({ ...newNode, id: nodeId } as WBSNode);
        }

        onSubtasksCreated?.(task.id, createdSubtasks);
      }

      toast.success('タスクの分析結果を適用しました');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to apply analysis:', error);
      toast.error('分析結果の適用に失敗しました');
    }
  };

  const updateSubtask = (index: number, field: string, value: any) => {
    const updatedSubtasks = [...editedData.subtasks];
    updatedSubtasks[index] = { ...updatedSubtasks[index], [field]: value };
    setEditedData({ ...editedData, subtasks: updatedSubtasks });
  };

  const removeSubtask = (index: number) => {
    const updatedSubtasks = editedData.subtasks.filter((_: any, i: number) => i !== index);
    setEditedData({ ...editedData, subtasks: updatedSubtasks });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI タスク分析: {task.name}
          </DialogTitle>
          <DialogDescription>
            AIがタスクを分析し、具体的な作業内容と子タスクを提案します
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">タスクを分析中...</span>
          </div>
        ) : analysis ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="subtasks">子タスク</TabsTrigger>
              <TabsTrigger value="risks">リスクと成果物</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    詳細な作業内容
                    <Button size="sm" variant="ghost" onClick={() => setEditMode(!editMode)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <Textarea
                      value={editedData.enhancedDescription}
                      onChange={(e) =>
                        setEditedData({ ...editedData, enhancedDescription: e.target.value })
                      }
                      rows={8}
                      className="font-mono text-sm"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{editedData.enhancedDescription}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subtasks" className="space-y-4 overflow-y-auto">
              <Alert>
                <GitBranch className="h-4 w-4" />
                <AlertDescription>
                  以下の子タスクが自動生成されました。必要に応じて編集してください。
                </AlertDescription>
              </Alert>

              {editedData.subtasks.map((subtask: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      {editMode ? (
                        <Input
                          value={subtask.name}
                          onChange={(e) => updateSubtask(index, 'name', e.target.value)}
                          className="mr-2"
                        />
                      ) : (
                        <span>{subtask.name}</span>
                      )}
                      {editMode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSubtask(index)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs">説明</Label>
                      {editMode ? (
                        <Textarea
                          value={subtask.description}
                          onChange={(e) => updateSubtask(index, 'description', e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{subtask.description}</p>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <Label className="text-xs">見積工数</Label>
                        {editMode ? (
                          <Input
                            type="number"
                            value={subtask.estimatedHours}
                            onChange={(e) =>
                              updateSubtask(index, 'estimatedHours', Number(e.target.value))
                            }
                            className="w-20"
                          />
                        ) : (
                          <p className="text-sm font-medium">{subtask.estimatedHours}時間</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">成果物</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {subtask.deliverables.map((item: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="risks" className="space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <Label>提案された成果物</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editedData.suggestedDeliverables.map((item: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        <Package className="h-3 w-3 mr-1" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>識別されたリスク</Label>
                  <div className="space-y-2 mt-2">
                    {editedData.risks.map((risk: any, index: number) => (
                      <Card
                        key={index}
                        className={`border-l-4 ${
                          risk.impact === 'high'
                            ? 'border-l-red-500'
                            : risk.impact === 'medium'
                              ? 'border-l-yellow-500'
                              : 'border-l-green-500'
                        }`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{risk.description}</p>
                              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                <span>確率: {risk.probability}</span>
                                <span>影響: {risk.impact}</span>
                              </div>
                              <p className="text-xs mt-2">対策: {risk.mitigation}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          {editMode && (
            <Button variant="outline" onClick={() => setEditMode(false)}>
              <Save className="h-4 w-4 mr-2" />
              編集を保存
            </Button>
          )}
          <Button onClick={handleApply} disabled={loading || !analysis}>
            <Brain className="h-4 w-4 mr-2" />
            分析結果を適用
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
