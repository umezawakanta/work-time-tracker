import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Edit,
  Brain,
  Filter,
  Sparkles,
} from 'lucide-react';
import WBSGanttChart from './WBSGanttChart';
import WBSTreeView from './WBSTreeView';
import TaskEditDialog from './TaskEditDialog';
import WBSAIAnalysis from './WBSAIAnalysis';
import { siteDevProject } from '@/data/siteDevWBS';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import WBSService from '@/services/wbs/WBSService';
import { WBSNode } from '@/types/wbs';
import { Button } from '@/components/ui/button';
import { TaskAIAnalysisDialog } from './TaskAIAnalysisDialog';
import { toast } from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import WBSCleanupDialog from './WBSCleanupDialog';

// フィルター設定の型定義
interface FilterSettings {
  status: string[];
  level: number | null;
  progressRange: [number, number];
  hasRisks: boolean | null;
  phase: string | null;
}

// Add this type definition near the top of the file after the imports
type OptimizationType =
  | { type: 'schedule'; startDate: string; endDate: string }
  | { type: 'resource'; estimatedHours: number; assignees: string[] }
  | { type: 'risk'; newRisk: any }
  | { type: 'optimization'; title: string; impact: string };

const SiteDevWBS: React.FC = () => {
  const [viewMode, setViewMode] = useState<'gantt' | 'tree' | 'ai'>('gantt');
  const [selectedNode, setSelectedNode] = useState<WBSNode | null>(null);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WBSNode | null>(null);
  const [aiAnalysisTask, setAIAnalysisTask] = useState<WBSNode | null>(null);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);

  // フィルター設定の状態
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    status: [],
    level: null,
    progressRange: [0, 100],
    hasRisks: null,
    phase: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  // MongoDBからWBSノードを取得
  useEffect(() => {
    const fetchWBSNodes = async () => {
      try {
        setLoading(true);

        // MongoDBからノードを取得（ローカルストレージの処理を削除）
        const nodes = await WBSService.getProjectNodes('site-dev-project');

        console.log('Total WBS nodes from MongoDB:', nodes.length);

        setWbsNodes(nodes);
      } catch (error) {
        console.error('WBSデータの取得に失敗しました:', error);
        toast.error('データの取得に失敗しました');
        setWbsNodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWBSNodes();

    // ポーリング間隔を5秒に短縮
    const interval = setInterval(fetchWBSNodes, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ノードを更新する関数（エラーハンドリング強化）
  const handleNodeUpdate = async (nodeId: string, updates: Partial<WBSNode>) => {
    try {
      await WBSService.updateNode(nodeId, updates);

      // 即座にUIを更新
      setWbsNodes((prevNodes) =>
        prevNodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n))
      );

      toast.success('更新が完了しました');
    } catch (error) {
      console.error('ノードの更新に失敗しました:', error);
      toast.error('更新に失敗しました。もう一度お試しください。');

      // エラー時は最新データを再取得
      try {
        const nodes = await WBSService.getProjectNodes('site-dev-project');
        setWbsNodes(nodes);
      } catch (refetchError) {
        console.error('データの再取得に失敗しました:', refetchError);
      }
    }
  };

  // タスク編集ダイアログを開く
  const handleEditTask = (task: WBSNode) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  // AI分析でタスクを分析
  const handleAIAnalyzeTask = (task: WBSNode) => {
    setAIAnalysisTask(task);
  };

  // AI分析結果の適用後の処理
  const handleSubtasksCreated = async (parentId: string, subtasks: WBSNode[]) => {
    try {
      // データベースの反映を待つ
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // WBSノードリストを再取得
      const nodes = await WBSService.getProjectNodes('site-dev-project');
      setWbsNodes(nodes);

      // 成功メッセージ
      toast.success(`${subtasks.length}個のサブタスクを追加しました`);
    } catch (error) {
      console.error('サブタスクの反映に失敗しました:', error);
      toast.error('サブタスクの反映に失敗しました');
    }
  };

  // フィルタリング関数
  const filterNodes = (nodes: WBSNode[]): WBSNode[] => {
    return nodes.filter((node) => {
      // ステータスフィルター
      if (filterSettings.status.length > 0 && !filterSettings.status.includes(node.status)) {
        return false;
      }

      // レベルフィルター
      if (filterSettings.level !== null && node.level !== filterSettings.level) {
        return false;
      }

      // 進捗フィルター
      if (
        node.progress < filterSettings.progressRange[0] ||
        node.progress > filterSettings.progressRange[1]
      ) {
        return false;
      }

      // リスクフィルター
      if (filterSettings.hasRisks !== null) {
        const hasRisks = node.risks.length > 0;
        if (filterSettings.hasRisks !== hasRisks) {
          return false;
        }
      }

      // フェーズフィルター
      if (filterSettings.phase !== null) {
        // レベル0のノードのIDを取得して、その子ノードかどうかを判定
        const phaseNode = nodes.find((n) => n.id === filterSettings.phase);
        if (!phaseNode) return false;

        // 自身がフェーズノードの場合
        if (node.id === filterSettings.phase) return true;

        // 親をたどってフェーズノードに到達するか確認
        let currentNode = node;
        while (currentNode.parentId) {
          if (currentNode.parentId === filterSettings.phase) return true;
          const parent = nodes.find((n) => n.id === currentNode.parentId);
          if (!parent) break;
          currentNode = parent;
        }
        return false;
      }

      return true;
    });
  };

  // フィルター適用後のノード
  const filteredNodes = filterNodes(wbsNodes);

  // 統計情報の計算
  const calculateStats = () => {
    const nodesToAnalyze = filteredNodes;
    const totalTasks = nodesToAnalyze.filter((n) => n.level > 0).length;
    const completedTasks = nodesToAnalyze.filter(
      (n) => n.level > 0 && n.status === 'completed'
    ).length;
    const inProgressTasks = nodesToAnalyze.filter(
      (n) => n.level > 0 && n.status === 'in-progress'
    ).length;
    const delayedTasks = nodesToAnalyze.filter((n) => n.status === 'delayed').length;

    const level0Nodes = nodesToAnalyze.filter((n) => n.level === 0);
    const totalProgress =
      level0Nodes.length > 0
        ? nodesToAnalyze.reduce((sum, node) => {
            if (node.level === 0) return sum + node.progress;
            return sum;
          }, 0) / level0Nodes.length
        : 0;

    const totalBudget = nodesToAnalyze.reduce((sum, n) => sum + n.budget, 0);
    const actualCost = nodesToAnalyze.reduce((sum, n) => sum + n.actualCost, 0);
    const totalEstimatedHours = nodesToAnalyze.reduce((sum, n) => sum + n.estimatedHours, 0);
    const totalActualHours = nodesToAnalyze.reduce((sum, n) => sum + n.actualHours, 0);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      delayedTasks,
      totalProgress: Math.round(totalProgress),
      totalBudget,
      actualCost,
      costEfficiency: totalBudget > 0 ? Math.round((actualCost / totalBudget) * 100) : 0,
      totalEstimatedHours,
      totalActualHours,
      timeEfficiency:
        totalEstimatedHours > 0 ? Math.round((totalActualHours / totalEstimatedHours) * 100) : 0,
    };
  };

  const stats = calculateStats();

  // フェーズ別の進捗状況
  const phaseProgress = wbsNodes
    .filter((n) => n.level === 0)
    .map((phase) => ({
      id: phase.id,
      name: phase.name,
      progress: phase.progress,
      status: phase.status,
      color: phase.color || '#6b7280',
    }));

  // クリーンアップ完了時の処理
  const handleCleanupComplete = async (
    deletedNodeIds: string[],
    mergedNodes: Array<{ from: string[]; to: string }>
  ) => {
    try {
      const deletedSet = new Set<string>();

      // 削除処理
      for (const nodeId of deletedNodeIds) {
        await WBSService.deleteNode(nodeId);
        deletedSet.add(nodeId);
      }

      // 統合処理
      for (const merge of mergedNodes) {
        const targetNode = wbsNodes.find((n) => n.id === merge.to);
        if (!targetNode) continue;

        // 統合元のタスクの情報を統合先に追加
        const sourceNodes = wbsNodes.filter((n) => merge.from.includes(n.id));
        const additionalHours = sourceNodes.reduce((sum, n) => sum + n.estimatedHours, 0);
        const additionalBudget = sourceNodes.reduce((sum, n) => sum + n.budget, 0);
        const allDeliverables = [
          ...targetNode.deliverables,
          ...sourceNodes.flatMap((n) => n.deliverables),
        ].filter((v, i, a) => a.indexOf(v) === i); // 重複を除去

        // 統合先を更新
        await WBSService.updateNode(merge.to, {
          estimatedHours: targetNode.estimatedHours + additionalHours,
          budget: targetNode.budget + additionalBudget,
          deliverables: allDeliverables,
          description: `${targetNode.description}\n\n統合されたタスク:\n${sourceNodes
            .map((n) => `- ${n.name}`)
            .join('\n')}`,
        });

        // 統合元を削除（既に削除済みのものはスキップ）
        for (const sourceId of merge.from) {
          if (!deletedSet.has(sourceId)) {
            await WBSService.deleteNode(sourceId);
            deletedSet.add(sourceId);
          }
        }
      }

      // WBSノードリストを再取得
      const nodes = await WBSService.getProjectNodes('site-dev-project');
      setWbsNodes(nodes);

      toast.success('WBSの整理が完了しました');
    } catch (error) {
      console.error('クリーンアップエラー:', error);
      toast.error('一部の処理に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">サイト開発状況</h2>
          <p className="text-muted-foreground mt-1">
            Work Time Tracker の開発進捗をリアルタイムで確認
          </p>
        </div>

        <div className="flex gap-2">
          {/* AI整理ボタンを追加 */}
          <Button variant="outline" size="sm" onClick={() => setCleanupDialogOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI整理
          </Button>

          {/* 既存のフィルターボタン */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                フィルター
                {(filterSettings.status.length > 0 ||
                  filterSettings.level !== null ||
                  filterSettings.progressRange[0] > 0 ||
                  filterSettings.progressRange[1] < 100 ||
                  filterSettings.hasRisks !== null ||
                  filterSettings.phase !== null) && (
                  <Badge variant="secondary" className="ml-2">
                    適用中
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="font-medium">フィルター設定</div>

                {/* ステータスフィルター */}
                <div className="space-y-2">
                  <Label>ステータス</Label>
                  <div className="flex flex-wrap gap-2">
                    {['not-started', 'in-progress', 'completed', 'delayed', 'cancelled'].map(
                      (status) => (
                        <Badge
                          key={status}
                          variant={filterSettings.status.includes(status) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            setFilterSettings((prev) => ({
                              ...prev,
                              status: prev.status.includes(status)
                                ? prev.status.filter((s) => s !== status)
                                : [...prev.status, status],
                            }));
                          }}
                        >
                          {status === 'not-started' && '未着手'}
                          {status === 'in-progress' && '進行中'}
                          {status === 'completed' && '完了'}
                          {status === 'delayed' && '遅延'}
                          {status === 'cancelled' && 'キャンセル'}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                {/* レベルフィルター */}
                <div className="space-y-2">
                  <Label>階層レベル</Label>
                  <Select
                    value={filterSettings.level?.toString() ?? 'all'}
                    onValueChange={(value) => {
                      setFilterSettings((prev) => ({
                        ...prev,
                        level: value === 'all' ? null : parseInt(value),
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="0">フェーズ</SelectItem>
                      <SelectItem value="1">レベル1</SelectItem>
                      <SelectItem value="2">レベル2</SelectItem>
                      <SelectItem value="3">レベル3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 進捗フィルター */}
                <div className="space-y-2">
                  <Label>
                    進捗範囲: {filterSettings.progressRange[0]}% - {filterSettings.progressRange[1]}
                    %
                  </Label>
                  <Slider
                    value={filterSettings.progressRange}
                    onValueChange={(value) => {
                      setFilterSettings((prev) => ({
                        ...prev,
                        progressRange: value as [number, number],
                      }));
                    }}
                    max={100}
                    step={10}
                  />
                </div>

                {/* リスクフィルター */}
                <div className="flex items-center justify-between">
                  <Label>リスクのあるタスクのみ</Label>
                  <Switch
                    checked={filterSettings.hasRisks === true}
                    onCheckedChange={(checked) => {
                      setFilterSettings((prev) => ({
                        ...prev,
                        hasRisks: checked ? true : prev.hasRisks === true ? null : true,
                      }));
                    }}
                  />
                </div>

                {/* フェーズフィルター */}
                <div className="space-y-2">
                  <Label>フェーズ</Label>
                  <Select
                    value={filterSettings.phase ?? 'all'}
                    onValueChange={(value) => {
                      setFilterSettings((prev) => ({
                        ...prev,
                        phase: value === 'all' ? null : value,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {phaseProgress.map((phase) => (
                        <SelectItem key={phase.id} value={phase.id}>
                          {phase.name.split(':')[1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* リセットボタン */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setFilterSettings({
                      status: [],
                      level: null,
                      progressRange: [0, 100],
                      hasRisks: null,
                      phase: null,
                    });
                  }}
                >
                  フィルターをリセット
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 全体進捗 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">プロジェクト全体進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-2xl font-bold">{stats.totalProgress}%</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(siteDevProject.startDate), 'yyyy/MM/dd')} -
                  {format(new Date(siteDevProject.endDate), 'yyyy/MM/dd')}
                </span>
              </div>
              <Progress value={stats.totalProgress} className="h-3" />
            </div>

            {/* フェーズ別進捗 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {phaseProgress.map((phase, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{phase.name.split(':')[1]}</span>
                    <Badge
                      variant={
                        phase.status === 'completed'
                          ? 'outline'
                          : phase.status === 'in-progress'
                            ? 'default'
                            : 'secondary'
                      }
                      className="text-xs"
                    >
                      {phase.progress}%
                    </Badge>
                  </div>
                  <Progress
                    value={phase.progress}
                    className="h-2"
                    style={{
                      backgroundColor: `${phase.color}20`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">タスク状況</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedTasks}/{stats.totalTasks}
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                完了 {stats.completedTasks}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                進行中 {stats.inProgressTasks}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">予算消化率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.costEfficiency}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              ¥{stats.actualCost.toLocaleString()} / ¥{stats.totalBudget.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">工数消化率</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.timeEfficiency}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalActualHours}h / {stats.totalEstimatedHours}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">リスク状況</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wbsNodes.filter((n) => n.risks.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">リスクのあるタスク</p>
          </CardContent>
        </Card>
      </div>

      {/* ビューモード切り替え（filteredNodesを使用） */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'gantt' | 'tree' | 'ai')}>
        <TabsList>
          <TabsTrigger value="gantt">ガントチャート</TabsTrigger>
          <TabsTrigger value="tree">ツリー表示</TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="h-4 w-4 mr-2" />
            AI分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gantt" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <WBSGanttChart
                nodes={filteredNodes}
                onNodeClick={(node) => {
                  setSelectedNode(node);
                  handleEditTask(node);
                }}
                onProgressUpdate={(nodeId, progress) => handleNodeUpdate(nodeId, { progress })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tree" className="mt-4">
          <Card>
            <CardContent>
              <WBSTreeView
                nodes={filteredNodes}
                onNodeClick={(node) => {
                  setSelectedNode(node);
                  handleEditTask(node);
                }}
                onNodeUpdate={handleNodeUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <WBSAIAnalysis
            nodes={filteredNodes}
            selectedNode={selectedNode}
            onOptimizationApply={async (nodeId: string, optimization: OptimizationType) => {
              console.log('最適化を適用:', nodeId, optimization);
              // 最適化の適用ロジックを実装
              try {
                // 最適化の内容に応じて適切な更新を行う
                const updates: Partial<WBSNode> = {};

                if (optimization.type === 'schedule') {
                  updates.startDate = optimization.startDate;
                  updates.endDate = optimization.endDate;
                } else if (optimization.type === 'resource') {
                  updates.estimatedHours = optimization.estimatedHours;
                  updates.assignees = optimization.assignees;
                } else if (optimization.type === 'risk') {
                  const currentRisks = wbsNodes.find((n) => n.id === nodeId)?.risks || [];
                  updates.risks = [...currentRisks, optimization.newRisk];
                }

                await handleNodeUpdate(nodeId, updates);
              } catch (error) {
                console.error('最適化の適用に失敗しました:', error);
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* 選択されたノードの詳細 */}
      {selectedNode && viewMode !== 'ai' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedNode.icon && <span>{selectedNode.icon}</span>}
                {selectedNode.name}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEditTask(selectedNode)}>
                  <Edit className="h-4 w-4 mr-2" />
                  編集
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAIAnalyzeTask(selectedNode)}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI分析
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedNode.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">期間:</span>
                  <p className="font-medium">
                    {format(new Date(selectedNode.startDate), 'MM/dd', { locale: ja })} -
                    {format(new Date(selectedNode.endDate), 'MM/dd', { locale: ja })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">進捗:</span>
                  <p className="font-medium">{selectedNode.progress}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">予算:</span>
                  <p className="font-medium">¥{selectedNode.budget.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">工数:</span>
                  <p className="font-medium">{selectedNode.estimatedHours}時間</p>
                </div>
              </div>

              {selectedNode.deliverables.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">成果物:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedNode.deliverables.map((item: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.risks.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">リスク:</span>
                  <div className="space-y-2 mt-1">
                    {selectedNode.risks.map((risk: any) => (
                      <div key={risk.id} className="p-2 bg-orange-50 rounded-md text-sm">
                        <p className="font-medium">{risk.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          対策: {risk.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* タスク編集ダイアログ */}
      <TaskEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={editingTask}
        onSave={handleNodeUpdate}
        onAIAnalyze={handleAIAnalyzeTask}
      />

      {/* AI分析ダイアログ */}
      {aiAnalysisTask && (
        <TaskAIAnalysisDialog
          open={!!aiAnalysisTask}
          onOpenChange={(open) => !open && setAIAnalysisTask(null)}
          task={aiAnalysisTask}
          onTaskUpdated={handleNodeUpdate}
          onSubtasksCreated={handleSubtasksCreated}
        />
      )}

      {/* WBS整理ダイアログ */}
      <WBSCleanupDialog
        open={cleanupDialogOpen}
        onOpenChange={setCleanupDialogOpen}
        nodes={wbsNodes}
        onCleanupComplete={handleCleanupComplete}
      />
    </div>
  );
};

export default SiteDevWBS;
