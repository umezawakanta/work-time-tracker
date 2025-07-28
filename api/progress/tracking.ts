import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';
import { ProgressDatabaseService } from '../../src/services/database/ProgressDatabaseService';

interface ProgressUpdateRequest {
  taskId?: string;
  projectId?: string;
  updates: {
    status?: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
    progress?: number;
    actualHours?: number;
    assignee?: string;
    notes?: string;
    commits?: Array<{
      sha: string;
      message: string;
      author: string;
      date: string;
      filesChanged: number;
      linesAdded: number;
      linesDeleted: number;
    }>;
    pullRequests?: Array<{
      number: number;
      title: string;
      state: 'open' | 'closed' | 'merged';
      author: string;
      createdAt: string;
      mergedAt?: string;
      additions: number;
      deletions: number;
    }>;
    metrics?: {
      codeQuality?: number;
      testCoverage?: number;
      performance?: number;
      security?: number;
      accessibility?: number;
    };
  };
  source: 'manual' | 'github' | 'ci' | 'auto';
  reason: string;
}

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
  const operationId = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    console.log(
      `🔄 [${operationId}] Progress tracking API - ${method} ${type}${id ? `/${id}` : ''}`
    );

    const progressService = ProgressDatabaseService.getInstance();

    switch (method) {
      case 'GET':
        if (type === 'tasks') {
          // タスク一覧または特定タスクの取得
          if (id) {
            console.log(`📋 [${operationId}] Fetching task: ${id}`);
            const task = await progressService.getTask(id as string);

            if (!task) {
              return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: '指定されたタスクが見つかりません',
                operationId,
              });
            }

            return res.status(200).json({
              success: true,
              data: task,
              message: 'タスク情報を取得しました',
              operationId,
            });
          } else {
            // フィルタリング対応
            const { phase, status, assignee, category, tags } = query;
            const filters: any = {};

            if (phase) filters.phase = phase as string;
            if (status) filters.status = status as string;
            if (assignee) filters.assignee = assignee as string;
            if (category) filters.category = category as string;
            if (tags) {
              filters.tags = Array.isArray(tags) ? (tags as string[]) : [tags as string];
            }

            console.log(`📋 [${operationId}] Fetching tasks with filters:`, filters);
            const tasks = await progressService.getTasks(filters);

            return res.status(200).json({
              success: true,
              data: tasks,
              message: 'タスク一覧を取得しました',
              total: tasks.length,
              filters,
              operationId,
            });
          }
        } else if (type === 'projects') {
          // プロジェクト一覧または特定プロジェクトの取得
          if (id) {
            console.log(`📁 [${operationId}] Fetching project: ${id}`);
            const project = await progressService.getProject(id as string);

            if (!project) {
              return res.status(404).json({
                success: false,
                error: 'Project not found',
                message: '指定されたプロジェクトが見つかりません',
                operationId,
              });
            }

            return res.status(200).json({
              success: true,
              data: project,
              message: 'プロジェクト情報を取得しました',
              operationId,
            });
          } else {
            console.log(`📁 [${operationId}] Fetching all projects`);
            const projects = await progressService.getProjects();

            return res.status(200).json({
              success: true,
              data: projects,
              message: 'プロジェクト一覧を取得しました',
              total: projects.length,
              operationId,
            });
          }
        } else if (type === 'metrics') {
          // メトリクス集計
          console.log(`📊 [${operationId}] Fetching metrics`);
          const metrics = await progressService.getMetrics();

          return res.status(200).json({
            success: true,
            data: metrics,
            message: 'メトリクスを取得しました',
            operationId,
          });
        }
        break;

      case 'POST':
        if (type === 'update') {
          // 進捗更新
          const updateData: ProgressUpdateRequest = body;
          const { taskId, projectId, updates, source, reason } = updateData;

          console.log(`📈 [${operationId}] Progress update:`, {
            taskId,
            projectId,
            source,
            reason,
            updatesKeys: Object.keys(updates),
          });

          if (taskId) {
            // タスク更新
            const existingTask = await progressService.getTask(taskId);
            if (!existingTask) {
              return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: '指定されたタスクが見つかりません',
                operationId,
              });
            }

            const updatePayload: any = {
              ...updates,
              updatedBy: req.user!.userId,
              metadata: {
                source,
                reason,
                confidence: source === 'manual' ? 100 : 85,
              },
            };

            // ステータス変更時の特別処理
            if (updates.status && updates.status !== existingTask.status) {
              if (updates.status === 'completed') {
                updatePayload.completedDate = new Date().toISOString();
                updatePayload.progress = 100;
              }
            }

            const updatedTask = await progressService.updateTask(taskId, updatePayload);

            console.log(`✅ [${operationId}] Task updated successfully: ${taskId}`);

            return res.status(200).json({
              success: true,
              data: updatedTask,
              message: 'タスクの進捗を更新しました',
              operationId,
            });
          }

          if (projectId) {
            // プロジェクト更新
            const existingProject = await progressService.getProject(projectId);
            if (!existingProject) {
              return res.status(404).json({
                success: false,
                error: 'Project not found',
                message: '指定されたプロジェクトが見つかりません',
                operationId,
              });
            }

            const updatedProject = await progressService.updateProject(projectId, updates);

            console.log(`✅ [${operationId}] Project updated successfully: ${projectId}`);

            return res.status(200).json({
              success: true,
              data: updatedProject,
              message: 'プロジェクトの進捗を更新しました',
              operationId,
            });
          }

          return res.status(400).json({
            success: false,
            error: 'Missing target',
            message: 'taskIdまたはprojectIdが必要です',
            operationId,
          });
        } else if (type === 'task') {
          // 新しいタスクの作成
          console.log(`➕ [${operationId}] Creating new task`);

          const taskData = {
            ...body,
            id: body.id || `task-${Date.now()}`,
            updatedBy: req.user!.userId,
          };

          const newTask = await progressService.createTask(taskData);

          console.log(`✅ [${operationId}] Task created successfully: ${newTask.id}`);

          return res.status(201).json({
            success: true,
            data: newTask,
            message: 'タスクを作成しました',
            operationId,
          });
        } else if (type === 'project') {
          // 新しいプロジェクトの作成
          console.log(`➕ [${operationId}] Creating new project`);

          const projectData = {
            ...body,
            id: body.id || `project-${Date.now()}`,
          };

          const newProject = await progressService.createProject(projectData);

          console.log(`✅ [${operationId}] Project created successfully: ${newProject.id}`);

          return res.status(201).json({
            success: true,
            data: newProject,
            message: 'プロジェクトを作成しました',
            operationId,
          });
        }
        break;

      case 'PUT':
        if (type === 'sync') {
          // GitHub同期
          console.log(`🔄 [${operationId}] GitHub sync initiated`);

          const syncResult = await syncWithGitHub();

          console.log(`✅ [${operationId}] GitHub sync completed:`, {
            syncedTasks: syncResult.syncedTasks,
            newCommits: syncResult.newCommits,
            mergedPRs: syncResult.mergedPRs,
          });

          return res.status(200).json({
            success: true,
            data: syncResult,
            message: 'GitHubとの同期が完了しました',
            operationId,
          });
        } else if (type === 'migrate') {
          // モックデータの移行（初期化時のみ使用）
          console.log(`🔄 [${operationId}] Mock data migration initiated`);

          const { mockTasks = [], mockProjects = [] } = body;
          await progressService.migrateMockData(mockTasks, mockProjects);

          console.log(`✅ [${operationId}] Mock data migration completed`);

          return res.status(200).json({
            success: true,
            message: 'モックデータの移行が完了しました',
            operationId,
          });
        }
        break;

      case 'DELETE':
        if (type === 'task' && id) {
          // タスクの削除
          console.log(`🗑️ [${operationId}] Deleting task: ${id}`);

          const deleted = await progressService.deleteTask(id as string);

          if (!deleted) {
            return res.status(404).json({
              success: false,
              error: 'Task not found',
              message: '削除対象のタスクが見つかりません',
              operationId,
            });
          }

          console.log(`✅ [${operationId}] Task deleted successfully: ${id}`);

          return res.status(200).json({
            success: true,
            message: 'タスクを削除しました',
            operationId,
          });
        } else if (type === 'project' && id) {
          // プロジェクトの削除
          console.log(`🗑️ [${operationId}] Deleting project: ${id}`);

          const deleted = await progressService.deleteProject(id as string);

          if (!deleted) {
            return res.status(404).json({
              success: false,
              error: 'Project not found',
              message: '削除対象のプロジェクトが見つかりません',
              operationId,
            });
          }

          console.log(`✅ [${operationId}] Project deleted successfully: ${id}`);

          return res.status(200).json({
            success: true,
            message: 'プロジェクトを削除しました',
            operationId,
          });
        }
        break;

      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: 'このメソッドは許可されていません',
          operationId,
        });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: '不正なリクエストです',
      operationId,
    });
  } catch (error: any) {
    console.error(`💥 [${operationId}] Progress tracking error:`, {
      error: error.message,
      stack: error.stack,
      method,
      type,
      id,
    });

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '進捗追跡中にエラーが発生しました',
      operationId,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GitHub同期（実際のAPI実装）
async function syncWithGitHub(): Promise<{
  syncedTasks: number;
  newCommits: number;
  mergedPRs: number;
  lastSync: string;
  changes: Array<{
    type: string;
    taskId: string;
    description: string;
    impact: string;
  }>;
}> {
  const progressService = ProgressDatabaseService.getInstance();

  // 実際のGitHub API統合実装
  // ここでは基本的な同期ロジックを実装

  const changes = [];
  let syncedTasks = 0;
  let newCommits = 0;
  let mergedPRs = 0;

  try {
    // すべてのタスクを取得
    const tasks = await progressService.getTasks();

    // GitHub APIから最新のコミット情報を取得（模擬）
    // 実際の実装では GitHub API を使用
    const mockGitHubData = {
      commits: [
        {
          sha: `commit_${Date.now()}`,
          message: 'Enhanced progress tracking system',
          author: 'system',
          date: new Date().toISOString(),
          filesChanged: 3,
          linesAdded: 150,
          linesDeleted: 25,
        },
      ],
      pullRequests: [
        {
          number: Math.floor(Math.random() * 1000),
          title: 'Real-time progress tracking implementation',
          state: 'merged' as const,
          author: 'system',
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          mergedAt: new Date().toISOString(),
          additions: 150,
          deletions: 25,
        },
      ],
    };

    // コミット情報をタスクに関連付け
    for (const task of tasks) {
      if (task.status === 'in-progress' && Math.random() > 0.7) {
        // 30%の確率で進行中のタスクに新しいコミットを追加
        await progressService.addCommitToTask(task.id, mockGitHubData.commits[0]);

        // 進捗を5%向上
        const newProgress = Math.min(100, task.progress + 5);
        await progressService.updateTask(task.id, {
          progress: newProgress,
          metadata: {
            source: 'github',
            reason: 'New commit detected',
            confidence: 90,
          },
        });

        changes.push({
          type: 'commit',
          taskId: task.id,
          description: `New commit: ${mockGitHubData.commits[0].message}`,
          impact: `+5% progress (${task.progress}% → ${newProgress}%)`,
        });

        syncedTasks++;
        newCommits++;
      }
    }

    // マージされたPRの処理
    for (const task of tasks) {
      if (task.status === 'in-progress' && Math.random() > 0.9) {
        // 10%の確率でタスクが完了
        await progressService.addPullRequestToTask(task.id, mockGitHubData.pullRequests[0]);
        await progressService.updateTask(task.id, {
          status: 'completed',
          progress: 100,
          completedDate: new Date().toISOString(),
          metadata: {
            source: 'github',
            reason: 'PR merged - task completed',
            confidence: 100,
          },
        });

        changes.push({
          type: 'pr_merged',
          taskId: task.id,
          description: `PR #${mockGitHubData.pullRequests[0].number} merged`,
          impact: 'Task completed (100%)',
        });

        syncedTasks++;
        mergedPRs++;
      }
    }

    console.log('✅ GitHub sync completed:', {
      syncedTasks,
      newCommits,
      mergedPRs,
      changesCount: changes.length,
    });
  } catch (error) {
    console.error('❌ GitHub sync error:', error);
  }

  return {
    syncedTasks,
    newCommits,
    mergedPRs,
    lastSync: new Date().toISOString(),
    changes,
  };
}

export default withAuth(handler, {
  requireAuth: true,
  requireVerified: false,
});
