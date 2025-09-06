# 📄 ドキュメント機能 基本設計書

## 1. システム構成

### 1.1 アーキテクチャ概要
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド   │    │   バックエンド    │    │   ファイルシステム  │
│                 │    │                 │    │                 │
│  DocsViewer.tsx │◄──►│  /api/docs/     │◄──►│  public/docs/   │
│                 │    │                 │    │                 │
│  - 一覧表示      │    │  - ファイルスキャン │    │  - Markdown     │
│  - 検索・フィルター│    │  - メタデータ取得  │    │  - カテゴリ別    │
│  - ドキュメント表示│    │  - 内容取得      │    │  - 静的ファイル  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 技術スタック
- **フロントエンド**: React + TypeScript + Tailwind CSS
- **バックエンド**: Vercel Functions (Node.js)
- **Markdownレンダリング**: react-markdown + remark-gfm + remark-math + rehype-katex
- **UIコンポーネント**: shadcn/ui

## 2. 画面設計

### 2.1 ドキュメント一覧画面
```
┌─────────────────────────────────────────────────────────────┐
│ 📄 ドキュメント                                    [承認] │
├─────────────────────────────────────────────────────────────┤
│ [🔍 ドキュメントを検索...] [カテゴリ選択 ▼]                │
├─────────────────────────────────────────────────────────────┤
│ [すべて] [機能仕様書] [API仕様書] [ユーザーガイド] [管理者] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ タイトル     │ │ タイトル     │ │ タイトル     │            │
│ │ カテゴリ     │ │ カテゴリ     │ │ カテゴリ     │            │
│ │ 説明文...    │ │ 説明文...    │ │ 説明文...    │            │
│ │ 📅 2024/01/01│ │ 📅 2024/01/01│ │ 📅 2024/01/01│            │
│ │ 📄 1.2KB    │ │ 📄 1.2KB    │ │ 📄 1.2KB    │            │
│ │ [開く]      │ │ [開く]      │ │ [開く]      │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 ドキュメント表示画面
```
┌─────────────────────────────────────────────────────────────┐
│ 📄 ドキュメント / features/docs/requirements    [一覧に戻る] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ # ドキュメント機能 要件定義書                                │
│                                                             │
│ ## 1. 機能概要                                              │
│                                                             │
│ プロジェクトのドキュメントを効率的に管理・表示するための...  │
│                                                             │
│ ## 2. 機能要件                                              │
│                                                             │
│ - **FR-001**: ドキュメント一覧を表示できる                  │
│ - **FR-002**: 各ドキュメントにタイトル、カテゴリ...         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 3. コンポーネント設計

### 3.1 DocsViewer コンポーネント
```typescript
interface DocsViewerProps {
  // ルートパラメータから自動取得
}

interface DocumentInfo {
  id: string;
  title: string;
  path: string;
  category: string;
  lastModified: string;
  size: number;
  description?: string;
}

interface DocumentCategories {
  [key: string]: {
    name: string;
    description: string;
  };
}
```

### 3.2 状態管理
```typescript
// メイン状態
const [content, setContent] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState<boolean>(true);
const [documents, setDocuments] = useState<DocumentInfo[]>([]);
const [categories, setCategories] = useState<DocumentCategories>({});
const [searchQuery, setSearchQuery] = useState<string>('');
const [selectedCategory, setSelectedCategory] = useState<string>('all');
const [isListView, setIsListView] = useState<boolean>(true);
```

## 4. API設計

### 4.1 ドキュメント一覧取得API
```typescript
// リクエスト
GET /api/docs?action=list

// レスポンス
interface DocumentListResponse {
  success: boolean;
  data: DocumentInfo[];
  total: number;
}
```

### 4.2 カテゴリ一覧取得API
```typescript
// リクエスト
GET /api/docs?action=categories

// レスポンス
interface DocumentCategoriesResponse {
  success: boolean;
  data: DocumentCategories;
}
```

### 4.3 ドキュメント内容取得API
```typescript
// リクエスト
GET /api/docs?action=content&id={docId}

// レスポンス
interface DocumentContentResponse {
  success: boolean;
  data: {
    content: string;
    metadata: DocumentInfo;
  };
}
```

