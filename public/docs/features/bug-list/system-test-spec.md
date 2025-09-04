# 🐞 不具合一覧 総合試験仕様書

対象機能: 不具合一覧/登録（/bugs, /bugs/new）および実API（/api/bugs）

## 1. 前提条件 / 試験環境
- 本番/プレビュー/ローカルのいずれか（CORS 設定済）
- 環境変数: `MONGODB_URI` 設定済み
- デプロイ対象に `api/bugs/**` が含まれる（.vercelignore allowlist 済み）
- ブラウザ: 最新版 Chrome / Edge

## 2. 試験観点
- API 正常系/異常系（GET/POST）
- 画面フロー（一覧 → 登録 → 一覧反映、フィルタ）
- CORS/OPTIONS、アクセシビリティ、表示の健全性

## 3. 試験ケース一覧

| ID | 観点 | 手順 | 期待結果 |
|---|---|---|---|
| TC-API-01 | GET 正常 | `GET /api/bugs` | 200、`{success:true,data:Array}`（空配列可） |
| TC-API-02 | POST 正常（必須のみ） | `POST /api/bugs` with `{title, featureId}` | 201、作成ドキュメントが返る（`title/featureId/severity/status/createdAt` 含む） |
| TC-API-03 | POST → GET 反映 | TC-API-02 実施後に `GET /api/bugs` | 直近のレコードが先頭で取得できる |
| TC-API-04 | フィルタ featureId | `GET /api/bugs?featureId=bug-list` | 指定機能の不具合のみ返る |
| TC-API-05 | フィルタ status | `GET /api/bugs?status=open` | `status=open` のみ返る |
| TC-API-06 | バリデーション | `POST /api/bugs` で `title` 欠落 | 400、`title と featureId は必須です` |
| TC-API-07 | CORS/OPTIONS | `OPTIONS /api/bugs` → `POST /api/bugs` | OPTIONS=200、同一オリジン/許可オリジンから POST 成功 |
| TC-UI-01 | 一覧初期表示 | `/bugs` へ遷移 | タイトル「不具合はありません」、フィルタ UI 表示、読み込み後に一覧/空表示 |
| TC-UI-02 | 登録フロー | `/bugs/new` で必要項目入力→送信 | 201 後 `/bugs` に戻り、作成済みレコードが表示される |
| TC-UI-03 | フィルタ連動 | `/bugs` で feature/status を変更 | クエリに反映、一覧が再取得され条件に合致する |
| TC-A11Y-01 | ラベル/操作 | フィルタ・ボタン操作 | ラベル付与、キーボード操作可、フォーカス可視 |

## 4. 詳細手順（抜粋）
### 4.1 API シナリオ
1) `GET /api/bugs` → 200/配列（空でも可）
2) `POST /api/bugs` body 例:
```
{
  "title": "E2E: 一覧保存に失敗する",
  "featureId": "bug-list"
}
```
→ 201（`severity='low'`,`status='open'` 初期値）
3) 再度 `GET /api/bugs` → 先頭に 2) の件が存在
4) `GET /api/bugs?featureId=bug-list` → 全件が `featureId=bug-list`
5) `GET /api/bugs?status=open` → 全件が `status=open`
6) `POST /api/bugs`（`title` 欠落）→ 400

### 4.2 UI シナリオ
1) `/bugs` 表示 → フィルタ UI / 一覧表示（空なら「不具合はありません」）
2) 「不具合を登録」→ `/bugs/new` → 必須項目入力 → 送信 → `/bugs`
3) 直近のレコードが一覧に表示され、フィルタ変更で絞り込める

## 5. 判定基準（合否）
- 上表すべてのケースが期待結果どおりであること
- 異常時のメッセージがユーザーに分かりやすく表示されること
- ブラウザのコンソールに致命的エラーが出ていないこと

## 6. 付記
- 実装詳細は「基本設計書」「詳細設計書」を参照
- 将来: 認証導入後は作成者・担当者・コメント等の追加ケースを拡張
