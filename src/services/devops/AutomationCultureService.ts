import { toast } from '@/components/ui/use-toast';

export interface AutomationMetric {
  id: string;
  name: string;
  description: string;
  category: 'process' | 'deployment' | 'testing' | 'monitoring' | 'collaboration';
  value: number;
  target: number;
  unit: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastUpdated: string;
}

export interface AutomationInitiative {
  id: string;
  title: string;
  description: string;
  category: 'workflow' | 'ci_cd' | 'monitoring' | 'documentation' | 'communication';
  status: 'planning' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  startDate: string;
  targetDate: string;
  completedDate?: string;
  automationLevel: number; // 0-100% automated
  businessImpact: 'low' | 'medium' | 'high';
  timesSaved: number; // hours per week
}

export interface CultureAssessment {
  id: string;
  timestamp: string;
  teamSize: number;
  automationAdoption: number; // 0-100%
  toolUtilization: number; // 0-100%
  processMaturity: number; // 0-100%
  collaborationScore: number; // 0-100%
  feedbackCulture: number; // 0-100%
  continuousImprovement: number; // 0-100%
  overallScore: number; // 0-100%
  recommendations: string[];
}

export interface AutomationTool {
  id: string;
  name: string;
  category:
    | 'ci_cd'
    | 'monitoring'
    | 'deployment'
    | 'testing'
    | 'communication'
    | 'project_management';
  adoptionRate: number; // 0-100%
  effectivenessScore: number; // 0-100%
  userSatisfaction: number; // 0-100%
  integrationLevel: number; // 0-100%
  lastUsed: string;
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
}

/**
 * 🤝 自動化文化浸透サービス - DevOps文化の醸成と推進
 */
