# 開発状況をシェア 要件定義書

最終更新: 2025-08-30

## 目的
管理者・開発者が現在の主要機能（P0対象: ログイン/ログアウト/ユーザー登録）の進捗と目標リリース日を簡単に共有できるようにする。

## 対象
- Web: PWA含む
- 共有先: Web Share API 対応端末、非対応端末は X(Twitter) Web Intent

## 機能要件
1. 共有テキストの生成
   - 対象機能: login/logout/user-registration（固定初版）
   - 各機能の進捗％は内部のステータス段階から算出
   - 目標リリース日がある場合は YYYY/MM/DD で併記
2. 共有アクション
   - `navigator.share` が利用可: native share
   - それ以外: `https://twitter.com/intent/tweet` を新規タブで開く
3. 表示箇所
   - ヘッダー右上（ガード可）
   - ホームフッター（ガード可）
   - 機能一覧ページ（ガード可）

## 非機能要件（性能/可用性/セキュリティ/アクセシビリティ）
- 性能: 共有テキスト生成は 0.5 秒以内
- 可用性: `navigator.share` 非対応端末でも Web Intent により機能維持
- セキュリティ: 外部に個人情報・トークン等を含めない（テキストは進捗と日付のみ）
- アクセシビリティ: 共有ボタンはキーボード操作可能、`aria-label` を付与、フォーカスリング表示

## API入出力・データフロー・依存関係
- API入出力: なし（クライアント内生成）
- データフロー:
  1) `featuresRegistry` と（任意で）`derived.effective` を参照
  2) `generateDevProgressShareText` で共有文面を作成
  3) `openShare` で `navigator.share` or Web Intent を起動
- 依存関係: `featuresRegistry`, `featureStatusEngine.NEW_STATUS_ORDER`

## 完了条件 / 受け入れ基準
- 3箇所（ヘッダー/ホーム/機能一覧）から同一フォーマットの共有が実行できる
- 共有文面に3機能分の行が含まれ、各行に進捗％と日付（または「未設定」）が出力される
- `navigator.share` 非対応環境で X Web Intent が開く
- ボタンが `aria-label` を持ち、キーボード操作で実行可能

## リスクと対応
- 共有失敗（ブラウザ制限/ポップアップブロック）: 例外は握りつぶし、ユーザー操作継続を妨げない
- 誤った進捗表示（設定ミス）: 進捗は段階表（`NEW_STATUS_ORDER`）から算出し、将来は `derived.effective` を優先的に利用
- Web Intent 側の仕様変更: URL 形式はユーティリティ内に集約し、変更時は単一点修正

## アクセス制御
- FeatureAccessGuard 相当: `/_bg/share-dev-progress` が未完成でもUIは最小限表示可能（初版）

## 完了条件
- 上記3箇所から共有が実行できる
- 共有テキストに正しい進捗％と日付が含まれる


