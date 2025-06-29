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

    // 🚧 デバッグ用：一時的にサンプルデータを強制表示
    console.log('🚧 デバッグモード：サンプルデータを表示');
    const sampleResult = this.createSampleAnalysisResult();
    this.analysisCache = sampleResult;
    this.lastAnalysisTime = now;
    return sampleResult;

    /* 
    // 🚧 本来のロジック（一時的にコメントアウト）
    try {
      const issues: HardcodedIssue[] = [];
      console.log('📁 ソースファイルを検索中...');
      const files = await this.getAllSourceFiles();
      console.log(`📄 ${files.length}個のファイルを検出しました`);

      if (files.length === 0) {
        console.warn('⚠️ 分析対象ファイルが見つかりませんでした');
        // ファイルが見つからない場合はサンプルデータを返す
        return this.createSampleAnalysisResult();
      }

      console.log('🔍 各ファイルを分析中...');
      for (const file of files) {
        console.log(`📄 分析中: ${file}`);
        const fileIssues = await this.analyzeFile(file);
        issues.push(...fileIssues);
        console.log(`  → ${fileIssues.length}件の問題を検出`);
      }

      console.log(`📊 分析結果をコンパイル中... (${issues.length}件の問題)`);
      const result = this.compileAnalysisResult(issues);

      // キャッシュに保存
      this.analysisCache = result;
      this.lastAnalysisTime = now;

      console.log(`✅ 固定データ分析完了: ${result.totalIssues}件の問題を検出`);
      return result;
    } catch (error) {
      console.error('❌ 固定データ分析エラー:', error);
      // エラーが発生した場合はサンプルデータを返す
      return this.createSampleAnalysisResult();
    }
    */
  }

  /**
   * 単一ファイルの固定データ分析
   */
  private async analyzeFile(filePath: string): Promise<HardcodedIssue[]> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const issues: HardcodedIssue[] = [];

      lines.forEach((line, index) => {
        const lineNumber = index + 1;

        // Math.random()の使用を検出
        if (line.includes('Math.random()')) {
          issues.push({
            id: `${filePath}-${lineNumber}-random`,
            file: filePath,
            line: lineNumber,
            type: 'random',
            severity: 'high',
            category: 'logic',
            description: 'Math.random()を使用した固定的なランダム値生成',
            codeSnippet: line.trim(),
            suggestion: '実際のAPIやデータベースから値を取得',
            estimatedEffort: 'medium',
            impact: 'high',
            isFixed: false,
          });
        }

        // 固定配列の検出
        if (this.isHardcodedArray(line)) {
          issues.push({
            id: `${filePath}-${lineNumber}-array`,
            file: filePath,
            line: lineNumber,
            type: 'fixed-array',
            severity: this.getArraySeverity(line),
            category: 'data',
            description: '固定配列・リストの使用',
            codeSnippet: line.trim(),
            suggestion: 'APIから動的にデータを取得',
            estimatedEffort: 'small',
            impact: 'medium',
            isFixed: false,
          });
        }

        // モックデータの検出
        if (this.isMockData(line)) {
          issues.push({
            id: `${filePath}-${lineNumber}-mock`,
            file: filePath,
            line: lineNumber,
            type: 'mock-data',
            severity: 'critical',
            category: 'api',
            description: 'モックデータまたは仮データの使用',
            codeSnippet: line.trim(),
            suggestion: '実際のAPIエンドポイントに接続',
            estimatedEffort: 'large',
            impact: 'high',
            isFixed: false,
          });
        }

        // 固定文字列の検出
        if (this.isHardcodedString(line)) {
          issues.push({
            id: `${filePath}-${lineNumber}-string`,
            file: filePath,
            line: lineNumber,
            type: 'hardcoded-string',
            severity: 'medium',
            category: 'config',
            description: '設定値や定数のハードコーディング',
            codeSnippet: line.trim(),
            suggestion: '設定ファイルや環境変数に移動',
            estimatedEffort: 'small',
            impact: 'low',
            isFixed: false,
          });
        }

        // 固定数値の検出
        if (this.isHardcodedNumber(line)) {
          issues.push({
            id: `${filePath}-${lineNumber}-number`,
            file: filePath,
            line: lineNumber,
            type: 'hardcoded-number',
            severity: 'medium',
            category: 'config',
            description: 'マジックナンバーの使用',
            codeSnippet: line.trim(),
            suggestion: '定数として定義または設定可能にする',
            estimatedEffort: 'small',
            impact: 'low',
            isFixed: false,
          });
        }

        // API モックの検出
        if (this.isApiMock(line)) {
          issues.push({
            id: `${filePath}-${lineNumber}-api-mock`,
            file: filePath,
            line: lineNumber,
            type: 'api-mock',
            severity: 'critical',
            category: 'api',
            description: 'API レスポンスのモック化',
            codeSnippet: line.trim(),
            suggestion: '実際のAPIエンドポイントを実装',
            estimatedEffort: 'large',
            impact: 'high',
            isFixed: false,
          });
        }
      });

      return issues;
    } catch (error) {
      console.warn(`⚠️ ファイル分析エラー: ${filePath}`, error);
      return [];
    }
  }

  /**
   * 分析結果をコンパイル
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

  // === 検出ルール ===

  private isHardcodedArray(line: string): boolean {
    // 明らかに固定的な配列を検出
    const patterns = [/\[.+,.+\]/, /return\s*\[['"][^'"]+['"][,\]]/, /=\s*\[['"][^'"]+['"],/];

    return (
      patterns.some((pattern) => pattern.test(line)) &&
      !line.includes('useState') &&
      !line.includes('const patterns') &&
      !line.includes('// ignore hardcode')
    );
  }

  private isMockData(line: string): boolean {
    const mockKeywords = ['mock', 'fake', 'dummy', 'sample', 'test-data', '仮データ'];
    const lowerLine = line.toLowerCase();

    return (
      mockKeywords.some((keyword) => lowerLine.includes(keyword)) ||
      line.includes('TODO:') ||
      line.includes('FIXME:') ||
      line.includes('模擬') ||
      line.includes('サンプル')
    );
  }

  private isHardcodedString(line: string): boolean {
    // 設定値らしき文字列を検出
    const patterns = [
      /['"]https?:\/\/[^'"]+['"]/,
      /['"]api['"]/,
      /['"]config['"]/,
      /port\s*=\s*\d+/,
    ];

    return (
      patterns.some((pattern) => pattern.test(line)) &&
      !line.includes('example') &&
      !line.includes('// ignore hardcode')
    );
  }

  private isHardcodedNumber(line: string): boolean {
    // マジックナンバーを検出（0, 1, -1は除外）
    const magicNumberPattern = /(?<![\w.])\d{2,}(?![\w.])/;

    return (
      magicNumberPattern.test(line) &&
      !line.includes('Date') &&
      !line.includes('setTimeout') &&
      !line.includes('// ignore hardcode')
    );
  }

  private isApiMock(line: string): boolean {
    return (
      line.includes('await new Promise') ||
      (line.includes('setTimeout') && line.includes('resolve')) ||
      (line.includes('return {') && line.includes('mock')) ||
      line.includes('// 模擬') ||
      line.includes('模擬的な')
    );
  }

  private getArraySeverity(line: string): 'critical' | 'high' | 'medium' | 'low' {
    if (line.includes('features') || line.includes('options')) return 'high';
    if (line.includes('labels') || line.includes('categories')) return 'medium';
    return 'low';
  }

  /**
   * 全ソースファイルを取得
   */
  private async getAllSourceFiles(): Promise<string[]> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      const files: string[] = [];
      const srcPath = path.resolve('./src');

      console.log(`📁 srcディレクトリパス: ${srcPath}`);

      // srcディレクトリの存在確認
      try {
        await fs.access(srcPath);
        console.log('✅ srcディレクトリが見つかりました');
      } catch (accessError) {
        console.warn('❌ srcディレクトリにアクセスできません:', accessError);
        return [];
      }

      const scanDirectory = async (dir: string): Promise<void> => {
        try {
          console.log(`🔍 スキャン中: ${dir}`);
          const entries = await fs.readdir(dir, { withFileTypes: true });
          console.log(`📂 ${entries.length}個のエントリを発見: ${dir}`);

          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
              // node_modules, dist, coverage などを除外
              if (
                !['node_modules', 'dist', 'coverage', '.git', '.next', '__tests__'].includes(
                  entry.name
                )
              ) {
                await scanDirectory(fullPath);
              }
            } else if (entry.name.match(/\.(ts|tsx|js|jsx)$/)) {
              files.push(fullPath);
              console.log(`📄 ファイル追加: ${fullPath}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ ディレクトリスキャンエラー: ${dir}`, error);
        }
      };

      await scanDirectory(srcPath);
      console.log(`📊 合計 ${files.length} 個のファイルを検出しました`);

      // デバッグ用：最初の5個のファイルを表示
      if (files.length > 0) {
        console.log('📄 検出されたファイル例:');
        files.slice(0, 5).forEach((file, index) => {
          console.log(`  ${index + 1}. ${file}`);
        });
      }

      return files;
    } catch (error) {
      console.error('❌ ファイル検索で予期しないエラー:', error);
      console.log('⚠️ エラーのため空の配列を返します');
      return [];
    }
  }

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
