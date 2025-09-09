# ADR-0001: ブランチ戦略

## 決定事項

軽量GitFlowを採用する。

## 理由

- **Preview環境が強力**: VercelのPreview機能により、ブランチごとに完全な動作確認が可能
- **小〜中規模開発**: 大規模なリリース管理は不要
- **安全な本番デプロイ**: Preview → Production Promoteでゼロリスク

## ブランチ構成

- `main`: 本番（Vercel Production）
- `develop`: 次期統合先（常時デプロイOK品質）
- `feature/*`: 機能単位（例: `feature/guard-route`）
- `hotfix/*`: 本番障害用最短ブランチ

## 運用ルール

1. 機能開発は `feature/*` から開始
2. PR作成で自動Preview発行
3. CI + レビュー通過で `develop` マージ
4. 安定度確認後、`develop` → `main` または Preview Promote

## 代替案

- **Trunk-Based**: `main` 直 + フラグ制御
- 現状はPreview環境が充実しているため、軽量GitFlowが最適
