サブスクリプション 結合試験仕様書
=================

最終更新: 2025-08-31

目的
----
サブスクリプションの画面・API連携（モック）・状態遷移を結合レベルで検証し、ユーザー操作に対する一連のフローが成立することを確認する。

対象
----
- 画面: /subscription（SubscriptionPage）、/subscription-upgrade（SubscriptionUpgradePage）
- バックエンド（開発モック）: /api/subscription/*, /api/userSubscription/*

前提
----
- Vite開発サーバー + モックAPI（server-simple.ts）
- 認証トークンは有効状態（AuthProviderモック/ローカルTokenManager）

シナリオ
------
S1: ステータス表示とヘッダの反映
1. /subscription にアクセス
2. GET /api/subscription/status が呼ばれる
3. 未加入なら「未加入」を表示、加入済みなら status/renewAt/card を表示
期待: ヘッダのステータス/次回請求日/カードが正しく描画

S2: プラン選択→Checkout遷移
1. 「チェックアウトで申し込む」をクリック
2. POST /api/subscription/checkout → sessionUrl
3. sessionUrl へ遷移
期待: 正しいURLへ遷移・ネットワークエラー時はトースト表示

S3: success戻りによる状態更新
1. /subscription?success=1 でアクセス
2. トースト表示、GET /api/subscription/status 再取得
3. URL から ?success=1 が取り除かれる
期待: 成功トースト、最新状態反映、URLクリーンアップ

S4: ポータル遷移
1. 「支払い情報を管理（ポータル）」クリック
2. POST /api/subscription/portal → url
3. url へ遷移
期待: 正しい管理URLへ遷移

S5: 解約（次回以降）
1. 「解約（次回以降）」クリック
2. POST /api/subscription/cancel {atPeriodEnd:true}
3. GET /api/subscription/status 再取得
期待: UIに解約予定が反映

S6: Upgradeページ - 現在の購読取得
1. /subscription-upgradeへアクセス
2. GET /api/userSubscription/user/:userId で現在の購読を取得
3. planId を選択状態に反映
期待: 現行プランが選択状態

S7: Upgradeページ - ダウングレード
1. free を選択→更新
2. PUT /api/userSubscription/:id で更新
期待: ステータスが active で free に更新

S8: Upgradeページ - プレミアム申し込み
1. プレミアムプラン選択→支払い入力→登録
2. 既存なし: POST /api/userSubscription
3. 既存あり: PUT /api/userSubscription/:id
期待: 登録/更新後、GET /api/userSubscription/user/:userId 再取得で反映

エラーパス
------
- /subscription/status 503 → ユーザー向けガイダンス表示
- /subscription/checkout 402 → トーストで失敗を明示
- /userSubscription/* 404 → 初回作成フローへ誘導

成功判定
------
上記シナリオでUIがクラッシュせず、期待どおりの遷移/表示/再取得が行われること


