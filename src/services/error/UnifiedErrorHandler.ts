/**
 * 🚨 統一エラーハンドリングシステム
 * 全てのエラーを統一的に処理し、適切なユーザーフィードバックを提供
 */

import { toast } from 'react-hot-toast';
import { store } from '@/store';
import { addSystemEvent, addNotification, updateConnectionStatus } from '@/store/unifiedDataSlice';

// エラーの種類
export type ErrorType =
  | 'auth'
  | 'api'
  | 'network'
  | 'validation'
  | 'permission'
  | 'timeout'
  | 'server'
  | 'client'
  | 'security'
  | 'unknown';

// エラーの重要度
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// 統一エラー情報
export interface UnifiedError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  code: string;
  message: string;
  userMessage: string;
  timestamp: string;
  context: {
    component?: string;
    action?: string;
    userId?: string;
    url?: string;
    userAgent?: string;
    stackTrace?: string;
    additionalData?: Record<string, any>;
  };
  recovery: {
    autoRetry: boolean;
    retryAttempts: number;
    maxRetries: number;
    retryDelay: number;
    fallbackAction?: string;
    userActions: Array<{
      label: string;
      action: string;
      primary?: boolean;
    }>;
  };
  resolved: boolean;
  resolvedAt?: string;
  resolution?: string;
}

// エラー設定
export interface ErrorHandlerConfig {
  enableAutoRetry: boolean;
  maxRetryAttempts: number;
  retryDelayMs: number;
  enableUserNotifications: boolean;
  enableSystemEvents: boolean;
  enableErrorReporting: boolean;
  showStackTrace: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// エラー統計
export interface ErrorStatistics {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  resolvedErrors: number;
  unresolvedErrors: number;
  averageResolutionTime: number;
  mostCommonErrors: Array<{
    code: string;
    count: number;
    lastOccurrence: string;
  }>;
}

class UnifiedErrorHandler {
  private static instance: UnifiedErrorHandler;
  private config: ErrorHandlerConfig;
  private errors: Map<string, UnifiedError> = new Map();
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private retryQueue: Map<string, RetryConfig> = new Map();

  private constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = {
      enableAutoRetry: true,
      maxRetryAttempts: 3,
      retryDelayMs: 1000,
      enableUserNotifications: true,
      enableSystemEvents: true,
      enableErrorReporting: true,
      showStackTrace: false,
      logLevel: 'error',
      ...config,
    };

    this.initializeErrorPatterns();
  }

  /**
   * 🎯 シングルトンインスタンスの取得
   */
  public static getInstance(config?: Partial<ErrorHandlerConfig>): UnifiedErrorHandler {
    if (!UnifiedErrorHandler.instance) {
      UnifiedErrorHandler.instance = new UnifiedErrorHandler(config);
    }
    return UnifiedErrorHandler.instance;
  }

  /**
   * 🚨 エラーハンドリングのメインエントリーポイント
   */
  public async handleError(
    error: Error | string | any,
    context?: {
      component?: string;
      action?: string;
      userId?: string;
      additionalData?: Record<string, any>;
    }
  ): Promise<UnifiedError> {
    try {
      // エラー情報の正規化
      const normalizedError = this.normalizeError(error, context);

      // エラーパターンの分析
      const pattern = this.analyzeErrorPattern(normalizedError);

      // 統一エラーオブジェクトの作成
      const unifiedError = this.createUnifiedError(normalizedError, pattern);

      // エラーの保存
      this.errors.set(unifiedError.id, unifiedError);

      // ログ出力
      this.logError(unifiedError);

      // システムイベントの記録
      if (this.config.enableSystemEvents) {
        this.recordSystemEvent(unifiedError);
      }

      // ユーザー通知
      if (this.config.enableUserNotifications) {
        this.notifyUser(unifiedError);
      }

      // 自動復旧の試行
      if (unifiedError.recovery.autoRetry) {
        this.attemptAutoRecovery(unifiedError);
      }

      // エラーレポートの送信
      if (this.config.enableErrorReporting && unifiedError.severity === 'critical') {
        this.reportError(unifiedError);
      }

      return unifiedError;
    } catch (handlingError) {
      console.error('❌ Error handler failed:', handlingError);

      // フォールバック処理
      return this.createFallbackError(error, context);
    }
  }

