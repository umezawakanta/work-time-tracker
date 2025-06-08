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

// メモリ内ストレージ（デモ用）
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
    userId: 'demo-user',
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
    userId: 'demo-user',
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
    userId: 'demo-user',
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
    userId: 'demo-user',
  },
  {
    id: 'demo-todo-5',
    _id: 'demo-todo-5',
    task: 'WBS実績データ統合テスト',
    completed: false,
    priority: 3,
    isPrioritized: false,
    type: 'output',
    createdAt: new Date().toISOString(),
    completedDate: null,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'testing',
    tags: ['WBS', '実績', 'テスト'],
    note: '実際の工数・日付データの反映機能テスト',
    estimatedDuration: 5,
    userId: 'demo-user',
  },
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
      message: '認証が必要です',
    });
  }

  try {
    if (req.method === 'GET') {
      // Todo一覧取得
      const { completed, type, priority, tags } = req.query;

      let filteredTodos = [...todos];

      // フィルター適用
      if (completed !== undefined) {
        const isCompleted = completed === 'true';
        filteredTodos = filteredTodos.filter((todo) => todo.completed === isCompleted);
      }

      if (type && typeof type === 'string') {
        filteredTodos = filteredTodos.filter((todo) => todo.type === type);
      }

      if (priority && typeof priority === 'string') {
        const priorityNum = parseInt(priority);
        filteredTodos = filteredTodos.filter((todo) => todo.priority >= priorityNum);
      }

      if (tags && typeof tags === 'string') {
        const tagList = tags.split(',');
        filteredTodos = filteredTodos.filter(
          (todo) => todo.tags && todo.tags.some((tag) => tagList.includes(tag))
        );
      }

      // 作成日時順でソート（新しい順）
      filteredTodos.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log('✅ Todo一覧取得:', {
        total: todos.length,
        filtered: filteredTodos.length,
        filters: { completed, type, priority, tags },
      });

      return res.status(200).json({
        success: true,
        data: filteredTodos,
        total: filteredTodos.length,
        message: 'Todo一覧を取得しました',
      });
    } else if (req.method === 'POST') {
      // Todo作成
      const {
        task,
        priority = 3,
        type = 'input',
        deadline,
        category,
        tags,
        note,
        estimatedDuration,
      } = req.body;

      if (!task || !task.trim()) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'タスク内容は必須です',
        });
      }

      const newTodo: TodoItem = {
        id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        _id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        task: task.trim(),
        completed: false,
        priority: Math.max(1, Math.min(5, priority)),
        isPrioritized: priority >= 4,
        type: type as 'input' | 'output',
        createdAt: new Date().toISOString(),
        completedDate: null,
        deadline,
        category,
        tags: Array.isArray(tags) ? tags : [],
        note,
        estimatedDuration,
        userId: 'demo-user',
      };

      todos.unshift(newTodo); // 先頭に追加

      console.log('✅ Todo作成:', {
        id: newTodo.id,
        task: newTodo.task,
        priority: newTodo.priority,
        type: newTodo.type,
      });

      return res.status(201).json({
        success: true,
        data: newTodo,
        message: 'Todoを作成しました',
      });
    } else {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: 'サポートされていないHTTPメソッドです',
      });
    }
  } catch (error) {
    console.error('❌ Todo API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'サーバーエラーが発生しました',
    });
  }
}
