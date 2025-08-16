# Gemini API セットアップガイド

## 現在の状況

現在、Gemini APIキーは一時的にコード内にハードコーディングされています。
セキュリティと柔軟性のため、環境変数を使用することを強く推奨します。

## 環境変数の設定方法

### 方法1: .envファイルの作成（推奨）

1. プロジェクトのルートディレクトリに `.env` ファイルを作成します
2. 以下の内容を追加します：

```env
VITE_GEMINI_API_KEY=AIzaSyDSapnVkg5I6U2JDjOme9cG4dkdfrxENh8
```

3. 開発サーバーを再起動します：

```bash
npm run dev
# または
pnpm dev
```

### 方法2: .env.localファイルの作成（ローカル開発用）

`.env.local` ファイルは Git に追跡されないため、個人の設定に適しています：

1. プロジェクトのルートディレクトリに `.env.local` ファイルを作成
2. 上記と同じ内容を追加
3. 開発サーバーを再起動

### 方法3: システム環境変数の設定

#### Windows (PowerShell)

```powershell
$env:VITE_GEMINI_API_KEY="AIzaSyDSapnVkg5I6U2JDjOme9cG4dkdfrxENh8"
npm run dev
```

#### macOS/Linux

```bash
export VITE_GEMINI_API_KEY="AIzaSyDSapnVkg5I6U2JDjOme9cG4dkdfrxENh8"
npm run dev
```

## APIキーの取得

新しいAPIキーが必要な場合：

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Get API Key」をクリック
4. 新しいAPIキーを生成

## 注意事項

- **セキュリティ**: APIキーをGitHubなどのパブリックリポジトリにコミットしないでください
- **gitignore**: `.env` と `.env.local` ファイルは `.gitignore` に追加されていることを確認してください
- **本番環境**: 本番環境では環境変数を適切に設定してください（Vercelの環境変数設定など）

## トラブルシューティング

### APIキーが読み込まれない場合

1. **ブラウザのキャッシュをクリア**
2. **開発サーバーを完全に停止して再起動**
   ```bash
   # Ctrl+C で停止後
   npm run dev
   ```
3. **ブラウザの開発者ツールでコンソールを確認**
   - `✅ Gemini API Key: 設定済み` が表示されるか確認

### APIリクエストが失敗する場合

1. **APIキーの有効性を確認**
   - Google AI Studioでキーが有効か確認
2. **クォータ制限を確認**
   - 無料プランの場合、リクエスト制限があります
3. **ネットワーク接続を確認**

## 現在の実装

`src/services/ai/QuadrantClassificationService.ts` では、以下の優先順位でAPIキーを取得します：

1. 環境変数 (`VITE_GEMINI_API_KEY`)
2. import.meta.env から直接取得
3. window オブジェクトから取得
4. ハードコーディングされた値（フォールバック）

環境変数が正しく設定されれば、ハードコーディングされた値は使用されません。

---

最終更新: 2025年1月
