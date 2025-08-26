# Work Time Tracker (LifeSync)

AI支援の生産性管理アプリ（React + TypeScript + Vite）。ブログとタスクを連携し、AIが「今日の最重要タスク」提案や、ブログ本文からのタスク抽出を支援します。

## 主な機能

- ランディング（コピー集中管理: `src/constants/copy.ts`）
- AI「今日の最重要タスクを提案」モーダル（キー未設定ガード・計測）
- ブログ機能（AI Q&A貼り付け、AI分析）
- ブログ→AI抽出→タスク一括追加（`BlogTaskExtractionService`）
- Reduxベースの状態管理（`aiSuggestionSlice`, `todoSlice.addMany`）
- アクセシビリティ（focus ring / skip links / aria-label）
- 計測（`page_view_home` / `cta_click` / `ai_suggest_click` / `ai_success` ほか抽出系）
- 新ルート: `/ai-assistant`, `/assessments`, `/iq-test`, `/mbti-test`, `/learning`
- Vercel プレビュー/本番デプロイ（GitHub Actions連携）

## クイックスタート

```bash
pnpm install
pnpm dev
# テスト
pnpm test
# Lint/型
pnpm lint && pnpm type-check
```

- 環境変数と運用方針: `docs/environment-setup.md`
- 分析/ダッシュボード要件: `docs/analytics.md`
  - Live Metrics (dev): `GET /api/analytics/live-metrics`（Vercel関数）
  - Live Metrics (dev server): `GET /api/analytics/live-metrics`、SSE: `GET /api/analytics/events`

### ビルド安定化（Reactランタイム一意性ガード）

- ローカル検証向けにビルド時のReact重複検出（警告）のプラグインを用意しています。
- 本番（Vercel）ではデフォルト無効です。必要に応じて以下で有効化してください。

```bash
# 有効化してビルド
VITE_ENABLE_REACT_GUARD=true pnpm run build
```

Vercel 環境では `VITE_ENABLE_REACT_GUARD` を未設定のまま運用してください（警告がデプロイログに出てもブロックはしません）。

### 最小 `.env.local` 例（または `.env`）

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your-gemini-key-optional
VITE_OPENAI_API_KEY=your-openai-key-optional
VITE_ANTHROPIC_API_KEY=your-anthropic-key
VITE_ENABLE_ANALYTICS=false
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX # 任意（本番のみ推奨）
```

- Vercel では Project Settings → Environment Variables に `VITE_*` を追加してください。
- GAはID未設定でも動作します（フォールバック: ローカル送信/コンソールログ）。

## ディレクトリ

```
src/
  components/
  pages/
  services/
    ai/
  store/
  types/
  utils/
  constants/
public/
api/  # Vercel functions
```

## 重要ファイル

- `src/components/hero/Hero.tsx` ヒーロー（AIモーダル起動/CTA計測）
- `src/components/ai/AIPriorityTaskModal.tsx` 最重要タスク提案
- `src/services/ai/AdvancedAIService.ts` AIプロバイダ集約/厳密型
- `src/services/ai/BlogTaskExtractionService.ts` ブログ本文→タスク抽出
- `src/services/ai/promptTemplates.ts` プロンプト定義
- `src/lib/track.ts` 計測ユーティリティ
- `src/utils/env.ts` 環境変数ヘルパ（Jest互換）
- `src/store/todoSlice.ts` タスク追加（`addMany`）

## テスト

- Jest + Testing Library
- 代表: `Hero` スナップショット / `useAIAction` 状態遷移 / `ErrorBoundary` 分岐 / `BlogTaskExtractionService` パース / `EnhancedBlogPostForm` スモーク

````bash
pnpm test
### E2E

```bash
pnpm build && pnpm preview
pnpm test:e2e
````

### 新規追加の分析イベント

- PageView: `/ai-assistant`, `/assessments`, `/learning`, `/iq-test`, `/mbti-test`
- Assessment: `assessment_saved`（IQ/MBTI保存成功）, `assessment_save_failed`
- AI: `ai_assistant_reply`（ok: true/false）
- Learning: `learning_progress_saved`

### AI API 利用

- バックエンドのAnthropicプロキシ: `api/ai/anthropic.ts`
- フロントからの呼び出し: `src/services/api/aiAssistantApi.ts`

### 起動手順（開発）

```bash
pnpm install
pnpm dev
# 別ターミナル: （必要に応じて）APIモック/バックエンド
```

### 環境変数（AI/計測関連）

- `VITE_ANTHROPIC_API_KEY`: Anthropic Claude キー（推奨）
- `VITE_GEMINI_API_KEY`: Google Gemini キー（任意）
- `VITE_OPENAI_API_KEY`: OpenAI キー（任意）
- `VITE_API_BASE_URL`: API ベースURL（例: `http://localhost:3001/api`）
- `VITE_ENABLE_ANALYTICS`: `true` で分析有効（デフォルトは開発でコンソール出力）
- `VITE_GA_MEASUREMENT_ID`: Google Analytics メジャメントID（本番推奨）

