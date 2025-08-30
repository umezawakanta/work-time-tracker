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

## 非機能要件
- 0.5秒以内に共有テキストが生成されること
- 依存: featuresRegistry, featureStatusEngine

## アクセス制御
- FeatureAccessGuard 相当: `/_bg/share-dev-progress` が未完成でもUIは最小限表示可能（初版）

## 完了条件
- 上記3箇所から共有が実行できる
- 共有テキストに正しい進捗％と日付が含まれる


