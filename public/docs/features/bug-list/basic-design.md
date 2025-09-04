# 🐞 不具合一覧 基本設計書

## 1. 画面構成
- 一覧ページ: `/bugs`
  - フィルタパネル（上部）
    - 機能選択（`featuresRegistry` から名称表示、値は `featureId`）
    - 状態選択（open / in_progress / resolved / closed）
    - 再読み込みボタン
  - リスト（作成日時降順）
    - 行要素: タイトル、メタ情報（機能・重要度・状態・作成日時）、説明（折りたたみ/行下表示）
  - 右上アクション: 「不具合を登録」→ `/bugs/new`

- 登録ページ: `/bugs/new`
  - 入力項目
    - タイトル（必須、1..200）
    - 説明（任意、0..5000）
    - 機能（必須、`featureId` セレクト）
    - 重要度（必須、low/medium/high/critical）
    - 状態（任意、初期値 open）
  - ボタン: 送信 / キャンセル（一覧へ戻る）

## 2. ルーティング
- SPA: `react-router-dom`
  - `/bugs` → `BugListPage`
  - `/bugs/new` → `BugFormPage`

## 3. コンポーネント責務
- `BugListPage`
  - フィルタ状態（`featureId`,`status`）を `URLSearchParams` と同期
  - 変更時に `/api/bugs` を再取得
  - ローディング/空表示/エラー表示の分岐
- `BugFormPage`
  - 入力値とバリデーション
  - 送信成功後に `/bugs` へ `navigate`

## 4. 状態管理
- 画面ローカル `useState` を基本とする（Redux 不要）
- ブラウザ戻るに配慮し、フィルタはクエリ文字列で保持

## 5. バリデーション（フロント）
- タイトル: 必須、1..200
- 説明: 0..5000
- 機能: 必須（`featuresRegistry` の id）
- 重要度: 列挙値のみ

## 6. API I/F
- `GET /api/bugs`（一覧取得）
  - Query: `featureId?: string`, `status?: string`
  - Response（200）:
```
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "...",
      "description": "...",
      "featureId": "bug-list",
      "severity": "low",
      "status": "open",
      "createdAt": "2025-09-04T00:00:00.000Z"
    }
  ]
}
```

- `POST /api/bugs`（登録）
  - Body:
```
{
  "title": "文字列(必須)",
  "description": "任意",
  "featureId": "bug-list",
  "severity": "low|medium|high|critical",
  "status": "open|in_progress|resolved|closed"
}
```
  - 201 成功時: `{ success: true, data: Bug }`
  - 400: バリデーション不備、500: サーバーエラー

## 7. エラー/ローディング UX
- 一覧・登録ともに実行中はボタンを `disabled`、スピナー表示
- エラー時は Alert/Toast（「再読み込み」誘導）

## 8. セキュリティ/ネットワーク
- CORS: 本番ドメイン + プレビューを許可（API 側で対応済）
- XSS: Markdown 等のリッチ表示は行わない（プレーンテキスト）
- 将来: 作成者・認証（JWT）を拡張予定

## 9. アクセシビリティ
- フォーム要素は `label` と `aria-*` を適切に付与
- フィルタはキーボード操作可能なセレクトコンポーネント

## 10. 計測/ログ
- API 成功/失敗を `console.info/warn` で記録（サーバー側は重要操作をログ）
- 重要度 `high/critical` 登録時は警告ログ

## 11. テスト観点
- 単体: 入力バリデーション、クエリ文字列同期
- 結合: `GET /api/bugs` のフィルタ反映、`POST` 後の一覧反映
- 総合: 本番での一連操作（一覧→登録→再取得）

## 12. 例外/フォールバック
- API 404/500 時はユーザーにメッセージ表示、再試行可能
- ネットワーク断は低頻度ポーリングでの再読込（手動トリガ優先）

---
この基本設計に従って、詳細設計・実装・総合試験へ進めます。
