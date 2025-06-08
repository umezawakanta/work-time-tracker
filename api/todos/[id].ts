import { VercelRequest, VercelResponse } from '@vercel/node';

interface TodoItem {
  id: string;
  _id: string;
  task: string;
  completed: boolean;
  priority: number;
  isPrioritized: boolean;
  type: 'input' | 'output';
  createdAt: string;
  completedDate: string | null;
  deadline?: string;
  category?: string;
  tags?: string[];
  note?: string;
  estimatedDuration?: number;
  userId: string;
}

// 共有データストレージ（デモ用） - 実際の実装では外部データベースを使用
let todos: TodoItem[] = [
  {
    id: 'demo-todo-1',
    _id: 'demo-todo-1',
    task: 'Phase 1: 認証システム完成度確認',
    completed: true,
    priority: 5,
    isPrioritized: true,
    type: 'input',
    createdAt: new Date('2025-01-01').toISOString(),
    completedDate: new Date('2025-01-03').toISOString(),
    deadline: '2025-01-03',
    category: 'development',
    tags: ['認証', 'Phase1', '完成'],
    note: 'ログイン・ログアウト・登録・パスワードリセット機能',
    estimatedDuration: 15,
    userId: 'demo-user'
  },
  {
    id: 'demo-todo-2',
    _id: 'demo-todo-2',
    task: 'タスク管理CRUD機能の実装',
    completed: true,
    priority: 5,
    isPrioritized: true,
    type: 'output',
    createdAt: new Date('2025-01-03').toISOString(),
    completedDate: new Date('2025-01-05').toISOString(),
    deadline: '2025-01-05',
    category: 'development',
    tags: ['CRUD', 'タスク管理', 'Phase1'],
    note: '作成・読取・更新・削除機能とフィルター・ソート',
    estimatedDuration: 20,
    userId: 'demo-user'
  },
  {
    id: 'demo-todo-3',
    _id: 'demo-todo-3',
    task: 'カレンダー機能ドラッグ&ドロップ完成',
    completed: true,
    priority: 4,
    isPrioritized: true,
    type: 'output',
    createdAt: new Date('2025-01-05').toISOString(),
    completedDate: new Date('2025-01-07').toISOString(),
    deadline: '2025-01-07',
    category: 'development',
    tags: ['カレンダー', 'ドラッグ&ドロップ', 'Phase1'],
    note: 'react-big-calendarとドラッグ&ドロップ機能',
    estimatedDuration: 8,
    userId: 'demo-user'
  },
  {
    id: 'demo-todo-4',
    _id: 'demo-todo-4',
    task: 'Phase 2: AI機能統合の準備',
    completed: false,
    priority: 4,
    isPrioritized: true,
    type: 'input',
    createdAt: new Date().toISOString(),
    completedDate: null,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'development',
    tags: ['AI', 'Phase2', '準備'],
    note: 'AIタスク提案機能の基盤構築',
    estimatedDuration: 25,
    userId: 'demo-user'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 認証チェック（簡易版）
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: '認証が必要です'
    });
  }

  // URLパラメータからIDを取得
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'TodoのIDが必要です'
    });
  }

  try {
    if (req.method === 'GET') {
      // 個別Todo取得
      const todo = todos.find(t => t.id === id || t._id === id);
      
      if (!todo) {
        return res.status(404).json({
          error: 'Not Found',
          message: '指定されたTodoが見つかりません'
        });
      }

      console.log('✅ Todo取得:', { id, task: todo.task });

      return res.status(200).json({
        success: true,
        data: todo,
        message: 'Todoを取得しました'
      });

    } else if (req.method === 'PUT') {
      // Todo更新
      const todoIndex = todos.findIndex(t => t.id === id || t._id === id);
      
      if (todoIndex === -1) {
        return res.status(404).json({
          error: 'Not Found',
          message: '指定されたTodoが見つかりません'
        });
      }

      const existingTodo = todos[todoIndex];
      const updateData = req.body;

      // 更新可能なフィールドのみを更新
      const updatedTodo: TodoItem = {
        ...existingTodo,
        ...(updateData.task && { task: updateData.task.trim() }),
        ...(updateData.completed !== undefined && { 
          completed: updateData.completed,
          completedDate: updateData.completed ? new Date().toISOString() : null
        }),
        ...(updateData.priority !== undefined && { 
          priority: Math.max(1, Math.min(5, updateData.priority)),
          isPrioritized: updateData.priority >= 4
        }),
        ...(updateData.type && { type: updateData.type }),
        ...(updateData.deadline !== undefined && { deadline: updateData.deadline }),
        ...(updateData.category !== undefined && { category: updateData.category }),
        ...(updateData.tags && { tags: Array.isArray(updateData.tags) ? updateData.tags : [] }),
        ...(updateData.note !== undefined && { note: updateData.note }),
        ...(updateData.estimatedDuration !== undefined && { estimatedDuration: updateData.estimatedDuration }),
        updatedAt: new Date().toISOString()
      };

      todos[todoIndex] = updatedTodo;

      console.log('✅ Todo更新:', {
        id,
        task: updatedTodo.task,
        completed: updatedTodo.completed,
        priority: updatedTodo.priority
      });

      return res.status(200).json({
        success: true,
        data: updatedTodo,
        message: 'Todoを更新しました'
      });

    } else if (req.method === 'DELETE') {
      // Todo削除
      const todoIndex = todos.findIndex(t => t.id === id || t._id === id);
      
      if (todoIndex === -1) {
        return res.status(404).json({
          error: 'Not Found',
          message: '指定されたTodoが見つかりません'
        });
      }

      const deletedTodo = todos[todoIndex];
      todos.splice(todoIndex, 1);

      console.log('✅ Todo削除:', {
        id,
        task: deletedTodo.task
      });

      return res.status(200).json({
        success: true,
        data: { id },
        message: 'Todoを削除しました'
      });

    } else {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: 'サポートされていないHTTPメソッドです'
      });
    }

  } catch (error) {
    console.error('❌ Todo API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'サーバーエラーが発生しました'
    });
  }
} 