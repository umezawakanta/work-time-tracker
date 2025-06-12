import { WBSNode } from '@/types/wbs';
import AdvancedAIService from './AdvancedAIService';

class WBSAIService {
  private aiService = AdvancedAIService;

  /**
   * プロジェクト全体を分析
   */
  async analyzeProject(nodes: WBSNode[], selectedNode?: WBSNode | null) {
    const healthScore = this.calculateHealthScore(nodes);
    const risks = await this.identifyRisks(nodes);
    const optimizations = await this.suggestOptimizations(nodes);
    const predictions = await this.predictCompletion(nodes);
    const keyFindings = await this.generateKeyFindings(nodes);
    const recommendations = await this.generateRecommendations(nodes, risks);

    return {
      healthScore,
      confidenceLevel: this.calculateConfidence(nodes),
      keyFindings,
      risks,
      optimizations,
      predictions,
      recommendations,
      selectedNodeAnalysis: selectedNode ? await this.analyzeNode(selectedNode) : null,
    };
  }

  /**
   * 個別ノードを分析
   */
  async analyzeNode(node: WBSNode) {
    // Local analysis since AdvancedAIService doesn't have generateContent
    const analysis = this.performLocalNodeAnalysis(node);
    return this.parseNodeAnalysis(analysis);
  }

  private performLocalNodeAnalysis(node: WBSNode): string {
    const progressVsTime = this.calculateProgressVsTimeRatio(node);
    const riskLevel = node.risks.length > 0 ? 'リスクあり' : 'リスクなし';
    const efficiency =
      node.actualHours > 0 ? ((node.estimatedHours / node.actualHours) * 100).toFixed(1) : '未測定';

    return `
      進捗評価: ${progressVsTime > 0.8 ? '順調' : '要注意'}
      リスク状況: ${riskLevel}
      効率性: ${efficiency}%
      推奨アクション: ${node.progress < 50 ? '進捗の加速が必要' : '現状維持'}
    `;
  }

  private calculateProgressVsTimeRatio(node: WBSNode): number {
    const today = new Date();
    const start = new Date(node.startDate);
    const end = new Date(node.endDate);
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    const timeProgress = (elapsed / totalDuration) * 100;
    return node.progress / timeProgress;
  }

  /**
   * プロジェクトの健全性スコアを計算
   */
  private calculateHealthScore(nodes: WBSNode[]): number {
    const factors = {
      progressConsistency: this.checkProgressConsistency(nodes),
      scheduleAdherence: this.checkScheduleAdherence(nodes),
      resourceUtilization: this.checkResourceUtilization(nodes),
      riskLevel: this.assessOverallRisk(nodes),
    };

    const weights = {
      progressConsistency: 0.3,
      scheduleAdherence: 0.3,
      resourceUtilization: 0.2,
      riskLevel: 0.2,
    };

    const score = Object.entries(factors).reduce(
      (total, [key, value]) => total + value * weights[key as keyof typeof weights],
      0
    );

    return Math.round(score);
  }

  /**
   * リスクを識別
   */
  private async identifyRisks(nodes: WBSNode[]) {
    const risks = [];

    // 遅延リスク
    const delayedNodes = nodes.filter((n) => {
      if (n.status === 'completed' || !n.endDate) return false;
      return new Date(n.endDate) < new Date() && n.progress < 100;
    });

    if (delayedNodes.length > 0) {
      risks.push({
        title: '遅延タスクの存在',
        description: `${delayedNodes.length}個のタスクが予定より遅れています`,
        severity: 'high',
        affectedNodes: delayedNodes.map((n) => n.id),
        mitigation: '遅延タスクの優先順位を上げ、リソースを集中的に投入することを推奨します',
      });
    }

    // 依存関係リスク
    const criticalPath = this.findCriticalPath(nodes);
    if (criticalPath.some((n) => n.progress < 50)) {
      risks.push({
        title: 'クリティカルパスの遅延リスク',
        description: 'プロジェクト全体の完了に影響する重要なタスクに遅れが見られます',
        severity: 'high',
        mitigation: 'クリティカルパス上のタスクに追加リソースを割り当ててください',
      });
    }

    // リソースリスク
    const overloadedResources = this.findOverloadedResources(nodes);
    if (overloadedResources.length > 0) {
      risks.push({
        title: 'リソースの過負荷',
        description: '一部のリソースに作業が集中しています',
        severity: 'medium',
        mitigation: 'タスクの再割り当てやスケジュール調整を検討してください',
      });
    }

    return risks;
  }

