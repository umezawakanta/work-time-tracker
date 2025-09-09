# Cursor Agent Auto Prompts

## A) 新機能実装

あなたは本リポの実装担当エージェント。目的は「featuresRegistry の <機能ID> を本番品質で実装し、E2Eまで通す」こと。
要件:

- 仕様の一次情報は `src/config/featuresRegistry.ts`
- MobileHeader 使用 / iPhone SE 幅で崩れない / CLS=0
- ESLint/TS 0、`pnpm run test:ci` を通すテスト最小1つ
- 変更は最小。不要な rename/format を避ける
  出力:

1. 変更ファイル一覧 2) 差分 3) テスト 4) 手動確認手順 5) リスク/ロールバック 6) 実行コマンド

## B) 既存コードの安全リファクタ

目的: <対象> の可読性改善＋副作用削減。Public API は維持。
制約: 1PR 300行以内、パフォーマンス悪化禁止、テスト維持/追加。

## C) バグ最短修正

現象/期待/再現手順を基に、原因→再現→修正差分→テスト→計測方法を提示。
