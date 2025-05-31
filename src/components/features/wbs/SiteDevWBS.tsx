import React, { useState } from 'react';
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
  XCircle 
} from 'lucide-react';
import WBSGanttChart from './WBSGanttChart';
import WBSTreeView from './WBSTreeView';
import { siteDevProject, siteDevNodes } from '@/data/siteDevWBS';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const SiteDevWBS: React.FC = () => {
  const [viewMode, setViewMode] = useState<'gantt' | 'tree'>('gantt');
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // 統計情報の計算
  const calculateStats = () => {
    const totalTasks = siteDevNodes.filter(n => n.level > 0).length;
    const completedTasks = siteDevNodes.filter(n => n.level > 0 && n.status === 'completed').length;
    const inProgressTasks = siteDevNodes.filter(n => n.level > 0 && n.status === 'in-progress').length;
    const delayedTasks = siteDevNodes.filter(n => n.status === 'delayed').length;
    
    const totalProgress = siteDevNodes.reduce((sum, node) => {
      if (node.level === 0) return sum + node.progress;
      return sum;
    }, 0) / siteDevNodes.filter(n => n.level === 0).length;

    const totalBudget = siteDevNodes.reduce((sum, n) => sum + n.budget, 0);
    const actualCost = siteDevNodes.reduce((sum, n) => sum + n.actualCost, 0);
    const totalEstimatedHours = siteDevNodes.reduce((sum, n) => sum + n.estimatedHours, 0);
    const totalActualHours = siteDevNodes.reduce((sum, n) => sum + n.actualHours, 0);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      delayedTasks,
      totalProgress: Math.round(totalProgress),
      totalBudget,
      actualCost,
      costEfficiency: Math.round((actualCost / totalBudget) * 100),
      totalEstimatedHours,
      totalActualHours,
      timeEfficiency: Math.round((totalActualHours / totalEstimatedHours) * 100),
    };
  };

  const stats = calculateStats();

  // フェーズ別の進捗状況
  const phaseProgress = siteDevNodes
    .filter(n => n.level === 0)
    .map(phase => ({
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
                      variant={phase.status === 'completed' ? 'outline' : 
                              phase.status === 'in-progress' ? 'default' : 'secondary'}
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
            <div className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</div>
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
              {siteDevNodes.filter(n => n.risks.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              リスクのあるタスク
            </p>
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
                nodes={siteDevNodes}
                startDate={new Date(siteDevProject.startDate)}
                endDate={new Date(siteDevProject.endDate)}
                onNodeClick={setSelectedNode}
                onProgressUpdate={() => {}} // 読み取り専用
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tree" className="mt-4">
          <Card>
            <CardContent>
              <WBSTreeView
                nodes={siteDevNodes}
                onNodeClick={setSelectedNode}
                onNodeUpdate={async () => {}} // 読み取り専用
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
                      <Badge key={index} variant="outline">{item}</Badge>
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