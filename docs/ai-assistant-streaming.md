# AI Assistant - Streaming 対応メモ（下書き）

- 現状: フロントは /api/ai/anthropic の通常レスポンスを受信して全文表示。
- 目標: サーバ側でAnthropicのストリーミングを受け取り、SSEか分割チャンクでフロントへ転送。

## サーバ（方針）

- ルート: `api/ai/anthropic.ts` に `?stream=1` 時 `text/event-stream` を返す分岐
- Anthropic API: `messages.stream` を利用し、トークン毎に `data: {text}` を送出
- CORS/認証: 既存 `cors()` と `withAuth`（必要時）を維持

## フロント（方針）

- `ask()` に `stream?: boolean` を追加し、`fetch` + 読み取りループで逐次追記
- UI: ローディング中プレースホルダ/停止ボタン（`AbortController.abort()`）
- 計測: `ai_assistant_reply` に `stream:true` を付与、完了時のみ ok=true

## エラー/リトライ

- タイムアウト/中断は `TIMEOUT` に統一
- 429 は指数バックオフ（1.5〜2.0）で最大N回

（実装は後続フェーズ）
