# サーバエラーレポート機能 運用マニュアル

## 機能概要
サーバ側のエラー収集・集約・分析機能。MongoDBにエラーログを保存し、管理者がリアルタイムで監視・分析できます。

## 技術仕様

### フロントエンド
- **ページ**: `/_bg/server-error-reporting`
- **コンポーネント**: `ServerErrorReportingPage.tsx`
- **API**: `/api/admin/server-errors`

### バックエンド
- **エンドポイント**: `/api/admin/server-errors`
- **認証**: JWT認証 + 管理者権限必須
- **データベース**: MongoDB (ErrorLogコレクション)

### データフロー
1. サーバでエラーが発生
2. エラーログがキューに追加
3. バッチ処理でMongoDBに保存
4. 管理者がページにアクセス
5. MongoDBからエラーログを取得・表示

## 運用手順

### 1. 監視項目
- **エラー率**: 5%以下
- **レスポンス時間**: 3秒以内
- **データベース接続**: 正常
- **ログ保存率**: 99%以上

### 2. エラー対応
- **高エラー率**: アラート通知
- **データベースエラー**: 接続確認
- **APIエラー**: ログ確認

### 3. ログ監視
```bash
# エラーログ確認
grep "Server errors fetch error" /var/log/app.log

# データベース接続エラー
grep "Database save error" /var/log/app.log

# バッチ処理エラー
grep "Failed to save error logs" /var/log/app.log
```

### 4. メンテナンス
- **ログローテーション**: 月1回
- **データベース最適化**: 週1回
- **統計情報更新**: 日1回

## トラブルシューティング

### よくある問題

#### 1. エラーログが表示されない
**原因**: データベース接続エラー
**対処**: MongoDB接続を確認・修正

#### 2. 統計情報が更新されない
**原因**: バッチ処理の停止
**対処**: サーバー再起動

#### 3. 管理者権限エラー
**原因**: ユーザー権限の設定ミス
**対処**: ユーザー権限を確認・修正

### 緊急時対応
1. **サービス停止**: エラーログ機能を一時的に無効化
2. **データ不整合**: データベースの整合性チェック
3. **高負荷**: ログ保存頻度を調整

## セキュリティ

### 認証・認可
- JWT認証必須
- 管理者権限の検証
- CORS設定

### データ保護
- 個人情報のマスク
- ログの匿名化
- アクセスログの記録

## パフォーマンス

### 最適化
- バッチ処理による効率化
- インデックスの活用
- ページネーション

### 監視指標
- ログ保存時間
- API応答時間
- データベース負荷

## 設定

### 環境変数
```bash
# MongoDB接続
MONGODB_URI=mongodb://localhost:27017/work-time-tracker

# バッチ処理設定
ERROR_LOG_BATCH_SIZE=10
ERROR_LOG_FLUSH_INTERVAL=5000
```

### データベース設定
```javascript
// ErrorLogコレクションのインデックス
db.errorlogs.createIndex({ "timestamp": -1 })
db.errorlogs.createIndex({ "level": 1 })
db.errorlogs.createIndex({ "endpoint": 1 })
db.errorlogs.createIndex({ "userId": 1 })
```

## 更新履歴
- 2025-09-06: 初版作成
- 2025-09-06: MongoDB連携実装
- 2025-09-06: リアルタイム監視機能追加
