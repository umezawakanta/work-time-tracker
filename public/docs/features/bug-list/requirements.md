# 🐞 不具合一覧 要件定義書

## 1. 目的
「不具合一覧/登録」機能により、機能単位での不具合を可視化し、優先度と状態を管理できるようにする。

## 2. スコープ
- 対象画面: `/bugs`（一覧）、`/bugs/new`（登録フォーム）
- 対象API: `GET /api/bugs`、`POST /api/bugs`
- 役割: 一般ユーザー/管理者（初期は認証不要でも閲覧可能。将来は認証で絞り込み）

## 3. 完了の定義（DoD）
- 本番デプロイ済み（Vercel）
- 一覧/登録が実APIと接続して動作（モック/ダミー不可）
- バリデーション・エラー処理・CORS を実装
- 総合試験項目を満たす（下記 10.）

## 4. 画面仕様（概要）
### /bugs（一覧）
- フィルタ: `feature`（機能IDセレクト）、`status`（open/in_progress/resolved/closed）
- 並び: 作成日時の降順
- 表示項目: タイトル、機能ID、重要度、状態、作成日時、（説明は折りたたみ/行下表示）
- 操作: 「不具合を登録」→ `/bugs/new` へ遷移

### /bugs/new（登録）
- 入力: タイトル（必須）、説明、機能ID（必須/セレクト）、重要度（必須）、状態（任意/初期 open）
- 送信成功時: `/bugs` へ遷移し、直近のレコードが一覧に表示される

## 5. データモデル（MongoDB `bugs` コレクション）
```
Bug {
  _id: ObjectId,
  title: string (required, 1..200),
  description?: string (0..5000),
  featureId: string (required),        // 例: 'bug-list'
  severity: 'low'|'medium'|'high'|'critical' (default: 'low'),
  status: 'open'|'in_progress'|'resolved'|'closed' (default: 'open'),
  createdAt: ISODate,
  updatedAt: ISODate,
}
```

## 6. API 仕様
### GET /api/bugs
- 説明: 不具合一覧の取得（降順）
- クエリ: `featureId?: string`, `status?: string`
- レスポンス: `{ success: true, data: Bug[] }`
- ステータス: 200 / 500

### POST /api/bugs
- 説明: 不具合の登録
- ボディ: `{ title: string, description?: string, featureId: string, severity?: 'low'|'medium'|'high'|'critical', status?: 'open'|'in_progress'|'resolved'|'closed' }`
- バリデーション: `title` と `featureId` は必須
- レスポンス: 201 `{ success: true, data: Bug }`
- ステータス: 201 / 400 / 500

## 7. バリデーション
- title: 必須, 1..200
- description: 0..5000
- featureId: 必須（`featuresRegistry` の ID を利用）
- severity: 指定値のみ
- status: 指定値のみ

## 8. セキュリティ/権限
- 初期は閲覧/登録ともに緩和（PoC）。将来は JWT により記録者の追跡・ロール制御を追加
- CORS: 本番ドメインおよびプレビューを許可、OPTIONS 対応
- 監査ログ: 重要操作（登録）はサーバーログ出力

## 9. 非機能要件
- 可用性: API タイムアウト 5s 以内、再試行はクライアント側で任意
- 性能: 一覧はサーバーで降順ソート、必要に応じてページング拡張
- アクセシビリティ: フォーム/一覧にラベル/ロールを付与

## 10. 総合試験（本番環境）
1. GET `/api/bugs` → 200, JSON（空配列可）
2. POST `/api/bugs`（必須項目のみ）→ 201, 作成ドキュメントに `title/featureId/severity/status` が含まれる
3. GET 再実行 → 直近のレコードが先頭に表示
4. フィルタ（featureId/status）で意図した件数のみ表示
5. 入力不備（title なし）→ 400
6. CORS: ブラウザからの呼び出しが成功（OPTIONS→200, 本体→200/201）

## 11. エラーハンドリング
- 400: バリデーションエラー
- 500: DB/予期せぬ例外（メッセージはサニタイズ）

## 12. ログ/計測
- API ハンドラで `create/list` の開始/結果を info ログ出力
- 重要度 `high/critical` の作成時に警告ログ

## 13. 将来拡張
- 認証必須化、通報者/担当者/コメント、添付、ステータス遷移の履歴、ページング/検索


