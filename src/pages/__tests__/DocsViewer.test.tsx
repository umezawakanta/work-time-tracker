import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import DocsViewer from '../DocsViewer';
import { server } from '../../__mocks__/server';

// MSWサーバーの設定
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// モックデータ
const mockDocuments = [
  {
    id: 'features/docs/requirements',
    title: 'Requirements',
    path: '/docs/features/docs/requirements.md',
    category: 'features',
    lastModified: '2024-01-01T00:00:00.000Z',
    size: 1024,
    description: 'Requirements document for the feature',
  },
  {
    id: 'api/docs/endpoints',
    title: 'API Endpoints',
    path: '/docs/api/docs/endpoints.md',
    category: 'api',
    lastModified: '2024-01-02T00:00:00.000Z',
    size: 2048,
    description: 'API endpoints documentation',
  },
];

const mockCategories = {
  features: {
    name: '機能仕様書',
    description: '各機能の要件定義、設計書、テスト仕様書',
  },
  api: {
    name: 'API仕様書',
    description: 'APIエンドポイントの仕様とドキュメント',
  },
};

// テスト用のラッパーコンポーネント
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe.skip('DocsViewer Component', () => {
  beforeEach(() => {
    // モックAPIレスポンスの設定
    server.use(
      http.get('/api/docs', ({ request }) => {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        if (action === 'list') {
          return HttpResponse.json({ success: true, data: mockDocuments, total: 2 });
        } else if (action === 'categories') {
          return HttpResponse.json({ success: true, data: mockCategories });
        } else if (action === 'content') {
          const id = url.searchParams.get('id');
          return HttpResponse.json({
            success: true,
            data: {
              content: '# Test Document\n\nThis is test content.',
              metadata: mockDocuments.find((doc) => doc.id === id),
            },
          });
        }
        return HttpResponse.json({}, { status: 404 });
      })
    );
  });

  describe('Rendering', () => {
    test('should render document list by default', async () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      expect(screen.getByText('ドキュメント')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ドキュメントを検索...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
        expect(screen.getByText('API Endpoints')).toBeInTheDocument();
      });
    });

    test('should render search input with correct placeholder', () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    test('should render category select dropdown', () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      const categorySelect = screen.getByDisplayValue('すべてのカテゴリ');
      expect(categorySelect).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    test('should update search query on input change', () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      expect(searchInput).toHaveValue('test query');
    });

    test('should update selected category on change', () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      const categorySelect = screen.getByDisplayValue('すべてのカテゴリ');
      fireEvent.change(categorySelect, { target: { value: 'features' } });
      expect(categorySelect).toHaveValue('features');
    });
  });

  describe('Document Filtering', () => {
    test('should filter documents based on search query', async () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      // 初期状態で全ドキュメントが表示される
      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
        expect(screen.getByText('API Endpoints')).toBeInTheDocument();
      });

      // 検索クエリを入力
      const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
      fireEvent.change(searchInput, { target: { value: 'Requirements' } });

      // 検索結果の確認
      expect(screen.getByText('Requirements')).toBeInTheDocument();
      expect(screen.queryByText('API Endpoints')).not.toBeInTheDocument();
    });

    test('should filter documents by category', async () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
        expect(screen.getByText('API Endpoints')).toBeInTheDocument();
      });

      // カテゴリを選択
      const categorySelect = screen.getByDisplayValue('すべてのカテゴリ');
      fireEvent.change(categorySelect, { target: { value: 'features' } });

      // フィルタリング結果の確認
      expect(screen.getByText('Requirements')).toBeInTheDocument();
      expect(screen.queryByText('API Endpoints')).not.toBeInTheDocument();
    });

    test('should clear search results when query is cleared', async () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');

      // 検索クエリを入力
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // 検索クエリをクリア
      fireEvent.change(searchInput, { target: { value: '' } });

      // 全ドキュメントが再表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
        expect(screen.getByText('API Endpoints')).toBeInTheDocument();
      });
    });
  });

  describe('Document Display', () => {
    test('should navigate to document when card is clicked', async () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
      });

      const openButton = screen.getByText('開く');
      fireEvent.click(openButton);

      // ドキュメント表示に切り替わる
      await waitFor(() => {
        expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
      });
    });

    test('should display loading state while fetching document', async () => {
      // 遅延レスポンスを設定
      server.use(
        http.get('/api/docs', ({ request }) => {
          const url = new URL(request.url);
          const action = url.searchParams.get('action');
          if (action === 'content') {
            return HttpResponse.json({
              success: true,
              data: {
                content: '# Test Document',
                metadata: mockDocuments[0],
              },
            });
          }
          return HttpResponse.json({}, { status: 404 });
        })
      );

      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
      });

      const openButton = screen.getByText('開く');
      fireEvent.click(openButton);

      // ローディング状態の確認
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    test('should display error message when document not found', async () => {
      server.use(
        http.get('/api/docs', ({ request }) => {
          const url = new URL(request.url);
          const action = url.searchParams.get('action');
          if (action === 'content') {
            return HttpResponse.json(
              {
                success: false,
                message: 'ドキュメントが見つかりません',
              },
              { status: 404 }
            );
          }
          return HttpResponse.json({}, { status: 404 });
        })
      );

      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
      });

      const openButton = screen.getByText('開く');
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByText('ドキュメントが見つかりません')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    test('should navigate between list and document view', async () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      // 初期状態は一覧表示
      expect(screen.getByText('ドキュメント')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ドキュメントを検索...')).toBeInTheDocument();

      // ドキュメントを開く
      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
      });

      const openButton = screen.getByText('開く');
      fireEvent.click(openButton);

      // ドキュメント表示に切り替わる
      await waitFor(() => {
        expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
      });

      // 一覧に戻る
      const backButton = screen.getByText('一覧に戻る');
      fireEvent.click(backButton);

      // 一覧表示に戻る
      await waitFor(() => {
        expect(screen.getByPlaceholderText('ドキュメントを検索...')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      server.use(
        http.get('/api/docs', () => {
          return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        })
      );

      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      // エラー状態の確認
      await waitFor(() => {
        expect(screen.getByText('ドキュメントの読み込みに失敗しました')).toBeInTheDocument();
      });
    });

    test('should handle network errors', async () => {
      server.use(
        http.get('/api/docs', () => {
          return HttpResponse.error();
        })
      );

      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      // エラー状態の確認
      await waitFor(() => {
        expect(screen.getByText('ドキュメントの読み込みに失敗しました')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
      expect(searchInput).toHaveAttribute('aria-label');

      const openButton = screen.getByText('開く');
      expect(openButton).toHaveAttribute('aria-label');
    });

    test('should have proper heading structure', () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('ドキュメント');
    });

    test('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Performance', () => {
    test('should render efficiently with large document list', async () => {
      const largeDocumentList = Array.from({ length: 100 }, (_, i) => ({
        id: `doc-${i}`,
        title: `Document ${i}`,
        category: 'features',
        description: `Description for document ${i}`,
        path: `/docs/doc-${i}.md`,
        lastModified: '2024-01-01T00:00:00.000Z',
        size: 1024,
      }));

      server.use(
        http.get('/api/docs', ({ request }) => {
          const url = new URL(request.url);
          const action = url.searchParams.get('action');
          if (action === 'list') {
            return HttpResponse.json({ success: true, data: largeDocumentList, total: 100 });
          }
          return HttpResponse.json({}, { status: 404 });
        })
      );

      const startTime = performance.now();
      render(
        <TestWrapper>
          <DocsViewer />
        </TestWrapper>
      );
      const endTime = performance.now();

      // レンダリング時間が許容範囲内であることを確認
      expect(endTime - startTime).toBeLessThan(2000); // 2秒以内

      // ドキュメントが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('Document 0')).toBeInTheDocument();
      });
    });
  });
});
