import { useState, useEffect } from 'react';
import { Task, ImprovementItem } from '@/types/implementation';
import { toast } from 'react-hot-toast';

export interface UseImplementationResult {
  tasks: Task[];
  logs: any[];
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
}

export const useImplementation = (projectId?: string): UseImplementationResult => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        createdBy: 'current-user', // TODO: 実際のユーザーIDを取得
        priority: taskData.priority || 'medium',
        tags: taskData.tags || [],
        dependencies: taskData.dependencies || [],
        notes: taskData.notes || '',
      };

      // タスクをローカル状態に追加
      setTasks((prev) => [...prev, newTask]);

      // ログを追加
      const newLog = {
        id: `log-${Date.now()}`,
        action: 'task_created',
        details: `タスク「${newTask.title}」を作成しました`,
        timestamp: new Date().toISOString(),
        user: '現在のユーザー', // TODO: 実際のユーザー名を取得
      };
      setLogs((prev) => [newLog, ...prev]);

      toast.success('タスクを作成しました');
      return true;
    } catch (error) {
      console.error('Task creation error:', error);
      toast.error('タスクの作成に失敗しました');
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

  const refreshData = async (): Promise<void> => {
    // TODO: 実際のデータ取得処理
    console.log('Refreshing data for project:', projectId);
  };

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

  const loadProject = async (projectId: string): Promise<boolean> => {
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
  };

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
  };
};
