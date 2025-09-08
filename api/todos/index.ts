import { VercelRequest, VercelResponse } from '@vercel/node';

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

// Mock data for development
const mockTodos: TodoDocument[] = [
  {
    id: 'todo_1',
    _id: 'todo_1',
    task: 'サンプルタスク1',
    completed: false,
    priority: 1,
    isPrioritized: true,
    type: 'input',
    category: 'work',
    tags: ['urgent'],
    deadline: '2025-09-10',
    userId: 'user_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'todo_2',
    _id: 'todo_2',
    task: 'サンプルタスク2',
    completed: true,
    priority: 2,
    isPrioritized: false,
    type: 'output',
    category: 'personal',
    tags: ['important'],
    userId: 'user_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
];

async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';

  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      res.status(200).json({
        success: true,
        data: mockTodos,
      });
    } catch (error) {
      console.error('Todos fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'タスクの取得に失敗しました',
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { task, priority, type, category, tags, deadline, userId } = req.body;

      if (!task) {
        return res.status(400).json({
          success: false,
          message: 'タスクは必須です',
        });
      }

      const newTodo: TodoDocument = {
        id: `todo_${Date.now()}`,
        _id: `todo_${Date.now()}`,
        task,
        completed: false,
        priority: priority || 3,
        isPrioritized: false,
        type: type || 'input',
        category,
        tags,
        deadline,
        userId: userId || 'user_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockTodos.push(newTodo);
      res.status(201).json({
        success: true,
        data: newTodo,
      });
    } catch (error) {
      console.error('Todo creation error:', error);
      res.status(500).json({
        success: false,
        message: 'タスクの作成に失敗しました',
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }
}

module.exports = handler;
