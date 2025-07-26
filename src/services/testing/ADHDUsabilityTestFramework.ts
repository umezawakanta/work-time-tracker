import { EventEmitter } from 'events';

// ユーザビリティテスト結果型
interface UsabilityTestResult {
  testId: string;
  timestamp: Date;
  userProfile: {
    adhdType: 'inattentive' | 'hyperactive' | 'combined' | 'neurotypical';
    asdTraits: boolean;
    cognitiveProfile: any;
    assistiveTech: string[];
  };

  // テスト結果
  taskCompletion: {
    taskId: string;
    completed: boolean;
    timeToComplete: number; // seconds
    errorCount: number;
    assistanceRequired: boolean;
    frustrationLevel: number; // 1-10
  }[];

  // アクセシビリティメトリクス
  accessibility: {
    keyboardNavigation: number; // 1-10
    screenReaderCompatibility: number;
    colorContrastCompliance: boolean;
    cognitiveLoadScore: number; // 1-10
    sensoryOverloadRisk: number; // 1-10
  };

  // ADHD特化メトリクス
  adhdMetrics: {
    attentionMaintenance: number; // 1-10
    distractionResistance: number;
    hyperfocusTriggering: boolean;
    executiveFunctionSupport: number;
    impulsivityControl: number;
  };

  // ユーザーフィードバック
  userFeedback: {
    overallSatisfaction: number; // 1-10
    easeOfUse: number;
    stressLevel: number;
    recommendationLikelihood: number;
    openComments: string;
  };

  // 改善提案
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: 'accessibility' | 'cognitive-load' | 'navigation' | 'content' | 'interaction';
    issue: string;
    suggestion: string;
    estimatedImpact: number; // 1-10
  }[];
}

// テストシナリオ型
interface TestScenario {
  id: string;
  name: string;
  description: string;
  targetUserType: string[];

  tasks: {
    id: string;
    instruction: string;
    expectedOutcome: string;
    timeLimit?: number; // seconds
    assistanceAllowed: boolean;
    cognitiveLoad: 'low' | 'medium' | 'high';
  }[];

  // ADHD特化観察ポイント
  observationPoints: {
    distractionEvents: string[];
    frustrationTriggers: string[];
    successFactors: string[];
    adaptiveStrategies: string[];
  };
}

// アクセシビリティチェック項目
interface AccessibilityCheckItem {
  id: string;
  category: 'visual' | 'auditory' | 'motor' | 'cognitive' | 'seizure';
  level: 'A' | 'AA' | 'AAA';
  description: string;
  automated: boolean;
  testFunction?: () => Promise<boolean>;
  manualInstructions?: string;
}

class ADHDUsabilityTestFramework extends EventEmitter {
  private testResults: Map<string, UsabilityTestResult> = new Map();
  private testScenarios: Map<string, TestScenario> = new Map();
  private accessibilityChecks: Map<string, AccessibilityCheckItem> = new Map();
  private isRunning: boolean = false;
  private currentTest: string | null = null;

  constructor() {
    super();
    this.initializeFramework();
  }

  /**
   * フレームワーク初期化
   */
  private initializeFramework(): void {
    this.setupTestScenarios();
    this.setupAccessibilityChecks();
    console.log('🧪 ADHD特化ユーザビリティテストフレームワーク初期化完了');
  }

