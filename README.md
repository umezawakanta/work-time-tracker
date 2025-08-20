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

### 最小 `.env.local` 例

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=
VITE_OPENAI_API_KEY=
VITE_ANTHROPIC_API_KEY=
VITE_ENABLE_ANALYTICS=false
```

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

```bash
pnpm test
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
