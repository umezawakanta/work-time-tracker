interface WBSNode {
  id: string;
  title: string;
  description?: string;
  level: number;
  parentId?: string;
  children: WBSNode[];
  estimatedHours?: number;
  dependencies?: string[];
  assignee?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startDate?: Date;
  endDate?: Date;
}

interface WBSGenerationRequest {
  projectTitle: string;
  projectDescription: string;
  deadline?: Date;
  teamSize?: number;
  complexity: 'simple' | 'medium' | 'complex';
  industry?: string;
}

interface WBSGenerationResponse {
  wbs: WBSNode;
  summary: {
    totalTasks: number;
    estimatedTotalHours: number;
    criticalPath: string[];
    milestones: Array<{
      title: string;
      date: Date;
      description: string;
    }>;
  };
  ganttData: GanttTask[];
}

interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string[];
  type: 'task' | 'milestone' | 'project';
  resource?: string;
}

class WBSGeneratorService {
  private readonly API_ENDPOINT =
    process.env.VITE_AI_API_ENDPOINT || 'http://localhost:3001/api/ai';

  // アクセストークンをAPI経由で取得
  private async fetchAccessToken(): Promise<string> {
    const response = await fetch(`${this.API_ENDPOINT}/auth/token`, {
      method: 'GET',
      credentials: 'include', // 必要に応じて
    });
    if (!response.ok) {
      throw new Error('アクセストークンの取得に失敗しました');
    }
    const data = await response.json();
    return data.accessToken;
  }

