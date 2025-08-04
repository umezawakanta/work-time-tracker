// Enhanced simple server for todo API with proper error handling
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import { Book } from './models/Book.js';
import { TodoModel } from './models/Todo.js';

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

// Note: MemoryDatabase removed - now using MongoDB directly

// Mapping functions to convert frontend values to schema-valid values
const mapTypeToSchema = (frontendType: string): 'task' | 'reminder' | 'goal' | 'habit' => {
  const typeMapping: Record<string, 'task' | 'reminder' | 'goal' | 'habit'> = {
    input: 'task',
    output: 'task',
    task: 'task',
    reminder: 'reminder',
    goal: 'goal',
    habit: 'habit',
  };
  return typeMapping[frontendType] || 'task';
};

const mapPriorityToSchema = (frontendPriority: any): 'low' | 'medium' | 'high' | 'critical' => {
  // Handle both numeric and string inputs
  if (typeof frontendPriority === 'number') {
    const priorityMapping: Record<number, 'low' | 'medium' | 'high' | 'critical'> = {
      1: 'critical',
      2: 'high',
      3: 'medium',
      4: 'low',
      5: 'low',
    };
    return priorityMapping[frontendPriority] || 'medium';
  }

  // Handle string inputs
  const stringMapping: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical',
  };
  return stringMapping[frontendPriority] || 'medium';
};

const mapCategoryToSchema = (
  frontendCategory: string
): 'personal' | 'work' | 'project' | 'learning' | 'health' => {
  const categoryMapping: Record<string, 'personal' | 'work' | 'project' | 'learning' | 'health'> = {
    general: 'personal',
    personal: 'personal',
    work: 'work',
    project: 'project',
    learning: 'learning',
    health: 'health',
    development: 'work',
    design: 'work',
  };
  return categoryMapping[frontendCategory] || 'personal';
};

