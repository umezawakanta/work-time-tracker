import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

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
  {
    id: 'user-guide/getting-started',
    title: 'Getting Started',
    path: '/docs/user-guide/getting-started.md',
    category: 'user-guide',
    lastModified: '2024-01-03T00:00:00.000Z',
    size: 1536,
    description: 'User guide for getting started',
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
  'user-guide': {
    name: 'ユーザーガイド',
    description: 'ユーザー向け操作手順書',
  },
  admin: {
    name: '管理者向けドキュメント',
    description: '管理者向けの運用手順書',
  },
  development: {
    name: '開発者向けドキュメント',
    description: '開発者向けの技術仕様書',
  },
};

// モックハンドラー
const handlers = [
  // ドキュメント一覧取得
  http.get('/api/docs', ({ request }) => {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'list') {
      return HttpResponse.json({
        success: true,
        data: mockDocuments,
        total: mockDocuments.length,
      });
    }

    if (action === 'categories') {
      return HttpResponse.json({
        success: true,
        data: mockCategories,
      });
    }

    if (action === 'content') {
      const id = url.searchParams.get('id');
      const document = mockDocuments.find((doc) => doc.id === id);

      if (!document) {
        return HttpResponse.json(
          {
            success: false,
            message: 'ドキュメントが見つかりません',
          },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: {
          content: `# ${document.title}\n\nThis is the content of ${document.title}.\n\n## Description\n\n${document.description}`,
          metadata: document,
        },
      });
    }

    // デフォルトはドキュメント一覧を返す
    return HttpResponse.json({
      success: true,
      data: mockDocuments,
      total: mockDocuments.length,
    });
  }),

  // ヘルスチェック
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'OK',
      message: 'Simple server running',
    });
  }),

  // データベースステータス
  http.get('/api/db/status', () => {
    return HttpResponse.json({
      status: 'connected',
      message: 'Database is connected',
    });
  }),
];

// サーバーの設定
export const server = setupServer(...handlers);
