# パスワードリセット機能 運用マニュアル

## 機能概要
パスワードを忘れたユーザーがメールアドレスを使用してパスワードをリセットする機能。セキュアなトークンベースの認証を使用。

## 技術仕様

### フロントエンド
- **ページ**: `/forgot-password`, `/reset-password`
- **コンポーネント**: `ForgotPassword.tsx`, `ResetPassword.tsx`
- **API**: `/api/auth/password-reset`

### バックエンド
- **エンドポイント**: `/api/auth/password-reset`
- **認証**: トークンベース認証
- **データベース**: MongoDB (Userコレクション)

### データフロー
1. ユーザーがメールアドレスを入力
2. システムがユーザーを検索
3. リセットトークンを生成・保存
4. メール送信
5. ユーザーがメール内のリンクをクリック
6. 新しいパスワードを入力
7. パスワードを更新

## 運用手順

### 1. 監視項目
- **メール送信率**: 95%以上
- **トークン有効率**: 99%以上
- **パスワードリセット成功率**: 90%以上
- **エラー率**: 5%以下

### 2. メール送信設定
```bash
# 環境変数設定
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. トークン管理
- **有効期限**: 24時間
- **生成方式**: 暗号学的に安全な乱数（32バイト）
- **保存場所**: MongoDB Userコレクション

### 4. セキュリティ設定
- **パスワード要件**: 8文字以上、大文字・小文字・数字を含む
- **ハッシュ化**: bcrypt（salt rounds: 12）
- **トークン無効化**: 使用後即座に無効化

## トラブルシューティング

### よくある問題

#### 1. メールが送信されない
**原因**: SMTP設定エラー
**対処**: 環境変数を確認・修正

#### 2. トークンが無効
**原因**: 期限切れまたは使用済み
**対処**: 新しいトークンを生成

#### 3. パスワードリセットが失敗
**原因**: データベース接続エラー
**対処**: MongoDB接続を確認

### 緊急時対応
1. **メール送信停止**: SMTP設定を無効化
2. **トークン無効化**: 全トークンを削除
3. **機能停止**: パスワードリセット機能を一時的に無効化

## セキュリティ

### 認証・認可
- トークンベース認証
- トークン有効期限チェック
- 使用済みトークンの無効化

### データ保護
- パスワードのハッシュ化
- トークンの暗号化
- セキュリティヘッダーの設定

## パフォーマンス

### 最適化
- トークンの効率的な生成
- データベースクエリの最適化
- メール送信の非同期処理

### 監視指標
- メール送信時間
- トークン生成時間
- データベース応答時間

## 設定

### 環境変数
```bash
# メール送信設定
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# アプリケーション設定
NEXT_PUBLIC_APP_URL=https://work-time-tracker-five.vercel.app
JWT_SECRET=your-jwt-secret
MONGODB_URI=mongodb://localhost:27017/work-time-tracker
```

### データベース設定
```javascript
// Userコレクションのインデックス
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "passwordResetToken": 1 })
db.users.createIndex({ "passwordResetExpires": 1 })
```

## 更新履歴
- 2025-09-06: 初版作成
- 2025-09-06: MongoDB連携実装
- 2025-09-06: メール送信機能実装
- 2025-09-06: セキュリティ強化
