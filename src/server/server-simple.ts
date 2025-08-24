// Enhanced simple server for todo API with proper error handling
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import { Book } from './models/Book.js';
import { TodoModel } from './models/Todo.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Import services
import notificationService from './services/notificationService.js';
import emailService from './services/emailService.js';
import blogRoutes from './routes/blogRoutes.js';
import { BlogPost } from './models/BlogPost.js';

const app = express();
const PORT = 3001;

// Anthropic API configuration
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

// Debug: Log API key status at startup
console.log('🔑 Environment variables loaded:');
console.log(
  `   VITE_ANTHROPIC_API_KEY: ${process.env.VITE_ANTHROPIC_API_KEY ? '✅ Found' : '❌ Not found'}`
);
console.log(`   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ Found' : '❌ Not found'}`);
console.log(
  `   Using API Key: ${ANTHROPIC_API_KEY ? '✅ Configured (VITE_ANTHROPIC_API_KEY優先)' : '❌ Not configured'}`
);

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

// =============================
// Guitar Practices (In-memory)
// =============================
type GuitarPracticeDoc = {
  id: string;
  _id: string;
  date: string; // ISO string
  duration: number; // minutes
  technique: string;
  song?: string;
  bpm?: number;
  difficulty: number; // 1-5
  notes?: string;
  satisfaction: number; // 1-5
  isMilestone: boolean;
  createdAt: string;
};

const guitarPracticesStore: Map<string, GuitarPracticeDoc> = new Map();

const createPracticeId = () => 'gpr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

