import { TodoItem } from '@/types';
import { AIServiceError, RateLimitError, QuotaExceededError, NetworkError } from './taskAIService';
import { getEnv } from '@/utils/env';

// WBS関連の型定義
export interface WBSNode {
  id: string;
  title: string;
  description: string;
  level: number;
  parentId?: string;
  children: WBSNode[];
  estimatedHours: number;
  priority: 1 | 2 | 3 | 4 | 5;
  assignee?: string;
  dependencies: string[];
  deliverables: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  startDate?: string;
  endDate?: string;
  tags: string[];
}

export interface WBSProject {
  id: string;
  name: string;
  description: string;
  goal: string;
  scope: string;
  timeline: string;
  createdAt: string;
  updatedAt: string;
  rootNode: WBSNode;
  totalEstimatedHours: number;
  confidence: number;
  methodology: 'waterfall' | 'agile' | 'hybrid';
}

export interface WBSGenerationRequest {
  projectName: string;
  projectGoal: string;
  projectScope?: string;
  timeline?: string;
  methodology?: 'waterfall' | 'agile' | 'hybrid';
  teamSize?: number;
  budget?: number;
  constraints?: string[];
}

export interface WBSGenerationResult {
  project: WBSProject;
  tasks: TodoItem[];
  recommendations: string[];
  riskFactors: string[];
}

