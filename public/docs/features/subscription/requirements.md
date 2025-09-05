# サブスクリプション 機能 要件定義書

最終更新: 2025-09-05
対象: Work Time Tracker（React + TypeScript + Vite / Vercel）

---

## 1. 目的
- 有料機能の安定提供と継続課金の管理（Stripeサブスクリプション）。
- ユーザーが自助で購入/変更/解約/支払い方法管理できる体験の実現。
- 管理者はユーザー購読状況を可視化しサポートできる。

## 2. スコープ
- In: 状態表示、購入開始、顧客ポータル、解約、管理画面連携、監視、セキュリティ。
- Out: 複数通貨/税制、請求書PDF自前生成、複数ゲートウェイ（将来対応）。

## 3. ロール/権限
- 一般ユーザー: 自分の購読状態の閲覧/購入/解約/ポータル遷移。
- 管理者: 全ユーザーの購読状態参照、必要時支援（ポータルURL発行等）。
- システム: Webhook検証、ログ・監視。

## 4. ユースケース
1) 状態表示: プラン/ステータス/次回更新/カード末尾/解約予約を確認。
2) 購入開始: プラン選択→チェックアウトセッション作成→Stripeホストへ。
3) 顧客ポータル: 支払い方法/請求管理/プラン変更を自己解決。
4) 解約: 次回更新時キャンセル（推奨）。
5) 管理画面: Usersタブで購読状態の閲覧、ポータルURL発行、再取得。

## 5. 画面要件（最小）
- サブスクリプション画面
  - 表示: plan, status, renewAt, card(last4/brand), atPeriodEnd, メッセージ。
  - 操作: 購入/変更, ポータル, 解約。多重送信防止/ローディング表示。
  - アクセシビリティ: キーボード操作、コントラスト、SR対応。
  - レスポンシブ最適化。
- 管理画面（Usersタブ）
  - 列/詳細: plan, status, renewAt, atPeriodEnd。
  - 操作: ポータルURL発行、ステータス再取得（権限: 管理者）。

## 6. API 仕様（v1）
- 認証: ユーザー識別から `customerId` 解決（v1は環境変数フォールバック、v2でDB紐付け）。
- CORS: `GET/POST/OPTIONS` のみ、`Access-Control-Allow-Origin` 適切設定。
- タイムアウト: 10s 以内。Stripe失敗時はフォールバック。

1) GET `/api/subscription/status`
- 入力: なし。
- 出力: `{ plan: string|null, status: 'active'|'trialing'|'past_due'|null, renewAt: string|null, card: { last4: string, brand: string }|null, atPeriodEnd: boolean }`
- Stripe未設定/失敗時は中立値（null/false）。

2) POST `/api/subscription/checkout`
- 入力: `{ planId: string }`（価格ID）。
- 出力: `{ sessionUrl: string }`（Stripe Checkout URL）。
- 未設定時はアプリ内成功URLへフォールバック。

3) POST `/api/subscription/portal`
- 入力: なし。
- 出力: `{ url: string }`（Stripe Customer Portal URL）。
- 未設定時はアプリ内ポータル風URLへフォールバック。

4) POST `/api/subscription/cancel`
- 入力: `{ atPeriodEnd?: boolean }`（省略時 `true`）。
- 出力: `{ success: boolean }`。

## 7. データモデル（最小）
- ユーザー ←→ Stripe `customer_id` 対応（v1: 固定/環境変数、v2: コレクション化）。
- カード番号は保存しない。購読状態キャッシュは必要最小・期限付き。

## 8. Stripe 連携
- 必須: `STRIPE_SECRET_KEY`, `STRIPE_DEFAULT_PRICE_ID`。
- 将来: Webhook（`STRIPE_WEBHOOK_SECRET`）で状態反映（作成/更新/解約/失敗）。
- APIバージョン: `2024-06-20`。

## 9. セキュリティ
- サーバサイドで顧客ID解決/権限チェック。
- Webhook署名検証（導入時）。
- 詳細カード情報のログ禁止、PII最小化。
- レート制限（購入/ポータル濫用抑止）。

## 10. エラーハンドリング/フォールバック
- Stripe失敗: `status` は中立値、`checkout/portal` はフォールバックURL。
- UIは再試行とサポート案内を表示。重要イベントはサーバログ。

## 11. ロギング/監視
- ログ: requestId/エラーコード/メッセージ、Mongo接続状況。
- 監視: 成功率/失敗率/応答時間。`/api/db/status` と統合。

## 12. 環境変数
- `STRIPE_SECRET_KEY`, `STRIPE_DEFAULT_PRICE_ID`, `STRIPE_CUSTOMER_ID`（暫定）, `VITE_APP_URL`。

## 13. 管理画面連携
- Usersタブ: plan/status/renewAt/atPeriodEnd を表示。
- アクション: ポータルURL発行/状態再取得（管理者のみ）。
- フィーチャーゲート: 未完成機能は非表示。

## 14. 非機能要件
- 可用性 99.9%（API）、Stripe障害時はUX維持。
- 性能 p95: 状態<1000ms, 準備<2000ms。
- セキュリティ: OWASP ASVS/Top10準拠。
- アクセシビリティ: WCAG 2.1 AA。

## 15. テスト観点
- 正常: 状態表示/購入開始/ポータル/解約。
- 異常: Stripe失敗、CORS、認可エラー。
- 負荷: 低〜中負荷での応答性。

## 16. 受け入れ基準（Complete定義）
- 本番デプロイ済み、モック/ダミーなし（v2で完全Stripe連携）。
- システムテスト合格。
- 管理画面で購読状態確認可能。
- 未完成機能はダッシュボードに表示しない。

## 17. リリース/運用
- targetRelease を設定・管理（開発状況共有に反映）。
- 段階移行: v1（最小/フォールバック）→ v2（Webhook/完全連携）。
- ロールバック手順と監視アラート。

## 18. リスク/制約
- 地域/税制差、Stripe依存、ネットワーク障害。

---

このドキュメントは以下から参照されます: `/docs/features/subscription/requirements`。