  /**
   * 🔍 エラーの正規化
   */
  private normalizeError(
    error: any,
    context?: any
  ): {
    type: ErrorType;
    code: string;
    message: string;
    stackTrace?: string;
    originalError: any;
  } {
    // APIエラーの処理
    if (error?.response) {
      return {
        type: this.determineApiErrorType(error.response.status),
        code: `HTTP_${error.response.status}`,
        message: error.response.data?.message || error.message || 'API request failed',
        stackTrace: error.stack,
        originalError: error,
      };
    }

    // ネットワークエラーの処理
    if (error?.request || error?.code === 'NETWORK_ERROR') {
      return {
        type: 'network',
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        stackTrace: error.stack,
        originalError: error,
      };
    }

    // 認証エラーの処理
    if (error?.message?.includes('auth') || error?.code?.includes('AUTH')) {
      return {
        type: 'auth',
        code: error.code || 'AUTH_ERROR',
        message: error.message || 'Authentication failed',
        stackTrace: error.stack,
        originalError: error,
      };
    }

    // バリデーションエラーの処理
    if (error?.name === 'ValidationError') {
      return {
        type: 'validation',
        code: 'VALIDATION_ERROR',
        message: error.message || 'Validation failed',
        stackTrace: error.stack,
        originalError: error,
      };
    }

    // JavaScriptエラーの処理
    if (error instanceof Error) {
      return {
        type: 'client',
        code: error.name || 'CLIENT_ERROR',
        message: error.message,
        stackTrace: error.stack,
        originalError: error,
      };
    }

    // 文字列エラーの処理
    if (typeof error === 'string') {
      return {
        type: 'unknown',
        code: 'STRING_ERROR',
        message: error,
        originalError: error,
      };
    }

    // その他のエラー
    return {
      type: 'unknown',
      code: 'UNKNOWN_ERROR',
      message: String(error),
      originalError: error,
    };
  }

  /**
   * 🔍 APIエラータイプの判定
   */
  private determineApiErrorType(statusCode: number): ErrorType {
    if (statusCode >= 400 && statusCode < 500) {
      if (statusCode === 401 || statusCode === 403) {
        return 'auth';
      }
      if (statusCode === 400) {
        return 'validation';
      }
      if (statusCode === 404) {
        return 'api';
      }
      return 'client';
    }

    if (statusCode >= 500) {
      return 'server';
    }

    return 'api';
  }

  /**
   * 📊 エラーパターンの分析
   */
  private analyzeErrorPattern(error: any): ErrorPattern {
    const key = `${error.type}_${error.code}`;

    if (this.errorPatterns.has(key)) {
      const pattern = this.errorPatterns.get(key)!;
      pattern.occurrences++;
      pattern.lastOccurrence = new Date().toISOString();
      return pattern;
    }

    // 新しいパターンの作成
    const newPattern: ErrorPattern = {
      key,
      type: error.type,
      code: error.code,
      occurrences: 1,
      firstOccurrence: new Date().toISOString(),
      lastOccurrence: new Date().toISOString(),
      severity: this.determineSeverity(error),
      autoRetry: this.shouldAutoRetry(error),
      userMessage: this.generateUserMessage(error),
      recoveryActions: this.generateRecoveryActions(error),
    };

    this.errorPatterns.set(key, newPattern);
    return newPattern;
  }

  /**
   * 🎯 エラー重要度の判定
   */
  private determineSeverity(error: any): ErrorSeverity {
    // 認証・セキュリティエラーは高重要度
    if (error.type === 'auth' || error.type === 'security') {
      return 'high';
    }

    // サーバーエラーは重要度高
    if (error.type === 'server') {
      return 'high';
    }

    // ネットワークエラーは中程度
    if (error.type === 'network') {
      return 'medium';
    }

    // バリデーションエラーは低重要度
    if (error.type === 'validation') {
      return 'low';
    }

    // クライアントエラーは中程度
    if (error.type === 'client') {
      return 'medium';
    }

    return 'medium';
  }

