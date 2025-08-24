import AdvancedAIService from './AdvancedAIService';
import { WBSNode } from '@/types/wbs';
import { TaskType } from '@/types/todo';
import { siteDevNodes } from '@/data/siteDevWBS';
import WBSService from '../wbs/WBSService';
import { TodoItem } from '@/types';

interface SiteDevTaskSuggestion {
  task: string;
  type: TaskType;
  priority: number;
  estimatedHours: number;
  category: string;
  reason: string;
  relatedWBSNode?: string;
  deadline?: string;
  tags: string[];
}

export class SiteDevAIService {
  private aiService = AdvancedAIService;

  constructor() {}

  /**
   * サイト開発に必要なToDoを提案
   */
  async suggestSiteDevTasks(
    currentTodos: TodoItem[],
    completedTodos: TodoItem[],
    userId: string
  ): Promise<SiteDevTaskSuggestion[]> {
    try {
      console.log('Starting task suggestion...');

      // WBSデータから現在の進捗を分析
      const wbsAnalysis = await this.analyzeWBSProgress();

      console.log('WBS Analysis:', wbsAnalysis);

      // AIプロバイダーが設定されている場合はAIを使用
      return await this.generateAISuggestions(wbsAnalysis, currentTodos, completedTodos);
    } catch (error) {
      console.error('Task suggestion failed:', error);
      return this.getDefaultSuggestions();
    }
  }

  /**
   * WBSの進捗を分析
   */
  private async analyzeWBSProgress() {
    try {
      // Firebaseからデータを取得する代わりに、ローカルデータを使用
      const nodes = siteDevNodes; // Firebaseではなくローカルデータを使用

      // デバッグログを追加
      console.log('WBS nodes loaded:', nodes.length);

      const inProgressNodes = nodes.filter((n) => n.status === 'in-progress');
      const notStartedNodes = nodes.filter((n) => n.status === 'not-started');
      const delayedNodes = nodes.filter((n) => {
        if (n.status === 'completed' || !n.endDate) return false;
        return new Date(n.endDate) < new Date();
      });

      // 現在のフェーズを特定
      const currentPhase =
        inProgressNodes.find((n) => n.level === 0) || notStartedNodes.find((n) => n.level === 0);

      // 優先度の高いタスクを特定
      const priorityTasks = inProgressNodes
        .filter((n) => n.progress < 50)
        .sort((a, b) => {
          // 期限が近い順
          if (a.endDate && b.endDate) {
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          }
          return 0;
        });

      return {
        currentPhase,
        inProgressNodes,
        notStartedNodes,
        delayedNodes,
        priorityTasks,
        overallProgress: this.calculateOverallProgress(nodes),
      };
    } catch (error) {
      console.error('Error in analyzeWBSProgress:', error);
      // エラーが発生した場合は空のデータを返す
      return {
        currentPhase: null,
        inProgressNodes: [],
        notStartedNodes: [],
        delayedNodes: [],
        priorityTasks: [],
        overallProgress: 0,
      };
    }
  }

  /**
   * AIを使用してタスクを提案
   */
  private async generateAISuggestions(
    wbsAnalysis: any,
    currentTodos: TodoItem[],
    completedTodos: TodoItem[]
  ): Promise<SiteDevTaskSuggestion[]> {
    // Skip AI and use rule-based suggestions directly
    return this.generateRuleBasedSuggestions(wbsAnalysis, currentTodos, completedTodos);
  }