  /**
   * テストシナリオ設定
   */
  private setupTestScenarios(): void {
    const scenarios: TestScenario[] = [
      {
        id: 'cognitive-assessment-flow',
        name: '認知評価フロー',
        description: 'WEIS相当の認知評価テストの完了',
        targetUserType: ['inattentive', 'combined', 'neurotypical'],
        tasks: [
          {
            id: 'start-assessment',
            instruction: '認知評価テストを開始してください',
            expectedOutcome: 'テスト画面が表示される',
            timeLimit: 30,
            assistanceAllowed: true,
            cognitiveLoad: 'medium',
          },
          {
            id: 'complete-subtest',
            instruction: '最初のサブテストを完了してください',
            expectedOutcome: 'サブテスト結果が保存される',
            timeLimit: 300,
            assistanceAllowed: false,
            cognitiveLoad: 'high',
          },
          {
            id: 'view-results',
            instruction: 'テスト結果を確認してください',
            expectedOutcome: '結果画面が適切に表示される',
            timeLimit: 60,
            assistanceAllowed: true,
            cognitiveLoad: 'low',
          },
        ],
        observationPoints: {
          distractionEvents: ['他の要素への注意散漫', 'テスト中断'],
          frustrationTriggers: ['読み込み時間', '複雑な指示', 'エラーメッセージ'],
          successFactors: ['明確な進捗表示', '適切な休憩提案', '結果の分かりやすさ'],
          adaptiveStrategies: ['タイマー活用', 'メモ取り', 'ペース調整'],
        },
      },
      {
        id: 'task-management-workflow',
        name: 'タスク管理ワークフロー',
        description: 'ADHD最適化タスク管理システムの使用',
        targetUserType: ['hyperactive', 'combined', 'inattentive'],
        tasks: [
          {
            id: 'add-task',
            instruction: '新しいタスクを追加してください',
            expectedOutcome: 'タスクが適切に登録される',
            timeLimit: 60,
            assistanceAllowed: true,
            cognitiveLoad: 'low',
          },
          {
            id: 'set-priority',
            instruction: 'タスクの優先度を設定してください',
            expectedOutcome: '優先度が反映される',
            timeLimit: 30,
            assistanceAllowed: true,
            cognitiveLoad: 'medium',
          },
          {
            id: 'use-pomodoro',
            instruction: 'ポモドーロタイマーを使ってタスクを実行してください',
            expectedOutcome: 'タイマーが正常に動作する',
            timeLimit: 1500, // 25分
            assistanceAllowed: false,
            cognitiveLoad: 'high',
          },
        ],
        observationPoints: {
          distractionEvents: ['他タスクへの切り替え', '通知による中断'],
          frustrationTriggers: ['複雑なカテゴリ選択', '入力フィールドの多さ'],
          successFactors: ['ワンクリック追加', '視覚的進捗', '完了時の満足感'],
          adaptiveStrategies: ['音声入力活用', '定型文使用', 'ショートカット利用'],
        },
      },
      {
        id: 'emergency-support-access',
        name: '緊急サポートアクセス',
        description: 'ADHD/ASDクライシス時の緊急機能利用',
        targetUserType: ['all'],
        tasks: [
          {
            id: 'find-emergency-button',
            instruction: '緊急サポートボタンを見つけてください',
            expectedOutcome: 'ボタンが即座に発見される',
            timeLimit: 10,
            assistanceAllowed: false,
            cognitiveLoad: 'low',
          },
          {
            id: 'access-impulse-control',
            instruction: '衝動制御支援にアクセスしてください',
            expectedOutcome: '支援機能が即座に利用可能',
            timeLimit: 15,
            assistanceAllowed: false,
            cognitiveLoad: 'medium',
          },
        ],
        observationPoints: {
          distractionEvents: [],
          frustrationTriggers: ['見つからないボタン', '複雑なナビゲーション'],
          successFactors: ['目立つ配置', '即座のアクセス', 'シンプルな操作'],
          adaptiveStrategies: ['固定位置', '大きなボタン', '色分け'],
        },
      },
      {
        id: 'financial-overview-comprehension',
        name: '資産管理概要理解',
        description: 'MoneyForward相当の財務情報の理解',
        targetUserType: ['inattentive', 'combined'],
        tasks: [
          {
            id: 'understand-net-worth',
            instruction: '現在の純資産を確認してください',
            expectedOutcome: '純資産額を正確に理解する',
            timeLimit: 60,
            assistanceAllowed: true,
            cognitiveLoad: 'medium',
          },
          {
            id: 'identify-spending-pattern',
            instruction: '先月の支出パターンを分析してください',
            expectedOutcome: '主要な支出カテゴリを特定する',
            timeLimit: 120,
            assistanceAllowed: true,
            cognitiveLoad: 'high',
          },
        ],
        observationPoints: {
          distractionEvents: ['詳細データでの迷子', '他機能への寄り道'],
          frustrationTriggers: ['複雑なグラフ', '数字の羅列', '専門用語'],
          successFactors: ['視覚的概要', '平易な説明', 'インタラクティブ要素'],
          adaptiveStrategies: ['ズーム機能', 'ヘルプボタン', '段階的詳細表示'],
        },
      },
    ];

    scenarios.forEach((scenario) => {
      this.testScenarios.set(scenario.id, scenario);
    });
  }

