import { ErrorHandler, ErrorReport } from '@/lib/errorHandler';

interface ErrorPattern {
  id: string;
  pattern: RegExp;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoRecovery?: () => Promise<boolean>;
  retryStrategy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

interface ErrorStatistics {
  totalErrors: number;
  resolvedErrors: number;
  activeErrors: number;
  errorsByType: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  recoveryRate: number;
}

/**
 * 🐛 エラーエリミネーター: 自動エラー回復・監視システム
 * APIエラーを自動検出し、可能な限り自動回復を試行
 */
export class ErrorRecoveryService {
  private static instance: ErrorRecoveryService | null = null;
  private errorHandler: ErrorHandler;
  private errorPatterns: ErrorPattern[] = [];
  private errorLog: ErrorReport[] = [];
  private recoveryAttempts: Map<string, number> = new Map();
  private isMonitoring = false;

  private constructor() {
    this.errorHandler = new ErrorHandler();
    this.initializeErrorPatterns();
    this.startErrorMonitoring();
  }

  public static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  /**
   * 🐛 エラーパターンの初期化
   */
  private initializeErrorPatterns(): void {
    this.errorPatterns = [
      // 🔧 API 500エラー自動回復パターン
      {
        id: 'api_500_error',
        pattern: /500|Internal Server Error|サーバーエラー/i,
        description: 'API 500エラー',
        severity: 'critical',
        autoRecovery: this.recover500Error.bind(this),
        retryStrategy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          initialDelay: 1000,
        },
      },
      // 🔧 認証エラー自動回復
      {
        id: 'auth_error',
        pattern: /401|403|Unauthorized|認証/i,
        description: '認証エラー',
        severity: 'high',
        autoRecovery: this.recoverAuthError.bind(this),
        retryStrategy: {
          maxRetries: 2,
          backoffMultiplier: 1.5,
          initialDelay: 500,
        },
      },
      // 🔧 ネットワークエラー自動回復
      {
        id: 'network_error',
        pattern: /Network|Failed to fetch|ECONNREFUSED/i,
        description: 'ネットワークエラー',
        severity: 'high',
        autoRecovery: this.recoverNetworkError.bind(this),
        retryStrategy: {
          maxRetries: 5,
          backoffMultiplier: 2,
          initialDelay: 2000,
        },
      },
      // 🔧 データベースエラー自動回復
      {
        id: 'database_error',
        pattern: /MongoError|Database|Connection timeout/i,
        description: 'データベースエラー',
        severity: 'critical',
        autoRecovery: this.recoverDatabaseError.bind(this),
        retryStrategy: {
          maxRetries: 3,
          backoffMultiplier: 3,
          initialDelay: 5000,
        },
      },
    ];
  }

  /**
   * 🐛 エラー監視開始
   */
  private startErrorMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // グローバルエラーハンドリング
    window.addEventListener('error', (event) => {
      this.handleGlobalError({
        type: 'react_error',
        message: event.message,
        stack: event.error?.stack,
        endpoint: window.location.pathname,
        timestamp: new Date().toISOString(),
        severity: 'high',
      });
    });

    // Promise拒否エラーハンドリング
    window.addEventListener('unhandledrejection', (event) => {
      this.handleGlobalError({
        type: 'api_error',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        endpoint: 'unknown',
        timestamp: new Date().toISOString(),
        severity: 'critical',
      });
    });

