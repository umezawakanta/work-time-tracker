ログアウト 詳細設計書
=================

最終更新: 2025-08-30

処理フロー
--------
1) ヘッダーのボタンクリック
2) `authApi.logout()` 実行 → `tokenManager.clearTokens()`、`sessionStorage.user-logged-out = 'true'`
3) 必要に応じ `/login` に `navigate`

API
---
- POST `/api/auth/logout`（任意）: ログ記録。クライアント側削除が主。

トークン/ストレージ
----------------
- `accessToken`/`refreshToken`/`expiresAt`/`refreshExpiresAt` を削除
- APIクライアントの Authorization ヘッダーを解除

エッジケース
---------
- ネットワーク障害でもクライアント側は必ず未認証化
- マルチタブ: 次回保護リソースアクセス時にログインへ誘導

テスト観点
--------
- クリックで TokenManager のクリアが呼ばれる
- クリック後に保護ページへアクセスするとログインへリダイレクト

完了条件（詳細設計）
----------------
- 上記のフロー/エラー/ストレージクリアが満たされ、レビュー承認済み