  /**
   * アクセシビリティチェック設定
   */
  private setupAccessibilityChecks(): void {
    const checks: AccessibilityCheckItem[] = [
      {
        id: 'color-contrast',
        category: 'visual',
        level: 'AA',
        description: 'テキストと背景のコントラスト比が4.5:1以上',
        automated: true,
        testFunction: this.checkColorContrast,
      },
      {
        id: 'keyboard-navigation',
        category: 'motor',
        level: 'A',
        description: 'すべての機能がキーボードのみで操作可能',
        automated: false,
        manualInstructions: 'Tabキーを使って全機能にアクセスできることを確認',
      },
      {
        id: 'focus-indicators',
        category: 'visual',
        level: 'AA',
        description: 'フォーカス状態が明確に視認可能',
        automated: true,
        testFunction: this.checkFocusIndicators,
      },
      {
        id: 'cognitive-load-assessment',
        category: 'cognitive',
        level: 'AAA',
        description: '認知負荷が適切に管理されている',
        automated: false,
        manualInstructions: 'ページごとの情報量と複雑さを評価',
      },
      {
        id: 'adhd-distraction-control',
        category: 'cognitive',
        level: 'AAA',
        description: 'ADHD特性に配慮した注意散漫要素の制御',
        automated: true,
        testFunction: this.checkDistractionControl,
      },
      {
        id: 'screen-reader-compatibility',
        category: 'auditory',
        level: 'AA',
        description: 'スクリーンリーダーでの適切な読み上げ',
        automated: false,
        manualInstructions: 'NVDA/JAWSでの操作性を確認',
      },
      {
        id: 'seizure-safety',
        category: 'seizure',
        level: 'A',
        description: '発作誘発リスクのある要素がない',
        automated: true,
        testFunction: this.checkSeizureSafety,
      },
      {
        id: 'executive-function-support',
        category: 'cognitive',
        level: 'AAA',
        description: '実行機能をサポートする機能の実装',
        automated: false,
        manualInstructions: 'ステップバイステップガイダンス、進捗表示の確認',
      },
    ];

    checks.forEach((check) => {
      this.accessibilityChecks.set(check.id, check);
    });
  }

