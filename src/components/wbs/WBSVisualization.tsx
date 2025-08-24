import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  Users,
  Target,
  Download,
  Edit,
  Plus,
} from 'lucide-react';
import { WBSNode, GanttTask } from '@/services/ai/wbsGeneratorService';
import { cn } from '@/lib/utils';

interface WBSVisualizationProps {
  wbs: WBSNode;
  ganttData: GanttTask[];
  onTaskEdit?: (taskId: string) => void;
  onTaskAdd?: (parentId: string) => void;
  className?: string;
}

export const WBSVisualization: React.FC<WBSVisualizationProps> = ({
  wbs,
  ganttData,
  onTaskEdit,
  onTaskAdd,
  className,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([wbs.id]));
  const [selectedView, setSelectedView] = useState<'tree' | 'gantt' | 'timeline'>('tree');

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: WBSNode['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: WBSNode['status']) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'in_progress':
        return '進行中';
      default:
        return '未着手';
    }
  };

  const renderWBSNode = (node: WBSNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const indent = node.level * 24;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={cn(
            'flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors',
            node.level === 0 && 'bg-blue-50 border-blue-200',
            node.level === 1 && 'bg-gray-50'
          )}
          style={{ marginLeft: `${indent}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(node.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4
                className={cn(
                  'font-medium truncate',
                  node.level === 0 && 'text-lg',
                  node.level === 1 && 'text-base',
                  node.level >= 2 && 'text-sm'
                )}
              >
                {node.title}
              </h4>
              <Badge className={getStatusColor(node.status)} variant="secondary">
                {getStatusText(node.status)}
              </Badge>
            </div>

            {node.description && <p className="text-sm text-gray-600 mb-2">{node.description}</p>}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              {node.estimatedHours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {node.estimatedHours}h
                </div>
              )}
              {node.assignee && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {node.assignee}
                </div>
              )}
              {node.startDate && node.endDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {node.startDate.toLocaleDateString()} - {node.endDate.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onTaskAdd && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTaskAdd(node.id)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {onTaskEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTaskEdit(node.id)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-1">{node.children.map((child) => renderWBSNode(child))}</div>
        )}
      </div>
    );
  };

  const renderGanttChart = () => {
    const sortedTasks = [...ganttData].sort((a, b) => a.start.getTime() - b.start.getTime());
    const minDate = Math.min(...sortedTasks.map((t) => t.start.getTime()));
    const maxDate = Math.max(...sortedTasks.map((t) => t.end.getTime()));
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* タイムライン ヘッダー */}
            <div className="flex border-b pb-2 mb-4">
              <div className="w-64 font-medium">タスク</div>
              <div className="flex-1 grid grid-cols-7 gap-1 text-xs">
                {Array.from({ length: Math.min(totalDays, 30) }, (_, i) => {
                  const date = new Date(minDate + i * 24 * 60 * 60 * 1000);
                  return (
                    <div key={i} className="text-center p-1">
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* タスクバー */}
            {sortedTasks.map((task) => {
              const startOffset = Math.floor(
                (task.start.getTime() - minDate) / (1000 * 60 * 60 * 24)
              );
              const duration = Math.ceil(
                (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div key={task.id} className="flex items-center py-2 border-b">
                  <div className="w-64 pr-4">
                    <div className="font-medium text-sm truncate">{task.name}</div>
                    <div className="text-xs text-gray-500">
                      {task.start.toLocaleDateString()} - {task.end.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex-1 relative h-8">
                    <div
                      className="absolute top-1 bg-blue-200 h-6 rounded"
                      style={{
                        left: `${(startOffset / Math.min(totalDays, 30)) * 100}%`,
                        width: `${(duration / Math.min(totalDays, 30)) * 100}%`,
                      }}
                    >
                      <div
                        className="h-full bg-blue-600 rounded"
                        style={{ width: `${task.progress}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    const milestones = ganttData.filter((task) => task.type === 'milestone');

    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative flex items-center mb-8">
              <div className="absolute left-2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow"></div>
              <div className="ml-12">
                <div className="bg-white p-4 rounded-lg shadow border">
                  <h3 className="font-semibold">{milestone.name}</h3>
                  <p className="text-sm text-gray-600">
                    {milestone.start.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <Progress value={milestone.progress} className="mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            WBS: {wbs.title}
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tree">ツリー表示</TabsTrigger>
            <TabsTrigger value="gantt">ガントチャート</TabsTrigger>
            <TabsTrigger value="timeline">タイムライン</TabsTrigger>
          </TabsList>

          <TabsContent value="tree" className="mt-6">
            <div className="space-y-2">{renderWBSNode(wbs)}</div>
          </TabsContent>

          <TabsContent value="gantt" className="mt-6">
            {renderGanttChart()}
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            {renderTimeline()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