  async generateWBS(request: WBSGenerationRequest): Promise<WBSGenerationResponse> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockWBS(request);
      }

      // localStorageの代わりにAPI経由でトークン取得
      const accessToken = await this.fetchAccessToken();

      const response = await fetch(`${this.API_ENDPOINT}/generate-wbs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`WBS generation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WBS generation error:', error);
      return this.generateMockWBS(request);
    }
  }

  private generateMockWBS(request: WBSGenerationRequest): WBSGenerationResponse {
    const projectId = 'project-root';
    const startDate = new Date();
    const endDate = request.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // プロジェクトの複雑さに基づいてタスク構造を生成
    const phases = this.getProjectPhases(request.complexity);
    const wbsTree = this.buildWBSTree(projectId, request.projectTitle, phases, startDate, endDate);

    const flatTasks = this.flattenWBS(wbsTree);
    const ganttData = this.generateGanttData(flatTasks, startDate, endDate);

    return {
      wbs: wbsTree,
      summary: {
        totalTasks: flatTasks.length,
        estimatedTotalHours: flatTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
        criticalPath: this.calculateCriticalPath(flatTasks),
        milestones: this.generateMilestones(phases, startDate, endDate),
      },
      ganttData,
    };
  }

  private getProjectPhases(
    complexity: string
  ): Array<{ name: string; tasks: string[]; estimatedHours: number }> {
    const basePhases = [
      {
        name: '計画・分析',
        tasks: ['要件定義', 'プロジェクト計画策定', 'リスク分析', 'リソース計画'],
        estimatedHours: complexity === 'simple' ? 16 : complexity === 'medium' ? 32 : 48,
      },
      {
        name: '設計',
        tasks: ['基本設計', '詳細設計', '技術調査', '設計レビュー'],
        estimatedHours: complexity === 'simple' ? 24 : complexity === 'medium' ? 48 : 80,
      },
      {
        name: '実装',
        tasks: ['開発環境構築', 'コア機能実装', '統合', 'ユニットテスト'],
        estimatedHours: complexity === 'simple' ? 40 : complexity === 'medium' ? 80 : 160,
      },
      {
        name: 'テスト',
        tasks: ['テスト計画', '結合テスト', 'システムテスト', 'ユーザビリティテスト'],
        estimatedHours: complexity === 'simple' ? 16 : complexity === 'medium' ? 32 : 64,
      },
      {
        name: 'デプロイ・運用',
        tasks: ['本番環境構築', 'デプロイ', 'ユーザートレーニング', '運用開始'],
        estimatedHours: complexity === 'simple' ? 8 : complexity === 'medium' ? 16 : 32,
      },
    ];

    if (complexity === 'complex') {
      basePhases.splice(2, 0, {
        name: 'プロトタイプ',
        tasks: ['プロトタイプ作成', '概念実証', 'フィードバック収集', '改善'],
        estimatedHours: 40,
      });
    }

    return basePhases;
  }

  private buildWBSTree(
    rootId: string,
    projectTitle: string,
    phases: Array<{ name: string; tasks: string[]; estimatedHours: number }>,
    startDate: Date,
    endDate: Date
  ): WBSNode {
    const root: WBSNode = {
      id: rootId,
      title: projectTitle,
      level: 0,
      children: [],
      status: 'not_started',
      startDate,
      endDate,
    };

    phases.forEach((phase, phaseIndex) => {
      const phaseId = `phase-${phaseIndex}`;
      const phaseNode: WBSNode = {
        id: phaseId,
        title: phase.name,
        level: 1,
        parentId: rootId,
        children: [],
        estimatedHours: phase.estimatedHours,
        status: 'not_started',
      };

      phase.tasks.forEach((taskName, taskIndex) => {
        const taskId = `task-${phaseIndex}-${taskIndex}`;
        const taskNode: WBSNode = {
          id: taskId,
          title: taskName,
          level: 2,
          parentId: phaseId,
          children: [],
          estimatedHours: Math.floor(phase.estimatedHours / phase.tasks.length),
          status: 'not_started',
        };

        phaseNode.children.push(taskNode);
      });

      root.children.push(phaseNode);
    });

    return root;
  }

  private flattenWBS(node: WBSNode, result: WBSNode[] = []): WBSNode[] {
    result.push(node);
    node.children.forEach((child) => this.flattenWBS(child, result));
    return result;
  }

  private generateGanttData(tasks: WBSNode[], startDate: Date, endDate: Date): GanttTask[] {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return tasks.map((task, index) => {
      const taskDuration = Math.max(1, Math.floor((task.estimatedHours || 8) / 8)); // 1日8時間として計算
      const taskStart = new Date(startDate.getTime() + index * 2 * 24 * 60 * 60 * 1000);
      const taskEnd = new Date(taskStart.getTime() + taskDuration * 24 * 60 * 60 * 1000);

      return {
        id: task.id,
        name: task.title,
        start: taskStart,
        end: taskEnd,
        progress: task.status === 'completed' ? 100 : task.status === 'in_progress' ? 50 : 0,
        type: task.level === 0 ? 'project' : task.level === 1 ? 'milestone' : 'task',
        resource: task.assignee,
      };
    });
  }

  private calculateCriticalPath(tasks: WBSNode[]): string[] {
    // 簡単なクリティカルパス計算（実際のプロジェクトではより複雑なアルゴリズムが必要）
    return tasks
      .filter((task) => task.level === 2) // タスクレベルのみ
      .sort((a, b) => (b.estimatedHours || 0) - (a.estimatedHours || 0))
      .slice(0, 3)
      .map((task) => task.id);
  }

  private generateMilestones(
    phases: Array<{ name: string; tasks: string[]; estimatedHours: number }>,
    startDate: Date,
    endDate: Date
  ): Array<{ title: string; date: Date; description: string }> {
    const totalDuration = endDate.getTime() - startDate.getTime();
    const phaseCount = phases.length;

    return phases.map((phase, index) => {
      const milestoneDate = new Date(
        startDate.getTime() + ((index + 1) / phaseCount) * totalDuration
      );

      return {
        title: `${phase.name}完了`,
        date: milestoneDate,
        description: `${phase.name}フェーズのすべてのタスクが完了`,
      };
    });
  }
}

export const wbsGeneratorService = new WBSGeneratorService();
export type { WBSNode, WBSGenerationRequest, WBSGenerationResponse, GanttTask };
