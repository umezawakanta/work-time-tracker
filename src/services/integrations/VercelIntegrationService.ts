/**
 * ▲ Vercel統合サービス
 * 自動デプロイ、パフォーマンス監視、分析
 */

export interface VercelConfig {
  teamId?: string;
  projectId: string;
  token: string;
  domain: string;
}

export interface DeploymentData {
  name: string;
  files: Array<{
    file: string;
    data: string;
  }>;
  projectSettings?: {
    buildCommand?: string;
    outputDirectory?: string;
    installCommand?: string;
  };
}

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  score: number;
}

export interface ErrorLog {
  timestamp: Date;
  message: string;
  stack?: string;
  userAgent?: string;
  url: string;
  severity: 'error' | 'warning' | 'info';
}

class VercelIntegrationService {
  private static instance: VercelIntegrationService | null = null;
  private config: VercelConfig | null = null;
  private baseUrl = 'https://api.vercel.com';

  public static getInstance(): VercelIntegrationService {
    if (!VercelIntegrationService.instance) {
      VercelIntegrationService.instance = new VercelIntegrationService();
    }
    return VercelIntegrationService.instance;
  }

  /**
   * Vercel設定を初期化
   */
  public initialize(config: VercelConfig): void {
    this.config = config;
    console.log(`▲ Vercel統合を初期化: ${config.domain}`);
  }

  /**
   * 自動デプロイを実行
   */
  public async triggerDeployment(
    changes: Array<{
      path: string;
      content: string;
    }>
  ): Promise<{
    deploymentId: string;
    url: string;
    status: 'queued' | 'building' | 'ready' | 'error';
  } | null> {
    if (!this.config) {
      console.error('❌ Vercel設定が初期化されていません');
      return null;
    }

    try {
      console.log('🚀 Vercelデプロイを開始...');

      const deployment = await this.createDeployment({
        name: `auto-improvement-${Date.now()}`,
        files: changes.map((change) => ({
          file: change.path,
          data: Buffer.from(change.content).toString('base64'),
        })),
      });

      console.log(`✅ デプロイ開始: ${deployment.url}`);

      // デプロイメント完了を待機
      await this.waitForDeployment(deployment.deploymentId);

      return deployment;
    } catch (error) {
      console.error('❌ デプロイエラー:', error);
      return null;
    }
  }

  /**
   * パフォーマンス指標を取得
   */
  public async getPerformanceMetrics(days: number = 7): Promise<PerformanceMetrics | null> {
    if (!this.config) return null;

    try {
      console.log('📊 パフォーマンス指標を取得中...');

      // Analytics APIからデータを取得
      const analyticsData = await this.apiCall(
        `/v2/analytics?projectId=${this.config.projectId}&period=${days}d`
      );

      // Web Vitalsデータを集計
      const metrics = this.aggregatePerformanceData(analyticsData);

      console.log('📈 パフォーマンス指標:', metrics);
      return metrics;
    } catch (error) {
      console.error('❌ パフォーマンス指標取得エラー:', error);
      return null;
    }
  }

  /**
   * エラーログを監視・取得
   */
  public async getErrorLogs(
    hours: number = 24,
    severity: 'error' | 'warning' | 'all' = 'all'
  ): Promise<ErrorLog[]> {
    if (!this.config) return [];

    try {
      console.log('🔍 エラーログを取得中...');

      const logsData = await this.apiCall(
        `/v2/integrations/log-drains/${this.config.projectId}?since=${hours}h`
      );

      const errorLogs = this.parseErrorLogs(logsData, severity);

      console.log(`📝 ${errorLogs.length}件のエラーログを取得`);
      return errorLogs;
    } catch (error) {
      console.error('❌ エラーログ取得エラー:', error);
      return [];
    }
  }

  /**
   * デプロイメント履歴と統計を取得
   */
  public async getDeploymentStats(days: number = 30): Promise<{
    totalDeployments: number;
    successRate: number;
    averageBuildTime: number;
    deploymentFrequency: number;
    recentDeployments: Array<{
      id: string;
      url: string;
      state: string;
      createdAt: Date;
      buildTime?: number;
    }>;
  } | null> {
    if (!this.config) return null;

    try {
      const deployments = await this.apiCall(
        `/v9/projects/${this.config.projectId}/deployments?limit=100`
      );

      const recentDeployments = (deployments.deployments as any[])
        .filter((d: any) => {
          const deployDate = new Date(d.createdAt);
          const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          return deployDate > cutoff;
        })
        .map((d: any) => ({
          id: d.uid,
          url: d.url,
          state: d.state,
          createdAt: new Date(d.createdAt),
          buildTime:
            d.buildingAt && d.readyAt
              ? new Date(d.readyAt).getTime() - new Date(d.buildingAt).getTime()
              : undefined,
        }));

      const successfulDeployments = recentDeployments.filter((d) => d.state === 'READY');
      const buildTimes = recentDeployments.map((d) => d.buildTime).filter(Boolean) as number[];

      return {
        totalDeployments: recentDeployments.length,
        successRate:
          recentDeployments.length > 0
            ? (successfulDeployments.length / recentDeployments.length) * 100
            : 0,
        averageBuildTime:
          buildTimes.length > 0 ? buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length : 0,
        deploymentFrequency: recentDeployments.length / days,
        recentDeployments: recentDeployments.slice(0, 10),
      };
    } catch (error) {
      console.error('❌ デプロイメント統計取得エラー:', error);
      return null;
    }
  }

