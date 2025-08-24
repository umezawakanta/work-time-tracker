import { Todo } from '../types';
import { Node, Edge, Position } from 'reactflow';
import dagre from 'dagre';

export interface MindMapNode extends Node {
  data: {
    label: string;
    todo?: Todo;
    type: 'root' | 'category' | 'priority' | 'status' | 'task';
    count?: number;
    icon?: string;
    priority?: number;
  };
}

export type MindMapEdge = Edge & {
  animated?: boolean;
};

// Dagreを使用した自動レイアウト関数（改善版）
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // ノードサイズを大きくし、タイプに応じて調整
  const getNodeDimensions = (node: Node) => {
    const baseWidth = 200;
    const baseHeight = 60;

    switch (node.data?.type) {
      case 'root':
        return { width: baseWidth + 50, height: baseHeight + 20 };
      case 'category':
      case 'status':
        return { width: baseWidth + 30, height: baseHeight + 10 };
      case 'priority':
        return { width: baseWidth, height: baseHeight };
      case 'task':
        return { width: baseWidth + 20, height: baseHeight };
      default:
        return { width: baseWidth, height: baseHeight };
    }
  };

  // グラフのレイアウト設定を改善
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 150, // ランク間の距離を増やす
    nodesep: 80, // ノード間の距離を増やす
    edgesep: 50, // エッジ間の距離
    marginx: 40, // 水平マージン
    marginy: 40, // 垂直マージン
  });

  nodes.forEach((node) => {
    const dimensions = getNodeDimensions(node);
    dagreGraph.setNode(node.id, dimensions);
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const dimensions = getNodeDimensions(node);

    node.targetPosition = 'top' as Position;
    node.sourcePosition = 'bottom' as Position;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - dimensions.width / 2,
        y: nodeWithPosition.y - dimensions.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// 改善されたマインドマップ変換関数
export const convertTodosToMindMap = (todos: readonly Todo[]) => {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  // ルートノード
  const rootNode: MindMapNode = {
    id: 'root',
    type: 'custom',
    data: {
      label: 'タスク管理',
      type: 'root',
      count: todos.length,
      icon: '🎯',
    },
    position: { x: 0, y: 0 },
  };
  nodes.push(rootNode);

  // カテゴリー別グループ
  const categories = groupByCategory(todos);

  Object.entries(categories).forEach(([category, categoryTodos], index) => {
    const categoryId = `category-${index}`;

    // カテゴリーノード
    nodes.push({
      id: categoryId,
      type: 'custom',
      data: {
        label: category || '未分類',
        type: 'category',
        count: categoryTodos.length,
        icon: getCategoryIcon(category),
      },
      position: { x: 0, y: 0 },
    });

    // ルートからカテゴリーへのエッジ
    edges.push({
      id: `root-${categoryId}`,
      source: 'root',
      target: categoryId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    });

    // 優先度別サブグループ
    const priorityGroups = groupByPriority(categoryTodos);

    Object.entries(priorityGroups).forEach(([priority, priorityTodos], pIndex) => {
      const priorityId = `${categoryId}-priority-${pIndex}`;

      // 優先度ノード
      nodes.push({
        id: priorityId,
        type: 'custom',
        data: {
          label: getPriorityLabel(Number(priority)),
          type: 'priority',
          count: priorityTodos.length,
          priority: Number(priority),
        },
        position: { x: 0, y: 0 },
        style: getPriorityStyle(Number(priority)),
      });

      // カテゴリーから優先度へのエッジ
      edges.push({
        id: `${categoryId}-${priorityId}`,
        source: categoryId,
        target: priorityId,
        type: 'smoothstep',
      });

      // 各タスクノード
      priorityTodos.forEach((todo, _tIndex) => {
        const taskId = `task-${todo.id}`;

        nodes.push({
          id: taskId,
          type: 'custom',
          data: {
            label: truncateText(todo.text, 30),
            todo,
            type: 'task',
          },
          position: { x: 0, y: 0 },
          style: getTaskStyle(todo),
        });

        // 優先度からタスクへのエッジ
        edges.push({
          id: `${priorityId}-${taskId}`,
          source: priorityId,
          target: taskId,
          style: {
            stroke: todo.completed ? '#10b981' : '#6b7280',
            strokeWidth: todo.completed ? 1 : 2,
          },
        });
      });
    });
  });

  // 自動レイアウトを適用
  return getLayoutedElements(nodes, edges, 'TB');
};

// カテゴリーアイコンを取得
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    仕事: '💼',
    プライベート: '🏠',
    学習: '📚',
    健康: '🏃',
    買い物: '🛒',
    未分類: '📋',
  };
  return iconMap[category] || '📋';
};

