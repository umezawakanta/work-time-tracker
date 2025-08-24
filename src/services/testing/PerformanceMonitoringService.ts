/**
 * 🚀 高度パフォーマンス監視サービス
 * Lighthouse自動監視・リアルタイム性能分析・最適化提案システム
 */

import { EventEmitter } from 'eventemitter3';

export interface PerformanceMetrics {
  id: string;
  timestamp: Date;
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    tbt: number; // Total Blocking Time
    si: number; // Speed Index
  };
  resourceSizes: {
    total: number;
    scripts: number;
    stylesheets: number;
    images: number;
    fonts: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    savings: number; // ミリ秒
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'error';
  }>;
}

export interface PerformanceTrend {
  period: 'hour' | 'day' | 'week' | 'month';
  data: Array<{
    timestamp: Date;
    avgPerformance: number;
    avgAccessibility: number;
    avgBestPractices: number;
    avgSEO: number;
    avgFCP: number;
    avgLCP: number;
    avgCLS: number;
  }>;
}

export interface PerformanceAlert {
  id: string;
  timestamp: Date;
  severity: 'warning' | 'critical';
  metric: string;
  currentValue: number;
  threshold: number;
  url: string;
  description: string;
  suggestions: string[];
}

export interface PerformanceBudget {
  id: string;
  name: string;
  metrics: {
    [key: string]: {
      budget: number;
      current?: number;
      status: 'passed' | 'warning' | 'failed';
    };
  };
  resources: {
    [key: string]: {
      budget: number; // KB
      current?: number;
      status: 'passed' | 'warning' | 'failed';
    };
  };
}

export interface OptimizationSuggestion {
  id: string;
  category: 'images' | 'css' | 'javascript' | 'fonts' | 'network' | 'rendering';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implementation: string;
  estimatedImprovement: {
    performanceScore: number;
    loadTime: number; // ミリ秒
  };
}

class PerformanceMonitoringService extends EventEmitter {
  private static instance: PerformanceMonitoringService | null = null;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private budgets: PerformanceBudget[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.initializeBudgets();
    this.startRealTimeMonitoring();
    console.log('🚀 Performance Monitoring Service initialized');
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * パフォーマンス予算の初期化
   */
  private initializeBudgets(): void {
    this.budgets = [
      {
        id: 'core-pages-budget',
        name: 'コアページパフォーマンス予算',
        metrics: {
          performance: { budget: 85, status: 'passed' },
          accessibility: { budget: 95, status: 'passed' },
          bestPractices: { budget: 90, status: 'passed' },
          seo: { budget: 85, status: 'passed' },
          fcp: { budget: 2000, status: 'passed' },
          lcp: { budget: 2500, status: 'passed' },
          cls: { budget: 0.1, status: 'passed' },
          fid: { budget: 100, status: 'passed' },
          tbt: { budget: 300, status: 'passed' },
        },
        resources: {
          total: { budget: 1000, status: 'passed' },
          scripts: { budget: 300, status: 'passed' },
          stylesheets: { budget: 100, status: 'passed' },
          images: { budget: 500, status: 'passed' },
          fonts: { budget: 100, status: 'passed' },
        },
      },
      {
        id: 'adhd-features-budget',
        name: 'ADHD特化機能パフォーマンス予算',
        metrics: {
          performance: { budget: 80, status: 'passed' },
          accessibility: { budget: 98, status: 'passed' }, // より高い基準
          bestPractices: { budget: 90, status: 'passed' },
          seo: { budget: 80, status: 'passed' },
          fcp: { budget: 1800, status: 'passed' }, // より厳しい基準
          lcp: { budget: 2200, status: 'passed' },
          cls: { budget: 0.05, status: 'passed' }, // ADHD配慮でより厳しく
          fid: { budget: 80, status: 'passed' },
          tbt: { budget: 250, status: 'passed' },
        },
        resources: {
          total: { budget: 800, status: 'passed' },
          scripts: { budget: 250, status: 'passed' },
          stylesheets: { budget: 80, status: 'passed' },
          images: { budget: 400, status: 'passed' },
          fonts: { budget: 70, status: 'passed' },
        },
      },
    ];
  }

  /**
   * リアルタイム監視開始
   */
  private startRealTimeMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // 30分ごとに自動監視
    this.monitoringInterval = setInterval(
      () => {
        this.runAutomatedLighthouseTests();
      },
      30 * 60 * 1000
    );

    // 初回実行
    setTimeout(() => {
      this.runAutomatedLighthouseTests();
    }, 5000);

    console.log('📊 リアルタイム性能監視を開始しました');
  }

