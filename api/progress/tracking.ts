import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';

interface TaskProgress {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  phase: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
  tags: string[];
  milestones: string[];
  commits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
  }>;
  pullRequests: Array<{
    number: number;
    title: string;
    state: 'open' | 'closed' | 'merged';
    author: string;
    createdAt: string;
    mergedAt?: string;
    additions: number;
    deletions: number;
  }>;
  metrics: {
    codeQuality: number;
    testCoverage: number;
    performance: number;
    security: number;
    accessibility: number;
  };
  lastUpdated: string;
  updatedBy: string;
  metadata: {
    source: 'manual' | 'github' | 'ci' | 'auto';
    reason: string;
    confidence: number;
  };
}

interface ProjectProgress {
  id: string;
  name: string;
  description: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overallProgress: number;
  phases: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
    startDate?: string;
    endDate?: string;
    tasks: string[];
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    progress: number;
    tasks: string[];
  }>;
  metrics: {
    velocity: number; // タスク完了速度
    burndownRate: number; // バーンダウン率
    qualityScore: number; // 品質スコア
    teamEfficiency: number; // チーム効率
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  timeline: Array<{
    date: string;
    event: string;
    description: string;
    type: 'milestone' | 'task' | 'phase' | 'release';
    metadata: Record<string, any>;
  }>;
  lastUpdated: string;
}

interface ProgressUpdateRequest {
  taskId?: string;
  projectId?: string;
  updates: {
    status?: TaskProgress['status'];
    progress?: number;
    actualHours?: number;
    assignee?: string;
    notes?: string;
    commits?: TaskProgress['commits'];
    pullRequests?: TaskProgress['pullRequests'];
    metrics?: Partial<TaskProgress['metrics']>;
  };
  source: 'manual' | 'github' | 'ci' | 'auto';
  reason: string;
}

// モックデータストレージ（本番環境ではデータベースを使用）
let mockTasks: TaskProgress[] = [
  {
    id: 'task-auth-enhancement',
    title: '認証システムの強化',
    description: 'JWT認証とセッション管理の改善',
    status: 'completed',
    progress: 100,
    priority: 'high',
    category: 'security',
    phase: 'phase0',
    assignee: 'system',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-02-07T00:00:00Z',
    completedDate: '2024-02-07T10:30:00Z',
    estimatedHours: 40,
    actualHours: 38,
    dependencies: [],
    tags: ['authentication', 'security', 'jwt'],
    milestones: ['ms-auth-complete'],
    commits: [
      {
        sha: 'abc123',
        message: 'Enhanced JWT token management',
        author: 'system',
        date: '2024-02-05T14:30:00Z',
        filesChanged: 5,
        linesAdded: 230,
        linesDeleted: 45,
      },
    ],
    pullRequests: [
      {
        number: 42,
        title: 'Auth system enhancement',
        state: 'merged',
        author: 'system',
        createdAt: '2024-02-05T10:00:00Z',
        mergedAt: '2024-02-07T10:30:00Z',
        additions: 230,
        deletions: 45,
      },
    ],
    metrics: {
      codeQuality: 95,
      testCoverage: 85,
      performance: 90,
      security: 98,
      accessibility: 88,
    },
    lastUpdated: '2024-02-07T10:30:00Z',
    updatedBy: 'system',
    metadata: {
      source: 'github',
      reason: 'PR merged',
      confidence: 100,
    },
  },
  {
    id: 'task-payment-system',
    title: '課金システムの実装',
    description: 'Stripe統合とサブスクリプション管理',
    status: 'in-progress',
    progress: 75,
    priority: 'critical',
    category: 'payment',
    phase: 'phase0',
    assignee: 'system',
    startDate: '2024-02-08T00:00:00Z',
    endDate: '2024-02-14T00:00:00Z',
    estimatedHours: 60,
    actualHours: 45,
    dependencies: ['task-auth-enhancement'],
    tags: ['payment', 'stripe', 'subscription'],
    milestones: ['ms-payment-integration'],
    commits: [
      {
        sha: 'def456',
        message: 'Enhanced subscription error handling',
        author: 'system',
        date: '2024-02-12T09:15:00Z',
        filesChanged: 3,
        linesAdded: 150,
        linesDeleted: 25,
      },
    ],
    pullRequests: [
      {
        number: 45,
        title: 'Payment system enhancements',
        state: 'open',
        author: 'system',
        createdAt: '2024-02-12T08:00:00Z',
        additions: 150,
        deletions: 25,
      },
    ],
    metrics: {
      codeQuality: 92,
      testCoverage: 78,
      performance: 88,
      security: 95,
      accessibility: 85,
    },
    lastUpdated: '2024-02-12T09:15:00Z',
    updatedBy: 'system',
    metadata: {
      source: 'github',
      reason: 'New commit pushed',
      confidence: 85,
    },
  },
];

