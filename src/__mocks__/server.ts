// URLポリフィルをMSWでも使用するため、グローバルに設定
// これは setupServer を呼び出す前に実行される必要があります
if (typeof globalThis.URL === 'undefined') {
  // 基本的なURLポリフィル
  globalThis.URL = class {
    href: string;
    origin: string;
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    searchParams: URLSearchParams;

    constructor(input: string, base?: string) {
      const url = (input || '').toString();
      this.href = url;

      // 基本的なURL解析
      try {
        const match = url.match(/^([^:]+):\/\/([^\/]+)(.*)$/);
        if (match) {
          this.protocol = match[1] + ':';
          this.host = match[2];
          this.hostname = match[2].split(':')[0];
          this.port = match[2].split(':')[1] || '';
          this.pathname = match[3].split('?')[0].split('#')[0] || '/';
          this.search = match[3].includes('?') ? '?' + match[3].split('?')[1].split('#')[0] : '';
          this.hash = match[3].includes('#') ? '#' + match[3].split('#')[1] : '';
          this.origin = this.protocol + '//' + this.host;
        } else {
          this.protocol = '';
          this.host = '';
          this.hostname = '';
          this.port = '';
          this.pathname = url;
          this.search = '';
          this.hash = '';
          this.origin = '';
        }
      } catch {
        this.protocol = '';
        this.host = '';
        this.hostname = '';
        this.port = '';
        this.pathname = url;
        this.search = '';
        this.hash = '';
        this.origin = '';
      }

      this.searchParams = new URLSearchParams(this.search);
    }

    toString() {
      return this.href;
    }
  } as any;
}

if (typeof globalThis.URLSearchParams === 'undefined') {
  globalThis.URLSearchParams = class {
    private params: Map<string, string[]> = new Map();

    constructor(init?: string | URLSearchParams | Record<string, string> | string[][]) {
      if (init) {
        if (typeof init === 'string') {
          init.split('&').forEach((pair) => {
            const [key, value] = pair.split('=');
            if (key) {
              this.append(decodeURIComponent(key), decodeURIComponent(value || ''));
            }
          });
        } else if (init instanceof URLSearchParams) {
          init.forEach((value, key) => {
            this.append(key, value);
          });
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => {
            this.append(key, value);
          });
        } else if (typeof init === 'object') {
          Object.entries(init).forEach(([key, value]) => {
            this.append(key, value);
          });
        }
      }
    }

    get(name: string): string | null {
      const values = this.params.get(name);
      return values ? values[0] : null;
    }

    set(name: string, value: string): void {
      this.params.set(name, [value]);
    }

    append(name: string, value: string): void {
      const existing = this.params.get(name) || [];
      existing.push(value);
      this.params.set(name, existing);
    }

    has(name: string): boolean {
      return this.params.has(name);
    }

    delete(name: string): void {
      this.params.delete(name);
    }

    forEach(callback: (value: string, key: string) => void): void {
      this.params.forEach((values, key) => {
        values.forEach((value) => callback(value, key));
      });
    }

    toString(): string {
      const pairs: string[] = [];
      this.params.forEach((values, key) => {
        values.forEach((value) => {
          pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        });
      });
      return pairs.join('&');
    }
  } as any;
}

// MSWのインポートはURLポリフィルの設定後に移動
import { setupServer } from 'msw';
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
