# Anthropic AI Integration Setup Guide

## 概要

このガイドでは、Work Time TrackerアプリケーションでAnthropic Claude APIを使用するための設定方法を説明します。

## セットアップ手順

### クイックスタート（推奨）

#### Windows

```powershell
pnpm setup:anthropic:win
```

#### Mac/Linux

```bash
pnpm setup:anthropic:unix
```

このコマンドで以下が自動的に実行されます：

1. APIキーの設定
2. 依存関係のインストール
3. 開発サーバーの起動

### 手動セットアップ

#### 1. Anthropic APIキーの取得

1. [Anthropic Console](https://console.anthropic.com)にアクセス
2. アカウントを作成またはログイン
3. APIキーセクションで新しいキーを生成
4. キーを安全な場所にコピー（一度しか表示されません）

#### 2. 環境変数の設定

プロジェクトルートに`.env.local`ファイルを作成：

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-api-key-here
```

**重要**: `.env.local`ファイルは`.gitignore`に含まれているため、GitHubにコミットされません。

#### 3. 開発サーバーの起動

**オプション1: 通常の開発サーバー（推奨）**

```bash
pnpm dev
```

このコマンドで以下が起動します：

- Viteフロントエンド開発サーバー（ポート3000）
- 統合APIサーバー（ポート3001） - Anthropicプロキシを含む

**オプション2: Vercel CLI（本番環境に近い）**

```bash
# Vercel CLIをインストール（未インストールの場合）
npm i -g vercel

# Vercel開発サーバーを起動
pnpm dev:vercel
```

#### 4. API機能の確認

1. ブラウザで http://localhost:3000 を開く
2. サイドメニューから「🤖 AIアシスタント」をクリック
3. チャットに質問を入力して送信

### 本番環境（Vercel）へのデプロイ

1. [Vercel Dashboard](https://vercel.com)にアクセス
2. プロジェクトを選択
3. Settings → Environment Variables
4. 以下の変数を追加：
   - Key: `ANTHROPIC_API_KEY`
   - Value: あなたのAPIキー
   - Environment: Production, Preview, Development
5. 再デプロイ

## アーキテクチャ

### セキュアなAPI設計

```
[フロントエンド] → [APIプロキシ] → [Anthropic API]
     ↑                ↑                    ↑
  ブラウザ      Vercel Function      外部API
                 (APIキー保持)
```

- **フロントエンド**: APIキーを持たない
- **APIプロキシ**: サーバーサイドでAPIキーを安全に管理
- **CORS対応**: プロキシがCORSヘッダーを適切に設定

### ファイル構成

```
work-time-tracker/
├── api/
│   └── ai/
│       └── anthropic.ts    # APIプロキシエンドポイント
├── src/
│   ├── services/
│   │   └── ai/
│   │       └── anthropicService.ts  # フロントエンドサービス
│   ├── components/
│   │   └── ai/
│   │       ├── AIChat.tsx          # チャットUI
│   │       └── AISettings.tsx      # 設定UI
│   └── pages/
│       └── AIAssistantPage.tsx     # AIアシスタントページ
└── .env.local                      # ローカル環境変数（gitignore）
```

## トラブルシューティング

### CORS エラー

**症状**: "Access to fetch at 'https://api.anthropic.com/v1/messages' from origin 'http://localhost:3000' has been blocked by CORS policy"

**解決方法**:

- APIプロキシが正しく設定されているか確認
- `vercel dev`を使用してローカル開発サーバーを起動
- `/api/ai/anthropic`エンドポイントを使用しているか確認

### API キーエラー

**症状**: "Anthropic API key not configured"

**解決方法**:

- `.env.local`ファイルが存在するか確認
- `ANTHROPIC_API_KEY`が正しく設定されているか確認
- 開発サーバーを再起動

### レート制限エラー

**症状**: "Rate limit exceeded"

**解決方法**:

- APIリクエストの頻度を減らす
- レート制限設定を確認（デフォルト: 10リクエスト/分）
- 必要に応じてAnthropic プランをアップグレード

## セキュリティベストプラクティス

1. **APIキーの保護**
   - APIキーを絶対にフロントエンドコードに含めない
   - 環境変数を使用して管理
   - `.env.local`ファイルをGitにコミットしない

2. **アクセス制御**
   - 本番環境では認証を実装
   - レート制限を適切に設定
   - 不正なリクエストを監視

3. **データ保護**
   - 機密情報をAIに送信しない
   - ユーザーデータを適切にサニタイズ
   - ログに機密情報を含めない

## 利用可能な機能

### AIチャット

- タスク管理に関する質問応答
- 自然言語でのタスク作成
- ワークフロー最適化の提案

### コード生成

- 多言語対応（TypeScript, Python, etc.）
- フレームワーク対応
- 要件ベースの実装

### タスク分析

- 優先度の自動調整提案
- 時間見積もり
- タスクグループ化
- 複雑なタスクの分解

## サポート

問題が解決しない場合は、以下をお試しください：

1. [Anthropic Documentation](https://docs.anthropic.com)を参照
2. プロジェクトのGitHub Issuesで報告
3. コンソールログを確認してエラーの詳細を把握

## 更新履歴

- 2024-12-30: 初版作成
- APIプロキシ実装によるCORS問題の解決
- セキュアなAPI設計の採用