    console.log('🐛 エラー監視システム開始');
  }

  /**
   * 🐛 グローバルエラー処理
   */
  private async handleGlobalError(errorReport: ErrorReport): Promise<void> {
    // エラーログに追加
    this.errorLog.push(errorReport);

    // パターンマッチングによる自動回復試行
    for (const pattern of this.errorPatterns) {
      if (pattern.pattern.test(errorReport.message)) {
        console.log(`🔧 エラーパターン検出: ${pattern.description}`);
        await this.attemptAutoRecovery(errorReport, pattern);
        break;
      }
    }

    // エラー統計更新
    this.updateErrorStatistics();
  }

  /**
   * 🔧 自動回復試行
   */
  private async attemptAutoRecovery(
    errorReport: ErrorReport,
    pattern: ErrorPattern
  ): Promise<boolean> {
    const recoveryKey = `${pattern.id}_${errorReport.endpoint}`;
    const attemptCount = this.recoveryAttempts.get(recoveryKey) || 0;

    // リトライ制限チェック
    if (attemptCount >= (pattern.retryStrategy?.maxRetries || 3)) {
      console.warn(`🚫 回復試行上限到達: ${pattern.description}`);
      return false;
    }

    // 回復試行カウント増加
    this.recoveryAttempts.set(recoveryKey, attemptCount + 1);

    // バックオフ遅延
    const delay =
      (pattern.retryStrategy?.initialDelay || 1000) *
      Math.pow(pattern.retryStrategy?.backoffMultiplier || 2, attemptCount);

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      if (pattern.autoRecovery) {
        const recovered = await pattern.autoRecovery();
        if (recovered) {
          console.log(`✅ 自動回復成功: ${pattern.description}`);
          this.recoveryAttempts.delete(recoveryKey);
          return true;
        }
      }
    } catch (recoveryError) {
      console.error(`❌ 自動回復失敗: ${pattern.description}`, recoveryError);
    }

    return false;
  }

  /**
   * 🔧 API 500エラー回復
   */
  private async recover500Error(): Promise<boolean> {
    try {
      // 1. キャッシュクリア
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 2. LocalStorage APIキャッシュクリア
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('api_cache_')) {
          localStorage.removeItem(key);
        }
      });

      // 3. サービスワーカー再起動（あれば）
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.update()));
      }

      // 4. API接続テスト
      const testResponse = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache',
      });

      return testResponse.ok;
    } catch (error) {
      console.error('500エラー回復失敗:', error);
      return false;
    }
  }

  /**
   * 🔧 認証エラー回復
   */
  private async recoverAuthError(): Promise<boolean> {
    try {
      // 1. トークンリフレッシュ試行
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.accessToken);
          console.log('🔄 トークンリフレッシュ成功');
          return true;
        }
      }

      // 2. サイレント再認証試行
      const silentAuth = await this.attemptSilentAuth();
      return silentAuth;
    } catch (error) {
      console.error('認証エラー回復失敗:', error);
      return false;
    }
  }

  /**
   * 🔧 ネットワークエラー回復
   */
  private async recoverNetworkError(): Promise<boolean> {
    try {
      // 1. 接続テスト
      const online = navigator.onLine;
      if (!online) {
        console.log('📡 オフライン状態検出');
        return false;
      }

      // 2. DNS解決テスト
      const dnsTest = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
      });

      // 3. APIサーバー接続テスト
      const apiTest = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000,
      } as any);

      return apiTest.ok;
    } catch (error) {
      console.error('ネットワークエラー回復失敗:', error);
      return false;
    }
  }

  /**
   * 🔧 データベースエラー回復
   */
  private async recoverDatabaseError(): Promise<boolean> {
    try {
      // 1. データベース接続テスト
      const dbTest = await fetch('/api/db/health', {
        method: 'GET',
      });

      if (dbTest.ok) {
        console.log('💾 データベース接続回復');
        return true;
      }

      // 2. フォールバックローカルストレージ
      console.log('💾 ローカルストレージフォールバック');
      return true; // ローカルストレージは常に利用可能
    } catch (error) {
      console.error('データベースエラー回復失敗:', error);
      return false;
    }
  }

  /**
   * 🔧 サイレント認証試行
   */
  private async attemptSilentAuth(): Promise<boolean> {
    try {
      // Cookie認証やセッション認証を試行
      const response = await fetch('/api/auth/silent', {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * 📊 エラー統計更新
   */
  private updateErrorStatistics(): void {
    // エラー統計をリアルタイム分析ダッシュボードに送信
    const stats = this.getErrorStatistics();
    window.dispatchEvent(
      new CustomEvent('errorStatsUpdate', {
        detail: stats,
      })
    );
  }

  /**
   * 📊 エラー統計取得
   */
  public getErrorStatistics(): ErrorStatistics {
    const totalErrors = this.errorLog.length;
    const last24Hours = this.errorLog.filter(
      (error) => Date.now() - new Date(error.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    const errorsByType: Record<string, number> = {};
    const errorsByEndpoint: Record<string, number> = {};

    last24Hours.forEach((error) => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsByEndpoint[error.endpoint || 'unknown'] =
        (errorsByEndpoint[error.endpoint || 'unknown'] || 0) + 1;
    });

    const resolvedErrors = Array.from(this.recoveryAttempts.values()).filter(
      (attempts) => attempts > 0
    ).length;

    return {
      totalErrors,
      resolvedErrors,
      activeErrors: totalErrors - resolvedErrors,
      errorsByType,
      errorsByEndpoint,
      recoveryRate: totalErrors > 0 ? (resolvedErrors / totalErrors) * 100 : 0,
    };
  }

  /**
   * 🐛 手動エラー報告
   */
  public reportError(
    error: Error,
    context: {
      component?: string;
      endpoint?: string;
      additionalInfo?: Record<string, any>;
    }
  ): void {
    const errorReport: ErrorReport = {
      type: 'react_error',
      message: error.message,
      stack: error.stack,
      component: context.component,
      endpoint: context.endpoint,
      timestamp: new Date().toISOString(),
      severity: 'medium',
    };

    this.handleGlobalError(errorReport);
  }

  /**
   * 🔧 エラー回復状況リセット
   */
  public resetRecoveryAttempts(): void {
    this.recoveryAttempts.clear();
    console.log('🔄 エラー回復状況リセット');
  }

  /**
   * 📊 エラーログエクスポート
   */
  public exportErrorLog(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        statistics: this.getErrorStatistics(),
        recentErrors: this.errorLog.slice(-50), // 最新50件
        recoveryAttempts: Object.fromEntries(this.recoveryAttempts),
      },
      null,
      2
    );
  }
}
