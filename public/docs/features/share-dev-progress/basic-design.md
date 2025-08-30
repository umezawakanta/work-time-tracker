# 開発状況をシェア 基本設計書

最終更新: 2025-08-30

概要
- `generateDevProgressShareText` でシェア文面を生成し、`openShare` で共有を実行するユーティリティ構成。

構成
- ファイル: `src/services/share/generateDevProgressShareText.ts`
- 関数:
  - `generateDevProgressShareText(opts?)`
  - `openShare(text, url)`
- 呼び出し元:
  - `src/pages/FeaturesStatus.tsx`
  - `src/pages/Home.tsx`
  - `src/components/layout/Layout.tsx`

I/F
- 入力: `featureIds?: string[]`, `statuses?: Record<string, FeatureStatus> | null`
- 出力: シェア本文（string）

エラーハンドリング
- share失敗は握りつぶし（ユーザ操作のためUX優先）

完了条件
- 3箇所から同じ文面が生成・共有可能
