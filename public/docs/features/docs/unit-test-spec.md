# 📄 ドキュメント機能 単体試験仕様書

## 1. 試験概要

### 1.1 目的
ドキュメント機能の各コンポーネント・関数・APIが仕様通りに動作することを確認する。

### 1.2 対象範囲
- フロントエンドコンポーネント（DocsViewer）
- バックエンドAPI（/api/docs）
- ユーティリティ関数
- 状態管理ロジック

### 1.3 試験環境
- Node.js 18以上
- Jest 29以上
- React Testing Library
- MSW（Mock Service Worker）

## 2. フロントエンド試験

### 2.1 DocsViewerコンポーネント試験

#### 2.1.1 レンダリング試験
```typescript
describe('DocsViewer Component Rendering', () => {
  test('should render document list by default', () => {
    render(<DocsViewer />);
    expect(screen.getByText('ドキュメント')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ドキュメントを検索...')).toBeInTheDocument();
  });

  test('should render search input with correct placeholder', () => {
    render(<DocsViewer />);
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  test('should render category select dropdown', () => {
    render(<DocsViewer />);
    const categorySelect = screen.getByDisplayValue('すべてのカテゴリ');
    expect(categorySelect).toBeInTheDocument();
  });
});
```

#### 2.1.2 状態管理試験
```typescript
describe('DocsViewer State Management', () => {
  test('should initialize with correct default state', () => {
    render(<DocsViewer />);
    
    // 初期状態の確認
    expect(screen.getByText('ドキュメント')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ドキュメントを検索...')).toHaveValue('');
  });

  test('should update search query on input change', () => {
    render(<DocsViewer />);
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    expect(searchInput).toHaveValue('test query');
  });

  test('should update selected category on change', () => {
    render(<DocsViewer />);
    const categorySelect = screen.getByDisplayValue('すべてのカテゴリ');
    
    fireEvent.change(categorySelect, { target: { value: 'features' } });
    expect(categorySelect).toHaveValue('features');
  });
});
```

#### 2.1.3 フィルタリング機能試験
```typescript
describe('Document Filtering', () => {
  const mockDocuments = [
    {
      id: 'features/docs/requirements',
      title: 'Requirements',
      category: 'features',
      description: 'Requirements document'
    },
    {
      id: 'api/docs/endpoints',
      title: 'API Endpoints',
      category: 'api',
      description: 'API documentation'
    }
  ];

  test('should filter documents by search query', () => {
    render(<DocsViewer />);
    
    // モックデータを設定
    mockDocuments.forEach(doc => {
      // ドキュメントカードの表示を確認
    });
    
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    fireEvent.change(searchInput, { target: { value: 'Requirements' } });
    
    // フィルタリング結果の確認
    expect(screen.getByText('Requirements')).toBeInTheDocument();
    expect(screen.queryByText('API Endpoints')).not.toBeInTheDocument();
  });

  test('should filter documents by category', () => {
    render(<DocsViewer />);
    
    const categorySelect = screen.getByDisplayValue('すべてのカテゴリ');
    fireEvent.change(categorySelect, { target: { value: 'features' } });
    
    // カテゴリフィルタリング結果の確認
    expect(screen.getByText('Requirements')).toBeInTheDocument();
    expect(screen.queryByText('API Endpoints')).not.toBeInTheDocument();
  });
});
```

#### 2.1.4 ドキュメント表示試験
```typescript
describe('Document Display', () => {
  test('should navigate to document when card is clicked', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    render(<DocsViewer />);
    
    const openButton = screen.getByText('開く');
    fireEvent.click(openButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/docs/features/docs/requirements');
  });

  test('should display loading state while fetching document', () => {
    render(<DocsViewer />);
    
    // ローディング状態の確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  test('should display error message when document not found', () => {
    render(<DocsViewer />);
    
    // エラー状態の確認
    expect(screen.getByText('ドキュメントが見つかりません')).toBeInTheDocument();
  });
});
```

### 2.2 Markdownレンダリング試験
```typescript
describe('Markdown Rendering', () => {
  test('should render headings correctly', () => {
    const markdownContent = '# Heading 1\n## Heading 2\n### Heading 3';
    render(<DocsViewer />);
    
    // Markdownコンテンツの設定
    // 見出しのレンダリング確認
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading 2');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Heading 3');
  });

  test('should render lists correctly', () => {
    const markdownContent = '- Item 1\n- Item 2\n- Item 3';
    render(<DocsViewer />);
    
    // リストのレンダリング確認
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    expect(listItems[0]).toHaveTextContent('Item 1');
  });

  test('should render code blocks correctly', () => {
    const markdownContent = '```javascript\nconst x = 1;\n```';
    render(<DocsViewer />);
    
    // コードブロックのレンダリング確認
    const codeBlock = screen.getByRole('code');
    expect(codeBlock).toHaveTextContent('const x = 1;');
  });
});
```

