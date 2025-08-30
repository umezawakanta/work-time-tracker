# 開発状況をシェア 詳細設計書

最終更新: 2025-08-30

API/I/F
- 共有テキスト生成: `generateDevProgressShareText(opts?: { featureIds?: string[]; statuses?: Record<string, FeatureStatus> | null })`
  - 進捗%: `NEW_STATUS_ORDER` の段階位置で算出
  - 日付: `feature.targetRelease` を `YYYY/MM/DD` に整形
- 共有実行: `openShare(text: string, url: string)`
  - `navigator.share` / Twitter Web Intent フォールバック

ルーティング/表示
- `Home.tsx` のフッター直前
- `FeaturesStatus.tsx` のヘッダー操作部
- `Layout.tsx` ヘッダーの右側エリア

状態/例外
- 共有対象は初版固定: login / logout / user-registration
- 例外は握りつぶし（共有不可端末やブロック時）

非対象/前提
- トークン保存/更新のシーケンス: 対象外（本機能は認証トークンを扱わない）
- 画面遷移・リダイレクト（post_login_redirect 等）: 対象外（共有は新規タブ/OSシート）
- 状態管理: なし（同期生成・副作用なし）

エラーケース（網羅）
- `navigator.share` 未対応: Web Intent へフォールバック
- ポップアップブロック: 共有失敗（握りつぶし、処理継続）
- 対象機能のメタ不足（`targetRelease` なし）: 日付は「未設定」で出力
- `statuses` マップ未提供: レジストリの `status` を使用

セキュリティ詳細
- XSS: 固定文面＋内部データのみ（ユーザー入力無し）
- CSRF: 外部書き込み無しのため非該当
- トークン保護: 共有文面に機微情報を含めない（進捗％と日付のみ）
- 外部URL: Web Intent は `https://twitter.com/intent/tweet` のみを使用

ログ/監査・計測項目
- 初版: 導入しない（仕様上の設計のみ定義）
- 設計: UIイベント `share_dev_progress` を検討（発火地点: 3箇所の共有ボタン）
  - ペイロード例: `{ features: ['login','logout','user-registration'] }`

テスト観点
- 生成テキストが3機能分の行を含む
- 日付整形が `2025-09-01` → `2025/09/01` になる
- `openShare` が Web Intent URL を構築する

完了条件
- 3箇所から同一文面の共有が可能
