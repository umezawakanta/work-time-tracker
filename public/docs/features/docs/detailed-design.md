# 📄 ドキュメント機能 詳細設計書

## 1. クラス・関数設計

### 1.1 DocsViewer コンポーネント
```typescript
export default function DocsViewer(): React.JSX.Element {
  // 状態管理
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [categories, setCategories] = useState<DocumentCategories>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isListView, setIsListView] = useState<boolean>(true);

  // 副作用フック
  useEffect(() => {
    // ドキュメント一覧取得
  }, []);

  useEffect(() => {
    // ドキュメント内容取得
  }, [path]);

  // 計算プロパティ
  const filteredDocuments = useMemo(() => {
    // フィルタリングロジック
  }, [documents, searchQuery, selectedCategory]);

  // レンダリング関数
  const renderDocumentList = () => { /* ... */ };
  const renderDocument = () => { /* ... */ };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {isListView ? renderDocumentList() : renderDocument()}
    </div>
  );
}
```

### 1.2 API ハンドラー
```typescript
// api/docs/index.ts
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS設定
  setupCORS(req, res);

  try {
    if (req.method === 'GET') {
      const { action, id } = req.query;

      switch (action) {
        case 'list':
          return await handleDocumentList(req, res);
        case 'categories':
          return await handleCategories(req, res);
        case 'content':
          return await handleDocumentContent(req, res, id);
        default:
          return await handleDocumentList(req, res);
      }
    }

    res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  } catch (error) {
    handleError(error, res);
  }
}
```

## 2. データ構造詳細

### 2.1 DocumentInfo インターフェース
```typescript
interface DocumentInfo {
  id: string;           // ドキュメントID (例: "features/docs/requirements")
  title: string;        // 表示タイトル (例: "Requirements")
  path: string;         // ファイルパス (例: "/docs/features/docs/requirements.md")
  category: string;     // カテゴリキー (例: "features")
  lastModified: string; // ISO日時文字列 (例: "2024-01-01T00:00:00.000Z")
  size: number;         // ファイルサイズ（バイト） (例: 1234)
  description?: string; // 説明文（最初の段落） (例: "ドキュメント機能の要件定義書")
}
```

### 2.2 DocumentCategories インターフェース
```typescript
interface DocumentCategories {
  [key: string]: {
    name: string;        // 表示名 (例: "機能仕様書")
    description: string; // 説明文 (例: "各機能の要件定義、設計書、テスト仕様書")
  };
}

// 実装例
const documentCategories: DocumentCategories = {
  'features': {
    name: '機能仕様書',
    description: '各機能の要件定義、設計書、テスト仕様書'
  },
  'api': {
    name: 'API仕様書',
    description: 'APIエンドポイントの仕様とドキュメント'
  },
  'user-guide': {
    name: 'ユーザーガイド',
    description: 'ユーザー向け操作手順書'
  },
  'admin': {
    name: '管理者向けドキュメント',
    description: '管理者向けの運用手順書'
  },
  'development': {
    name: '開発者向けドキュメント',
    description: '開発者向けの技術仕様書'
  }
};
```

## 3. API実装詳細

### 3.1 ドキュメントスキャン機能
```typescript
function scanDocuments(): DocumentInfo[] {
  const docsDir = path.join(process.cwd(), 'public', 'docs');
  const documents: DocumentInfo[] = [];

  try {
    Object.keys(documentCategories).forEach(category => {
      const categoryDir = path.join(docsDir, category);
      
      if (fs.existsSync(categoryDir)) {
        const files = fs.readdirSync(categoryDir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isFile() && file.name.endsWith('.md')) {
            const filePath = path.join(categoryDir, file.name);
            const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
            const stats = fs.statSync(filePath);
            
            const title = generateTitle(file.name);
            const description = getDocumentDescription(filePath);
            
            documents.push({
              id: `${category}/${file.name.replace('.md', '')}`,
              title,
              path: `/${relativePath}`,
              category,
              lastModified: stats.mtime.toISOString(),
              size: stats.size,
              description
            });
          }
        });
      }
    });
  } catch (error) {
    console.error('Error scanning documents:', error);
  }

  return documents.sort((a, b) => 
    new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
}
```

### 3.2 タイトル生成機能
```typescript
function generateTitle(fileName: string): string {
  return fileName
    .replace('.md', '')           // 拡張子除去
    .replace(/-/g, ' ')           // ハイフンをスペースに変換
    .replace(/\b\w/g, l => l.toUpperCase()); // 各単語の最初を大文字に
}

// 例:
// "system-test-spec.md" → "System Test Spec"
// "requirements.md" → "Requirements"
// "basic-design.md" → "Basic Design"
```

