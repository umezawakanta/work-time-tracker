# 🚀 Work Time Tracker - LifeSync

[![Coverage](https://img.shields.io/badge/Coverage-80%25-brightgreen?style=for-the-badge&logo=jest)](https://github.com/your-repo/work-time-tracker/actions)
[![Performance](https://img.shields.io/badge/Performance-87-yellow?style=for-the-badge&logo=lighthouse)](https://github.com/your-repo/work-time-tracker/actions)
[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-PASSED-brightgreen?style=for-the-badge&logo=github-actions)](https://github.com/your-repo/work-time-tracker/actions)
[![Build Status](https://img.shields.io/github/actions/workflow/status/your-repo/work-time-tracker/quality-check.yml?style=for-the-badge&logo=github-actions)](https://github.com/your-repo/work-time-tracker/actions)

React + TypeScript + Viteを使用した包括的な生産性管理プラットフォーム

## 🎯 新コンセプト（Landing）

**「人生の舵を、今日から握り直す。」**

AIパーソナル秘書が予定・集中・習慣を一元管理し、毎日の意思決定と実行をサポートします。

- ヒーローコピー: 「人生の舵を、今日から握り直す。」
- サブコピー: 「AIパーソナル秘書が予定・集中・習慣を一元管理」
- CTA: 「今すぐ始める」 / 「3分でセットアップ」
- 追加CTA: 「今日の最重要タスクを提案」（AIモーダル）

## ✨ 主要機能

### 🎯 **統合ダッシュボード**

- 📊 リアルタイム品質メトリクス監視
- 🏆 開発バッジシステム
- 📈 パフォーマンストラッキング

### 🛡️ **品質管理システム**

- 🧪 **テストカバレッジ**: 自動測定・レポート
- 🔍 **静的解析**: ESLint + TypeScript
- ⚡ **パフォーマンス**: Lighthouse統合
- 🎯 **品質ゲート**: CI/CD自動チェック

### 🚀 **開発機能**

- ✅ 統合タスク管理センター（TODO、ADHD、ゲームループ、AI分析）
- 📝 ブログ・日記機能
- 📚 読書管理・学習トラッカー
- 💰 資産管理・家計簿

### 🤖 **AI機能** (NEW!)

- 💬 **AIチャット**: Anthropic Claude連携による対話型アシスタント
- 🧠 **タスク分析**: AIによる優先度最適化・時間見積もり
- 💻 **コード生成**: 要件からの自動コード生成
- 📊 **ワークフロー最適化**: 作業効率化の提案
- 🔗 **タスク管理連携**: 自然言語でタスクを作成・更新・分析
- 📝 **スマート提案**: AIがタスクの最適な処理方法を提案
- 🎯 **自動タスク並び替え**: タスク追加時にAIが最適な実行順序に自動整理
- 📧 **メール通知機能**: タスク追加・締切接近・デイリーダイジェストをメールで通知

#### AI機能の概要（本プロジェクト拡張点）

- 「今日の最重要タスクを提案」モーダル（`AIPriorityTaskModal`）
  - 入力: 現在の状況
  - 出力: 1件の優先タスク（理由付き）
  - APIキー未設定時はガード表示と「設定を開く」導線
- `useAIAction` フック
  - 状態管理: `idle | loading | success | error`
  - `execute`/`retry`/`cancel`/`reset`、計測（開始/終了/試行回数）
- `AdvancedAIService`
  - プロバイダー: `openai | anthropic | gemini | local`
  - 厳密な型定義（レスポンス最小構造）と `response.ok` チェック
  - ローカルフォールバック実装
- `AIHistoryService`
  - IndexedDB にAIリクエスト/レスポンスを保存（最新500件）
  - `AIHistoryPanel` で参照可能
- `BlogAiService`
  - Gemini API によるブログ分析（タイトル改善/タグ/SEO提案など）
  - 失敗時は安全にローカル分析へフォールバック
- `BlogTaskExtractionService`（NEW）
  - ブログ本文からAIで「実行可能なタスク」を抽出し、プレビュー後に一括追加できる新機能
  - キー未設定時はガード表示と「設定を開く」導線、抽出イベントは計測（クリック/成功/失敗）
- `ErrorBoundary`（`variant="app"`）
  - AI系エラー検知時、APIキー/レート制限/ネットワーク確認のガイダンスと「設定を開く」を表示
- 計測
  - CTAクリック: `cta_click` を `trackCtaClick` で一元計測（ヒーロー/AIモーダル）

## 🏗️ アーキテクチャ

### 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Redux Toolkit
- **Build**: Vite + SWC
- **Testing**: Jest + Testing Library
- **Quality**: ESLint + Prettier
- **CI/CD**: GitHub Actions

### 品質保証システム

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  GitHub Actions │───▶│ Quality Pipeline │───▶│ Dashboard API   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
   ┌───────────┐          ┌─────────────┐          ┌─────────────┐
   │   Tests   │          │ Static Analysis│       │  Lighthouse │
   │ Coverage  │          │ ESLint + TS   │       │ Performance │
   └───────────┘          └─────────────┘          └─────────────┘
```

## 🚀 クイックスタート

### 環境要件

- Node.js 18+
- npm 9+ or pnpm 8+

### セットアップ

```bash
# リポジトリクローン
git clone https://github.com/your-repo/work-time-tracker.git
cd work-time-tracker

# 依存関係インストール
pnpm install
# または
npm install

# 開発サーバー起動
pnpm dev
# または
npm run dev

# テスト実行
pnpm test

# 品質チェック実行
pnpm lint
pnpm type-check
```

### ⚙️ 環境変数（.env）

AI機能やAPI連携のため、`.env`（または `.env.local`）をプロジェクト直下に作成してください。以下は最小例です。

```env
# API
VITE_API_BASE_URL=http://localhost:3001/api

# AI Provider Keys（必要なもののみ設定）
VITE_GEMINI_API_KEY=
VITE_OPENAI_API_KEY=
VITE_ANTHROPIC_API_KEY=

# Optional flags
VITE_ENABLE_ANALYTICS=false
VITE_DEBUG=false
```

補足:

- 開発は `pnpm dev`（フロント＋API）で起動します
- APIキー未設定時でもアプリは動作し、AI機能はローカルフォールバックまたはガード表示になります

### 🤖 AI機能のセットアップ（オプション）

```bash
# Windows
pnpm setup:anthropic:win

# Mac/Linux
pnpm setup:anthropic:unix
```

または手動でセットアップ:

1. [Anthropic Console](https://console.anthropic.com)でAPIキーを取得
2. `.env.local`ファイルを作成し、APIキーを設定
3. `pnpm dev`で開発サーバーを起動

詳細は[AI設定ガイド](docs/anthropic-setup.md)を参照

### 品質ダッシュボード

```bash
# 開発サーバー起動後
open http://localhost:5173/quality-dashboard
```

## 🛡️ 品質基準

### 品質ゲート要件

- ✅ **テストカバレッジ**: 80%以上
- ✅ **ESLintエラー**: 0件
- ✅ **TypeScriptエラー**: 0件
- ✅ **パフォーマンス**: 85点以上

### 自動チェック

- 🔄 **プッシュ時**: 全品質チェック実行
- 📝 **PR作成時**: カバレッジレポート自動コメント
- ⏰ **定期実行**: 毎日午前9時（JST）

## 📊 品質メトリクス

### 現在のスコア

| メトリクス           | スコア | ステータス  |
| -------------------- | ------ | ----------- |
| **テストカバレッジ** | 80.1%  | ✅ 良好     |
| **コード品質**       | 87%    | ✅ 良好     |
| **パフォーマンス**   | 87点   | ⚠️ 改善可能 |
| **アクセシビリティ** | 94点   | ✅ 優秀     |

### トレンド

- 📈 **テストカバレッジ**: +5% (先月比)
- 🔧 **ESLintエラー**: -12件 (先週比)
- ⚡ **パフォーマンス**: +3点 (先月比)

## 🎯 開発バッジシステム

### 獲得済みバッジ

- 🚀 **開発開始** (100%) - 初回コミット完了
- 🏗️ **アーキテクト** (100%) - プロジェクト構造整備
- 🎯 **機能コンプリート** (100%) - 全主要機能実装
- 🛡️ **品質の守護者** (100%) - テストカバレッジ80%達成

### 獲得可能バッジ

- ✅ **TODOマスター** (85%) - TODO分析機能実装で達成
- ⚡ **スピードデーモン** (85%) - Lighthouse 90点で達成
- 🎨 **デザイン完璧主義者** (80%) - アクセシビリティ完全対応

## 🔧 開発ガイド

### Git ワークフロー

```bash
# 機能ブランチ作成
git checkout -b feature/your-feature

# コミット前の品質チェック
npm run pre-commit

# プッシュ
git push origin feature/your-feature
```

### コーディング規約

- **TypeScript**: Strict mode有効
- **ESLint**: Airbnb設定ベース
- **Prettier**: 自動フォーマット
- **コミット**: Conventional Commits

### テスト戦略

```bash
# 単体テスト
npm run test:unit

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e

# カバレッジレポート
npm run test:coverage
```

## 📈 CI/CD パイプライン

### GitHub Actions ワークフロー

1. **🧪 テスト実行**
   - Jest単体テスト
   - カバレッジ計測
   - 結果レポート生成

2. **🔍 静的解析**
   - ESLint実行
   - TypeScript型チェック
   - セキュリティスキャン

3. **⚡ パフォーマンステスト**
   - Lighthouse実行
   - Core Web Vitals測定
   - 改善提案生成

4. **📊 品質ダッシュボード更新**
   - メトリクス集約
   - トレンド分析
   - アラート生成

### 設定ファイル

- `.github/workflows/quality-check.yml`: メインワークフロー
- `lighthouserc.json`: Lighthouse設定
- `jest.config.js`: テスト設定
- `eslint.config.js`: 静的解析設定

## 🚀 デプロイ

### 本番環境

```bash
# ビルド
npm run build

# プレビュー
npm run preview

# デプロイ（Vercel）
vercel --prod
```

### 環境変数

```env
# API設定
VITE_API_URL=https://your-api.com
QUALITY_API_URL=https://your-quality-api.com

# GitHub統合
GITHUB_TOKEN=your-github-token
SLACK_WEBHOOK_URL=your-slack-webhook
```

## 🤝 コントリビューション

### 開発参加方法

1. イシュー確認・作成
2. フォーク・ブランチ作成
3. 実装・テスト追加
4. PR作成・レビュー

### 品質要件

- ✅ 全テストが通過
- ✅ カバレッジ80%以上維持
- ✅ ESLintエラー0件
- ✅ 型エラー0件
- ✅ パフォーマンス影響なし

## 📞 サポート

- 🐛 **バグ報告**: [Issues](https://github.com/your-repo/work-time-tracker/issues)
- 💡 **機能要望**: [Discussions](https://github.com/your-repo/work-time-tracker/discussions)
- 📧 **お問い合わせ**: support@your-domain.com

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照

---

## 🎉 最新アップデート

### v2.1.0 (2024-11-20)

- 🛡️ **品質ダッシュボード**: リアルタイム品質監視
- 🔄 **GitHub Actions統合**: 自動品質チェック
- 🏆 **開発バッジシステム**: ゲーミフィケーション
- 📊 **パフォーマンス分析**: Lighthouse統合

**🚀 継続的な品質向上で、より良いコードベースを構築しています！**

## 🌟 特徴

- **AI搭載タスク管理**: 自然言語処理による智的なタスク提案
- **リアルタイム分析**: 生産性の可視化とインサイト
- **多言語対応**: 日本語・英語・中国語・韓国語・RTL言語サポート
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **PWA対応**: オフライン機能とプッシュ通知
- **ダークモード**: 目に優しいテーマ切り替え

## 🚀 デプロイメント

### Vercel デプロイメント

このプロジェクトは Vercel にデプロイ可能です：

1. **自動デプロイ**: GitHubリポジトリに接続して自動デプロイ
2. **API関数**: `/api` ルートは自動的にサーバーレス関数として動作
3. **環境変数**: Vercel ダッシュボードで必要な環境変数を設定

#### 必要な環境変数

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

#### デプロイコマンド

```bash
# 本番ビルド
pnpm run vercel-build

# ローカル Vercel 開発
vercel dev
```

### トラブルシューティング

#### ビルドエラー: "Function Runtimes must have a valid version"

この問題は `vercel.json` の設定で解決済みです。Node.js ランタイムバージョンが正しく指定されています。

#### TypeScript コンパイルエラー

- API関数用の専用 `tsconfig.json` が `api/` フォルダに配置されています
- Vercel のビルドプロセスと互換性があります

## 🚀 クイックスタート

### AI機能の設定

```bash
# .env.localファイルにAnthropicのAPIキーを追加
echo "ANTHROPIC_API_KEY=your-api-key" >> .env.local
```

### メール通知の設定

```bash
# .env.localファイルにメール設定を追加
echo "EMAIL_SERVICE=gmail" >> .env.local
echo "EMAIL_USER=your-email@gmail.com" >> .env.local
echo "EMAIL_PASS=your-app-password" >> .env.local
```

詳細な設定方法:

- [AI機能セットアップガイド](docs/anthropic-setup.md)
- [メール通知セットアップガイド](docs/email-notification-setup.md)

## 📦 インストール

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm run dev

# ビルド
pnpm run build

# テスト実行
pnpm run test
```

## 🛠️ 開発

### プロジェクト構造

```
work-time-tracker/
├── api/                    # Vercel サーバーレス関数
│   ├── auth/              # 認証API
│   ├── todos/             # Todo管理API
│   └── tsconfig.json      # API用TypeScript設定
├── src/                   # React アプリケーション
│   ├── components/        # Reactコンポーネント
│   ├── services/          # ビジネスロジック
│   ├── types/            # TypeScript型定義
│   └── utils/            # ユーティリティ
├── vercel.json           # Vercel設定
├── vite.config.ts        # Vite設定
└── tsconfig.json         # TypeScript設定
```

### 開発ガイドライン

- **TypeScript**: strict モード有効、明示的型定義必須
- **React**: 関数コンポーネント、カスタムフック使用
- **スタイル**: Tailwind CSS、レスポンシブデザイン
- **テスト**: Jest + Testing Library、カバレッジ 80% 以上

## 🧪 テスト

```bash
# 単体テスト
pnpm run test:unit

# 統合テスト
pnpm run test:integration

# E2Eテスト
pnpm run test:e2e

# カバレッジレポート
pnpm run test:coverage
```

## 🌐 対応ブラウザ

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Made with ❤️ by the Work Time Tracker Team**
U p d a t e d   b u i l d   t i m e s t a m p :   0 7 / 2 8 / 2 0 2 5   0 4 : 3 5 : 2 3 
 
 
