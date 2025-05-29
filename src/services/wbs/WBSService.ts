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
    Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
    WBSNode,
    WBSProject,
    WBSActivity,
    WBSExportOptions} from '@/types/wbs';

class WBSService {
    private projectsCollection = 'wbs_projects';
    private nodesCollection = 'wbs_nodes';
    private commentsCollection = 'wbs_comments';
    private activitiesCollection = 'wbs_activities';
    private templatesCollection = 'wbs_templates';

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
            updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, this.projectsCollection), {
            ...newProject,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
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
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as WBSProject));
    }

    // ノード管理
    async createNode(nodeData: Partial<WBSNode>, userId: string): Promise<string> {
        const newNode: Omit<WBSNode, 'id'> = {
            projectId: nodeData.projectId || '',
            parentId: nodeData.parentId || null,
            name: nodeData.name || '新規タスク',
            description: nodeData.description || '',
            level: nodeData.level || 0,
            orderIndex: nodeData.orderIndex || 0,
            startDate: nodeData.startDate || new Date().toISOString(),
            endDate: nodeData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            duration: nodeData.duration || 7,
            progress: 0,
            status: 'not-started',
            assignees: nodeData.assignees || [userId],
            dependencies: [],
            estimatedHours: nodeData.estimatedHours || 0,
            actualHours: 0,
            budget: nodeData.budget || 0,
            actualCost: 0,
            deliverables: [],
            risks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId
        };

        const docRef = await addDoc(collection(db, this.nodesCollection), {
            ...newNode,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        await this.logActivity(nodeData.projectId || '', userId, 'created', `タスク「${newNode.name}」を作成しました`);

        return docRef.id;
    }

    async getProjectNodes(projectId: string): Promise<WBSNode[]> {
        const q = query(
            collection(db, this.nodesCollection),
            where('projectId', '==', projectId),
            orderBy('level'),
            orderBy('orderIndex')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as WBSNode));
    }

    async updateNode(nodeId: string, updates: Partial<WBSNode>, userId: string): Promise<void> {
        await updateDoc(doc(db, this.nodesCollection, nodeId), {
            ...updates,
            updatedAt: serverTimestamp()
        });

        await this.logActivity(
            updates.projectId || '',
            userId,
            'updated',
            `タスク「${updates.name || ''}」を更新しました`
        );
    }

    async deleteNode(nodeId: string, projectId: string, userId: string): Promise<void> {
        const batch = writeBatch(db);

        // ノードとその子ノードを削除
        const childNodes = await this.getChildNodes(nodeId);
        childNodes.forEach(child => {
            batch.delete(doc(db, this.nodesCollection, child.id));
        });

        batch.delete(doc(db, this.nodesCollection, nodeId));
        await batch.commit();

        await this.logActivity(projectId, userId, 'updated', 'タスクを削除しました');
    }

    // リアルタイム監視
    subscribeToProject(
        projectId: string,
        onUpdate: (nodes: WBSNode[]) => void
    ): Unsubscribe {
        const q = query(
            collection(db, this.nodesCollection),
            where('projectId', '==', projectId)
        );

        return onSnapshot(q, snapshot => {
            const nodes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as WBSNode));

            onUpdate(nodes.sort((a, b) => {
                if (a.level !== b.level) return a.level - b.level;
                return a.orderIndex - b.orderIndex;
            }));
        });
    }

    // 進捗計算
    async calculateProgress(projectId: string): Promise<number> {
        const nodes = await this.getProjectNodes(projectId);
        if (nodes.length === 0) return 0;

        const leafNodes = nodes.filter(node =>
            !nodes.some(n => n.parentId === node.id)
        );

        const totalWeight = leafNodes.reduce((sum, node) => sum + (node.estimatedHours || 1), 0);
        const weightedProgress = leafNodes.reduce((sum, node) =>
            sum + (node.progress * (node.estimatedHours || 1)), 0
        );

        return Math.round(weightedProgress / totalWeight);
    }

    // 依存関係チェック
    async checkDependencies(nodeId: string): Promise<boolean> {
        const node = await this.getNode(nodeId);
        if (!node || node.dependencies.length === 0) return true;

        const dependencies = await Promise.all(
            node.dependencies.map(depId => this.getNode(depId))
        );

        return dependencies.every(dep => dep && dep.status === 'completed');
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
            timestamp: serverTimestamp()
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
            ...snapshot.docs[0].data()
        } as WBSNode;
    }

    private async getChildNodes(parentId: string): Promise<WBSNode[]> {
        const q = query(
            collection(db, this.nodesCollection),
            where('parentId', '==', parentId)
        );

        const snapshot = await getDocs(q);
        const children = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as WBSNode));

        // 再帰的に子ノードを取得
        const grandChildren = await Promise.all(
            children.map(child => this.getChildNodes(child.id))
        );

        return [...children, ...grandChildren.flat()];
    }

    // エクスポート機能
    async exportProject(
        projectId: string,
        options: WBSExportOptions
    ): Promise<Blob> {
        const project = await this.getProject(projectId);
        const nodes = await this.getProjectNodes(projectId);

        const data = {
            project,
            nodes,
            exportDate: new Date().toISOString(),
            version: '1.0'
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
        const rows = nodes.map(node => [
            node.id,
            node.name,
            node.level.toString(),
            node.startDate,
            node.endDate,
            `${node.progress}%`,
            node.status
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        return new Blob([csv], { type: 'text/csv' });
    }

    private async getProject(projectId: string): Promise<WBSProject | null> {
        const snapshot = await getDocs(
            query(collection(db, this.projectsCollection), where('id', '==', projectId))
        );

        if (snapshot.empty) return null;

        return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        } as WBSProject;
    }
}

export default new WBSService();