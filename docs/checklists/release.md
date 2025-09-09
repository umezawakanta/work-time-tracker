# Release Checklist

## 事前

- [ ] 必須チェック（CI/Vercel Preview）成功
- [ ] 受け入れ条件 & スクショ確認
- [ ] 500/console error なし、Lighthouse の重大退行なし

## リリース方法

- 方式A: develop → main をマージ（自動で Production）
- 方式B: Preview を Promote to Production（安全切替）

## リリース後

- [ ] 主要ページの動作確認（iPhone SE 含む）
- [ ] 監視に新規エラーなし
- [ ] ロールバック手順を確認（直前デプロイまたは Preview）