let mockProjects: ProjectProgress[] = [
  {
    id: 'proj-mvp',
    name: 'MVP機能完成',
    description: '勤怠管理アプリとして必要最低限の機能を実装',
    totalTasks: 12,
    completedTasks: 8,
    inProgressTasks: 3,
    blockedTasks: 1,
    overallProgress: 75,
    phases: [
      {
        id: 'phase0',
        name: 'MVP機能完成',
        progress: 75,
        status: 'in-progress',
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-02-21T00:00:00Z',
        tasks: ['task-auth-enhancement', 'task-payment-system'],
      },
    ],
    milestones: [
      {
        id: 'ms-auth-complete',
        title: '認証システム完成',
        description: 'JWT認証とセキュリティ機能の完全実装',
        dueDate: '2024-02-07T00:00:00Z',
        status: 'completed',
        progress: 100,
        tasks: ['task-auth-enhancement'],
      },
      {
        id: 'ms-payment-integration',
        title: '課金システム統合',
        description: 'Stripe課金システムの完全統合',
        dueDate: '2024-02-14T00:00:00Z',
        status: 'in-progress',
        progress: 75,
        tasks: ['task-payment-system'],
      },
    ],
    metrics: {
      velocity: 1.2, // タスク/日
      burndownRate: 85, // %
      qualityScore: 92,
      teamEfficiency: 88,
      riskLevel: 'low',
    },
    timeline: [
      {
        date: '2024-02-07T10:30:00Z',
        event: '認証システム完成',
        description: 'JWT認証とセッション管理の実装が完了',
        type: 'milestone',
        metadata: { taskId: 'task-auth-enhancement' },
      },
      {
        date: '2024-02-12T09:15:00Z',
        event: '課金システム改善',
        description: 'エラーハンドリングとUI強化を実装',
        type: 'task',
        metadata: { taskId: 'task-payment-system' },
      },
    ],
    lastUpdated: '2024-02-12T09:15:00Z',
  },
];

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;
  const { type, id } = query;

  try {
    switch (method) {
      case 'GET':
        if (type === 'tasks') {
          // タスク一覧または特定タスクの取得
          if (id) {
            const task = mockTasks.find((t) => t.id === id);
            if (!task) {
              return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: '指定されたタスクが見つかりません',
              });
            }
            return res.status(200).json({
              success: true,
              data: task,
              message: 'タスク情報を取得しました',
            });
          } else {
            // フィルタリング
            const { phase, status, assignee, category } = query;
            let filteredTasks = mockTasks;

            if (phase) filteredTasks = filteredTasks.filter((t) => t.phase === phase);
            if (status) filteredTasks = filteredTasks.filter((t) => t.status === status);
            if (assignee) filteredTasks = filteredTasks.filter((t) => t.assignee === assignee);
            if (category) filteredTasks = filteredTasks.filter((t) => t.category === category);

            return res.status(200).json({
              success: true,
              data: filteredTasks,
              message: 'タスク一覧を取得しました',
              total: filteredTasks.length,
            });
          }
        } else if (type === 'projects') {
          // プロジェクト一覧または特定プロジェクトの取得
          if (id) {
            const project = mockProjects.find((p) => p.id === id);
            if (!project) {
              return res.status(404).json({
                success: false,
                error: 'Project not found',
                message: '指定されたプロジェクトが見つかりません',
              });
            }
            return res.status(200).json({
              success: true,
              data: project,
              message: 'プロジェクト情報を取得しました',
            });
          } else {
            return res.status(200).json({
              success: true,
              data: mockProjects,
              message: 'プロジェクト一覧を取得しました',
              total: mockProjects.length,
            });
          }
        } else if (type === 'metrics') {
          // メトリクス集計
          const totalTasks = mockTasks.length;
          const completedTasks = mockTasks.filter((t) => t.status === 'completed').length;
          const inProgressTasks = mockTasks.filter((t) => t.status === 'in-progress').length;
          const blockedTasks = mockTasks.filter((t) => t.status === 'blocked').length;

          const averageMetrics = mockTasks.reduce(
            (acc, task) => ({
              codeQuality: acc.codeQuality + task.metrics.codeQuality,
              testCoverage: acc.testCoverage + task.metrics.testCoverage,
              performance: acc.performance + task.metrics.performance,
              security: acc.security + task.metrics.security,
              accessibility: acc.accessibility + task.metrics.accessibility,
            }),
            { codeQuality: 0, testCoverage: 0, performance: 0, security: 0, accessibility: 0 }
          );

          Object.keys(averageMetrics).forEach((key) => {
            averageMetrics[key as keyof typeof averageMetrics] /= totalTasks || 1;
          });

          return res.status(200).json({
            success: true,
            data: {
              overview: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                blockedTasks,
                completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
              },
              averageMetrics,
              projectMetrics: mockProjects.map((p) => ({
                id: p.id,
                name: p.name,
                progress: p.overallProgress,
                metrics: p.metrics,
              })),
            },
            message: 'メトリクスを取得しました',
          });
        }
        break;

      case 'POST':
        if (type === 'update') {
          // 進捗更新
          const updateData: ProgressUpdateRequest = body;
          const { taskId, projectId, updates, source, reason } = updateData;

          if (taskId) {
            // タスク更新
            const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
            if (taskIndex === -1) {
              return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: '指定されたタスクが見つかりません',
              });
            }

            const task = mockTasks[taskIndex];
            const updatedTask = {
              ...task,
              ...updates,
              lastUpdated: new Date().toISOString(),
              updatedBy: req.user!.userId,
              metadata: {
                source,
                reason,
                confidence: source === 'manual' ? 100 : 85,
              },
            };

            // ステータス変更時の特別処理
            if (updates.status && updates.status !== task.status) {
              if (updates.status === 'completed') {
                updatedTask.completedDate = new Date().toISOString();
                updatedTask.progress = 100;
              }
            }

            mockTasks[taskIndex] = updatedTask;

            // プロジェクトの進捗も更新
            updateProjectProgress();

            return res.status(200).json({
              success: true,
              data: updatedTask,
              message: 'タスクの進捗を更新しました',
            });
          }

          if (projectId) {
            // プロジェクト更新
            const projectIndex = mockProjects.findIndex((p) => p.id === projectId);
            if (projectIndex === -1) {
              return res.status(404).json({
                success: false,
                error: 'Project not found',
                message: '指定されたプロジェクトが見つかりません',
              });
            }

            const project = mockProjects[projectIndex];
            const updatedProject = {
              ...project,
              ...updates,
              lastUpdated: new Date().toISOString(),
            };

            mockProjects[projectIndex] = updatedProject;

            return res.status(200).json({
              success: true,
              data: updatedProject,
              message: 'プロジェクトの進捗を更新しました',
            });
          }
        }
        break;

      case 'PUT':
        if (type === 'sync') {
          // GitHub同期
          const syncResult = await syncWithGitHub();
          return res.status(200).json({
            success: true,
            data: syncResult,
            message: 'GitHubとの同期が完了しました',
          });
        }
        break;

      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: 'このメソッドは許可されていません',
        });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: '不正なリクエストです',
    });
  } catch (error: any) {
    console.error('Progress tracking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '進捗追跡中にエラーが発生しました',
    });
  }
};

