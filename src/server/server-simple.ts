// Enhanced simple server for todo API with proper error handling
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import { Book } from './models/Book.js';
import { TodoModel } from './models/Todo.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import {
  login as loginController,
  register as registerController,
  checkAuth as checkAuthController,
  getUserData as getUserDataController,
  refreshToken as refreshTokenController,
} from './controllers/authController.js';

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

// JWT Authentication middleware
interface AuthedRequest extends Request {
  user?: { id: string };
}

const authenticate = (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const rawAuth = req.headers.authorization;
    const authHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth || '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: '認証されていません' });
      return;
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const secret = process.env.JWT_SECRET || 'dev-fallback-jwt-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret) as { id?: string };
    if (!decoded?.id) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    req.user = { id: String(decoded.id) };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

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

// WBS endpoints not implemented yet - disable explicit mocks
app.post('/api/wbs', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);
app.get('/api/wbs/project/:projectId', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);
app.put('/api/wbs/:id', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);
app.delete('/api/wbs/:id', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);

// Authentication endpoints (real controllers)
app.post('/api/auth/login', (req: Request, res: Response) => {
  void loginController(req, res);
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  void registerController(req, res);
});

// Magic link endpoint (dev mock)
app.post('/api/auth/magic-link', (req, res) => {
  console.log('✅ POST /api/auth/magic-link called');
  return res.status(501).json({ success: false, message: 'Not implemented' });
});

app.post('/api/auth/logout', (req, res) => {
  console.log('✅ POST /api/auth/logout called');
  res.json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
  void getUserDataController(req as AuthedRequest, res);
});

// whoami endpoint for frontend compatibility
app.get('/api/auth/whoami', authenticate, (req: Request, res: Response) => {
  void checkAuthController(req as AuthedRequest, res);
});

// /api/auth/check エンドポイントを追加
app.get('/api/auth/check', authenticate, (req: Request, res: Response) => {
  void checkAuthController(req as AuthedRequest, res);
});

// /api/auth/user エンドポイントを追加
app.get('/api/auth/user', authenticate, (req: Request, res: Response) => {
  void getUserDataController(req as AuthedRequest, res);
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

// Simple in-memory pageview store (date buckets) and per-path totals
const __pageviewBuckets: Record<string, number> = {};
const __pagePathBuckets: Record<string, number> = {};
const __getDateKey = (date = new Date()): string => date.toISOString().slice(0, 10);

// Record pageview (DB-backed)
app.post('/api/analytics/pageview', async (req, res) => {
  try {
    if (process.env.ANALYTICS_DISABLED === 'true' || !process.env.MONGODB_URI) {
      return res.status(204).end();
    }
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const now = new Date();
    const key = __getDateKey(now);
    const {
      path: url,
      title,
      referrer,
      clientId,
      sessionId,
      userId,
      meta,
    } = (req.body as any) || {};

    // Persist to MongoDB
    await AnalyticsEvent.create({
      event: 'page_view',
      timestamp: now,
      userId: typeof userId === 'string' ? userId : undefined,
      sessionId: typeof sessionId === 'string' ? sessionId : undefined,
      clientId:
        typeof clientId === 'string'
          ? clientId
          : (req.headers['x-client-id'] as string | undefined),
      url: typeof url === 'string' ? url : undefined,
      referrer: typeof referrer === 'string' ? referrer : undefined,
      userAgent: (req.headers['user-agent'] as string) || undefined,
      data: {
        title: typeof title === 'string' ? title : undefined,
        ...(typeof meta === 'object' && meta ? meta : {}),
      },
    });

    // Lightweight in-memory counters kept for quick summaries (optional)
    __pageviewBuckets[key] = (__pageviewBuckets[key] || 0) + 1;
    if (typeof url === 'string' && url.length > 0) {
      __pagePathBuckets[url] = (__pagePathBuckets[url] || 0) + 1;
    }

    console.log('📄 Pageview recorded', { key, url, title, referrer });
    return res.json({ success: true });
  } catch (e) {
    console.warn('⚠️ Failed to record pageview:', e);
    return res.status(200).json({ success: true, degraded: true });
  }
});

// Admin pageviews trend (DB-backed)
app.get('/api/admin/metrics/pageviews/trend', async (req, res) => {
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const windowParam = String(req.query.window || '7d');
    const days = windowParam === '30d' ? 30 : windowParam === '90d' ? 90 : 7;
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - (days - 1));

    const agg = await AnalyticsEvent.aggregate([
      { $match: { event: 'page_view', timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).catch(() => [] as Array<{ _id: string; views: number }>);

    const map = new Map<string, number>();
    for (const r of agg) map.set(String(r._id), Number(r.views || 0));
    const series: Array<{ day: string; views: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = __getDateKey(d);
      series.push({ day: key, views: map.get(key) || 0 });
    }
    return res.json({ success: true, data: { window: days, series } });
  } catch (e) {
    console.error('❌ Error building pageviews trend:', e);
    return res.json({ success: true, data: { window: 7, series: [] }, degraded: true });
  }
});

// Admin top pages (dev mock)
app.get('/api/admin/metrics/top-pages', async (req, res) => {
  try {
    const windowParam = String(req.query.window || '7d');
    const now = new Date();
    const from = new Date(now);
    if (windowParam === '30d') from.setDate(now.getDate() - 30);
    else if (windowParam === '90d') from.setDate(now.getDate() - 90);
    else from.setDate(now.getDate() - 7);

    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const rows = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now }, event: 'page_view' } },
      { $group: { _id: '$url', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 100 },
      { $project: { page: '$_id', views: 1, _id: 0 } },
    ]).catch(() => []);
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error('❌ Error building top pages:', e);
    return res.json({ success: true, data: [] });
  }
});

