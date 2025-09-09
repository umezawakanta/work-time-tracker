# リリースチェックリスト

## PR 前

- [ ] ESLint/TS 0、`test:ci` OK、iPhone SEで崩れない
- [ ] 受け入れ条件を満たすスクショ/動画
- [ ] ネーミングとUI文言が一貫

## マージ 前

- [ ] Vercel Preview OK（/sitemap、対象ページ、モバイル操作）
- [ ] 主要ログ・警告なし
- [ ] フラグ（例: `VITE_DOPAMINE_GUARD`）既定値が安全側

## リリース 後

- [ ] 500/エラーの新規発生なし
- [ ] 重要指標（LCP/CLS）悪化なし
- [ ] Rollback 手順（前のデプロイ/Preview URL）を把握
