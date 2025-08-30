# 開発状況をシェア 基本設計書

最終更新: 2025-08-30

概要
- `generateDevProgressShareText` でシェア文面を生成し、`openShare` で共有を実行するユーティリティ構成。

構成
- ファイル: `src/services/share/generateDevProgressShareText.ts`
- 関数:
  - `generateDevProgressShareText(opts?)`
  - `openShare(text, url)`
- 呼び出し元（画面/コンポーネント構成と責務）:
  - `src/pages/FeaturesStatus.tsx`（機能一覧の操作部から共有）
  - `src/pages/Home.tsx`（ホームフッターから共有）
  - `src/components/layout/Layout.tsx`（ヘッダー右上から共有）
  - いずれも「文面生成→共有実行」を呼び出すのみで、状態管理は持たない

I/F
- 入力: `featureIds?: string[]`, `statuses?: Record<string, FeatureStatus> | null`
- 出力: シェア本文（string）

入力/バリデーション/エラー表示
- 入力項目: なし（固定初版・内部データのみ参照）
- バリデーション: なし
- エラー表示: 共有API失敗は非ブロッキングで握りつぶし（UX優先、ユーザー操作を中断しない）

API 呼び出しと例外/再試行
- 外部API: なし
- 共有手段: `navigator.share` が利用可能ならそのまま使用、非対応時は X(Twitter) Web Intent を新規タブで開く
- 再試行: なし（ユーザーが再度ボタンを押せばよい）

ローディング/成功/失敗時の UX
- ローディング: 不要（同期生成）
- 成功: OSの共有シート or Web Intent を表示（追加UI不要）
- 失敗: 画面遷移やモーダルを出さず処理終了（非ブロッキング）

アクセス制御・権限・FeatureAccessGuard
- 表示条件: `/_bg/share-dev-progress` 機能の存在で表示（初版は未完成でも最小限UIを許可）
- 権限: 特別な権限は不要（公開共有文面のみ、個人情報は含まない）

アクセシビリティ/セキュリティの基本方針
- アクセシビリティ: 共有ボタンは `aria-label` を付与し、キーボード操作可能
- セキュリティ: 共有文面には機密情報を含めない（進捗％と日付のみ）

エラーハンドリング
- `navigator.share` 例外、ポップアップブロック等は握りつぶし（UX優先）

完了条件
- 3箇所から同じ文面が生成・共有可能