// ステータス別グループ化バージョン（修正版）
export const convertTodosByStatus = (todos: readonly Todo[]) => {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  // ルートノード
  const rootNode: MindMapNode = {
    id: 'root',
    type: 'custom', // 'input' から 'custom' に変更
    data: {
      label: 'タスクステータス',
      type: 'root',
      count: todos.length,
      icon: '📊',
    },
    position: { x: 0, y: 0 },
  };
  nodes.push(rootNode);

  // ステータス別グループ
  const statusGroups = {
    prioritized: todos.filter((t) => !t.completed && t.isPrioritized),
    active: todos.filter((t) => !t.completed && !t.isPrioritized),
    completed: todos.filter((t) => t.completed),
  };

  const statusConfig = [
    { key: 'prioritized', label: '重要タスク', color: '#ef4444', icon: '🔥' },
    { key: 'active', label: '進行中', color: '#3b82f6', icon: '⚡' },
    { key: 'completed', label: '完了', color: '#10b981', icon: '✅' },
  ];

  statusConfig.forEach(({ key, label, color, icon }, statusIndex) => {
    const statusTodos = statusGroups[key as keyof typeof statusGroups];
    const statusId = `status-${key}`;

    // ステータスノード
    nodes.push({
      id: statusId,
      type: 'custom', // typeを追加
      data: {
        label,
        type: 'status',
        count: statusTodos.length,
        icon,
      },
      position: { x: 0, y: 0 },
      style: { backgroundColor: color, color: 'white' },
    });

    // ルートからステータスへのエッジ
    edges.push({
      id: `root-${statusId}`,
      source: 'root',
      target: statusId,
      style: { stroke: color, strokeWidth: 2 },
      animated: true,
    });

    // 各タスク
    statusTodos.forEach((todo, index) => {
      const taskId = `task-${todo.id}`;

      nodes.push({
        id: taskId,
        type: 'custom', // 'output' から 'custom' に変更
        data: {
          label: truncateText(todo.text, 30),
          todo,
          type: 'task',
        },
        position: { x: 0, y: 0 },
        style: getTaskStyle(todo),
      });

      edges.push({
        id: `${statusId}-${taskId}`,
        source: statusId,
        target: taskId,
        style: {
          stroke: color,
          strokeWidth: todo.completed ? 1 : 2,
        },
      });
    });
  });

  // 自動レイアウトを適用
  return getLayoutedElements(nodes, edges, 'TB');
};

// ヘルパー関数
const groupByCategory = (todos: readonly Todo[]) => {
  return todos.reduce(
    (acc, todo) => {
      const category = todo.category || '未分類';
      if (!acc[category]) acc[category] = [];
      acc[category].push(todo);
      return acc;
    },
    {} as Record<string, Todo[]>
  );
};

const groupByPriority = (todos: readonly Todo[]) => {
  return todos.reduce(
    (acc, todo) => {
      const priority = todo.priority;
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(todo);
      return acc;
    },
    {} as Record<number, Todo[]>
  );
};

const getPriorityLabel = (priority: number) => {
  if (priority >= 4) return '最重要';
  if (priority >= 3) return '重要';
  if (priority >= 2) return '中';
  return '低';
};

const getPriorityStyle = (priority: number) => {
  if (priority >= 4) return { backgroundColor: '#ef4444', color: 'white' };
  if (priority >= 3) return { backgroundColor: '#f59e0b', color: 'white' };
  if (priority >= 2) return { backgroundColor: '#3b82f6', color: 'white' };
  return { backgroundColor: '#6b7280', color: 'white' };
};

const getTaskStyle = (todo: Todo) => {
  const baseStyle = {
    fontSize: '13px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '2px solid',
    transition: 'all 0.2s ease',
  };

  if (todo.completed) {
    return {
      ...baseStyle,
      backgroundColor: '#f0fdf4',
      borderColor: '#86efac',
      textDecoration: 'line-through',
      opacity: 0.7,
    };
  }

  if (todo.isPrioritized) {
    return {
      ...baseStyle,
      backgroundColor: '#fef2f2',
      borderColor: '#fca5a5',
      fontWeight: '600',
    };
  }

  return {
    ...baseStyle,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  };
};

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
