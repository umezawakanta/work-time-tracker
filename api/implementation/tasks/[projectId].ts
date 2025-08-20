import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../../src/middleware/auth';

// Task interfaces
interface Task {
  id: string;
  title: string;
  description?: string;
  phase: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  checklist: ChecklistItem[];
  startDate: string;
  endDate?: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  dependencies: string[];
  notes?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  createdAt: string;
}

// In-memory storage for development (replace with actual database later)
const tasks: Record<string, Task[]> = {};

const createEntityId = (prefix: string = 'task'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get mock tasks for development
const getMockTasks = (projectId: string): Task[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'task-1',
      title: 'Vercel デプロイメント問題修正完了',
      description: 'MIME type エラーとAPI接続問題を解決',
      phase: '本番環境修正',
      status: 'completed',
      priority: 'high',
      assignee: 'AI Assistant',
      checklist: [
        { id: 'c1', label: 'vercel.json リライトルール修正', completed: true, createdAt: now },
        { id: 'c2', label: 'API エンドポイント作成', completed: true, createdAt: now },
        { id: 'c3', label: '環境別URL設定修正', completed: true, createdAt: now },
      ],
      startDate: now,
      completedDate: now,
      estimatedHours: 3,
      actualHours: 2,
      projectId,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      tags: ['vercel', 'deployment', 'api'],
      dependencies: [],
      notes: 'localhost接続問題をVercel API エンドポイントで解決',
    },
    {
      id: 'task-2',
      title: '本番認証システム実装',
      description: 'JWT認証、ユーザー登録、データベース統合を完了',
      phase: '本番環境実装',
      status: 'in-progress',
      priority: 'critical',
      assignee: 'AI Assistant',
      checklist: [
        { id: 'c4', label: 'MongoDB データベース設計', completed: true, createdAt: now },
        { id: 'c5', label: 'ユーザー登録API実装', completed: true, createdAt: now },
        { id: 'c6', label: 'ログインAPI実装', completed: true, createdAt: now },
        { id: 'c7', label: '認証ミドルウェア実装', completed: true, createdAt: now },
        { id: 'c8', label: 'Stripe課金システム統合', completed: false, createdAt: now },
        { id: 'c9', label: 'モックAPI本番化', completed: false, createdAt: now },
      ],
      startDate: now,
      estimatedHours: 8,
      actualHours: 6,
      projectId,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      tags: ['authentication', 'database', 'stripe', 'production'],
      dependencies: [],
      notes: 'モック部分をすべて本番用に修正中',
    },
    {
      id: 'task-3',
      title: 'JavaScript module MIME type エラー修正完了',
      description: 'Vercel でのJavaScriptファイル配信問題を解決',
      phase: '本番環境修正',
      status: 'completed',
      priority: 'critical',
      assignee: 'AI Assistant',
      checklist: [
        { id: 'c10', label: 'vercel.json rewrite ルール更新', completed: true, createdAt: now },
        { id: 'c11', label: 'static asset ヘッダー設定', completed: true, createdAt: now },
      ],
      startDate: now,
      completedDate: now,
      estimatedHours: 2,
      actualHours: 1,
      projectId,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      tags: ['mime-type', 'javascript', 'vercel'],
      dependencies: [],
      notes: 'リライトルールの regex パターンでアセットファイルを除外',
    },
  ];
};

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    const { projectId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Project ID is required',
      });
      return;
    }

    // TODO: Replace with actual database query when DB is available on production
    // const tasks = await TaskModel.find({ projectId, createdBy: req.user?.userId });

    // For now, use mock data but include user context
    const projectTasks = getMockTasks(projectId);

    // Filter tasks based on user permissions if needed
    // const filteredTasks = req.user?.role === 'admin'
    //   ? projectTasks
    //   : projectTasks.filter(task => task.createdBy === req.user?.userId);

    console.log('✅ Tasks retrieved for project:', {
      projectId,
      userId: req.user?.userId,
      userRole: req.user?.role,
      taskCount: projectTasks.length,
    });

    res.status(200).json({
      success: true,
      data: projectTasks,
      total: projectTasks.length,
      message: 'タスクを取得しました',
    });
  } catch (error) {
    console.error('Error fetching implementation tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'タスクの取得に失敗しました',
    });
  }
};

// Export with authentication
export default withAuth(handler, {
  requireAuth: true,
  requireVerified: false, // Allow unverified users for development
});
