import type { VercelRequest, VercelResponse } from '@vercel/node';
// Note: Keep serverless functions isolated from frontend/server code to avoid NodeNext build issues.
// Minimal auth and DB stubs are used here to keep the API operational on Vercel preview builds.
type AuthenticatedRequest = any;
import { cors } from '../../lib/cors';

// Robust JSON body reader (handles raw string/body getter differences)
async function readJson(req: any): Promise<any> {
  try {
    if (req?.body !== undefined && req?.body !== null) {
      return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
    const raw: string = await new Promise((resolve, reject) => {
      let d = '';
      req.on('data', (c: Buffer) => (d += c.toString('utf8')));
      req.on('end', () => resolve(d));
      req.on('error', reject);
    });
    return raw ? JSON.parse(raw) : {};
  } catch {
    const err: any = new Error('Invalid JSON');
    err.statusCode = 400;
    throw err;
  }
}

// Helpers to normalize incoming fields from client to DB shape
function normalizePriority(input: unknown): 'low' | 'medium' | 'high' | 'critical' {
  if (typeof input === 'string') {
    const p = input.toLowerCase();
    if (p === 'low' || p === 'medium' || p === 'high' || p === 'critical') return p;
  }
  const num = typeof input === 'number' ? input : Number(input);
  if (Number.isFinite(num)) {
    if (num >= 5) return 'critical';
    if (num >= 4) return 'high';
    if (num >= 3) return 'medium';
    return 'low';
  }
  return 'medium';
}

function toNumericPriority(p: 'low' | 'medium' | 'high' | 'critical'): number {
  switch (p) {
    case 'critical':
      return 5;
    case 'high':
      return 4;
    case 'medium':
      return 3;
    default:
      return 2;
  }
}

// Helper function to create entity ID
const createEntityId = (prefix: string = 'todo'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

function authMiddleware(_req: AuthenticatedRequest, _res: VercelResponse, next: () => void) {
  next();
}

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  // Apply CORS headers
  await cors(req, res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const requestId = (req.headers['x-request-id'] as string) || undefined;
    const allowGuestTodos = process.env.ALLOW_GUEST_TODOS === 'true';

    // Attach user if Authorization header is present (optional auth)
    const hasAuthHeader = typeof req.headers.authorization === 'string';
    if (hasAuthHeader) {
      await new Promise<void>((resolve) => authMiddleware(req, res, resolve));
      if (res.headersSent) return; // authMiddleware already responded (e.g., invalid token)
    }

    console.log('📥 Todos request', {
      requestId,
      method: req.method,
      userId: req.user?.userId || null,
      guestAllowed: allowGuestTodos,
    });
    // Connect to database (non-fatal in serverless environments)
    try {
      // In preview/serverless without DB, skip connection gracefully
      // await connectDB();
      throw new Error('DB disabled for preview');
    } catch (dbErr) {
      console.warn('Todos API: DB connection failed, responding with empty list for GET.', dbErr);
      if (req.method === 'GET') {
        res
          .status(200)
          .json({ success: true, data: [], total: 0, message: 'DB未接続（プレビュー環境）' });
        return;
      }
    }

    if (req.method === 'GET') {
      // Guest quick path (no auth) when enabled
      if (!req.user && allowGuestTodos) {
        return res.status(200).json({ success: true, data: [], total: 0, message: 'guest mode' });
      }

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, status: 401, code: 'UNAUTHORIZED', message: '認証が必要です' });
      }
      // Get query parameters
      const {
        completed,
        category,
        type,
        priority,
        tags,
        projectId,
        limit = '50',
        offset = '0',
      } = req.query;

      const userId = req.user!.userId;

      // Build query
      const query: any = { userId };

      if (completed !== undefined) {
        query.completed = completed === 'true';
      }

      if (category) {
        query.category = category;
      }

      if (type) {
        query.type = type;
      }

      if (priority) {
        query.priority = { $gte: priority };
      }

      if (projectId) {
        query.projectId = projectId;
      }

      if (tags) {
        const tagList = typeof tags === 'string' ? tags.split(',') : tags;
        query.tags = { $in: tagList };
      }

      // Execute query
      // Return empty list in preview without DB
      const todos: any[] = [];
      const total = 0;

      console.log('✅ Todos retrieved:', {
        userId,
        total: todos.length,
        filters: { completed, category, type, priority, tags, projectId },
      });

      res.status(200).json({
        success: true,
        data: todos,
        total: total,
        message: 'TODOを取得しました',
      });
    } else if (req.method === 'POST') {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, status: 401, code: 'UNAUTHORIZED', message: '認証が必要です' });
      }
      // Read and normalize request body
      const rawBody = await readJson(req);
      const title: string | undefined = (rawBody?.title as string) || (rawBody?.task as string);
      const description: string | undefined = (rawBody?.description as string) || undefined;
      const categoryInput: string | undefined = (rawBody?.category as string) || undefined;
      const typeInput: string | undefined = (rawBody?.type as string) || undefined;
      const priorityInput: unknown = rawBody?.priority;
      const dueDate: string | undefined =
        (rawBody?.dueDate as string) || (rawBody?.deadline as string) || undefined;
      const reminderDate: string | undefined = (rawBody?.reminderDate as string) || undefined;
      const projectId: string | undefined = (rawBody?.projectId as string) || undefined;
      const tagsInput: unknown = rawBody?.tags;
      const estimatedMinutes: number | undefined =
        typeof rawBody?.estimatedMinutes === 'number' ? rawBody.estimatedMinutes : undefined;
      const location: string | undefined = (rawBody?.location as string) || undefined;
      const contextInput: unknown = rawBody?.context;
      const isPrioritized: boolean = Boolean(rawBody?.isPrioritized);

      // Validation
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Title is required',
          message: 'タイトルは必須です',
        });
        return;
      }

      const userId = req.user!.userId;

      // Normalize fields
      const priorityStr = normalizePriority(priorityInput);
      const category =
        typeof categoryInput === 'string' && categoryInput.trim().length > 0
          ? categoryInput
          : 'personal';
      // Persist as a task; preserve ioType to metadata if client sent input/output
      const dbType: 'task' | 'reminder' | 'goal' | 'habit' = 'task';
      const ioType: 'input' | 'output' | null =
        typeInput === 'input' || typeInput === 'output' ? (typeInput as any) : null;
      const tags = Array.isArray(tagsInput) ? (tagsInput as string[]) : [];
      const context = Array.isArray(contextInput) ? (contextInput as string[]) : [];

      // Create new todo
      // Emulate persistence in preview
      const savedTodo = {
        _id: createEntityId('todo'),
        title,
        description,
        category,
        type: dbType,
        priority: priorityStr,
        dueDate,
        reminderDate,
        userId,
        projectId,
        tags,
        estimatedMinutes,
        location,
        context,
        source: 'manual',
        completed: false,
        createdAt: new Date(),
        metadata: {
          ...(ioType ? { ioType } : {}),
          isPrioritized,
          clientPriority: priorityInput,
        },
      } as any;

      // Build client-compatible response
      const clientTodo = {
        _id: (savedTodo as any)?._id?.toString?.() || (savedTodo as any)?.id,
        task: savedTodo.title,
        completed: savedTodo.completed,
        priority:
          typeof priorityInput === 'number' ? priorityInput : toNumericPriority(priorityStr),
        isPrioritized,
        type: (savedTodo as any)?.metadata?.ioType || 'input',
        createdAt:
          (savedTodo as any)?.createdAt instanceof Date
            ? (savedTodo as any).createdAt.toISOString()
            : (savedTodo as any)?.createdAt,
        deadline: savedTodo.dueDate || undefined,
        category: savedTodo.category,
        tags: Array.isArray(savedTodo.tags) ? savedTodo.tags : [],
        note: savedTodo.description || undefined,
        estimatedDuration: (savedTodo as any)?.estimatedMinutes,
      };

      console.log('✅ Todo created:', {
        todoId: clientTodo._id,
        userId,
        title: savedTodo.title,
        category: savedTodo.category,
      });

      res.status(201).json({
        message: 'TODOを作成しました',
        todo: clientTodo,
      });
    } else {
      res.status(405).json({
        success: false,
        status: 405,
        code: 'METHOD_NOT_ALLOWED',
        message: '許可されていないメソッドです',
      });
    }
  } catch (error) {
    console.error('❌ Todos API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'TODOの処理中にエラーが発生しました',
    });
  }
};

// Export with authentication
// Export handler directly without cross-imported auth wrapper
export default handler as any;
