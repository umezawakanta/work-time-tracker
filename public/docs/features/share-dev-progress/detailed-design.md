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

テスト観点
- 生成テキストが3機能分の行を含む
- 日付整形が `2025-09-01` → `2025/09/01` になる
- `openShare` が Web Intent URL を構築する

完了条件
- 3箇所から同一文面の共有が可能
