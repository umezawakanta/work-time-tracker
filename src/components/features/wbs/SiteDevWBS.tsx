import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Brain,
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

const SiteDevWBS: React.FC = () => {
  const [viewMode, setViewMode] = useState<'gantt' | 'tree' | 'ai'>('gantt');
  const [selectedNode, setSelectedNode] = useState<WBSNode | null>(null);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WBSNode | null>(null);

  // MongoDBからWBSノードを取得
  useEffect(() => {
    const fetchWBSNodes = async () => {
      try {
        setLoading(true);
        // MongoDBからデータを取得
        const nodes = await WBSService.getProjectNodes('site-dev-project');
        setWbsNodes(nodes);
      } catch (error) {
        console.error('WBSデータの取得に失敗しました:', error);
        setWbsNodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWBSNodes();

    // ポーリングで定期的に更新（リアルタイム更新の代替）
    const interval = setInterval(fetchWBSNodes, 30000); // 30秒ごと

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ノードを更新する関数
  const handleNodeUpdate = async (nodeId: string, updates: Partial<WBSNode>) => {
    try {
      await WBSService.updateNode(nodeId, updates);

      // 即座にUIを更新
      setWbsNodes((prevNodes) =>
        prevNodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n))
      );
    } catch (error) {
      console.error('ノードの更新に失敗しました:', error);
    }
  };

  // タスク編集ダイアログを開く
  const handleEditTask = (task: WBSNode) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  // AI分析でタスクを分析
  const handleAIAnalyzeTask = (task: WBSNode) => {
    setSelectedNode(task);
    setViewMode('ai');
  };

  // 統計情報の計算
  const calculateStats = () => {
    const totalTasks = wbsNodes.filter((n) => n.level > 0).length;
    const completedTasks = wbsNodes.filter((n) => n.level > 0 && n.status === 'completed').length;
    const inProgressTasks = wbsNodes.filter(
      (n) => n.level > 0 && n.status === 'in-progress'
    ).length;
    const delayedTasks = wbsNodes.filter((n) => n.status === 'delayed').length;

    const level0Nodes = wbsNodes.filter((n) => n.level === 0);
    const totalProgress =
      level0Nodes.length > 0
        ? wbsNodes.reduce((sum, node) => {
            if (node.level === 0) return sum + node.progress;
            return sum;
          }, 0) / level0Nodes.length
        : 0;

    const totalBudget = wbsNodes.reduce((sum, n) => sum + n.budget, 0);
    const actualCost = wbsNodes.reduce((sum, n) => sum + n.actualCost, 0);
    const totalEstimatedHours = wbsNodes.reduce((sum, n) => sum + n.estimatedHours, 0);
    const totalActualHours = wbsNodes.reduce((sum, n) => sum + n.actualHours, 0);

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
      name: phase.name,
      progress: phase.progress,
      status: phase.status,
      color: phase.color || '#6b7280',
    }));

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
      <div>
        <h2 className="text-2xl font-bold">サイト開発状況</h2>
        <p className="text-muted-foreground mt-1">
          Work Time Tracker の開発進捗をリアルタイムで確認
        </p>
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

      {/* ビューモード切り替え */}
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
                nodes={wbsNodes}
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
                nodes={wbsNodes}
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
            nodes={wbsNodes}
            selectedNode={selectedNode}
            onOptimizationApply={async (nodeId: string, optimization: any) => {
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
    </div>
  );
};

export default SiteDevWBS;