// Admin users trend (DB-backed)
app.get('/api/admin/metrics/users/trend', async (req, res) => {
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const windowParam = String(req.query.window || '7d');
    const days = windowParam === '30d' ? 30 : windowParam === '90d' ? 90 : 7;
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - (days - 1));

    const dailyActive = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          },
          users: { $addToSet: '$clientId' },
        },
      },
      { $project: { day: '$_id.day', activeUsers: { $size: '$users' }, _id: 0 } },
      { $sort: { day: 1 } },
    ]).catch(() => [] as Array<{ day: string; activeUsers: number }>);

    const registrations = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now } } },
      { $group: { _id: '$clientId', firstSeen: { $min: '$timestamp' } } },
      { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$firstSeen' } } } },
      { $group: { _id: '$day', newUsers: { $sum: 1 } } },
      { $project: { day: '$_id', newUsers: 1, _id: 0 } },
      { $sort: { day: 1 } },
    ]).catch(() => [] as Array<{ day: string; newUsers: number }>);

    const activeMap = new Map<string, number>(
      dailyActive.map((r: any) => [String(r.day), Number(r.activeUsers || 0)] as const)
    );
    const newMap = new Map<string, number>(
      registrations.map((r: any) => [String(r.day), Number(r.newUsers || 0)] as const)
    );
    const series: Array<{ day: string; newUsers: number; activeUsers: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = __getDateKey(d);
      series.push({
        day: key,
        newUsers: newMap.get(key) || 0,
        activeUsers: activeMap.get(key) || 0,
      });
    }
    return res.json({ success: true, data: { window: days, series } });
  } catch (e) {
    console.error('❌ Error building users trend:', e);
    return res.json({ success: true, data: { window: 7, series: [] } });
  }
});

// Admin revenue trend (DB-backed from payments)
app.get('/api/admin/metrics/revenue/trend', async (req, res) => {
  try {
    const { Payment } = await import('./models/Subscription.js');
    const months = Math.max(1, Math.min(12, Number(req.query.months || 6)));
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const rows = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          $or: [{ paidAt: { $exists: true } }, { createdAt: { $exists: true } }],
        },
      },
      {
        $addFields: {
          paidDate: {
            $cond: [{ $ifNull: ['$paidAt', false] }, { $toDate: '$paidAt' }, '$createdAt'],
          },
        },
      },
      { $match: { paidDate: { $gte: start, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidDate' } },
          amount: { $sum: { $ifNull: ['$amountReceived', '$amount'] } },
        },
      },
      { $sort: { _id: 1 } },
    ]).catch(() => [] as Array<{ _id: string; amount: number }>);

    const map = new Map<string, number>();
    for (const r of rows) map.set(r._id, Number(r.amount || 0));
    const series: Array<{ month: string; amount: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      series.push({ month: key, amount: map.get(key) || 0 });
    }
    return res.json({ success: true, data: { months, series } });
  } catch (e) {
    console.error('❌ Error building revenue trend:', e);
    return res.json({ success: true, data: { months: 6, series: [] } });
  }
});