  /**
   * 🔄 自動リトライ判定
   */
  private shouldAutoRetry(error: any): boolean {
    // ネットワークエラーは自動リトライ
    if (error.type === 'network') {
      return true;
    }

    // サーバーエラー（5xx）は自動リトライ
    if (error.type === 'server') {
      return true;
    }

    // タイムアウトエラーは自動リトライ
    if (error.code === 'TIMEOUT') {
      return true;
    }

    // その他は自動リトライしない
    return false;
  }

  /**
   * 💬 ユーザーメッセージの生成
   */
  private generateUserMessage(error: any): string {
    const messages: Record<string, string> = {
      auth: '認証に失敗しました。再度ログインしてください。',
      network: 'ネットワーク接続に問題があります。インターネット接続を確認してください。',
      server: 'サーバーに問題が発生しています。しばらく待ってから再試行してください。',
      validation: '入力内容に問題があります。内容を確認して再度お試しください。',
      permission: 'この操作を実行する権限がありません。',
      timeout: '処理がタイムアウトしました。再度お試しください。',
      api: 'APIエラーが発生しました。',
      client: 'アプリケーションエラーが発生しました。',
      security: 'セキュリティエラーが発生しました。',
      unknown: '予期しないエラーが発生しました。',
    };

    return messages[error.type] || messages.unknown;
  }

  /**
   * 🛠️ 復旧アクションの生成
   */
  private generateRecoveryActions(
    error: any
  ): Array<{ label: string; action: string; primary?: boolean }> {
    const baseActions = [
      { label: '再試行', action: 'retry', primary: true },
      { label: '閉じる', action: 'dismiss' },
    ];

    const typeSpecificActions: Record<
      string,
      Array<{ label: string; action: string; primary?: boolean }>
    > = {
      auth: [
        { label: 'ログイン', action: 'login', primary: true },
        { label: 'パスワードリセット', action: 'reset_password' },
        { label: '閉じる', action: 'dismiss' },
      ],
      network: [
        { label: '接続確認', action: 'check_connection', primary: true },
        { label: '再試行', action: 'retry' },
        { label: 'オフラインモード', action: 'offline_mode' },
        { label: '閉じる', action: 'dismiss' },
      ],
      validation: [
        { label: '内容を確認', action: 'review_input', primary: true },
        { label: '閉じる', action: 'dismiss' },
      ],
    };

    return typeSpecificActions[error.type] || baseActions;
  }

  /**
   * 🏗️ 統一エラーオブジェクトの作成
   */
  private createUnifiedError(error: any, pattern: ErrorPattern): UnifiedError {
    const id = this.generateErrorId();

    return {
      id,
      type: error.type,
      severity: pattern.severity,
      code: error.code,
      message: error.message,
      userMessage: pattern.userMessage,
      timestamp: new Date().toISOString(),
      context: {
        component: error.context?.component,
        action: error.context?.action,
        userId: error.context?.userId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        stackTrace: this.config.showStackTrace ? error.stackTrace : undefined,
        additionalData: error.context?.additionalData,
      },
      recovery: {
        autoRetry: pattern.autoRetry,
        retryAttempts: 0,
        maxRetries: this.config.maxRetryAttempts,
        retryDelay: this.config.retryDelayMs,
        userActions: pattern.recoveryActions,
      },
      resolved: false,
    };
  }

  /**
   * 📝 エラーのログ出力
   */
  private logError(error: UnifiedError): void {
    const logLevel = this.config.logLevel;
    const logData = {
      id: error.id,
      type: error.type,
      severity: error.severity,
      code: error.code,
      message: error.message,
      context: error.context,
    };

    switch (error.severity) {
      case 'critical':
        console.error('🔴 CRITICAL ERROR:', logData);
        break;
      case 'high':
        console.error('🟠 HIGH SEVERITY ERROR:', logData);
        break;
      case 'medium':
        console.warn('🟡 MEDIUM SEVERITY ERROR:', logData);
        break;
      case 'low':
        if (logLevel === 'debug' || logLevel === 'info') {
          console.info('🔵 LOW SEVERITY ERROR:', logData);
        }
        break;
    }
  }

  /**
   * 📊 システムイベントの記録
   */
  private recordSystemEvent(error: UnifiedError): void {
    store.dispatch(
      addSystemEvent({
        id: `error_${error.id}`,
        type: error.severity === 'critical' || error.severity === 'high' ? 'error' : 'warning',
        message: `${error.type.toUpperCase()}: ${error.message}`,
        timestamp: error.timestamp,
        component: error.context.component || 'UnifiedErrorHandler',
      })
    );
  }

