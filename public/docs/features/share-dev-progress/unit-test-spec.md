# 開発状況をシェア 単体試験仕様書

対象: `src/services/share/generateDevProgressShareText.ts`

観点
- 既定3機能が行として出力される
- 日付整形 `YYYY-MM-DD` → `YYYY/MM/DD`
- `statuses` 指定時はそれを優先
- `navigator.share` 非対応時に Web Intent URL を生成
