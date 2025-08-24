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

  const refreshData = useCallback(async (): Promise<void> => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [tasksData, logsData] = await Promise.all([
        implementationService.getTasks(projectId),
        implementationService.getLogs(projectId),
      ]);

      setTasks(tasksData);
      setLogs(logsData);
    } catch (error) {
      console.error('Refresh data error:', error);
      setError('データの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const createTask = useCallback(async (taskData: any): Promise<boolean> => {
    try {
      const newTask = await implementationService.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      return true;
    } catch (error) {
      console.error('Create task error:', error);
      return false;
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: any): Promise<boolean> => {
    try {
      const updatedTask = await implementationService.updateTask(taskId, updates);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
      return true;
    } catch (error) {
      console.error('Update task error:', error);
      return false;
    }
  }, []);

  const updateTaskStatus = useCallback(
    async (taskId: string, status: Task['status']): Promise<boolean> => {
      try {
        const updatedTask = await implementationService.updateTaskStatus(taskId, status);
        setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
        return true;
      } catch (error) {
        console.error('Update task status error:', error);
        return false;
      }
    },
    []
  );

  const updateChecklist = useCallback(
    async (taskId: string, checklistId: string, completed: boolean): Promise<boolean> => {
      try {
        const updatedTask = await implementationService.updateChecklist(
          taskId,
          checklistId,
          completed
        );
        setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
        return true;
      } catch (error) {
        console.error('Update checklist error:', error);
        return false;
      }
    },
    []
  );

  const addLog = useCallback(
    async (action: string, details: string, userId: string, userName: string): Promise<boolean> => {
      if (!projectId) return false;

      try {
        const logData: ImplementationLog = {
          action,
          details,
          projectId,
          userId,
          user: userName,
        };

        const newLog = await implementationService.addLog(logData);
        setLogs((prev) => [newLog, ...prev]);
        return true;
      } catch (error) {
        console.error('Add log error:', error);
        return false;
      }
    },
    [projectId]
  );

  const createTaskFromImprovement = useCallback(
    async (item: ImprovementItem): Promise<boolean> => {
      const taskData = {
        title: item.title,
        description: item.description,
        phase: 'phase0',
        estimatedHours: (item.estimatedDays || 1) * 8,
        priority: item.priority,
        tags: [item.id, item.category, 'improvement'],
        dependencies: item.dependencies || [],
        checklist: [
          {
            id: 'analysis',
            label: '要件分析',
            completed: false,
            createdAt: new Date().toISOString(),
          },
          { id: 'design', label: '設計', completed: false, createdAt: new Date().toISOString() },
          {
            id: 'implementation',
            label: '実装',
            completed: false,
            createdAt: new Date().toISOString(),
          },
          { id: 'testing', label: 'テスト', completed: false, createdAt: new Date().toISOString() },
          {
            id: 'review',
            label: 'レビュー',
            completed: false,
            createdAt: new Date().toISOString(),
          },
        ],
        projectId,
      };

      return await createTask(taskData);
    },
    [createTask, projectId]
  );

  const loadProject = useCallback(async (projectId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // プロジェクト情報の読み込み（必要に応じてAPIを作成）
      setCurrentProject({ id: projectId, name: 'Site Improvement Project' });
      return true;
    } catch (error) {
      console.error('Project load error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // プロジェクトIDが変更された際にデータを再取得
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
      refreshData();
    }
  }, [projectId, loadProject, refreshData]);

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
