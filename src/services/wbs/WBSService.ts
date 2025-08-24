// src/services/wbs/WBSService.ts
import { WBSNode, WBSProject, WBSActivity, WBSExportOptions } from '@/types/wbs';
import { getEnv } from '@/utils/env';

class WBSService {
  private apiBase: string;
  private baseUrl: string;
  private projectsUrl: string;
  private activitiesUrl: string;

  constructor() {
    // Decide API base URL at runtime (dev server vs production)
    const viteBase = getEnv('VITE_API_BASE_URL');
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

    if (typeof viteBase === 'string' && viteBase.startsWith('http')) {
      this.apiBase = viteBase.replace(/\/$/, '');
    } else if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'test')
    ) {
      this.apiBase = 'http://localhost:3001';
    } else {
      // Same origin (Vercel Functions)
      this.apiBase = '';
    }

    this.baseUrl = `${this.apiBase}/api/wbs`;
    this.projectsUrl = `${this.apiBase}/api/wbs-projects`;
    this.activitiesUrl = `${this.apiBase}/api/wbs-activities`;
  }

  // プロジェクト管理
  async createProject(userId: string, projectData: Partial<WBSProject>): Promise<string> {
    const newProject: Omit<WBSProject, 'id'> = {
      name: projectData.name || '新規プロジェクト',
      description: projectData.description || '',
      startDate: projectData.startDate || new Date().toISOString(),
      endDate: projectData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'planning',
      owner: userId,
      team: [userId],
      budget: projectData.budget || 0,
      currency: 'JPY',
      visibility: 'private',
      tags: projectData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = await fetch(this.projectsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
    });

    if (!response.ok) throw new Error('Failed to create project');
    const created = await response.json();

    await this.logActivity(created._id, userId, 'created', 'プロジェクトを作成しました');

    return created._id;
  }

  async getProjects(userId: string): Promise<WBSProject[]> {
    const response = await fetch(`${this.projectsUrl}/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  }

  // ノード管理
  async createNode(node: Partial<WBSNode>, userId: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...node, createdBy: userId }),
    });
    if (response.status === 404) {
      // Dev fallback: backend WBS API not available. Do not block todo creation.
      console.warn('[WBS] /api/wbs not found. Skipping WBS creation in dev.');
      return `wbs_mock_${Date.now()}`;
    }
    if (!response.ok) throw new Error('Failed to create WBS node');
    const created = await response.json();
    return created._id;
  }

  async getProjectNodes(projectId: string): Promise<WBSNode[]> {
    const response = await fetch(`${this.baseUrl}/project/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch WBS nodes');
    const nodes = await response.json();

    // _idをidにマッピング
    return nodes.map((node: any) => ({
      ...node,
      id: node._id,
    }));
  }

  async updateNode(nodeId: string, updates: Partial<WBSNode>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${nodeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update WBS node');
  }

  /**
   * ノードを削除
   */
  async deleteNode(nodeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${nodeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete node: ${response.statusText}`);
      }

      console.log('Node deleted successfully:', nodeId);
    } catch (error) {
      console.error('Error deleting node:', error);
      throw error;
    }
  }

  // リアルタイム監視（ポーリング）
  subscribeToProject(projectId: string, callback: (nodes: WBSNode[]) => void): () => void {
    // 初回読み込み
    this.getProjectNodes(projectId).then(callback).catch(console.error);

    // ポーリングで実装
    const interval = setInterval(async () => {
      try {
        const nodes = await this.getProjectNodes(projectId);
        callback(nodes);
      } catch (error) {
        console.error('Failed to fetch WBS updates:', error);
      }
    }, 30000); // 30秒ごと

    return () => clearInterval(interval);
  }

  // 進捗計算
  async calculateProgress(projectId: string): Promise<number> {
    const nodes = await this.getProjectNodes(projectId);
    if (nodes.length === 0) return 0;

    const leafNodes = nodes.filter((node) => !nodes.some((n) => n.parentId === node.id));

    const totalWeight = leafNodes.reduce((sum, node) => sum + (node.estimatedHours || 1), 0);
    const weightedProgress = leafNodes.reduce(
      (sum, node) => sum + node.progress * (node.estimatedHours || 1),
      0
    );

    return Math.round(weightedProgress / totalWeight);
  }

  // 依存関係チェック
  async checkDependencies(nodeId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${nodeId}`);
    if (!response.ok) return true;

    const node = await response.json();
    if (!node || node.dependencies.length === 0) return true;

    const dependencies = await Promise.all(
      node.dependencies.map(async (depId: string) => {
        const depResponse = await fetch(`${this.baseUrl}/${depId}`);
        return depResponse.ok ? depResponse.json() : null;
      })
    );

    return dependencies.every((dep) => dep && dep.status === 'completed');
  }

  // アクティビティログ
  private async logActivity(
    projectId: string,
    userId: string,
    action: WBSActivity['action'],
    details: string
  ): Promise<void> {
    await fetch(this.activitiesUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodeId: projectId,
        userId,
        action,
        details,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  // エクスポート機能
  async exportProject(projectId: string, options: WBSExportOptions): Promise<Blob> {
    const projectResponse = await fetch(`${this.projectsUrl}/${projectId}`);
    const project = projectResponse.ok ? await projectResponse.json() : null;
    const nodes = await this.getProjectNodes(projectId);

    const data = {
      project,
      nodes,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    switch (options.format) {
      case 'json':
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      case 'csv':
        return this.exportToCSV(nodes);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private exportToCSV(nodes: WBSNode[]): Blob {
    const headers = ['ID', 'Name', 'Level', 'Start Date', 'End Date', 'Progress', 'Status'];
    const rows = nodes.map((node) => [
      node.id,
      node.name,
      node.level.toString(),
      node.startDate,
      node.endDate,
      `${node.progress}%`,
      node.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  }
}

export default new WBSService();
