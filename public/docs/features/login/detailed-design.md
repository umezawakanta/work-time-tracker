ログイン 詳細設計書
=================

最終更新: 2025-08-30

1. API I/F
---------
- POST `/api/auth/login`
  - req: `{ email: string, password: string, rememberMe?: boolean }`
  - res（現状実装）: `{ token: string, user: { id: string, email: string, displayName?: string, role?: string, isAdmin?: boolean } }`
  - 互換（将来/一部環境）: `{ accessToken: string, refreshToken: string, user: {...}, expiresIn?: number, refreshExpiresIn?: number }`
- GET `/api/auth/check` → 認証状態確認（`{ isAuthenticated: boolean, user?: {...} }`）
- POST `/api/auth/refresh` → トークン再発行（本番/プレビュー環境のみ有効。ローカル開発では無効）
- POST `/api/auth/logout` → ログ上の記録のみ（現状はクライアント側トークン削除で対応）

2. フロント実装詳細
------------------
- `src/pages/Login.tsx`
  - フォーム: controlled inputs（email/password）
  - 送信: `await login(email, password, rememberMe)`（`src/services/api/authApi.ts`）
  - レスポンス処理:
    - `accessToken/refreshToken` 形式の場合: `TokenManager.setTokens(...)` で保存
    - 単一 `token` の場合: 暫定的に access/refresh の両方として保存（互換運用）
  - エラー表示: `aria-live="assertive"`
  - ローディング: `isSubmitting` でボタン/入力制御
- `src/context/AuthContext.tsx`
  - 初期化時に `fetchUserData()` でユーザー同期、トークン無効時はクリア
- `src/services/auth/TokenManager.ts`
  - 本番/プレビュー: アクセストークン期限前に自動 refresh、401 時は一度だけ refresh→再試行
  - ローカル開発: refresh 無効（明示的に再ログインを誘導）
- `src/services/api/fetchWithAuth.ts`
  - Authorization ヘッダ付与のみ（refresh は `TokenManager` が担当）
  - 認証不要パス: `/api/auth/login`, `/api/auth/refresh`, `/api/notifications/*`, `/api/health*`

3. トークン保存
-------------
- `localStorage` キー（現行）: `accessToken`, `refreshToken`, `expiresAt`, `refreshExpiresAt`
- 互換キー（暫定運用）: `access_token`（単一トークン経路で一部利用）
- 有効期限は `TokenManager` で管理（期限5分前に refresh を試行／本番・プレビューのみ）

4. ルーティング
-------------
- 成功後: React Router の `location.state.from` を優先。管理者は `/admin` を優先。なければ `/`。
- `sessionStorage.post_login_redirect` は未ログイン遷移時にインターセプタが保存（将来のフォールバック用）
- FeatureAccessGuard が保護

5. ユースケース別エラーメッセージ／ステータス
---------------------------------------
- 401 invalid_credentials: 「メールアドレスまたはパスワードが正しくありません」
- 403 suspended/inactive: 「アカウントが停止/無効です」
- 422 password_reset_required: 「パスワード再設定が必要です」
- ネットワーク障害/サーバ未起動: 「サーバーに接続できません。時間をおいて再試行してください」
- 注: 現状 `/auth/login` は 429/423 は返却しません（将来拡張で対応）

6. テスト観点
-----------
- 単体: フォームバリデーション、状態遷移、API 成否分岐
- 結合: ログイン成功→保護ページ遷移、401→refresh→再試行（本番/プレビューのみ）、refresh 失敗→再ログイン誘導
- 総合: 実 API/本番同等環境での動作確認

7. ログ/監査・計測
-----------------
- 成功/失敗イベントの計測（`useAnalytics`: `login_success` など）
- API インターセプタの未認証リダイレクト時に `post_login_redirect` を保存
- 認証関連の重大エラーはコンソール/監視に出力（本番はサーバ収集を想定）

8. 完了条件（詳細設計）
--------------------
- API 契約/保存/エラーハンドリング/遷移/テスト観点が現行実装に即して定義され、レビュー承認済み

