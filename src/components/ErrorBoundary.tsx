import React, { ErrorInfo, ReactNode, Component } from 'react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

interface ErrorBoundaryProps {
  children: ReactNode;
  // When variant is 'app', show AI-specific messaging if detected
  variant?: 'default' | 'app';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 🐛 エラーエリミネーター: 詳細なエラーロギング
    console.error('❌ Uncaught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // エラーを開発バッジシステムに報告 & analyticsタグ送信
    this.reportErrorToBadgeSystem(error, errorInfo);
    try {
      trackEvent('error_boundary', {
        message: error.message,
        stack: (error.stack || '').slice(0, 500),
        componentStack: errorInfo.componentStack.slice(0, 500),
        variant: this.props.variant || 'default',
      });
    } catch {}
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
        let logs: unknown[] = [];

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

  private isAIError(error?: Error): boolean {
    if (!error) return false;
    const msg = (error.message || '').toLowerCase();
    return (
      msg.includes('openai') ||
      msg.includes('anthropic') ||
      msg.includes('gemini') ||
      msg.includes('ai provider') ||
      msg.includes('ai ') ||
      msg.includes('ai-')
    );
  }

  render() {
    if (this.state.hasError) {
      const aiError = this.props.variant === 'app' && this.isAIError(this.state.error);
      return (
        <div className="container mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl font-bold mb-3">
            {aiError ? 'AI機能でエラーが発生しました' : 'エラーが発生しました'}
          </h1>
          <p className="mb-4 text-slate-700">
            {aiError
              ? 'APIキー・レート制限・ネットワーク状態をご確認ください。問題が続く場合は設定を見直してください。'
              : '申し訳ありませんが、予期せぬエラーが発生しました。'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {aiError && (
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    window.location.assign('/settings');
                  } catch {
                    // noop
                  }
                }}
                aria-label="設定ページを開く"
              >
                設定を開く
              </Button>
            )}
            <Button onClick={() => window.location.reload()} aria-label="ページを再読み込み">
              再読み込み
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  const details = JSON.stringify(
                    {
                      message: this.state.error?.message,
                      stack: this.state.error?.stack,
                      time: new Date().toISOString(),
                    },
                    null,
                    2
                  );
                  navigator.clipboard?.writeText(details);
                } catch {}
              }}
              aria-label="エラー詳細をコピー"
            >
              エラー詳細をコピー
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                try {
                  const body = encodeURIComponent(
                    `問題の内容:\n\n再現手順:\n\n期待する動作:\n\n----\n` +
                      `エラー詳細:\n${this.state.error?.message}\n\n${this.state.error?.stack}`
                  );
                  window.location.href = `mailto:dev@yourdomain.example?subject=${encodeURIComponent(
                    'Work Time Tracker エラー報告'
                  )}&body=${body}`;
                } catch {}
              }}
              aria-label="開発者に報告"
            >
              開発者に報告
            </Button>
          </div>
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
          <Button onClick={() => window.location.reload()} aria-label="ページを再読み込み">
            再読み込み
          </Button>
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
          <Button onClick={() => this.setState({ hasError: false })} aria-label="再試行">
            再試行
          </Button>
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
          <Button onClick={() => this.setState({ hasError: false })} aria-label="再試行">
            再試行
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