  /**
   * 📢 ユーザー通知
   */
  private notifyUser(error: UnifiedError): void {
    // Toast通知
    switch (error.severity) {
      case 'critical':
      case 'high':
        toast.error(error.userMessage, {
          duration: 6000,
          id: error.id,
        });
        break;
      case 'medium':
        toast.error(error.userMessage, {
          duration: 4000,
          id: error.id,
        });
        break;
      case 'low':
        toast(error.userMessage, {
          duration: 3000,
          id: error.id,
        });
        break;
    }

    // システム通知（重要なエラーのみ）
    if (error.severity === 'critical' || error.severity === 'high') {
      store.dispatch(
        addNotification({
          id: `error_notification_${error.id}`,
          type: 'system',
          title: 'エラーが発生しました',
          message: error.userMessage,
          timestamp: error.timestamp,
          read: false,
          priority: error.severity === 'critical' ? 'critical' : 'high',
          actionUrl: `/errors/${error.id}`,
        })
      );
    }
  }

  /**
   * 🔄 自動復旧の試行
   */
  private async attemptAutoRecovery(error: UnifiedError): Promise<void> {
    if (error.recovery.retryAttempts >= error.recovery.maxRetries) {
      console.log(`❌ Max retry attempts reached for error ${error.id}`);
      return;
    }

    const retryKey = error.id;
    const delay = error.recovery.retryDelay * Math.pow(2, error.recovery.retryAttempts); // 指数バックオフ

    console.log(`🔄 Scheduling auto-recovery for error ${error.id} in ${delay}ms`);

    setTimeout(async () => {
      try {
        error.recovery.retryAttempts++;

        // 具体的な復旧ロジックは error.type に応じて実装
        const recovered = await this.executeRecovery(error);

        if (recovered) {
          this.resolveError(error.id, 'auto_recovery');
          toast.success('問題が自動的に解決されました');
        } else {
          // 再試行
          this.attemptAutoRecovery(error);
        }
      } catch (recoveryError) {
        console.error(`❌ Auto-recovery failed for error ${error.id}:`, recoveryError);
      }
    }, delay);
  }

  /**
   * 🛠️ 復旧の実行
   */
  private async executeRecovery(error: UnifiedError): Promise<boolean> {
    switch (error.type) {
      case 'network':
        // ネットワーク接続の確認
        return navigator.onLine;

      case 'auth':
        // 認証の再試行（簡易版）
        try {
          const token = localStorage.getItem('unified_access_token');
          return !!token;
        } catch {
          return false;
        }

      case 'api':
        // API呼び出しの再試行（実装は呼び出し元に依存）
        return true; // 呼び出し元で再試行される前提

      default:
        return false;
    }
  }

  /**
   * ✅ エラーの解決
   */
  public resolveError(errorId: string, resolution: string): void {
    const error = this.errors.get(errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = new Date().toISOString();
      error.resolution = resolution;

      console.log(`✅ Error ${errorId} resolved: ${resolution}`);
    }
  }

  /**
   * 📊 エラー統計の取得
   */
  public getStatistics(): ErrorStatistics {
    const errors = Array.from(this.errors.values());

    const errorsByType = errors.reduce(
      (acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      },
      {} as Record<ErrorType, number>
    );

    const errorsBySeverity = errors.reduce(
      (acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      },
      {} as Record<ErrorSeverity, number>
    );

    const resolvedErrors = errors.filter((e) => e.resolved).length;
    const unresolvedErrors = errors.length - resolvedErrors;

    const resolvedErrorsWithTime = errors.filter((e) => e.resolved && e.resolvedAt);
    const averageResolutionTime =
      resolvedErrorsWithTime.length > 0
        ? resolvedErrorsWithTime.reduce((sum, error) => {
            const resolutionTime =
              new Date(error.resolvedAt!).getTime() - new Date(error.timestamp).getTime();
            return sum + resolutionTime;
          }, 0) / resolvedErrorsWithTime.length
        : 0;

    const errorCounts = Array.from(this.errorPatterns.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10)
      .map((pattern) => ({
        code: pattern.code,
        count: pattern.occurrences,
        lastOccurrence: pattern.lastOccurrence,
      }));

    return {
      totalErrors: errors.length,
      errorsByType,
      errorsBySeverity,
      resolvedErrors,
      unresolvedErrors,
      averageResolutionTime,
      mostCommonErrors: errorCounts,
    };
  }

