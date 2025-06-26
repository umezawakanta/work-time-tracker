import { toast } from '@/components/ui/use-toast';

export interface QualityGate {
  id: string;
  name: string;
  description: string;
  category: 'code_quality' | 'security' | 'performance' | 'testing' | 'compliance';
  rules: QualityRule[];
  threshold: QualityThreshold;
  isEnabled: boolean;
  severity: 'info' | 'warning' | 'error' | 'blocker';
  createdAt: string;
  lastEvaluated?: string;
}

export interface QualityRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'greater_equal' | 'less_equal';
  value: number | string;
  unit?: string;
  isActive: boolean;
}

export interface QualityThreshold {
  pass: number; // 合格基準（%）
  warning: number; // 警告基準（%）
  error: number; // エラー基準（%）
}

export interface QualityEvaluation {
  id: string;
  gateId: string;
  timestamp: string;
  status: 'passed' | 'warning' | 'failed' | 'error';
  score: number; // 0-100
  results: QualityRuleResult[];
  summary: QualityEvaluationSummary;
  recommendations: string[];
  executionTime: number; // milliseconds
}

export interface QualityRuleResult {
  ruleId: string;
  ruleName: string;
  status: 'passed' | 'failed' | 'skipped';
  actualValue: number | string;
  expectedValue: number | string;
  message: string;
  impact: 'low' | 'medium' | 'high';
}

export interface QualityEvaluationSummary {
  totalRules: number;
  passedRules: number;
  failedRules: number;
  skippedRules: number;
  overallStatus: 'passed' | 'warning' | 'failed';
  criticalIssues: number;
  improvements: string[];
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  qualityGates: string[]; // Quality Gate IDs
  dependencies: string[]; // Previous stage IDs
  isBlocking: boolean; // ゲート失敗時にパイプラインを停止するか
  timeout: number; // minutes
}

/**
 * 🔄 品質ゲートサービス - CI/CDパイプラインの品質制御
 */