// Admin paid users trend (DB-backed from successful payments)
app.get('/api/admin/metrics/paid-users/trend', async (req, res) => {
  try {
    const { Payment } = await import('./models/Subscription.js');
    const months = Math.max(1, Math.min(12, Number(req.query.months || 6)));
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const rows = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      {
        $addFields: {
          paidDate: {
            $cond: [{ $ifNull: ['$paidAt', false] }, { $toDate: '$paidAt' }, '$createdAt'],
          },
        },
      },
      { $match: { paidDate: { $gte: start, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidDate' } },
          users: { $addToSet: '$userId' },
        },
      },
      { $project: { month: '$_id', count: { $size: '$users' }, _id: 0 } },
      { $sort: { month: 1 } },
    ]).catch(() => [] as Array<{ month: string; count: number }>);

    const map = new Map<string, number>(
      rows.map((r: any) => [String(r.month), Number(r.count || 0)] as const)
    );
    const series: Array<{ month: string; count: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      series.push({ month: key, count: map.get(key) || 0 });
    }
    return res.json({ success: true, data: { months, series } });
  } catch (e) {
    console.error('❌ Error building paid-users trend:', e);
    return res.json({ success: true, data: { months: 6, series: [] } });
  }
});

// Admin revenue summary (dev mock)
app.get('/api/admin/metrics/revenue/summary', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const { Subscription: SubscriptionModel, Payment: PaymentModel } = await import(
      './models/Subscription.js'
    );
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');

    // Active paid subscriptions
    const activePaid = await SubscriptionModel.countDocuments({
      status: { $in: ['active'] },
      planType: { $ne: 'free' },
    }).catch(() => 0);

    // MRR = active monthly sums + active yearly sums / 12
    const [monthlyAgg, yearlyAgg] = await Promise.all([
      SubscriptionModel.aggregate([
        { $match: { status: 'active', planType: { $ne: 'free' }, billingCycle: 'monthly' } },
        { $group: { _id: null, sum: { $sum: { $ifNull: ['$amount', 0] } } } },
      ]).catch(() => [] as Array<{ sum: number }>),
      SubscriptionModel.aggregate([
        { $match: { status: 'active', planType: { $ne: 'free' }, billingCycle: 'yearly' } },
        { $group: { _id: null, sum: { $sum: { $ifNull: ['$amount', 0] } } } },
      ]).catch(() => [] as Array<{ sum: number }>),
    ]);
    const monthlySum = Number((monthlyAgg?.[0] as any)?.sum || 0);
    const yearlySum = Number((yearlyAgg?.[0] as any)?.sum || 0);
    const mrr = Math.round(monthlySum + yearlySum / 12);

    // Prev MRR (previous month end snapshot approximation): use payments succeeded in prev month as proxy
    const prevPayments = await PaymentModel.aggregate([
      {
        $match: {
          status: 'succeeded',
          $or: [
            {
              paidAt: { $gte: startOfPrevMonth.toISOString(), $lte: endOfPrevMonth.toISOString() },
            },
            { createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } },
          ],
        },
      },
      { $group: { _id: null, sum: { $sum: { $ifNull: ['$amountReceived', '$amount'] } } } },
    ]).catch(() => [] as Array<{ sum: number }>);
    const prevMrr = Math.round(Number((prevPayments?.[0] as any)?.sum || 0));

    const arr = mrr * 12;

    // New paid users this month = succeeded payments in this month (unique userIds)
    const newPaidUsersAgg = await PaymentModel.aggregate([
      {
        $match: {
          status: 'succeeded',
          $or: [
            { paidAt: { $gte: startOfMonth.toISOString() } },
            { createdAt: { $gte: startOfMonth } },
          ],
        },
      },
      { $group: { _id: '$userId' } },
      { $count: 'count' },
    ]).catch(() => [] as Array<{ count: number }>);
    const newPaidThisMonth = Number((newPaidUsersAgg?.[0] as any)?.count || 0);

    // Churn rate approximation: cancellations in month / (active at start of month + cancellations)
    const cancellationsThisMonth = await SubscriptionModel.countDocuments({
      cancelledAt: { $gte: startOfMonth.toISOString() },
    }).catch(() => 0);
    const churnRate = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (cancellationsThisMonth / Math.max(activePaid + cancellationsThisMonth, 1)) * 100
        )
      )
    );

    // Conversion rate approximation: new paid / new registrations in month (from AnalyticsEvent)
    const newRegs = await AnalyticsEvent.countDocuments({
      event: 'register',
      timestamp: { $gte: startOfMonth, $lte: now },
    }).catch(() => 0);
    const conversionRate = newRegs > 0 ? Math.round((newPaidThisMonth / newRegs) * 100) : 0;

    return res.json({
      success: true,
      data: { mrr, arr, churnRate, conversionRate, activePaid, newPaidThisMonth, prevMrr },
    });
  } catch (e) {
    console.error('❌ Error building revenue summary:', e);
    return res.json({
      success: true,
      data: {
        mrr: 0,
        arr: 0,
        churnRate: 0,
        conversionRate: 0,
        activePaid: 0,
        newPaidThisMonth: 0,
        prevMrr: 0,
      },
      degraded: true,
    });
  }
});