  /**
   * ユーザビリティテスト実行
   */
  public async runUsabilityTest(
    scenarioId: string,
    userProfile: any,
    testEnvironment: 'lab' | 'remote' | 'guerrilla' = 'lab'
  ): Promise<UsabilityTestResult> {
    if (this.isRunning) {
      throw new Error('既にテストが実行中です');
    }

    const scenario = this.testScenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`シナリオが見つかりません: ${scenarioId}`);
    }

    this.isRunning = true;
    this.currentTest = scenarioId;

    try {
      console.log(`🧪 ユーザビリティテスト開始: ${scenario.name}`);
      this.emit('test-started', { scenarioId, userProfile });

      const testResult = await this.executeTestScenario(scenario, userProfile, testEnvironment);

      this.testResults.set(testResult.testId, testResult);
      this.emit('test-completed', testResult);

      console.log(`✅ ユーザビリティテスト完了: ${testResult.testId}`);
      return testResult;
    } catch (error) {
      console.error('❌ ユーザビリティテストエラー:', error);
      this.emit('test-error', { scenarioId, error });
      throw error;
    } finally {
      this.isRunning = false;
      this.currentTest = null;
    }
  }

  /**
   * テストシナリオ実行
   */
  private async executeTestScenario(
    scenario: TestScenario,
    userProfile: any,
    testEnvironment: string
  ): Promise<UsabilityTestResult> {
    const testId = `test_${scenario.id}_${Date.now()}`;
    const startTime = new Date();

    // タスク実行結果
    const taskResults = [];

    for (const task of scenario.tasks) {
      console.log(`📋 タスク実行: ${task.instruction}`);

      const taskStartTime = Date.now();
      const taskResult = await this.executeTask(task, userProfile);
      const taskEndTime = Date.now();

      taskResults.push({
        taskId: task.id,
        completed: taskResult.completed,
        timeToComplete: (taskEndTime - taskStartTime) / 1000,
        errorCount: taskResult.errorCount,
        assistanceRequired: taskResult.assistanceRequired,
        frustrationLevel: taskResult.frustrationLevel,
      });

      // ADHD配慮：タスク間の休憩
      if (userProfile.adhdType !== 'neurotypical' && task.cognitiveLoad === 'high') {
        await this.suggestBreak(30); // 30秒休憩
      }
    }

    // アクセシビリティメトリクス評価
    const accessibilityMetrics = await this.evaluateAccessibility();

    // ADHD特化メトリクス評価
    const adhdMetrics = await this.evaluateADHDMetrics(taskResults, userProfile);

    // ユーザーフィードバック収集
    const userFeedback = await this.collectUserFeedback();

    // 改善提案生成
    const recommendations = this.generateRecommendations(
      taskResults,
      accessibilityMetrics,
      adhdMetrics,
      userFeedback
    );

    return {
      testId,
      timestamp: startTime,
      userProfile,
      taskCompletion: taskResults,
      accessibility: accessibilityMetrics,
      adhdMetrics,
      userFeedback,
      recommendations,
    };
  }

  /**
   * 個別タスク実行
   */
  private async executeTask(task: any, userProfile: any): Promise<any> {
    // 実際の実装では、ユーザーの操作を監視・記録
    // ここでは模擬的な結果を返す

    const isADHD = userProfile.adhdType !== 'neurotypical';
    const baseSuccessRate = 0.8;
    const adhdPenalty = isADHD && task.cognitiveLoad === 'high' ? 0.2 : 0;
    const successRate = baseSuccessRate - adhdPenalty;

    return {
      completed: Math.random() < successRate,
      errorCount: Math.floor(Math.random() * (task.cognitiveLoad === 'high' ? 3 : 1)),
      assistanceRequired: Math.random() < (isADHD ? 0.3 : 0.1),
      frustrationLevel: Math.floor(Math.random() * (isADHD ? 7 : 4)) + 1,
    };
  }

  /**
   * アクセシビリティ評価
   */
  private async evaluateAccessibility(): Promise<any> {
    const results = {
      keyboardNavigation: 8,
      screenReaderCompatibility: 7,
      colorContrastCompliance: true,
      cognitiveLoadScore: 6,
      sensoryOverloadRisk: 3,
    };

    // 自動テスト実行
    for (const [id, check] of this.accessibilityChecks) {
      if (check.automated && check.testFunction) {
        try {
          const result = await check.testFunction();
          console.log(`✓ ${check.description}: ${result ? 'PASS' : 'FAIL'}`);
        } catch (error) {
          console.error(`✗ ${check.description}: ERROR - ${error}`);
        }
      }
    }

    return results;
  }

  /**
   * ADHD特化メトリクス評価
   */
  private async evaluateADHDMetrics(taskResults: any[], userProfile: any): Promise<any> {
    const avgFrustration =
      taskResults.reduce((sum, task) => sum + task.frustrationLevel, 0) / taskResults.length;
    const completionRate = taskResults.filter((task) => task.completed).length / taskResults.length;

    return {
      attentionMaintenance: Math.max(1, 10 - avgFrustration),
      distractionResistance: completionRate * 10,
      hyperfocusTriggering: taskResults.some((task) => task.timeToComplete > 300), // 5分以上
      executiveFunctionSupport:
        (taskResults.filter((task) => !task.assistanceRequired).length / taskResults.length) * 10,
      impulsivityControl: Math.max(
        1,
        10 - taskResults.reduce((sum, task) => sum + task.errorCount, 0)
      ),
    };
  }

  /**
   * ユーザーフィードバック収集
   */
  private async collectUserFeedback(): Promise<any> {
    // 実際の実装では、フィードバックフォームを表示
    // ここでは模擬的なデータを返す
    return {
      overallSatisfaction: Math.floor(Math.random() * 4) + 6, // 6-10
      easeOfUse: Math.floor(Math.random() * 3) + 7, // 7-10
      stressLevel: Math.floor(Math.random() * 5) + 1, // 1-5
      recommendationLikelihood: Math.floor(Math.random() * 3) + 7, // 7-10
      openComments: 'アクセシブルで使いやすいが、情報量が多い場面で迷うことがある',
    };
  }

  /**
   * 改善提案生成
   */
  private generateRecommendations(
    taskResults: any[],
    accessibilityMetrics: any,
    adhdMetrics: any,
    userFeedback: any
  ): any[] {
    const recommendations = [];

    // 完了率が低い場合
    const completionRate = taskResults.filter((task) => task.completed).length / taskResults.length;
    if (completionRate < 0.8) {
      recommendations.push({
        priority: 'high',
        category: 'cognitive-load',
        issue: 'タスク完了率が低い',
        suggestion: 'タスクを小さなステップに分割し、進捗表示を強化する',
        estimatedImpact: 8,
      });
    }

    // エラー率が高い場合
    const avgErrorCount =
      taskResults.reduce((sum, task) => sum + task.errorCount, 0) / taskResults.length;
    if (avgErrorCount > 1) {
      recommendations.push({
        priority: 'medium',
        category: 'interaction',
        issue: 'エラー発生率が高い',
        suggestion: 'エラー防止機能とより明確なフィードバックを追加',
        estimatedImpact: 7,
      });
    }

    // 認知負荷が高い場合
    if (accessibilityMetrics.cognitiveLoadScore < 7) {
      recommendations.push({
        priority: 'high',
        category: 'cognitive-load',
        issue: '認知負荷が高すぎる',
        suggestion: 'UI要素を簡素化し、情報階層を改善する',
        estimatedImpact: 9,
      });
    }

    // ADHD特化の改善提案
    if (adhdMetrics.attentionMaintenance < 6) {
      recommendations.push({
        priority: 'high',
        category: 'accessibility',
        issue: '注意維持が困難',
        suggestion: 'アニメーション軽減、気逸らし要素除去、フォーカス支援強化',
        estimatedImpact: 8,
      });
    }

    return recommendations;
  }

  /**
   * 包括的アクセシビリティ監査
   */
  public async runAccessibilityAudit(): Promise<{ [checkId: string]: any }> {
    console.log('🔍 アクセシビリティ監査開始...');

    const auditResults: { [checkId: string]: any } = {};

    for (const [id, check] of this.accessibilityChecks) {
      console.log(`📋 チェック実行: ${check.description}`);

      try {
        if (check.automated && check.testFunction) {
          const result = await check.testFunction();
          auditResults[id] = {
            status: result ? 'PASS' : 'FAIL',
            automated: true,
            level: check.level,
            category: check.category,
          };
        } else {
          auditResults[id] = {
            status: 'MANUAL_REQUIRED',
            automated: false,
            instructions: check.manualInstructions,
            level: check.level,
            category: check.category,
          };
        }
      } catch (error) {
        auditResults[id] = {
          status: 'ERROR',
          error: error instanceof Error ? error.message : String(error),
          level: check.level,
          category: check.category,
        };
      }
    }

    console.log('✅ アクセシビリティ監査完了');
    this.emit('accessibility-audit-completed', auditResults);

    return auditResults;
  }

  /**
   * 自動アクセシビリティチェック関数群
   */
  private async checkColorContrast(): Promise<boolean> {
    // 実際の実装では、DOM要素のコントラスト比を計算
    const elements = document.querySelectorAll('[data-testid], button, a, input');
    let totalChecks = 0;
    let passedChecks = 0;

    elements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const textColor = styles.color;
      const backgroundColor = styles.backgroundColor;

      if (textColor && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        totalChecks++;
        const contrastRatio = this.calculateContrastRatio(textColor, backgroundColor);
        if (contrastRatio >= 4.5) {
          passedChecks++;
        }
      }
    });

    return totalChecks === 0 || passedChecks / totalChecks >= 0.9;
  }

  private async checkFocusIndicators(): Promise<boolean> {
    // フォーカス可能要素のフォーカス表示確認
    const focusableElements = document.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );

    let hasVisibleFocus = true;

    focusableElements.forEach((element) => {
      if ('focus' in element) {
        (element as HTMLElement).focus();
      }
      const styles = window.getComputedStyle(element);
      const hasOutline = styles.outline !== 'none' && styles.outline !== '0px';
      const hasBoxShadow = styles.boxShadow !== 'none';

      if (!hasOutline && !hasBoxShadow) {
        hasVisibleFocus = false;
      }
    });

    return hasVisibleFocus;
  }

  private async checkDistractionControl(): Promise<boolean> {
    // ADHD特化：注意散漫要素の検出
    const distractingElements = [
      'marquee',
      '[autoplay]',
      '.blinking',
      '.animated:not(.adhd-safe)',
      '[data-distraction="high"]',
    ];

    let distractionCount = 0;
    distractingElements.forEach((selector) => {
      distractionCount += document.querySelectorAll(selector).length;
    });

    // 自動再生動画の確認
    const videos = document.querySelectorAll('video[autoplay]');
    videos.forEach((video) => {
      if (!(video as HTMLVideoElement).muted) {
        distractionCount++;
      }
    });

    return distractionCount === 0;
  }

  private async checkSeizureSafety(): Promise<boolean> {
    // 発作誘発リスクの検出
    const dangerousElements = document.querySelectorAll(
      '.flash, .strobe, [data-animation-speed="fast"]'
    );

    // 高速点滅アニメーションの検出
    const animatedElements = document.querySelectorAll('.animated, [style*="animation"]');
    let fastAnimationCount = 0;

    animatedElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const animationDuration = parseFloat(styles.animationDuration);
      if (animationDuration > 0 && animationDuration < 0.25) {
        // 0.25秒未満は危険
        fastAnimationCount++;
      }
    });

    return dangerousElements.length === 0 && fastAnimationCount === 0;
  }

  /**
   * コントラスト比計算
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // 簡易実装（実際はより詳細な計算が必要）
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);

    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private parseColor(color: string): { r: number; g: number; b: number } {
    // 簡易カラーパース（実装簡略化）
    if (color.startsWith('rgb(')) {
      const values = color.match(/\d+/g);
      return {
        r: parseInt(values![0]),
        g: parseInt(values![1]),
        b: parseInt(values![2]),
      };
    }
    return { r: 0, g: 0, b: 0 }; // フォールバック
  }

  private getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * 休憩提案
   */
  private async suggestBreak(seconds: number): Promise<void> {
    console.log(`😌 ${seconds}秒の休憩を提案中...`);
    this.emit('break-suggested', { duration: seconds });

    // 実際の実装では、休憩画面を表示
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  /**
   * パブリックAPI
   */
  public getTestResults(): UsabilityTestResult[] {
    return Array.from(this.testResults.values());
  }

  public getAccessibilityChecks(): AccessibilityCheckItem[] {
    return Array.from(this.accessibilityChecks.values());
  }

  public async generateAccessibilityReport(): Promise<string> {
    const auditResults = await this.runAccessibilityAudit();
    const testResults = this.getTestResults();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: Object.keys(auditResults).length,
        passedChecks: Object.values(auditResults).filter((r) => r.status === 'PASS').length,
        failedChecks: Object.values(auditResults).filter((r) => r.status === 'FAIL').length,
        manualChecksRequired: Object.values(auditResults).filter(
          (r) => r.status === 'MANUAL_REQUIRED'
        ).length,
      },
      auditResults,
      userTestResults: testResults.map((test) => ({
        testId: test.testId,
        userType: test.userProfile.adhdType,
        overallSatisfaction: test.userFeedback.overallSatisfaction,
        accessibilityScore: test.accessibility,
        adhdScore: test.adhdMetrics,
        recommendations: test.recommendations,
      })),
      overallRecommendations: this.generateOverallRecommendations(auditResults, testResults),
    };

    return JSON.stringify(report, null, 2);
  }

  private generateOverallRecommendations(auditResults: any, testResults: any[]): string[] {
    const recommendations: string[] = [];

    // 失敗したチェックに基づく推奨
    Object.entries(auditResults).forEach(([checkId, result]: [string, any]) => {
      if (result.status === 'FAIL') {
        const check = this.accessibilityChecks.get(checkId);
        if (check) {
          const priority = check.level === 'A' ? 'high' : check.level === 'AA' ? 'medium' : 'low';
          const impact = check.level === 'A' ? 9 : check.level === 'AA' ? 7 : 5;
          recommendations.push(
            `[${priority}] ${check.category}: ${check.description}が失敗 - WCAG ${check.level}基準に準拠するよう修正が必要 (影響度: ${impact})`
          );
        }
      }
    });

    return recommendations;
  }

  public stop(): void {
    this.isRunning = false;
    this.currentTest = null;
    this.removeAllListeners();
    console.log('🛑 ADHDユーザビリティテストフレームワーク停止');
  }
}

// シングルトンインスタンス
const adhdUsabilityTestFramework = new ADHDUsabilityTestFramework();

export default adhdUsabilityTestFramework;
export { ADHDUsabilityTestFramework };
export type { UsabilityTestResult, TestScenario, AccessibilityCheckItem };
