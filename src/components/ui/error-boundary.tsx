import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './button';
import { useAnalytics } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private analytics = null as any;
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
    // Lazy init analytics functions via a hook-like accessor
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useAnalytics } = require('@/lib/analytics');
      this.analytics = useAnalytics();
    } catch {
      this.analytics = null;
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // エラーログ送信
    this.logError(error, errorInfo);

    // カスタムエラーハンドラーの実行
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    };

    // 開発環境ではコンソールにログ出力
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught An Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // 本番環境では外部サービスにエラー送信（例：Sentry）
    // ここでは簡易的にアナリティクスイベントとして記録
    try {
      const track = this.analytics?.trackEvent;
      if (track) {
        track('error_boundary_triggered', {
          category: this.getErrorCategory(error),
          errorId: this.state.errorId,
          message: error.message,
        });
      }
    } catch {}
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const bugReport = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    // バグレポートをクリップボードにコピー
    navigator.clipboard
      .writeText(JSON.stringify(bugReport, null, 2))
      .then(() => {
        alert('バグレポートをクリップボードにコピーしました。GitHubのIssueに貼り付けてください。');
      })
      .catch(() => {
        alert('クリップボードへのコピーに失敗しました。手動でバグレポートを作成してください。');
      });
  };

  private getErrorCategory = (error: Error): string => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'ネットワークエラー';
    }
    if (message.includes('chunk')) {
      return 'リソース読み込みエラー';
    }
    if (message.includes('undefined') || message.includes('null')) {
      return 'データエラー';
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return '認証エラー';
    }

    return 'アプリケーションエラー';
  };

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックが提供されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const errorCategory = error ? this.getErrorCategory(error) : 'Unknown';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    申し訳ございません。エラーが発生しました
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="destructive">{errorCategory}</Badge>
                    <Badge variant="outline" className="text-xs">
                      ID: {errorId}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">エラーの詳細:</h4>
                <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">
                  {error?.message || 'Unknown error occurred'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">推奨される対処法:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>ページを再読み込みして再試行してください</li>
                  <li>ブラウザのキャッシュをクリアしてください</li>
                  <li>別のブラウザでアクセスしてみてください</li>
                  <li>問題が継続する場合は、バグレポートを送信してください</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  再試行
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/')}
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  ホームに戻る
                </Button>
                <Button variant="outline" onClick={this.handleReportBug} className="flex-1">
                  <Bug className="mr-2 h-4 w-4" />
                  バグ報告
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    開発者向け詳細情報
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                    <div className="text-xs font-mono text-gray-800 whitespace-pre-wrap">
                      {error.stack}
                    </div>
                    {this.state.errorInfo && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="text-xs font-mono text-gray-800 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 高次コンポーネント版
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