## 3. バックエンドAPI試験

### 3.1 ドキュメント一覧取得API試験
```typescript
describe('/api/docs?action=list', () => {
  test('should return document list successfully', async () => {
    const req = createMockRequest('GET', { action: 'list' });
    const res = createMockResponse();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.any(Array),
      total: expect.any(Number)
    });
  });

  test('should return documents with correct structure', async () => {
    const req = createMockRequest('GET', { action: 'list' });
    const res = createMockResponse();
    
    await handler(req, res);
    
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.data[0]).toHaveProperty('id');
    expect(responseData.data[0]).toHaveProperty('title');
    expect(responseData.data[0]).toHaveProperty('category');
    expect(responseData.data[0]).toHaveProperty('lastModified');
    expect(responseData.data[0]).toHaveProperty('size');
  });

  test('should handle file system errors gracefully', async () => {
    // ファイルシステムエラーをモック
    jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
      throw new Error('File system error');
    });
    
    const req = createMockRequest('GET', { action: 'list' });
    const res = createMockResponse();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [],
      total: 0
    });
  });
});
```

### 3.2 カテゴリ一覧取得API試験
```typescript
describe('/api/docs?action=categories', () => {
  test('should return categories successfully', async () => {
    const req = createMockRequest('GET', { action: 'categories' });
    const res = createMockResponse();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        features: expect.objectContaining({
          name: '機能仕様書',
          description: expect.any(String)
        }),
        api: expect.objectContaining({
          name: 'API仕様書',
          description: expect.any(String)
        })
      })
    });
  });
});
```

### 3.3 ドキュメント内容取得API試験
```typescript
describe('/api/docs?action=content&id={docId}', () => {
  test('should return document content successfully', async () => {
    const docId = 'features/docs/requirements';
    const req = createMockRequest('GET', { action: 'content', id: docId });
    const res = createMockResponse();
    
    // ファイル読み込みをモック
    jest.spyOn(fs, 'readFileSync').mockReturnValue('# Test Document\n\nThis is a test document.');
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        content: '# Test Document\n\nThis is a test document.',
        metadata: expect.objectContaining({
          id: docId,
          title: expect.any(String),
          category: 'features'
        })
      }
    });
  });

  test('should return 404 when document not found', async () => {
    const docId = 'nonexistent/document';
    const req = createMockRequest('GET', { action: 'content', id: docId });
    const res = createMockResponse();
    
    // ファイル読み込みエラーをモック
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('File not found');
    });
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'ドキュメントが見つかりません'
    });
  });

  test('should prevent path traversal attacks', async () => {
    const maliciousDocId = '../../../etc/passwd';
    const req = createMockRequest('GET', { action: 'content', id: maliciousDocId });
    const res = createMockResponse();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'ドキュメントが見つかりません'
    });
  });
});
```

## 4. ユーティリティ関数試験

### 4.1 タイトル生成関数試験
```typescript
describe('generateTitle', () => {
  test('should convert filename to title correctly', () => {
    expect(generateTitle('system-test-spec.md')).toBe('System Test Spec');
    expect(generateTitle('requirements.md')).toBe('Requirements');
    expect(generateTitle('basic-design.md')).toBe('Basic Design');
  });

  test('should handle empty filename', () => {
    expect(generateTitle('')).toBe('');
  });

  test('should handle filename without extension', () => {
    expect(generateTitle('test-file')).toBe('Test File');
  });
});
```