### 3.3 説明文抽出機能
```typescript
function getDocumentDescription(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // 見出し、区切り線、空行をスキップ
      if (trimmed && 
          !trimmed.startsWith('#') && 
          !trimmed.startsWith('---') &&
          !trimmed.startsWith('```')) {
        return trimmed.length > 100 
          ? trimmed.substring(0, 100) + '...' 
          : trimmed;
      }
    }
  } catch (error) {
    console.error('Error reading document description:', error);
  }
  
  return '';
}
```

### 3.4 ドキュメント内容取得機能
```typescript
function getDocumentContent(docPath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'public', docPath);
    
    // パストラバーサル攻撃対策
    const safePath = path.resolve(fullPath);
    const publicPath = path.resolve(path.join(process.cwd(), 'public'));
    
    if (!safePath.startsWith(publicPath)) {
      throw new Error('Invalid file path');
    }
    
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (error) {
    console.error('Error reading document content:', error);
    throw new Error('ドキュメントが見つかりません');
  }
}
```

## 4. フロントエンド実装詳細

### 4.1 フィルタリングロジック
```typescript
const filteredDocuments = useMemo(() => {
  return documents.filter(doc => {
    // 検索クエリマッチング
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // カテゴリマッチング
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
}, [documents, searchQuery, selectedCategory]);
```

### 4.2 ドキュメント一覧レンダリング
```typescript
const renderDocumentList = () => (
  <div className="space-y-6">
    {/* 検索とフィルター */}
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ドキュメントを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">すべてのカテゴリ</option>
          {Object.entries(categories).map(([key, category]) => (
            <option key={key} value={key}>{category.name}</option>
          ))}
        </select>
      </div>
    </div>

    {/* カテゴリ別タブ */}
    <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
        <TabsTrigger value="all">すべて</TabsTrigger>
        {Object.entries(categories).map(([key, category]) => (
          <TabsTrigger key={key} value={key}>{category.name}</TabsTrigger>
        ))}
      </TabsList>
      {/* タブコンテンツ */}
    </Tabs>
  </div>
);
```

### 4.3 Markdownレンダリング設定
```typescript
<ReactMarkdown
  remarkPlugins={[remarkGfm, remarkMath]}
  rehypePlugins={[rehypeKatex]}
  components={{
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-semibold mt-5 mb-2" {...props} />
    ),
    p: ({ node, ...props }) => <p className="leading-7 mb-4" {...props} />,
    ul: ({ node, ...props }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
    ),
    li: ({ node, ...props }) => <li className="mb-1 list-item" {...props} />,
    a: ({ node, ...props }) => (
      <a className="underline text-blue-600 hover:text-blue-700" {...props} />
    ),
    code: ({ className, children, ...props }) => (
      <code
        className={
          'rounded bg-slate-100 px-1.5 py-0.5 text-[0.95em] ' + (className || '')
        }
        {...props}
      >
        {children}
      </code>
    ),
    pre: ({ node, ...props }) => (
      <pre className="bg-slate-100 rounded p-3 overflow-x-auto text-sm mb-4" {...props} />
    ),
    table: ({ node, ...props }) => (
      <table className="border-collapse w-full my-4" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="border px-3 py-2 text-left bg-slate-50" {...props} />
    ),
    td: ({ node, ...props }) => <td className="border px-3 py-2 align-top" {...props} />,
  }}
>
  {content}
</ReactMarkdown>
```

## 5. エラーハンドリング詳細

### 5.1 フロントエンドエラーハンドリング
```typescript
// ドキュメント一覧取得エラー
const fetchDocuments = async () => {
  try {
    const response = await fetch('/api/docs?action=list', { cache: 'no-store' });
    const data = await response.json();
    if (data.success) {
      setDocuments(data.data);
    } else {
      console.error('Failed to fetch documents:', data.message);
    }
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    // エラー状態の設定（必要に応じて）
  }
};

// ドキュメント内容取得エラー
fetch(`/api/docs?action=content&id=${encodeURIComponent(docId)}`, { cache: 'no-store' })
  .then((res) => res.json())
  .then((data) => {
    if (!isMounted) return;
    if (data.success) {
      setContent(data.data.content);
    } else {
      setError(data.message || 'ドキュメントが見つかりませんでした');
    }
  })
  .catch(() => {
    if (!isMounted) return;
    setError('ドキュメントの読み込みに失敗しました');
  })
  .finally(() => {
    if (!isMounted) return;
    setLoading(false);
  });
```

### 5.2 バックエンドエラーハンドリング
```typescript
// ファイル読み込みエラー
function getDocumentContent(docPath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'public', docPath);
    const safePath = path.resolve(fullPath);
    const publicPath = path.resolve(path.join(process.cwd(), 'public'));
    
    if (!safePath.startsWith(publicPath)) {
      throw new Error('Invalid file path');
    }
    
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (error) {
    console.error('Error reading document content:', error);
    throw new Error('ドキュメントが見つかりません');
  }
}

