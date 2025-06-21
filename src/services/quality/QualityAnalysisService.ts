export interface TestCoverageReport {
  overall: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  files: Array<{
    filename: string;
    statements: number;
    branches: number;
    functions: number;
    lines: number;
    uncoveredLines: number[];
  }>;
  summary: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  timestamp: string;
}

export interface StaticAnalysisReport {
  eslint: {
    totalFiles: number;
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
    issues: Array<{
      filePath: string;
      messages: Array<{
        ruleId: string;
        severity: 1 | 2; // 1: warning, 2: error
        message: string;
        line: number;
        column: number;
        nodeType?: string;
        fix?: any;
      }>;
    }>;
  };
  typescript: {
    totalFiles: number;
    totalErrors: number;
    errors: Array<{
      file: string;
      line: number;
      character: number;
      messageText: string;
      category: 'error' | 'warning' | 'suggestion' | 'message';
      code: number;
    }>;
  };
  timestamp: string;
}

export interface PerformanceReport {
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    totalBlockingTime: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    numericValue: number;
    displayValue: string;
  }>;
  timestamp: string;
}

export interface QualityMetrics {
  testCoverage: TestCoverageReport;
  staticAnalysis: StaticAnalysisReport;
  performance: PerformanceReport;
  qualityScore: {
    overall: number;
    testing: number;
    codeQuality: number;
    performance: number;
    maintainability: number;
  };
  trends: Array<{
    date: string;
    testCoverage: number;
    eslintScore: number;
    performanceScore: number;
    overallScore: number;
  }>;
  lastUpdated: string;
}

class QualityAnalysisService {
  private readonly API_BASE = '/api/quality';

  // テストカバレッジレポートの取得
  async getTestCoverage(): Promise<TestCoverageReport> {
    try {
      // 実際の環境では Jest coverage レポートから取得
      const response = await fetch(`${this.API_BASE}/coverage`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Test coverage API not available, using mock data');
    }

    // モックデータ
    return this.generateMockTestCoverage();
  }

  // 静的解析レポートの取得
  async getStaticAnalysisReport(): Promise<StaticAnalysisReport> {
    try {
      const response = await fetch(`${this.API_BASE}/static-analysis`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Static analysis API not available, using mock data');
    }

    // モックデータ
    return this.generateMockStaticAnalysis();
  }

  // パフォーマンスレポートの取得
  async getPerformanceReport(): Promise<PerformanceReport> {
    try {
      const response = await fetch(`${this.API_BASE}/performance`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Performance API not available, using mock data');
    }

    // モックデータ
    return this.generateMockPerformanceReport();
  }

  // 統合品質メトリクスの取得
  async getQualityMetrics(): Promise<QualityMetrics> {
    const [testCoverage, staticAnalysis, performance] = await Promise.all([
      this.getTestCoverage(),
      this.getStaticAnalysisReport(),
      this.getPerformanceReport(),
    ]);

    const qualityScore = this.calculateQualityScore(testCoverage, staticAnalysis, performance);
    const trends = await this.getQualityTrends();

    return {
      testCoverage,
      staticAnalysis,
      performance,
      qualityScore,
      trends,
      lastUpdated: new Date().toISOString(),
    };
  }

  // 品質スコアの計算
  private calculateQualityScore(
    testCoverage: TestCoverageReport,
    staticAnalysis: StaticAnalysisReport,
    performance: PerformanceReport
  ) {
    const testing = testCoverage.overall.lines;
    const codeQuality = Math.max(
      0,
      100 - (staticAnalysis.eslint.errorCount * 10 + staticAnalysis.eslint.warningCount * 5)
    );
    const performanceScore = performance.lighthouse.performance;
    const maintainability = Math.max(0, 100 - staticAnalysis.typescript.totalErrors * 5);

    const overall = Math.round((testing + codeQuality + performanceScore + maintainability) / 4);

    return {
      overall,
      testing,
      codeQuality,
      performance: performanceScore,
      maintainability,
    };
  }

  // 品質トレンドの取得
  private async getQualityTrends() {
    // 過去30日間のデータを生成（実際の環境では履歴データから取得）
    const trends = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split('T')[0],
        testCoverage: Math.round(75 + Math.random() * 10), // 75-85%の範囲
        eslintScore: Math.round(85 + Math.random() * 10), // 85-95%の範囲
        performanceScore: Math.round(80 + Math.random() * 15), // 80-95%の範囲
        overallScore: Math.round(80 + Math.random() * 12), // 80-92%の範囲
      });
    }

    return trends;
  }

