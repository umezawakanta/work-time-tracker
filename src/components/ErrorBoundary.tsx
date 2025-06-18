import React, { ErrorInfo, ReactNode, Component } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーロギングや分析サービスへのレポートをここで行うことができます
    console.error('Uncaught error:', error, errorInfo);
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

  static getDerivedStateFromError(error: Error) {
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