app.get('/api/analytics/summary', async (req, res) => {
  try {
    console.log('📊 GET /api/analytics/summary called');
    const range = String(req.query.range || '7d');
    const now = new Date();
    const from = new Date(now);
    if (range === '24h') from.setDate(now.getDate() - 1);
    else if (range === '7d') from.setDate(now.getDate() - 7);
    else from.setDate(now.getDate() - 30);

    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');

    // Distinct users
    const totalUsers = await AnalyticsEvent.distinct('userId')
      .then((a: unknown[]) => a.filter(Boolean).length)
      .catch(() => 0);
    const activeUsers = await AnalyticsEvent.distinct('userId', {
      timestamp: { $gte: from, $lte: now },
    })
      .then((a: unknown[]) => a.filter(Boolean).length)
      .catch(() => 0);

    // New users and page views in window
    const [newUsers, pageViewsTotal] = await Promise.all([
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: from, $lte: now },
        event: 'register',
      }).catch(() => 0),
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: from, $lte: now },
        event: 'page_view',
      }).catch(() => 0),
    ]);

    // Top pages
    const topPages = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now }, event: 'page_view' } },
      { $group: { _id: '$url', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $project: { page: '$_id', views: 1, _id: 0 } },
    ]).catch(() => []);

    // Average session duration from page_view_end
    const sessionAgg = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now }, event: 'page_view_end' } },
      { $group: { _id: null, avg: { $avg: { $ifNull: ['$data.timeSpent', 0] } } } },
    ]).catch(() => [] as Array<{ avg: number }>);
    const averageSessionDuration = Math.round((sessionAgg?.[0] as any)?.avg || 0);

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        returningUsers: Math.max(activeUsers - newUsers, 0),
        averageSessionDuration,
        pageViewsTotal,
        topPages,
      },
    });
  } catch (e) {
    console.error('❌ Error in /api/analytics/summary:', e);
    return res.status(200).json({ success: true, data: {}, degraded: true });
  }
});