  /**
   * 最適化提案を生成
   */
  private async suggestOptimizations(nodes: WBSNode[]) {
    const optimizations = [];

    // 並列化可能なタスクを検出
    const parallelizableTasks = this.findParallelizableTasks(nodes);
    if (parallelizableTasks.length > 0) {
      optimizations.push({
        title: 'タスクの並列実行',
        description: `${parallelizableTasks.length}個のタスクを並列実行することで期間を短縮できます`,
        impact: '期間20%短縮',
        nodeIds: parallelizableTasks.map((t) => t.id),
      });
    }

    // バッファの最適化
    const bufferOptimization = this.analyzeBuffers(nodes);
    if (bufferOptimization) {
      optimizations.push(bufferOptimization);
    }

    // リソース平準化
    const levelingOpportunity = this.findResourceLevelingOpportunity(nodes);
    if (levelingOpportunity) {
      optimizations.push(levelingOpportunity);
    }

    return optimizations;
  }

  /**
   * 完了予測を生成
   */
  private async predictCompletion(nodes: WBSNode[]) {
    const currentProgress = this.calculateOverallProgress(nodes);
    const velocity = this.calculateVelocity(nodes);
    const remainingWork = this.calculateRemainingWork(nodes);

    const daysToComplete = Math.ceil(remainingWork / velocity);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToComplete);

