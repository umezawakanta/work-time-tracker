// Enhanced simple server for todo API with proper error handling
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ status: 'OK', message: 'Simple server running' });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('✅ POST /api/auth/login called');
  console.log('📨 Login request headers:', req.headers);
  console.log('📝 Login request body:', req.body);
  console.log('🌐 Login request origin:', req.get('origin'));

  const { email, password } = req.body;

  // Simple mock authentication - always success for development
  if (email && password) {
    const mockUser = {
      id: 'user_' + Date.now(),
      email: email,
      name: email.split('@')[0],
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const mockToken = 'mock_jwt_token_' + Date.now();

    res.json({
      success: true,
      message: 'Login successful',
      user: mockUser,
      token: mockToken,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required',
      timestamp: new Date().toISOString(),
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  console.log('✅ POST /api/auth/register called');
  console.log('📝 Register request body:', req.body);

  const { email, password, name } = req.body;

  if (email && password) {
    const mockUser = {
      id: 'user_' + Date.now(),
      email: email,
      name: name || email.split('@')[0],
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const mockToken = 'mock_jwt_token_' + Date.now();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: mockUser,
      token: mockToken,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required',
      timestamp: new Date().toISOString(),
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  console.log('✅ POST /api/auth/logout called');
  res.json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/auth/me', (req, res) => {
  console.log('✅ GET /api/auth/me called');

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const mockUser = {
      id: 'user_123',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      user: mockUser,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Unauthorized - No valid token provided',
      timestamp: new Date().toISOString(),
    });
  }
});

// /api/auth/check エンドポイントを追加
app.get('/api/auth/check', (req: Request, res: Response) => {
  console.log('✅ GET /api/auth/check called');

  // 開発環境用の固定レスポンス
  res.json({
    isAuthenticated: true,
    user: {
      id: 'demo-user-id',
      displayName: 'Demo User',
      email: 'demo@example.com',
    },
  });
});

// /api/auth/user エンドポイントを追加
app.get('/api/auth/user', (req: Request, res: Response) => {
  console.log('✅ GET /api/auth/user called');

  // 開発環境用の固定レスポンス
  res.json({
    user: {
      id: 'demo-user-id',
      _id: 'demo-user-id',
      displayName: 'Demo User',
      email: 'demo@example.com',
      isAdmin: false,
    },
  });
});

// MongoDB風の高度なメモリストレージ
interface TodoDocument {
  id: string;
  _id: string;
  task: string;
  completed: boolean;
  priority: number;
  isPrioritized: boolean;
  type: 'input' | 'output' | 'idea' | 'meeting';
  category?: string;
  tags?: string[];
  deadline?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedTime?: number;
  actualTime?: number;
}

interface UserDocument {
  id: string;
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: 'ja' | 'en';
    notifications: boolean;
  };
}

// MongoDB風データストレージ
class MemoryDatabase {
  private todos: TodoDocument[] = [];
  private users: UserDocument[] = [];
  private idCounter = 1000;

  constructor() {
    // 初期データの挿入
    this.insertInitialData();
  }

  private generateId(): string {
    return (++this.idCounter).toString();
  }

  private insertInitialData() {
    this.todos = [
      {
        id: '1001',
        _id: '1001',
        task: 'AI機能のテスト',
        completed: false,
        priority: 1,
        isPrioritized: true,
        type: 'input',
        category: 'development',
        tags: ['AI', 'テスト'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedTime: 60,
      },
      {
        id: '1002',
        _id: '1002',
        task: 'データベース設計',
        completed: false,
        priority: 2,
        isPrioritized: false,
        type: 'output',
        category: 'design',
        tags: ['データベース', '設計'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedTime: 120,
      },
    ];

    this.users = [
      {
        id: 'user1001',
        _id: 'user1001',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          language: 'ja',
          notifications: true,
        },
      },
    ];
  }

  // MongoDB風のFind操作
  findTodos(
    filter: Partial<TodoDocument> = {},
    options: {
      sort?: { [key: string]: 1 | -1 };
      limit?: number;
      skip?: number;
    } = {}
  ): TodoDocument[] {
    let results = this.todos.filter((todo) => {
      return Object.entries(filter).every(([key, value]) => {
        if (key === 'tags' && Array.isArray(value)) {
          return value.some((tag) => todo.tags?.includes(tag));
        }
        return todo[key as keyof TodoDocument] === value;
      });
    });

    // ソート
    if (options.sort) {
      const sortField = Object.keys(options.sort)[0] as keyof Todo;
      const sortOrder = options.sort[sortField];
      results.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        // undefined チェックを追加
        if (aVal === undefined || bVal === undefined) {
          return 0;
        }
        
        if (sortOrder === 1) {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    // ページネーション
    if (options.skip) results = results.slice(options.skip);
    if (options.limit) results = results.slice(0, options.limit);

    return results;
  }

  // MongoDB風のInsert操作
  insertTodo(todoData: Partial<TodoDocument>): TodoDocument {
    const id = this.generateId();
    const newTodo: TodoDocument = {
      id,
      _id: id,
      task: todoData.task || 'New Task',
      completed: false,
      priority: todoData.priority || 3,
      isPrioritized: todoData.isPrioritized || false,
      type: todoData.type || 'input',
      category: todoData.category || 'general',
      tags: todoData.tags || [],
      deadline: todoData.deadline,
      userId: todoData.userId || 'user1001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedTime: todoData.estimatedTime,
    };

    this.todos.push(newTodo);
    return newTodo;
  }

  // MongoDB風のUpdate操作
  updateTodo(id: string, updateData: Partial<TodoDocument>): TodoDocument | null {
    const index = this.todos.findIndex((todo) => todo.id === id || todo._id === id);
    if (index === -1) return null;

    const updated: TodoDocument = {
      ...this.todos[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    if (updateData.completed && !this.todos[index].completed) {
      updated.completedAt = new Date().toISOString();
    }

    this.todos[index] = updated;
    return updated;
  }

  // MongoDB風のDelete操作
  deleteTodo(id: string): TodoDocument | null {
    const index = this.todos.findIndex((todo) => todo.id === id || todo._id === id);
    if (index === -1) return null;

    const deleted = this.todos.splice(index, 1)[0];
    return deleted;
  }

  // 統計情報の取得
  getTodoStats(userId?: string): {
    total: number;
    completed: number;
    pending: number;
    prioritized: number;
    byCategory: { [key: string]: number };
    byType: { [key: string]: number };
  } {
    const userTodos = userId ? this.todos.filter((todo) => todo.userId === userId) : this.todos;

    const stats = {
      total: userTodos.length,
      completed: userTodos.filter((todo) => todo.completed).length,
      pending: userTodos.filter((todo) => !todo.completed).length,
      prioritized: userTodos.filter((todo) => todo.isPrioritized).length,
      byCategory: {} as { [key: string]: number },
      byType: {} as { [key: string]: number },
    };

    userTodos.forEach((todo) => {
      // カテゴリ別集計
      const category = todo.category || 'uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // タイプ別集計
      stats.byType[todo.type] = (stats.byType[todo.type] || 0) + 1;
    });

    return stats;
  }
}

// グローバルデータベースインスタンス
const memoryDB = new MemoryDatabase();

// GET todos with MongoDB風クエリ機能
app.get('/api/todos', (req, res) => {
  console.log('✅ GET /api/todos called');

  try {
    // クエリパラメータの解析
    const {
      completed,
      priority,
      category,
      type,
      tags,
      sort = 'createdAt',
      order = 'desc',
      limit,
      skip,
    } = req.query;

    // フィルター条件の構築
    const filter: any = {};
    if (completed !== undefined) filter.completed = completed === 'true';
    if (priority) filter.priority = parseInt(priority as string);
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (tags) filter.tags = (tags as string).split(',');

    // ソートオプションの構築
    const sortOptions: any = {};
    sortOptions[sort as string] = order === 'asc' ? 1 : -1;

    // ページネーション
    const options: any = {};
    if (sort) options.sort = sortOptions;
    if (limit) options.limit = parseInt(limit as string);
    if (skip) options.skip = parseInt(skip as string);

    const todos = memoryDB.findTodos(filter, options);
    const stats = memoryDB.getTodoStats();

    console.log(`📊 Filtered todos count: ${todos.length} (total: ${stats.total})`);
    console.log(`🔍 Applied filters:`, filter);
    console.log(`📈 Stats:`, stats);

    // フロントエンドの互換性を保つため、todosの配列を直接返す
    res.json(todos);
  } catch (error) {
    console.error('❌ Error in GET /api/todos:', error);
    res.status(500).json({
      error: 'Failed to fetch todos',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Debug endpoint to test connectivity
app.get('/api/debug', (req, res) => {
  console.log('🔍 Debug endpoint called');
  res.json({
    success: true,
    message: 'Debug endpoint working',
    server: 'server-simple.ts',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    query: req.query,
  });
});

// POST todos with validation
app.post('/api/todos', (req, res) => {
  console.log('✅ POST /api/todos called');
  console.log('📝 Request body:', req.body);

  try {
    // バリデーション
    const { task, priority, isPrioritized, type, category, tags, deadline, estimatedTime } =
      req.body;

    if (!task || task.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Task is required and cannot be empty',
      });
    }

    if (priority && (priority < 1 || priority > 5)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Priority must be between 1 and 5',
      });
    }

    // 新しいTODOの作成
    const todoData = {
      task: task.trim(),
      priority: priority || 3,
      isPrioritized: isPrioritized || false,
      type: type || 'input',
      category: category || 'general',
      tags: Array.isArray(tags) ? tags : [],
      deadline: deadline || undefined,
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      userId: 'user1001', // デモユーザー
    };

    const newTodo = memoryDB.insertTodo(todoData);
    const stats = memoryDB.getTodoStats();

    console.log(`📝 Todo created successfully. ID: ${newTodo.id}`);
    console.log(`📊 Updated stats:`, stats);

    // フロントエンドの互換性を保つため、TODOオブジェクトを直接返す
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('❌ Error in POST /api/todos:', error);
    res.status(500).json({
      error: 'Failed to create todo',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT todos/:id (更新) with enhanced validation
app.put('/api/todos/:id', (req, res) => {
  console.log('✅ PUT /api/todos/:id called');
  console.log('📝 ID:', req.params.id);
  console.log('📝 Update data:', req.body);

  try {
    const todoId = req.params.id;
    const { task, priority, isPrioritized, type, category, tags, deadline, completed, actualTime } =
      req.body;

    // バリデーション
    if (task !== undefined && (!task || task.trim().length === 0)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Task cannot be empty',
      });
    }

    // 更新データの準備
    const updateData: any = {};
    if (task !== undefined) updateData.task = task.trim();
    if (priority !== undefined) updateData.priority = priority;
    if (isPrioritized !== undefined) updateData.isPrioritized = isPrioritized;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (deadline !== undefined) updateData.deadline = deadline;
    if (completed !== undefined) updateData.completed = completed;
    if (actualTime !== undefined) updateData.actualTime = parseInt(actualTime);

    const updatedTodo = memoryDB.updateTodo(todoId, updateData);

    if (!updatedTodo) {
      console.log(`❌ Todo not found with ID: ${todoId}`);
      return res.status(404).json({
        error: 'Todo not found',
        message: `Todo with ID ${todoId} does not exist`,
      });
    }

    const stats = memoryDB.getTodoStats();
    console.log(`✅ Todo updated successfully: ${updatedTodo.task}`);

    res.json(updatedTodo); // フロントエンドの互換性のため、直接todoオブジェクトを返す
  } catch (error) {
    console.error('❌ Error in PUT /api/todos/:id:', error);
    res.status(500).json({
      error: 'Failed to update todo',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE todos/:id (削除)
app.delete('/api/todos/:id', (req, res) => {
  console.log('✅ DELETE /api/todos/:id called');
  console.log('📝 ID:', req.params.id);

  try {
    const todoId = req.params.id;
    const deletedTodo = memoryDB.deleteTodo(todoId);

    if (!deletedTodo) {
      console.log(`❌ Todo not found with ID: ${todoId}`);
      return res.status(404).json({
        error: 'Todo not found',
        message: `Todo with ID ${todoId} does not exist`,
      });
    }

    const stats = memoryDB.getTodoStats();
    console.log(`🗑️ Todo deleted successfully: ${deletedTodo.task}`);

    res.json({
      success: true,
      message: 'Todo deleted successfully',
      deletedTodo,
    });
  } catch (error) {
    console.error('❌ Error in DELETE /api/todos/:id:', error);
    res.status(500).json({
      error: 'Failed to delete todo',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET projects
app.get('/api/projects', (req, res) => {
  console.log('✅ GET /api/projects called');

  const demoProjects = [
    {
      id: 'proj-1',
      name: 'Work Time Tracker',
      description: 'ADHD特化型時間管理アプリケーション',
      status: 'active',
      progress: 75,
      priority: 'high',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      tags: ['React', 'TypeScript', 'Node.js'],
      tasks: [
        { id: 'task-1', title: 'フロントエンド開発', completed: true },
        { id: 'task-2', title: 'バックエンドAPI', completed: true },
        { id: 'task-3', title: 'デプロイメント', completed: false },
      ],
    },
    {
      id: 'proj-2',
      name: 'AI統合システム',
      description: 'Gemini AIを活用したタスク分析システム',
      status: 'active',
      progress: 60,
      priority: 'medium',
      startDate: '2024-02-01',
      endDate: '2024-06-30',
      tags: ['AI', 'Machine Learning', 'API'],
      tasks: [
        { id: 'task-4', title: 'AI API統合', completed: true },
        { id: 'task-5', title: 'データ分析機能', completed: false },
      ],
    },
  ];

  res.json({
    success: true,
    data: demoProjects,
    message: 'Projects retrieved successfully',
  });
});

// 404 Error handler - must be after all routes
app.use((req: Request, res: Response): void => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('🚨 Global Error Handler:');
  console.error('Error:', err);
  console.error('Request:', req.method, req.url);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Route debugging - log all registered routes
console.log('\n🗺️  Registered Routes:');
console.log('   GET  /api/health');
console.log('   GET  /api/debug');
console.log('   POST /api/auth/login');
console.log('   POST /api/auth/register');
console.log('   POST /api/auth/logout');
console.log('   GET  /api/auth/me');
console.log('   GET  /api/auth/check'); // 追加
console.log('   GET  /api/auth/user'); // 追加
console.log('   GET  /api/todos');
console.log('   POST /api/todos');
console.log('   PUT  /api/todos/:id'); // 追加
console.log('   DELETE /api/todos/:id'); // 追加
console.log('   GET  /api/projects'); // 追加

app.listen(PORT, () => {
  console.log(`\n✅ Enhanced server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Todos: http://localhost:${PORT}/api/todos`);
  console.log('🔍 Debug mode enabled - detailed logging active\n');
});