  /**
   * 自動Lighthouseテスト実行
   */
  private async runAutomatedLighthouseTests(): Promise<void> {
    const urls = [
      'http://localhost:3002',
      'http://localhost:3002/adhd-task-manager',
      'http://localhost:3002/integrated-dashboard',
      'http://localhost:3002/improvement-plan',
      'http://localhost:3002/blog',
    ];

    for (const url of urls) {
      try {
        await this.runLighthouseTest(url);
      } catch (error) {
        console.error(`Lighthouse test failed for ${url}:`, error);
      }
    }
  }

  /**
   * Lighthouseテスト実行
   */
  private async runLighthouseTest(url: string): Promise<PerformanceMetrics> {
    // 実際の実装ではlighthouse APIを使用
    // ここではモックデータを生成
    const mockMetrics: PerformanceMetrics = {
      id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      url,
      scores: {
        performance: 85 + Math.random() * 15,
        accessibility: 90 + Math.random() * 10,
        bestPractices: 88 + Math.random() * 12,
        seo: 82 + Math.random() * 18,
      },
      coreWebVitals: {
        fcp: 1500 + Math.random() * 1000,
        lcp: 2000 + Math.random() * 1500,
        fid: 50 + Math.random() * 100,
        cls: 0.05 + Math.random() * 0.1,
        tbt: 200 + Math.random() * 200,
        si: 2500 + Math.random() * 1000,
      },
      resourceSizes: {
        total: 800 + Math.random() * 400,
        scripts: 250 + Math.random() * 150,
        stylesheets: 80 + Math.random() * 50,
        images: 400 + Math.random() * 200,
        fonts: 70 + Math.random() * 50,
      },
      opportunities: [
        {
          id: 'unused-css',
          title: '未使用CSSの削除',
          description: '使用されていないCSSルールを削除してバンドルサイズを削減',
          impact: 'medium',
          savings: 150 + Math.random() * 300,
        },
        {
          id: 'image-optimization',
          title: '画像最適化',
          description: '次世代形式（WebP、AVIF）への変換で転送量削減',
          impact: 'high',
          savings: 300 + Math.random() * 500,
        },
      ],
      diagnostics: [
        {
          id: 'render-blocking',
          title: 'レンダリング阻害リソース',
          description: 'クリティカルパス上のCSS/JSを最適化',
          severity: 'warning',
        },
      ],
    };

    this.metrics.push(mockMetrics);
    this.updateBudgetStatus(mockMetrics);
    this.checkPerformanceAlerts(mockMetrics);

    this.emit('metricsUpdated', mockMetrics);
    console.log(`📊 Performance metrics collected for ${url}`);

    return mockMetrics;
  }

