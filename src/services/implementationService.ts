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
  private baseUrl: string;
  private isServerAvailable = true;

  constructor() {
    // 環境に応じたAPIベースURLの設定
    const hostname = window.location.hostname;

    if (hostname === 'work-time-tracker-five.vercel.app') {
      // 本番環境
      this.baseUrl = 'https://work-time-tracker-five.vercel.app/api/implementation';
    } else if (hostname.match(/^work-time-tracker-5d9q-.*\.vercel\.app$/)) {
      // プレビュー環境
      this.baseUrl = 'https://work-time-tracker-five.vercel.app/api/implementation';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // ローカル開発環境
      this.baseUrl = 'http://localhost:3001/api/implementation';
    } else {
      // フォールバック
      this.baseUrl = `${window.location.protocol}//${window.location.hostname}/api/implementation`;
    }

    console.log('🔗 Implementation API Base URL:', this.baseUrl);
  }

  // 📊 実装タスクの取得（API実装）
  async getTasks(projectId: string): Promise<Task[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/implementation/tasks/${projectId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const data = await response.json();
      return data.tasks || [];
    } catch (error) {
      console.error('❌ Failed to fetch implementation tasks:', error);
      throw error;
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

  // 📈 実装ログの取得（API実装）
  async getLogs(projectId: string): Promise<ImplementationLog[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/implementation/logs/${projectId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      const data = await response.json();
      return data.logs || [];
    } catch (error) {
      console.error('❌ Failed to fetch implementation logs:', error);
      throw error;
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