// CI status mirror for local dev (matches serverless shape)
app.get('/api/status/ci', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 5));
    // Minimal placeholder with links to repo/actions and vercel project to avoid external token usage locally
    const github = Array.from({ length: limit }).map((_, i) => ({
      id: Date.now() - i,
      name: 'workflow',
      status: 'completed',
      conclusion: i % 3 === 0 ? 'failure' : 'success',
      html_url: 'https://github.com/umezawakanta/work-time-tracker/actions',
      created_at: new Date(Date.now() - i * 3600_000).toISOString(),
    }));
    const vercel = Array.from({ length: limit }).map((_, i) => ({
      uid: `dpl_${Date.now() - i}`,
      url: 'work-time-tracker-5d9q.vercel.app',
      state: i % 4 === 0 ? 'ERROR' : 'READY',
      createdAt: Date.now() - i * 3600_000,
      commit: { sha: undefined, message: undefined },
    }));
    return res.json({
      success: true,
      data: { github, vercel },
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.json({ success: false, error: e instanceof Error ? e.message : 'failed' });
  }
});

// Server-Sent Events for realtime analytics (dev mock)
app.get('/api/analytics/events', (req, res) => {
  console.log('📡 GET /api/analytics/events (SSE) connected');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(() => {
    const payload = {
      type: 'analytics_update',
      data: {
        activeUsers: Math.floor(Math.random() * 40) + 5,
        completionRate: Math.floor(Math.random() * 30) + 60,
        todaysTasks: Math.floor(Math.random() * 15) + 3,
        weeklyTrend: Math.floor(Math.random() * 20) - 10,
      },
      ts: Date.now(),
    };
    send('message', payload);
  }, 5000);

  req.on('close', () => {
    console.log('📡 /api/analytics/events disconnected');
    clearInterval(interval);
    res.end();
  });
});

// Live metrics (DB-backed)
app.get('/api/analytics/live-metrics', async (req, res) => {
  console.log('📊 GET /api/analytics/live-metrics called');
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since1h = new Date(Date.now() - 60 * 60 * 1000);

    // Active users (last 15 minutes)
    const since15m = new Date(Date.now() - 15 * 60 * 1000);
    const activeDistinct = await AnalyticsEvent.distinct('clientId', {
      timestamp: { $gte: since15m },
      event: { $in: ['page_view', 'page_view_end', 'task_completed', 'ai_assistant_reply'] },
    }).catch(() => [] as string[]);
    const activeUsers = (activeDistinct || []).filter(Boolean).length;

    // Completion rate approximation from task events in last 24h
    const [completedTasks, createdTasks] = await Promise.all([
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: since24h },
        event: 'task_completed',
      }).catch(() => 0),
      AnalyticsEvent.countDocuments({ timestamp: { $gte: since24h }, event: 'task_created' }).catch(
        () => 0
      ),
    ]);
    const completionRate = Math.max(
      0,
      Math.min(100, createdTasks ? Math.round((completedTasks / createdTasks) * 100) : 0)
    );

    // Average task time approximation from events (fallback to 0 if missing)
    const avgTaskTime = 0;

    // Today's tasks from midnight
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todaysTasks = await AnalyticsEvent.countDocuments({
      timestamp: { $gte: startOfDay },
      event: 'task_completed',
    }).catch(() => 0);

    // Weekly trend based on last 7 days tasks vs prior 7 days
    const start7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const prevStart7d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const [last7, prev7] = await Promise.all([
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: start7d },
        event: 'task_completed',
      }).catch(() => 0),
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: prevStart7d, $lt: start7d },
        event: 'task_completed',
      }).catch(() => 0),
    ]);
    const weeklyTrend = prev7 ? Math.round(((last7 - prev7) / Math.max(prev7, 1)) * 100) : 0;

    // Hourly activity in last 24h
    const hourlyAgg = await AnalyticsEvent.aggregate([
      {
        $match: { timestamp: { $gte: since24h }, event: { $in: ['task_completed', 'page_view'] } },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%H:00', date: '$timestamp', timezone: 'Asia/Tokyo' } },
          tasks: {
            $sum: {
              $cond: [{ $eq: ['$event', 'task_completed'] }, 1, 0],
            },
          },
          users: { $addToSet: '$clientId' },
        },
      },
      { $project: { hour: '$_id', tasks: 1, users: { $size: '$users' }, _id: 0 } },
      { $sort: { hour: 1 } },
    ]).catch(() => [] as Array<{ hour: string; tasks: number; users: number }>);

    const data = {
      activeUsers,
      completionRate,
      avgTaskTime,
      todaysTasks,
      weeklyTrend,
      hourlyActivity: hourlyAgg,
    };
    return res.json({ success: true, data });
  } catch (e) {
    console.error('❌ Error in /api/analytics/live-metrics:', e);
    return res.status(200).json({
      success: true,
      data: {
        activeUsers: 0,
        completionRate: 0,
        avgTaskTime: 0,
        todaysTasks: 0,
        weeklyTrend: 0,
        hourlyActivity: [],
      },
      degraded: true,
    });
  }
});