// APIエラーレスポンス
try {
  const content = getDocumentContent(docPath);
  const documents = scanDocuments();
  const metadata = documents.find(doc => doc.id === docId);
  
  if (!metadata) {
    res.status(404).json({
      success: false,
      message: 'ドキュメントが見つかりません'
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { content, metadata }
  });
} catch (error) {
  res.status(404).json({
    success: false,
    message: 'ドキュメントが見つかりません'
  });
}
```

## 6. パフォーマンス最適化詳細

### 6.1 メモ化戦略
```typescript
// フィルタリング結果のメモ化
const filteredDocuments = useMemo(() => {
  return documents.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
}, [documents, searchQuery, selectedCategory]);

// 承認チェックリストのメモ化
const checklist = useMemo<string[]>(() => {
  switch (docMeta.artifactId) {
    case 'requirements':
      return [
        '目的とスコープが具体的で検証可能',
        '機能要件が網羅され曖昧さがない',
        // ...
      ];
    // ...
  }
}, [docMeta.artifactId]);
```

### 6.2 遅延読み込み
```typescript
// ドキュメント内容の遅延読み込み
useEffect(() => {
  if (!path || path === '/docs/') {
    setIsListView(true);
    setLoading(false);
    return;
  }

  // 遅延読み込みの実装
  const timeoutId = setTimeout(() => {
    fetchDocumentContent(path);
  }, 100); // 100ms遅延

  return () => clearTimeout(timeoutId);
}, [path]);
```

## 7. セキュリティ実装詳細

### 7.1 パストラバーサル攻撃対策
```typescript
function getDocumentContent(docPath: string): string {
  const fullPath = path.join(process.cwd(), 'public', docPath);
  const safePath = path.resolve(fullPath);
  const publicPath = path.resolve(path.join(process.cwd(), 'public'));
  
  // パストラバーサル攻撃対策
  if (!safePath.startsWith(publicPath)) {
    throw new Error('Invalid file path');
  }
  
  return fs.readFileSync(fullPath, 'utf-8');
}
```

### 7.2 CORS設定
```typescript
function setupCORS(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = [
    'http://localhost:3000',
    'https://work-time-tracker-five.vercel.app'
  ];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';
  
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
}
```

## 8. テスト実装詳細

### 8.1 単体テスト例
```typescript
// DocsViewer.test.tsx
describe('DocsViewer', () => {
  it('should render document list', () => {
    render(<DocsViewer />);
    expect(screen.getByText('ドキュメント')).toBeInTheDocument();
  });

  it('should filter documents by search query', () => {
    render(<DocsViewer />);
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    fireEvent.change(searchInput, { target: { value: 'requirements' } });
    // 検索結果の確認
  });

  it('should filter documents by category', () => {
    render(<DocsViewer />);
    const categorySelect = screen.getByDisplayValue('すべてのカテゴリ');
    fireEvent.change(categorySelect, { target: { value: 'features' } });
    // カテゴリフィルタリング結果の確認
  });
});
```

### 8.2 APIテスト例
```typescript
// api/docs/index.test.ts
describe('/api/docs', () => {
  it('should return document list', async () => {
    const req = createMockRequest('GET', { action: 'list' });
    const res = createMockResponse();
    
    await handler(req, res);
    
    expect(res.status).toBe(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.any(Array),
      total: expect.any(Number)
    });
  });

  it('should return document content', async () => {
    const req = createMockRequest('GET', { 
      action: 'content', 
      id: 'features/docs/requirements' 
    });
    const res = createMockResponse();
    
    await handler(req, res);
    
    expect(res.status).toBe(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        content: expect.any(String),
        metadata: expect.any(Object)
      }
    });
  });
});
```

## 9. デプロイメント設定

### 9.1 Vercel設定
```json
// vercel.json
{
  "functions": {
    "api/docs/index.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/docs/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        }
      ]
    }
  ]
}
```

### 9.2 環境変数
```bash
# .env.local
NODE_ENV=production
VITE_API_BASE_URL=https://work-time-tracker-five.vercel.app
```

## 10. 監視・ログ設定

### 10.1 ログ設定
```typescript
// エラーログ
console.error('Documents API error:', error);

// アクセスログ
console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);

// パフォーマンスログ
const startTime = Date.now();
// ... 処理 ...
console.log(`⏱️ Document scan completed in ${Date.now() - startTime}ms`);
```

### 10.2 メトリクス収集
```typescript
// ドキュメントアクセス数
const trackDocumentAccess = (docId: string) => {
  // アナリティクス送信
  analytics.track('document_accessed', {
    document_id: docId,
    timestamp: new Date().toISOString()
  });
};

// 検索クエリ分析
const trackSearchQuery = (query: string, resultCount: number) => {
  analytics.track('document_searched', {
    query,
    result_count: resultCount,
    timestamp: new Date().toISOString()
  });
};
```
