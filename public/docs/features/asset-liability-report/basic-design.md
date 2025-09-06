# 資産負債レポート機能 基本設計書

## 1. 概要

### 1.1 目的
資産負債レポート機能の基本設計を定義し、システム全体の構成と主要なコンポーネントを明確にする。

### 1.2 対象システム
- フロントエンド: React + TypeScript
- バックエンド: Node.js + Express
- データベース: MongoDB
- デプロイ: Vercel

### 1.3 設計方針
- コンポーネント指向の設計
- RESTful APIの採用
- レスポンシブデザイン
- アクセシビリティ対応

## 2. システム構成

### 2.1 全体構成図

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド   │    │   バックエンド    │    │   データベース    │
│                 │    │                 │    │                 │
│  React App      │◄──►│  Express API    │◄──►│   MongoDB       │
│  - Components   │    │  - Routes       │    │   - Collections │
│  - Hooks        │    │  - Services     │    │   - Indexes     │
│  - Utils        │    │  - Middleware   │    │   - Views       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 レイヤー構成

#### 2.2.1 プレゼンテーション層
- **役割**: ユーザーインターフェースの提供
- **技術**: React, TypeScript, Tailwind CSS
- **主要コンポーネント**:
  - `AssetLiabilityReportPage`: メインページ
  - `FinancialMetricsCard`: 財務指標表示
  - `AssetDebtChart`: チャート表示
  - `DataTable`: データテーブル

#### 2.2.2 ビジネスロジック層
- **役割**: 業務ロジックの実装
- **技術**: TypeScript, Custom Hooks
- **主要コンポーネント**:
  - `useAssetLiabilityReport`: データ取得フック
  - `calculateFinancialMetrics`: 財務指標計算
  - `generateTrends`: トレンドデータ生成
  - `exportData`: データエクスポート

#### 2.2.3 データアクセス層
- **役割**: データベースアクセスの抽象化
- **技術**: MongoDB Driver, Mongoose
- **主要コンポーネント**:
  - `AssetModel`: 資産データモデル
  - `DebtModel`: 負債データモデル
  - `ReportService`: レポートサービス

#### 2.2.4 インフラストラクチャ層
- **役割**: 外部システムとの連携
- **技術**: Vercel, MongoDB Atlas
- **主要コンポーネント**:
  - API Gateway
  - Database Connection Pool
  - File Storage

## 3. データモデル

### 3.1 エンティティ関係図

```
┌─────────────────┐    ┌─────────────────┐
│     User        │    │     Report      │
│                 │    │                 │
│ - id            │    │ - id            │
│ - email         │    │ - userId        │
│ - name          │    │ - createdAt     │
│ - createdAt     │    │ - updatedAt     │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         │              ┌────────┴────────┐
         │              │                 │
         │              ▼                 ▼
         │      ┌─────────────┐  ┌─────────────┐
         │      │    Asset    │  │    Debt     │
         │      │             │  │             │
         │      │ - id        │  │ - id        │
         │      │ - userId    │  │ - userId    │
         │      │ - account   │  │ - account   │
         │      │ - value     │  │ - value     │
         │      │ - date      │  │ - date      │
         │      │ - category  │  │ - category  │
         │      └─────────────┘  └─────────────┘
         │
         ▼
┌─────────────────┐
│   Financial     │
│   Metrics       │
│                 │
│ - totalAssets   │
│ - totalDebts    │
│ - netWorth      │
│ - debtRatio     │
│ - growthRate    │
└─────────────────┘
```

### 3.2 データ構造

