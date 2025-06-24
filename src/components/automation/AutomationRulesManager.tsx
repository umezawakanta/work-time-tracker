import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  Settings,
  Zap,
  Clock,
  Target,
  Repeat,
  Filter,
  Bell,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Tag,
  ArrowRight,
  Workflow,
  Bot,
  Save,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 自動化ルールの型定義
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  category: 'classification' | 'priority' | 'scheduling' | 'workflow' | 'notification';
  isActive: boolean;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AutomationCondition {
  id: string;
  type:
    | 'title_contains'
    | 'category_equals'
    | 'priority_equals'
    | 'due_date'
    | 'tag_contains'
    | 'time_based';
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with';
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface AutomationAction {
  id: string;
  type:
    | 'set_category'
    | 'set_priority'
    | 'add_tag'
    | 'set_due_date'
    | 'send_notification'
    | 'create_subtask'
    | 'assign_to';
  field: string;
  value: string;
  delay?: number; // 分単位
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: Omit<AutomationCondition, 'id'>[];
  actions: Omit<AutomationAction, 'id'>[];
  icon: string;
}

export const AutomationRulesManager: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | AutomationRule['category']>(
    'all'
  );

  // デモデータの生成
  useEffect(() => {
    const demoRules: AutomationRule[] = [
      {
        id: 'rule-1',
        name: 'バグレポート自動分類',
        description:
          'タイトルに「バグ」「エラー」「問題」が含まれるタスクを自動的に「バグ修正」カテゴリに分類',
        category: 'classification',
        isActive: true,
        conditions: [
          {
            id: 'cond-1',
            type: 'title_contains',
            field: 'title',
            operator: 'contains',
            value: 'バグ|エラー|問題',
            logicalOperator: 'OR',
          },
        ],
        actions: [
          {
            id: 'action-1',
            type: 'set_category',
            field: 'category',
            value: 'バグ修正',
          },
          {
            id: 'action-2',
            type: 'set_priority',
            field: 'priority',
            value: 'high',
          },
          {
            id: 'action-3',
            type: 'add_tag',
            field: 'tags',
            value: 'urgent',
          },
        ],
        createdAt: '2024-01-15T10:00:00Z',
        lastTriggered: '2024-01-20T14:30:00Z',
        triggerCount: 12,
      },
      {
        id: 'rule-2',
        name: '緊急タスク通知',
        description: '優先度が「緊急」のタスクが作成されたら即座にSlack通知を送信',
        category: 'notification',
        isActive: true,
        conditions: [
          {
            id: 'cond-2',
            type: 'priority_equals',
            field: 'priority',
            operator: 'equals',
            value: 'urgent',
          },
        ],
        actions: [
          {
            id: 'action-4',
            type: 'send_notification',
            field: 'notification',
            value: 'slack:dev-team',
          },
          {
            id: 'action-5',
            type: 'add_tag',
            field: 'tags',
            value: 'escalated',
          },
        ],
        createdAt: '2024-01-10T09:00:00Z',
        lastTriggered: '2024-01-19T11:45:00Z',
        triggerCount: 8,
      },
      {
        id: 'rule-3',
        name: '定期レビュー自動生成',
        description: '毎週金曜日に自動的に週次レビュータスクを生成',
        category: 'scheduling',
        isActive: true,
        conditions: [
          {
            id: 'cond-3',
            type: 'time_based',
            field: 'schedule',
            operator: 'equals',
            value: 'weekly:friday:17:00',
          },
        ],
        actions: [
          {
            id: 'action-6',
            type: 'create_subtask',
            field: 'subtask',
            value: '週次レビュー: チームの進捗確認',
          },
          {
            id: 'action-7',
            type: 'set_due_date',
            field: 'due_date',
            value: '+7days',
          },
        ],
        createdAt: '2024-01-05T16:00:00Z',
        lastTriggered: '2024-01-19T17:00:00Z',
        triggerCount: 3,
      },
      {
        id: 'rule-4',
        name: 'プルリクエスト自動ワークフロー',
        description: 'PRタスクが完了したら自動的にコードレビュータスクを作成',
        category: 'workflow',
        isActive: true,
        conditions: [
          {
            id: 'cond-4',
            type: 'title_contains',
            field: 'title',
            operator: 'starts_with',
            value: 'PR:',
          },
        ],
        actions: [
          {
            id: 'action-8',
            type: 'create_subtask',
            field: 'subtask',
            value: 'コードレビュー: {original_title}',
          },
          {
            id: 'action-9',
            type: 'assign_to',
            field: 'assignee',
            value: 'senior-developer',
          },
        ],
        createdAt: '2024-01-12T13:00:00Z',
        lastTriggered: '2024-01-18T15:20:00Z',
        triggerCount: 15,
      },
      {
        id: 'rule-5',
        name: '期限切れアラート',
        description: 'タスクの期限が1日前になったら通知を送信',
        category: 'notification',
        isActive: false,
        conditions: [
          {
            id: 'cond-5',
            type: 'due_date',
            field: 'due_date',
            operator: 'equals',
            value: '-1day',
          },
        ],
        actions: [
          {
            id: 'action-10',
            type: 'send_notification',
            field: 'notification',
            value: 'email:assigned_user',
            delay: 0,
          },
        ],
        createdAt: '2024-01-08T12:00:00Z',
        triggerCount: 0,
      },
    ];

    setRules(demoRules);
  }, []);

  // 事前定義されたテンプレート
  const automationTemplates: AutomationTemplate[] = [
    {
      id: 'template-1',
      name: 'スマート分類',
      description: 'キーワードベースの自動カテゴリ分類',
      category: 'classification',
      icon: '🏷️',
      conditions: [
        {
          type: 'title_contains',
          field: 'title',
          operator: 'contains',
          value: '',
        },
      ],
      actions: [
        {
          type: 'set_category',
          field: 'category',
          value: '',
        },
      ],
    },
    {
      id: 'template-2',
      name: '緊急度エスカレーション',
      description: '高優先度タスクの自動エスカレーション',
      category: 'workflow',
      icon: '🚨',
      conditions: [
        {
          type: 'priority_equals',
          field: 'priority',
          operator: 'equals',
          value: 'urgent',
        },
      ],
      actions: [
        {
          type: 'send_notification',
          field: 'notification',
          value: 'slack:management',
        },
        {
          type: 'assign_to',
          field: 'assignee',
          value: 'team-lead',
        },
      ],
    },
    {
      id: 'template-3',
      name: '定期タスク生成',
      description: 'スケジュールベースの自動タスク作成',
      category: 'scheduling',
      icon: '🔄',
      conditions: [
        {
          type: 'time_based',
          field: 'schedule',
          operator: 'equals',
          value: 'daily:09:00',
        },
      ],
      actions: [
        {
          type: 'create_subtask',
          field: 'subtask',
          value: '日次スタンドアップ準備',
        },
      ],
    },
  ];

  const toggleRuleStatus = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule))
    );
  };

  const deleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
  };

  const createRuleFromTemplate = (template: AutomationTemplate) => {
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: `${template.name} (コピー)`,
      description: template.description,
      category: template.category as AutomationRule['category'],
      isActive: false,
      conditions: template.conditions.map((cond, index) => ({
        ...cond,
        id: `cond-${Date.now()}-${index}`,
      })),
      actions: template.actions.map((action, index) => ({
        ...action,
        id: `action-${Date.now()}-${index}`,
      })),
      createdAt: new Date().toISOString(),
      triggerCount: 0,
    };

    setRules((prev) => [...prev, newRule]);
    setSelectedRule(newRule);
    setIsEditDialogOpen(true);
  };

  const filteredRules =
    selectedCategory === 'all' ? rules : rules.filter((rule) => rule.category === selectedCategory);

  const categoryIcons = {
    classification: <Tag className="h-4 w-4" />,
    priority: <Target className="h-4 w-4" />,
    scheduling: <Calendar className="h-4 w-4" />,
    workflow: <Workflow className="h-4 w-4" />,
    notification: <Bell className="h-4 w-4" />,
  };

  const categoryColors = {
    classification: 'bg-blue-100 text-blue-800 border-blue-200',
    priority: 'bg-red-100 text-red-800 border-red-200',
    scheduling: 'bg-green-100 text-green-800 border-green-200',
    workflow: 'bg-purple-100 text-purple-800 border-purple-200',
    notification: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-purple-600" />
            自動化ルール管理
          </h1>
          <p className="text-gray-600 mt-2">ワークフローを自動化してタスク管理を効率化</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新しいルール
          </Button>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総ルール数</p>
                <p className="text-2xl font-bold">{rules.length}</p>
              </div>
              <Settings className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">アクティブ</p>
                <p className="text-2xl font-bold text-green-600">
                  {rules.filter((r) => r.isActive).length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今月の実行回数</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rules.reduce((sum, rule) => sum + rule.triggerCount, 0)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">自動化率</p>
                <p className="text-2xl font-bold text-purple-600">87%</p>
              </div>
              <Bot className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="classification">分類</TabsTrigger>
            <TabsTrigger value="priority">優先度</TabsTrigger>
            <TabsTrigger value="scheduling">スケジュール</TabsTrigger>
            <TabsTrigger value="workflow">ワークフロー</TabsTrigger>
            <TabsTrigger value="notification">通知</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ルール一覧 */}
          <div className="lg:col-span-2 space-y-4">
            {filteredRules.map((rule) => (
              <Card
                key={rule.id}
                className={cn(
                  'transition-all hover:shadow-md cursor-pointer',
                  rule.isActive ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {categoryIcons[rule.category]}
                      <div>
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[rule.category]}>{rule.category}</Badge>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleRuleStatus(rule.id)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>条件: {rule.conditions.length}個</span>
                      <span>アクション: {rule.actions.length}個</span>
                      <span>実行回数: {rule.triggerCount}回</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRule(rule);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {rule.lastTriggered && (
                    <div className="mt-2 text-xs text-gray-400">
                      最終実行: {new Date(rule.lastTriggered).toLocaleString('ja-JP')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* テンプレート */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">クイックテンプレート</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {automationTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => createRuleFromTemplate(template)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{template.icon}</span>
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{template.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 使用状況 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">今週の自動化統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>タスク自動分類</span>
                      <span>24件</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>自動通知</span>
                      <span>15件</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ワークフロー実行</span>
                      <span>8件</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      {/* 新規作成ダイアログ */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新しい自動化ルールの作成</DialogTitle>
            <DialogDescription>
              条件とアクションを設定して、ワークフローを自動化しましょう
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule-name">ルール名</Label>
              <Input id="rule-name" placeholder="例: バグレポート自動分類" />
            </div>
            <div>
              <Label htmlFor="rule-description">説明</Label>
              <Textarea id="rule-description" placeholder="このルールの詳細な説明" />
            </div>
            <div>
              <Label htmlFor="rule-category">カテゴリ</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classification">分類</SelectItem>
                  <SelectItem value="priority">優先度</SelectItem>
                  <SelectItem value="scheduling">スケジュール</SelectItem>
                  <SelectItem value="workflow">ワークフロー</SelectItem>
                  <SelectItem value="notification">通知</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              <Save className="h-4 w-4 mr-2" />
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>ルールの編集: {selectedRule?.name}</DialogTitle>
            <DialogDescription>条件とアクションを詳細に設定できます</DialogDescription>
          </DialogHeader>
          {selectedRule && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ルール名</Label>
                  <Input defaultValue={selectedRule.name} />
                </div>
                <div>
                  <Label>カテゴリ</Label>
                  <Select defaultValue={selectedRule.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classification">分類</SelectItem>
                      <SelectItem value="priority">優先度</SelectItem>
                      <SelectItem value="scheduling">スケジュール</SelectItem>
                      <SelectItem value="workflow">ワークフロー</SelectItem>
                      <SelectItem value="notification">通知</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 条件設定 */}
              <div>
                <h3 className="font-semibold mb-3">実行条件</h3>
                <div className="space-y-3">
                  {selectedRule.conditions.map((condition, index) => (
                    <div key={condition.id} className="p-3 border rounded-lg bg-blue-50">
                      <div className="grid grid-cols-4 gap-2">
                        <Select defaultValue={condition.field}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="title">タイトル</SelectItem>
                            <SelectItem value="category">カテゴリ</SelectItem>
                            <SelectItem value="priority">優先度</SelectItem>
                            <SelectItem value="tags">タグ</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select defaultValue={condition.operator}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">等しい</SelectItem>
                            <SelectItem value="contains">含む</SelectItem>
                            <SelectItem value="starts_with">で始まる</SelectItem>
                            <SelectItem value="ends_with">で終わる</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input defaultValue={condition.value} placeholder="値" />
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    条件を追加
                  </Button>
                </div>
              </div>

              {/* アクション設定 */}
              <div>
                <h3 className="font-semibold mb-3">実行アクション</h3>
                <div className="space-y-3">
                  {selectedRule.actions.map((action, index) => (
                    <div key={action.id} className="p-3 border rounded-lg bg-green-50">
                      <div className="grid grid-cols-4 gap-2">
                        <Select defaultValue={action.type}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="set_category">カテゴリ設定</SelectItem>
                            <SelectItem value="set_priority">優先度設定</SelectItem>
                            <SelectItem value="add_tag">タグ追加</SelectItem>
                            <SelectItem value="send_notification">通知送信</SelectItem>
                            <SelectItem value="create_subtask">サブタスク作成</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input defaultValue={action.field} placeholder="フィールド" />
                        <Input defaultValue={action.value} placeholder="値" />
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    アクションを追加
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
