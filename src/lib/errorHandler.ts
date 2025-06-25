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

      // LocalStorageに保存
      const existingErrors = this.getStoredErrors();
      existingErrors.push(errorReport);

      // 最新100件のみ保持
      if (existingErrors.length > 100) {
        existingErrors.splice(0, existingErrors.length - 100);
      }

      localStorage.setItem('error_logs', JSON.stringify(existingErrors));
      this.errorCount = existingErrors.length;

      // エラーエリミネーター進捗の更新
      this.updateBadgeProgress();
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
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
