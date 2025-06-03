import { useState, useEffect, useCallback } from 'react';
import { Task, ImprovementItem } from '@/types/implementation';
import { implementationService, ImplementationLog } from '@/services/implementationService';
import { toast } from 'react-hot-toast';

export interface UseImplementationResult {
  tasks: Task[];
  logs: ImplementationLog[];
  currentProject: any;
  isLoading: boolean;
  error: string | null;
  createTask: (taskData: any) => Promise<boolean>;
  updateTask: (taskId: string, updates: any) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<boolean>;
  updateChecklist: (taskId: string, checklistId: string, completed: boolean) => Promise<boolean>;
  refreshData: () => Promise<void>;
  createTaskFromImprovement: (item: ImprovementItem) => Promise<boolean>;
  loadProject: (projectId: string) => Promise<boolean>;
  addLog: (action: string, details: string, userId: string, userName: string) => Promise<boolean>;
}

export const useImplementation = (projectId?: string): UseImplementationResult => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ImplementationLog[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLog = useCallback(
    async (action: string, details: string, userId: string, userName: string): Promise<boolean> => {
      try {
        const logData: ImplementationLog = {
          id: `log-${Date.now()}`,
          action,
          details,
          projectId: projectId || 'site-improvement-2024',
          userId,
          user: userName,
          timestamp: new Date().toISOString(),
        };

        await implementationService.addLog(logData);
        setLogs((prev) => [logData, ...prev]);
        return true;
      } catch (error) {
        console.error('Add log error:', error);
        return false;
      }
    },
    [projectId]
  );

  const createTask = async (taskData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        phase: taskData.phase || 'phase0',
        status: 'not-started',
        assignee: taskData.assignee,
        checklist: taskData.checklist || [],
        estimatedHours: taskData.estimatedHours || 8,
        actualHours: 0,
        projectId: projectId || 'site-improvement-2024',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user',
        priority: taskData.priority || 'medium',
        tags: taskData.tags || [],
        dependencies: taskData.dependencies || [],
        notes: taskData.notes || '',
      };

      setTasks((prev) => [...prev, newTask]);

      await addLog(
        'task_created',
        `タスク「${newTask.title}」を作成しました`,
        'current-user',
        '現在のユーザー'
      );

      return true;
    } catch (error) {
      console.error('Task creation error:', error);
      setError('タスクの作成に失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: any): Promise<boolean> => {
    try {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        )
      );
      return true;
    } catch (error) {
      console.error('Task update error:', error);
      return false;
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']): Promise<boolean> => {
    return updateTask(taskId, { status });
  };

  const updateChecklist = async (
    taskId: string,
    checklistId: string,
    completed: boolean
  ): Promise<boolean> => {
    try {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              checklist: task.checklist.map((item) =>
                item.id === checklistId ? { ...item, completed } : item
              ),
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        })
      );
      return true;
    } catch (error) {
      console.error('Checklist update error:', error);
      return false;
    }
  };

  const refreshData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: 実際のデータ取得処理
      console.log('Refreshing data for project:', projectId);
    } catch (error) {
      console.error('Refresh data error:', error);
      setError('データの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const createTaskFromImprovement = async (item: ImprovementItem): Promise<boolean> => {
    const taskData = {
      title: item.title,
      description: item.description,
      phase: 'phase0', // 改善項目は通常Phase 0
      estimatedHours: (item.estimatedDays || 1) * 8, // 日数を時間に変換
      priority: item.priority,
      tags: [item.id, item.category, 'improvement'],
      dependencies: item.dependencies || [],
      checklist: [
        { id: 'analysis', task: '要件分析', completed: false },
        { id: 'design', task: '設計', completed: false },
        { id: 'implementation', task: '実装', completed: false },
        { id: 'testing', task: 'テスト', completed: false },
        { id: 'review', task: 'レビュー', completed: false },
      ],
    };

    return await createTask(taskData);
  };

  const loadProject = useCallback(async (projectId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: 実際のプロジェクトデータ取得
      setCurrentProject({ id: projectId, name: 'Site Improvement Project' });
      return true;
    } catch (error) {
      console.error('Project load error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load project data on mount
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  return {
    tasks,
    logs,
    currentProject,
    isLoading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    updateChecklist,
    refreshData,
    createTaskFromImprovement,
    loadProject,
    addLog,
  };
};