class QualityGateService {
  private static instance: QualityGateService | null = null;
  private qualityGates: Map<string, QualityGate> = new Map();
  private evaluationHistory: QualityEvaluation[] = [];
  private pipelineStages: Map<string, PipelineStage> = new Map();
  private evaluationInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeDefaultQualityGates();
    this.initializePipelineStages();
    this.startContinuousEvaluation();
    console.log('🔄 Quality Gate Service initialized');
  }

  public static getInstance(): QualityGateService {
    if (!QualityGateService.instance) {
      QualityGateService.instance = new QualityGateService();
    }
    return QualityGateService.instance;
  }

  /**
   * 🛡️ デフォルト品質ゲート初期化
   */
  private initializeDefaultQualityGates(): void {
    const defaultGates: QualityGate[] = [
      {
        id: 'code_quality_gate',
        name: 'コード品質ゲート',
        description: 'コードの品質基準をチェック',
        category: 'code_quality',
        rules: [
          {
            id: 'test_coverage_rule',
            name: 'テストカバレッジ',
            description: 'テストカバレッジが80%以上である',
            metric: 'test_coverage_percentage',
            operator: 'greater_equal',
            value: 80,
            unit: '%',
            isActive: true,
          },
          {
            id: 'complexity_rule',
            name: '循環的複雑度',
            description: '関数の循環的複雑度が10以下である',
            metric: 'cyclomatic_complexity',
            operator: 'less_equal',
            value: 10,
            unit: '',
            isActive: true,
          },
          {
            id: 'duplicated_lines_rule',
            name: '重複コード',
            description: '重複行が3%以下である',
            metric: 'duplicated_lines_percentage',
            operator: 'less_equal',
            value: 3,
            unit: '%',
            isActive: true,
          },
        ],
        threshold: {
          pass: 80,
          warning: 60,
          error: 40,
        },
        isEnabled: true,
        severity: 'error',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'security_gate',
        name: 'セキュリティゲート',
        description: 'セキュリティ基準をチェック',
        category: 'security',
        rules: [
          {
            id: 'vulnerability_rule',
            name: '脆弱性チェック',
            description: '重大な脆弱性が0件である',
            metric: 'critical_vulnerabilities',
            operator: 'equals',
            value: 0,
            unit: '件',
            isActive: true,
          },
          {
            id: 'owasp_compliance_rule',
            name: 'OWASP準拠',
            description: 'OWASP準拠レベルが95%以上である',
            metric: 'owasp_compliance_percentage',
            operator: 'greater_equal',
            value: 95,
            unit: '%',
            isActive: true,
          },
          {
            id: 'dependency_check_rule',
            name: '依存関係チェック',
            description: '既知の脆弱性のある依存関係が0件である',
            metric: 'vulnerable_dependencies',
            operator: 'equals',
            value: 0,
            unit: '件',
            isActive: true,
          },
        ],
        threshold: {
          pass: 100,
          warning: 80,
          error: 60,
        },
        isEnabled: true,
        severity: 'blocker',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'performance_gate',
        name: 'パフォーマンスゲート',
        description: 'パフォーマンス基準をチェック',
        category: 'performance',
        rules: [
          {
            id: 'lighthouse_score_rule',
            name: 'Lighthouseスコア',
            description: 'Lighthouseパフォーマンススコアが90以上である',
            metric: 'lighthouse_performance_score',
            operator: 'greater_equal',
            value: 90,
            unit: '',
            isActive: true,
          },
          {
            id: 'bundle_size_rule',
            name: 'バンドルサイズ',
            description: 'メインバンドルサイズが250KB以下である',
            metric: 'bundle_size_kb',
            operator: 'less_equal',
            value: 250,
            unit: 'KB',
            isActive: true,
          },
          {
            id: 'load_time_rule',
            name: 'ページ読み込み時間',
            description: 'ページ読み込み時間が2秒以下である',
            metric: 'page_load_time_seconds',
            operator: 'less_equal',
            value: 2,
            unit: '秒',
            isActive: true,
          },
        ],
        threshold: {
          pass: 85,
          warning: 70,
          error: 50,
        },
        isEnabled: true,
        severity: 'warning',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'testing_gate',
        name: 'テストゲート',
        description: 'テスト品質基準をチェック',
        category: 'testing',
        rules: [
          {
            id: 'unit_test_pass_rule',
            name: 'ユニットテスト成功率',
            description: 'ユニットテスト成功率が100%である',
            metric: 'unit_test_pass_rate',
            operator: 'equals',
            value: 100,
            unit: '%',
            isActive: true,
          },
          {
            id: 'integration_test_rule',
            name: '統合テスト成功率',
            description: '統合テスト成功率が95%以上である',
            metric: 'integration_test_pass_rate',
            operator: 'greater_equal',
            value: 95,
            unit: '%',
            isActive: true,
          },
          {
            id: 'test_execution_time_rule',
            name: 'テスト実行時間',
            description: 'テスト実行時間が5分以下である',
            metric: 'test_execution_time_minutes',
            operator: 'less_equal',
            value: 5,
            unit: '分',
            isActive: true,
          },
        ],
        threshold: {
          pass: 95,
          warning: 85,
          error: 70,
        },
        isEnabled: true,
        severity: 'error',
        createdAt: new Date().toISOString(),
      },
    ];

    defaultGates.forEach((gate) => {
      this.qualityGates.set(gate.id, gate);
    });

    console.log('🛡️ Default quality gates initialized:', defaultGates.length);
  }

  /**
   * 🔧 パイプラインステージ初期化
   */
  private initializePipelineStages(): void {
    const stages: PipelineStage[] = [
      {
        id: 'build_stage',
        name: 'ビルドステージ',
        description: 'コードのビルドとコンパイル',
        qualityGates: ['code_quality_gate'],
        dependencies: [],
        isBlocking: true,
        timeout: 10,
      },
      {
        id: 'test_stage',
        name: 'テストステージ',
        description: 'ユニットテストと統合テストの実行',
        qualityGates: ['testing_gate'],
        dependencies: ['build_stage'],
        isBlocking: true,
        timeout: 15,
      },
      {
        id: 'security_stage',
        name: 'セキュリティステージ',
        description: 'セキュリティスキャンと脆弱性チェック',
        qualityGates: ['security_gate'],
        dependencies: ['test_stage'],
        isBlocking: true,
        timeout: 20,
      },
      {
        id: 'performance_stage',
        name: 'パフォーマンステージ',
        description: 'パフォーマンステストと最適化チェック',
        qualityGates: ['performance_gate'],
        dependencies: ['security_stage'],
        isBlocking: false,
        timeout: 25,
      },
    ];

    stages.forEach((stage) => {
      this.pipelineStages.set(stage.id, stage);
    });

    console.log('🔧 Pipeline stages initialized:', stages.length);
  }

  /**
   * 📊 継続的評価開始
   */
  private startContinuousEvaluation(): void {
    // 初回評価実行
    this.evaluateAllQualityGates();

    // 定期評価設定（30分ごと）
    this.evaluationInterval = setInterval(() => {
      this.evaluateAllQualityGates();
    }, 1800000);

    console.log('📊 Continuous quality evaluation started');
  }

  /**
   * 🔍 全品質ゲート評価
   */
  public async evaluateAllQualityGates(): Promise<QualityEvaluation[]> {
    const evaluations: QualityEvaluation[] = [];

    for (const gate of this.qualityGates.values()) {
      if (gate.isEnabled) {
        try {
          const evaluation = await this.evaluateQualityGate(gate.id);
          evaluations.push(evaluation);
        } catch (error) {
          console.error(`❌ Failed to evaluate quality gate ${gate.id}:`, error);
        }
      }
    }

    console.log(`🔍 Evaluated ${evaluations.length} quality gates`);
    return evaluations;
  }

  /**
   * 📏 品質ゲート評価
   */
  public async evaluateQualityGate(gateId: string): Promise<QualityEvaluation> {
    const gate = this.qualityGates.get(gateId);
    if (!gate) {
      throw new Error(`Quality gate not found: ${gateId}`);
    }

    const startTime = Date.now();
    const evaluation: QualityEvaluation = {
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gateId: gate.id,
      timestamp: new Date().toISOString(),
      status: 'passed',
      score: 0,
      results: [],
      summary: {
        totalRules: gate.rules.length,
        passedRules: 0,
        failedRules: 0,
        skippedRules: 0,
        overallStatus: 'passed',
        criticalIssues: 0,
        improvements: [],
      },
      recommendations: [],
      executionTime: 0,
    };

    try {
      // 各ルールを評価
      for (const rule of gate.rules) {
        if (rule.isActive) {
          const result = await this.evaluateRule(rule, gate.category);
          evaluation.results.push(result);

          if (result.status === 'passed') {
            evaluation.summary.passedRules++;
          } else if (result.status === 'failed') {
            evaluation.summary.failedRules++;
            if (result.impact === 'high') {
              evaluation.summary.criticalIssues++;
            }
          } else {
            evaluation.summary.skippedRules++;
          }
        }
      }

      // スコア計算
      evaluation.score = this.calculateGateScore(evaluation.results);

      // ステータス決定
      evaluation.status = this.determineGateStatus(evaluation.score, gate.threshold);
      evaluation.summary.overallStatus = evaluation.status;

      // 推奨事項生成
      evaluation.recommendations = this.generateRecommendations(evaluation.results, gate.category);

      // 改善点生成
      evaluation.summary.improvements = this.generateImprovements(evaluation.results);

      evaluation.executionTime = Date.now() - startTime;

      // ゲート更新
      gate.lastEvaluated = evaluation.timestamp;

      // 履歴保存
      this.evaluationHistory.push(evaluation);

      // 履歴制限（最新100件のみ保持）
      if (this.evaluationHistory.length > 100) {
        this.evaluationHistory = this.evaluationHistory.slice(-100);
      }

      console.log(
        `📏 Quality gate evaluated: ${gate.name} - ${evaluation.status} (${evaluation.score}%)`
      );

      // 重要な結果を通知
      if (evaluation.status === 'failed' && gate.severity === 'blocker') {
        toast({
          title: '🚫 品質ゲート失敗',
          description: `${gate.name}が失敗しました。デプロイメントが中止されます。`,
          variant: 'destructive',
        });
      } else if (evaluation.status === 'warning') {
        toast({
          title: '⚠️ 品質ゲート警告',
          description: `${gate.name}で警告が発生しました。改善を検討してください。`,
          variant: 'default',
        });
      }

      return evaluation;
    } catch (error) {
      evaluation.status = 'error';
      evaluation.executionTime = Date.now() - startTime;
      console.error(`❌ Quality gate evaluation failed: ${gate.name}`, error);
      throw error;
    }
  }

  /**
   * 📊 ルール評価
   */
  private async evaluateRule(rule: QualityRule, category: string): Promise<QualityRuleResult> {
    const result: QualityRuleResult = {
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'passed',
      actualValue: 0,
      expectedValue: rule.value,
      message: '',
      impact: 'low',
    };

    try {
      // メトリクス値取得
      const actualValue = await this.getMetricValue(rule.metric, category);
      result.actualValue = actualValue;

      // ルール評価
      const passed = this.evaluateRuleCondition(actualValue, rule.operator, rule.value);
      result.status = passed ? 'passed' : 'failed';

      // メッセージ生成
      result.message = this.generateRuleMessage(rule, actualValue, passed);

      // インパクト判定
      result.impact = this.determineRuleImpact(rule, passed);

      return result;
    } catch (error) {
      result.status = 'skipped';
      result.message = `メトリクス取得エラー: ${error}`;
      return result;
    }
  }

  /**
   * 📈 メトリクス値取得
   */
  private async getMetricValue(metric: string, category: string): Promise<number> {
    // 実際の実装では、各種ツールからメトリクスを取得
    switch (metric) {
      case 'test_coverage_percentage':
        return 86.11; // 現在のテストカバレッジ

      case 'cyclomatic_complexity':
        return 8; // 平均的な循環的複雑度

      case 'duplicated_lines_percentage':
        return 2.5; // 重複行の割合

      case 'critical_vulnerabilities':
        return 0; // セキュリティスキャン結果

      case 'owasp_compliance_percentage':
        return 100; // OWASP準拠レベル

      case 'vulnerable_dependencies':
        return 0; // 脆弱な依存関係数

      case 'lighthouse_performance_score':
        return 92; // Lighthouseスコア

      case 'bundle_size_kb':
        return 1620; // 現在のバンドルサイズ（KB）

      case 'page_load_time_seconds':
        return 1.5; // ページ読み込み時間

      case 'unit_test_pass_rate':
        return 100; // ユニットテスト成功率

      case 'integration_test_pass_rate':
        return 95; // 統合テスト成功率

      case 'test_execution_time_minutes':
        return 3.2; // テスト実行時間

      default:
        throw new Error(`Unknown metric: ${metric}`);
    }
  }

  /**
   * 🔍 ルール条件評価
   */
  private evaluateRuleCondition(
    actualValue: number,
    operator: string,
    expectedValue: number | string
  ): boolean {
    const expected = typeof expectedValue === 'string' ? parseFloat(expectedValue) : expectedValue;

    switch (operator) {
      case 'greater_than':
        return actualValue > expected;
      case 'greater_equal':
        return actualValue >= expected;
      case 'less_than':
        return actualValue < expected;
      case 'less_equal':
        return actualValue <= expected;
      case 'equals':
        return actualValue === expected;
      default:
        return false;
    }
  }

  /**
   * 📝 ルールメッセージ生成
   */
  private generateRuleMessage(rule: QualityRule, actualValue: number, passed: boolean): string {
    const status = passed ? '✅ 合格' : '❌ 不合格';
    const unit = rule.unit || '';
    return `${status}: ${rule.name} - 実際値: ${actualValue}${unit}, 期待値: ${rule.operator} ${rule.value}${unit}`;
  }

  /**
   * ⚡ ルールインパクト判定
   */
  private determineRuleImpact(rule: QualityRule, passed: boolean): 'low' | 'medium' | 'high' {
    if (passed) return 'low';

    // セキュリティルールは高インパクト
    if (rule.metric.includes('vulnerability') || rule.metric.includes('security')) {
      return 'high';
    }

    // テストカバレッジや重要なパフォーマンスメトリクスは中インパクト
    if (rule.metric.includes('coverage') || rule.metric.includes('performance')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * 📊 ゲートスコア計算
   */
  private calculateGateScore(results: QualityRuleResult[]): number {
    if (results.length === 0) return 0;

    const passedRules = results.filter((r) => r.status === 'passed').length;
    return Math.round((passedRules / results.length) * 100);
  }

  /**
   * 🎯 ゲートステータス決定
   */
  private determineGateStatus(
    score: number,
    threshold: QualityThreshold
  ): 'passed' | 'warning' | 'failed' {
    if (score >= threshold.pass) return 'passed';
    if (score >= threshold.warning) return 'warning';
    return 'failed';
  }

  /**
   * 💡 推奨事項生成
   */
  private generateRecommendations(results: QualityRuleResult[], category: string): string[] {
    const recommendations: string[] = [];

    const failedResults = results.filter((r) => r.status === 'failed');

    for (const result of failedResults) {
      switch (result.ruleId) {
        case 'test_coverage_rule':
          recommendations.push('テストカバレッジを向上させるため、テストケースを追加してください');
          break;
        case 'complexity_rule':
          recommendations.push('複雑な関数をリファクタリングして、循環的複雑度を下げてください');
          break;
        case 'vulnerability_rule':
          recommendations.push('セキュリティ脆弱性を修正してください');
          break;
        case 'bundle_size_rule':
          recommendations.push(
            'コード分割やTree Shakingを実装してバンドルサイズを削減してください'
          );
          break;
        default:
          recommendations.push(`${result.ruleName}の改善が必要です`);
      }
    }

    return [...new Set(recommendations)];
  }

  /**
   * 🔧 改善点生成
   */
  private generateImprovements(results: QualityRuleResult[]): string[] {
    const improvements: string[] = [];

    const highImpactFailures = results.filter((r) => r.status === 'failed' && r.impact === 'high');

    if (highImpactFailures.length > 0) {
      improvements.push('高インパクトの問題を優先的に修正');
    }

    const mediumImpactFailures = results.filter(
      (r) => r.status === 'failed' && r.impact === 'medium'
    );

    if (mediumImpactFailures.length > 0) {
      improvements.push('中インパクトの問題の計画的修正');
    }

    return improvements;
  }

  /**
   * 📋 品質レポート生成
   */
  public generateQualityReport(): {
    overview: {
      totalGates: number;
      passedGates: number;
      warningGates: number;
      failedGates: number;
      averageScore: number;
    };
    gateDetails: QualityEvaluation[];
    recommendations: string[];
    trends: {
      scoreHistory: Array<{ date: string; score: number }>;
      improvementSuggestions: string[];
    };
  } {
    const latestEvaluations = this.getLatestEvaluations();
    const passedGates = latestEvaluations.filter((e) => e.status === 'passed').length;
    const warningGates = latestEvaluations.filter((e) => e.status === 'warning').length;
    const failedGates = latestEvaluations.filter((e) => e.status === 'failed').length;

    const averageScore =
      latestEvaluations.length > 0
        ? Math.round(
            latestEvaluations.reduce((sum, e) => sum + e.score, 0) / latestEvaluations.length
          )
        : 0;

    const allRecommendations = latestEvaluations.flatMap((e) => e.recommendations);

    return {
      overview: {
        totalGates: this.qualityGates.size,
        passedGates,
        warningGates,
        failedGates,
        averageScore,
      },
      gateDetails: latestEvaluations,
      recommendations: [...new Set(allRecommendations)],
      trends: {
        scoreHistory: this.getScoreHistory(),
        improvementSuggestions: this.generateImprovementSuggestions(latestEvaluations),
      },
    };
  }

  /**
   * 📈 最新評価取得
   */
  private getLatestEvaluations(): QualityEvaluation[] {
    const latestByGate = new Map<string, QualityEvaluation>();

    // 各ゲートの最新評価を取得
    for (const evaluation of this.evaluationHistory) {
      const current = latestByGate.get(evaluation.gateId);
      if (!current || new Date(evaluation.timestamp) > new Date(current.timestamp)) {
        latestByGate.set(evaluation.gateId, evaluation);
      }
    }

    return Array.from(latestByGate.values());
  }

  /**
   * 📊 スコア履歴取得
   */
  private getScoreHistory(): Array<{ date: string; score: number }> {
    return this.evaluationHistory.slice(-20).map((e) => ({
      date: e.timestamp.split('T')[0],
      score: e.score,
    }));
  }

  /**
   * 💡 改善提案生成
   */
  private generateImprovementSuggestions(evaluations: QualityEvaluation[]): string[] {
    const suggestions: string[] = [];

    const failedEvaluations = evaluations.filter((e) => e.status === 'failed');

    if (failedEvaluations.length > 0) {
      suggestions.push('失敗した品質ゲートの問題を優先的に解決');
    }

    const lowScoreEvaluations = evaluations.filter((e) => e.score < 70);

    if (lowScoreEvaluations.length > 0) {
      suggestions.push('スコアの低いゲートの品質向上施策を実行');
    }

    suggestions.push('定期的な品質メトリクスの見直しと基準調整');

    return suggestions;
  }

  /**
   * 🧹 クリーンアップ
   */
  public cleanup(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }

    console.log('🧹 Quality Gate Service cleaned up');
  }
}

export const qualityGateService = QualityGateService.getInstance();