// プロジェクト進捗の自動更新
function updateProjectProgress(): void {
  mockProjects.forEach((project) => {
    const projectTasks = mockTasks.filter((task) =>
      project.phases.some((phase) => phase.tasks.includes(task.id))
    );

    if (projectTasks.length === 0) return;

    const completedTasks = projectTasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = projectTasks.filter((t) => t.status === 'in-progress').length;
    const blockedTasks = projectTasks.filter((t) => t.status === 'blocked').length;

    project.totalTasks = projectTasks.length;
    project.completedTasks = completedTasks;
    project.inProgressTasks = inProgressTasks;
    project.blockedTasks = blockedTasks;
    project.overallProgress = Math.round((completedTasks / projectTasks.length) * 100);

    // フェーズ進捗の更新
    project.phases.forEach((phase) => {
      const phaseTasks = projectTasks.filter((t) => phase.tasks.includes(t.id));
      if (phaseTasks.length > 0) {
        const phaseCompletedTasks = phaseTasks.filter((t) => t.status === 'completed').length;
        phase.progress = Math.round((phaseCompletedTasks / phaseTasks.length) * 100);

        if (phase.progress === 100) {
          phase.status = 'completed';
        } else if (phaseTasks.some((t) => t.status === 'in-progress')) {
          phase.status = 'in-progress';
        } else {
          phase.status = 'pending';
        }
      }
    });

    // マイルストーン進捗の更新
    project.milestones.forEach((milestone) => {
      const milestoneTasks = projectTasks.filter((t) => milestone.tasks.includes(t.id));
      if (milestoneTasks.length > 0) {
        const milestoneCompletedTasks = milestoneTasks.filter(
          (t) => t.status === 'completed'
        ).length;
        milestone.progress = Math.round((milestoneCompletedTasks / milestoneTasks.length) * 100);

        if (milestone.progress === 100) {
          milestone.status = 'completed';
        } else if (milestoneTasks.some((t) => t.status === 'in-progress')) {
          milestone.status = 'in-progress';
        } else {
          milestone.status = 'pending';
        }
      }
    });

    project.lastUpdated = new Date().toISOString();
  });
}

// GitHub同期（モック実装）
async function syncWithGitHub(): Promise<any> {
  // 実際の実装ではGitHub APIを使用
  const mockSyncResult = {
    syncedTasks: 2,
    newCommits: 3,
    mergedPRs: 1,
    lastSync: new Date().toISOString(),
    changes: [
      {
        type: 'commit',
        taskId: 'task-payment-system',
        description: 'New commit detected: Enhanced error handling',
        impact: '+5% progress',
      },
      {
        type: 'pr_merged',
        taskId: 'task-auth-enhancement',
        description: 'PR #42 merged: Auth system enhancement',
        impact: 'Task completed',
      },
    ],
  };

  // モック更新
  const paymentTask = mockTasks.find((t) => t.id === 'task-payment-system');
  if (paymentTask) {
    paymentTask.progress = Math.min(100, paymentTask.progress + 5);
    paymentTask.commits.push({
      sha: 'xyz789',
      message: 'Enhanced error handling',
      author: 'system',
      date: new Date().toISOString(),
      filesChanged: 2,
      linesAdded: 45,
      linesDeleted: 8,
    });
  }

  updateProjectProgress();

  return mockSyncResult;
}

export default withAuth(handler, {
  requireAuth: true,
  requireVerified: false,
});
