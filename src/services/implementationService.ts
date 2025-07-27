import type { Task } from '../types/implementation';

// Log interface for implementation service
export interface ImplementationLog {
  id?: string;
  action: string;
  details?: string;
  message?: string; // 互換性のため残す
  level?: 'info' | 'warning' | 'error'; // 互換性のため残す
  timestamp?: string;
  projectId: string;
  userId: string;
  user: string;
  metadata?: Record<string, any>;
}

class ImplementationService {
  private baseUrl = 'http://localhost:3001/api/implementation';
  private isServerAvailable = true;

  // タスク関連
  async getTasks(projectId: string): Promise<Task[]> {
    // サーバーが利用できない場合はモックデータを返す
    if (!this.isServerAvailable) {
      return this.getMockTasks(projectId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/tasks/${projectId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      return await response.json();
    } catch (error) {
      console.error('Get tasks error:', error);
      // サーバー接続失敗をマーク
      this.isServerAvailable = false;
      // フォールバックとしてモックデータを返す
      return this.getMockTasks(projectId);
    }
  }

  async createTask(taskData: any): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      return await response.json();
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: any): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      return await response.json();
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      return await response.json();
    } catch (error) {
      console.error('Update task status error:', error);
      throw error;
    }
  }

  async updateChecklist(taskId: string, checklistId: string, completed: boolean): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}/checklist/${checklistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update checklist');
      }

      return await response.json();
    } catch (error) {
      console.error('Update checklist error:', error);
      throw error;
    }
  }

  // ログ関連
  async getLogs(projectId: string, limit?: number): Promise<ImplementationLog[]> {
    // サーバーが利用できない場合はモックデータを返す
    if (!this.isServerAvailable) {
      return this.getMockLogs(projectId, limit);
    }

    try {
      const url = limit
        ? `${this.baseUrl}/logs/${projectId}?limit=${limit}`
        : `${this.baseUrl}/logs/${projectId}`;

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      return await response.json();
    } catch (error) {
      console.error('Get logs error:', error);
      // サーバー接続失敗をマーク
      this.isServerAvailable = false;
      // フォールバックとしてモックデータを返す
      return this.getMockLogs(projectId, limit);
    }
  }

  async addLog(logData: ImplementationLog): Promise<ImplementationLog> {
    try {
      const response = await fetch(`${this.baseUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        throw new Error('Failed to add log');
      }

      return await response.json();
    } catch (error) {
      console.error('Add log error:', error);
      throw error;
    }
  }

  // モックデータ生成
  private getMockTasks(projectId: string): Task[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'task-1',
        title: 'TypeScript build errors 修正',
        description: 'vite.config.ts の型エラーとビルドの問題を解決',
        phase: '基盤設定',
        status: 'completed',
        priority: 'high',
        assignee: 'AI Assistant',
        checklist: [
          { id: 'c1', label: 'vite.config.ts型エラー修正', completed: true, createdAt: now },
          { id: 'c2', label: 'プラグイン互換性確認', completed: true, createdAt: now },
        ],
        startDate: now,
        completedDate: now,
        estimatedHours: 2,
        actualHours: 1.5,
        projectId,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        tags: ['build', 'typescript'],
        dependencies: [],
        notes: 'visualizer プラグインの型アサーション追加で解決',
      },
      {
        id: 'task-2',
        title: 'React 19 compatibility 修正',
        description: 'react-is と prop-types の互換性問題を解決',
        phase: '基盤設定',
        status: 'completed',
        priority: 'high',
        assignee: 'AI Assistant',
        checklist: [
          { id: 'c3', label: 'react-is downgrade', completed: true, createdAt: now },
          { id: 'c4', label: 'pnpm.overrides設定', completed: true, createdAt: now },
        ],
        startDate: now,
        completedDate: now,
        estimatedHours: 3,
        actualHours: 2,
        projectId,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        tags: ['react', 'compatibility'],
        dependencies: [],
        notes: 'react-is を 18.3.1 にダウングレードして解決',
      },
      {
        id: 'task-3',
        title: 'Component import paths 修正',
        description: 'ADHD/勤怠管理コンポーネントのインポートパスを修正',
        phase: 'リファクタリング',
        status: 'completed',
        priority: 'medium',
        assignee: 'AI Assistant',
        checklist: [
          { id: 'c5', label: 'cognitive/ 配下パス修正', completed: true, createdAt: now },
          { id: 'c6', label: 'worktime/ 配下パス修正', completed: true, createdAt: now },
        ],
        startDate: now,
        completedDate: now,
        estimatedHours: 1,
        actualHours: 0.5,
        projectId,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        tags: ['refactor', 'imports'],
        dependencies: [],
        notes: 'フォルダ構造再編成に伴うパス修正',
      },
    ];
  }

  private getMockLogs(projectId: string, limit?: number): ImplementationLog[] {
    const logs = [
      {
        id: 'log-1',
        action: 'task_completed',
        details: 'TypeScriptビルドエラー完全解決',
        message: '✅ TypeScriptビルドエラー完全解決',
        level: 'info' as const,
        timestamp: new Date().toISOString(),
        projectId,
        userId: 'system',
        user: 'システム',
        metadata: { component: 'build-system' },
      },
      {
        id: 'log-2',
        action: 'task_completed',
        details: 'React 19互換性問題修正完了',
        message: '✅ React 19互換性問題修正完了',
        level: 'info' as const,
        timestamp: new Date().toISOString(),
        projectId,
        userId: 'system',
        user: 'システム',
        metadata: { component: 'dependency-management' },
      },
      {
        id: 'log-3',
        action: 'task_completed',
        details: 'コンポーネントインポートパス修正完了',
        message: '✅ コンポーネントインポートパス修正完了',
        level: 'info' as const,
        timestamp: new Date().toISOString(),
        projectId,
        userId: 'system',
        user: 'システム',
        metadata: { component: 'file-structure' },
      },
      {
        id: 'log-4',
        action: 'task_completed',
        details: 'PWA設定最適化完了',
        message: '✅ PWA設定最適化完了',
        level: 'info' as const,
        timestamp: new Date().toISOString(),
        projectId,
        userId: 'system',
        user: 'システム',
        metadata: { component: 'pwa' },
      },
      {
        id: 'log-5',
        action: 'task_completed',
        details: 'LocaleContext初期化エラー修正完了',
        message: '✅ LocaleContext初期化エラー修正完了',
        level: 'info' as const,
        timestamp: new Date().toISOString(),
        projectId,
        userId: 'system',
        user: 'システム',
        metadata: { component: 'localization' },
      },
      {
        id: 'log-6',
        action: 'task_completed',
        details: 'Critical CSS MIME type エラー修正完了',
        message: '✅ Critical CSS MIME type エラー修正完了',
        level: 'info' as const,
        timestamp: new Date().toISOString(),
        projectId,
        userId: 'system',
        user: 'システム',
        metadata: { component: 'performance' },
      },
    ];

    return limit ? logs.slice(0, limit) : logs;
  }
}

export const implementationService = new ImplementationService();
export default implementationService;
