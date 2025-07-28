# 本番環境デプロイメントガイド

Work Time Tracker アプリケーションを本番環境にデプロイするための包括的なガイドです。

## 📋 前提条件

### 必要なアカウント・サービス

- [Vercel](https://vercel.com) アカウント（推奨）
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) アカウント
- [Stripe](https://stripe.com) アカウント（課金機能用）
- ドメイン名（オプション）

### 必要なツール

- Node.js 18+
- pnpm または npm
- Git

## 🗄️ データベース設定

### MongoDB Atlas設定

1. **MongoDB Atlasクラスターの作成**

   ```bash
   # MongoDB Atlas (https://cloud.mongodb.com) にログイン
   # 新しいクラスターを作成
   # クラスター名: work-time-tracker-prod
   # プロバイダー: AWS/GCP/Azure（お好みで）
   # リージョン: Tokyo (ap-northeast-1) 推奨
   ```

2. **データベースユーザーの作成**

   ```bash
   # Database Access > Add New Database User
   # Username: work-time-tracker
   # Password: 強力なパスワードを生成
   # Database User Privileges: Read and write to any database
   ```

3. **ネットワークアクセスの設定**

   ```bash
   # Network Access > Add IP Address
   # Vercel用: 0.0.0.0/0 (Allow access from anywhere)
   # セキュリティ強化: 特定のIPアドレスのみ許可
   ```

4. **接続文字列の取得**
   ```bash
   # Connect > Connect your application
   # Driver: Node.js
   # 接続文字列をコピー: mongodb+srv://username:password@cluster.mongodb.net/
   ```

## 💳 Stripe設定

### Stripeアカウント設定

1. **Stripe Dashboardにログイン**

   ```bash
   # https://dashboard.stripe.com
   # アカウントの有効化（本人確認書類の提出）
   ```

2. **商品とプランの作成**

   ```bash
   # Products > Add Product

   # フリープラン
   Name: フリープラン
   Price: 0 JPY (one-time または recurring)

   # ベーシックプラン
   Name: ベーシックプラン
   Price: 980 JPY/month

   # プレミアムプラン
   Name: プレミアムプラン
   Price: 2980 JPY/month
   ```

3. **APIキーの取得**

   ```bash
   # Developers > API keys
   # Publishable key: pk_live_... (本番用)
   # Secret key: sk_live_... (本番用)
   ```

4. **Webhook設定**
   ```bash
   # Developers > Webhooks > Add endpoint
   # Endpoint URL: https://your-domain.com/api/webhooks/stripe
   # Events:
   #   - invoice.payment_succeeded
   #   - invoice.payment_failed
   #   - customer.subscription.updated
   #   - customer.subscription.deleted
   ```

## 🚀 Vercelデプロイメント

### 1. GitHubリポジトリの準備

```bash
# プロジェクトをGitHubにプッシュ
git add .
git commit -m "feat: 本番環境対応完了"
git push origin main
```

### 2. Vercelプロジェクトの作成

```bash
# Vercel Dashboard (https://vercel.com/dashboard)
# Import Git Repository
# GitHub リポジトリを選択
# プロジェクト名: work-time-tracker
```

### 3. 環境変数の設定

Vercel Dashboard > Settings > Environment Variables で以下を設定：

```bash
# 必須環境変数
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workTimeTracker
JWT_SECRET=your-super-secret-jwt-key-128-characters-minimum
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# オプション環境変数
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
RATE_LIMIT_MAX=100
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

### 4. ビルド設定

```bash
# vercel.json（既に設定済み）
{
  "buildCommand": "pnpm run build",
  "framework": "vite",
  "installCommand": "pnpm install"
}
```

### 5. デプロイメント実行

```bash
# 自動デプロイ: GitHubプッシュで自動実行
# 手動デプロイ: Vercel Dashboard > Deployments > Deploy

# CLI経由でのデプロイ
npm i -g vercel
vercel login
vercel --prod
```

## 🔐 セキュリティ設定

### 1. 環境変数のセキュリティ

```bash
# 強力なJWTシークレット生成
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# パスワードポリシー
- 最小8文字
- 大文字・小文字・数字・記号を含む
- 一般的なパスワードは禁止
```

### 2. レート制限設定

```bash
# API保護設定（middleware内で設定済み）
RATE_LIMIT_WINDOW=900000  # 15分
RATE_LIMIT_MAX=100        # 100リクエスト/15分
```

### 3. CORS設定

```bash
# 許可するオリジンを明確に指定
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

## 📊 監視・ログ設定

### 1. Vercel Analytics

```bash
# Vercel Dashboard > Analytics
# 有効化してトラフィック監視
```

### 2. アプリケーションログ

```bash
# Vercel Functions > Function Logs
# エラーログとパフォーマンス監視
```

### 3. 外部監視サービス（推奨）

```bash
# Sentry設定
npm install @sentry/node @sentry/nextjs
# SENTRY_DSN環境変数を設定

# Uptime監視
# UptimeRobot, Pingdom等でヘルスチェック設定
```

## 🧪 本番環境テスト

### 1. 機能テスト checklist

```bash
✅ ユーザー登録・ログイン
✅ パスワードリセット
✅ プロファイル更新
✅ プロジェクト・タスク管理
✅ 時間追跡機能
✅ レポート生成
✅ サブスクリプション管理
✅ 決済処理（Stripe）
✅ データのエクスポート
✅ モバイル対応確認
```

### 2. パフォーマンステスト

```bash
# Lighthouse スコア目標
Performance: 90+
Accessibility: 95+
Best Practices: 90+
SEO: 90+

# Core Web Vitals
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
```

### 3. セキュリティテスト

```bash
# OWASP ZAP等でセキュリティスキャン
# SQL Injection対策確認
# XSS対策確認
# CSRF対策確認
# 認証・認可テスト
```

## 🔄 継続的デプロイメント

### 1. GitHub Actions設定（オプション）

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 2. 自動テスト実行

```bash
# テストスイート作成
npm run test:unit
npm run test:integration
npm run test:e2e

# カバレッジ目標: 80%+
```

## 🗃️ バックアップ・復旧

### 1. データベースバックアップ

```bash
# MongoDB Atlas自動バックアップ有効化
# Point-in-time復旧: 過去24時間
# スナップショット: 日次、週次、月次

# 手動バックアップ
mongodump --uri="mongodb+srv://..." --db workTimeTracker
```

### 2. ファイルバックアップ

```bash
# アップロードファイルのS3バックアップ
# バージョニング有効化
# ライフサイクルポリシー設定
```

## 📈 スケーリング計画

### 1. データベース最適化

```bash
# インデックス最適化
# 読み取りレプリカ設定
# シャーディング計画（大規模時）
```

### 2. CDN設定

```bash
# Vercel Edge Network（自動）
# 静的アセットのキャッシュ最適化
# 画像最適化有効化
```

### 3. 負荷分散

```bash
# Vercel Function の自動スケーリング
# データベース接続プール最適化
# Redis キャッシング導入（必要時）
```

## 🆘 トラブルシューティング

### よくある問題と解決策

1. **ビルドエラー**

   ```bash
   # TypeScript エラー
   npm run type-check

   # 依存関係エラー
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **データベース接続エラー**

   ```bash
   # 接続文字列確認
   # ネットワークアクセス設定確認
   # データベースユーザー権限確認
   ```

3. **Stripe統合エラー**
   ```bash
   # APIキーの確認（test/live）
   # Webhook設定確認
   # 商品・価格ID確認
   ```

## 📞 サポート

### サポートチャンネル

- **技術サポート**: support@work-time-tracker.com
- **ドキュメント**: [GitHub Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

### 緊急時連絡先

- **システム障害**: emergency@work-time-tracker.com
- **セキュリティ問題**: security@work-time-tracker.com

---

## ✅ デプロイメント完了確認

本番環境デプロイメントが完了したら、以下を確認してください：

- [ ] アプリケーションが正常に動作している
- [ ] 全ての環境変数が正しく設定されている
- [ ] データベース接続が確立されている
- [ ] Stripe決済が正常に動作している
- [ ] SSL証明書が有効である
- [ ] 監視・アラートが設定されている
- [ ] バックアップが設定されている
- [ ] パフォーマンステストが完了している

🎉 **本番環境デプロイメント完了おめでとうございます！**
