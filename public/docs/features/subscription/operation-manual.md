# サブスクリプション 運用手順書

最終更新: 2025-09-05

## STRIPE_DEFAULT_PRICE_ID の取得方法

- ダッシュボード（推奨）
  1) Stripe にログイン（本番 or テスト環境を確認）
  2) Products → 対象プロダクトを選択
  3) Prices セクションで利用する価格を選択
  4) Price ID（例: `price_XXXXXXXX`）をコピー

- Stripe CLI
```bash
# 価格の一覧
stripe prices list --limit 10

# 新規作成例（必要に応じて）
stripe prices create \
  --unit-amount 1000 \
  --currency jpy \
  --recurring interval=month \
  --product "prod_XXXXXXXX"  # 既存プロダクトID
```

- Stripe API（任意）
```bash
# 例: curl での取得（要シークレットキー）
curl https://api.stripe.com/v1/prices \
  -u sk_live_xxx: \
  -G --data-urlencode limit=10
```

## 環境変数の設定（Vercel）
1) Vercel Dashboard → Project → Settings → Environment Variables
2) Key: `STRIPE_DEFAULT_PRICE_ID` / Value: `price_XXXXXXXX`
3) Environment: Production（必要に応じて Preview/Development も）
4) Save → 再デプロイ（自動/手動）

併せて `STRIPE_SECRET_KEY` も本番値を設定してください。

## 動作確認
- チェックアウト（デフォルト価格を使用）
```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  https://work-time-tracker-five.vercel.app/api/subscription/checkout \
  -d '{}' | jq
# 期待: { "sessionUrl": "https://checkout.stripe.com/..." }
```

- ステータス取得
```bash
curl -s https://work-time-tracker-five.vercel.app/api/subscription/status | jq
```

## 注意事項
- Live/Test の切替を必ず確認（Dashboard 右上のモード）
- 通貨・請求間隔（monthly/yearly）が要件と一致していること
- 複数プラン運用時は、画面から `planId`（= Price ID）を明示的に渡す運用を推奨
- 価格や製品を更新した場合は、該当 Price ID を再確認のうえ環境変数も更新
