// src/components/features/wbs/WBSManager.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileDown, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import WBSService from '@/services/wbs/WBSService';
import { WBSNode, WBSProject } from '@/types/wbs';
import WBSGanttChart from './WBSGanttChart';
import WBSTreeView from './WBSTreeView';
import WBSNodeDialog from './WBSNodeDialog';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const WBSManager: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<WBSProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<WBSProject | null>(null);
  const [nodes, setNodes] = useState<WBSNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WBSNode | null>(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'gantt'>('gantt');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      const unsubscribe = WBSService.subscribeToProject(selectedProject.id, (updatedNodes) =>
        setNodes(updatedNodes)
      );

      return () => unsubscribe();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userProjects = await WBSService.getProjects(user.uid);
      setProjects(userProjects);

      if (userProjects.length > 0 && !selectedProject) {
        setSelectedProject(userProjects[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
    if (!user) return;

    const projectId = await WBSService.createProject(user.uid, {
      name: 'Work Time Tracker 髢狗匱險育判',
      description: '荳也阜譛鬮倥・繧ｿ繧ｹ繧ｯ邂｡逅・し繝ｼ繝薙せ繧呈ｧ狗ｯ峨☆繧九◆繧√・髢狗匱險育判',
    });

    await loadProjects();
  };

  const handleNodeUpdate = async (nodeId: string, updates: Partial<WBSNode>) => {
    if (!user) return;

    await WBSService.updateNode(nodeId, updates, user.uid);
  };

  const handleProgressUpdate = async (nodeId: string, progress: number) => {
    await handleNodeUpdate(nodeId, { progress });
  };

  const exportProject = async () => {
    if (!selectedProject) return;

    const blob = await WBSService.exportProject(selectedProject.id, {
      format: 'json',
      includeComments: true,
      includeActivities: true,
      includeRisks: true,
      dateFormat: 'yyyy-MM-dd',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProject.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateProjectStats = () => {
    const totalTasks = nodes.length;
    const completedTasks = nodes.filter((n) => n.status === 'completed').length;
    const delayedTasks = nodes.filter((n) => n.status === 'delayed').length;
    const totalBudget = nodes.reduce((sum, n) => sum + n.budget, 0);
    const actualCost = nodes.reduce((sum, n) => sum + n.actualCost, 0);

    return {
      totalTasks,
      completedTasks,
      delayedTasks,
      totalBudget,
      actualCost,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ...</div>;
  }

  const stats = calculateProjectStats();

  return (
    <div className="space-y-6">
      {/* 繝倥ャ繝繝ｼ */}
      <div className="flex justify-between items-center">
        <div>
          <h2>WBS管理</h2>
          <p className="text-muted-foreground">プロジェクトの詳細な作業分解構造を管理</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportProject} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            繧ｨ繧ｯ繧ｹ繝昴・繝・
          </Button>
          <Button onClick={() => setShowNodeDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            繧ｿ繧ｹ繧ｯ霑ｽ蜉
          </Button>
        </div>
      </div>

      {/* 繝励Ο繧ｸ繧ｧ繧ｯ繝磯∈謚・*/}
      <Card>
        <CardHeader>
          <CardTitle>プロジェクト</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto">
            {projects.map((project) => (
              <Button
                key={project.id}
                variant={selectedProject?.id === project.id ? 'default' : 'outline'}
                onClick={() => setSelectedProject(project)}
                className="whitespace-nowrap"
              >
                {project.name}
              </Button>
            ))}
            <Button variant="ghost" onClick={createNewProject}>
              <Plus className="h-4 w-4 mr-2" />
              新規プロジェクト
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedProject && (
        <>
          {/* 邨ｱ險域ュ蝣ｱ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>タスク数</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  完了 {stats.completedTasks} / 遅延: {stats.delayedTasks}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>進捗率</CardTitle>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>予算</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{stats.totalBudget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  実績: ¥{stats.actualCost.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>期限</CardTitle>
                <s className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {format(new Date(selectedProject.endDate), 'M/d', { locale: ja })}
                </div>
                <p className="text-xs text-muted-foreground">
                  開始 {format(new Date(selectedProject.startDate), 'M/d', { locale: ja })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 繝薙Η繝ｼ繝｢繝ｼ繝牙・繧頑崛縺・*/}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'tree' | 'gantt')}>
            <TabsList>
              <TabsTrigger value="gantt">ガントチャート</TabsTrigger>
              <TabsTrigger value="tree">ツリー表示</TabsTrigger>
            </TabsList>

            <TabsContent value="gantt" className="mt-4">
              <WBSGanttChart
                nodes={nodes}
                startDate={new Date(selectedProject.startDate)}
                endDate={new Date(selectedProject.endDate)}
                onNodeClick={setSelectedNode}
                onProgressUpdate={handleProgressUpdate}
              />
            </TabsContent>

            <TabsContent value="tree" className="mt-4">
              <WBSTreeView
                nodes={nodes}
                onNodeClick={setSelectedNode}
                onNodeUpdate={(nodeId) => handleNodeUpdate(nodeId, {})}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* 繝弱・繝臥ｷｨ髮・ム繧､繧｢繝ｭ繧ｰ */}
      <WBSNodeDialog
        open={showNodeDialog || !!selectedNode}
        onClose={() => {
          setShowNodeDialog(false);
          setSelectedNode(null);
        }}
        node={selectedNode}
        projectId={selectedProject?.id || ''}
        onSave={async (nodeData) => {
          if (selectedNode) {
            await handleNodeUpdate(selectedNode.id, nodeData);
          } else if (user) {
            await WBSService.createNode(
              {
                ...nodeData,
                projectId: selectedProject?.id,
              },
              user.uid
            );
          }
          setShowNodeDialog(false);
          setSelectedNode(null);
        }}
      />
    </div>
  );
};

export default WBSManager;
