// src/components/features/wbs/WBSNodeDialog.tsx
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WBSNode } from '@/types/wbs';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WBSNodeDialogProps {
  open: boolean;
  onClose: () => void;
  node?: WBSNode | null;
  projectId: string;
  availableNodes?: WBSNode[];
  onSave: (nodeData: Partial<WBSNode>) => Promise<void>;
}

const WBSNodeDialog: React.FC<WBSNodeDialogProps> = ({
  open,
  onClose,
  node,
  projectId,
  availableNodes = [],
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<WBSNode>>({
    name: '',
    description: '',
    status: 'not-started',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    estimatedHours: 0,
    budget: 0,
    assignees: [],
    dependencies: [],
    deliverables: [],
  });
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (node) {
      setFormData({
        name: node.name,
        description: node.description,
        status: node.status,
        startDate: node.startDate,
        endDate: node.endDate,
        estimatedHours: node.estimatedHours,
        budget: node.budget,
        assignees: node.assignees,
        dependencies: node.dependencies,
        deliverables: node.deliverables,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'not-started',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        estimatedHours: 0,
        budget: 0,
        assignees: [],
        dependencies: [],
        deliverables: [],
      });
    }
  }, [node]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...formData,
        projectId,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save node:', error);
    } finally {
      setSaving(false);
    }
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setFormData({
        ...formData,
        deliverables: [...(formData.deliverables || []), newDeliverable.trim()],
      });
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables?.filter((_, i) => i !== index) || [],
    });
  };

  const addAssignee = () => {
    if (newAssignee.trim() && !formData.assignees?.includes(newAssignee.trim())) {
      setFormData({
        ...formData,
        assignees: [...(formData.assignees || []), newAssignee.trim()],
      });
      setNewAssignee('');
    }
  };

  const removeAssignee = (email: string) => {
    setFormData({
      ...formData,
      assignees: formData.assignees?.filter((a) => a !== email) || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{node ? 'タスクを編集' : '新規タスクを作成'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="schedule">スケジュール</TabsTrigger>
            <TabsTrigger value="resources">リソース</TabsTrigger>
            <TabsTrigger value="deliverables">成果物</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label htmlFor="name">タスク名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="タスク名を入力"
              />
            </div>

            <div>
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="タスクの詳細な説明"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="status">ステータス</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as WBSNode['status'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">未開始</SelectItem>
                  <SelectItem value="in-progress">進行中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="delayed">遅延</SelectItem>
                  <SelectItem value="cancelled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>開始日</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate
                        ? format(new Date(formData.startDate), 'yyyy/MM/dd')
                        : '選択してください'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate ? new Date(formData.startDate) : undefined}
                      onSelect={(date) =>
                        date &&
                        setFormData({
                          ...formData,
                          startDate: format(date, 'yyyy-MM-dd'),
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>終了日</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate
                        ? format(new Date(formData.endDate), 'yyyy/MM/dd')
                        : '選択してください'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate ? new Date(formData.endDate) : undefined}
                      onSelect={(date) =>
                        date &&
                        setFormData({
                          ...formData,
                          endDate: format(date, 'yyyy-MM-dd'),
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>依存関係</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (!formData.dependencies?.includes(value)) {
                    setFormData({
                      ...formData,
                      dependencies: [...(formData.dependencies || []), value],
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="依存するタスクを選択" />
                </SelectTrigger>
                <SelectContent>
                  {availableNodes
                    .filter((n) => n.id !== node?.id && !formData.dependencies?.includes(n.id))
                    .map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="mt-2 space-y-1">
                {formData.dependencies?.map((depId) => {
                  const depNode = availableNodes.find((n) => n.id === depId);
                  return (
                    <div key={depId} className="flex items-center gap-2 text-sm">
                      <span>{depNode?.name || depId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            dependencies: formData.dependencies?.filter((d) => d !== depId) || [],
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedHours">予定工数（時間）</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedHours: parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                />
              </div>

              <div>
                <Label htmlFor="budget">予算</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget: parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                />
              </div>
            </div>

            <div>
              <Label>担当者</Label>
              <div className="flex gap-2">
                <Input
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  placeholder="メールアドレス"
                  onKeyPress={(e) => e.key === 'Enter' && addAssignee()}
                />
                <Button onClick={addAssignee} type="button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.assignees?.map((email) => (
                  <Badge key={email} variant="secondary">
                    {email}
                    <button
                      onClick={() => removeAssignee(email)}
                      className="ml-2"
                      aria-label={`${email}を削除`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deliverables" className="space-y-4">
            <div>
              <Label>成果物</Label>
              <div className="flex gap-2">
                <Input
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  placeholder="成果物を入力"
                  onKeyPress={(e) => e.key === 'Enter' && addDeliverable()}
                />
                <Button onClick={addDeliverable} type="button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ul className="mt-2 space-y-1">
                {formData.deliverables?.map((deliverable, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-sm">{deliverable}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeDeliverable(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.name}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WBSNodeDialog;