### Admin メトリクス（プレビュー）

- `/admin` ダッシュボードにて、以下のメトリクスを表示:
  - リアルタイム接続/イベント（Live Analytics）
  - IQ/MBTI 保存件数、過去30日の累計
  - タスク完了率・習慣スコア等（一部ダミー/プレビュー値を含む）

## 導入ガイド（3ステップ）

1. 自己診断を実施（約5〜10分）
   - `/assessments` から IQ/MBTI を開始
   - 完了後に結果を保存（プロフィール `traits` に反映）
2. AI秘書に相談
   - `/ai-assistant` で生活/学習/仕事の相談を入力
   - 特性（IQ/MBTI）を踏まえた助言が返答
3. 学習を開始
   - `/learning` でコースを選択
   - 進捗を保存しながら日次で学習

```

## アクセシビリティ / 国際化

- 主要ボタンに `aria-label`、フォーカスリング/スキップリンク
- i18n 準備: `src/locales/en.json`

## 分析/計測

主なイベント（詳細は `docs/analytics.md`）

- `page_view_home`, `cta_click`, `ai_suggest_click`, `ai_success`
- 抽出系: `ai_extract_tasks_click`, `ai_extract_tasks_success`, `ai_extract_tasks_error`

## CI/CD（プレビュー）

- `.github/workflows/preview.yml` → Vercel へプレビュー/本番デプロイ
- GitHub Secrets に `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` を設定（Vercel ダッシュボードの Team/Project から取得）

### リリースバージョニング / 更新履歴 / X自動投稿

- バージョンは `package.json` の `version`（初期値 0.0.1）を基準に、自動生成スクリプトで `public/version.json` を生成します。
- 更新履歴は日本語で `CHANGELOG.md` に記載し、ビルド時に `public/changelog.json` に反映します。
- `release-please` により `main` へのマージでリリースPR/タグを自動管理できます（`.github/workflows/release-please.yml`）。
- GitHub Release 公開時に `post-to-x-on-release` が起動し、最新の更新履歴を日本語で X にポストします（`.github/workflows/post-to-x.yml`）。
- 必要な Secrets: `X_APP_KEY`, `X_APP_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`。

## セキュリティ/プライバシー

- 送信データは最小限。APIキーは端末に保存（送信しない）
- 運用ポリシー: `docs/environment-setup.md`

---

## 5分タスク分解（実装/改善の最小単位）

### Landing/コピー

- `src/constants/copy.ts` の文言微修正（句読点/語尾統一）（5）
- `Hero` のCTA `aria-label` 内容を英語キーと整合（5）
- `HeroBackgroundImage.tsx` の `alt` と `sizes` 最適化（5）

### AI 提案モーダル

- 成功/失敗のトースト文言を `copy.ts` に集中（5）
- レート制限(429)/未認証(401)/ネットワーク系の分岐表示確認（5）
- 動的 import のプリフェッチ（hover）を `Suspense` 専用境界で確認（5）

### ブログ×タスク抽出（MVP）

- `blogTask.ts` 型の `priority` 範囲と `ISODateString` を README に明記（5）
- `buildTaskExtractionPrompt` に due/priority の根拠要求コメント追記（5）
- `BlogTaskExtractionService` の重複タイトル正規化を関数化（5）
- `EnhancedBlogPostForm` に抽出結果の合計件数バッジ追加（5）
- 抽出ボタンクリック前に contentLength をメタで送信（5）

### 計測/分析

- `trackAIExtractTasks*` にメタ `{ contentLength|count|reason }` 付与確認（5）
- Home 初回マウントで `trackPageViewHome()` 一度だけ発火を確認（5）

### アクセシビリティ/国際化

- Benefits アイコンに `aria-hidden` 再確認（5）
- SkipLinks のタブ順/フォーカス移動を e2e で目視確認（5）
- `en.json` に hero/aiModal/benefits の不足キー追加（5）

### テスト

- `useAIAction` のエラー→リトライの状態遷移テスト追加（5）
- `Coordinator.test.ts` のモック型整合（strict）を再確認（5）
- `Benefits.a11y.test.tsx` にコントラストクラスの断言強化（5）

### パフォーマンス

- 大きなブログ本文は先頭 N 文字サンプリングのオプションをUIに追加（5）
- 画像: hero 背景を WebP 優先 + lazy を確認（5）

### CI/CD/運用

- プレビューコメントのリンクテキスト統一（Preview / Production）（5）
- `.env.example` の説明に Vercel スコープ注記を追加（5）

### ドキュメント

- `docs/analytics.md` 抽出系イベントの項を最新化（5）
- 本 `README.md` に主要導線（環境/分析/キー方針）を維持（5）

---

開発の詳細・最新の変更は GitHub リポジトリを参照。
```