// ===== Additional analytics endpoints for AdminDashboard (dev mock) =====
// Daily pageviews series
app.get('/api/analytics/pageviews/daily', async (req, res) => {
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const daysParam = Number(req.query.days || 7);
    const days = Math.max(1, Math.min(90, Number.isFinite(daysParam) ? daysParam : 7));
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - (days - 1));

    const agg = await AnalyticsEvent.aggregate([
      { $match: { event: 'page_view', timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const map = new Map<string, number>();
    for (const r of agg) map.set(String(r._id), Number(r.views || 0));
    const series: Array<{ day: string; views: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = __getDateKey(d);
      series.push({ day: key, views: map.get(key) || 0 });
    }
    return res.json({ success: true, data: { days, series } });
  } catch (e) {
    console.error('❌ Error in /api/analytics/pageviews/daily:', e);
    return res.json({ success: true, data: { days: 7, series: [] }, degraded: true });
  }
});

// Active users in the last N hours (simplified mock)
app.get('/api/analytics/users/active', async (req, res) => {
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const hoursParam = Number(req.query.hours || 24);
    const hours = Math.max(1, Math.min(72, Number.isFinite(hoursParam) ? hoursParam : 24));
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const distinct = await AnalyticsEvent.distinct('clientId', {
      timestamp: { $gte: since },
      event: { $in: ['page_view', 'page_view_end', 'ai_assistant_reply', 'assessment_saved'] },
    });
    const activeUsers = (distinct || []).filter(Boolean).length;
    return res.json({ success: true, data: { hours, activeUsers } });
  } catch (e) {
    console.error('❌ Error in /api/analytics/users/active:', e);
    return res.json({ success: true, data: { hours: 24, activeUsers: 0 }, degraded: true });
  }
});

// 30d retention cohorts (simplified mock)
app.get('/api/analytics/retention/30d', async (req, res) => {
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 29);

    const registrations = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now } } },
      { $group: { _id: '$clientId', firstSeen: { $min: '$timestamp' } } },
      { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$firstSeen' } } } },
      { $group: { _id: '$day', size: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const d1 = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: '$clientId',
          days: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } },
        },
      },
      { $project: { days: 1 } },
    ]);
    const dailyMap = new Map<string, number>();
    for (const r of registrations) dailyMap.set(String(r._id), Number(r.size || 0));
    const allDays: string[] = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });
    const retainedMap = new Map<string, number>(allDays.map((d) => [d, 0]));
    for (const row of d1) {
      const set = new Set<string>((row?.days as string[]) || []);
      for (const day of allDays) {
        const next = new Date(day + 'T00:00:00Z');
        next.setDate(next.getDate() + 1);
        const nextKey = next.toISOString().slice(0, 10);
        if (set.has(day) && set.has(nextKey)) {
          retainedMap.set(day, (retainedMap.get(day) || 0) + 1);
        }
      }
    }
    const cohorts = allDays.map((day) => ({
      date: day,
      size: dailyMap.get(day) || 0,
      days: [0, retainedMap.get(day) || 0],
    }));
    return res.json({ success: true, data: { cohorts } });
  } catch (e) {
    console.error('❌ Error in /api/analytics/retention/30d:', e);
    return res.json({ success: true, data: { cohorts: [] }, degraded: true });
  }
});

