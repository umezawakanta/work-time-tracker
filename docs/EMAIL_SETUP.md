# メール送信設定ガイド

## 概要

Work Time Trackerのパスワードリセット機能でメール送信を行うための設定方法です。

## 環境変数設定

### Vercel本番環境

Vercelのダッシュボードで以下の環境変数を設定してください：

#### Gmailを使用する場合（推奨）

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

#### カスタムSMTPサーバーを使用する場合

```
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@your-domain.com
SMTP_PASS=your-password
SMTP_FROM=your-email@your-domain.com
```

### 開発環境

`.env.local`ファイルに以下の環境変数を設定してください：

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

## Gmail App Passwordの取得方法

1. Googleアカウントの2段階認証を有効にする
2. [Googleアカウント設定](https://myaccount.google.com/)にアクセス
3. 「セキュリティ」→「2段階認証プロセス」→「アプリパスワード」
4. 「アプリを選択」→「メール」を選択
5. 生成された16文字のパスワードを`GMAIL_APP_PASSWORD`に設定

## 設定確認

メール送信機能は以下のログで確認できます：

```
Email service environment check: {
  VERCEL: true,
  SMTP_HOST: 'Not set',
  SMTP_USER: 'Not set',
  SMTP_PASS: 'Not set',
  GMAIL_USER: 'Set',
  GMAIL_APP_PASSWORD: 'Set'
}
✅ Email service initialized for Vercel with Gmail
```

## トラブルシューティング

### メールが送信されない場合

1. 環境変数が正しく設定されているか確認
2. Gmail App Passwordが正しいか確認
3. 2段階認証が有効になっているか確認
4. Vercelのログでエラーメッセージを確認

### よくあるエラー

- `Invalid login`: Gmail App Passwordが間違っている
- `Connection timeout`: ネットワーク設定の問題
- `Authentication failed`: 認証情報が正しくない

## セキュリティ注意事項

- 環境変数は機密情報です。GitHubにコミットしないでください
- Gmail App Passwordは定期的に更新することを推奨します
- 本番環境では専用のメールサービス（SendGrid、Mailgun等）の使用を検討してください
