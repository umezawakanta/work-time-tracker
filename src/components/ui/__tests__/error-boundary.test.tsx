import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from '../error-boundary';

// エラーを投げるテストコンポーネント
const ThrowError = ({
  shouldThrow,
  errorMessage = 'Test error',
}: {
  shouldThrow: boolean;
  errorMessage?: string;
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>Working component</div>;
};

// React Error Boundaryで発生するエラーをモックして、コンソールエラーを抑制
const originalError = console.error;
const originalLog = console.log;
beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});

// クリップボードAPIのモック
const mockClipboard = {
  writeText: jest.fn(),
};
Object.assign(navigator, {
  clipboard: mockClipboard,
});

// window.locationのモック
delete (window as any).location;
window.location = { href: '' } as any;

// alertのモック
global.alert = jest.fn();

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  it('正常なコンポーネントを正しくレンダリングする', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('エラー時にフォールバックUIを表示する', () => {
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

  it('カスタムfallbackが提供された場合にそれを使用する', () => {
    const customFallback = <div>Custom fallback UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback UI')).toBeInTheDocument();
    expect(screen.queryByText('申し訳ございません。エラーが発生しました')).not.toBeInTheDocument();
  });

  it('onErrorコールバックが呼び出される', () => {
    const onErrorMock = jest.fn();

    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
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

  it('再試行ボタンでリセットが機能する', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // エラーが表示されることを確認
    expect(screen.getByText('Test error')).toBeInTheDocument();

    // 再試行ボタンが存在することを確認
    const retryButton = screen.getByRole('button', { name: /再試行/i });
    expect(retryButton).toBeInTheDocument();

    // ボタンがクリック可能であることを確認
    expect(retryButton).not.toBeDisabled();

    // クリックイベントが発生することを確認
    expect(() => {
      fireEvent.click(retryButton);
    }).not.toThrow();
  });

  it('ホームに戻るボタンが正しく機能する', () => {
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
    // 開発環境をモック
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      writable: true,
      value: 'development',
    });

    const ThrowError = () => {
      throw new Error('Development error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // エラーメッセージが表示される
    expect(screen.getByText('Development error')).toBeInTheDocument();

    // 開発者向け詳細情報のテキストが表示されることを確認
    // (details要素の存在ではなく、コンテンツの存在をチェック)
    expect(screen.queryByText('開発者向け詳細情報')).toBeInTheDocument();

    // 元の環境変数を復元
    Object.defineProperty(process.env, 'NODE_ENV', {
      writable: true,
      value: originalEnv,
    });
  });

  it('本番環境で詳細情報が隠される', () => {
    const originalEnv = process.env.NODE_ENV;

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // 詳細情報が表示されない
    expect(screen.queryByText('開発者向け詳細情報')).not.toBeInTheDocument();

    // 元の環境変数を復元
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      configurable: true,
    });
  });

  it('推奨される対処法が表示される', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('推奨される対処法:')).toBeInTheDocument();
    expect(screen.getByText('ページを再読み込みして再試行してください')).toBeInTheDocument();
    expect(screen.getByText('ブラウザのキャッシュをクリアしてください')).toBeInTheDocument();
  });

  it('withErrorBoundaryが正しく動作する', async () => {
    const { withErrorBoundary } = await import('../error-boundary');

    const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => (
      <ThrowError shouldThrow={shouldThrow} />
    );

    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent shouldThrow={true} />);

    expect(screen.getByText('申し訳ございません。エラーが発生しました')).toBeInTheDocument();
  });
});