class WBSService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor() {
    try {
      this.apiKey = getEnv('VITE_CLAUDE_API_KEY') || getEnv('VITE_OPENAI_API_KEY');
    } catch {
      this.apiKey = null;
    }
  }

  // メインのWBS生成機能
  async generateWBS(request: WBSGenerationRequest): Promise<WBSGenerationResult> {
    try {
      // プロジェクトの複雑度を評価
      const complexity = this.assessProjectComplexity(request);

      // AI APIを使ってWBSを生成（フォールバック付き）
      const wbsStructure = await this.generateWBSStructure(request, complexity);

      // WBSからタスクリストを生成
      const tasks = this.convertWBSToTasks(wbsStructure);

      // 推奨事項とリスク要因を生成
      const recommendations = this.generateRecommendations(wbsStructure, complexity);
      const riskFactors = this.identifyRiskFactors(wbsStructure, request);

      return {
        project: wbsStructure,
        tasks,
        recommendations,
        riskFactors,
      };
    } catch (error) {
      console.error('WBS generation failed:', error);

      if (error instanceof AIServiceError) {
        throw error;
      }

      throw new AIServiceError(
        `WBS生成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'WBS_GENERATION_FAILED',
        true
      );
    }
  }

  // プロジェクトの複雑度評価
  private assessProjectComplexity(request: WBSGenerationRequest): {
    score: number;
    factors: string[];
  } {
    let score = 0;
    const factors: string[] = [];

    // プロジェクト名の複雑度
    if (request.projectName.length > 50) {
      score += 2;
      factors.push('複雑なプロジェクト名');
    }

    // 目標の複雑度
    const goalWords = request.projectGoal.split(' ').length;
    if (goalWords > 20) {
      score += 3;
      factors.push('複雑な目標設定');
    }

    // 技術的キーワードの検出
    const techKeywords = [
      'システム',
      'アプリケーション',
      'API',
      'データベース',
      'AI',
      'ML',
      'クラウド',
      'インフラ',
      'セキュリティ',
      'パフォーマンス',
    ];
    const techCount = techKeywords.filter(
      (keyword) =>
        request.projectGoal.toLowerCase().includes(keyword.toLowerCase()) ||
        request.projectName.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    score += techCount * 2;
    if (techCount > 0) factors.push('技術的複雑性');

    // チームサイズの影響
    if (request.teamSize && request.teamSize > 5) {
      score += 2;
      factors.push('大規模チーム');
    }

    // 制約条件の複雑度
    if (request.constraints && request.constraints.length > 3) {
      score += 3;
      factors.push('多数の制約条件');
    }

    return { score, factors };
  }

  // AI APIを使ったWBS構造生成
  private async generateWBSStructure(
    request: WBSGenerationRequest,
    complexity: { score: number; factors: string[] }
  ): Promise<WBSProject> {
    if (!this.apiKey) {
      console.warn('No AI API key configured, using template-based WBS generation');
      return this.generateTemplateBasedWBS(request, complexity);
    }

    try {
      const prompt = this.createWBSPrompt(request, complexity);
      const response = await this.callAI(prompt);
      return this.parseWBSResponse(response, request);
    } catch (error) {
      console.warn('AI WBS generation failed, falling back to template:', error);
      return this.generateTemplateBasedWBS(request, complexity);
    }
  }

  // テンプレートベースのWBS生成（フォールバック）
  private generateTemplateBasedWBS(
    request: WBSGenerationRequest,
    complexity: { score: number; factors: string[] }
  ): WBSProject {
    const projectId = `wbs-${Date.now()}`;
    const now = new Date().toISOString();

    // プロジェクトタイプを判定
    const projectType = this.detectProjectType(request);

    // テンプレートに基づいてWBS構造を生成
    const rootNode = this.generateWBSTemplate(projectId, request, projectType);

    return {
      id: projectId,
      name: request.projectName,
      description: `${request.projectGoal}を達成するためのプロジェクト`,
      goal: request.projectGoal,
      scope: request.projectScope || '詳細なスコープは要定義',
      timeline: request.timeline || '要スケジュール調整',
      createdAt: now,
      updatedAt: now,
      rootNode,
      totalEstimatedHours: this.calculateTotalHours(rootNode),
      confidence: Math.max(0.6, 0.9 - complexity.score * 0.05),
      methodology: request.methodology || 'hybrid',
    };
  }

  // プロジェクトタイプの検出
  private detectProjectType(request: WBSGenerationRequest): string {
    const { projectName, projectGoal } = request;
    const text = `${projectName} ${projectGoal}`.toLowerCase();

    if (text.includes('アプリ') || text.includes('システム') || text.includes('開発')) {
      return 'software_development';
    } else if (text.includes('ウェブサイト') || text.includes('サイト') || text.includes('web')) {
      return 'web_development';
    } else if (
      text.includes('マーケティング') ||
      text.includes('広告') ||
      text.includes('プロモーション')
    ) {
      return 'marketing';
    } else if (text.includes('研究') || text.includes('調査') || text.includes('分析')) {
      return 'research';
    } else if (text.includes('イベント') || text.includes('セミナー') || text.includes('会議')) {
      return 'event';
    }

    return 'general';
  }

  // テンプレートベースのWBS構造生成
  private generateWBSTemplate(
    projectId: string,
    request: WBSGenerationRequest,
    projectType: string
  ): WBSNode {
    const templates = {
      software_development: this.getSoftwareDevelopmentTemplate,
      web_development: this.getWebDevelopmentTemplate,
      marketing: this.getMarketingTemplate,
      research: this.getResearchTemplate,
      event: this.getEventTemplate,
      general: this.getGeneralTemplate,
    };

    const templateGenerator = templates[projectType as keyof typeof templates] || templates.general;
    return templateGenerator.call(this, projectId, request);
  }

  // ソフトウェア開発テンプレート
  private getSoftwareDevelopmentTemplate(
    projectId: string,
    request: WBSGenerationRequest
  ): WBSNode {
    return {
      id: `${projectId}-root`,
      title: request.projectName,
      description: request.projectGoal,
      level: 0,
      children: [
        {
          id: `${projectId}-planning`,
          title: 'プロジェクト計画',
          description: 'プロジェクトの基本計画と準備',
          level: 1,
          parentId: `${projectId}-root`,
          children: [
            {
              id: `${projectId}-planning-requirements`,
              title: '要件定義',
              description: '機能要件と非機能要件の定義',
              level: 2,
              parentId: `${projectId}-planning`,
              children: [],
              estimatedHours: 40,
              priority: 1,
              dependencies: [],
              deliverables: ['要件定義書', '機能仕様書'],
              status: 'not_started',
              tags: ['要件', '仕様'],
            },
            {
              id: `${projectId}-planning-architecture`,
              title: 'アーキテクチャ設計',
              description: 'システム全体の設計とアーキテクチャ定義',
              level: 2,
              parentId: `${projectId}-planning`,
              children: [],
              estimatedHours: 32,
              priority: 1,
              dependencies: [`${projectId}-planning-requirements`],
              deliverables: ['アーキテクチャ設計書', 'ER図'],
              status: 'not_started',
              tags: ['設計', 'アーキテクチャ'],
            },
          ],
          estimatedHours: 72,
          priority: 1,
          dependencies: [],
          deliverables: ['プロジェクト計画書'],
          status: 'not_started',
          tags: ['計画'],
        },
        {
          id: `${projectId}-development`,
          title: '開発フェーズ',
          description: 'システムの実装と開発',
          level: 1,
          parentId: `${projectId}-root`,
          children: [
            {
              id: `${projectId}-development-backend`,
              title: 'バックエンド開発',
              description: 'サーバーサイドの実装',
              level: 2,
              parentId: `${projectId}-development`,
              children: [],
              estimatedHours: 80,
              priority: 2,
              dependencies: [`${projectId}-planning-architecture`],
              deliverables: ['API実装', 'データベース構築'],
              status: 'not_started',
              tags: ['開発', 'バックエンド'],
            },
            {
              id: `${projectId}-development-frontend`,
              title: 'フロントエンド開発',
              description: 'ユーザーインターフェースの実装',
              level: 2,
              parentId: `${projectId}-development`,
              children: [],
              estimatedHours: 60,
              priority: 2,
              dependencies: [`${projectId}-development-backend`],
              deliverables: ['UI実装', 'UX改善'],
              status: 'not_started',
              tags: ['開発', 'フロントエンド'],
            },
          ],
          estimatedHours: 140,
          priority: 2,
          dependencies: [`${projectId}-planning`],
          deliverables: ['動作するシステム'],
          status: 'not_started',
          tags: ['開発'],
        },
        {
          id: `${projectId}-testing`,
          title: 'テストフェーズ',
          description: 'システムのテストと品質保証',
          level: 1,
          parentId: `${projectId}-root`,
          children: [
            {
              id: `${projectId}-testing-unit`,
              title: '単体テスト',
              description: '個別機能のテスト',
              level: 2,
              parentId: `${projectId}-testing`,
              children: [],
              estimatedHours: 32,
              priority: 3,
              dependencies: [`${projectId}-development`],
              deliverables: ['テストケース', 'テスト結果'],
              status: 'not_started',
              tags: ['テスト', '単体'],
            },
            {
              id: `${projectId}-testing-integration`,
              title: '結合テスト',
              description: 'システム全体の結合テスト',
              level: 2,
              parentId: `${projectId}-testing`,
              children: [],
              estimatedHours: 24,
              priority: 3,
              dependencies: [`${projectId}-testing-unit`],
              deliverables: ['結合テスト結果'],
              status: 'not_started',
              tags: ['テスト', '結合'],
            },
          ],
          estimatedHours: 56,
          priority: 3,
          dependencies: [`${projectId}-development`],
          deliverables: ['テスト完了報告書'],
          status: 'not_started',
          tags: ['テスト'],
        },
        {
          id: `${projectId}-deployment`,
          title: 'デプロイメント',
          description: 'システムの本番環境への展開',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 16,
          priority: 4,
          dependencies: [`${projectId}-testing`],
          deliverables: ['本番環境', 'デプロイ手順書'],
          status: 'not_started',
          tags: ['デプロイ'],
        },
      ],
      estimatedHours: 284,
      priority: 1,
      dependencies: [],
      deliverables: ['完成したシステム'],
      status: 'not_started',
      tags: ['プロジェクト'],
    };
  }

  // その他のテンプレート（簡略版）
  private getWebDevelopmentTemplate(projectId: string, request: WBSGenerationRequest): WBSNode {
    return {
      id: `${projectId}-root`,
      title: request.projectName,
      description: request.projectGoal,
      level: 0,
      children: [
        {
          id: `${projectId}-design`,
          title: 'デザインフェーズ',
          description: 'ウェブサイトのデザインと設計',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 40,
          priority: 1,
          dependencies: [],
          deliverables: ['デザインモックアップ', 'ワイヤーフレーム'],
          status: 'not_started',
          tags: ['デザイン'],
        },
        {
          id: `${projectId}-development`,
          title: 'ウェブ開発',
          description: 'ウェブサイトの実装',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 80,
          priority: 2,
          dependencies: [`${projectId}-design`],
          deliverables: ['ウェブサイト'],
          status: 'not_started',
          tags: ['開発'],
        },
        {
          id: `${projectId}-testing`,
          title: 'テストと最適化',
          description: 'ウェブサイトのテストと最適化',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 24,
          priority: 3,
          dependencies: [`${projectId}-development`],
          deliverables: ['テスト結果', '最適化レポート'],
          status: 'not_started',
          tags: ['テスト'],
        },
      ],
      estimatedHours: 144,
      priority: 1,
      dependencies: [],
      deliverables: ['完成したウェブサイト'],
      status: 'not_started',
      tags: ['ウェブ開発'],
    };
  }

  private getMarketingTemplate(projectId: string, request: WBSGenerationRequest): WBSNode {
    return {
      id: `${projectId}-root`,
      title: request.projectName,
      description: request.projectGoal,
      level: 0,
      children: [
        {
          id: `${projectId}-research`,
          title: '市場調査',
          description: 'ターゲット市場の分析',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 32,
          priority: 1,
          dependencies: [],
          deliverables: ['市場調査レポート'],
          status: 'not_started',
          tags: ['調査'],
        },
        {
          id: `${projectId}-strategy`,
          title: '戦略策定',
          description: 'マーケティング戦略の策定',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 24,
          priority: 2,
          dependencies: [`${projectId}-research`],
          deliverables: ['マーケティング戦略書'],
          status: 'not_started',
          tags: ['戦略'],
        },
      ],
      estimatedHours: 56,
      priority: 1,
      dependencies: [],
      deliverables: ['マーケティングプラン'],
      status: 'not_started',
      tags: ['マーケティング'],
    };
  }

  private getResearchTemplate(projectId: string, request: WBSGenerationRequest): WBSNode {
    return {
      id: `${projectId}-root`,
      title: request.projectName,
      description: request.projectGoal,
      level: 0,
      children: [
        {
          id: `${projectId}-literature`,
          title: '文献調査',
          description: '関連文献の調査と分析',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 40,
          priority: 1,
          dependencies: [],
          deliverables: ['文献調査レポート'],
          status: 'not_started',
          tags: ['調査'],
        },
        {
          id: `${projectId}-analysis`,
          title: 'データ分析',
          description: '収集データの分析',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 60,
          priority: 2,
          dependencies: [`${projectId}-literature`],
          deliverables: ['分析結果'],
          status: 'not_started',
          tags: ['分析'],
        },
      ],
      estimatedHours: 100,
      priority: 1,
      dependencies: [],
      deliverables: ['研究成果'],
      status: 'not_started',
      tags: ['研究'],
    };
  }

  private getEventTemplate(projectId: string, request: WBSGenerationRequest): WBSNode {
    return {
      id: `${projectId}-root`,
      title: request.projectName,
      description: request.projectGoal,
      level: 0,
      children: [
        {
          id: `${projectId}-planning`,
          title: 'イベント企画',
          description: 'イベントの企画と準備',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 32,
          priority: 1,
          dependencies: [],
          deliverables: ['イベント企画書'],
          status: 'not_started',
          tags: ['企画'],
        },
        {
          id: `${projectId}-execution`,
          title: 'イベント実行',
          description: 'イベントの実施',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 16,
          priority: 2,
          dependencies: [`${projectId}-planning`],
          deliverables: ['実施されたイベント'],
          status: 'not_started',
          tags: ['実行'],
        },
      ],
      estimatedHours: 48,
      priority: 1,
      dependencies: [],
      deliverables: ['成功したイベント'],
      status: 'not_started',
      tags: ['イベント'],
    };
  }

  private getGeneralTemplate(projectId: string, request: WBSGenerationRequest): WBSNode {
    return {
      id: `${projectId}-root`,
      title: request.projectName,
      description: request.projectGoal,
      level: 0,
      children: [
        {
          id: `${projectId}-planning`,
          title: '計画フェーズ',
          description: 'プロジェクトの計画と準備',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 24,
          priority: 1,
          dependencies: [],
          deliverables: ['プロジェクト計画書'],
          status: 'not_started',
          tags: ['計画'],
        },
        {
          id: `${projectId}-execution`,
          title: '実行フェーズ',
          description: 'プロジェクトの実行',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 40,
          priority: 2,
          dependencies: [`${projectId}-planning`],
          deliverables: ['プロジェクト成果物'],
          status: 'not_started',
          tags: ['実行'],
        },
        {
          id: `${projectId}-review`,
          title: 'レビューフェーズ',
          description: 'プロジェクトの振り返りと評価',
          level: 1,
          parentId: `${projectId}-root`,
          children: [],
          estimatedHours: 8,
          priority: 3,
          dependencies: [`${projectId}-execution`],
          deliverables: ['プロジェクト評価書'],
          status: 'not_started',
          tags: ['レビュー'],
        },
      ],
      estimatedHours: 72,
      priority: 1,
      dependencies: [],
      deliverables: ['完成したプロジェクト'],
      status: 'not_started',
      tags: ['プロジェクト'],
    };
  }

  // WBSからタスクリストへの変換
  private convertWBSToTasks(project: WBSProject): TodoItem[] {
    const tasks: TodoItem[] = [];

    const convertNode = (node: WBSNode, parentTitle = ''): void => {
      // リーフノード（子がないノード）のみタスクとして変換
      if (node.children.length === 0) {
        tasks.push({
          _id: `task-${node.id}`,
          task: node.title,
          completed: node.status === 'completed',
          priority: node.priority,
          isPrioritized: node.priority <= 2,
          completedDate: null,
          type: 'output',
          createdAt: new Date().toISOString(),
          deadline: node.endDate,
          note: node.description,
          tags: node.tags,
          estimatedDuration: node.estimatedHours * 60, // 時間を分に変換
        });
      }

      // 子ノードを再帰的に処理
      node.children.forEach((child) => convertNode(child, node.title));
    };

    convertNode(project.rootNode);
    return tasks;
  }

  // 総工数計算
  private calculateTotalHours(node: WBSNode): number {
    let total = node.estimatedHours;
    node.children.forEach((child) => {
      total += this.calculateTotalHours(child);
    });
    return total;
  }

  // 推奨事項生成
  private generateRecommendations(
    project: WBSProject,
    complexity: { score: number; factors: string[] }
  ): string[] {
    const recommendations: string[] = [];

    if (complexity.score > 8) {
      recommendations.push('プロジェクトが非常に複雑です。段階的な実行を推奨します。');
    }

    if (project.totalEstimatedHours > 200) {
      recommendations.push('大規模プロジェクトです。チーム体制の強化を検討してください。');
    }

    if (project.methodology === 'agile') {
      recommendations.push('アジャイル手法を採用する場合、2週間スプリントでの進行を推奨します。');
    }

    if (recommendations.length === 0) {
      recommendations.push('WBS構造は適切です。計画に従って進行してください。');
    }

    return recommendations;
  }

  // リスク要因の特定
  private identifyRiskFactors(project: WBSProject, request: WBSGenerationRequest): string[] {
    const risks: string[] = [];

    if (project.totalEstimatedHours > 300) {
      risks.push('大規模プロジェクトによるスケジュール遅延リスク');
    }

    if (request.teamSize && request.teamSize < 3 && project.totalEstimatedHours > 100) {
      risks.push('小規模チームでの作業量過多リスク');
    }

    if (request.constraints && request.constraints.length > 5) {
      risks.push('多数の制約条件による実行困難リスク');
    }

    return risks;
  }

  // AI API呼び出し（簡略版）
  private async callAI(prompt: string): Promise<string> {
    // 実装は既存のtaskAIServiceと同様
    if (!this.apiKey) {
      throw new AIServiceError('No API key available', 'NO_API_KEY', false);
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new AIServiceError(`API Error: ${response.status}`, 'API_ERROR', true);
      }

      const data = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      throw new NetworkError(error as Error);
    }
  }

  // WBS生成用プロンプト作成
  private createWBSPrompt(
    request: WBSGenerationRequest,
    complexity: { score: number; factors: string[] }
  ): string {
    return `
プロジェクト: ${request.projectName}
目標: ${request.projectGoal}
スコープ: ${request.projectScope || '未定義'}
タイムライン: ${request.timeline || '未定義'}
手法: ${request.methodology || 'hybrid'}
チームサイズ: ${request.teamSize || '未定義'}

上記の情報から詳細なWBS（作業分解構造）を生成してください。
各作業項目には以下を含めてください：
- 作業名と説明
- 推定工数（時間単位）
- 優先度（1-5）
- 依存関係
- 成果物
- 必要なスキル/リソース

JSON形式で構造化された結果を返してください。
`;
  }

  // AI応答のパース
  private parseWBSResponse(response: string, request: WBSGenerationRequest): WBSProject {
    // 実際の実装では、AI応答をパースして適切なWBSProjectオブジェクトを生成
    // ここではフォールバックとしてテンプレートベース生成を使用
    return this.generateTemplateBasedWBS(request, { score: 5, factors: [] });
  }
}

export default new WBSService();