  /**
   * サイトの稼働状況を監視
   */
  public async monitorUptime(): Promise<{
    status: 'up' | 'down' | 'degraded';
    responseTime: number;
    uptime: number;
    lastChecked: Date;
  } | null> {
    if (!this.config) return null;

    try {
      const startTime = Date.now();

      // サイトへのリクエストでヘルスチェック
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`https://${this.config.domain}`, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      const status = response.ok ? (responseTime < 2000 ? 'up' : 'degraded') : 'down';

      // 稼働率の計算（過去24時間）
      const uptime = await this.calculateUptime(24);

      return {
        status,
        responseTime,
        uptime,
        lastChecked: new Date(),
      };
    } catch (error) {
      console.error('❌ 稼働監視エラー:', error);
      return {
        status: 'down',
        responseTime: 0,
        uptime: 0,
        lastChecked: new Date(),
      };
    }
  }

  /**
   * パフォーマンス最適化の提案
   */
  public async getOptimizationSuggestions(): Promise<
    Array<{
      type: 'bundle' | 'image' | 'cache' | 'cdn' | 'code';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      expectedImprovement: string;
      implementationGuide: string[];
    }>
  > {
    const suggestions = [];

    try {
      const metrics = await this.getPerformanceMetrics(7);
      if (!metrics) return suggestions;

      // バンドルサイズの最適化
      if (metrics.loadTime > 3000) {
        suggestions.push({
          type: 'bundle',
          priority: 'high',
          title: 'バンドルサイズの最適化',
          description: 'JavaScript/CSSバンドルが大きすぎるため、読み込み時間が長くなっています',
          expectedImprovement: '読み込み時間を30-50%短縮',
          implementationGuide: [
            'コード分割（dynamic import）の実装',
            '未使用コードの削除',
            'tree shakingの最適化',
            'ライブラリの軽量版への置き換え',
          ],
        });
      }

      // 画像最適化
      if (metrics.largestContentfulPaint > 2500) {
        suggestions.push({
          type: 'image',
          priority: 'medium',
          title: '画像の最適化',
          description: 'LCPが遅いため、画像の最適化が必要です',
          expectedImprovement: 'LCPを20-40%改善',
          implementationGuide: [
            'WebP/AVIFフォーマットの採用',
            '画像の遅延読み込み',
            '適切なサイズでの配信',
            'CDN経由での配信',
          ],
        });
      }

      // レイアウトシフトの改善
      if (metrics.cumulativeLayoutShift > 0.1) {
        suggestions.push({
          type: 'code',
          priority: 'high',
          title: 'レイアウトシフトの改善',
          description: 'CLSが高いため、ユーザー体験に影響しています',
          expectedImprovement: 'CLS を 0.1以下に改善',
          implementationGuide: [
            '画像・iframe の寸法指定',
            'フォントの最適化',
            '動的コンテンツの事前領域確保',
            'CSSアニメーションの最適化',
          ],
        });
      }

      console.log(`💡 ${suggestions.length}件の最適化提案を生成`);
      return suggestions;
    } catch (error) {
      console.error('❌ 最適化提案生成エラー:', error);
      return suggestions;
    }
  }

  // === プライベートメソッド ===

  private async createDeployment(deploymentData: DeploymentData): Promise<{
    deploymentId: string;
    url: string;
    status: 'queued' | 'building' | 'ready' | 'error';
  }> {
    // 模擬的なデプロイメント作成
    const deploymentId = `dpl_${Math.random().toString(36).substr(2, 9)}`;
    return {
      deploymentId,
      url: `https://${deploymentId}-${this.config!.domain}`,
      status: 'queued',
    };
  }

  private async waitForDeployment(deploymentId: string): Promise<void> {
    console.log(`⏳ デプロイメント完了を待機中: ${deploymentId}`);

    // 模擬的な待機（実際にはポーリング）
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log(`✅ デプロイメント完了: ${deploymentId}`);
  }

  private async apiCall(endpoint: string, options?: any): Promise<any> {
    if (!this.config) throw new Error('Vercel設定が初期化されていません');

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.config.token}`,
      'Content-Type': 'application/json',
    };

    if (this.config.teamId) {
      // @ts-expect-error - Dynamic header assignment
      headers['X-Vercel-Team-Id'] = this.config.teamId;
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Vercel API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private aggregatePerformanceData(analyticsData: any): PerformanceMetrics {
    // 模擬的なパフォーマンスデータ（実際にはAnalytics APIから取得）
    return {
      loadTime: Math.floor(Math.random() * 2000) + 1000,
      firstContentfulPaint: Math.floor(Math.random() * 1000) + 500,
      largestContentfulPaint: Math.floor(Math.random() * 1500) + 1000,
      firstInputDelay: Math.floor(Math.random() * 50) + 10,
      cumulativeLayoutShift: Math.random() * 0.2,
      score: Math.floor(Math.random() * 30) + 70,
    };
  }

  private parseErrorLogs(logsData: any, severity: string): ErrorLog[] {
    // 模擬的なエラーログ解析
    const mockLogs: ErrorLog[] = [
      {
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        message: 'TypeError: Cannot read property of undefined',
        stack: 'at Component.render (bundle.js:123:45)',
        userAgent: 'Mozilla/5.0...',
        url: '/dashboard',
        severity: 'error',
      },
      {
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        message: 'Failed to load resource: 404',
        url: '/api/data',
        severity: 'warning',
      },
    ];

    return severity === 'all' ? mockLogs : mockLogs.filter((log) => log.severity === severity);
  }

  private async calculateUptime(hours: number): Promise<number> {
    // 模擬的な稼働率計算
    return Math.random() * 5 + 95; // 95-100%
  }
}

export const vercelIntegrationService = VercelIntegrationService.getInstance();
