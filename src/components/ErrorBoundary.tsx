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

  private reportErrorToBadgeSystem(error: Error, errorInfo: ErrorInfo) {
    // 🐛 エラーエリミネーター: エラー統計の更新
    try {
      const errorReport = {
        type: 'react_error',
        message: error.message,
        component: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      };

      // LocalStorageにエラーログを保存
      const existingErrors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingErrors.push(errorReport);

      // 最新100件のエラーのみ保持
      if (existingErrors.length > 100) {
        existingErrors.splice(0, existingErrors.length - 100);
      }

      localStorage.setItem('error_logs', JSON.stringify(existingErrors));
      console.log('🐛 Error reported to badge system');
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

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
