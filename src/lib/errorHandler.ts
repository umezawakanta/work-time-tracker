// 🐛 エラーエリミネーター: 統一的なエラーハンドリングシステム

export interface ErrorReport {
  type: 'api_error' | 'react_error' | 'console_error' | 'network_error';
  message: string;
  stack?: string;
  component?: string;
  endpoint?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount = 0;
  private maxErrors = 50; // エラーエリミネーター目標: 50件以下

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // API エラーハンドリング
  public handleApiError(error: any, endpoint: string): ErrorReport {
    const errorReport: ErrorReport = {
      type: 'api_error',
      message: error.message || 'API request failed',
      endpoint,
      timestamp: new Date().toISOString(),
      severity: this.getSeverity(error.status),
    };

    this.logError(errorReport);
    return errorReport;
  }

  // React エラーハンドリング
  public handleReactError(error: Error, componentStack?: string): ErrorReport {
    const errorReport: ErrorReport = {
      type: 'react_error',
      message: error.message,
      stack: error.stack,
      component: componentStack,
      timestamp: new Date().toISOString(),
      severity: 'high',
    };

    this.logError(errorReport);
    return errorReport;
  }

  // ネットワークエラーハンドリング
  public handleNetworkError(error: any): ErrorReport {
    const errorReport: ErrorReport = {
      type: 'network_error',
      message: error.message || 'Network error occurred',
      timestamp: new Date().toISOString(),
      severity: 'medium',
    };

    this.logError(errorReport);
    return errorReport;
  }

  // エラーの重要度判定
  private getSeverity(status?: number): 'low' | 'medium' | 'high' | 'critical' {
    if (!status) return 'medium';

    if (status >= 500) return 'critical';
    if (status >= 400) return 'high';
    if (status >= 300) return 'medium';
    return 'low';
  }

  // エラーログの保存
  private logError(errorReport: ErrorReport): void {
    try {
      console.error(`🐛 [${errorReport.severity.toUpperCase()}] ${errorReport.type}:`, errorReport);

      // LocalStorageに保存（クォータ管理付き）
      this.saveErrorWithQuotaManagement(errorReport);

      // エラーエリミネーター進捗の更新
      this.updateBadgeProgress();
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  private saveErrorWithQuotaManagement(errorReport: ErrorReport): void {
    const MAX_ERRORS = 50; // 保存する最大エラー数を削減
    const MIN_ERRORS = 25; // クォータ超過時に削減する目標数

    try {
      const existingErrors = this.getStoredErrors();
      existingErrors.push(errorReport);

      // 最大件数制限
      if (existingErrors.length > MAX_ERRORS) {
        existingErrors.splice(0, existingErrors.length - MAX_ERRORS);
      }

      this.tryStoreErrors(existingErrors);
      this.errorCount = existingErrors.length;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('🧹 LocalStorage quota exceeded, cleaning up old error logs...');
        this.handleQuotaExceeded(errorReport, MIN_ERRORS);
      } else {
        throw error;
      }
    }
  }

  private tryStoreErrors(errors: ErrorReport[]): void {
    const errorData = JSON.stringify(errors);

    // データサイズをチェック（5MB制限の参考値）
    const dataSize = new Blob([errorData]).size;
    if (dataSize > 1024 * 1024) {
      // 1MB以上の場合は警告
      console.warn(`⚠️ Error log data size is large: ${Math.round(dataSize / 1024)}KB`);
    }

    localStorage.setItem('error_logs', errorData);
  }

  private handleQuotaExceeded(newError: ErrorReport, targetCount: number): void {
    try {
      // 1. 現在のエラーログを取得
      const existingErrors = this.getStoredErrors();

      // 2. 最新のerrorのみ残して大幅に削減
      const recentErrors = existingErrors.slice(-targetCount + 1); // 新しいエラー用に1つ空けておく
      recentErrors.push(newError);

      // 3. 再度保存を試行
      this.tryStoreErrors(recentErrors);
      this.errorCount = recentErrors.length;

      console.info(
        `✅ Cleaned up error logs: ${existingErrors.length} → ${recentErrors.length} entries`
      );
    } catch (retryError) {
      // 最後の手段: すべてのエラーログをクリアして新しいエラーのみ保存
      console.warn('🧹 Critical cleanup: clearing all error logs');
      try {
        localStorage.removeItem('error_logs');
        this.tryStoreErrors([newError]);
        this.errorCount = 1;
      } catch (finalError) {
        // LocalStorage完全に利用不可の場合はメモリのみで動作
        console.error('❌ LocalStorage completely unavailable, operating in memory-only mode');
        this.errorCount = 1;
      }
    }
  }

  // 保存されたエラーの取得
  public getStoredErrors(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
      return [];
    }
  }

  // エラー統計の取得
  public getErrorStats() {
    const errors = this.getStoredErrors();
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentErrors = errors.filter((error) => new Date(error.timestamp) > last24Hours);

    return {
      totalErrors: errors.length,
      recentErrors: recentErrors.length,
      criticalErrors: errors.filter((e) => e.severity === 'critical').length,
      isUnderLimit: errors.length <= this.maxErrors,
      progress: Math.max(0, 100 - (errors.length / this.maxErrors) * 100),
    };
  }

  // バッジ進捗の更新
  private updateBadgeProgress(): void {
    const stats = this.getErrorStats();

    // カスタムイベントでバッジシステムに通知
    window.dispatchEvent(
      new CustomEvent('errorStatsUpdated', {
        detail: stats,
      })
    );
  }

  // エラーログのクリア
  public clearErrorLogs(): void {
    localStorage.removeItem('error_logs');
    this.errorCount = 0;
    this.updateBadgeProgress();
    console.log('🐛 Error logs cleared');
  }
}

// グローバルエラーハンドラーの設定
export const setupGlobalErrorHandling = (): void => {
  const errorHandler = ErrorHandler.getInstance();

  // 未処理のPromise rejection
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleNetworkError({
      message: `Unhandled promise rejection: ${event.reason}`,
    });
  });

  // 一般的なJavaScriptエラー
  window.addEventListener('error', (event) => {
    errorHandler.handleReactError(new Error(event.message), event.filename);
  });

  console.log('🐛 Global error handling setup complete');
};

// エクスポート
export default ErrorHandler;
