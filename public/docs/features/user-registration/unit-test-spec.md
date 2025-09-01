ユーザー登録 単体試験仕様書
=================

最終更新: 2025-09-01

1. 目的
-------
- `/register` 画面および登録処理のユニットレベルの振る舞いを検証し、UI検証・API呼出・トークン保存・遷移・エラーハンドリングが要件/詳細設計どおりに動作することを確認する。

2. スコープ
-----------
- 画面: `src/pages/Register.tsx`
- APIクライアント: `src/services/api/authApi.ts`（register）
- 付帯: `TokenManager` 連携、紹介コード取り込み（`services/share/referral`）、アナリティクスイベント送出

3. 前提/モック
---------------
- テストランナー: Jest（jsdom）
- UI: @testing-library/react + user-event
- モック:
  - `api.post('/auth/register', ...)` をモック（成功/409/400/503/ネットワーク障害）
  - `TokenManager.setTokens` をスパイ
  - `useNavigate` をモック（遷移検証）
  - `react-hot-toast` をスパイ（トースト検証）
  - 紹介コード: `persistReferralFromUrl`, `getReferralCode`, `setReferralCode`, `clearReferralCode` を必要に応じてスタブ

4. 画面/UI 基本検証
-------------------
4-1. 初期表示
- 名前/メール/パスワード/パスワード（確認）/招待コード（任意）/利用規約チェック/送信ボタンが表示される
- 送信ボタンは未入力かつ規約未同意時に disabled

4-2. バリデーション（同期）
- 名前: 空/1文字/51文字でエラー、2〜50文字でOK
- メール: RFC簡易正規表現不一致でエラー、正当な形式でOK
- パスワード: 8文字未満/必須属性（大小英字・数字）欠落でエラー
- 確認: 入力がパスワードと不一致ならエラー
- エラーは該当フィールド直下とアイコンで表示（赤）

4-3. パスワード強度表示
- 入力組成に応じて強度メッセージとプログレスが更新される（弱い/普通/強い/非常に強い）

4-4. 利用規約
- 規約未チェックで送信すると上部アラート（aria-live）表示
- チェック後は送信可能

4-5. 紹介コード
- URL `?ref=abc123` 取り込みでフィールドが `abc123` になる
- 入力変更で `setReferralCode` が呼ばれる

5. API 連携と遷移
------------------
5-1. 成功（token 同梱あり）
- `api.post('/auth/register', { displayName, email, password, acceptTerms, referralCode? })` が1回呼ばれる
- `TokenManager.setTokens(token, token, ...)` が呼ばれる
- `navigate('/')` が呼ばれる
- `clearReferralCode()` が呼ばれる（紹介コード入力がある場合）
- `register_success` イベントが送出される

5-2. 成功（token 同梱なし）
- `navigate('/login', { state: { message, email } })` に遷移

6. エラーパス
--------------
6-1. 重複メール（409）
- email フィールドにエラーメッセージが表示され、トーストを伴わない

6-2. 入力不備（400）
- 上部アラート + トーストが表示され、フォーム値は保持される

6-3. サービス不可（503）
- 上部アラート + トースト表示（「しばらくしてから再試行」案内）

6-4. ネットワーク障害
- トーストで汎用エラーメッセージ、UIはクラッシュしない

7. アクセシビリティ
--------------------
- ラベルは `Label htmlFor` と `Input id` が対応
- 重要メッセージは `aria-live` 領域で通知
- キーボードのみでフォーカス移動と送信が可能

8. セキュリティ観点（ユニットでの検証可能範囲）
----------------------------------------------
- 送信時にパスワードがログ/計測に出力されていない（スパイで検証）
- 例外時も入力値（平文パスワード）を console に出力しない

9. 非機能
----------
- 送信時のローディング表示（ボタン内スピナー）が出る/解除される
- 多重送信防止: 送信中はボタン disabled

10. カバレッジ目標
------------------
- `src/pages/Register.tsx` 行/分岐 80%以上
- `src/services/api/authApi.ts`（register）主経路/エラー分岐網羅

11. テストデータ例
------------------
- 正常: name=太郎, email=valid@example.com, password=Aa123456, confirm=同一, acceptTerms=true
- 重複: email=dup@example.com → 409
- 入力不備: password=123 → 400
- 障害: 503 または ネットワークエラー

12. 実装メモ（推奨）
--------------------
- `data-testid="register-submit-btn"` をクリックトリガーに使用
- API は jest.mock で分岐（成功/409/400/503/ネットワーク）
- navigate/TokenManager/toast/analytics はスパイ