    return {
      optimistic: new Date(
        completionDate.getTime() - daysToComplete * 0.2 * 24 * 60 * 60 * 1000
      ).toLocaleDateString('ja-JP'),
      realistic: completionDate.toLocaleDateString('ja-JP'),
      pessimistic: new Date(
        completionDate.getTime() + daysToComplete * 0.3 * 24 * 60 * 60 * 1000
      ).toLocaleDateString('ja-JP'),
      confidence: this.calculatePredictionConfidence(nodes),
    };
  }

  // ヘルパーメソッド
  private checkProgressConsistency(nodes: WBSNode[]): number {
    // 親タスクと子タスクの進捗の整合性をチェック
    let consistencyScore = 100;

    nodes.forEach((parent) => {
      const children = nodes.filter((n) => n.parentId === parent.id);
      if (children.length > 0) {
        const childrenProgress = children.reduce((sum, c) => sum + c.progress, 0) / children.length;
        const diff = Math.abs(parent.progress - childrenProgress);
        consistencyScore -= diff * 0.5;
      }
    });

    return Math.max(0, consistencyScore);
  }

  private checkScheduleAdherence(nodes: WBSNode[]): number {
    const today = new Date();
    let adherenceScore = 100;

    nodes.forEach((node) => {
      if (node.status !== 'completed' && new Date(node.endDate) < today) {
        adherenceScore -= 10;
      }
    });

    return Math.max(0, adherenceScore);
  }

  private checkResourceUtilization(nodes: WBSNode[]): number {
    // 実績工数と見積工数の比較
    const totalEstimated = nodes.reduce((sum, n) => sum + n.estimatedHours, 0);
    const totalActual = nodes.reduce((sum, n) => sum + n.actualHours, 0);

    if (totalEstimated === 0) return 100;

    const utilizationRate = (totalActual / totalEstimated) * 100;
    // 80-120%の範囲を理想とする
    if (utilizationRate >= 80 && utilizationRate <= 120) {
      return 100;
    } else if (utilizationRate < 80) {
      return 100 - (80 - utilizationRate);
    } else {
      return 100 - (utilizationRate - 120) * 0.5;
    }
  }

  private assessOverallRisk(nodes: WBSNode[]): number {
    const riskFactors = nodes.reduce((sum, n) => sum + n.risks.length, 0);
    const riskScore = 100 - riskFactors * 5;
    return Math.max(0, riskScore);
  }

  private calculateConfidence(nodes: WBSNode[]): number {
    // データの完全性と履歴に基づいて信頼度を計算
    const dataCompleteness = nodes.filter((n) => n.actualHours > 0).length / nodes.length;
    const progressVariance = this.calculateProgressVariance(nodes);

    return Math.round(dataCompleteness * 70 + (100 - progressVariance) * 30);
  }

  private calculateProgressVariance(nodes: WBSNode[]): number {
    // 進捗のばらつきを計算
    const progresses = nodes.map((n) => n.progress);
    const mean = progresses.reduce((sum, p) => sum + p, 0) / progresses.length;
    const variance =
      progresses.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / progresses.length;
    return Math.sqrt(variance);
  }

  private findCriticalPath(nodes: WBSNode[]): WBSNode[] {
    // 簡易的なクリティカルパス検出
    return nodes.filter(
      (n) => n.dependencies.length > 0 || nodes.some((other) => other.dependencies.includes(n.id))
    );
  }

  private findOverloadedResources(nodes: WBSNode[]): string[] {
    // リソースの過負荷を検出
    const resourceLoad: { [key: string]: number } = {};

    nodes.forEach((node) => {
      node.assignees.forEach((assignee) => {
        resourceLoad[assignee] = (resourceLoad[assignee] || 0) + node.estimatedHours;
      });
    });

    return Object.entries(resourceLoad)
      .filter(([_, hours]) => hours > 160) // 月160時間以上
      .map(([resource]) => resource);
  }

  private findParallelizableTasks(nodes: WBSNode[]): WBSNode[] {
    // 依存関係がなく、同じレベルのタスクを検出
    return nodes.filter(
      (node) =>
        node.dependencies.length === 0 &&
        node.status === 'not-started' &&
        nodes.some(
          (other) =>
            other.id !== node.id && other.level === node.level && other.parentId === node.parentId
        )
    );
  }

  private analyzeBuffers(nodes: WBSNode[]): any {
    // バッファ分析（簡易版）
    const totalDuration = nodes.reduce((sum, n) => sum + n.duration, 0);
    const criticalPathDuration = this.findCriticalPath(nodes).reduce(
      (sum, n) => sum + n.duration,
      0
    );

    const bufferRatio = (totalDuration - criticalPathDuration) / criticalPathDuration;

    if (bufferRatio > 0.3) {
      return {
        title: 'バッファの最適化',
        description: '過剰なバッファを削減することで、プロジェクト期間を短縮できます',
        impact: '期間10%短縮',
      };
    }

    return null;
  }

  private findResourceLevelingOpportunity(nodes: WBSNode[]): any {
    // リソース平準化の機会を検出
    const overloaded = this.findOverloadedResources(nodes);
    if (overloaded.length > 0) {
      return {
        title: 'リソースの平準化',
        description: '作業負荷を平準化することで、効率を向上させられます',
        impact: '生産性15%向上',
      };
    }
    return null;
  }

  private calculateOverallProgress(nodes: WBSNode[]): number {
    const leafNodes = nodes.filter((n) => !nodes.some((other) => other.parentId === n.id));
    if (leafNodes.length === 0) return 0;

    return leafNodes.reduce((sum, n) => sum + n.progress, 0) / leafNodes.length;
  }

  private calculateVelocity(nodes: WBSNode[]): number {
    // 過去の進捗から速度を計算（簡易版）
    const completedNodes = nodes.filter((n) => n.status === 'completed');
    if (completedNodes.length === 0) return 5; // デフォルト値

    const avgDuration =
      completedNodes.reduce((sum, n) => sum + n.duration, 0) / completedNodes.length;
    const avgActualHours =
      completedNodes.reduce((sum, n) => sum + n.actualHours, 0) / completedNodes.length;

    return avgDuration / avgActualHours; // タスク/日
  }

  private calculateRemainingWork(nodes: WBSNode[]): number {
    return nodes.filter((n) => n.status !== 'completed').length;
  }

  private calculatePredictionConfidence(nodes: WBSNode[]): number {
    const completedRatio = nodes.filter((n) => n.status === 'completed').length / nodes.length;
    const dataQuality = nodes.filter((n) => n.actualHours > 0).length / nodes.length;

    return Math.round(completedRatio * 60 + dataQuality * 40);
  }

  private async generateKeyFindings(nodes: WBSNode[]): Promise<string[]> {
    const findings = [];

    // 進捗状況
    const progress = this.calculateOverallProgress(nodes);
    findings.push(`プロジェクト全体の進捗は${Math.round(progress)}%です`);

    // 遅延タスク
    const delayedCount = nodes.filter((n) => n.status === 'delayed').length;
    if (delayedCount > 0) {
      findings.push(`${delayedCount}個のタスクが遅延しています`);
    }

    // 効率性
    const efficiency = this.checkResourceUtilization(nodes);
    if (efficiency > 90) {
      findings.push('リソース利用率は良好です');
    } else if (efficiency < 70) {
      findings.push('リソース利用率に改善の余地があります');
    }

    return findings;
  }

  private async generateRecommendations(nodes: WBSNode[], risks: any[]): Promise<string[]> {
    const recommendations = [];

    // 高リスクタスクへの対応
    if (risks.some((r) => r.severity === 'high')) {
      recommendations.push('高リスクタスクに対して早急な対策を実施してください');
    }

    // 進捗の加速
    const progress = this.calculateOverallProgress(nodes);
    if (progress < 50) {
      recommendations.push('重要タスクにリソースを集中させることを検討してください');
    }

    // 並列化
    const parallelizable = this.findParallelizableTasks(nodes);
    if (parallelizable.length > 2) {
      recommendations.push('複数のタスクを並列実行することで期間短縮が可能です');
    }

    return recommendations;
  }

  private parseNodeAnalysis(analysis: string): any {
    // AI応答をパースして構造化データに変換
    return {
      summary: analysis,
      progressAssessment: 'AI分析結果に基づく進捗評価',
      risks: ['AI検出リスク1', 'AI検出リスク2'],
      suggestions: ['AI提案1', 'AI提案2'],
      completionForecast: '予測完了日',
    };
  }

  /**
   * タスクを詳細分析し、具体的な作業内容と子タスクを生成
   */
  async analyzeAndBreakdownTask(node: WBSNode): Promise<{
    enhancedDescription: string;
    suggestedDeliverables: string[];
    subtasks: Array<{
      name: string;
      description: string;
      estimatedHours: number;
      deliverables: string[];
    }>;
    risks: Array<{
      description: string;
      probability: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
  }> {
    try {
      // AIサービスを使用してタスクを分解
      const breakdown = await this.aiService.breakdownTask(node.name);

      // タスクの種類に基づいて具体的な内容を生成
      const taskContext = this.analyzeTaskContext(node);

      return {
        enhancedDescription: this.generateEnhancedDescription(node, taskContext),
        suggestedDeliverables: this.generateDeliverables(node, taskContext),
        subtasks: this.generateSubtasks(node, breakdown, taskContext),
        risks: this.generateTaskRisks(node, taskContext),
      };
    } catch (error) {
      console.error('Task analysis failed:', error);
      // フォールバック処理
      return this.generateLocalTaskAnalysis(node);
    }
  }

  private analyzeTaskContext(node: WBSNode) {
    // タスク名から文脈を分析
    const keywords = {
      development: ['実装', '開発', '構築', 'コーディング'],
      design: ['デザイン', 'UI', 'UX', '設計'],
      testing: ['テスト', '検証', 'QA'],
      documentation: ['ドキュメント', '文書', '仕様書'],
      analysis: ['分析', '調査', '検討'],
    };

    let taskType = 'general';
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some((word) => node.name.includes(word))) {
        taskType = type;
        break;
      }
    }

    return { taskType, complexity: this.estimateComplexity(node) };
  }

  private generateEnhancedDescription(node: WBSNode, context: any): string {
    const templates = {
      development: `${node.name}の実装を行います。主な作業内容：
- 要件の詳細確認と技術選定
- アーキテクチャ設計とコンポーネント分割
- 実装とユニットテストの作成
- コードレビューとリファクタリング
- 統合テストと動作確認`,
      design: `${node.name}のデザイン作業を行います。主な作業内容：
- ユーザーリサーチとペルソナ定義
- ワイヤーフレームの作成
- ビジュアルデザインの制作
- プロトタイプの作成と検証
- デザインシステムへの反映`,
      testing: `${node.name}のテスト作業を行います。主な作業内容：
- テスト計画の策定
- テストケースの作成
- 手動テストの実施
- 自動テストの実装
- バグレポートの作成と追跡`,
      general: `${node.name}を実施します。${node.description || '詳細な作業内容を定義し、計画的に進めます。'}`,
    };

    return templates[context.taskType as keyof typeof templates] || templates.general;
  }

  private generateDeliverables(node: WBSNode, context: any): string[] {
    const deliverableTemplates = {
      development: ['実装済みソースコード', 'ユニットテスト', 'API仕様書', 'デプロイメント手順書'],
      design: ['デザインファイル（Figma/XD）', 'スタイルガイド', 'アイコンセット', 'プロトタイプ'],
      testing: ['テスト計画書', 'テストケース一覧', 'テスト結果レポート', 'バグ一覧'],
      general: ['作業完了報告書', '成果物一式'],
    };

    return (
      deliverableTemplates[context.taskType as keyof typeof deliverableTemplates] ||
      deliverableTemplates.general
    );
  }

  private generateSubtasks(node: WBSNode, breakdown: any, context: any): any[] {
    const subtaskTemplates = {
      development: [
        {
          name: '要件定義と設計',
          description: '機能要件の詳細化と技術設計',
          estimatedHours: Math.round(node.estimatedHours * 0.2),
          deliverables: ['設計書', '技術選定資料'],
        },
        {
          name: '実装',
          description: 'コーディングとユニットテスト作成',
          estimatedHours: Math.round(node.estimatedHours * 0.5),
          deliverables: ['ソースコード', 'テストコード'],
        },
        {
          name: 'テストと修正',
          description: '動作確認とバグ修正',
          estimatedHours: Math.round(node.estimatedHours * 0.2),
          deliverables: ['テスト結果', '修正済みコード'],
        },
        {
          name: 'ドキュメント作成',
          description: '技術文書と使用方法の記載',
          estimatedHours: Math.round(node.estimatedHours * 0.1),
          deliverables: ['技術文書', 'README'],
        },
      ],
      design: [
        {
          name: 'リサーチと分析',
          description: 'ユーザーニーズと競合分析',
          estimatedHours: Math.round(node.estimatedHours * 0.3),
          deliverables: ['リサーチ結果', 'ペルソナ'],
        },
        {
          name: 'デザイン制作',
          description: 'UIデザインとビジュアル制作',
          estimatedHours: Math.round(node.estimatedHours * 0.5),
          deliverables: ['デザインファイル', 'アセット'],
        },
        {
          name: 'レビューと修正',
          description: 'フィードバック反映と最終調整',
          estimatedHours: Math.round(node.estimatedHours * 0.2),
          deliverables: ['最終デザイン', '納品物'],
        },
      ],
    };

    const templates = subtaskTemplates[context.taskType as keyof typeof subtaskTemplates];
    if (templates) {
      return templates;
    }

    // 汎用的なサブタスク生成
    return [
      {
        name: '計画と準備',
        description: '作業計画の策定と必要な準備',
        estimatedHours: Math.round(node.estimatedHours * 0.2),
        deliverables: ['作業計画書'],
      },
      {
        name: 'メイン作業',
        description: node.name + 'の主要作業',
        estimatedHours: Math.round(node.estimatedHours * 0.6),
        deliverables: ['成果物'],
      },
      {
        name: '確認と完了',
        description: '品質確認と完了処理',
        estimatedHours: Math.round(node.estimatedHours * 0.2),
        deliverables: ['完了報告書'],
      },
    ];
  }

  private generateTaskRisks(node: WBSNode, context: any): any[] {
    const commonRisks = [
      {
        description: 'スケジュール遅延のリスク',
        probability: 'medium' as const,
        impact: 'medium' as const,
        mitigation: 'マイルストーンを設定し、進捗を定期的に確認',
      },
    ];

    const contextRisks = {
      development: [
        {
          description: '技術的な実現性の問題',
          probability: 'low' as const,
          impact: 'high' as const,
          mitigation: '早期にプロトタイプを作成し、技術検証を実施',
        },
      ],
      design: [
        {
          description: 'ステークホルダーの合意形成が困難',
          probability: 'medium' as const,
          impact: 'medium' as const,
          mitigation: '定期的なレビュー会を設定し、早期にフィードバックを収集',
        },
      ],
    };

    // Explicitly type the risks array
    const risks: Array<{
      description: string;
      probability: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }> = [...commonRisks];

    if (contextRisks[context.taskType as keyof typeof contextRisks]) {
      risks.push(...contextRisks[context.taskType as keyof typeof contextRisks]);
    }

    return risks;
  }

  private generateLocalTaskAnalysis(node: WBSNode) {
    // ローカルフォールバック
    return {
      enhancedDescription: `${node.name}を実施します。\n\n主な作業：\n- 詳細計画の策定\n- 実行と進捗管理\n- 品質確認と完了処理`,
      suggestedDeliverables: ['成果物', '完了報告書'],
      subtasks: [
        {
          name: '準備フェーズ',
          description: '作業の準備と計画',
          estimatedHours: Math.round(node.estimatedHours * 0.3),
          deliverables: ['計画書'],
        },
        {
          name: '実行フェーズ',
          description: 'メイン作業の実施',
          estimatedHours: Math.round(node.estimatedHours * 0.7),
          deliverables: ['成果物'],
        },
      ],
      risks: [
        {
          description: '想定外の作業が発生する可能性',
          probability: 'medium' as const,
          impact: 'low' as const,
          mitigation: 'バッファを確保し、柔軟に対応',
        },
      ],
    };
  }

  private estimateComplexity(node: WBSNode): 'low' | 'medium' | 'high' {
    if (node.estimatedHours > 40) return 'high';
    if (node.estimatedHours > 16) return 'medium';
    return 'low';
  }

  /**
   * プロジェクトのWBS構造を生成
   */
  async generateWBS(prompt: string): Promise<WBSNode[]> {
    try {
      // AIサービスを使用してWBS構造を生成
      const response = await this.aiService.generateResponse(prompt);
      return this.parseWBSResponse(response);
    } catch (error) {
      console.error('WBS generation failed:', error);
      // フォールバック: 基本的なWBS構造を生成
      return this.generateBasicWBS(prompt);
    }
  }

  private parseWBSResponse(response: string): WBSNode[] {
    // AI応答からWBS構造を抽出（簡易実装）
    const lines = response.split('\n').filter((line) => line.trim());
    const nodes: WBSNode[] = [];
    let nodeId = 1;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed && (trimmed.includes('-') || trimmed.includes('•'))) {
        const level = this.calculateLevel(line);
        const name = trimmed.replace(/^[-•\s]+/, '').replace(/（.*）$/, '');
        const estimatedHours = this.extractHours(trimmed) || 8;

        nodes.push({
          id: `wbs-${nodeId++}`,
          projectId: 'generated-project',
          name: name,
          description: '',
          level: level,
          orderIndex: index,
          parentId: this.findParentId(nodes, level),
          estimatedHours: estimatedHours,
          actualHours: 0,
          budget: estimatedHours * 50,
          actualCost: 0,
          progress: 0,
          status: 'not-started',
          assignees: [],
          dependencies: [],
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + estimatedHours * 60 * 60 * 1000).toISOString(),
          duration: estimatedHours / 8,
          risks: [],
          deliverables: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'ai-generator',
        });
      }
    });

    return nodes;
  }

  private generateBasicWBS(prompt: string): WBSNode[] {
    // プロンプトからプロジェクト名を抽出
    const projectName = prompt.match(/プロジェクト名:\s*(.+)/)?.[1] || 'プロジェクト';

    const now = new Date().toISOString();

    return [
      {
        id: 'wbs-1',
        projectId: 'generated-project',
        name: `${projectName} - 企画・設計`,
        description: 'プロジェクトの企画と基本設計',
        level: 1,
        orderIndex: 0,
        parentId: null,
        estimatedHours: 40,
        actualHours: 0,
        budget: 2000,
        actualCost: 0,
        progress: 0,
        status: 'not-started',
        assignees: [],
        dependencies: [],
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 5,
        risks: [],
        deliverables: [],
        createdAt: now,
        updatedAt: now,
        createdBy: 'ai-generator',
      },
      {
        id: 'wbs-2',
        projectId: 'generated-project',
        name: `${projectName} - 実装`,
        description: 'システムの実装・開発',
        level: 1,
        orderIndex: 1,
        parentId: null,
        estimatedHours: 80,
        actualHours: 0,
        budget: 4000,
        actualCost: 0,
        progress: 0,
        status: 'not-started',
        assignees: [],
        dependencies: ['wbs-1'],
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 10,
        risks: [],
        deliverables: [],
        createdAt: now,
        updatedAt: now,
        createdBy: 'ai-generator',
      },
      {
        id: 'wbs-3',
        projectId: 'generated-project',
        name: `${projectName} - テスト・リリース`,
        description: 'テスト実施とリリース作業',
        level: 1,
        orderIndex: 2,
        parentId: null,
        estimatedHours: 32,
        actualHours: 0,
        budget: 1600,
        actualCost: 0,
        progress: 0,
        status: 'not-started',
        assignees: [],
        dependencies: ['wbs-2'],
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 4,
        risks: [],
        deliverables: [],
        createdAt: now,
        updatedAt: now,
        createdBy: 'ai-generator',
      },
    ];
  }

  private calculateLevel(line: string): number {
    const leadingSpaces = line.length - line.trimStart().length;
    return Math.floor(leadingSpaces / 2) + 1;
  }

  private extractHours(text: string): number | null {
    const match = text.match(/（(\d+)時間）|（(\d+)h）|（(\d+)H）/);
    return match ? parseInt(match[1] || match[2] || match[3]) : null;
  }

  private findParentId(nodes: WBSNode[], currentLevel: number): string | null {
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].level === currentLevel - 1) {
        return nodes[i].id;
      }
    }
    return null;
  }
}

export default new WBSAIService();
