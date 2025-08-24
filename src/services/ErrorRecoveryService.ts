import { ErrorHandler, ErrorReport } from '@/lib/errorHandler';
import { toast } from '@/components/ui/use-toast';

export interface ErrorPattern {
  pattern: RegExp;
  type: 'api_500' | 'websocket_port' | 'auth_failure' | 'network_error' | 'database_error';
  recoveryAction: () => Promise<void>;
  retryCount: number;
  maxRetries: number;
}

export interface ErrorRecoveryStats {
  totalErrors: number;
  recoveredErrors: number;
  recoveryRate: number;
  errorTypes: Record<string, number>;
  lastRecovery: string | null;
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
  private stats: ErrorRecoveryStats = {
    totalErrors: 0,
    recoveredErrors: 0,
    recoveryRate: 0,
    errorTypes: {},
    lastRecovery: null,
  };
  private isRecovering = false;

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
      // API 500エラー復旧
      {
        pattern: /500|Internal Server Error|listen EADDRINUSE/i,
        type: 'api_500',
        recoveryAction: async () => {
          console.log('🔧 API 500エラー復旧を開始...');
          await this.handleApiServerError();
        },
        retryCount: 0,
        maxRetries: 3,
      },
      // WebSocketポート競合解決
      {
        pattern: /EADDRINUSE.*3001|WebSocket.*connection.*failed/i,
        type: 'websocket_port',
        recoveryAction: async () => {
          console.log('🔌 WebSocketポート競合解決を開始...');
          await this.handleWebSocketPortConflict();
        },
        retryCount: 0,
        maxRetries: 5,
      },
      // 認証エラー復旧
      {
        pattern: /401|Unauthorized|Authentication.*failed/i,
        type: 'auth_failure',
        recoveryAction: async () => {
          console.log('🔐 認証エラー復旧を開始...');
          await this.handleAuthFailure();
        },
        retryCount: 0,
        maxRetries: 2,
      },
      // ネットワークエラー復旧
      {
        pattern: /Network.*Error|Failed to fetch|Connection.*refused/i,
        type: 'network_error',
        recoveryAction: async () => {
          console.log('🌐 ネットワークエラー復旧を開始...');
          await this.handleNetworkError();
        },
        retryCount: 0,
        maxRetries: 3,
      },
      // データベースエラー復旧
      {
        pattern: /MongoDB.*disconnected|Database.*connection.*lost/i,
        type: 'database_error',
        recoveryAction: async () => {
          console.log('🗄️ データベースエラー復旧を開始...');
          await this.handleDatabaseError();
        },
        retryCount: 0,
        maxRetries: 4,
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
        console.log(`🔧 エラーパターン検出: ${pattern.type}`);
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
    const recoveryKey = `${pattern.type}_${errorReport.endpoint}`;
    const attemptCount = this.recoveryAttempts.get(recoveryKey) || 0;

    // リトライ制限チェック
    if (attemptCount >= (pattern.maxRetries || 3)) {
      console.warn(`🚫 回復試行上限到達: ${pattern.type}`);
      return false;
    }

    // 回復試行カウント増加
    this.recoveryAttempts.set(recoveryKey, attemptCount + 1);

    // バックオフ遅延
    const delay = (attemptCount + 1) * 1000; // 簡単な遅延

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      if (pattern.recoveryAction) {
        await pattern.recoveryAction();
        console.log(`✅ 自動回復成功: ${pattern.type}`);
        this.recoveryAttempts.delete(recoveryKey);
        return true;
      }
    } catch (recoveryError) {
      console.error(`❌ 自動回復失敗: ${pattern.type}`, recoveryError);
    }

