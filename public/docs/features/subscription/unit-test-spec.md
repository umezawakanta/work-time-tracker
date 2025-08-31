# サブスクリプション 単体試験仕様書

最終更新: 2025-08-31

## 目的
サブスクリプション機能（/subscription, /subscription-upgrade）のユニットレベルの振る舞いを検証し、UI/状態遷移/API呼び出しの分岐が正しく動作することを確認する。

## スコープ
- 画面: `src/pages/SubscriptionPage.tsx`, `src/pages/subscription/SubscriptionUpgradePage.tsx`
- APIクライアント: `src/services/api/subscriptionGatewayApi.ts`

## 前提/モック
- `jest.mock` により API をスタブ（成功/失敗/空データ）
- ルーター/トースト/認証はモック化して副作用を抑制

## 試験項目

### 1. ステータス取得
- 初期表示時に `getSubscriptionStatus` を1回呼ぶこと
- 取得結果が null の場合、「未加入」と表示されること
- 取得結果に `status/renewAt/card` がある場合、ヘッダに反映されること

### 2. チェックアウト
- 有料プランの「チェックアウトで申し込む」クリックで `startCheckout({planId})` を呼ぶこと
- 返却 `sessionUrl` に `window.location.href` で遷移すること
- 失敗時はトーストエラーを表示すること

### 3. ポータル
- 「支払い情報を管理（ポータル）」クリックで `openPortal()` を呼ぶこと
- 返却 `url` に遷移すること／失敗時にトースト表示

### 4. 解約（次回以降）
- 「解約（次回以降）」クリックで `cancelSubscriptionGateway({atPeriodEnd:true})` を呼ぶこと
- 成功後にステータス再取得を行うこと

### 5. success パラメータ
- `/subscription?success=1` で表示時、トースト表示とステータス再取得が行われ、URLが置換されること（`replace: true`）

### 6. Upgrade ページ（ユーザー購読）
- ログイン時に `getUserSubscription(user.id)` を呼び、 `planId` を選択状態にすること
- ダウングレード（free選択）で `updateUserSubscription` が呼ばれること
- プレミアム選択で支払いダイアログが開き、入力後 `createUserSubscription` もしくは `updateUserSubscription` が呼ばれること

## エッジケース
- API 429/503 などの一時失敗でトースト/再試行ガイドを表示
- `card` 欄が欠落/不正な場合でもUIがクラッシュしないこと

## カバレッジ目標
- 主要分岐（成功/失敗/空データ）を網羅、分岐網羅 80%以上