  /**
   * AI用のプロンプトを構築
   */
  private buildAIPrompt(
    wbsAnalysis: any,
    currentTodos: TodoItem[],
    completedTodos: TodoItem[]
  ): string {
    const currentPhase = wbsAnalysis.currentPhase?.name || '不明';
    const progressSummary = wbsAnalysis.inProgressNodes
      .map((n: WBSNode) => `- ${n.name}: ${n.progress}%完了`)
      .join('\n');

    const recentCompletedTasks = completedTodos
      .slice(0, 5)
      .map((t) => t.task)
      .join(', ');

    return `
あなたは経験豊富なプロジェクトマネージャーです。
以下の情報を基に、サイト開発プロジェクトの次のToDoタスクを5つ提案してください。

現在のフェーズ: ${currentPhase}
全体進捗: ${wbsAnalysis.overallProgress}%

進行中のタスク:
${progressSummary}

最近完了したタスク: ${recentCompletedTasks}

各タスクは以下のJSON形式で返してください:
{
  "suggestions": [
    {
      "task": "タスクの内容",
      "type": "input" または "output",
      "priority": 1-5の数値（5が最高）,
      "estimatedHours": 推定作業時間,
      "category": "カテゴリ名",
      "reason": "このタスクを提案する理由",
      "relatedWBSNode": "関連するWBSノードID",
      "deadline": "YYYY-MM-DD形式の期限",
      "tags": ["タグ1", "タグ2"]
    }
  ]
}

タスクは具体的で実行可能なものにしてください。
現在の開発フェーズと進捗状況を考慮してください。
`;
  }

  /**
   * ルールベースでタスクを提案
   */
  private generateRuleBasedSuggestions(
    wbsAnalysis: any,
    currentTodos: TodoItem[],
    completedTodos: TodoItem[]
  ): SiteDevTaskSuggestion[] {
    const suggestions: SiteDevTaskSuggestion[] = [];

    // 遅延タスクがある場合
    if (wbsAnalysis.delayedNodes.length > 0) {
      const delayedNode = wbsAnalysis.delayedNodes[0];
      suggestions.push({
        task: `${delayedNode.name}の遅延対策を検討する`,
        type: 'output',
        priority: 5,
        estimatedHours: 2,
        category: 'プロジェクト管理',
        reason: '遅延タスクの早期解決が必要',
        relatedWBSNode: delayedNode.id,
        deadline: this.getDeadline(1),
        tags: ['緊急', 'プロジェクト管理'],
      });
    }

    // 優先度の高いタスクから提案
    wbsAnalysis.priorityTasks.slice(0, 3).forEach((node: WBSNode) => {
      const subtasks = this.generateSubtasksForNode(node);
      suggestions.push(...subtasks);
    });

    // 現在のフェーズに基づく提案
    if (wbsAnalysis.currentPhase) {
      const phaseTasks = this.generatePhaseBasedTasks(wbsAnalysis.currentPhase);
      suggestions.push(...phaseTasks);
    }

    // テストとドキュメント関連
    if (wbsAnalysis.overallProgress > 60) {
      suggestions.push({
        task: '統合テストケースの作成',
        type: 'output',
        priority: 4,
        estimatedHours: 4,
        category: 'テスト',
        reason: '開発が進んでいるため、テストの準備が必要',
        tags: ['テスト', '品質保証'],
        deadline: this.getDeadline(7),
      });
    }

    return suggestions.slice(0, 5); // 最大5つまで
  }

