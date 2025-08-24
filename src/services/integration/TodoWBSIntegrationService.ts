import { WBSNode } from '../../types/wbs';
import { Todo, NewTodo } from '../../types/todo';
import WBSService from '../wbs/WBSService';

interface TodoWBSMapping {
  todoId: string;
  wbsNodeId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

class TodoWBSIntegrationService {
  private SITE_DEV_PROJECT_ID = 'site-dev-project';

  // サイト開発関連のキーワード
  private SITE_DEV_KEYWORDS = [
    'サイト開発',
    'development',
    'dev',
    '開発',
    'コーディング',
    'プログラミング',
    'バグ修正',
    'リファクタリング',
    'デバッグ',
    '実装',
    'フロントエンド',
    'バックエンド',
  ];

  /**
   * ToDoがサイト開発関連かを判定
   */
  private isSiteDevRelated(todo: Partial<Todo> | NewTodo): boolean {
    const taskLower = todo.task?.toLowerCase() || '';
    const category = (todo as any).category?.toLowerCase() || '';
    const tags = todo.tags || [];

    // カテゴリチェック
    if (category === 'サイト開発' || category === 'development') {
      return true;
    }

    // タグチェック
    if (tags.some((tag) => this.SITE_DEV_KEYWORDS.includes(tag.toLowerCase()))) {
      return true;
    }

    // タスク内容チェック
    return this.SITE_DEV_KEYWORDS.some((keyword) => taskLower.includes(keyword.toLowerCase()));
  }

  /**
   * ToDoからWBSノードを作成
   */
  async createWBSNodeFromTodo(todo: Todo, userId: string, parentNodeId?: string): Promise<string> {
    const currentPhase = await this.getCurrentDevelopmentPhase();

    const wbsNode: Partial<WBSNode> = {
      projectId: this.SITE_DEV_PROJECT_ID,
      parentId: parentNodeId || currentPhase?.id || null,
      name: todo.task,
      description: todo.note || `ToDoから自動作成: ${todo.task}`,
      level: currentPhase ? currentPhase.level + 1 : 1,
      orderIndex: await this.getNextOrderIndex(parentNodeId || currentPhase?.id || null),
      startDate: new Date().toISOString().split('T')[0],
      endDate: todo.deadline
        ? new Date(todo.deadline).toISOString().split('T')[0]
        : this.calculateEndDate(todo.priority),
      duration: this.estimateDuration(todo),
      progress: todo.completed ? 100 : 0,
      status: todo.completed ? 'completed' : 'in-progress',
      assignees: [userId],
      dependencies: [],
      estimatedHours: this.estimateHours(todo),
      actualHours: 0,
      budget: 0,
      actualCost: 0,
      deliverables: [],
      risks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      color: this.getColorByPriority(todo.priority),
      icon: this.getIconByType(todo.type),
    };

    const nodeId = await WBSService.createNode(wbsNode, userId);

    // マッピング情報を保存（MongoDBのAPIを通じて）
    await this.createMapping(todo._id, nodeId, this.SITE_DEV_PROJECT_ID);

    return nodeId;
  }

  /**
   * 現在の開発フェーズを取得
   */
  private async getCurrentDevelopmentPhase(): Promise<WBSNode | null> {
    const nodes = await WBSService.getProjectNodes(this.SITE_DEV_PROJECT_ID);

    // 進行中のフェーズを探す
    const activePhase = nodes.find((node) => node.level === 0 && node.status === 'in-progress');

    if (activePhase) return activePhase;

    // なければ最新のフェーズ
    return (
      nodes.filter((node) => node.level === 0).sort((a, b) => b.orderIndex - a.orderIndex)[0] ||
      null
    );
  }

  /**
   * 次の順序インデックスを取得
   */
  private async getNextOrderIndex(parentId: string | null): Promise<number> {
    const nodes = await WBSService.getProjectNodes(this.SITE_DEV_PROJECT_ID);
    const siblings = nodes.filter((n) => n.parentId === parentId);
    return siblings.length + 1;
  }

  /**
   * 優先度から終了日を計算
   */
  private calculateEndDate(priority: number = 3): string {
    const daysToAdd = 6 - priority; // 優先度5なら1日、優先度1なら5日
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysToAdd);
    return endDate.toISOString().split('T')[0];
  }

  /**
   * タスクの推定期間を計算
   */
  private estimateDuration(todo: Todo): number {
    if (todo.deadline) {
      const start = new Date();
      const end = new Date(todo.deadline);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 6 - todo.priority; // 優先度に基づくデフォルト値
  }

  /**
   * タスクの推定時間を計算
   */
  private estimateHours(todo: Todo): number {
    // 優先度とタイプに基づく推定
    const baseHours = todo.type === 'output' ? 8 : 4;
    const priorityMultiplier = todo.priority / 3;
    return Math.round(baseHours * priorityMultiplier);
  }

  /**
   * 優先度に基づく色を取得
   */
  private getColorByPriority(priority: number = 3): string {
    const colors = {
      5: '#ef4444', // red
      4: '#f97316', // orange
      3: '#eab308', // yellow
      2: '#22c55e', // green
      1: '#3b82f6', // blue
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  }

  /**
   * タイプに基づくアイコンを取得
   */
  private getIconByType(type: 'input' | 'output'): string {
    return type === 'output' ? '🚀' : '📚';
  }

  /**
   * マッピング情報を作成（MongoDB API経由）
   */
  private async createMapping(todoId: string, wbsNodeId: string, projectId: string): Promise<void> {
    await fetch('/api/wbs-mappings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todoId,
        wbsNodeId,
        projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  /**
   * ToDoの状態をWBSに同期
   */
  async syncTodoToWBS(todo: Todo): Promise<void> {
    const mapping = await this.getMapping(todo._id);
    if (!mapping) return;

    await WBSService.updateNode(mapping.wbsNodeId, {
      name: todo.task,
      progress: todo.completed ? 100 : 0,
      status: todo.completed ? 'completed' : 'in-progress',
      endDate: todo.deadline ? new Date(todo.deadline).toISOString().split('T')[0] : undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * ToDoとWBSのマッピングを取得（MongoDB API経由）
   */
  private async getMapping(todoId: string): Promise<TodoWBSMapping | null> {
    const response = await fetch(`/api/wbs-mappings/todo/${todoId}`);
    if (!response.ok) return null;
    return response.json();
  }

  /**
   * ToDo作成時の自動WBS連携処理
   */
  async handleTodoCreation(todo: Todo, userId: string): Promise<void> {
    if (!this.isSiteDevRelated(todo)) {
      return;
    }

    try {
      await this.createWBSNodeFromTodo(todo, userId);
      console.log(`ToDo "${todo.task}" をWBSに追加しました`);
    } catch (error) {
      console.error('WBS連携エラー:', error);
    }
  }

  /**
   * WBSノードに関連するToDoを取得
   */
  async getTodosForWBSNode(wbsNodeId: string): Promise<Todo[]> {
    const response = await fetch(`/api/wbs-mappings/wbs/${wbsNodeId}/todos`);
    if (!response.ok) return [];
    return response.json();
  }
}

export default new TodoWBSIntegrationService();
