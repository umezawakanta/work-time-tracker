/**
 * 🔍 固定データ分析サービス
 * サイト全体の固定値・ハードコーディング箇所を検出・分析
 */

export interface HardcodedIssue {
  id: string;
  file: string;
  line: number;
  type:
    | 'random'
    | 'mock-data'
    | 'hardcoded-string'
    | 'hardcoded-number'
    | 'fixed-array'
    | 'api-mock';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'ui' | 'data' | 'api' | 'config' | 'logic';
  description: string;
  codeSnippet: string;
  suggestion: string;
  estimatedEffort: 'small' | 'medium' | 'large';
  impact: 'high' | 'medium' | 'low';
  isFixed: boolean;
}

export interface AnalysisResult {
  totalIssues: number;
  criticalIssues: number;
  highPriorityIssues: number;
  issuesByCategory: Record<string, number>;
  issuesByType: Record<string, number>;
  fileAnalysis: Record<string, HardcodedIssue[]>;
  suggestions: string[];
  overallScore: number;
}

class HardcodedDataAnalyzer {
  private static instance: HardcodedDataAnalyzer | null = null;
  private analysisCache: AnalysisResult | null = null;
  private lastAnalysisTime: number = 0;

  public static getInstance(): HardcodedDataAnalyzer {
    if (!HardcodedDataAnalyzer.instance) {
      HardcodedDataAnalyzer.instance = new HardcodedDataAnalyzer();
    }
    return HardcodedDataAnalyzer.instance;
  }

  /**
   * プロジェクト全体の固定データ分析を実行
   */
  public async analyzeProject(): Promise<AnalysisResult> {
    const now = Date.now();

    // キャッシュが5分以内なら再利用
    if (this.analysisCache && now - this.lastAnalysisTime < 5 * 60 * 1000) {
      console.log('📦 キャッシュされた分析結果を使用');
      return this.analysisCache;
    }

    console.log('🔍 固定データ分析を開始...');
    console.log('📡 サーバーサイドAPIを呼び出し中...');

    try {
      // サーバーサイドAPIエンドポイントを呼び出し
      const response = await fetch('/api/analysis/hardcoded-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API呼び出しエラー: ${response.status} ${response.statusText}`);
      }

      const result: AnalysisResult = await response.json();
      console.log(`✅ APIから分析結果を取得: ${result.totalIssues}件の問題を検出`);

      // キャッシュに保存
      this.analysisCache = result;
      this.lastAnalysisTime = now;

      return result;
    } catch (error) {
      console.error('❌ API呼び出しエラー:', error);
      console.log('🔄 エラーのためサンプルデータを表示');

      // APIエラーの場合はサンプルデータを返す
      const sampleResult = this.createSampleAnalysisResult();
      this.analysisCache = sampleResult;
      this.lastAnalysisTime = now;

      return sampleResult;
    }
  }

  // ブラウザ環境では使用しない（サーバーサイドで実行）

