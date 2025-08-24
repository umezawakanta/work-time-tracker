# 🚀 Work Time Tracker - 本番環境セットアップガイド

## 📋 本番デプロイ前のチェックリスト

### ✅ 必須環境変数の設定

**Vercel Dashboard > Settings > Environment Variables で以下を設定:**

```bash
# 🗄️ データベース（必須）
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workTimeTracker
JWT_SECRET=ランダムな256bit以上の文字列

# 💳 Stripe課金（必須）
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 🐙 GitHub統合（推奨）
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=your-username
GITHUB_REPO=work-time-tracker

# 🔐 セキュリティ
VITE_ADMIN_EMAILS=admin@yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### 🛡️ セキュリティ確認事項

1. **強力なJWTシークレット生成**

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **MongoDB Atlas IP制限**
   - 0.0.0.0/0（全開放）→ 特定IPのみに制限

3. **Stripe本番キー確認**
   - テストキー（sk*test*）ではなく本番キー（sk*live*）使用

### 💳 Stripe設定

1. **商品・プラン作成**

   ```
   フリープラン: ¥0/月
   ベーシック: ¥980/月
   プレミアム: ¥2,980/月
   ```

2. **Webhook設定**
   ```
   URL: https://yourdomain.com/api/webhooks/stripe
   イベント:
   - invoice.payment_succeeded
   - invoice.payment_failed
   - customer.subscription.updated
   - customer.subscription.deleted
   ```

### 🔧 CI/CD自動進捗反映

GitHub Actions が既に設定済み：

- **コミット** → 自動で関連タスクの進捗更新
- **PR マージ** → タスク完了判定
- **品質チェック** → 改善計画ページに反映

## 🎯 ユーザー獲得戦略

### 🚀 Phase 1: ソフトローンチ（1-3ヶ月）

#### ターゲット層

1. **ADHD/ASD当事者コミュニティ**
   - Twitter #ADHD #ASD タグでの情報発信
   - 当事者ブログ・YouTuberとのコラボ

2. **フリーランス・リモートワーカー**
   - 時間管理に課題を抱える個人事業主
   - 副業・複業で複数プロジェクトを管理する人

3. **小規模開発チーム**
   - スタートアップ・SaaS企業
   - アジャイル開発チーム

#### マーケティング施策

1. **コンテンツマーケティング**

   ```
   - ADHD向け時間管理術ブログ記事
   - 実際の利用データに基づく効果測定記事
   - 開発者向けGitHub連携活用法
   ```

2. **SNS戦略**

   ```
   Twitter: 開発進捗とユーザー事例のリアルタイム発信
   YouTube: 機能デモ動画・ユーザーインタビュー
   note: 開発背景・ADHD当事者視点の記事
   ```

3. **コミュニティ活動**
   ```
   - 障害者就労支援団体でのデモ
   - 開発者勉強会での発表
   - ADHD当事者会での体験会
   ```

### 🎯 Phase 2: グロース期（3-6ヶ月）

#### 拡大戦略

1. **紹介プログラム**

   ```
   紹介した人・された人両方に1ヶ月無料
   企業導入時は紹介者に報酬
   ```

2. **パートナーシップ**

   ```
   - 障害者雇用企業との提携
   - 人事労務システムとの連携
   - 医療機関（発達障害外来）との協力
   ```

3. **機能拡充**
   ```
   - チーム機能の本格実装
   - API公開によるサードパーティ連携
   - モバイルアプリ開発
   ```

### 📊 Phase 3: スケール期（6-12ヶ月）

#### 事業拡大

1. **B2B展開**

   ```
   - 企業向け管理ダッシュボード
   - 人事システムとの連携
   - 障害者雇用支援機能
   ```

2. **国際展開**

   ```
   - 英語版リリース
   - 海外ADHD支援団体との連携
   - 現地法規制への対応
   ```

3. **データ活用サービス**
   ```
   - 匿名化データの研究機関提供
   - ADHD特性に基づく個別最適化AI
   - 生産性向上コンサルティング
   ```

### 💰 収益モデル

#### サブスクリプション階層

```
🆓 フリー: 基本的な時間記録
💎 ベーシック（¥980/月）: GitHub連携、詳細分析
🚀 プレミアム（¥2,980/月）: チーム機能、AI分析
🏢 エンタープライズ: カスタム価格、専用サポート
```

#### 追加収益源

- **導入コンサルティング**: 企業向け設定支援
- **データ分析レポート**: 月次・四半期レポート作成
- **API利用料**: サードパーティ連携による従量課金

### 📈 成功指標（KPI）

#### ユーザー指標

- **MAU（月間アクティブユーザー）**: 3ヶ月で1,000人
- **課金率**: フリーユーザーの15%が有料プランに移行
- **継続率**: 6ヶ月後の継続率70%以上

#### 事業指標

- **MRR（月間経常収益）**: 6ヶ月で¥500万
- **LTV/CAC比**: 3.0以上を維持
- **NPS（Net Promoter Score）**: 50以上

## 🏁 次のステップ

1. **環境変数設定**: 上記の必須変数をVercelに設定
2. **Stripe設定**: 商品・Webhook設定
3. **ソフトローンチ**: 限定ユーザーでのベータテスト開始
4. **フィードバック収集**: 改善点の洗い出し
5. **マーケティング開始**: コンテンツ制作とSNS発信

**🎉 サイトは本番環境対応が完了しています！**
**ユーザーからクレームが来ないよう、十分にテストしてからリリースしましょう。**