app.get('/api/guitar-practices', (_req, res) => {
  const all = Array.from(guitarPracticesStore.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  res.json(all);
});

app.post('/api/guitar-practices', (req, res) => {
  try {
    const body = req.body || {};
    const now = new Date().toISOString();
    const id = createPracticeId();
    const doc: GuitarPracticeDoc = {
      id,
      _id: id,
      date: typeof body.date === 'string' ? body.date : now,
      duration: Number(body.duration) || 0,
      technique: String(body.technique || ''),
      song: body.song ? String(body.song) : undefined,
      bpm: body.bpm != null ? Number(body.bpm) : undefined,
      difficulty: Number(body.difficulty) || 3,
      notes: body.notes ? String(body.notes) : undefined,
      satisfaction: Number(body.satisfaction) || 3,
      isMilestone: Boolean(body.isMilestone),
      createdAt: now,
    };
    guitarPracticesStore.set(id, doc);
    res.status(201).json(doc);
  } catch (error) {
    console.error('Failed to create guitar practice:', error);
    res.status(500).json({ success: false, message: 'Failed to create guitar practice' });
  }
});

app.put('/api/guitar-practices/:id', (req, res) => {
  const { id } = req.params;
  if (!guitarPracticesStore.has(id)) {
    return res.status(404).json({ success: false, message: 'Practice not found' });
  }
  const prev = guitarPracticesStore.get(id)!;
  const body = req.body || {};
  const next: GuitarPracticeDoc = {
    ...prev,
    date: typeof body.date === 'string' ? body.date : prev.date,
    duration: body.duration != null ? Number(body.duration) : prev.duration,
    technique: body.technique != null ? String(body.technique) : prev.technique,
    song: body.song != null ? String(body.song) : prev.song,
    bpm: body.bpm != null ? Number(body.bpm) : prev.bpm,
    difficulty: body.difficulty != null ? Number(body.difficulty) : prev.difficulty,
    notes: body.notes != null ? String(body.notes) : prev.notes,
    satisfaction: body.satisfaction != null ? Number(body.satisfaction) : prev.satisfaction,
    isMilestone: body.isMilestone != null ? Boolean(body.isMilestone) : prev.isMilestone,
  };
  guitarPracticesStore.set(id, next);
  res.json(next);
});

app.delete('/api/guitar-practices/:id', (req, res) => {
  const { id } = req.params;
  if (!guitarPracticesStore.has(id)) {
    return res.status(404).json({ success: false, message: 'Practice not found' });
  }
  guitarPracticesStore.delete(id);
  res.json({ success: true, id });
});

// =============================
// Debt (In-memory)
// =============================
type DebtRecord = {
  _id: string;
  date: string; // ISO
  value: number;
  description: string;
  account: string;
  createdAt: string;
  updatedAt: string;
};

const debtStore: Map<string, DebtRecord> = new Map();
const createDebtId = () => 'debt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

app.get('/api/debt', (_req, res) => {
  const all = Array.from(debtStore.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  res.json(all);
});

app.post('/api/debt', (req, res) => {
  try {
    const { date, value, description, account } = req.body || {};
    if (!date || value == null || !description || !account) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const id = createDebtId();
    const now = new Date().toISOString();
    const rec: DebtRecord = {
      _id: id,
      date: String(date),
      value: Number(value),
      description: String(description),
      account: String(account),
      createdAt: now,
      updatedAt: now,
    };
    debtStore.set(id, rec);
    res.status(201).json({ message: '負債情報が正常に記録されました', debt: rec });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create debt entry' });
  }
});

app.put('/api/debt/:id', (req, res) => {
  const { id } = req.params;
  const prev = debtStore.get(id);
  if (!prev) return res.status(404).json({ success: false, error: 'Not found' });
  const body = req.body || {};
  const next: DebtRecord = {
    ...prev,
    date: body.date ? String(body.date) : prev.date,
    value: body.value != null ? Number(body.value) : prev.value,
    description: body.description != null ? String(body.description) : prev.description,
    account: body.account != null ? String(body.account) : prev.account,
    updatedAt: new Date().toISOString(),
  };
  debtStore.set(id, next);
  res.json({ message: '負債情報が正常に更新されました', debt: next });
});

app.delete('/api/debt/:id', (req, res) => {
  const { id } = req.params;
  if (!debtStore.has(id)) return res.status(404).json({ success: false, error: 'Not found' });
  const removed = debtStore.get(id)!;
  debtStore.delete(id);
  res.json({ message: '負債情報が正常に削除されました', debt: removed });
});

// =============================
// Sleep Tracker (In-memory)
// =============================
type SleepRecord = {
  _id: string;
  date: string; // YYYY-MM-DD
  wakeUp: string | null; // HH:mm or null
  bedtime: string | null; // HH:mm or null
  quality?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const sleepRecordsStore: Map<string, SleepRecord> = new Map();

const createSleepId = () => 'slp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

// GET all sleep records
app.get('/api/sleep-records', (_req, res) => {
  const all = Array.from(sleepRecordsStore.values()).sort((a, b) => (a.date > b.date ? -1 : 1));
  res.json(all);
});

// POST create sleep record
app.post('/api/sleep-records', (req, res) => {
  try {
    const body = req.body || {};
    const id = createSleepId();
    const nowIso = new Date().toISOString();
    const record: SleepRecord = {
      _id: id,
      date: typeof body.date === 'string' ? body.date : nowIso.split('T')[0],
      wakeUp: body.wakeUp ?? null,
      bedtime: body.bedtime ?? null,
      quality: body.quality,
      notes: body.notes,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    sleepRecordsStore.set(id, record);
    res.status(201).json({ message: 'created', sleepRecord: record });
  } catch (error) {
    console.error('Failed to create sleep record:', error);
    res.status(500).json({ success: false, message: 'Failed to create sleep record' });
  }
});

// PUT update sleep record
app.put('/api/sleep-records/:id', (req, res) => {
  const { id } = req.params;
  if (!sleepRecordsStore.has(id)) {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }
  const prev = sleepRecordsStore.get(id)!;
  const body = req.body || {};
  const next: SleepRecord = {
    ...prev,
    date: typeof body.date === 'string' ? body.date : prev.date,
    wakeUp: body.wakeUp !== undefined ? body.wakeUp : prev.wakeUp,
    bedtime: body.bedtime !== undefined ? body.bedtime : prev.bedtime,
    quality: body.quality !== undefined ? body.quality : prev.quality,
    notes: body.notes !== undefined ? body.notes : prev.notes,
    updatedAt: new Date().toISOString(),
  };
  sleepRecordsStore.set(id, next);
  res.json({ message: 'updated', sleepRecord: next });
});

// DELETE sleep record
app.delete('/api/sleep-records/:id', (req, res) => {
  const { id } = req.params;
  if (!sleepRecordsStore.has(id)) {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }
  sleepRecordsStore.delete(id);
  res.json({ success: true });
});

// --- Minimal WBS mock endpoints for local development ---
// In production (Vercel), dedicated API routes should handle these.
app.post('/api/wbs', (req, res) => {
  console.log('🧱 POST /api/wbs (mock) called');
  const id = 'wbs_' + Date.now().toString(36);
  res.status(201).json({ _id: id, ...req.body });
});

app.get('/api/wbs/project/:projectId', (req, res) => {
  console.log('🧱 GET /api/wbs/project/:projectId (mock) called');
  res.json([]);
});

app.put('/api/wbs/:id', (req, res) => {
  console.log('🧱 PUT /api/wbs/:id (mock) called');
  res.json({ _id: req.params.id, ...req.body });
});

app.delete('/api/wbs/:id', (req, res) => {
  console.log('🧱 DELETE /api/wbs/:id (mock) called');
  res.json({ success: true });
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

// whoami endpoint for frontend compatibility
app.get('/api/auth/whoami', (req, res) => {
  console.log('✅ GET /api/auth/whoami called');

  // In dev, return a simple successful user payload similar to Vercel function shape
  const authHeader = req.headers.authorization || '';
  const hasToken = authHeader.startsWith('Bearer ') || true; // allow in dev

  if (hasToken) {
    const mockUser = {
      userId: 'user_123',
      email: 'demo@example.com',
      role: 'admin',
      roles: ['admin', 'user'],
      isVerified: true,
      isAdmin: true,
    };

    return res
      .status(200)
      .json({ success: true, user: mockUser, timestamp: new Date().toISOString() });
  }

  return res
    .status(401)
    .json({ success: false, status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
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

// POST todos/reset - reset all todos
app.post('/api/todos/reset', async (req, res) => {
  console.log('✅ POST /api/todos/reset called');

  try {
    // Delete all todos
    const deleteResult = await TodoModel.deleteMany({});

    console.log(`🗑️ Reset completed: ${deleteResult.deletedCount} todos deleted`);

    res.json({
      success: true,
      message: `すべてのTODOをリセットしました (${deleteResult.deletedCount}件削除)`,
      deletedCount: deleteResult.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error in POST /api/todos/reset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset todos',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET todos/history - todo completion history
app.get('/api/todos/history', async (req, res) => {
  console.log('✅ GET /api/todos/history called');

  try {
    // Generate mock history data for the past 30 days
    const history = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Generate random completion count (0-8 tasks per day)
      const completedCount = Math.floor(Math.random() * 9);

      history.push({
        date: dateStr,
        completedCount,
        day: date.toLocaleDateString('ja-JP', { weekday: 'short' }),
      });
    }

    console.log(`📊 Generated history for ${history.length} days`);

    res.json({
      success: true,
      data: history,
      message: 'TODO履歴を取得しました',
    });
  } catch (error) {
    console.error('❌ Error in GET /api/todos/history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET todos/history/daily - daily history summary
app.get('/api/todos/history/daily', async (req, res) => {
  console.log('✅ GET /api/todos/history/daily called');

  try {
    // Generate mock daily summary for the past 7 days
    const dailyHistory = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Generate random daily stats
      const completed = Math.floor(Math.random() * 8);
      const total = completed + Math.floor(Math.random() * 5);

      dailyHistory.push({
        date: dateStr,
        completed,
        total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        day: date.toLocaleDateString('ja-JP', { weekday: 'short' }),
        dayOfMonth: date.getDate(),
      });
    }

    console.log(`📅 Generated daily history for ${dailyHistory.length} days`);

    res.json({
      success: true,
      data: dailyHistory,
      message: '日別履歴を取得しました',
    });
  } catch (error) {
    console.error('❌ Error in GET /api/todos/history/daily:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily history',
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

// Analytics API routes
app.post('/api/analytics/track', (req, res) => {
  console.log('📊 POST /api/analytics/track called');
  console.log('📝 Analytics event:', req.body);

  try {
    const { event, data, timestamp } = req.body;

    if (!event || !timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Required fields: event, timestamp',
      });
    }

    // Generate event ID
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log different event types for debugging
    switch (event) {
      case 'session_start':
        console.log(`🎯 Session started: ${data?.sessionId} (User: ${data?.userId})`);
        break;
      case 'session_end':
        console.log(`⏰ Session ended: ${data?.sessionId} (Duration: ${data?.totalTimeSpent}s)`);
        break;
      case 'page_view':
        console.log(`📄 Page view: ${data?.page} (Title: ${data?.title})`);
        break;
      case 'page_view_end':
        console.log(
          `📄 Page view ended: ${data?.page} (Time: ${data?.timeSpent}s, Scroll: ${data?.scrollDepth}%)`
        );
        break;
      case 'interaction':
        console.log(`👆 User interaction: ${data?.type} on ${data?.element}`);
        break;
      case 'user_attributes':
        console.log(`👤 User attributes: ${data?.userId} (Role: ${data?.role})`);
        break;
      default:
        console.log(`❓ Unknown event: ${event}`);
    }

    // Mock successful response
    res.status(200).json({
      success: true,
      message: 'トラッキングイベントが正常に記録されました',
      eventId: eventId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'トラッキングの記録に失敗しました',
    });
  }
});

// Simple in-memory pageview store (date buckets)
const __pageviewBuckets: Record<string, number> = {};
const __getDateKey = (date = new Date()): string => date.toISOString().slice(0, 10);

// Record pageview (dev mock)
app.post('/api/analytics/pageview', (req, res) => {
  try {
    const key = __getDateKey();
    __pageviewBuckets[key] = (__pageviewBuckets[key] || 0) + 1;
    const { path, title, referrer } = (req.body as any) || {};
    console.log('📄 Pageview recorded', { key, path, title, referrer });
    return res.json({ success: true });
  } catch (e) {
    console.warn('⚠️ Failed to record pageview (dev mock):', e);
    return res.json({ success: true, degraded: true });
  }
});

// Admin pageviews trend (dev mock)
app.get('/api/admin/metrics/pageviews/trend', (req, res) => {
  try {
    const windowParam = String(req.query.window || '7d');
    const days = windowParam === '30d' ? 30 : windowParam === '90d' ? 90 : 7;
    const series: Array<{ day: string; views: number }> = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = __getDateKey(d);
      const views = __pageviewBuckets[key] || 0;
      series.push({ day: key, views });
    }
    return res.json({ success: true, data: { window: days, series } });
  } catch (e) {
    console.error('❌ Error building pageviews trend:', e);
    return res.json({ success: true, data: { window: 7, series: [] }, degraded: true });
  }
});

app.get('/api/analytics/summary', (req, res) => {
  console.log('📊 GET /api/analytics/summary called');
  console.log('📝 Query params:', req.query);

  // Mock analytics data
  const mockAnalytics = {
    totalUsers: 1247,
    activeUsers: 89,
    newUsers: 23,
    returningUsers: 66,
    averageSessionDuration: 847,
    pageViewsTotal: 3421,
    topPages: [
      { page: '/dashboard', views: 892 },
      { page: '/todo-manager', views: 743 },
      { page: '/quadrant-dashboard', views: 651 },
    ],
    deviceBreakdown: {
      desktop: 67,
      mobile: 28,
      tablet: 5,
    },
    trafficSources: {
      direct: 45,
      search: 32,
      social: 15,
      referral: 8,
    },
  };

  res.json(mockAnalytics);
});

// Admin analytics summary (mock)
app.get('/api/admin/analytics/summary', (req, res) => {
  console.log('📊 GET /api/admin/analytics/summary called');
  const range = String(req.query.range || '7d');
  const days = range === '24h' ? 1 : range === '7d' ? 7 : 30;
  const dauSeries = Array.from({ length: days }, (_, i) => ({
    day: `D${i + 1}`,
    users: 10 + ((i * 7) % 13),
  }));
  res.json({
    success: true,
    data: {
      totalUsers: 1247,
      activeUsers: 89,
      newUsers: 23,
      returningUsers: 66,
      averageSessionDuration: 847,
      pageViewsTotal: 3421,
      featureUsage: { ai_ok: 17, assessment_saved: 9, learning_saved: 12 },
      topReferrers: [
        { referrer: 'direct', count: 120 },
        { referrer: 'google.com', count: 75 },
        { referrer: 'twitter.com', count: 21 },
        { referrer: 'github.com', count: 11 },
        { referrer: 'news.ycombinator.com', count: 7 },
      ],
      compare: { today: 19, yesterday: 14, diff: 5, pct: 36 },
      retentionCohort: Array.from({ length: days }, (_, i) => ({
        day: `2025-08-${(i + 1).toString().padStart(2, '0')}`,
        newUsers: 5 + (i % 3),
        retainedNextDay: 2 + (i % 2),
      })),
      topErrors: [
        { message: 'Cannot set properties of undefined (setting "Children")', count: 3, url: '/' },
        { message: 'Route GET /api/admin/metrics not found', count: 2, url: '/admin' },
        {
          message: 'NetworkError when attempting to fetch resource.',
          count: 1,
          url: '/ai-assistant',
        },
      ],
      dauSeries,
      generatedAt: new Date().toISOString(),
      range,
    },
  });
});

// =============================
// Admin (Mock)
// =============================
app.get('/api/admin/metrics', (req, res) => {
  console.log('✅ GET /api/admin/metrics (mock) called');
  res.json({
    success: true,
    data: {
      usersTotal: 1234,
      usersActive: 987,
      aiRequests24h: 456,
      assessmentsTaken: 321,
      mbtiCount: 210,
      iqSaved: 111,
    },
  });
});

app.get('/api/admin/users', (req, res) => {
  console.log('✅ GET /api/admin/users (mock) called');
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const total = 1;
  const users = [
    {
      id: 'user_123',
      email: 'demo@example.com',
      name: 'Demo Admin',
      role: 'admin',
      roles: ['admin', 'user'],
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
  res.json({ success: true, data: users, page, limit, total, totalPages: 1 });
});

// Anthropic AI proxy endpoint
app.post('/api/ai/anthropic', async (req, res) => {
  console.log('🤖 POST /api/ai/anthropic called');

  // Check for API key
  if (!ANTHROPIC_API_KEY) {
    console.log('❌ Anthropic API key not configured');
    return res.status(500).json({
      error: 'Anthropic API key not configured',
      code: 'NOT_CONFIGURED',
    });
  }

  try {
    const body = req.body;

    // Validate request body
    if (!body.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({
        error: 'Invalid request: messages array is required',
        code: 'INVALID_REQUEST',
      });
    }

    console.log(`📤 Proxying request to Anthropic API (${body.messages.length} messages)`);

    // Forward request to Anthropic API
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model || 'claude-3-5-sonnet-20241022',
        max_tokens: body.max_tokens || 8192,
        temperature: body.temperature || 0.7,
        top_p: body.top_p || 0.95,
        messages: body.messages,
        system: body.system,
      }),
    });

    // Handle Anthropic API errors
    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json().catch(() => ({}));

      if (anthropicResponse.status === 429) {
        console.log('⚠️ Anthropic rate limit exceeded');
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT',
          retryAfter: anthropicResponse.headers.get('retry-after'),
        });
      } else if (anthropicResponse.status === 401) {
        console.log('❌ Invalid Anthropic API key');
        return res.status(401).json({
          error: 'Invalid API key',
          code: 'INVALID_API_KEY',
        });
      } else if (anthropicResponse.status === 400) {
        console.log('❌ Bad request to Anthropic API');
        return res.status(400).json({
          error: errorData.error?.message || 'Bad request',
          code: 'BAD_REQUEST',
        });
      } else {
        console.log(`❌ Anthropic API error: ${anthropicResponse.status}`);
        return res.status(anthropicResponse.status).json({
          error: `API request failed: ${anthropicResponse.statusText}`,
          code: 'API_ERROR',
        });
      }
    }

    // Return successful response
    const data = await anthropicResponse.json();
    console.log('✅ Anthropic API response received successfully');
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Anthropic API proxy error:', error);

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health check for AI API
app.get('/api/ai/health', (req, res) => {
  console.log('🤖 GET /api/ai/health called');
  res.json({
    status: 'OK',
    hasApiKey: !!ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Blog API routes (MongoDB-backed)
console.log('📚 Loading blog routes...');
app.use('/api/blog', blogRoutes);
console.log('✅ Blog routes loaded at /api/blog');

// Silence dev HEAD check noise for tokens endpoint (used by TokenManager)
app.head('/api/auth/tokens', (_req, res) => res.sendStatus(200));
app.get('/api/auth/tokens', (_req, res) => res.sendStatus(200));

// Fallback minimal handlers for blog in case route mounting fails in some envs
app.get('/api/blog', async (req, res) => {
  try {
    const posts = await BlogPost.find().populate('comments').sort({ createdAt: -1 });
    return res.json(posts);
  } catch (e) {
    console.warn(
      '⚠️ Fallback /api/blog used. Returning empty array.',
      e instanceof Error ? e.message : e
    );
    return res.json([]);
  }
});

app.get('/api/blog/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('comments');
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json(post);
  } catch (e) {
    console.error('❌ Error in fallback GET /api/blog/:id', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
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
console.log('   GET  /api/auth/whoami'); // 追加
console.log('   GET  /api/todos');
console.log('   POST /api/todos');
console.log('   PUT  /api/todos/:id'); // 追加
console.log('   DELETE /api/todos/:id'); // 追加
console.log('   POST /api/todos/reset'); // 追加
console.log('   GET  /api/todos/history'); // 追加
console.log('   GET  /api/todos/history/daily'); // 追加
console.log('   GET  /api/projects'); // 追加
console.log('   GET  /api/books'); // 追加
console.log('   POST /api/books'); // 追加
console.log('   PUT  /api/books/:id'); // 追加
console.log('   DELETE /api/books/:id'); // 追加
console.log('   POST /api/analytics/track'); // 追加
console.log('   GET  /api/analytics/summary'); // 追加
console.log('   POST /api/analytics/pageview'); // 追加
console.log('   GET  /api/admin/metrics/pageviews/trend'); // 追加
console.log('   POST /api/ai/anthropic'); // 追加
console.log('   GET  /api/ai/health'); // 追加
console.log('   POST /api/todos/notify-added'); // 追加
console.log('   GET  /api/notifications/settings/:userId'); // 追加
console.log('   POST /api/notifications/settings/:userId'); // 追加
console.log('   POST /api/notifications/test'); // 追加
console.log('   GET  /api/notifications/status'); // 追加
console.log('   POST /api/user/assessments/iq'); // 追加
console.log('   POST /api/user/assessments/mbti'); // 追加
console.log('   POST /api/user/learning/progress'); // 追加

// ========================================
// Notification API Endpoints
// ========================================

// Notify task added
app.post('/api/todos/notify-added', async (req, res) => {
  try {
    const { userId, taskId } = req.body;

    // タスクを取得
    const todo = await TodoModel.findById(taskId);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // 全タスク数を取得
    const totalTasks = await TodoModel.countDocuments({ userId });

    // 通知を送信（TodoDocumentをTodoItem形式に変換）
    const priorityMap = { low: 1, medium: 2, high: 3, critical: 5 };
    const todoItem = {
      _id: todo._id.toString(),
      task: todo.title, // TodoDocumentではtitleプロパティ
      priority: priorityMap[todo.priority] || 2,
      isPrioritized: todo.priority === 'high' || todo.priority === 'critical',
      completed: todo.completed,
      completedDate: todo.completedAt,
      createdAt: todo.createdAt?.toISOString(),
      updatedAt: todo.updatedAt?.toISOString(),
      deadline: todo.dueDate,
      type: todo.type === 'task' ? 'output' : 'input',
      description: todo.description,
      category: todo.category,
      tags: todo.tags,
    };
    await notificationService.notifyTaskAdded(userId, todoItem as any, totalTasks);

    res.json({
      success: true,
      message: 'Notification sent',
    });
  } catch (error) {
    console.error('Error sending task notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
    });
  }
});

// Get notification settings
app.get('/api/notifications/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = await notificationService.getUserSettings(userId);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found',
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification settings',
    });
  }
});

// Update notification settings
app.post('/api/notifications/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = req.body;

    await notificationService.saveUserSettings(userId, settings);

    res.json({
      success: true,
      message: 'Settings saved successfully',
    });
  } catch (error) {
    console.error('Error saving notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save notification settings',
    });
  }
});

// Send test notification
app.post('/api/notifications/test', async (req, res) => {
  try {
    const { userId, type } = req.body;

    const settings = await notificationService.getUserSettings(userId);
    if (!settings || !settings.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Notifications are disabled',
      });
    }

    // Send test email（ユーザー設定を使用）
    const testSent = await emailService.sendDailyDigest(
      settings.emailAddress,
      {
        totalTasks: 10,
        completedToday: 3,
        pendingTasks: 7,
        upcomingDeadlines: [],
        highPriorityTasks: [],
      },
      settings
    );

    res.json({
      success: testSent,
      message: testSent ? 'Test notification sent' : 'Failed to send test notification',
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
    });
  }
});

// Check email service status
app.get('/api/notifications/status', (req, res) => {
  const isReady = emailService.isReady();

  res.json({
    success: true,
    data: {
      emailServiceReady: isReady,
      message: isReady
        ? 'Email service is configured and ready'
        : 'Email service is not configured. Check EMAIL_USER and EMAIL_PASS environment variables.',
    },
  });
});

// =============================
// User endpoints (Mock)
// =============================
app.post('/api/user/assessments/iq', (req, res) => {
  console.log('✅ POST /api/user/assessments/iq (mock) called');
  const { score, total, scaledIQ, percentile } = req.body || {};
  if (
    typeof score !== 'number' ||
    typeof total !== 'number' ||
    typeof scaledIQ !== 'number' ||
    typeof percentile !== 'number'
  ) {
    return res.status(400).json({ success: false, message: 'Invalid body' });
  }
  return res.json({ success: true, data: { saved: true } });
});

app.post('/api/user/assessments/mbti', (req, res) => {
  console.log('✅ POST /api/user/assessments/mbti (mock) called');
  const { type, scores } = req.body || {};
  const validType = typeof type === 'string' && /^[E|I][S|N][T|F][J|P]$/.test(type);
  const validScores =
    scores &&
    typeof scores.EI === 'number' &&
    typeof scores.SN === 'number' &&
    typeof scores.TF === 'number' &&
    typeof scores.JP === 'number';
  if (!validType || !validScores) {
    return res.status(400).json({ success: false, message: 'Invalid body' });
  }
  return res.json({ success: true, data: { saved: true } });
});

app.post('/api/user/learning/progress', (req, res) => {
  console.log('✅ POST /api/user/learning/progress (mock) called');
  const { courseId, progress } = req.body || {};
  if (typeof courseId !== 'string' || typeof progress !== 'number') {
    return res.status(400).json({ success: false, message: 'Invalid body' });
  }
  return res.json({ success: true, data: { saved: true, courseId, progress } });
});

// 404 Error handler - must be after all known routes; allow future mocks via pattern
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
  let dbConnected = false;
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    dbConnected = true;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn(
      '⚠️ Database connection failed. Running in degraded mode (mock auth, limited APIs).'
    );
    console.warn('   Set MONGODB_URI in .env.local to enable full features.');
  }

  app.listen(PORT, () => {
    console.log(`\n✅ Enhanced server running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
    console.log(`📍 Todos: http://localhost:${PORT}/api/todos`);
    console.log(`📚 Books: http://localhost:${PORT}/api/books`);
    console.log(`🤖 AI API: http://localhost:${PORT}/api/ai/anthropic`);
    console.log(`   API Key configured: ${ANTHROPIC_API_KEY ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   Database connected: ${dbConnected ? 'Yes ✅' : 'No ❌ (degraded mode)'}`);
    console.log('🔍 Debug mode enabled - detailed logging active\n');
  });
};

startServer();
