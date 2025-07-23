/**
 * 🤖 統合自動化ダッシュボード
 * 自動化ルール管理、実行監視、パフォーマンス分析の統合インターフェース
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Switch } from '@/components/ui/switch';
import {
  integratedAutomationService,
  AutomationRule,
  AutomationExecution,
  AutomationDashboard,
} from '@/services/automation/IntegratedAutomationService';
import {
  Bot,
  Settings,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Eye,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Zap,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Calendar,
  Target,
  Workflow,
  Bell,
  Filter,
  Search,
  Download,
  Upload,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Info,
  Lightbulb,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface IntegratedAutomationDashboardProps {
  compactMode?: boolean;
  showAdvancedFeatures?: boolean;
}

export const IntegratedAutomationDashboard: React.FC<IntegratedAutomationDashboardProps> = ({
  compactMode = false,
  showAdvancedFeatures = true,
}) => {
  // State Management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dashboardData, setDashboardData] = useState<AutomationDashboard | null>(null);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State for Rule Creation/Editing
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    category: 'task_management' as const,
    priority: 'medium' as const,
    isActive: true,
    trigger: {
      type: 'time_based' as const,
      config: {
        schedule: '0 9 * * *',
      },
    },
    conditions: [],
    actions: [],
    tags: [] as string[],
  });

  // Initialize Dashboard
  useEffect(() => {
    initializeAutomationDashboard();

    // Setup real-time updates
    const interval = setInterval(() => {
      refreshDashboardData();
    }, 10000); // 10秒間隔で更新

    return () => clearInterval(interval);
  }, []);

  const initializeAutomationDashboard = async () => {
    setIsLoading(true);
    try {
      // Load automation data
      const dashboard = integratedAutomationService.getDashboardData();
      const rules = integratedAutomationService.getAllRules();

      setDashboardData(dashboard);
      setAutomationRules(rules);

      console.log('🤖 Automation dashboard initialized:', {
        totalRules: dashboard.totalRules,
        activeRules: dashboard.activeRules,
        executionsToday: dashboard.executionsToday,
      });
    } catch (error) {
      console.error('Automation dashboard initialization failed:', error);
      toast.error('自動化ダッシュボードの初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboardData = useCallback(() => {
    try {
      const dashboard = integratedAutomationService.getDashboardData();
      const rules = integratedAutomationService.getAllRules();

      setDashboardData(dashboard);
      setAutomationRules(rules);
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
    }
  }, []);

  const handleCreateRule = async () => {
    try {
      const ruleId = await integratedAutomationService.createRule(ruleForm);

      toast.success(`自動化ルール「${ruleForm.name}」を作成しました`);
      setIsCreateDialogOpen(false);
      resetRuleForm();
      refreshDashboardData();
    } catch (error) {
      console.error('Rule creation failed:', error);
      toast.error('ルール作成に失敗しました');
    }
  };

  const handleUpdateRule = async () => {
    if (!selectedRule) return;

    try {
      await integratedAutomationService.updateRule(selectedRule.id, ruleForm);

      toast.success(`自動化ルール「${ruleForm.name}」を更新しました`);
      setIsEditDialogOpen(false);
      setSelectedRule(null);
      resetRuleForm();
      refreshDashboardData();
    } catch (error) {
      console.error('Rule update failed:', error);
      toast.error('ルール更新に失敗しました');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('このルールを削除しますか？')) return;

    try {
      await integratedAutomationService.deleteRule(ruleId);

      toast.success('自動化ルールを削除しました');
      refreshDashboardData();
    } catch (error) {
      console.error('Rule deletion failed:', error);
      toast.error('ルール削除に失敗しました');
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await integratedAutomationService.updateRule(ruleId, { isActive });

      toast.success(`ルールを${isActive ? '有効' : '無効'}にしました`);
      refreshDashboardData();
    } catch (error) {
      console.error('Rule toggle failed:', error);
      toast.error('ルール状態の変更に失敗しました');
    }
  };

  const handleExecuteRule = async (ruleId: string) => {
    try {
      const execution = await integratedAutomationService.executeRule(ruleId);

      if (execution.status === 'completed') {
        toast.success('ルールを手動実行しました');
      } else {
        toast.error('ルール実行に失敗しました');
      }

      refreshDashboardData();
    } catch (error) {
      console.error('Rule execution failed:', error);
      toast.error('ルール実行に失敗しました');
    }
  };

  const resetRuleForm = () => {
    setRuleForm({
      name: '',
      description: '',
      category: 'task_management',
      priority: 'medium',
      isActive: true,
      trigger: {
        type: 'time_based',
        config: {
          schedule: '0 9 * * *',
        },
      },
      conditions: [],
      actions: [],
      tags: [],
    });
  };

  // Filtered rules
  const filteredRules = automationRules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && rule.isActive) ||
      (filterStatus === 'inactive' && !rule.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>自動化ダッシュボードを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>自動化ダッシュボードデータの読み込みに失敗しました。</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('w-full', compactMode ? 'space-y-4' : 'space-y-6')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">統合自動化ダッシュボード</h2>
            <p className="text-gray-600">自動化ルール管理とパフォーマンス監視</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            更新
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            ルール作成
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {dashboardData.systemHealth !== 'excellent' && (
        <Alert
          className={cn(
            dashboardData.systemHealth === 'critical' && 'border-red-500 bg-red-50',
            dashboardData.systemHealth === 'warning' && 'border-yellow-500 bg-yellow-50',
            dashboardData.systemHealth === 'good' && 'border-blue-500 bg-blue-50'
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            システム健全性: {dashboardData.systemHealth} - 成功率{' '}
            {Math.round(dashboardData.successRate)}%
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Workflow className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-sm">総ルール数</span>
            </div>
            <div className="text-2xl font-bold">{dashboardData.totalRules}</div>
            <div className="text-xs text-gray-600">{dashboardData.activeRules}個が有効</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="font-medium text-sm">今日の実行</span>
            </div>
            <div className="text-2xl font-bold">{dashboardData.executionsToday}</div>
            <div className="text-xs text-gray-600">
              成功率 {Math.round(dashboardData.successRate)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-sm">平均実行時間</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(dashboardData.averageExecutionTime)}ms
            </div>
            <div className="text-xs text-gray-600">リアルタイム監視</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-sm">システム状態</span>
            </div>
            <div className="text-lg font-bold">
              <Badge
                variant={
                  dashboardData.systemHealth === 'excellent'
                    ? 'default'
                    : dashboardData.systemHealth === 'good'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {dashboardData.systemHealth}
              </Badge>
            </div>
            <div className="text-xs text-gray-600">自動監視中</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            概要
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            ルール管理
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            実行監視
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            洞察・分析
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Resource Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                リソース使用状況
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CPU使用率</span>
                    <span className="text-sm">{Math.round(dashboardData.resourceUsage.cpu)}%</span>
                  </div>
                  <Progress value={dashboardData.resourceUsage.cpu} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">メモリ使用率</span>
                    <span className="text-sm">
                      {Math.round(dashboardData.resourceUsage.memory)}%
                    </span>
                  </div>
                  <Progress value={dashboardData.resourceUsage.memory} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">ディスク使用率</span>
                    <span className="text-sm">
                      {Math.round(dashboardData.resourceUsage.diskSpace)}%
                    </span>
                  </div>
                  <Progress value={dashboardData.resourceUsage.diskSpace} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                高パフォーマンスルール
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.topPerformingRules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-gray-500">#{index + 1}</div>
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-gray-600">
                          実行回数: {rule.executionCount} | 成功率:{' '}
                          {Math.round((rule.successCount / rule.executionCount) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? '有効' : '無効'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecuteRule(rule.id)}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Management Tab */}
        <TabsContent value="rules" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="ルール名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全カテゴリ</SelectItem>
                <SelectItem value="task_management">タスク管理</SelectItem>
                <SelectItem value="gamification">ゲーミフィケーション</SelectItem>
                <SelectItem value="ai_analysis">AI分析</SelectItem>
                <SelectItem value="dashboard">ダッシュボード</SelectItem>
                <SelectItem value="workflow">ワークフロー</SelectItem>
                <SelectItem value="notification">通知</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全状態</SelectItem>
                <SelectItem value="active">有効</SelectItem>
                <SelectItem value="inactive">無効</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rules List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant="outline">{rule.category}</Badge>
                        <Badge
                          variant={
                            rule.priority === 'critical'
                              ? 'destructive'
                              : rule.priority === 'high'
                                ? 'default'
                                : rule.priority === 'medium'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {rule.priority}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                          />
                          <span className="text-xs text-gray-600">
                            {rule.isActive ? '有効' : '無効'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>実行回数: {rule.executionCount}</span>
                        <span>成功: {rule.successCount}</span>
                        <span>失敗: {rule.failureCount}</span>
                        <span>平均時間: {Math.round(rule.averageExecutionTime)}ms</span>
                        {rule.lastExecuted && (
                          <span>
                            最終実行: {new Date(rule.lastExecuted).toLocaleString('ja-JP')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecuteRule(rule.id)}
                        disabled={!rule.isActive}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRule(rule);
                          setRuleForm(rule as any);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                最近の実行履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full',
                          execution.status === 'completed' && 'bg-green-500',
                          execution.status === 'failed' && 'bg-red-500',
                          execution.status === 'running' && 'bg-blue-500 animate-pulse'
                        )}
                      />
                      <div>
                        <div className="font-medium">
                          {automationRules.find((r) => r.id === execution.ruleId)?.name ||
                            execution.ruleId}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(execution.timestamp).toLocaleString('ja-JP')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">{execution.executionTime}ms</div>
                      <div className="text-xs text-gray-500">
                        {execution.actionsExecuted}/{execution.actionsTotal} アクション
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">推奨事項:</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Rule Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規自動化ルール作成</DialogTitle>
            <DialogDescription>
              新しい自動化ルールを作成してワークフローを効率化します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-name">ルール名</Label>
                <Input
                  id="rule-name"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="自動化ルール名"
                />
              </div>
              <div>
                <Label htmlFor="rule-category">カテゴリ</Label>
                <Select
                  value={ruleForm.category}
                  onValueChange={(value: any) =>
                    setRuleForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task_management">タスク管理</SelectItem>
                    <SelectItem value="gamification">ゲーミフィケーション</SelectItem>
                    <SelectItem value="ai_analysis">AI分析</SelectItem>
                    <SelectItem value="dashboard">ダッシュボード</SelectItem>
                    <SelectItem value="workflow">ワークフロー</SelectItem>
                    <SelectItem value="notification">通知</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="rule-description">説明</Label>
              <Textarea
                id="rule-description"
                value={ruleForm.description}
                onChange={(e) => setRuleForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="ルールの詳細説明"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-priority">優先度</Label>
                <Select
                  value={ruleForm.priority}
                  onValueChange={(value: any) =>
                    setRuleForm((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="critical">緊急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={ruleForm.isActive}
                  onCheckedChange={(checked) =>
                    setRuleForm((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label>作成時に有効化</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreateRule}>作成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>自動化ルール編集</DialogTitle>
            <DialogDescription>既存の自動化ルールを編集します。</DialogDescription>
          </DialogHeader>

          {/* Similar form structure as create dialog */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-rule-name">ルール名</Label>
                <Input
                  id="edit-rule-name"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-rule-category">カテゴリ</Label>
                <Select
                  value={ruleForm.category}
                  onValueChange={(value: any) =>
                    setRuleForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task_management">タスク管理</SelectItem>
                    <SelectItem value="gamification">ゲーミフィケーション</SelectItem>
                    <SelectItem value="ai_analysis">AI分析</SelectItem>
                    <SelectItem value="dashboard">ダッシュボード</SelectItem>
                    <SelectItem value="workflow">ワークフロー</SelectItem>
                    <SelectItem value="notification">通知</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-rule-description">説明</Label>
              <Textarea
                id="edit-rule-description"
                value={ruleForm.description}
                onChange={(e) => setRuleForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdateRule}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
