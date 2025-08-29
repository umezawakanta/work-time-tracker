ログイン 詳細設計書
=================

最終更新: 2025-08-29

1. API I/F
---------
- POST `/api/auth/login`
  - req: `{ email: string, password: string }`
  - res: `{ accessToken: string, refreshToken: string, user: { id: string, email: string, displayName?: string, isAdmin?: boolean } }`
- GET `/api/auth/check` → 認証状態確認
- POST `/api/auth/refresh` → トークン再発行
- POST `/api/auth/logout` → サーバ側セッション/Refresh 無効化

2. フロント実装詳細
------------------
- `src/pages/Login.tsx`
  - フォーム: controlled inputs（email/password）
  - 送信: `await auth.login(email, password)`
  - エラー: `setErrorMessage(message)`、`aria-live="assertive"`
  - ローディング: `isSubmitting` でボタン/入力制御
- `src/context/AuthContext.tsx`
  - `login`: fetch → token 保存 → user state set → resolve
  - `logout`: token 破棄 → user null → `/login` へ
  - `refresh`: 期限前/401 時に実施
- `src/services/api/fetchWithAuth.ts`
  - リトライ方針: 401 のみ refresh 一度試行→失敗時は logout
  - 認証不要パス: `/api/auth/login`, `/api/auth/refresh`, `/api/notifications/*`, `/api/health*`

3. トークン保存
-------------
- `localStorage` キー: `access_token`, `refresh_token`
- 有効期限管理はサーバ応答の `exp` かクライアント側余裕時間で更新

4. ルーティング
-------------
- 成功後: `post_login_redirect`（`sessionStorage`）→ `/` フォールバック
- FeatureAccessGuard が保護

5. ユースケース別エラーメッセージ
------------------------------
- `invalid_credentials`: 「メールアドレスまたはパスワードが正しくありません」
- `account_locked`: 「一時的にロックされています。しばらくしてからお試しください」
- `server_unavailable`: 「サーバーに接続できませんでした。時間をおいて再試行してください」

6. テスト観点
-----------
- 単体: フォームバリデーション、状態遷移、API 成否分岐
- 結合: ログイン成功→保護ページ遷移、401→refresh→再試行、refresh 失敗→ログアウト誘導
- 総合: 実 API/本番同等環境での動作確認

7. 完了条件（詳細設計）
--------------------
- API 契約/保存/エラーハンドリング/遷移/テスト観点が定義され、レビュー承認済み

