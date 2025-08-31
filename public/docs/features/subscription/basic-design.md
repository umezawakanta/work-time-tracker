サブスクリプション 基本設計書
=================

最終更新: 2025-08-31

概要
----
`/subscription` にて、ユーザーがプランの申込/解約/更新/再開、支払い方法の登録・更新、請求履歴の参照を行える画面を提供する。決済処理はゲートウェイ（Checkout/Customer Portal）へ安全に委譲し、当アプリは購読状態の表示と操作のハブを担う。

画面/情報設計
------------
- ルート: `/subscription`
- レイアウト:
  - ヘッダ: 現在のプラン・次回請求日・ステータスバッジ
  - 本体: プランカード（Free/Pro…）、アクション群（申込/解約/再開/支払方法更新/ポータルへ）
  - サイド: 支払方法（カード末尾4桁/ブランド）・請求履歴リンク
- 状態表示:
  - active / trialing / past_due / canceled / incomplete をステータスバッジで表示
  - 次回請求日（renewAt）・自動更新有無、解約予定（at_period_end）

コンポーネント構成と責務
--------------------
- `SubscriptionPage`（ページ）: 画面骨格/データ取得/全体の状態管理
- `PlanList`（子）: プラン一覧・選択・申込/切り替えボタン
- `PaymentMethodCard`（子）: 現在の支払方法表示/更新アクション
- `SubscriptionStatus`（子）: ステータス/次回請求/解約予定表示
- `HistoryLinks`（子）: 請求履歴・領収書リンク

状態/バリデーション
-----------------
- ページ状態: `{ loading: boolean, error?: string, plan?: string, status?: string, renewAt?: string, card?: { last4: string, brand: string } }`
- 入力: プランID（申込/切替）、解約時の atPeriodEnd（boolean）
- バリデーション: プランID必須、重複申込防止（UIボタンの二重押下抑止/サーバ冪等）

API 呼び出し/例外・再試行
----------------------
- 初期表示: `GET /api/subscription/status`
- 申込/切替: `POST /api/subscription/checkout` → `sessionUrl` リダイレクト
- ポータル: `POST /api/subscription/portal` → `url` リダイレクト
- 解約: `POST /api/subscription/cancel { atPeriodEnd? }`
- 例外: 400 入力不備、402 決済拒否、409 重複申込、503 ゲートウェイ不可、500 その他
- 再試行: トースト案内＋ポータル誘導。必要に応じて指数バックオフ（最大3回）

UX（ローディング/成功/失敗）
---------------------------
- ローディング: スケルトン/ボタンスピナー、主要操作はdisabled
- 成功: トースト（申込完了/更新/キャンセル完了）、ヘッダのステータス/バッジ即時更新
- 失敗: トースト＋詳細メッセージ（402は「カードを更新してください」等）

ルーティング/遷移
----------------
- 申込/ポータルは外部URLへ遷移。戻り後は `/subscription` 再読込で最新状態を取得
- 成功時のフラグ（`?success=1` 等）があれば祝杯トーストを表示

アクセシビリティ
-----------------
- ラベル関連付け、重要メッセージは `aria-live` で告知、各操作はキーボードで到達可能
- ステータスバッジは色＋テキスト、アイコンには `aria-label`

セキュリティ
------------
- HTTPS必須、トークン/PIIはログ出力禁止。カード情報は保持せず last4/brandのみ
- CSRF/XSS: JSON API＋SameSite、入力サニタイズ/エスケープ
- Webhook起点の状態確定を前提にフロントは表示のみ変更（最終確定はサーバ）

計測/監査
--------
- `subscription_view`/`subscription_checkout`/`subscription_portal`/`subscription_cancel`
- 監査ログ: 成功/失敗（reason, planId, status変化）

依存関係
------
- 決済ゲートウェイSDK/Portal、API `/api/subscription/*`
- 状態キャッシュ（stale-while-revalidate）

完了条件（基本設計）
------------------
- 画面/状態/遷移/エラー/セキュリティ/アクセシビリティ/計測が設計され、レビュー承認済み