  // ブラウザ環境では使用しない（サーバーサイドで実行）
  /**
   * 分析結果をコンパイル（互換性のためのみ残している）
   */
  private compileAnalysisResult(issues: HardcodedIssue[]): AnalysisResult {
    const criticalIssues = issues.filter((i) => i.severity === 'critical').length;
    const highPriorityIssues = issues.filter((i) => i.severity === 'high').length;

    const issuesByCategory = issues.reduce(
      (acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const issuesByType = issues.reduce(
      (acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const fileAnalysis = issues.reduce(
      (acc, issue) => {
        if (!acc[issue.file]) acc[issue.file] = [];
        acc[issue.file].push(issue);
        return acc;
      },
      {} as Record<string, HardcodedIssue[]>
    );

    // 全体スコア計算（100点満点、問題が少ないほど高得点）
    const maxPossibleIssues = 1000; // 仮定の最大問題数
    const weightedIssues =
      criticalIssues * 4 +
      highPriorityIssues * 2 +
      (issues.length - criticalIssues - highPriorityIssues);
    const overallScore = Math.max(0, Math.round(100 - (weightedIssues / maxPossibleIssues) * 100));

    const suggestions = this.generateSuggestions(issues);

    return {
      totalIssues: issues.length,
      criticalIssues,
      highPriorityIssues,
      issuesByCategory,
      issuesByType,
      fileAnalysis,
      suggestions,
      overallScore,
    };
  }

  /**
   * 改善提案を生成
   */
  private generateSuggestions(issues: HardcodedIssue[]): string[] {
    const suggestions: string[] = [];

    const criticalCount = issues.filter((i) => i.severity === 'critical').length;
    const randomCount = issues.filter((i) => i.type === 'random').length;
    const mockCount = issues.filter((i) => i.type === 'mock-data').length;

    if (criticalCount > 5) {
      suggestions.push('🚨 緊急度の高い問題が多数あります。API モックの実装を優先してください');
    }

    if (randomCount > 10) {
      suggestions.push(
        '🎲 Math.random()の使用が多すぎます。実際のデータソースへの置き換えを検討してください'
      );
    }

    if (mockCount > 3) {
      suggestions.push('🔌 モックデータが多用されています。実際のAPI統合を進めてください');
    }

    if (suggestions.length === 0) {
      suggestions.push('✅ 固定データの使用量は適切な範囲内です');
    }

    return suggestions;
  }

  /**
   * サンプル分析結果を作成（デバッグ用）
   */
  private createSampleAnalysisResult(): AnalysisResult {
    console.log('📊 サンプル分析結果を作成中...');

    const sampleIssues: HardcodedIssue[] = [
      {
        id: 'sample-1',
        file: 'src/components/Chart.tsx',
        line: 45,
        type: 'mock-data',
        severity: 'high',
        category: 'data',
        description: 'モックデータが固定値として定義されています',
        codeSnippet: 'const mockData = [1, 2, 3, 4, 5];',
        suggestion: 'APIから動的にデータを取得するように変更してください',
        estimatedEffort: 'medium',
        impact: 'high',
        isFixed: false,
      },
      {
        id: 'sample-2',
        file: 'src/components/Header.tsx',
        line: 23,
        type: 'hardcoded-string',
        severity: 'medium',
        category: 'ui',
        description: 'アプリ名が固定値として定義されています',
        codeSnippet: '<h1>Work Time Tracker</h1>',
        suggestion: '国際化対応のため、翻訳リソースを使用してください',
        estimatedEffort: 'small',
        impact: 'medium',
        isFixed: false,
      },
      {
        id: 'sample-3',
        file: 'src/utils/random.ts',
        line: 12,
        type: 'random',
        severity: 'critical',
        category: 'performance',
        description: 'ランダム値が固定されていません',
        codeSnippet: 'Math.random() * 1000',
        suggestion: 'シード値を使用した決定論的な乱数生成器を使用してください',
        estimatedEffort: 'large',
        impact: 'high',
        isFixed: false,
      },
      {
        id: 'sample-4',
        file: 'src/config/themes.ts',
        line: 8,
        type: 'fixed-array',
        severity: 'medium',
        category: 'config',
        description: 'テーマ配列が固定値として定義されています',
        codeSnippet: 'const themes = ["light", "dark", "auto"];',
        suggestion: '設定ファイルまたはAPIから動的に読み込むようにしてください',
        estimatedEffort: 'medium',
        impact: 'medium',
        isFixed: false,
      },
      {
        id: 'sample-5',
        file: 'src/components/Pagination.tsx',
        line: 34,
        type: 'hardcoded-number',
        severity: 'low',
        category: 'logic',
        description: 'ページング数が固定値として定義されています',
        codeSnippet: 'itemsPerPage = 10',
        suggestion: 'ユーザー設定またはpropsから値を受け取るようにしてください',
        estimatedEffort: 'small',
        impact: 'low',
        isFixed: false,
      },
    ];

    const issuesByCategory = {
      data: 1,
      ui: 1,
      performance: 1,
      config: 1,
      logic: 1,
      api: 0,
    };

    const issuesByType = {
      'mock-data': 1,
      'hardcoded-string': 1,
      random: 1,
      'fixed-array': 1,
      'hardcoded-number': 1,
      'api-mock': 0,
    };

    const fileAnalysis: Record<string, HardcodedIssue[]> = {
      'src/components/Chart.tsx': [sampleIssues[0]],
      'src/components/Header.tsx': [sampleIssues[1]],
      'src/utils/random.ts': [sampleIssues[2]],
      'src/config/themes.ts': [sampleIssues[3]],
      'src/components/Pagination.tsx': [sampleIssues[4]],
    };

    const result: AnalysisResult = {
      totalIssues: sampleIssues.length,
      criticalIssues: 1,
      highPriorityIssues: 1,
      issuesByCategory,
      issuesByType,
      fileAnalysis,
      suggestions: [
        '🚨 モックデータの動的化を優先して実装してください',
        '🔤 固定文字列の国際化対応を検討してください',
        '⚙️ 設定値の外部化を進めてください',
      ],
      overallScore: 75,
    };

    console.log('✅ サンプル分析結果を作成しました');
    return result;
  }

  // ================================================================
  // 注意: 以下のメソッドはサーバーサイドAPIで実行されます
  // ブラウザ環境では `/api/analysis/hardcoded-data` を呼び出してください
  // ================================================================

  /**
   * 問題を修正済みとしてマーク
   */
  public markAsFixed(issueId: string): void {
    if (this.analysisCache) {
      Object.values(this.analysisCache.fileAnalysis).forEach((fileIssues) => {
        const issue = fileIssues.find((i) => i.id === issueId);
        if (issue) {
          issue.isFixed = true;
        }
      });
    }
  }

  /**
   * キャッシュをクリア
   */
  public clearCache(): void {
    this.analysisCache = null;
    this.lastAnalysisTime = 0;
  }
}

export const hardcodedDataAnalyzer = HardcodedDataAnalyzer.getInstance();