// Recent error reports (mocked list)
app.get('/api/admin/error-reports', async (req, res) => {
  try {
    const limitParam = Number(req.query.limit || 10);
    const limit = Math.max(1, Math.min(200, Number.isFinite(limitParam) ? limitParam : 10));
    try {
      // Prefer shared serverless store if available
      const { listErrorReports } = await import('../../api/_lib/errorStore');
      const rows = await listErrorReports(limit);
      return res.json({ success: true, data: rows });
    } catch {}

    const { default: mongoose } = await import('mongoose');
    const rows = await mongoose.connection.db
      .collection('error_reports')
      .find({}, { sort: { createdAt: -1 } as any })
      .limit(limit)
      .toArray();
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error('❌ Error in /api/admin/error-reports:', e);
    return res.json({ success: true, data: [], degraded: true });
  }
});

// Admin analytics summary (DB-backed)
app.get('/api/admin/analytics/summary', async (req, res) => {
  try {
    console.log('📊 GET /api/admin/analytics/summary called');
    const range = String(req.query.range || '7d');
    const now = new Date();
    const from = new Date(now);
    if (range === '24h') from.setDate(now.getDate() - 1);
    else if (range === '7d') from.setDate(now.getDate() - 7);
    else from.setDate(now.getDate() - 30);

    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');

    const match = { timestamp: { $gte: from, $lte: now } } as any;

    const totalUsers = await AnalyticsEvent.distinct('userId')
      .then((a: unknown[]) => a.filter(Boolean).length)
      .catch(() => 0);
    const activeUsers = await AnalyticsEvent.distinct('userId', match)
      .then((a: unknown[]) => a.filter(Boolean).length)
      .catch(() => 0);

    const [newUsers, pageViewsTotal] = await Promise.all([
      AnalyticsEvent.countDocuments({ ...match, event: 'register' }).catch(() => 0),
      AnalyticsEvent.countDocuments({ ...match, event: 'page_view' }).catch(() => 0),
    ]);

    const sessionAgg = await AnalyticsEvent.aggregate([
      { $match: { ...match, event: 'page_view_end' } },
      { $group: { _id: null, avg: { $avg: { $ifNull: ['$data.timeSpent', 0] } } } },
    ]).catch(() => [] as Array<{ avg: number }>);
    const averageSessionDuration = Math.round((sessionAgg?.[0] as any)?.avg || 0);

    const topReferrers = await AnalyticsEvent.aggregate([
      { $match: { ...match, event: 'page_view', referrer: { $ne: null } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { referrer: '$_id', count: 1, _id: 0 } },
    ]).catch(() => []);

    // Simple day-over-day compare by event count
    const todayKey = now.toISOString().slice(0, 10);
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    const yKey = y.toISOString().slice(0, 10);
    const dailyCounts = await AnalyticsEvent.aggregate([
      { $match: { event: 'page_view', timestamp: { $gte: new Date(yKey), $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          c: { $sum: 1 },
        },
      },
    ]).catch(() => [] as Array<{ _id: string; c: number }>);
    const map = new Map<string, number>(
      (dailyCounts as Array<{ _id: string; c: number }>).map((d) => [
        String(d._id),
        Number(d.c || 0),
      ])
    );
    const today: number = Number(map.get(todayKey) || 0);
    const yesterday: number = Number(map.get(yKey) || 0);
    const diff = today - yesterday;
    const pct = yesterday > 0 ? Math.round((diff / yesterday) * 100) : 0;

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        returningUsers: Math.max(activeUsers - newUsers, 0),
        averageSessionDuration,
        pageViewsTotal,
        topReferrers,
        compare: { today, yesterday, diff, pct },
        generatedAt: new Date().toISOString(),
        range,
      },
    });
  } catch (e) {
    console.error('❌ Error in /api/admin/analytics/summary:', e);
    return res.status(200).json({ success: true, data: {}, degraded: true });
  }
});

