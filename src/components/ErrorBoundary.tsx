import React, { ErrorInfo, ReactNode, Component } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 🐛 エラーエリミネーター: 詳細なエラーロギング
    console.error('❌ Uncaught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // エラーを開発バッジシステムに報告
    this.reportErrorToBadgeSystem(error, errorInfo);
  }

  private reportErrorToBadgeSystem = (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorData = {
        error: error.message,
        stack: error.stack || 'No stack trace',
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      };

      console.error('❌ Uncaught error:', errorData);

      // LocalStorage容量制限でエラーログを制限
      try {
        const existingLogs = localStorage.getItem('error_logs');
        let logs: any[] = [];

        if (existingLogs) {
          logs = JSON.parse(existingLogs);
        }

        // 最新10件のみ保持
        logs.push(errorData);
        if (logs.length > 10) {
          logs = logs.slice(-10);
        }

        localStorage.setItem('error_logs', JSON.stringify(logs));
      } catch (storageError) {
        // LocalStorage容量超過の場合は古いログをクリア
        console.warn('LocalStorage full, clearing error logs');
        try {
          localStorage.removeItem('error_logs');
          localStorage.setItem('error_logs', JSON.stringify([errorData]));
        } catch (clearError) {
          // 完全に失敗した場合はログをスキップ
          console.warn('Cannot store error logs:', clearError);
        }
      }

      // バッジシステムに通知（開発環境のみ）
      if (process.env.NODE_ENV === 'development') {
        // 開発環境でのエラー通知
        setTimeout(() => {
          if (window.postMessage) {
            window.postMessage(
              {
                type: 'ERROR_BOUNDARY_TRIGGERED',
                payload: errorData,
              },
              '*'
            );
          }
        }, 100);
      }
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  };

  render() {
    if (this.state.hasError) {
      // カスタムのエラー表示UIをここでレンダリングできます
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
          <p className="mb-4">申し訳ありませんが、予期せぬエラーが発生しました。</p>
          <p>ページを再読み込みするか、しばらくしてからもう一度お試しください。</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

export class IntegratedDashboardErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('IntegratedDashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">ダッシュボードでエラーが発生しました</h2>
          <p className="text-gray-600 mb-4">ページを再読み込みしてください</p>
          <Button onClick={() => window.location.reload()}>再読み込み</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// GuitarPracticePage専用のエラーハンドリング
export class GuitarPracticeErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GuitarPractice Error:', error, errorInfo);

    // 日付関連のエラーの場合は特別な処理
    if (error.message.includes('Invalid time value')) {
      console.error('Date validation error detected in GuitarPractice');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">データの読み込みでエラーが発生しました</h2>
          <p className="text-gray-600 mb-4">練習データに不正な値が含まれている可能性があります。</p>
          <Button onClick={() => this.setState({ hasError: false })}>再試行</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export class SubscriptionErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Subscription Error:', error, errorInfo);

    // filter関連のエラーの場合は特別な処理
    if (error.message.includes('filter is not a function')) {
      console.error('Array filter error detected in Subscription page');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">
            サブスクリプションデータの読み込みでエラーが発生しました
          </h2>
          <p className="text-gray-600 mb-4">データの形式に問題がある可能性があります。</p>
          <Button onClick={() => this.setState({ hasError: false })}>再試行</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