### 4.2 説明文抽出関数試験
```typescript
describe('getDocumentDescription', () => {
  test('should extract first paragraph as description', () => {
    const content = '# Title\n\nThis is the first paragraph.\n\nThis is the second paragraph.';
    const description = getDocumentDescription(content);
    expect(description).toBe('This is the first paragraph.');
  });

  test('should skip headings and return first text paragraph', () => {
    const content = '# Title\n## Subtitle\n\nThis is the description.';
    const description = getDocumentDescription(content);
    expect(description).toBe('This is the description.');
  });

  test('should truncate long descriptions', () => {
    const longText = 'A'.repeat(150);
    const content = `# Title\n\n${longText}`;
    const description = getDocumentDescription(content);
    expect(description).toBe('A'.repeat(100) + '...');
  });

  test('should return empty string for empty content', () => {
    const description = getDocumentDescription('');
    expect(description).toBe('');
  });
});
```

## 5. エラーハンドリング試験

### 5.1 ネットワークエラー試験
```typescript
describe('Network Error Handling', () => {
  test('should handle fetch errors gracefully', async () => {
    // ネットワークエラーをモック
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    render(<DocsViewer />);
    
    // エラー状態の確認
    await waitFor(() => {
      expect(screen.getByText('ドキュメントの読み込みに失敗しました')).toBeInTheDocument();
    });
  });

  test('should handle API error responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: false,
        message: 'API error'
      })
    });
    
    render(<DocsViewer />);
    
    await waitFor(() => {
      expect(screen.getByText('API error')).toBeInTheDocument();
    });
  });
});
```

### 5.2 ファイルシステムエラー試験
```typescript
describe('File System Error Handling', () => {
  test('should handle file read errors', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('Permission denied');
    });
    
    const req = createMockRequest('GET', { action: 'content', id: 'test' });
    const res = createMockResponse();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'ドキュメントが見つかりません'
    });
  });
});
```

## 6. パフォーマンス試験

### 6.1 レンダリング性能試験
```typescript
describe('Rendering Performance', () => {
  test('should render large document list efficiently', () => {
    const largeDocumentList = Array.from({ length: 100 }, (_, i) => ({
      id: `doc-${i}`,
      title: `Document ${i}`,
      category: 'features',
      description: `Description for document ${i}`
    }));
    
    const startTime = performance.now();
    render(<DocsViewer />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // 1秒以内
  });

  test('should filter documents efficiently', () => {
    const { rerender } = render(<DocsViewer />);
    
    const startTime = performance.now();
    rerender(<DocsViewer />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // 100ms以内
  });
});
```

## 7. アクセシビリティ試験

### 7.1 キーボードナビゲーション試験
```typescript
describe('Keyboard Navigation', () => {
  test('should be navigable with keyboard', () => {
    render(<DocsViewer />);
    
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    searchInput.focus();
    
    expect(searchInput).toHaveFocus();
    
    // Tabキーで次の要素にフォーカス移動
    fireEvent.keyDown(searchInput, { key: 'Tab' });
    // フォーカス移動の確認
  });

  test('should support Enter key to open document', () => {
    render(<DocsViewer />);
    
    const openButton = screen.getByText('開く');
    fireEvent.keyDown(openButton, { key: 'Enter' });
    
    // ドキュメントが開かれることを確認
  });
});
```

### 7.2 スクリーンリーダー対応試験
```typescript
describe('Screen Reader Support', () => {
  test('should have proper ARIA labels', () => {
    render(<DocsViewer />);
    
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    expect(searchInput).toHaveAttribute('aria-label');
    
    const openButton = screen.getByText('開く');
    expect(openButton).toHaveAttribute('aria-label');
  });

  test('should have proper heading structure', () => {
    render(<DocsViewer />);
    
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('ドキュメント');
  });
});
```

## 8. 統合試験

### 8.1 エンドツーエンドフロー試験
```typescript
describe('End-to-End Flow', () => {
  test('should complete full document viewing flow', async () => {
    // 1. ドキュメント一覧表示
    render(<DocsViewer />);
    expect(screen.getByText('ドキュメント')).toBeInTheDocument();
    
    // 2. 検索実行
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // 3. ドキュメント選択
    const openButton = screen.getByText('開く');
    fireEvent.click(openButton);
    
    // 4. ドキュメント表示確認
    await waitFor(() => {
      expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
    });
  });
});
```

## 9. 試験データ

### 9.1 モックデータ
```typescript
const mockDocuments = [
  {
    id: 'features/docs/requirements',
    title: 'Requirements',
    path: '/docs/features/docs/requirements.md',
    category: 'features',
    lastModified: '2024-01-01T00:00:00.000Z',
    size: 1024,
    description: 'Requirements document for the feature'
  },
  {
    id: 'api/docs/endpoints',
    title: 'API Endpoints',
    path: '/docs/api/docs/endpoints.md',
    category: 'api',
    lastModified: '2024-01-02T00:00:00.000Z',
    size: 2048,
    description: 'API endpoints documentation'
  }
];

const mockCategories = {
  features: {
    name: '機能仕様書',
    description: '各機能の要件定義、設計書、テスト仕様書'
  },
  api: {
    name: 'API仕様書',
    description: 'APIエンドポイントの仕様とドキュメント'
  }
};
```

### 9.2 テストヘルパー関数
```typescript
function createMockRequest(method: string, query: any = {}) {
  return {
    method,
    query,
    headers: {
      origin: 'http://localhost:3000'
    }
  };
}

function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis()
  };
  return res;
}
```

## 10. 試験実行手順

### 10.1 準備
1. テスト環境のセットアップ
2. 必要なモックデータの準備
3. テストファイルの配置

### 10.2 実行
```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test DocsViewer.test.tsx

# カバレッジ付き実行
npm test -- --coverage

# ウォッチモード実行
npm test -- --watch
```

### 10.3 結果確認
1. テスト結果の確認
2. カバレッジレポートの確認
3. 失敗したテストの修正

## 11. 判定基準

### 11.1 合格基準
- 全テストケースが合格すること
- コードカバレッジが80%以上であること
- パフォーマンス要件を満たしていること
- アクセシビリティ要件を満たしていること

### 11.2 不合格時の対応
1. 失敗したテストケースの分析
2. 原因の特定
3. 修正の実装
4. 再テストの実行