// =============================
// Admin metrics (DB-backed summary for total users)
// =============================
app.get('/api/admin/metrics', async (req, res) => {
  try {
    const { User } = await import('./models/User.js');
    const now = new Date();
    const total = await User.countDocuments({}).catch(() => 0);
    const active = await User.countDocuments({ status: 'active' }).catch(() => 0);
    const newUsers24h = await User.countDocuments({
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    }).catch(() => 0);

    return res.json({
      success: true,
      data: {
        metrics: {
          users: {
            total,
            active,
            new: newUsers24h,
          },
          revenue: {
            mrr: 0,
            arr: 0,
            conversionRate: 0,
          },
          system: {
            uptime: 0,
            responseTime: 0,
            errorRate: 0,
            activeConnections: 0,
          },
          support: {
            openTickets: 0,
            avgResponseTime: '0h',
            satisfaction: 0,
          },
        },
        priorityActions: [],
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error('❌ Error in /api/admin/metrics:', e);
    return res.json({
      success: true,
      data: { metrics: { users: { total: 0, active: 0, new: 0 } } },
      degraded: true,
    });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const { User } = await import('./models/User.js');
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const search = String(req.query.search || '').trim();
    const role = String(req.query.role || '').trim();
    const status = String(req.query.status || '').trim();

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter).catch(() => 0);
    const rows = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('uid email displayName username role status createdAt lastLoginAt')
      .lean()
      .catch(() => [] as any[]);

    const users = rows.map((u: any) => ({
      _id: String(u._id || u.uid || ''),
      email: String(u.email || ''),
      name: String(u.displayName || u.username || ''),
      role: (u.role as string) || 'user',
      roles: [(u.role as string) || 'user'],
      isActive: String(u.status || 'inactive') === 'active',
      blocked: String(u.status || '') === 'suspended',
      lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date(0).toISOString(),
    }));

    return res.json({
      success: true,
      data: users,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e) {
    console.error('❌ Error in /api/admin/users:', e);
    return res.json({
      success: true,
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      degraded: true,
    });
  }
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
console.log('   GET  /api/analytics/live-metrics'); // 追加
console.log('   POST /api/analytics/pageview'); // 追加
console.log('   GET  /api/admin/metrics/pageviews/trend'); // 追加
console.log('   POST /api/ai/anthropic'); // 追加
console.log('   GET  /api/ai/health'); // 追加
console.log('   POST /api/todos/notify-added'); // 追加
console.log('   GET  /api/notifications/settings/:userId'); // 追加
console.log('   POST /api/notifications/settings/:userId'); // 追加
console.log('   POST /api/notifications/test'); // 追加
console.log('   GET  /api/notifications/status'); // 追加
console.log('   GET  /api/admin/metrics/users/summary'); // 追加
console.log('   GET  /api/admin/metrics/assessments/summary'); // 追加
console.log('   GET  /api/admin/metrics/learning/summary'); // 追加
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

// ==== Admin metrics summaries (dev mock) ====
app.get('/api/admin/metrics/users/summary', (req, res) => {
  try {
    const now = new Date();
    return res.json({
      ok: true,
      data: {
        totalUsers: 123,
        dau: 9,
        wau: 27,
        mau: 72,
        new7d: 15,
        generatedAt: now.toISOString(),
      },
    });
  } catch (e) {
    return res.json({
      ok: true,
      data: { totalUsers: 0, dau: 0, wau: 0, mau: 0, new7d: 0 },
      degraded: true,
    });
  }
});

app.get('/api/admin/metrics/assessments/summary', (req, res) => {
  try {
    const now = new Date();
    return res.json({
      ok: true,
      data: { iqSaved: 12, mbtiSaved: 18, totalSaved30d: 26, generatedAt: now.toISOString() },
    });
  } catch (e) {
    return res.json({
      ok: true,
      data: { iqSaved: 0, mbtiSaved: 0, totalSaved30d: 0 },
      degraded: true,
    });
  }
});

app.get('/api/admin/metrics/learning/summary', (_req, res) => {
  // Not implemented with real analytics yet. Return empty until DB-backed implementation lands.
  return res.json({ ok: true, data: { progressSaved30d: 0, uniqueLearners30d: 0 } });
});

// Assessment/Learning endpoints are not yet implemented. Disable mocks explicitly.
app.post('/api/user/assessments/iq', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);
app.post('/api/user/assessments/mbti', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);
app.post('/api/user/learning/progress', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);

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