  /**
   * 🔧 フォールバックエラーの作成
   */
  private createFallbackError(originalError: any, context?: any): UnifiedError {
    return {
      id: this.generateErrorId(),
      type: 'unknown',
      severity: 'medium',
      code: 'HANDLER_FAILED',
      message: 'Error handler failed',
      userMessage: '予期しないエラーが発生しました',
      timestamp: new Date().toISOString(),
      context: {
        component: context?.component,
        action: context?.action,
        userId: context?.userId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        additionalData: { originalError: String(originalError) },
      },
      recovery: {
        autoRetry: false,
        retryAttempts: 0,
        maxRetries: 0,
        retryDelay: 0,
        userActions: [{ label: '閉じる', action: 'dismiss' }],
      },
      resolved: false,
    };
  }

  /**
   * 📡 エラーレポートの送信
   */
  private async reportError(error: UnifiedError): Promise<void> {
    try {
      // エラーレポートAPIへの送信（実装は環境に依存）
      console.log('📡 Reporting critical error:', {
        id: error.id,
        type: error.type,
        code: error.code,
        message: error.message,
        context: error.context,
      });

      // 実際の実装では外部サービス（Sentry、Bugsnag等）に送信
    } catch (reportError) {
      console.error('❌ Failed to report error:', reportError);
    }
  }

  /**
   * ⚙️ エラーパターンの初期化
   */
  private initializeErrorPatterns(): void {
    // 既知のエラーパターンを事前定義
    const knownPatterns: ErrorPattern[] = [
      {
        key: 'network_NETWORK_ERROR',
        type: 'network',
        code: 'NETWORK_ERROR',
        occurrences: 0,
        firstOccurrence: '',
        lastOccurrence: '',
        severity: 'medium',
        autoRetry: true,
        userMessage: 'ネットワーク接続に問題があります',
        recoveryActions: [
          { label: '接続確認', action: 'check_connection', primary: true },
          { label: '再試行', action: 'retry' },
        ],
      },
      {
        key: 'auth_AUTH_ERROR',
        type: 'auth',
        code: 'AUTH_ERROR',
        occurrences: 0,
        firstOccurrence: '',
        lastOccurrence: '',
        severity: 'high',
        autoRetry: false,
        userMessage: '認証に失敗しました',
        recoveryActions: [
          { label: 'ログイン', action: 'login', primary: true },
          { label: 'パスワードリセット', action: 'reset_password' },
        ],
      },
    ];

    knownPatterns.forEach((pattern) => {
      this.errorPatterns.set(pattern.key, pattern);
    });
  }

  /**
   * 🆔 エラーIDの生成
   */
  private generateErrorId(): string {
    return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 📋 パブリックAPI
   */
  public getError(errorId: string): UnifiedError | undefined {
    return this.errors.get(errorId);
  }

  public getAllErrors(): UnifiedError[] {
    return Array.from(this.errors.values());
  }

  public getUnresolvedErrors(): UnifiedError[] {
    return Array.from(this.errors.values()).filter((error) => !error.resolved);
  }

  public clearResolvedErrors(): void {
    for (const [id, error] of this.errors.entries()) {
      if (error.resolved) {
        this.errors.delete(id);
      }
    }
  }

  public updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ErrorHandlerConfig {
    return { ...this.config };
  }
}

// 型定義
interface ErrorPattern {
  key: string;
  type: ErrorType;
  code: string;
  occurrences: number;
  firstOccurrence: string;
  lastOccurrence: string;
  severity: ErrorSeverity;
  autoRetry: boolean;
  userMessage: string;
  recoveryActions: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
}

interface RetryConfig {
  errorId: string;
  attempts: number;
  nextRetry: number;
}

// シングルトンインスタンスをエクスポート
export const unifiedErrorHandler = UnifiedErrorHandler.getInstance();

// デフォルトエクスポート
export default unifiedErrorHandler;
