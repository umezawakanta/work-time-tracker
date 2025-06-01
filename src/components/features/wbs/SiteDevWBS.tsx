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
} from 'lucide-react';
import WBSGanttChart from './WBSGanttChart';
import WBSTreeView from './WBSTreeView';
import { siteDevProject } from '@/data/siteDevWBS';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import WBSService from '@/services/wbs/WBSService';
import { WBSNode } from '@/types/wbs';

const SiteDevWBS: React.FC = () => {
  const [viewMode, setViewMode] = useState<'gantt' | 'tree'>('gantt');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([]);
  const [loading, setLoading] = useState(true);

  // ローカルストレージからデータを読み込む関数を追加
  const loadLocalWBSTasks = (): WBSNode[] => {
    try {
      const localTasks = JSON.parse(localStorage.getItem('wbs-tasks') || '[]');
      // site-dev-projectのタスクのみをフィルタリング
      return localTasks.filter((task: any) => task.projectId === 'site-dev-project');
    } catch (error) {
      console.error('ローカルストレージからのデータ読み込みエラー:', error);
      return [];
    }
  };

  // FirebaseとローカルストレージからデータをマージしてWBSノードを取得
  useEffect(() => {
    const fetchWBSNodes = async () => {
      try {
        setLoading(true);

        // ローカルストレージからタスクを取得
        const localTasks = loadLocalWBSTasks();
        console.log('ローカルストレージから読み込んだタスク:', localTasks);

        try {
          // Firebaseからデータを取得
          const firebaseNodes = await WBSService.getProjectNodes('site-dev-project');
          console.log('Firebaseから読み込んだタスク:', firebaseNodes);

          // ローカルとFirebaseのデータをマージ（重複を避ける）
          const mergedNodes = [...firebaseNodes];

          // ローカルタスクのうち、Firebaseに存在しないものだけを追加
          localTasks.forEach((localTask) => {
            const exists = firebaseNodes.some((fbNode) => fbNode.name === localTask.name);
            if (!exists) {
              mergedNodes.push(localTask);
            }
          });

          setWbsNodes(mergedNodes);
        } catch (firebaseError) {
          console.error('Firebaseからのデータ取得に失敗:', firebaseError);
          // Firebaseエラーの場合はローカルデータのみを使用
          setWbsNodes(localTasks);
        }
      } catch (error) {
        console.error('WBSデータの取得に失敗しました:', error);
        setWbsNodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWBSNodes();

    // リアルタイム更新を購読（Firebaseからのみ）
    const unsubscribe = WBSService.subscribeToProject('site-dev-project', (firebaseNodes) => {
      // リアルタイム更新時もローカルデータをマージ
      const localTasks = loadLocalWBSTasks();
      const mergedNodes = [...firebaseNodes];

      localTasks.forEach((localTask) => {
        const exists = firebaseNodes.some((fbNode) => fbNode.name === localTask.name);
        if (!exists) {
          mergedNodes.push(localTask);
        }
      });

      setWbsNodes(mergedNodes);
    });

    // ローカルストレージの変更を監視
    const handleStorageChange = () => {
      fetchWBSNodes();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ローカルストレージのタスクを更新する関数を追加
  const updateLocalTask = (nodeId: string, updates: Partial<WBSNode>) => {
    try {
      const localTasks = JSON.parse(localStorage.getItem('wbs-tasks') || '[]');
      const updatedTasks = localTasks.map((task: any) =>
        task.id === nodeId ? { ...task, ...updates } : task
      );
      localStorage.setItem('wbs-tasks', JSON.stringify(updatedTasks));

      // storage イベントを手動で発火させて他のタブに通知
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('ローカルストレージの更新エラー:', error);
    }
  };

  // ノードの進捗を更新する関数を追加
  const handleProgressUpdate = async (nodeId: string, progress: number) => {
    try {
      const node = wbsNodes.find((n) => n.id === nodeId);
      if (!node) return;

      // ローカルストレージから来たタスクかどうかを判定
      const localTasks = loadLocalWBSTasks();
      const isLocalTask = localTasks.some((task) => task.id === nodeId);

      if (isLocalTask) {
        // ローカルストレージのタスクの場合
        updateLocalTask(nodeId, { progress, updatedAt: new Date().toISOString() });

        // 即座にUIを更新
        setWbsNodes((prevNodes) =>
          prevNodes.map((n) => (n.id === nodeId ? { ...n, progress } : n))
        );
      } else {
        // Firebaseのタスクの場合
        await WBSService.updateNode(nodeId, { progress });
      }
    } catch (error) {
      console.error('進捗の更新に失敗しました:', error);
    }
  };

  // ノードを更新する関数を追加
  const handleNodeUpdate = async (nodeId: string, updates: Partial<WBSNode>) => {
    try {
      const node = wbsNodes.find((n) => n.id === nodeId);
      if (!node) return;

      // ローカルストレージから来たタスクかどうかを判定
      const localTasks = loadLocalWBSTasks();
      const isLocalTask = localTasks.some((task) => task.id === nodeId);

      if (isLocalTask) {
        // ローカルストレージのタスクの場合
        updateLocalTask(nodeId, { ...updates, updatedAt: new Date().toISOString() });

        // 即座にUIを更新
        setWbsNodes((prevNodes) =>
          prevNodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n))
        );
      } else {
        // Firebaseのタスクの場合
        await WBSService.updateNode(nodeId, updates);
      }
    } catch (error) {
      console.error('ノードの更新に失敗しました:', error);
    }
  };

  // 統計情報の計算
  const calculateStats = () => {
    const totalTasks = wbsNodes.filter((n) => n.level > 0).length;
    const completedTasks = wbsNodes.filter((n) => n.level > 0 && n.status === 'completed').length;
    const inProgressTasks = wbsNodes.filter(
      (n) => n.level > 0 && n.status === 'in-progress'
    ).length;
    const delayedTasks = wbsNodes.filter((n) => n.status === 'delayed').length;

    // 分母が0の場合のエラーを防ぐ
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
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'gantt' | 'tree')}>
        <TabsList>
          <TabsTrigger value="gantt">ガントチャート</TabsTrigger>
          <TabsTrigger value="tree">ツリー表示</TabsTrigger>
        </TabsList>

        <TabsContent value="gantt" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <WBSGanttChart
                nodes={wbsNodes}
                startDate={new Date(siteDevProject.startDate)}
                endDate={new Date(siteDevProject.endDate)}
                onNodeClick={setSelectedNode}
                onProgressUpdate={handleProgressUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tree" className="mt-4">
          <Card>
            <CardContent>
              <WBSTreeView
                nodes={wbsNodes}
                onNodeClick={setSelectedNode}
                onNodeUpdate={handleNodeUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 選択されたノードの詳細 */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {selectedNode.icon && <span>{selectedNode.icon}</span>}
              {selectedNode.name}
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
    </div>
  );
};

export default SiteDevWBS;
