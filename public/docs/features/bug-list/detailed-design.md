# 🐞 不具合一覧 詳細設計書

対象機能: 不具合一覧/登録（/bugs, /bugs/new）と連携API（/api/bugs）

## 1. 画面詳細

### 1.1 一覧 `/bugs`
- フィルタ状態
  - `featureId: string | ''`
  - `status: 'open'|'in_progress'|'resolved'|'closed'|''`
  - URL クエリ同期: `?featureId=...&status=...`
- 読み込みフロー
  1. 初期レンダリングで `URLSearchParams` を読み取り state 初期化
  2. `featureId/status` 変更時に `load()` 実行
  3. `GET /api/bugs?featureId&status` → 成功時に `bugs` state 更新
- 表示
  - タイトル（太字）
  - メタ: 機能ID / 重要度 / 状態 / 作成日時（`toLocaleString()`）
  - 説明（存在時のみ段落表示）
- アクセシビリティ
  - フィルタラベルに `label` 明示
  - ボタンに `aria-label` 付与

### 1.2 登録 `/bugs/new`
- 入力要素
  - タイトル（text, required, 1..200）
  - 説明（textarea, 0..5000）
  - 機能（select, required, `featuresRegistry[].id`）
  - 重要度（radio/select, required: low|medium|high|critical）
  - 状態（select, optional: open|in_progress|resolved|closed, default open）
- バリデーション
  - 送信時にフロント側チェック → NG の場合はエラーメッセージ表示
- 送信フロー
  1. POST `/api/bugs` に JSON 送信
  2. 201 成功 → `/bugs` に `navigate`
  3. 失敗 → メッセージ表示

## 2. API I/F 詳細

### 2.1 GET /api/bugs
- 概要: 不具合の一覧取得（作成日時降順）
- Query
  - `featureId?: string`
  - `status?: 'open'|'in_progress'|'resolved'|'closed'`
- 200 OK
```
{
  "success": true,
  "data": [
    {
      "_id": "65f...",
      "title": "保存できない",
      "description": "フォーム送信時に500が返ります",
      "featureId": "bug-list",
      "severity": "high",
      "status": "open",
      "createdAt": "2025-09-04T00:00:00.000Z",
      "updatedAt": "2025-09-04T00:00:00.000Z"
    }
  ]
}
```
- 500
```
{ "success": false, "message": "不具合一覧の取得に失敗しました" }
```

### 2.2 POST /api/bugs
- 概要: 不具合の登録
- Request Body
```
{
  "title": "必須・1..200",
  "description": "任意・0..5000",
  "featureId": "必須（featuresRegistry の id）",
  "severity": "low|medium|high|critical",
  "status": "open|in_progress|resolved|closed"
}
```
- 201 Created
```
{ "success": true, "data": { "_id": "...", "title": "...", "featureId": "bug-list", "severity": "low", "status": "open" } }
```
- 400 Bad Request
```
{ "success": false, "message": "title と featureId は必須です" }
```
- 500 Internal Error
```
{ "success": false, "message": "不具合登録に失敗しました" }
```

## 3. サーバ実装（Vercel Functions）

- ルート: `api/bugs/index.ts`
  - CJS 互換の単一ハンドラ `module.exports = handler`
  - CORS: 本番/プレビュー Origin を許可, `OPTIONS` 200
  - DB 接続: `connectMongoDirect()`（`api/_lib/mongo.js`）
  - モデル: `ensureBugModel()`（`api/_schemas/bug.ts`）で遅延ロード
  - GET: クエリから `filter` を組み立て、`find().sort({createdAt:-1}).lean()`
  - POST: body を検証して `create()`、201 を返却

- スキーマ: `api/_schemas/bug.ts`
```
{
  title: { type: String, required: true },
  description: { type: String },
  featureId: { type: String, index: true, required: true },
  severity: { type: String, enum: ['low','medium','high','critical'], default: 'low' },
  status: { type: String, enum: ['open','in_progress','resolved','closed'], default: 'open' }
}
```

## 4. バリデーション対応表
| フィールド | フロント | サーバ |
|---|---|---|
| title | required, 1..200 | required（空は400） |
| description | 0..5000 | 無指定可（長さチェックは将来追加） |
| featureId | required（レジストリから選択） | required（空は400） |
| severity | enum | enum |
| status | enum（任意） | enum（任意） |

## 5. エラー設計
- 400: 必須未入力、型不正
- 500: DB 例外（メッセージは一般化）
- ログ: `create/list` 開始・結果を info、critical/high 登録は warn

## 6. セキュリティ
- CORS 設定済み（本番/プレビュー/localhost）
- XSS 対策: タイトル/説明はプレーンテキスト表示
- 将来: JWT による記録者付与・ロール制御

## 7. パフォーマンス
- 一覧は `lean()` で軽量化
- 需要に応じページング/limit 追加（将来）

## 8. 総合試験（本番）
1. GET `/api/bugs` → 200/配列
2. POST `/api/bugs`（必須のみ）→ 201
3. GET 再実行 → 直近が先頭に表示
4. フィルタ `featureId` のみ → 対象機能のみ表示
5. フィルタ `status=open` → open のみ表示
6. バリデーション（title 未入力）→ 400
7. OPTIONS プリフライト → 200
8. CORS 許可ドメインからの呼び出し成功

## 9. リスクと対策
- リスク: 本番で API 404（デプロイスコープ漏れ）
  - 対策: `.vercelignore` に `!api/bugs/**` を明示（対応済み）
- リスク: Mongoose の初期化順序により `Schema` が null
  - 対策: `ensureBugModel()` で遅延取得（`getMongoose()`）

---
以上。