  /**
   * WBSノードから具体的なサブタスクを生成
   */
  private generateSubtasksForNode(node: WBSNode): SiteDevTaskSuggestion[] {
    const subtasks: SiteDevTaskSuggestion[] = [];

    switch (node.name) {
      case '分析ダッシュボード':
        if (node.progress < 30) {
          subtasks.push({
            task: 'ダッシュボードのUIモックアップを作成',
            type: 'output',
            priority: 4,
            estimatedHours: 3,
            category: 'UI/UX',
            reason: 'ビジュアルデザインの早期確定が必要',
            relatedWBSNode: node.id,
            tags: ['UI/UX', 'デザイン'],
            deadline: this.getDeadline(3),
          });
        }
        if (node.progress < 60) {
          subtasks.push({
            task: 'チャートライブラリの選定と実装',
            type: 'input',
            priority: 4,
            estimatedHours: 2,
            category: '技術調査',
            reason: 'データ可視化の基盤構築が必要',
            relatedWBSNode: node.id,
            tags: ['技術調査', 'ライブラリ'],
            deadline: this.getDeadline(5),
          });
        }
        break;

      case 'WBS管理機能':
        if (node.progress < 90) {
          subtasks.push({
            task: 'ガントチャートのドラッグ&ドロップ機能実装',
            type: 'output',
            priority: 3,
            estimatedHours: 6,
            category: '機能開発',
            reason: 'ユーザビリティ向上のため',
            relatedWBSNode: node.id,
            tags: ['フロントエンド', '機能開発'],
            deadline: this.getDeadline(7),
          });
        }
        break;

      case 'AI機能統合':
        if (node.progress < 20) {
          subtasks.push({
            task: 'Claude APIの認証とエラーハンドリング実装',
            type: 'output',
            priority: 5,
            estimatedHours: 4,
            category: 'API統合',
            reason: 'AI機能の基盤構築',
            relatedWBSNode: node.id,
            tags: ['API', 'AI', 'セキュリティ'],
            deadline: this.getDeadline(3),
          });
        }
        break;
    }

    return subtasks;
  }

  /**
   * フェーズに基づくタスクを生成
   */
  private generatePhaseBasedTasks(phase: WBSNode): SiteDevTaskSuggestion[] {
    const tasks: SiteDevTaskSuggestion[] = [];

    switch (phase.id) {
      case 'phase-3':
        tasks.push({
          task: 'フェーズ3の週次進捗レポート作成',
          type: 'output',
          priority: 3,
          estimatedHours: 1,
          category: 'プロジェクト管理',
          reason: '定期的な進捗確認と課題の早期発見',
          tags: ['レポート', 'プロジェクト管理'],
          deadline: this.getDeadline(7),
        });
        break;

      case 'phase-4':
        if (phase.status === 'not-started') {
          tasks.push({
            task: 'フェーズ4のキックオフミーティング準備',
            type: 'output',
            priority: 4,
            estimatedHours: 2,
            category: 'プロジェクト管理',
            reason: '次フェーズの円滑な開始のため',
            tags: ['ミーティング', '計画'],
            deadline: this.getDeadline(14),
          });
        }
        break;
    }

    return tasks;
  }

  /**
   * デフォルトの提案
   */
  private getDefaultSuggestions(): SiteDevTaskSuggestion[] {
    return [
      {
        task: 'コードレビューの実施',
        type: 'output',
        priority: 4,
        estimatedHours: 2,
        category: '品質管理',
        reason: '定期的なコード品質チェック',
        tags: ['レビュー', '品質'],
        deadline: this.getDeadline(3),
      },
      {
        task: 'TypeScriptの型定義を強化',
        type: 'output',
        priority: 3,
        estimatedHours: 3,
        category: 'リファクタリング',
        reason: '型安全性の向上',
        tags: ['TypeScript', 'リファクタリング'],
        deadline: this.getDeadline(7),
      },
      {
        task: 'パフォーマンステストの実施',
        type: 'input',
        priority: 3,
        estimatedHours: 2,
        category: 'テスト',
        reason: 'ユーザー体験の最適化',
        tags: ['テスト', 'パフォーマンス'],
        deadline: this.getDeadline(5),
      },
    ];
  }

  /**
   * 全体進捗を計算
   */
  private calculateOverallProgress(nodes: WBSNode[]): number {
    const phases = nodes.filter((n) => n.level === 0);
    if (phases.length === 0) return 0;

    const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
    return Math.round(totalProgress / phases.length);
  }

  /**
   * 期限を計算
   */
  private getDeadline(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  /**
   * AIレスポンスをパース
   */
  private parseAIResponse(response: string): SiteDevTaskSuggestion[] {
    try {
      const data = JSON.parse(response);
      return data.suggestions || [];
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getDefaultSuggestions();
    }
  }
}

export default new SiteDevAIService();
