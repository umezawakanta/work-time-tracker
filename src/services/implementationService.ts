import { Task } from '@/types/implementation';

export interface ImplementationLog {
  id?: string;
  action: string;
  details?: string;
  projectId: string;
  userId: string;
  user: string;
  timestamp?: string;
}

class ImplementationService {
  private baseUrl = 'http://localhost:3001/api/implementation';

  // タスク関連
  async getTasks(projectId: string): Promise<Task[]> {
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

  // ログ関連
  async getLogs(projectId: string, limit: number = 50): Promise<ImplementationLog[]> {
    try {
      const response = await fetch(`${this.baseUrl}/logs/${projectId}?limit=${limit}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      return await response.json();
    } catch (error) {
      console.error('Get logs error:', error);
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
}

export const implementationService = new ImplementationService();
export default implementationService;
