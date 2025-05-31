import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Network, Layers, Download, Maximize2 } from 'lucide-react';
import { Todo } from '../types';
import { convertTodosToMindMap, convertTodosByStatus } from './mindMapUtils';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { CustomMindMapNode } from './CustomMindMapNode';

interface TodoMindMapProps {
  todos: readonly Todo[];
  onClose: () => void;
}

type ViewMode = 'category' | 'status';

const nodeTypes = {
  custom: CustomMindMapNode,
};

export const TodoMindMap: React.FC<TodoMindMapProps> = ({ todos, onClose }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // ノードとエッジの生成
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return viewMode === 'category' ? convertTodosToMindMap(todos) : convertTodosByStatus(todos);
  }, [todos, viewMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);

  // ノードクリックハンドラー
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // ビューモード変更時の処理
  const handleViewModeChange = useCallback(
    (newMode: ViewMode) => {
      setViewMode(newMode);
      const { nodes: newNodes, edges: newEdges } =
        newMode === 'category' ? convertTodosToMindMap(todos) : convertTodosByStatus(todos);
      setNodes(newNodes);
      setEdges(newEdges as Edge[]);
    },
    [todos, setNodes, setEdges]
  );

  // スクリーンショット機能
  const handleDownload = useCallback(async () => {
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    try {
      const canvas = await html2canvas(flowElement);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `todo-mindmap-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
      toast.success('マインドマップを保存しました');
    } catch (error) {
      toast.error('保存に失敗しました');
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[95vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-4">
            <Network className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">タスクマインドマップ</h2>
            <Badge variant="secondary">{todos.length} タスク</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={handleViewModeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="表示モード" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    カテゴリー別
                  </div>
                </SelectItem>
                <SelectItem value="status">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    ステータス別
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              保存
            </Button>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* マインドマップ本体 */}
        <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-gray-100">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.4,
              includeHiddenNodes: false,
              maxZoom: 1.5,
              minZoom: 0.5,
            }}
            attributionPosition="bottom-left"
            defaultEdgeOptions={{
              animated: true,
              type: 'smoothstep',
              style: {
                strokeWidth: 2,
              },
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
            <Controls className="bg-white shadow-lg rounded-lg" />
            <MiniMap
              className="bg-white shadow-lg rounded-lg"
              nodeColor={(node) => {
                if (node.data.type === 'root') return '#6366f1';
                if (node.data.type === 'category') return '#8b5cf6';
                if (node.data.type === 'priority') return '#ec4899';
                if (node.data.type === 'status') return '#3b82f6';
                return '#6b7280';
              }}
            />
          </ReactFlow>
        </div>

        {/* 選択中のノード情報 */}
        {selectedNode && selectedNode.data.todo && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{selectedNode.data.todo.text}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-500">
                    優先度: {selectedNode.data.todo.priority}
                  </span>
                  {selectedNode.data.todo.category && (
                    <span className="text-sm text-gray-500">
                      カテゴリー: {selectedNode.data.todo.category}
                    </span>
                  )}
                  {selectedNode.data.todo.estimatedDuration && (
                    <span className="text-sm text-gray-500">
                      予想時間: {selectedNode.data.todo.estimatedDuration}分
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                閉じる
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
