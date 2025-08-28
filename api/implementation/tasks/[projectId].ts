import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { connectDB } from '../../../src/server/config/database';
import { ImplementationTask } from '../../../src/server/models/ImplementationTask';

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

// モックデータ廃止: 実データのみを返す

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

    // DB接続
    await connectDB();

    // 実データ取得（最新作成順）
    const projectTasks = await ImplementationTask.find({ projectId })
      .sort({ createdAt: -1 })
      .lean();

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