class AutomationCultureService {
  private static instance: AutomationCultureService | null = null;
  private metrics: Map<string, AutomationMetric> = new Map();
  private initiatives: Map<string, AutomationInitiative> = new Map();
  private assessmentHistory: CultureAssessment[] = [];
  private tools: Map<string, AutomationTool> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeMetrics();
    this.initializeTools();
    this.initializeInitiatives();
    this.startCultureMonitoring();
    console.log('🤝 Automation Culture Service initialized');
  }

  public static getInstance(): AutomationCultureService {
    if (!AutomationCultureService.instance) {
      AutomationCultureService.instance = new AutomationCultureService();
    }
    return AutomationCultureService.instance;
  }

  /**
   * 📊 メトリクス初期化
   */
  private initializeMetrics(): void {
    const defaultMetrics: AutomationMetric[] = [
      {
        id: 'deployment_frequency',
        name: 'デプロイ頻度',
        description: '1日あたりのデプロイ回数',
        category: 'deployment',
        value: 3.2,
        target: 5.0,
        unit: '回/日',
        trend: 'increasing',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'lead_time',
        name: 'リードタイム',
        description: 'コミットからデプロイまでの時間',
        category: 'process',
        value: 25,
        target: 15,
        unit: '分',
        trend: 'decreasing',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'mttr',
        name: '平均復旧時間(MTTR)',
        description: '障害からの平均復旧時間',
        category: 'monitoring',
        value: 45,
        target: 30,
        unit: '分',
        trend: 'decreasing',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'change_failure_rate',
        name: '変更失敗率',
        description: 'デプロイ変更の失敗率',
        category: 'deployment',
        value: 8,
        target: 5,
        unit: '%',
        trend: 'decreasing',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'test_automation_coverage',
        name: 'テスト自動化カバレッジ',
        description: '自動化されたテストの割合',
        category: 'testing',
        value: 86.11,
        target: 95,
        unit: '%',
        trend: 'increasing',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'collaboration_score',
        name: 'コラボレーションスコア',
        description: 'チーム間連携の効果性',
        category: 'collaboration',
        value: 75,
        target: 90,
        unit: '%',
        trend: 'increasing',
        lastUpdated: new Date().toISOString(),
      },
    ];

    defaultMetrics.forEach((metric) => {
      this.metrics.set(metric.id, metric);
    });

    console.log('📊 Automation metrics initialized:', defaultMetrics.length);
  }

  /**
   * 🔧 ツール初期化
   */
  private initializeTools(): void {
    const defaultTools: AutomationTool[] = [
      {
        id: 'github_actions',
        name: 'GitHub Actions',
        category: 'ci_cd',
        adoptionRate: 100,
        effectivenessScore: 95,
        userSatisfaction: 90,
        integrationLevel: 95,
        lastUsed: new Date().toISOString(),
        usageFrequency: 'daily',
      },
      {
        id: 'vercel',
        name: 'Vercel',
        category: 'deployment',
        adoptionRate: 100,
        effectivenessScore: 92,
        userSatisfaction: 88,
        integrationLevel: 90,
        lastUsed: new Date().toISOString(),
        usageFrequency: 'daily',
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        category: 'testing',
        adoptionRate: 100,
        effectivenessScore: 93,
        userSatisfaction: 85,
        integrationLevel: 100,
        lastUsed: new Date().toISOString(),
        usageFrequency: 'daily',
      },
      {
        id: 'eslint',
        name: 'ESLint',
        category: 'testing',
        adoptionRate: 100,
        effectivenessScore: 88,
        userSatisfaction: 82,
        integrationLevel: 95,
        lastUsed: new Date().toISOString(),
        usageFrequency: 'daily',
      },
      {
        id: 'jest',
        name: 'Jest',
        category: 'testing',
        adoptionRate: 90,
        effectivenessScore: 85,
        userSatisfaction: 80,
        integrationLevel: 85,
        lastUsed: new Date().toISOString(),
        usageFrequency: 'daily',
      },
      {
        id: 'vite',
        name: 'Vite',
        category: 'ci_cd',
        adoptionRate: 100,
        effectivenessScore: 96,
        userSatisfaction: 92,
        integrationLevel: 98,
        lastUsed: new Date().toISOString(),
        usageFrequency: 'daily',
      },
    ];

    defaultTools.forEach((tool) => {
      this.tools.set(tool.id, tool);
    });

    console.log('🔧 Automation tools initialized:', defaultTools.length);
  }

  /**
   * 🚀 イニシアティブ初期化
   */
  private initializeInitiatives(): void {
    const defaultInitiatives: AutomationInitiative[] = [
      {
        id: 'e2e_testing_automation',
        title: 'E2Eテスト自動化',
        description: 'Playwrightを使用したE2Eテストの完全自動化',
        category: 'workflow',
        status: 'in_progress',
        priority: 'high',
        assignee: 'DevOps Team',
        startDate: new Date().toISOString(),
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        automationLevel: 60,
        businessImpact: 'high',
        timesSaved: 8,
      },
      {
        id: 'monitoring_automation',
        title: '監視システム自動化',
        description: 'アラート自動化とダッシュボード統合',
        category: 'monitoring',
        status: 'completed',
        priority: 'high',
        assignee: 'SRE Team',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        targetDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        automationLevel: 95,
        businessImpact: 'high',
        timesSaved: 12,
      },
      {
        id: 'documentation_automation',
        title: 'ドキュメント自動生成',
        description: 'APIドキュメントとコード解説の自動生成',
        category: 'documentation',
        status: 'planning',
        priority: 'medium',
        assignee: 'Development Team',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        automationLevel: 0,
        businessImpact: 'medium',
        timesSaved: 6,
      },
      {
        id: 'code_review_automation',
        title: 'コードレビュー自動化',
        description: '自動コード分析とレビュー支援ツールの導入',
        category: 'workflow',
        status: 'completed',
        priority: 'high',
        assignee: 'Engineering Team',
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        targetDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        automationLevel: 85,
        businessImpact: 'high',
        timesSaved: 10,
      },
    ];

    defaultInitiatives.forEach((initiative) => {
      this.initiatives.set(initiative.id, initiative);
    });

    console.log('🚀 Automation initiatives initialized:', defaultInitiatives.length);
  }

  /**
   * 📈 文化監視開始
   */
  private startCultureMonitoring(): void {
    // 初回評価実行
    this.performCultureAssessment();

    // 定期評価設定（週1回）
    this.monitoringInterval = setInterval(
      () => {
        this.performCultureAssessment();
      },
      7 * 24 * 60 * 60 * 1000
    );

    console.log('📈 Culture monitoring started');
  }

  /**
   * 🎯 文化評価実行
   */
  public performCultureAssessment(): CultureAssessment {
    const timestamp = new Date().toISOString();
    const teamSize = 5; // 現在のチームサイズ

    // 各スコア計算
    const automationAdoption = this.calculateAutomationAdoption();
    const toolUtilization = this.calculateToolUtilization();
    const processMaturity = this.calculateProcessMaturity();
    const collaborationScore = this.calculateCollaborationScore();
    const feedbackCulture = this.calculateFeedbackCulture();
    const continuousImprovement = this.calculateContinuousImprovement();

    // 総合スコア計算
    const overallScore = Math.round(
      (automationAdoption +
        toolUtilization +
        processMaturity +
        collaborationScore +
        feedbackCulture +
        continuousImprovement) /
        6
    );

    const assessment: CultureAssessment = {
      id: `assessment_${Date.now()}`,
      timestamp,
      teamSize,
      automationAdoption,
      toolUtilization,
      processMaturity,
      collaborationScore,
      feedbackCulture,
      continuousImprovement,
      overallScore,
      recommendations: this.generateRecommendations(overallScore),
    };

    this.assessmentHistory.push(assessment);

    // 履歴制限（最新20件のみ保持）
    if (this.assessmentHistory.length > 20) {
      this.assessmentHistory = this.assessmentHistory.slice(-20);
    }

    console.log(`🎯 Culture assessment completed: ${overallScore}%`);

    // 重要な改善点を通知
    if (overallScore >= 85) {
      toast({
        title: '🎉 優秀な自動化文化！',
        description: `文化スコア: ${overallScore}% - DevOps文化が根付いています`,
        variant: 'default',
      });
    } else if (overallScore < 70) {
      toast({
        title: '⚠️ 文化改善が必要',
        description: `文化スコア: ${overallScore}% - 自動化文化の浸透を強化しましょう`,
        variant: 'destructive',
      });
    }

    return assessment;
  }

  /**
   * 🤖 自動化導入率計算
   */
  private calculateAutomationAdoption(): number {
    const completedInitiatives = Array.from(this.initiatives.values()).filter(
      (i) => i.status === 'completed'
    );

    const totalInitiatives = this.initiatives.size;
    const adoptionRate =
      totalInitiatives > 0 ? (completedInitiatives.length / totalInitiatives) * 100 : 0;

    // 自動化レベルも考慮
    const avgAutomationLevel =
      completedInitiatives.length > 0
        ? completedInitiatives.reduce((sum, i) => sum + i.automationLevel, 0) /
          completedInitiatives.length
        : 0;

    return Math.round(adoptionRate * 0.6 + avgAutomationLevel * 0.4);
  }

  /**
   * 🔧 ツール活用率計算
   */
  private calculateToolUtilization(): number {
    const tools = Array.from(this.tools.values());
    const avgUtilization =
      tools.length > 0
        ? tools.reduce((sum, tool) => {
            return (
              sum +
              (tool.adoptionRate * 0.4 +
                tool.effectivenessScore * 0.4 +
                tool.integrationLevel * 0.2)
            );
          }, 0) / tools.length
        : 0;

    return Math.round(avgUtilization);
  }

  /**
   * ⚙️ プロセス成熟度計算
   */
  private calculateProcessMaturity(): number {
    const deploymentMetric = this.metrics.get('deployment_frequency');
    const leadTimeMetric = this.metrics.get('lead_time');
    const mttrMetric = this.metrics.get('mttr');
    const changeFailureMetric = this.metrics.get('change_failure_rate');

    let maturityScore = 0;
    let metricCount = 0;

    if (deploymentMetric) {
      const deploymentScore = Math.min(
        100,
        (deploymentMetric.value / deploymentMetric.target) * 100
      );
      maturityScore += deploymentScore;
      metricCount++;
    }

    if (leadTimeMetric) {
      const leadTimeScore = Math.max(
        0,
        100 - ((leadTimeMetric.value - leadTimeMetric.target) / leadTimeMetric.target) * 50
      );
      maturityScore += leadTimeScore;
      metricCount++;
    }

    if (mttrMetric) {
      const mttrScore = Math.max(
        0,
        100 - ((mttrMetric.value - mttrMetric.target) / mttrMetric.target) * 50
      );
      maturityScore += mttrScore;
      metricCount++;
    }

    if (changeFailureMetric) {
      const changeFailureScore = Math.max(
        0,
        100 -
          ((changeFailureMetric.value - changeFailureMetric.target) / changeFailureMetric.target) *
            50
      );
      maturityScore += changeFailureScore;
      metricCount++;
    }

    return metricCount > 0 ? Math.round(maturityScore / metricCount) : 0;
  }

  /**
   * 🤝 コラボレーションスコア計算
   */
  private calculateCollaborationScore(): number {
    const collaborationMetric = this.metrics.get('collaboration_score');
    return collaborationMetric ? collaborationMetric.value : 75; // デフォルト値
  }

  /**
   * 💬 フィードバック文化計算
   */
  private calculateFeedbackCulture(): number {
    // GitHub PRレビューやイシュー活動から推定
    const baseScore = 80; // 現在のGitHub活動レベル

    // 自動化ツールの満足度も考慮
    const tools = Array.from(this.tools.values());
    const avgSatisfaction =
      tools.length > 0
        ? tools.reduce((sum, tool) => sum + tool.userSatisfaction, 0) / tools.length
        : 80;

    return Math.round(baseScore * 0.6 + avgSatisfaction * 0.4);
  }

  /**
   * 🔄 継続的改善計算
   */
  private calculateContinuousImprovement(): number {
    const inProgressInitiatives = Array.from(this.initiatives.values()).filter(
      (i) => i.status === 'in_progress' || i.status === 'planning'
    );

    const totalInitiatives = this.initiatives.size;
    const improvementRate =
      totalInitiatives > 0 ? (inProgressInitiatives.length / totalInitiatives) * 100 : 0;

    // 高インパクトのイニシアティブにボーナス
    const highImpactCount = inProgressInitiatives.filter((i) => i.businessImpact === 'high').length;
    const impactBonus = highImpactCount * 10;

    return Math.min(100, Math.round(improvementRate + impactBonus));
  }

  /**
   * 💡 推奨事項生成
   */
  private generateRecommendations(overallScore: number): string[] {
    const recommendations: string[] = [];

    if (overallScore < 70) {
      recommendations.push('自動化イニシアティブの優先順位を見直し、高インパクトな取り組みに集中');
      recommendations.push('チーム全体での自動化ツール研修の実施');
      recommendations.push('定期的な振り返りミーティングでプロセス改善を議論');
    } else if (overallScore < 85) {
      recommendations.push('現在の自動化レベルを維持しつつ、新しい領域への展開を検討');
      recommendations.push('ツール間の統合レベルを向上させる');
      recommendations.push('メトリクス駆動の意思決定文化をさらに浸透させる');
    } else {
      recommendations.push('優秀な自動化文化を他チームにも展開');
      recommendations.push('先進的な自動化技術の実験的導入を検討');
      recommendations.push('外部コミュニティとの知識共有を強化');
    }

    // 個別メトリクスに基づく推奨事項
    const testCoverageMetric = this.metrics.get('test_automation_coverage');
    if (testCoverageMetric && testCoverageMetric.value < testCoverageMetric.target) {
      recommendations.push('テスト自動化カバレッジの向上に取り組む');
    }

    const deploymentMetric = this.metrics.get('deployment_frequency');
    if (deploymentMetric && deploymentMetric.value < deploymentMetric.target) {
      recommendations.push('デプロイメント頻度を上げるためのプロセス最適化');
    }

    return [...new Set(recommendations)];
  }

  /**
   * 📊 文化ダッシュボードデータ取得
   */
  public getCultureDashboard(): {
    currentAssessment: CultureAssessment | null;
    trendData: Array<{ date: string; score: number }>;
    metrics: AutomationMetric[];
    initiatives: AutomationInitiative[];
    tools: AutomationTool[];
    insights: {
      topPerformingAreas: string[];
      improvementAreas: string[];
      nextActions: string[];
    };
  } {
    const currentAssessment = this.assessmentHistory[this.assessmentHistory.length - 1] || null;

    const trendData = this.assessmentHistory.slice(-10).map((assessment) => ({
      date: assessment.timestamp.split('T')[0],
      score: assessment.overallScore,
    }));

    const metrics = Array.from(this.metrics.values());
    const initiatives = Array.from(this.initiatives.values());
    const tools = Array.from(this.tools.values());

    const insights = this.generateInsights(currentAssessment);

    return {
      currentAssessment,
      trendData,
      metrics,
      initiatives,
      tools,
      insights,
    };
  }

  /**
   * 🔍 インサイト生成
   */
  private generateInsights(assessment: CultureAssessment | null): {
    topPerformingAreas: string[];
    improvementAreas: string[];
    nextActions: string[];
  } {
    if (!assessment) {
      return {
        topPerformingAreas: [],
        improvementAreas: [],
        nextActions: ['文化評価を実行してください'],
      };
    }

    const scores = [
      { area: '自動化導入', score: assessment.automationAdoption },
      { area: 'ツール活用', score: assessment.toolUtilization },
      { area: 'プロセス成熟度', score: assessment.processMaturity },
      { area: 'コラボレーション', score: assessment.collaborationScore },
      { area: 'フィードバック文化', score: assessment.feedbackCulture },
      { area: '継続的改善', score: assessment.continuousImprovement },
    ];

    const topPerformingAreas = scores
      .filter((s) => s.score >= 85)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.area);

    const improvementAreas = scores
      .filter((s) => s.score < 75)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((s) => s.area);

    const nextActions: string[] = [];

    if (improvementAreas.length > 0) {
      nextActions.push(`${improvementAreas[0]}の改善に取り組む`);
    }

    const inProgressCount = Array.from(this.initiatives.values()).filter(
      (i) => i.status === 'in_progress'
    ).length;

    if (inProgressCount === 0) {
      nextActions.push('新しい自動化イニシアティブを開始');
    }

    nextActions.push('定期的な文化評価とメトリクス監視');

    return {
      topPerformingAreas,
      improvementAreas,
      nextActions,
    };
  }

  /**
   * 🧹 クリーンアップ
   */
  public cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('🧹 Automation Culture Service cleaned up');
  }
}

export const automationCultureService = AutomationCultureService.getInstance();