  /**
   * パフォーマンス予算ステータス更新
   */
  private updateBudgetStatus(metrics: PerformanceMetrics): void {
    this.budgets.forEach((budget) => {
      // スコア予算チェック
      Object.keys(budget.metrics).forEach((key) => {
        const budgetItem = budget.metrics[key];
        let currentValue: number = 0;

        switch (key) {
          case 'performance':
            currentValue = metrics.scores.performance;
            break;
          case 'accessibility':
            currentValue = metrics.scores.accessibility;
            break;
          case 'bestPractices':
            currentValue = metrics.scores.bestPractices;
            break;
          case 'seo':
            currentValue = metrics.scores.seo;
            break;
          case 'fcp':
            currentValue = metrics.coreWebVitals.fcp;
            break;
          case 'lcp':
            currentValue = metrics.coreWebVitals.lcp;
            break;
          case 'cls':
            currentValue = metrics.coreWebVitals.cls;
            break;
          case 'fid':
            currentValue = metrics.coreWebVitals.fid;
            break;
          case 'tbt':
            currentValue = metrics.coreWebVitals.tbt;
            break;
        }

        budgetItem.current = currentValue;

        if (['fcp', 'lcp', 'cls', 'fid', 'tbt'].includes(key)) {
          // 小さい値が良い指標
          if (currentValue <= budgetItem.budget) {
            budgetItem.status = 'passed';
          } else if (currentValue <= budgetItem.budget * 1.2) {
            budgetItem.status = 'warning';
          } else {
            budgetItem.status = 'failed';
          }
        } else {
          // 大きい値が良い指標
          if (currentValue >= budgetItem.budget) {
            budgetItem.status = 'passed';
          } else if (currentValue >= budgetItem.budget * 0.9) {
            budgetItem.status = 'warning';
          } else {
            budgetItem.status = 'failed';
          }
        }
      });

      // リソースサイズ予算チェック
      Object.keys(budget.resources).forEach((key) => {
        const resourceItem = budget.resources[key];
        let currentSize: number = 0;

        switch (key) {
          case 'total':
            currentSize = metrics.resourceSizes.total;
            break;
          case 'scripts':
            currentSize = metrics.resourceSizes.scripts;
            break;
          case 'stylesheets':
            currentSize = metrics.resourceSizes.stylesheets;
            break;
          case 'images':
            currentSize = metrics.resourceSizes.images;
            break;
          case 'fonts':
            currentSize = metrics.resourceSizes.fonts;
            break;
        }

        resourceItem.current = currentSize;

        if (currentSize <= resourceItem.budget) {
          resourceItem.status = 'passed';
        } else if (currentSize <= resourceItem.budget * 1.2) {
          resourceItem.status = 'warning';
        } else {
          resourceItem.status = 'failed';
        }
      });
    });

    this.emit('budgetUpdated', this.budgets);
  }

  /**
   * パフォーマンスアラートチェック
   */
  private checkPerformanceAlerts(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];

    // パフォーマンススコアアラート
    if (metrics.scores.performance < 70) {
      alerts.push({
        id: `alert-${Date.now()}-performance`,
        timestamp: new Date(),
        severity: 'critical',
        metric: 'Performance Score',
        currentValue: metrics.scores.performance,
        threshold: 70,
        url: metrics.url,
        description: 'パフォーマンススコアが大幅に低下しています',
        suggestions: [
          '画像の最適化を実施',
          '未使用のJavaScriptの削除',
          'レンダリング阻害リソースの最適化',
          'コードスプリッティングの実装',
        ],
      });
    }

    // Core Web Vitalsアラート
    if (metrics.coreWebVitals.lcp > 2500) {
      alerts.push({
        id: `alert-${Date.now()}-lcp`,
        timestamp: new Date(),
        severity: 'warning',
        metric: 'Largest Contentful Paint',
        currentValue: metrics.coreWebVitals.lcp,
        threshold: 2500,
        url: metrics.url,
        description: 'LCPが推奨値を超えています',
        suggestions: [
          'LCP要素の画像を最適化',
          'クリティカルリソースのプリロード',
          'サーバーレスポンス時間の改善',
        ],
      });
    }