// GET todos with MongoDB operations
app.get('/api/todos', async (req, res) => {
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
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (tags) filter.tags = { $in: (tags as string).split(',') };

    // ソートオプションの構築
    const sortOptions: any = {};
    sortOptions[sort as string] = order === 'asc' ? 1 : -1;

    // データベースからTodoを取得
    let query = TodoModel.find(filter);

    if (Object.keys(sortOptions).length > 0) {
      query = query.sort(sortOptions);
    }

    if (skip) {
      query = query.skip(parseInt(skip as string));
    }

    if (limit) {
      query = query.limit(parseInt(limit as string));
    }

    const todos = await query.exec();
    const totalCount = await TodoModel.countDocuments(filter);

    // 統計情報の生成
    const stats = {
      total: totalCount,
      completed: await TodoModel.countDocuments({ ...filter, completed: true }),
      pending: await TodoModel.countDocuments({ ...filter, completed: false }),
      byCategory: await TodoModel.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      byType: await TodoModel.aggregate([
        { $match: filter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    };

    console.log(`📊 Filtered todos count: ${todos.length} (total: ${totalCount})`);
    console.log(`🔍 Applied filters:`, filter);
    console.log(`📈 Stats:`, stats);

    // フロントエンドが期待する形式でTodoデータを変換
    const formattedTodos = todos.map((todo) => ({
      _id: todo._id.toString(),
      id: todo._id.toString(),
      task: todo.title || todo.description || '',
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      completedAt: todo.completedAt,
      priority: todo.priority,
      category: todo.category,
      type: todo.type,
      tags: todo.tags,
      dueDate: todo.dueDate,
      estimatedMinutes: todo.estimatedMinutes,
      actualMinutes: todo.actualMinutes,
      userId: todo.userId,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }));

    res.json(formattedTodos);
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
app.post('/api/todos', async (req, res) => {
  console.log('✅ POST /api/todos called');
  console.log('📝 Request body:', req.body);

  try {
    // バリデーション
    const {
      task,
      title,
      description,
      priority,
      type,
      category,
      tags,
      deadline,
      dueDate,
      estimatedTime,
      estimatedMinutes,
    } = req.body;

    const taskText = task || title || description;
    if (!taskText || taskText.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Task title or description is required and cannot be empty',
      });
    }

    // 新しいTODOの作成（フロントエンド値をスキーマ対応値にマッピング）
    const todoData = {
      title: title || taskText.trim(),
      description: description || taskText.trim(),
      priority: mapPriorityToSchema(priority),
      type: mapTypeToSchema(type || 'task'),
      category: mapCategoryToSchema(category || 'personal'),
      tags: Array.isArray(tags) ? tags : [],
      dueDate: dueDate || deadline || undefined,
      estimatedMinutes: estimatedMinutes || (estimatedTime ? parseInt(estimatedTime) : undefined),
      userId: 'user1001', // デモユーザー
      completed: false,
      source: 'manual' as const,
      context: [],
      subtodos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('📋 Mapped todo data:', {
      originalType: type,
      mappedType: todoData.type,
      originalPriority: priority,
      mappedPriority: todoData.priority,
      originalCategory: category,
      mappedCategory: todoData.category,
    });

    const newTodo = new TodoModel(todoData);
    const savedTodo = await newTodo.save();

    console.log(`📝 Todo created successfully. ID: ${savedTodo._id}`);

    // フロントエンドが期待する形式でデータを変換
    const formattedTodo = {
      _id: savedTodo._id.toString(),
      id: savedTodo._id.toString(),
      task: savedTodo.title || savedTodo.description || '',
      title: savedTodo.title,
      description: savedTodo.description,
      completed: savedTodo.completed,
      completedAt: savedTodo.completedAt,
      priority: savedTodo.priority,
      category: savedTodo.category,
      type: savedTodo.type,
      tags: savedTodo.tags,
      dueDate: savedTodo.dueDate,
      estimatedMinutes: savedTodo.estimatedMinutes,
      userId: savedTodo.userId,
      createdAt: savedTodo.createdAt,
      updatedAt: savedTodo.updatedAt,
    };

    res.status(201).json(formattedTodo);
  } catch (error) {
    console.error('❌ Error in POST /api/todos:', error);
    res.status(500).json({
      error: 'Failed to create todo',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT todos/:id (更新) with enhanced validation
app.put('/api/todos/:id', async (req, res) => {
  console.log('✅ PUT /api/todos/:id called');
  console.log('📝 ID:', req.params.id);
  console.log('📝 Update data:', req.body);

  try {
    const todoId = req.params.id;
    const {
      task,
      title,
      description,
      priority,
      type,
      category,
      tags,
      deadline,
      dueDate,
      completed,
      actualTime,
      estimatedMinutes,
      actualMinutes,
    } = req.body;

    // バリデーション
    const taskText = task || title || description;
    if (taskText !== undefined && (!taskText || taskText.trim().length === 0)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Task cannot be empty',
      });
    }

    // 更新データの準備
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (task !== undefined) {
      updateData.title = task.trim();
      updateData.description = task.trim();
    }
    if (priority !== undefined) updateData.priority = mapPriorityToSchema(priority);
    if (type !== undefined) updateData.type = mapTypeToSchema(type);
    if (category !== undefined) updateData.category = mapCategoryToSchema(category);
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (dueDate !== undefined || deadline !== undefined) updateData.dueDate = dueDate || deadline;
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        updateData.completedAt = new Date().toISOString();
      } else {
        updateData.completedAt = null;
      }
    }
    if (actualMinutes !== undefined || actualTime !== undefined) {
      updateData.actualMinutes = actualMinutes || (actualTime ? parseInt(actualTime) : undefined);
    }
    if (estimatedMinutes !== undefined) updateData.estimatedMinutes = estimatedMinutes;

    const updatedTodo = await TodoModel.findByIdAndUpdate(todoId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTodo) {
      console.log(`❌ Todo not found with ID: ${todoId}`);
      return res.status(404).json({
        error: 'Todo not found',
        message: `Todo with ID ${todoId} does not exist`,
      });
    }

    console.log(`✅ Todo updated successfully: ${updatedTodo.title}`);

    // フロントエンドが期待する形式でデータを変換
    const formattedTodo = {
      _id: updatedTodo._id.toString(),
      id: updatedTodo._id.toString(),
      task: updatedTodo.title || updatedTodo.description || '',
      title: updatedTodo.title,
      description: updatedTodo.description,
      completed: updatedTodo.completed,
      completedAt: updatedTodo.completedAt,
      priority: updatedTodo.priority,
      category: updatedTodo.category,
      type: updatedTodo.type,
      tags: updatedTodo.tags,
      dueDate: updatedTodo.dueDate,
      estimatedMinutes: updatedTodo.estimatedMinutes,
      actualMinutes: updatedTodo.actualMinutes,
      userId: updatedTodo.userId,
      createdAt: updatedTodo.createdAt,
      updatedAt: updatedTodo.updatedAt,
    };

    res.json(formattedTodo);
  } catch (error) {
    console.error('❌ Error in PUT /api/todos/:id:', error);
    res.status(500).json({
      error: 'Failed to update todo',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE todos/:id (削除)
app.delete('/api/todos/:id', async (req, res) => {
  console.log('✅ DELETE /api/todos/:id called');
  console.log('📝 ID:', req.params.id);

  try {
    const todoId = req.params.id;
    const deletedTodo = await TodoModel.findByIdAndDelete(todoId);

    if (!deletedTodo) {
      console.log(`❌ Todo not found with ID: ${todoId}`);
      return res.status(404).json({
        error: 'Todo not found',
        message: `Todo with ID ${todoId} does not exist`,
      });
    }

    console.log(`🗑️ Todo deleted successfully: ${deletedTodo.title}`);

    // フロントエンドが期待する形式でデータを変換
    const formattedDeletedTodo = {
      _id: deletedTodo._id.toString(),
      id: deletedTodo._id.toString(),
      task: deletedTodo.title || deletedTodo.description || '',
      title: deletedTodo.title,
      description: deletedTodo.description,
      completed: deletedTodo.completed,
      completedAt: deletedTodo.completedAt,
      priority: deletedTodo.priority,
      category: deletedTodo.category,
      type: deletedTodo.type,
      tags: deletedTodo.tags,
      dueDate: deletedTodo.dueDate,
      estimatedMinutes: deletedTodo.estimatedMinutes,
      actualMinutes: deletedTodo.actualMinutes,
      userId: deletedTodo.userId,
      createdAt: deletedTodo.createdAt,
      updatedAt: deletedTodo.updatedAt,
    };

    res.json({
      success: true,
      message: 'Todo deleted successfully',
      deletedTodo: formattedDeletedTodo,
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

// Temporarily remove 404 handler - will be moved after all routes

// Route debugging - log all registered routes
// Books API - Real database implementation
// GET all books
app.get('/api/books', async (req, res) => {
  console.log('✅ GET /api/books called');
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    console.log(`📚 Found ${books.length} books in database`);
    res.json(books);
  } catch (error) {
    console.error('❌ Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST new book
app.post('/api/books', async (req, res) => {
  console.log('✅ POST /api/books called');
  console.log('📝 Book data:', req.body);
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    console.log(`📚 Book created with ID: ${savedBook._id}`);
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book: savedBook,
    });
  } catch (error) {
    console.error('❌ Error creating book:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT update book
app.put('/api/books/:id', async (req, res) => {
  console.log('✅ PUT /api/books/:id called');
  console.log('📝 Book ID:', req.params.id);
  console.log('📝 Update data:', req.body);
  try {
    const bookId = req.params.id;
    const updatedBook = await Book.findByIdAndUpdate(bookId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    console.log(`📚 Book updated: ${updatedBook._id}`);
    res.json({
      success: true,
      message: 'Book updated successfully',
      book: updatedBook,
    });
  } catch (error) {
    console.error('❌ Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE book
app.delete('/api/books/:id', async (req, res) => {
  console.log('✅ DELETE /api/books/:id called');
  console.log('📝 Book ID:', req.params.id);
  try {
    const bookId = req.params.id;
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    console.log(`📚 Book deleted: ${deletedBook._id}`);
    res.json({
      success: true,
      message: 'Book deleted successfully',
      book: deletedBook,
    });
  } catch (error) {
    console.error('❌ Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

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
console.log('   GET  /api/books'); // 追加
console.log('   POST /api/books'); // 追加
console.log('   PUT  /api/books/:id'); // 追加
console.log('   DELETE /api/books/:id'); // 追加

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

// Connect to database and start server
const startServer = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`\n✅ Enhanced server running on port ${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/api/health`);
      console.log(`📍 Todos: http://localhost:${PORT}/api/todos`);
      console.log(`📚 Books: http://localhost:${PORT}/api/books`);
      console.log('🔍 Debug mode enabled - detailed logging active\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
