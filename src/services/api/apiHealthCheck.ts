import { toast } from '@/components/ui/use-toast';

export interface HealthCheckResult {
  endpoint: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  statusCode: number | null;
  error: string | null;
  timestamp: string;
}

export interface ApiHealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  issues: string[];
  recommendations: string[];
}

/**
 * 🏥 API健全性チェックサービス
 */
class ApiHealthCheckService {
  private static instance: ApiHealthCheckService | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastReport: ApiHealthReport | null = null;

  private constructor() {
    // 本番環境でのみ自動チェックを開始
    if (this.isProductionEnvironment()) {
      this.startPeriodicHealthCheck();
      console.log('🏥 API Health Check Service initialized for production');
    } else {
      console.log('🚫 API Health Check Service disabled in development');
    }
  }

  public static getInstance(): ApiHealthCheckService {
    if (!ApiHealthCheckService.instance) {
      ApiHealthCheckService.instance = new ApiHealthCheckService();
    }
    return ApiHealthCheckService.instance;
  }

  /**
   * 🌍 本番環境判定
   */
  private isProductionEnvironment(): boolean {
    if (process.env.NODE_ENV === 'production') {
      return true;
    }

    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return (
        hostname.includes('vercel.app') ||
        (!hostname.includes('localhost') && !hostname.includes('127.0.0.1'))
      );
    }

    return false;
  }

  /**
   * 🔍 単一エンドポイントの健全性チェック
   */
  private async checkEndpoint(
    endpoint: string,
    method: 'GET' | 'HEAD' = 'HEAD'
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const url = `${window.location.origin}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        signal: AbortSignal.timeout(10000), // 10秒タイムアウト
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.status < 500; // 5xxエラー以外は健全とみなす

      return {
        endpoint,
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        statusCode: response.status,
        error: isHealthy ? null : `HTTP ${response.status}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      return {
        endpoint,
        status: 'unhealthy',
        responseTime,
        statusCode: null,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 🩺 全APIエンドポイントの健全性チェック
   */
  public async performFullHealthCheck(): Promise<ApiHealthReport> {
    console.log('🩺 Starting full API health check...');

    const criticalEndpoints = [
      '/api/auth/tokens',
      '/api/auth/login',
      '/api/auth/refresh',
      '/api/todos',
    ];

    const checks: HealthCheckResult[] = [];

    // 各エンドポイントを並行でチェック
    const checkPromises = criticalEndpoints.map((endpoint) => this.checkEndpoint(endpoint));

    const results = await Promise.allSettled(checkPromises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        checks.push(result.value);
      } else {
        checks.push({
          endpoint: criticalEndpoints[index],
          status: 'unknown',
          responseTime: 0,
          statusCode: null,
          error: result.reason?.message || 'Check failed',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 全体的な健全性を判定
    const healthyCount = checks.filter((c) => c.status === 'healthy').length;
    const unhealthyCount = checks.filter((c) => c.status === 'unhealthy').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount === 0) {
      overall = 'healthy';
    } else if (healthyCount > unhealthyCount) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    // 問題と推奨事項を生成
    const issues: string[] = [];
    const recommendations: string[] = [];

    checks.forEach((check) => {
      if (check.status === 'unhealthy') {
        issues.push(`${check.endpoint}: ${check.error}`);
      }

      if (check.responseTime > 5000) {
        issues.push(`${check.endpoint}: 応答時間が遅い (${check.responseTime}ms)`);
      }
    });

    // 特定の問題に対する推奨事項
    const tokensEndpointIssue = checks.find(
      (c) => c.endpoint === '/api/auth/tokens' && c.status !== 'healthy'
    );
    if (tokensEndpointIssue) {
      if (tokensEndpointIssue.statusCode === null) {
        recommendations.push(
          '🔧 Vercelデプロイメントの確認: APIルートが正しくデプロイされているか確認してください'
        );
        recommendations.push('📄 vercel.json設定の確認: functions設定が正しいか確認してください');
      } else if (tokensEndpointIssue.statusCode === 404) {
        recommendations.push(
          '📂 APIファイルの確認: /api/auth/tokens.ts が存在し、正しくエクスポートされているか確認してください'
        );
      } else if (tokensEndpointIssue.statusCode && tokensEndpointIssue.statusCode >= 500) {
        recommendations.push('🐛 サーバーエラーの調査: Vercelのfunction logsを確認してください');
      }
    }

    if (issues.length === 0) {
      recommendations.push('✅ 全システムが正常に動作しています');
    }

    const report: ApiHealthReport = {
      overall,
      checks,
      issues,
      recommendations,
    };

    this.lastReport = report;
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '🩺 Health check completed:',
        overall,
        `(${healthyCount}/${checks.length} healthy)`
      );
    }

    // 重要な問題がある場合は通知
    if (overall === 'unhealthy') {
      toast({
        title: '🚨 APIシステム異常',
        description: `${unhealthyCount}個のエンドポイントに問題があります`,
        variant: 'destructive',
      });
    } else if (overall === 'degraded') {
      toast({
        title: '⚠️ APIシステム劣化',
        description: '一部のエンドポイントに問題があります',
        variant: 'default',
      });
    }

    return report;
  }

  /**
   * ⏰ 定期健全性チェック開始
   */
  private startPeriodicHealthCheck(): void {
    // 初回チェック実行
    this.performFullHealthCheck();

    // 5分ごとにチェック実行
    this.checkInterval = setInterval(
      () => {
        this.performFullHealthCheck();
      },
      5 * 60 * 1000
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('⏰ Periodic health check started (every 5 minutes)');
    }
  }

  /**
   * 📊 最新の健全性レポート取得
   */
  public getLastReport(): ApiHealthReport | null {
    return this.lastReport;
  }

  /**
   * 🎯 特定エンドポイントの迅速チェック
   */
  public async quickCheck(endpoint: string): Promise<HealthCheckResult> {
    console.log(`🎯 Quick check for ${endpoint}`);
    return this.checkEndpoint(endpoint);
  }

  /**
   * 🩹 自動修復の試行
   */
  public async attemptAutoRepair(): Promise<{ success: boolean; actions: string[] }> {
    console.log('🩹 Attempting auto-repair...');

    const actions: string[] = [];
    let success = false;

    try {
      // 1. キャッシュクリア
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        actions.push('ブラウザキャッシュをクリアしました');
      }

      // 2. ローカルストレージクリア（慎重に）
      if (localStorage.getItem('auth-tokens')) {
        localStorage.removeItem('auth-tokens');
        actions.push('認証トークンをクリアしました');
      }

      // 3. 再チェック実行
      const report = await this.performFullHealthCheck();
      success = report.overall !== 'unhealthy';

      if (success) {
        actions.push('✅ システムが復旧しました');
        toast({
          title: '🩹 自動修復完了',
          description: 'システムが正常に戻りました',
          variant: 'default',
        });
      } else {
        actions.push('❌ 自動修復に失敗しました');
      }
    } catch (error: any) {
      actions.push(`❌ 修復エラー: ${error.message}`);
    }

    return { success, actions };
  }

  /**
   * 🧹 クリーンアップ
   */
  public cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 API Health Check Service cleaned up');
    }
  }
}

export const apiHealthCheckService = ApiHealthCheckService.getInstance();