  // モックデータ生成
  private generateMockTestCoverage(): TestCoverageReport {
    return {
      overall: {
        statements: 82.5,
        branches: 78.3,
        functions: 85.7,
        lines: 80.1,
      },
      files: [
        {
          filename: 'src/components/chart/hooks/useSurveyData.ts',
          statements: 95.2,
          branches: 89.5,
          functions: 100,
          lines: 94.8,
          uncoveredLines: [45, 67, 123],
        },
        {
          filename: 'src/components/ui/error-boundary.tsx',
          statements: 92.1,
          branches: 85.7,
          functions: 100,
          lines: 91.3,
          uncoveredLines: [78, 145],
        },
        {
          filename: 'src/hooks/useDataValidation.ts',
          statements: 87.6,
          branches: 82.4,
          functions: 90.9,
          lines: 86.2,
          uncoveredLines: [89, 156, 234, 267],
        },
      ],
      summary: {
        total: 1247,
        covered: 999,
        skipped: 23,
        pct: 80.1,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private generateMockStaticAnalysis(): StaticAnalysisReport {
    return {
      eslint: {
        totalFiles: 156,
        totalIssues: 23,
        errorCount: 3,
        warningCount: 20,
        fixableErrorCount: 1,
        fixableWarningCount: 15,
        issues: [
          {
            filePath: 'src/components/chart/PoliticalTrendsChart.tsx',
            messages: [
              {
                ruleId: 'prefer-const',
                severity: 2,
                message: "'data' is never reassigned. Use 'const' instead of 'let'.",
                line: 45,
                column: 7,
                nodeType: 'VariableDeclarator',
                fix: { range: [1234, 1237], text: 'const' },
              },
            ],
          },
          {
            filePath: 'src/utils/dateUtils.ts',
            messages: [
              {
                ruleId: 'no-unused-vars',
                severity: 1,
                message: "'formatDate' is defined but never used.",
                line: 23,
                column: 10,
                nodeType: 'Identifier',
              },
            ],
          },
        ],
      },
      typescript: {
        totalFiles: 156,
        totalErrors: 5,
        errors: [
          {
            file: 'src/types/api.ts',
            line: 12,
            character: 5,
            messageText:
              "Property 'id' is missing in type '{ name: string; }' but required in type 'BaseEntity'.",
            category: 'error',
            code: 2741,
          },
          {
            file: 'src/services/api/baseApi.ts',
            line: 67,
            character: 23,
            messageText:
              "Argument of type 'string' is not assignable to parameter of type 'number'.",
            category: 'error',
            code: 2345,
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };
  }

  private generateMockPerformanceReport(): PerformanceReport {
    return {
      lighthouse: {
        performance: 87,
        accessibility: 94,
        bestPractices: 92,
        seo: 89,
        pwa: 76,
      },
      metrics: {
        firstContentfulPaint: 1.2,
        largestContentfulPaint: 2.1,
        firstInputDelay: 8,
        cumulativeLayoutShift: 0.05,
        speedIndex: 1.8,
        totalBlockingTime: 150,
      },
      opportunities: [
        {
          id: 'unused-javascript',
          title: '使用されていないJavaScriptを削除する',
          description: 'バンドルサイズを削減して読み込み時間を改善',
          score: 0.75,
          numericValue: 234000,
          displayValue: '234 KB',
        },
        {
          id: 'render-blocking-resources',
          title: 'レンダリングを妨げるリソースを除去する',
          description: 'CSSとJavaScriptの最適化',
          score: 0.82,
          numericValue: 450,
          displayValue: '450 ms',
        },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  // レポートの更新トリガー
  async refreshReports(): Promise<void> {
    try {
      await fetch(`${this.API_BASE}/refresh`, { method: 'POST' });
    } catch (error) {
      console.warn('Failed to refresh reports:', error);
    }
  }

  // 品質ゲートのチェック
  checkQualityGate(metrics: QualityMetrics): {
    passed: boolean;
    failures: string[];
    recommendations: string[];
  } {
    const failures: string[] = [];
    const recommendations: string[] = [];

    // テストカバレッジのチェック
    if (metrics.testCoverage.overall.lines < 80) {
      failures.push(
        `テストカバレッジが基準値を下回っています: ${metrics.testCoverage.overall.lines}% < 80%`
      );
    }

    // 静的解析のチェック
    if (metrics.staticAnalysis.eslint.errorCount > 0) {
      failures.push(`ESLintエラーが${metrics.staticAnalysis.eslint.errorCount}件存在します`);
    }

    if (metrics.staticAnalysis.typescript.totalErrors > 0) {
      failures.push(
        `TypeScriptエラーが${metrics.staticAnalysis.typescript.totalErrors}件存在します`
      );
    }

    // パフォーマンスのチェック
    if (metrics.performance.lighthouse.performance < 85) {
      failures.push(
        `パフォーマンススコアが基準値を下回っています: ${metrics.performance.lighthouse.performance} < 85`
      );
    }

    // 推奨事項
    if (metrics.testCoverage.overall.lines < 90) {
      recommendations.push('テストカバレッジを90%以上に向上させることを推奨します');
    }

    if (metrics.staticAnalysis.eslint.warningCount > 10) {
      recommendations.push('ESLint警告を10件以下に削減することを推奨します');
    }

    return {
      passed: failures.length === 0,
      failures,
      recommendations,
    };
  }
}

export const qualityAnalysisService = new QualityAnalysisService();
