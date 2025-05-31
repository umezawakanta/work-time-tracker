import { Todo } from '../types';
import { Node, Edge } from 'reactflow';

export interface MindMapNode extends Node {
  data: {
    label: string;
    todo?: Todo;
    type: 'root' | 'category' | 'priority' | 'status' | 'task';
    count?: number;
  };
}

export type MindMapEdge = Edge & {
  animated?: boolean;
};

// ToDoリストをマインドマップ用のノードとエッジに変換
export const convertTodosToMindMap = (todos: readonly Todo[]) => {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  // ルートノード
  const rootNode: MindMapNode = {
    id: 'root',
    type: 'input',
    data: { label: 'タスク管理', type: 'root', count: todos.length },
    position: { x: 400, y: 200 },
  };
  nodes.push(rootNode);

  // カテゴリー別グループ
  const categories = groupByCategory(todos);
  const categoryY = 50;
  let categoryX = 0;

  Object.entries(categories).forEach(([category, categoryTodos], index) => {
    const categoryId = `category-${index}`;
    categoryX = index * 300;

    // カテゴリーノード
    nodes.push({
      id: categoryId,
      data: {
        label: category || '未分類',
        type: 'category',
        count: categoryTodos.length,
      },
      position: { x: categoryX, y: categoryY },
    });

    // ルートからカテゴリーへのエッジ
    edges.push({
      id: `root-${categoryId}`,
      source: 'root',
      target: categoryId,
      animated: true,
    });

    // 優先度別サブグループ
    const priorityGroups = groupByPriority(categoryTodos);
    let priorityY = categoryY - 100;

    Object.entries(priorityGroups).forEach(([priority, priorityTodos], pIndex) => {
      const priorityId = `${categoryId}-priority-${pIndex}`;
      const priorityX = categoryX + (pIndex - 1) * 150;
      priorityY = categoryY - 100 - pIndex * 50;

      // 優先度ノード
      nodes.push({
        id: priorityId,
        data: {
          label: getPriorityLabel(Number(priority)),
          type: 'priority',
          count: priorityTodos.length,
        },
        position: { x: priorityX, y: priorityY },
        style: getPriorityStyle(Number(priority)),
      });

      // カテゴリーから優先度へのエッジ
      edges.push({
        id: `${categoryId}-${priorityId}`,
        source: categoryId,
        target: priorityId,
      });

      // 各タスクノード
      priorityTodos.forEach((todo, tIndex) => {
        const taskId = `task-${todo.id}`;
        const taskX = priorityX + (tIndex % 2 === 0 ? -50 : 50);
        const taskY = priorityY - 80 - Math.floor(tIndex / 2) * 60;

        nodes.push({
          id: taskId,
          type: 'output',
          data: {
            label: truncateText(todo.text, 20),
            todo,
            type: 'task',
          },
          position: { x: taskX, y: taskY },
          style: getTaskStyle(todo),
        });

        // 優先度からタスクへのエッジ
        edges.push({
          id: `${priorityId}-${taskId}`,
          source: priorityId,
          target: taskId,
          style: { stroke: todo.completed ? '#10b981' : '#6b7280' },
        });
      });
    });
  });

  return { nodes, edges };
};

// ステータス別グループ化バージョン
export const convertTodosByStatus = (todos: readonly Todo[]) => {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  // ルートノード
  const rootNode: MindMapNode = {
    id: 'root',
    type: 'input',
    data: { label: 'タスクステータス', type: 'root', count: todos.length },
    position: { x: 400, y: 300 },
  };
  nodes.push(rootNode);

  // ステータス別グループ
  const statusGroups = {
    prioritized: todos.filter((t) => !t.completed && t.isPrioritized),
    active: todos.filter((t) => !t.completed && !t.isPrioritized),
    completed: todos.filter((t) => t.completed),
  };

  const statusConfig = [
    { key: 'prioritized', label: '重要タスク', color: '#ef4444', x: 100 },
    { key: 'active', label: '進行中', color: '#3b82f6', x: 400 },
    { key: 'completed', label: '完了', color: '#10b981', x: 700 },
  ];

  statusConfig.forEach(({ key, label, color, x }) => {
    const statusTodos = statusGroups[key as keyof typeof statusGroups];
    const statusId = `status-${key}`;

    // ステータスノード
    nodes.push({
      id: statusId,
      data: { label, type: 'status', count: statusTodos.length },
      position: { x, y: 150 },
      style: { backgroundColor: color, color: 'white' },
    });

    // ルートからステータスへのエッジ
    edges.push({
      id: `root-${statusId}`,
      source: 'root',
      target: statusId,
      style: { stroke: color },
      animated: true,
    });

    // 各タスク
    statusTodos.forEach((todo, index) => {
      const taskId = `task-${todo.id}`;
      const angle = index * 30 - (statusTodos.length - 1) * 15;
      const radius = 120;
      const taskX = x + radius * Math.cos((angle * Math.PI) / 180);
      const taskY = 150 - radius * Math.sin((angle * Math.PI) / 180);

      nodes.push({
        id: taskId,
        type: 'output',
        data: {
          label: truncateText(todo.text, 20),
          todo,
          type: 'task',
        },
        position: { x: taskX, y: taskY },
        style: getTaskStyle(todo),
      });

      edges.push({
        id: `${statusId}-${taskId}`,
        source: statusId,
        target: taskId,
        style: { stroke: color },
      });
    });
  });

  return { nodes, edges };
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
    fontSize: '12px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
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
      fontWeight: 'bold',
    };
  }

  return {
    ...baseStyle,
    backgroundColor: '#f9fafb',
  };
};

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
