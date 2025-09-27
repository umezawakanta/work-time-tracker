import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // エラーが発生した時にstateを更新
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 親コンポーネントにエラーを通知
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // グローバルエラーハンドラーを呼び出し
    const errorEvent = new ErrorEvent('error', {
      error,
      message: error.message,
      filename: errorInfo.componentStack?.split('\n')[1] || 'Unknown component',
      lineno: 0,
      colno: 0,
    });
    
    // カスタムイベントを発火してApp.tsxのエラーハンドラーに通知
    window.dispatchEvent(errorEvent);
  }

  render() {
    if (this.state.hasError) {
      // エラーが発生した場合のフォールバックUI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#ffe0e0',
          color: '#d63031'
        }}>
          <h3>🚨 コンポーネントエラーが発生しました</h3>
          <p>このコンポーネントでエラーが発生しました。自動的に不具合報告ページに遷移します。</p>
          <details style={{ marginTop: '10px' }}>
            <summary>エラーの詳細</summary>
            <pre style={{ 
              fontSize: '12px', 
              backgroundColor: '#f8f8f8', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
