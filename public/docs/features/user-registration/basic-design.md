ユーザー登録 基本設計書
=================

最終更新: 2025-08-30

概要
----
`/register` で氏名・メール・パスワード・規約同意・招待コード（任意）を入力してアカウントを作成する。成功時はトークンが返る場合は即ログイン、無い場合は `/login` に誘導する。

画面仕様
------
- ルート: `/register`
- 入力: name, email, password, confirmPassword, referralCode(任意), acceptTerms(必須)
- 操作: 「アカウントを作成」ボタン（送信中ローディング）
- 表示: バリデーションとAPIエラーの表示領域、成功時トースト
- アクセシビリティ: ラベル/説明、エラー `aria-live`、キーボード操作

コンポーネント構成
--------------
- ページ: `src/pages/Register.tsx`
  - フォーム状態・バリデーション・送信
- 認証: `src/services/auth/TokenManager.ts`（トークン保存・期限管理）
- API: `POST /api/auth/register`

状態/バリデーション
---------------
- 状態: name, email, password, confirmPassword, acceptTerms, referralCode, isSubmitting, errors
- バリデーション: name>=2, email形式, password>=8（強度計算）、confirm一致、acceptTerms必須

フロー/遷移
--------
入力→送信→`/api/auth/register`
- 成功: `token` あり→ `TokenManager.setTokens`→ `/`
- 成功: `token` なし→ `/login`（stateで完了メッセージ/メールを引き継ぎ）
- 失敗: エラーメッセージ表示（409重複、400不備、503サービス不可など）

エラーハンドリング/UX
------------------
- ネットワーク障害: 汎用メッセージ
- 409: メール重複メッセージを該当フィールドに表示
- 400/503: トースト+フォーム上部アラート

セキュリティ
---------
- HTTPS前提、パスワードはログ/エラーに出さない
- XSS対策、CSRFは認証前のため最小だが同一オリジンポリシー遵守

ガード/アクセス制御
----------------
- 機能一覧の可視性に従う。未完成時はメニュー非表示。管理者は機能一覧からアクセス可能。

計測
---
- `useAnalytics` で `register_success` 等を記録

依存関係
-----
`src/pages/Register.tsx`, `api/auth/register.ts`, `src/services/auth/TokenManager.ts`

完了条件（基本設計）
----------------
- 画面/状態/遷移/エラー/セキュリティ/アクセス制御が設計され、レビュー承認済み


