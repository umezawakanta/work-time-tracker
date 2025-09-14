# Work Time Tracker

シンプルな時間記録アプリケーションです。

## 機能

- ユーザー認証（ログイン/ログアウト）
- 時間記録（開始/停止）
- リアルタイム経過時間表示
- レスポンシブデザイン

## 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT + bcryptjs

## セットアップ

1. 依存関係をインストール
```bash
pnpm install
```

2. 環境変数を設定
```bash
# .env.local
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

3. 開発サーバーを起動
```bash
pnpm run dev
```

4. ビルド
```bash
pnpm run build
```

## デプロイ

Vercelにデプロイする場合：

1. Vercel CLIでログイン
2. プロジェクトをデプロイ
```bash
vercel --prod
```

## プロジェクト構造

```
├── api/                 # Vercel API routes
│   ├── auth/           # 認証関連
│   └── time/           # 時間記録関連
├── src/                # React アプリケーション
│   ├── App.tsx         # メインコンポーネント
│   ├── App.css         # スタイル
│   └── server/         # サーバー設定
└── public/             # 静的ファイル
```

## ライセンス

MIT