#### 3.2.1 資産データ (Asset)
```typescript
interface Asset {
  _id: string;
  userId: string;
  account: string;
  value: number;
  date: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 3.2.2 負債データ (Debt)
```typescript
interface Debt {
  _id: string;
  userId: string;
  account: string;
  value: number;
  date: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 3.2.3 財務指標 (FinancialMetrics)
```typescript
interface FinancialMetrics {
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
  debtToAssetRatio: number;
  assetGrowthRate: number;
  monthlyNetWorthChange: number;
  emergencyFundRatio: number;
  projectedNetWorth: number;
  investmentAllocation: Record<string, number>;
  liquidityRatio: number;
}
```

## 4. API設計

### 4.1 エンドポイント一覧

#### 4.1.1 レポート取得
```
GET /api/asset-liability-report?action=summary&userId={userId}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "assets": Asset[],
    "debts": Debt[],
    "metrics": FinancialMetrics,
    "trends": {
      "monthly": TrendData[],
      "yearly": TrendData[]
    },
    "categories": {
      "assets": Record<string, number>,
      "debts": Record<string, number>
    }
  }
}
```

#### 4.1.2 財務指標取得
```
GET /api/asset-liability-report?action=metrics&userId={userId}
```

**レスポンス**:
```json
{
  "success": true,
  "data": FinancialMetrics
}
```

#### 4.1.3 トレンドデータ取得
```
GET /api/asset-liability-report?action=trends&userId={userId}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "monthly": TrendData[],
    "yearly": TrendData[]
  }
}
```

### 4.2 エラーハンドリング

#### 4.2.1 エラーレスポンス形式
```json
{
  "success": false,
  "message": "エラーメッセージ",
  "code": "ERROR_CODE",
  "details": {}
}
```

#### 4.2.2 エラーコード一覧
- `USER_NOT_FOUND`: ユーザーが見つからない
- `INVALID_PARAMETERS`: パラメータが無効
- `DATA_NOT_FOUND`: データが見つからない
- `CALCULATION_ERROR`: 計算エラー
- `EXPORT_ERROR`: エクスポートエラー

## 5. 画面設計

### 5.1 画面構成

#### 5.1.1 メイン画面
```
┌─────────────────────────────────────────────────────────┐
│ ヘッダー                                                  │
├─────────────────────────────────────────────────────────┤
│ 財務指標カード群                                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │総資産    │ │総負債    │ │純資産    │ │負債比率  │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────┤
│ フィルター・コントロール                                  │
│ [期間選択] [表示モード] [エクスポート] [更新]              │
├─────────────────────────────────────────────────────────┤
│ チャートエリア                                            │
│ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │資産負債トレンド      │ │資産カテゴリ別        │        │
│ │チャート              │ │円グラフ              │        │
│ └─────────────────────┘ └─────────────────────┘        │
├─────────────────────────────────────────────────────────┤
│ データテーブル                                            │
│ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │資産一覧              │ │負債一覧              │        │
│ └─────────────────────┘ └─────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

#### 5.1.2 レスポンシブ対応
- **デスクトップ**: 2カラムレイアウト
- **タブレット**: 1カラムレイアウト
- **モバイル**: 縦スクロールレイアウト

### 5.2 コンポーネント設計

#### 5.2.1 財務指標カード
```typescript
interface FinancialMetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  format?: 'currency' | 'percentage' | 'number';
}
```

#### 5.2.2 チャートコンポーネント
```typescript
interface ChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie';
  width?: number;
  height?: number;
  responsive?: boolean;
}
```

#### 5.2.3 データテーブル
```typescript
interface DataTableProps {
  data: TableData[];
  columns: Column[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
}
```

## 6. セキュリティ設計

### 6.1 認証・認可

#### 6.1.1 認証方式
- JWT トークンベース認証
- セッション管理
- リフレッシュトークン

#### 6.1.2 認可制御
- ユーザーIDベースのデータアクセス制御
- ロールベースアクセス制御
- API エンドポイント認可

### 6.2 データ保護

#### 6.2.1 暗号化
- 通信暗号化 (HTTPS)
- データベース暗号化
- ファイル暗号化

#### 6.2.2 アクセス制御
- IP制限
- レート制限
- ログ監視

## 7. パフォーマンス設計

### 7.1 キャッシュ戦略

#### 7.1.1 クライアントサイドキャッシュ
- React Query によるデータキャッシュ
- ローカルストレージキャッシュ
- メモリキャッシュ

#### 7.1.2 サーバーサイドキャッシュ
- Redis キャッシュ
- データベースクエリキャッシュ
- 静的ファイルキャッシュ

### 7.2 最適化

#### 7.2.1 フロントエンド最適化
- コンポーネントのメモ化
- 仮想スクロール
- 画像最適化

#### 7.2.2 バックエンド最適化
- データベースインデックス
- クエリ最適化
- 非同期処理

## 8. 運用設計

### 8.1 監視

#### 8.1.1 システム監視
- CPU使用率
- メモリ使用率
- ディスク使用率
- ネットワーク使用率

#### 8.1.2 アプリケーション監視
- レスポンス時間
- エラー率
- スループット
- ユーザーアクティビティ

### 8.2 ログ

#### 8.2.1 ログレベル
- ERROR: エラーログ
- WARN: 警告ログ
- INFO: 情報ログ
- DEBUG: デバッグログ

#### 8.2.2 ログ出力
- アクセスログ
- エラーログ
- 操作ログ
- パフォーマンスログ

## 9. テスト設計

### 9.1 テスト戦略

#### 9.1.1 単体テスト
- コンポーネントテスト
- フックテスト
- ユーティリティテスト

#### 9.1.2 結合テスト
- API テスト
- データベーステスト
- 外部連携テスト

#### 9.1.3 総合テスト
- エンドツーエンドテスト
- パフォーマンステスト
- セキュリティテスト

### 9.2 テストデータ

#### 9.2.1 テストデータ生成
- モックデータ生成
- テストデータベース
- テストファイル

#### 9.2.2 テスト環境
- 開発環境
- ステージング環境
- 本番環境

## 10. デプロイ設計

### 10.1 デプロイ戦略

#### 10.1.1 デプロイ方式
- ブルーグリーンデプロイ
- カナリアデプロイ
- ローリングデプロイ

#### 10.1.2 デプロイパイプライン
- コードビルド
- テスト実行
- デプロイ実行
- ヘルスチェック

### 10.2 環境管理

#### 10.2.1 環境構成
- 開発環境
- ステージング環境
- 本番環境

#### 10.2.2 設定管理
- 環境変数
- 設定ファイル
- シークレット管理
