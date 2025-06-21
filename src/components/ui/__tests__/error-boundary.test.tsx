import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary, withErrorBoundary } from '../error-boundary';

// コンソールエラーをモック
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// エラーを投げるテストコンポーネント
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>正常なコンポーネント</div>;
};

// Object.assign を使ってクリップボードAPIをモック
const mockClipboard = {
  writeText: jest.fn(),
};
Object.assign(navigator, {
  clipboard: mockClipboard,
});

// alertをモック
global.alert = jest.fn();

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  it('正常なコンポーネントが正しく表示される', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
  });

  it('エラーが発生した時にエラー画面が表示される', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('申し訳ございません。エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('再試行')).toBeInTheDocument();
    expect(screen.getByText('ホームに戻る')).toBeInTheDocument();
    expect(screen.getByText('バグ報告')).toBeInTheDocument();
  });

  it('カスタムフォールバックが正しく表示される', () => {
    const customFallback = <div>カスタムエラー画面</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('カスタムエラー画面')).toBeInTheDocument();
    expect(screen.queryByText('申し訳ございません。エラーが発生しました')).not.toBeInTheDocument();
  });

  it('エラーカテゴリが正しく分類される', () => {
    const testCases = [
      { error: 'Network error occurred', expectedCategory: 'ネットワークエラー' },
      { error: 'Failed to fetch', expectedCategory: 'ネットワークエラー' },
      { error: 'Chunk load error', expectedCategory: 'リソース読み込みエラー' },
      { error: 'Cannot read property of undefined', expectedCategory: 'データエラー' },
      { error: 'null is not an object', expectedCategory: 'データエラー' },
      { error: 'Permission denied', expectedCategory: '認証エラー' },
      { error: 'Unauthorized access', expectedCategory: '認証エラー' },
      { error: 'Some other error', expectedCategory: 'アプリケーションエラー' },
    ];

    testCases.forEach(({ error, expectedCategory }) => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage={error} />
        </ErrorBoundary>
      );

      expect(screen.getByText(expectedCategory)).toBeInTheDocument();
      unmount();
    });
  });

  it('再試行ボタンが正しく機能する', () => {
    let shouldThrow = true;
    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // エラー画面が表示されることを確認
    expect(screen.getByText('申し訳ございません。エラーが発生しました')).toBeInTheDocument();

    // エラーを解決
    shouldThrow = false;

    // 再試行ボタンをクリック
    fireEvent.click(screen.getByText('再試行'));

    // コンポーネントを再レンダリング
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // 正常な状態に戻ることを確認
    expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
  });

  it('ホームに戻るボタンが正しく機能する', () => {
    // window.location.hrefを模擬
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('ホームに戻る'));

    expect(window.location.href).toBe('/');
  });

  it('バグ報告ボタンがクリップボードにコピーする', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Test error for bug report" />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('バグ報告'));

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('"message": "Test error for bug report"')
      );
    });

    expect(global.alert).toHaveBeenCalledWith(
      'バグレポートをクリップボードにコピーしました。GitHubのIssueに貼り付けてください。'
    );
  });

  it('クリップボードコピーが失敗した場合のハンドリング', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'));

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('バグ報告'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'クリップボードへのコピーに失敗しました。手動でバグレポートを作成してください。'
      );
    });
  });

  it('カスタムエラーハンドラーが呼び出される', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} errorMessage="Custom handler test" />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom handler test',
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('エラーIDが生成される', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorIdElement = screen.getByText(/ID: error_/);
    expect(errorIdElement).toBeInTheDocument();

    const idText = errorIdElement.textContent;
    expect(idText).toMatch(/ID: error_\d+_[a-z0-9]+/);
  });

  it('開発環境で詳細情報が表示される', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('開発者向け詳細情報')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('本番環境で詳細情報が隠される', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('開発者向け詳細情報')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('withErrorBoundary HOC', () => {
  it('正常なコンポーネントをラップする', () => {
    const TestComponent = () => <div>HOCテストコンポーネント</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('HOCテストコンポーネント')).toBeInTheDocument();
  });

  it('エラーを適切にキャッチする', () => {
    const TestComponent = () => <ThrowError shouldThrow={true} />;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('申し訳ございません。エラーが発生しました')).toBeInTheDocument();
  });

  it('displayNameが正しく設定される', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });

  it('カスタムプロパティが渡される', () => {
    const customFallback = <div>カスタムHOCエラー</div>;
    const TestComponent = () => <ThrowError shouldThrow={true} />;
    const WrappedComponent = withErrorBoundary(TestComponent, {
      fallback: customFallback,
    });

    render(<WrappedComponent />);

    expect(screen.getByText('カスタムHOCエラー')).toBeInTheDocument();
  });
});
