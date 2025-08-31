サブスクリプション 詳細設計書
=================

最終更新: 2025-08-31

API I/F（入出力/エラー）
---------------------
- GET `/api/subscription/status`
  - res: `{ plan: string|null, status: 'active'|'trialing'|'past_due'|'canceled'|'incomplete'|null, renewAt?: string|null, card?: { last4: string, brand: string }|null }`
  - err: 401 未認証, 503 ゲートウェイ不可
- POST `/api/subscription/checkout`
  - req: `{ planId: string }`
  - res: `{ sessionUrl: string }`
  - err: 400 入力不備, 402 決済拒否, 409 重複申込, 503 ゲートウェイ不可
- POST `/api/subscription/portal`
  - req: `{}`
  - res: `{ url: string }`
  - err: 401/503
- POST `/api/subscription/cancel`
  - req: `{ atPeriodEnd?: boolean }`
  - res: `{ success: true }`
  - err: 400/401/409/503

トークン保存/更新シーケンス
------------------------
- ユーザー認証は既存のTokenManagerに委譲。購読ステータスは`/status`で随時取得し、Webhook確定後に最新を反映。
- フロントは「申込→Checkout遷移→戻り」で`status`再取得。確定前は一時的に`pending`表示（UIのみ）。

ルーティング/遷移条件
------------------
- 申込/ポータルは外部URLへ遷移。戻りは`/subscription?success=1`等で処理分岐。
- `success`があればトースト＋再取得。

状態管理/テスト観点
-----------------
- 単体: 金額表示、年額換算、ボタン活性、ローディング制御、エラーハンドリング
- 結合: `/status`の反映、checkout/portal遷移、cancel APIの分岐
- 総合: 疎通（成功/失敗/再試行）、Webhook遅延時の更新

セキュリティ詳細
--------------
- PII/カード情報の保持禁止（last4/brandのみ）、ログ等はマスク
- CSRF/XSS対策、SameSite/CORS、外部リダイレクト前後の安全確認

ログ/監査・計測
--------------
- 計測: `subscription_view/checkout/portal/cancel`
- 監査: API成功/失敗、plan変更履歴、タイムスタンプ、ユーザーID

依存関係
------
- 決済ゲートウェイAPI/Portal、Webhook受信エンドポイント
- 既存の認証・トースト・バッジ・ルーティング

完了条件（詳細設計）
------------------
- API契約/保存/遷移/エラー/テスト観点が現行実装に即して定義され、レビュー承認済み