## 5. データフロー

### 5.1 ドキュメント一覧表示フロー
```
1. コンポーネントマウント
2. fetchDocuments() 実行
3. GET /api/docs?action=list 呼び出し
4. ファイルシステムからドキュメントスキャン
5. メタデータ生成・返却
6. 状態更新・UI描画
```

### 5.2 ドキュメント表示フロー
```
1. ドキュメントカードクリック
2. navigate(`/docs/${docId}`) 実行
3. useEffect でドキュメント内容取得
4. GET /api/docs?action=content&id={docId} 呼び出し
5. ファイル読み込み・内容返却
6. ReactMarkdown でレンダリング
```

### 5.3 検索・フィルタリングフロー
```
1. 検索クエリ入力
2. filteredDocuments 再計算
3. リアルタイムでUI更新
4. カテゴリ選択変更
5. filteredDocuments 再計算
6. リアルタイムでUI更新
```

## 6. エラーハンドリング

### 6.1 フロントエンドエラー
```typescript
// ネットワークエラー
.catch(() => {
  if (!isMounted) return;
  setError('ドキュメントの読み込みに失敗しました');
})

// APIエラー
.then((data) => {
  if (data.success) {
    setContent(data.data.content);
  } else {
    setError(data.message || 'ドキュメントが見つかりませんでした');
  }
})
```

### 6.2 バックエンドエラー
```typescript
// ファイル読み込みエラー
try {
  const content = fs.readFileSync(fullPath, 'utf-8');
  return content;
} catch (error) {
  console.error('Error reading document content:', error);
  throw new Error('ドキュメントが見つかりません');
}

// APIエラーレスポンス
res.status(404).json({
  success: false,
  message: 'ドキュメントが見つかりません'
});
```

## 7. パフォーマンス最適化

### 7.1 フロントエンド最適化
- **メモ化**: `useMemo`でフィルタリング結果をキャッシュ
- **遅延読み込み**: 必要時のみドキュメント内容を取得
- **仮想スクロール**: 大量ドキュメント時の表示最適化（将来実装）

### 7.2 バックエンド最適化
- **ファイルキャッシュ**: メタデータをメモリにキャッシュ
- **並列処理**: 複数ファイルの並列スキャン
- **圧縮**: gzip圧縮でレスポンスサイズ削減

## 8. セキュリティ考慮事項

### 8.1 ファイルアクセス制御
```typescript
// パストラバーサル攻撃対策
const fullPath = path.join(process.cwd(), 'public', docPath);
const safePath = path.resolve(fullPath);
const publicPath = path.resolve(path.join(process.cwd(), 'public'));

if (!safePath.startsWith(publicPath)) {
  throw new Error('Invalid file path');
}
```

### 8.2 CORS設定
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://work-time-tracker-five.vercel.app'
];
const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';
```

## 9. アクセシビリティ設計

### 9.1 キーボードナビゲーション
- Tabキーでフォーカス移動
- Enterキーでドキュメント開く
- Escapeキーでモーダル閉じる

### 9.2 スクリーンリーダー対応
```typescript
// 適切なARIAラベル
<Button
  aria-label={`${doc.title}を開く`}
  onClick={() => navigate(`/docs/${doc.id}`)}
>
  開く
</Button>

// 見出し構造
<h1>ドキュメント</h1>
<h2>検索とフィルター</h2>
<h3>{category.name}</h3>
```

## 10. レスポンシブデザイン

### 10.1 ブレークポイント
- **モバイル**: 767px以下
- **タブレット**: 768px-1199px
- **デスクトップ**: 1200px以上

### 10.2 レイアウト調整
```css
/* モバイル */
.grid { grid-template-columns: 1fr; }

/* タブレット */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* デスクトップ */
@media (min-width: 1200px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

## 11. テスト設計

### 11.1 単体テスト
- コンポーネントのレンダリングテスト
- 状態管理のテスト
- ユーザーインタラクションのテスト

### 11.2 結合テスト
- API連携のテスト
- ルーティングのテスト
- エラーハンドリングのテスト

### 11.3 E2Eテスト
- ユーザーフローのテスト
- レスポンシブデザインのテスト
- アクセシビリティのテスト
