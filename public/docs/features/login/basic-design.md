ログイン 基本設計書
=================

最終更新: 2025-08-29

1. 概要
------
ログイン画面（`/login`）において、ユーザーがメールアドレスとパスワードで認証し、アクセストークン/リフレッシュトークンを取得・保持し、保護された機能にアクセスできるようにする。

2. 画面仕様
-----------
- ルート: `/login`
- 入力: `email`, `password`
- 操作: 「ログイン」ボタン（送信中はローディング状態/二重送信防止）
- 表示: 失敗時のエラーメッセージ領域、成功時はリダイレクト（`post_login_redirect` があれば優先）
- アクセシビリティ: ラベル関連付け、エラーの aria-live、キーボード操作可能

3. コンポーネント構成
--------------------
- ページ: `src/pages/Login.tsx`
  - フォーム状態/バリデーション
  - 送信ハンドラ: 認証 API 呼び出し → 成功時にトークン保存 → ユーザー情報反映 → 遷移
- 認証文脈: `src/context/AuthContext.tsx`
  - `login(email, password)` / `logout()` / `refresh()`
  - グローバルなユーザー状態とトークン状態の管理
- API ユーティリティ: `src/services/api/apiConfig.ts` / `src/services/api/fetchWithAuth.ts`
  - 認証系は未ログイン時例外（401）をハンドリング

4. 状態とバリデーション
----------------------
- 状態: `email`, `password`, `isSubmitting`, `errorMessage`
- バリデーション: email 形式必須、password 必須（長さチェックはサーバ側で実施）

5. フロー/遷移
-------------
1) 入力 → 送信
2) POST `/api/auth/login`（メール/パスワード）
3) 成功: `accessToken`, `refreshToken`, `user` を受領
4) トークン保存（`localStorage` 等）→ 認証ヘッダ付与
5) `useAuth` にユーザーを反映 → 直前の遷移元 or `/` へリダイレクト
6) 失敗: メッセージ表示（資格情報不正/ロック/一時的障害）

6. エラーハンドリング/UX
-----------------------
- ネットワーク障害: 再試行ボタン/文言表示
- 401（資格情報不正）: 汎用メッセージ（具体的理由は表示しない）
- 429（過剰試行）: 一時的ロックと再試行待ち時間表示

7. セキュリティ
--------------
- HTTPS 前提、パスワードはログ/エラーに出さない
- XSS/CSRF 対策（Stateful Cookie 運用時は SameSite/HttpOnly、現状は Bearer 運用）
- トークン保存は最小権限・短命 Access と長命 Refresh の組合せ

8. ガード/アクセス制御
--------------------
- `FeatureAccessGuard` により未完成機能はブロック（`/login` は許可ルート）
- 管理者のみのメニューは `user.isAdmin` で出し分け

9. 計測/監査
-----------
- ログイン試行（成功/失敗）を計測（開発は console、運用はサーバ側集計）

10. 依存関係
-----------
- `src/pages/Login.tsx`, `src/context/AuthContext.tsx`, `src/services/api/apiConfig.ts`, `src/services/api/fetchWithAuth.ts`

11. 完了条件（基本設計）
--------------------
- 画面項目/状態/遷移/エラー/セキュリティ/アクセス制御が設計され、レビュー承認済み

