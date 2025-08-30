ユーザー登録 詳細設計書
=================

最終更新: 2025-08-30

API I/F
-------
- POST `/api/auth/register`
  - req: `{ displayName: string, email: string, password: string, acceptTerms: boolean, referralCode?: string }`
  - res（現状実装）: `{ token?: string, user: { id, email, displayName, role, isVerified }, subscription?: {...} }`
  - エラー: 400 入力不備, 409 重複, 503 DB不可, 500 その他

フロント実装詳細
--------------
- `src/pages/Register.tsx`
  - controlled inputs / リアルタイム検証 / 送信中ローディング
  - 成功時: `token` があれば `TokenManager.setTokens(token, token, ...)`→`/`、無ければ `/login` へ state 付き遷移
  - 招待コードはローカル保存/URL取り込みに対応
- `src/services/auth/TokenManager.ts`
  - テストでは API 健全性チェックはフォールバックし、メモリ運用でも問題なし

トークン保存
---------
- `localStorage`: `accessToken`, `refreshToken`, `expiresAt`, `refreshExpiresAt`
- 単一 `token` の場合は暫定的に両方へ同値を保存（互換運用）

ルーティング
--------
- 登録成功後: `token` あり→`/`、なし→`/login`（`state.message`/`state.email`）

ユースケース別エラー
---------------
- 409: メール重複 → email フィールドにエラー表示
- 400/503: フォーム上部アラート + トースト
- ネットワーク障害: 汎用メッセージ

テスト観点
--------
- 単体: 入力検証、ボタン無効化、API 成否分岐
- 結合: 成功時の遷移（`/` or `/login`）、重複メール時のフィールドエラー表示
- 総合: 実 API/本番同等環境での動作確認

完了条件（詳細設計）
----------------
- API 契約/保存/エラーハンドリング/遷移/テスト観点が現行実装に即して定義され、レビュー承認済み


