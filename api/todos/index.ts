import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { TodoModel } from '../../src/server/models/Todo';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';
import { cors } from '../../lib/cors';

// Helper function to create entity ID
const createEntityId = (prefix: string = 'todo'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  // Apply CORS headers
  await cors(req, res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to database
    await connectDB();

    if (req.method === 'GET') {
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
      const todos = await TodoModel.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string))
        .skip(parseInt(offset as string));

      const total = await TodoModel.countDocuments(query);

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
      // Create new todo
      const {
        title,
        description,
        category = 'personal',
        type = 'task',
        priority = 'medium',
        dueDate,
        reminderDate,
        projectId,
        tags = [],
        estimatedMinutes,
        location,
        context = [],
        recurring,
      } = req.body;

      // Validation
      if (!title) {
        res.status(400).json({
          success: false,
          error: 'Title is required',
          message: 'タイトルは必須です',
        });
        return;
      }

      const userId = req.user!.userId;

      // Create new todo
      const newTodo = new TodoModel({
        title,
        description,
        category,
        type,
        priority,
        dueDate,
        reminderDate,
        userId,
        projectId,
        tags: Array.isArray(tags) ? tags : [],
        estimatedMinutes,
        location,
        context: Array.isArray(context) ? context : [],
        recurring,
        source: 'manual',
        completed: false,
      });

      const savedTodo = await newTodo.save();

      console.log('✅ Todo created:', {
        todoId: savedTodo.id,
        userId,
        title: savedTodo.title,
        category: savedTodo.category,
      });

      res.status(201).json({
        success: true,
        data: savedTodo,
        message: 'TODOを作成しました',
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed',
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
export default withAuth(handler, {
  requireAuth: true,
  requireVerified: false, // Allow unverified users for development
});
