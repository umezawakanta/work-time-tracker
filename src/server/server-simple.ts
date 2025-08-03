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

// メモリ内TODOストレージ
let todos: any[] = [
  {
    id: '1',
    _id: '1',
    task: 'サンプルタスク1',
    completed: false,
    priority: 3,
    isPrioritized: true,
    type: 'input',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    _id: '2',
    task: 'サンプルタスク2',
    completed: false,
    priority: 2,
    isPrioritized: false,
    type: 'output',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET todos
app.get('/api/todos', (req, res) => {
  console.log('✅ GET /api/todos called');
  console.log(`📊 Current todos count: ${todos.length}`);
  res.json(todos);
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

// POST todos
app.post('/api/todos', (req, res) => {
  console.log('✅ POST /api/todos called');
  console.log('📨 Request headers:', req.headers);
  console.log('📝 Request body:', req.body);
  console.log('🌐 Request origin:', req.get('origin'));

  const newTodo = {
    id: Date.now().toString(),
    _id: Date.now().toString(),
    task: req.body.task || 'New Task',
    completed: false,
    priority: req.body.priority || 3,
    isPrioritized: req.body.isPrioritized || false,
    type: req.body.type || 'input',
    category: req.body.category || 'general',
    tags: req.body.tags || [],
    deadline: req.body.deadline || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // メモリに追加
  todos.push(newTodo);
  console.log(`📝 Todo added to memory. Total: ${todos.length}`);
  console.log(`🆔 New Todo ID: ${newTodo.id}`);

  // TODOオブジェクトを直接返す（Redux storeが期待する形式）
  res.status(201).json(newTodo);
});

// PUT todos/:id (更新)
app.put('/api/todos/:id', (req, res) => {
  console.log('✅ PUT /api/todos/:id called');
  console.log('📝 ID:', req.params.id);
  console.log('📝 Update data:', req.body);

  const todoId = req.params.id;
  const todoIndex = todos.findIndex(todo => todo.id === todoId || todo._id === todoId);

  if (todoIndex === -1) {
    console.log(`❌ Todo not found with ID: ${todoId}`);
    return res.status(404).json({
      success: false,
      message: `Todo not found with ID: ${todoId}`,
    });
  }

  // TODOを更新
  todos[todoIndex] = {
    ...todos[todoIndex],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  console.log(`✅ Todo updated: ${todos[todoIndex].task}`);
  res.json(todos[todoIndex]);
});

// DELETE todos/:id (削除)
app.delete('/api/todos/:id', (req, res) => {
  console.log('✅ DELETE /api/todos/:id called');
  console.log('📝 ID:', req.params.id);

  const todoId = req.params.id;
  const todoIndex = todos.findIndex(todo => todo.id === todoId || todo._id === todoId);

  if (todoIndex === -1) {
    console.log(`❌ Todo not found with ID: ${todoId}`);
    return res.status(404).json({
      success: false,
      message: `Todo not found with ID: ${todoId}`,
    });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];
  console.log(`🗑️ Todo deleted: ${deletedTodo.task}`);
  
  res.json({
    success: true,
    message: 'Todo deleted successfully',
    deletedTodo,
  });
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