    if (metrics.coreWebVitals.cls > 0.1) {
      alerts.push({
        id: `alert-${Date.now()}-cls`,
        timestamp: new Date(),
        severity: 'warning',
        metric: 'Cumulative Layout Shift',
        currentValue: metrics.coreWebVitals.cls,
        threshold: 0.1,
        url: metrics.url,
        description: 'レイアウトシフトが発生しています（ADHD配慮で特に重要）',
        suggestions: [
          '画像とメディアのサイズ指定',
          'Web Fontの読み込み最適化',
          '動的コンテンツの安定化',
        ],
      });
    }

    alerts.forEach((alert) => {
      this.alerts.push(alert);
      this.emit('performanceAlert', alert);
    });
  }

  /**
   * 最適化提案生成
   */
  public generateOptimizationSuggestions(metrics: PerformanceMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 画像最適化提案
    if (metrics.resourceSizes.images > 400) {
      suggestions.push({
        id: 'image-optimization',
        category: 'images',
        priority: 'high',
        title: '画像の最適化',
        description: '次世代画像フォーマットへの変換とサイズ最適化',
        impact: `${metrics.resourceSizes.images - 400}KB削減、LCP改善見込み`,
        effort: 'medium',
        implementation: 'WebP/AVIF形式への変換、responsive images実装、遅延読み込み追加',
        estimatedImprovement: {
          performanceScore: 5,
          loadTime: 300,
        },
      });
    }

    // JavaScript最適化提案
    if (metrics.resourceSizes.scripts > 250) {
      suggestions.push({
        id: 'javascript-optimization',
        category: 'javascript',
        priority: 'high',
        title: 'JavaScriptバンドル最適化',
        description: 'コードスプリッティングと未使用コード削除',
        impact: `${metrics.resourceSizes.scripts - 250}KB削減、TTI改善見込み`,
        effort: 'high',
        implementation: 'Dynamic imports、Tree shaking強化、Webpack Bundle Analyzer活用',
        estimatedImprovement: {
          performanceScore: 8,
          loadTime: 400,
        },
      });
    }

    // CSS最適化提案
    if (metrics.resourceSizes.stylesheets > 80) {
      suggestions.push({
        id: 'css-optimization',
        category: 'css',
        priority: 'medium',
        title: 'CSS最適化',
        description: '未使用CSSの削除とクリティカルCSS実装',
        impact: `${metrics.resourceSizes.stylesheets - 80}KB削減、FCP改善見込み`,
        effort: 'medium',
        implementation: 'PurgeCSS実装、Critical CSS抽出、CSS-in-JS最適化',
        estimatedImprovement: {
          performanceScore: 3,
          loadTime: 150,
        },
      });
    }

    return suggestions;
  }

  /**
   * トレンドデータ取得
   */
  public getPerformanceTrend(period: 'hour' | 'day' | 'week' | 'month'): PerformanceTrend {
    // 実際の実装では時系列データベースから取得
    const mockTrendData: PerformanceTrend = {
      period,
      data: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
        avgPerformance: 80 + Math.random() * 20,
        avgAccessibility: 90 + Math.random() * 10,
        avgBestPractices: 85 + Math.random() * 15,
        avgSEO: 80 + Math.random() * 20,
        avgFCP: 1800 + Math.random() * 600,
        avgLCP: 2200 + Math.random() * 800,
        avgCLS: 0.05 + Math.random() * 0.1,
      })),
    };

    return mockTrendData;
  }

  /**
   * ダッシュボードデータ取得
   */
  public getDashboardData() {
    return {
      latestMetrics: this.metrics.slice(-5),
      alerts: this.alerts.slice(-10),
      budgets: this.budgets,
      trends: this.getPerformanceTrend('day'),
      isMonitoring: this.isMonitoring,
    };
  }

  /**
   * 監視停止
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('📊 パフォーマンス監視を停止しました');
  }

  /**
   * 手動テスト実行
   */
  public async runManualTest(url: string): Promise<PerformanceMetrics> {
    return this.runLighthouseTest(url);
  }
}

export const performanceMonitoringService = PerformanceMonitoringService.getInstance();
export default performanceMonitoringService;
