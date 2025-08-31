サブスクリプション 総合試験仕様書
=================

最終更新: 2025-08-31

目的
----
本番相当の利用シナリオで、サブスクリプション機能（/subscription, /subscription-upgrade）が要件定義/設計/結合試験仕様に沿って安全・確実・快適に動作することを確認する。

対象
----
- 画面: /subscription（SubscriptionPage）, /subscription-upgrade（SubscriptionUpgradePage）
- API（開発時はモック）: /api/subscription/*, /api/userSubscription/*
- 補助: 認証（AuthProvider/TokenManager）, トースト, アナリティクス

環境/前提
--------
- Vite + 開発モックサーバー（server-simple.ts）
- 認証トークン有効（実運用はHTTPS/セキュアCookie/ヘッダ運用）
- ブラウザ: 最新Chrome, Firefox, Safari（いずれもデスクトップ/モバイル表示）

試験観点（システム）
------------------
S1. 認証制御
- 認証済ユーザーは /subscription にアクセスでき、未認証はガードされる（Upgradeは未認証でログイン誘導）。

S2. ステータス表示（加入/未加入）
- 未加入: 「未加入」を表示。
- 加入済: status/renewAt/card（末尾4桁/ブランド）が表示。

S3. チェックアウト遷移
- 任意の有料プランで「チェックアウトで申し込む」→ POST /api/subscription/checkout → sessionUrl へ遷移。
- ゲートウェイエラー相当時はトーストで案内し再試行ガイド。

S4. success戻り反映
- /subscription?success=1 で表示→ 成功トースト表示 + GET /api/subscription/status 再取得 + URL置換（?success=1除去）。

S5. ポータル遷移
- 「支払い情報を管理（ポータル）」→ POST /api/subscription/portal → 返却urlへ遷移。

S6. 解約（次回以降）
- 「解約（次回以降）」→ POST /api/subscription/cancel {atPeriodEnd:true} → status再取得→ ヘッダに解約予定が反映。

S7. Upgradeページ（現在の購読表示/更新）
- GET /api/userSubscription/user/:userId で現行購読取得→ planIdを選択状態で表示。
- ダウングレード（free）で PUT /api/userSubscription/:id 反映。
- プレミアム申込は支払い情報入力後、POST（初回）/PUT（更新）で反映→ 取得し直し。

S8. 回帰（管理ページとの共存）
- /subscription-management 側の一覧/作成/更新/削除/集計（general subscription API）と干渉しない。

S9. 非機能（性能/可用性/アクセシビリティ/セキュリティ）
- 性能: 初期表示<1.5s（本番相当, p95目標）、主要アクション応答<3s（p95）。
- 可用性: 決済ゲートウェイ不調時は読み取り中心の案内（画面はクラッシュしない）。
- アクセシビリティ: ダイアログはフォーカストラップ、重要メッセージは aria-live、バッジは色+テキスト、キーボード操作完備。
- セキュリティ: PII/トークンをログ出力しない、外部遷移URLはサーバ返却を使用、XSS/CSRFの基本対策を満たす。

S10. 計測/監査
- アナリティクスイベント: subscription_view / subscription_checkout / subscription_portal / subscription_cancel。
- 監査: 成功/失敗、planId、状態変化、タイムスタンプ、ユーザーIDが追跡可能。

エラーパス
------
- /api/subscription/status 503: ユーザー向けガイダンス表示（再試行/後で試す）。
- /api/subscription/checkout 402: 決済拒否→トーストで理由を示し再試行/カード更新を案内。
- /api/userSubscription/* 404: 初回作成フローで案内（free→有料の導線あり）。

受入基準（合否）
------------
- 上記S1〜S10を通し、UIがクラッシュせず、期待どおりの遷移/表示/再取得/計測が成立する。
- 非機能要件の目標を満たし、失敗時もユーザーが次の行動を取れる案内がある。


