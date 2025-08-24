import { WBSNode } from '../models/WBSNode.js';
import { ITodoItem } from '../models/TodoItem.js';

class TodoWBSIntegrationService {
  private SITE_DEV_PROJECT_ID = 'site-dev-project';
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

  async handleTodoCreation(todo: ITodoItem, userId: string): Promise<void> {
    if (!this.isSiteDevRelated(todo)) {
      return;
    }

    try {
      const wbsNode = new WBSNode({
        projectId: this.SITE_DEV_PROJECT_ID,
        parentId: null,
        name: todo.task,
        description: `ToDoから自動作成: ${todo.task}`,
        level: 1,
        orderIndex: await this.getNextOrderIndex(),
        startDate: new Date(),
        endDate: todo.deadline || this.calculateEndDate(todo.priority),
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
        createdBy: userId,
        color: this.getColorByPriority(todo.priority),
        icon: todo.type === 'output' ? '🚀' : '📚',
      });

      await wbsNode.save();
      console.log(`ToDo "${todo.task}" をWBSに追加しました`);
    } catch (error) {
      console.error('WBS連携エラー:', error);
    }
  }

  private isSiteDevRelated(todo: ITodoItem): boolean {
    const taskLower = todo.task?.toLowerCase() || '';
    const category = todo.category?.toLowerCase() || '';
    const tags = todo.tags || [];

    if (category === 'サイト開発' || category === 'development') {
      return true;
    }

    if (tags.some((tag) => this.SITE_DEV_KEYWORDS.includes(tag.toLowerCase()))) {
      return true;
    }

    return this.SITE_DEV_KEYWORDS.some((keyword) => taskLower.includes(keyword.toLowerCase()));
  }

  private async getNextOrderIndex(): Promise<number> {
    const count = await WBSNode.countDocuments({ projectId: this.SITE_DEV_PROJECT_ID });
    return count + 1;
  }

  private calculateEndDate(priority: number = 3): Date {
    const daysToAdd = 6 - priority;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysToAdd);
    return endDate;
  }

  private estimateDuration(todo: ITodoItem): number {
    if (todo.deadline) {
      const start = new Date();
      const end = new Date(todo.deadline);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 6 - todo.priority;
  }

  private estimateHours(todo: ITodoItem): number {
    const baseHours = todo.type === 'output' ? 8 : 4;
    const priorityMultiplier = todo.priority / 3;
    return Math.round(baseHours * priorityMultiplier);
  }

  private getColorByPriority(priority: number = 3): string {
    const colors: { [key: number]: string } = {
      5: '#ef4444',
      4: '#f97316',
      3: '#eab308',
      2: '#22c55e',
      1: '#3b82f6',
    };
    return colors[priority] || '#6b7280';
  }
}

export default new TodoWBSIntegrationService();