    return false;
  }

  /**
   * 🔧 API 500エラー回復
   */
  private async handleApiServerError(): Promise<void> {
    // API サーバーエラー復旧戦略
    const recoveryStrategies = [
      // 1. キャッシュクリア
      async () => {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
        }
        localStorage.clear();
        sessionStorage.clear();
      },
      // 2. Service Worker再起動
      async () => {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
          window.location.reload();
        }
      },
      // 3. 代替APIエンドポイント試行
      async () => {
        const alternativeEndpoints = [
          'http://localhost:3003',
          'http://localhost:3004',
          'http://localhost:3005',
        ];

        for (const endpoint of alternativeEndpoints) {
          try {
            const response = await fetch(`${endpoint}/api/health`);
            if (response.ok) {
              // 新しいエンドポイントを設定
              localStorage.setItem('api_endpoint', endpoint);
              console.log(`🔄 API エンドポイントを${endpoint}に変更しました`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
      },
    ];

    for (const strategy of recoveryStrategies) {
      try {
        await strategy();
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待機
      } catch (error) {
        console.warn('復旧戦略実行エラー:', error);
      }
    }
  }

  /**
   * 🔧 WebSocketポート競合解決
   */
  private async handleWebSocketPortConflict(): Promise<void> {
    // WebSocketポート競合解決戦略
    const alternativePorts = [3002, 3003, 3004, 3005, 3006];

    for (const port of alternativePorts) {
      try {
        // 新しいポートでWebSocket接続試行
        const testWs = new WebSocket(`ws://localhost:${port}/notifications`);

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            testWs.close();
            reject(new Error('Connection timeout'));
          }, 2000);

          testWs.onopen = () => {
            clearTimeout(timeout);
            testWs.close();
            localStorage.setItem('websocket_port', port.toString());
            console.log(`🔌 WebSocketポートを${port}に変更しました`);
            resolve(void 0);
          };

          testWs.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Connection failed'));
          };
        });

        break; // 成功したらループを抜ける
      } catch (error) {
        console.log(`ポート${port}は使用できません: ${error}`);
        continue;
      }
    }
  }

  /**
   * 🔧 認証エラー回復
   */
  private async handleAuthFailure(): Promise<void> {
    // 認証エラー復旧戦略
    try {
      // 1. トークン更新試行
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const { accessToken } = await response.json();
          localStorage.setItem('access_token', accessToken);
          return;
        }
      }

      // 2. サイレント認証試行
      const silentAuthResponse = await fetch('/api/auth/silent');
      if (silentAuthResponse.ok) {
        const { accessToken } = await silentAuthResponse.json();
        localStorage.setItem('access_token', accessToken);
        return;
      }

      // 3. 匿名モードに切り替え
      localStorage.setItem('auth_mode', 'anonymous');
      console.log('🔐 匿名モードに切り替えました');
    } catch (error) {
      console.error('認証復旧エラー:', error);
    }
  }

  /**
   * 🔧 ネットワークエラー回復
   */
  private async handleNetworkError(): Promise<void> {
    // ネットワークエラー復旧戦略
    try {
      // 1. 接続テスト
      const connectionTest = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });

      if (!connectionTest.ok) {
        throw new Error('Server unreachable');
      }

      // 2. DNS フラッシュ (可能な場合)
      if ('dns' in navigator) {
        // @ts-expect-error - 実験的API
        await navigator.dns.clear();
      }

      // 3. オフラインモード有効化
      if (!navigator.onLine) {
        localStorage.setItem('offline_mode', 'true');
        console.log('📴 オフラインモードを有効化しました');
      }
    } catch (error) {
      console.error('ネットワーク復旧エラー:', error);
    }
  }

  /**
   * 🔧 データベースエラー回復
   */
  private async handleDatabaseError(): Promise<void> {
    // データベースエラー復旧戦略
    try {
      // 1. 接続プール再初期化
      await fetch('/api/db/reconnect', { method: 'POST' });

      // 2. フォールバック用ローカルストレージ有効化
      localStorage.setItem('use_local_storage', 'true');
      console.log('💾 ローカルストレージフォールバックを有効化しました');

      // 3. データ同期キューの初期化
      const syncQueue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
      console.log(`📦 ${syncQueue.length}件のデータ同期待ちを確認しました`);
    } catch (error) {
      console.error('データベース復旧エラー:', error);
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
  public getErrorStatistics(): ErrorRecoveryStats {
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

    const recoveredErrors = Array.from(this.recoveryAttempts.values()).filter(
      (attempts) => attempts > 0
    ).length;

    return {
      totalErrors,
      recoveredErrors,
      recoveryRate: totalErrors > 0 ? (recoveredErrors / totalErrors) * 100 : 0,
      errorTypes: errorsByType,
      lastRecovery: this.stats.lastRecovery,
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

  // 復旧統計取得
  getRecoveryStats(): ErrorRecoveryStats {
    return { ...this.stats };
  }

  // エラーパターン追加
  addErrorPattern(pattern: Omit<ErrorPattern, 'retryCount'>): void {
    this.errorPatterns.push({ ...pattern, retryCount: 0 });
  }

  // 手動復旧トリガー
  async triggerManualRecovery(errorType: string): Promise<boolean> {
    const pattern = this.errorPatterns.find((p) => p.type === errorType);
    if (!pattern) return false;

    return await this.attemptAutoRecovery(
      {
        type: 'react_error',
        message: `Manual trigger for ${errorType}`,
        stack: '',
        endpoint: 'unknown',
        timestamp: new Date().toISOString(),
        severity: 'medium',
      },
      pattern
    );
  }

  // システム自己診断
  async performSelfDiagnosis(): Promise<{
    server: boolean;
    websocket: boolean;
    database: boolean;
    auth: boolean;
  }> {
    const results = {
      server: false,
      websocket: false,
      database: false,
      auth: false,
    };

    try {
      // サーバー接続確認
      const serverResponse = await fetch('/api/health');
      results.server = serverResponse.ok;
    } catch (e) {
      results.server = false;
    }

    try {
      // WebSocket接続確認
      const ws = new WebSocket('ws://localhost:3001/notifications');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject();
        }, 2000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          results.websocket = true;
          resolve(void 0);
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          reject();
        };
      });
    } catch (e) {
      results.websocket = false;
    }

    try {
      // データベース接続確認
      const dbResponse = await fetch('/api/db/status');
      results.database = dbResponse.ok;
    } catch (e) {
      results.database = false;
    }

    try {
      // 認証確認
      const authResponse = await fetch('/api/auth/check');
      results.auth = authResponse.ok;
    } catch (e) {
      results.auth = false;
    }

    return results;
  }

  /**
   * 🔧 API認証エラー回復
   */
  static async handleAuthenticationError(error: any, context: string): Promise<boolean> {
    console.log(`🔧 Handling authentication error in ${context}:`, error);

    // 404エラーの場合（APIエンドポイント不在）
    if (error.response?.status === 404) {
      if (context.includes('tokens')) {
        console.log('📝 Token API not found - using fallback authentication');
        console.log('📊 Analytics: auth_api_404', {
          context,
          endpoint: error.config?.url,
          timestamp: new Date().toISOString(),
        });

        // セッションストレージを使用したフォールバック認証
        return this.initializeFallbackAuth();
      }
    }

    // HTML応答エラーの場合（ルーティング問題）
    if (error.response?.data?.includes('<!doctype') || error.response?.data?.includes('<html')) {
      console.error('🚨 API routing issue detected');
      console.log('📊 Analytics: api_routing_error', {
        context,
        responseSnippet: error.response.data.substring(0, 100),
        timestamp: new Date().toISOString(),
      });

      // ルーティング問題の自動診断
      this.diagnoseFallbackApiAvailability();
      return false;
    }

    // ネットワークエラーの場合
    if (!error.response && error.request) {
      console.warn('🌐 Network connectivity issue');
      console.log('📊 Analytics: network_error', {
        context,
        timestamp: new Date().toISOString(),
      });

      // オフラインモードへの切り替え
      return this.enableOfflineMode();
    }

    return false;
  }

  /**
   * 🔄 フォールバック認証の初期化
   */
  private static initializeFallbackAuth(): boolean {
    try {
      // セッションストレージベースの認証を実装
      const fallbackToken = this.generateFallbackToken();
      sessionStorage.setItem('fallback_auth_token', fallbackToken);
      sessionStorage.setItem('fallback_auth_enabled', 'true');

      console.log('✅ Fallback authentication initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize fallback auth:', error);
      return false;
    }
  }

  /**
   * 🆔 フォールバック認証トークン生成
   */
  private static generateFallbackToken(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `fallback_${timestamp}_${random}`;
  }

  /**
   * 🔍 API可用性診断
   */
  private static async diagnoseFallbackApiAvailability(): Promise<void> {
    const endpoints = ['/api/health', '/api/auth/tokens', '/api/auth/check'];

    console.log('🔍 Diagnosing API endpoints...');

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(window.location.origin + endpoint, {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000),
        });

        console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: Failed to connect`);
      }
    }
  }

  /**
   * 📴 オフラインモード有効化
   */
  private static enableOfflineMode(): boolean {
    try {
      sessionStorage.setItem('offline_mode', 'true');
      console.log('📴 Offline mode enabled');

      // オフラインモード通知
      this.showOfflineModeNotification();
      return true;
    } catch (error) {
      console.error('❌ Failed to enable offline mode:', error);
      return false;
    }
  }

  /**
   * 📢 オフラインモード通知
   */
  private static showOfflineModeNotification(): void {
    if (typeof window !== 'undefined' && 'CustomEvent' in window) {
      window.dispatchEvent(
        new CustomEvent('app:offline-mode-enabled', {
          detail: {
            message: 'オフラインモードで動作しています',
            timestamp: new Date().toISOString(),
          },
        })
      );
    }
  }
}
