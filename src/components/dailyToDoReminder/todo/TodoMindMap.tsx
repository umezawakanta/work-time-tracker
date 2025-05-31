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

interface TodoMindMapProps {
  todos: readonly Todo[];
  onClose: () => void;
}

type ViewMode = 'category' | 'status';

export const TodoMindMap: React.FC<TodoMindMapProps> = ({ todos, onClose }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // ノードとエッジの生成
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return viewMode === 'category' ? convertTodosToMindMap(todos) : convertTodosByStatus(todos);
  }, [todos, viewMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);

  // Rest of the component code...

  return <div>{/* Render your ReactFlow component here */}</div>;
};
