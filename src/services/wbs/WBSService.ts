// src/services/wbs/WBSService.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { WBSNode, WBSProject, WBSActivity, WBSExportOptions } from '@/types/wbs';

class WBSService {
  private projectsCollection = 'wbs_projects';
  private nodesCollection = 'wbs_nodes';
  private commentsCollection = 'wbs_comments';
  private activitiesCollection = 'wbs_activities';
  private templatesCollection = 'wbs_templates';
  private baseUrl = '/api/wbs';

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

    const docRef = await addDoc(collection(db, this.projectsCollection), {
      ...newProject,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await this.logActivity(docRef.id, userId, 'created', 'プロジェクトを作成しました');

    return docRef.id;
  }

  async getProjects(userId: string): Promise<WBSProject[]> {
    const q = query(
      collection(db, this.projectsCollection),
      where('team', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as WBSProject
    );
  }

  // ノード管理
  async createNode(node: Partial<WBSNode>, userId: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...node, createdBy: userId }),
    });
    if (!response.ok) throw new Error('Failed to create WBS node');
    const created = await response.json();
    return created._id;
  }

  async getProjectNodes(projectId: string): Promise<WBSNode[]> {
    const response = await fetch(`${this.baseUrl}/project/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch WBS nodes');
    return response.json();
  }

  async updateNode(nodeId: string, updates: Partial<WBSNode>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${nodeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update WBS node');
  }

  async deleteNode(nodeId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${nodeId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete WBS node');
  }

  // リアルタイム監視
  subscribeToProject(projectId: string, callback: (nodes: WBSNode[]) => void): () => void {
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
    const node = await this.getNode(nodeId);
    if (!node || node.dependencies.length === 0) return true;

    const dependencies = await Promise.all(node.dependencies.map((depId) => this.getNode(depId)));

    return dependencies.every((dep) => dep && dep.status === 'completed');
  }

  // アクティビティログ
  private async logActivity(
    projectId: string,
    userId: string,
    action: WBSActivity['action'],
    details: string
  ): Promise<void> {
    await addDoc(collection(db, this.activitiesCollection), {
      nodeId: projectId,
      userId,
      action,
      details,
      timestamp: serverTimestamp(),
    });
  }

  // ヘルパーメソッド
  private async getNode(nodeId: string): Promise<WBSNode | null> {
    const snapshot = await getDocs(
      query(collection(db, this.nodesCollection), where('id', '==', nodeId))
    );

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as WBSNode;
  }

  private async getChildNodes(parentId: string): Promise<WBSNode[]> {
    const q = query(collection(db, this.nodesCollection), where('parentId', '==', parentId));

    const snapshot = await getDocs(q);
    const children = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as WBSNode
    );

    // 再帰的に子ノードを取得
    const grandChildren = await Promise.all(children.map((child) => this.getChildNodes(child.id)));

    return [...children, ...grandChildren.flat()];
  }

  // エクスポート機能
  async exportProject(projectId: string, options: WBSExportOptions): Promise<Blob> {
    const project = await this.getProject(projectId);
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

  private async getProject(projectId: string): Promise<WBSProject | null> {
    const snapshot = await getDocs(
      query(collection(db, this.projectsCollection), where('id', '==', projectId))
    );

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as WBSProject;
  }
}

export default new WBSService();
