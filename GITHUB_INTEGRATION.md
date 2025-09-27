# GitHub Integration Setup

## GitHub Personal Access Token の設定

GitHubイシュー自動発行機能を使用するには、GitHub Personal Access Tokenを設定する必要があります。

### 1. GitHub Personal Access Token の作成

1. GitHubにログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token" → "Generate new token (classic)" をクリック
4. 以下の設定でトークンを作成：
   - Note: "Work Time Tracker Error Reports"
   - Expiration: 適切な期間を選択（推奨: 1年）
   - Scopes: `repo` にチェック（リポジトリへのアクセス権限）

### 2. 環境変数の設定

#### 開発環境 (.env.local)
```bash
VITE_GITHUB_TOKEN=your_github_token_here
```

#### 本番環境 (Vercel)
1. Vercel Dashboard → Project Settings → Environment Variables
2. 以下の設定を追加：
   - Name: `VITE_GITHUB_TOKEN`
   - Value: 作成したGitHub Personal Access Token
   - Environment: Production, Preview, Development

### 3. 機能の動作

- エラー報告が送信されると、自動的にGitHubイシューが作成されます
- イシューには以下のラベルが自動で付与されます：
  - `bug`: バグ報告であることを示す
  - `auto-generated`: 自動生成されたイシューであることを示す

### 4. セキュリティ注意事項

- GitHub Personal Access Tokenは機密情報です
- リポジトリにコミットしないでください
- 定期的にトークンを更新することを推奨します
- 必要最小限の権限（`repo`）のみを付与してください
