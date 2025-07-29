import { Router, Request, Response } from 'express';

const router = Router();

// Mock progress tracking API for development
router.get('/tracking', async (req: Request, res: Response) => {
  console.log('🔍 Progress tracking GET request received:', {
    url: req.url,
    query: req.query,
    headers: req.headers,
  });

  try {
    const { type, id, phase, status, assignee, category, tags } = req.query;

    // Mock data for development
    if (type === 'tasks') {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'サイト改善プラン実装',
          description: 'フロントエンド・バックエンド統合',
          status: 'in-progress',
          progress: 75,
          priority: 'high',
          category: 'development',
          phase: 'implementation',
          assignee: 'developer',
          estimatedHours: 40,
          actualHours: 30,
          lastUpdated: new Date().toISOString(),
          tags: ['frontend', 'backend', 'integration'],
          commits: [
            {
              sha: 'abc123',
              message: 'Initial implementation',
              author: 'developer',
              date: new Date().toISOString(),
              filesChanged: 5,
              linesAdded: 150,
              linesDeleted: 20,
            },
          ],
          pullRequests: [],
          metrics: {
            codeQuality: 85,
            testCoverage: 75,
            performance: 90,
            security: 80,
            accessibility: 70,
          },
          metadata: {
            source: 'manual',
            reason: 'Initial task creation',
            confidence: 100,
          },
        },
        {
          id: 'task-2',
          title: 'API統合',
          description: 'Vercel API ルートの設定',
          status: 'completed',
          progress: 100,
          priority: 'critical',
          category: 'api',
          phase: 'deployment',
          assignee: 'developer',
          estimatedHours: 20,
          actualHours: 18,
          lastUpdated: new Date().toISOString(),
          tags: ['api', 'vercel'],
          completedDate: new Date().toISOString(),
          commits: [
            {
              sha: 'def456',
              message: 'API routes completed',
              author: 'developer',
              date: new Date().toISOString(),
              filesChanged: 3,
              linesAdded: 100,
              linesDeleted: 10,
            },
          ],
          pullRequests: [
            {
              number: 1,
              title: 'Complete API integration',
              state: 'merged',
              author: 'developer',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              mergedAt: new Date().toISOString(),
              additions: 100,
              deletions: 10,
            },
          ],
          metrics: {
            codeQuality: 95,
            testCoverage: 90,
            performance: 85,
            security: 90,
            accessibility: 80,
          },
          metadata: {
            source: 'github',
            reason: 'PR merged',
            confidence: 95,
          },
        },
      ];

      if (id) {
        const task = mockTasks.find((t) => t.id === id);
        if (!task) {
          return res.status(404).json({
            success: false,
            error: 'Task not found',
            message: '指定されたタスクが見つかりません',
          });
        }
        return res.json({
          success: true,
          data: task,
          message: 'タスク情報を取得しました',
        });
      }

      console.log('✅ Returning tasks response:', mockTasks.length, 'tasks');
      return res.status(200).json({
        success: true,
        data: mockTasks,
        message: 'タスク一覧を取得しました',
        total: mockTasks.length,
      });
    }

    if (type === 'projects') {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'ADHD統合ライフハブ',
          description: 'ADHD/ASD特化型生活支援システム',
          totalTasks: 10,
          completedTasks: 6,
          inProgressTasks: 3,
          blockedTasks: 1,
          overallProgress: 60,
          lastUpdated: new Date().toISOString(),
          phases: [
            {
              id: 'phase-1',
              name: 'Foundation',
              progress: 80,
              status: 'in-progress',
              startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              tasks: ['task-1', 'task-2'],
            },
          ],
          milestones: [
            {
              id: 'milestone-1',
              title: 'Core Features Complete',
              description: 'Basic functionality implemented',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'in-progress',
              progress: 60,
              tasks: ['task-1', 'task-2'],
            },
          ],
          metrics: {
            velocity: 1.2,
            burndownRate: 0.8,
            qualityScore: 85,
            teamEfficiency: 0.9,
            riskLevel: 'low',
          },
          timeline: [
            {
              date: new Date().toISOString(),
              event: 'Project Started',
              description: 'Initial project setup',
              type: 'milestone',
              metadata: { progress: 0 },
            },
          ],
        },
      ];

      if (id) {
        const project = mockProjects.find((p) => p.id === id);
        if (!project) {
          return res.status(404).json({
            success: false,
            error: 'Project not found',
            message: '指定されたプロジェクトが見つかりません',
          });
        }
        return res.json({
          success: true,
          data: project,
          message: 'プロジェクト情報を取得しました',
        });
      }

      console.log('✅ Returning projects response:', mockProjects.length, 'projects');
      return res.status(200).json({
        success: true,
        data: mockProjects,
        message: 'プロジェクト一覧を取得しました',
        total: mockProjects.length,
      });
    }

    if (type === 'metrics') {
      const mockMetrics = {
        totalTasks: 10,
        completedTasks: 6,
        inProgressTasks: 3,
        overallProgress: 60,
        velocity: 1.2,
        burndownRate: 0.8,
        qualityScore: 85,
      };

      return res.json({
        success: true,
        data: mockMetrics,
        message: 'メトリクスを取得しました',
      });
    }

    console.log('❌ Invalid type parameter:', type);
    res.status(400).json({
      success: false,
      error: 'Invalid type parameter',
      message: '無効なtypeパラメータです',
    });
  } catch (error: any) {
    console.error('💥 Progress tracking error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '進捗追跡中にエラーが発生しました',
    });
  }
});

// Mock progress update API
router.post('/tracking', async (req: Request, res: Response) => {
  try {
    const { type, taskId, projectId, updates } = req.body;

    console.log('Progress update request:', { type, taskId, projectId, updates });

    if (type === 'update') {
      if (taskId) {
        return res.json({
          success: true,
          data: {
            id: taskId,
            ...(updates || {}),
            lastUpdated: new Date().toISOString(),
          },
          message: 'タスクの進捗を更新しました',
        });
      }

      if (projectId) {
        return res.json({
          success: true,
          data: {
            id: projectId,
            ...(updates || {}),
            lastUpdated: new Date().toISOString(),
          },
          message: 'プロジェクトの進捗を更新しました',
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Missing target',
        message: 'taskIdまたはprojectIdが必要です',
      });
    }

    res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: '不正なリクエストです',
    });
  } catch (error: any) {
    console.error('Progress update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '進捗更新中にエラーが発生しました',
    });
  }
});

export default router;
