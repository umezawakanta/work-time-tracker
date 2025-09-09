# ADR-0001: Branching Strategy

## 決定

- `main`: 本番。常にデプロイ可能。
- `develop`: 次期統合。Previewへ自動デプロイ。
- `feature/*`: 機能単位。完了したら PR → develop。
- `hotfix/*`: 本番障害向け。`main` へ最短修正→ `develop` に逆マージ。
- 大規模リリース時のみ `release/*` を使用。

## 理由

- Vercel の Preview を最大活用し、速い統合と安全な本番運用を両立。
- 評価コストを PR 単位に閉じる。

## 代替案

- Trunk-based + フィーチャーフラグ：小規模ならこれも可。
