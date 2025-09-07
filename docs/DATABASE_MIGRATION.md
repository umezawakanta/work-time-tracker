# データベース移行ガイド

## 概要

このプロジェクトは、ローカルファイル保存（`data/*.json`）からMongoDBデータベース保存に移行しました。

## 移行内容

### 変更されたデータ保存方法

- **以前**: ローカルファイル（`data/assets.json`, `data/debts.json`, `data/bank-accounts.json`, `data/transactions.json`）
- **現在**: MongoDBデータベース

### 影響を受けるAPIエンドポイント

- `/api/asset` - 資産データ管理
- `/api/debt` - 負債データ管理
- `/api/bank-accounts` - 銀行口座管理
- `/api/asset-liability-report` - 資産負債レポート

## 環境設定

### 必要な環境変数

```bash
MONGODB_URI=mongodb://localhost:27017/workTimeTracker
# または
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workTimeTracker
```

### データベース接続

データベース接続は `src/database/connection.ts` で管理されています。

## データ移行

### 既存データの移行

既存のローカルファイルデータをMongoDBに移行するには、以下のコマンドを実行してください：

```bash
# 環境変数を設定
export MONGODB_URI="your-mongodb-connection-string"

# 移行スクリプトを実行
pnpm run migrate:db
```

### 移行スクリプトの機能

- `data/assets.json` → `assets` コレクション
- `data/debts.json` → `debts` コレクション
- `data/bank-accounts.json` → `bank_accounts` コレクション
- `data/transactions.json` → `transactions` コレクション

## データベーススキーマ

### コレクション一覧

1. **assets** - 資産データ
2. **debts** - 負債データ
3. **bank_accounts** - 銀行口座データ
4. **transactions** - 取引明細データ

### インデックス

- `userId` フィールドにインデックスが設定されています（検索パフォーマンス向上）

## 開発環境での使用

### ローカル開発

1. MongoDBを起動
2. 環境変数を設定
3. アプリケーションを起動

```bash
# MongoDB起動（Docker使用の場合）
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 環境変数設定
export MONGODB_URI="mongodb://localhost:27017/workTimeTracker"

# アプリケーション起動
pnpm start
```

### 本番環境（Vercel）

Vercel環境では、環境変数 `MONGODB_URI` を設定してください。

## トラブルシューティング

### よくある問題

1. **接続エラー**
   - `MONGODB_URI` が正しく設定されているか確認
   - ネットワーク接続を確認

2. **データが見つからない**
   - 移行スクリプトが正常に実行されたか確認
   - データベースのコレクションを確認

3. **型エラー**
   - データベーススキーマとAPIレスポンスの型が一致しているか確認

### ログ確認

データベース接続のログは以下のように出力されます：

```
✅ MongoDB connected successfully
```

エラーの場合は：

```
❌ MongoDB connection failed: [エラー詳細]
```

## パフォーマンス改善

### 変更点

- ローカルファイルの自動保存（30秒ごと）を無効化
- データベースへの直接保存により、リアルタイム性が向上
- インデックスによる検索パフォーマンス向上

### 期待される効果

- 画面更新頻度の大幅削減
- データの整合性向上
- スケーラビリティの向上

## ロールバック

必要に応じて、以下の手順でローカルファイル保存に戻すことができます：

1. `src/server/server-simple.ts` の自動保存コメントアウトを解除
2. APIエンドポイントを元の実装に戻す
3. データベース関連のコードを無効化

ただし、データの整合性を保つため、本番環境でのロールバックは慎重に行ってください。
