# 環境変数セットアップガイド

## 必要な環境変数

### AI API キー設定

プロジェクトのルートディレクトリに `.env` ファイルを作成し、以下の環境変数を設定してください：

```env
# Google Gemini API
# 取得先: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Anthropic Claude API
# 取得先: https://console.anthropic.com/account/keys
# 注意: ブラウザから直接使用不可（CORS制限）
VITE_ANTHROPIC_API_KEY=your_claude_api_key_here

# OpenAI GPT-4 API
# 取得先: https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Ollama設定（ローカルLLM - APIキー不要）
# 利用可能モデル: llama3.2:3b, mistral, phi3, qwen2.5など
VITE_OLLAMA_MODEL=llama3.2:3b
```

## APIキーの取得方法

### 1. Google Gemini

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. 「Get API Key」をクリック
4. 新しいAPIキーを生成

### 2. Anthropic Claude

1. [Anthropic Console](https://console.anthropic.com/account/keys)にアクセス
2. アカウントを作成またはログイン
3. 「API Keys」セクションで新しいキーを生成
4. **注意**: CORS制限のため、ブラウザから直接使用できません

### 3. OpenAI

1. [OpenAI Platform](https://platform.openai.com/api-keys)にアクセス
2. アカウントを作成またはログイン
3. 「Create new secret key」をクリック
4. キーを安全に保存

### 4. Ollama（ローカルLLM）

1. [Ollama公式サイト](https://ollama.ai/)からインストール
2. PowerShellで以下を実行：

   ```powershell
   # Ollamaのインストール（Windows）
   winget install Ollama.Ollama

   # サービスを開始
   ollama serve

   # モデルをダウンロード
   ollama pull llama3.2:3b
   ```

## 現在のAPI制限と対策

### レート制限

| プロバイダー | 無料プラン制限  | 対策                                 |
| ------------ | --------------- | ------------------------------------ |
| Gemini       | 60リクエスト/分 | 5リクエスト/分に制限、キャッシュ活用 |
| Claude       | 制限あり        | バックエンドプロキシ推奨             |
| OpenAI       | 3リクエスト/分  | 2リクエスト/分に制限、15秒リトライ   |
| Ollama       | 制限なし        | ローカル実行のため制限なし           |

### エラー時の自動フォールバック

1. **認証エラー（401）**: 自動的に別のプロバイダーに切り替え
2. **レート制限（429）**: 待機後、別のプロバイダーで再試行
3. **CORS エラー**: Claude使用時はGeminiに自動切り替え

## トラブルシューティング

### よくある問題と解決方法

#### 1. "API Key Invalid" エラー

- `.env`ファイルが正しく作成されているか確認
- APIキーが正しくコピーされているか確認
- 開発サーバーを再起動（`npm run dev`）

#### 2. "Rate Limit Exceeded" エラー

- しばらく待ってから再試行
- 別のAIプロバイダーを選択
- Ollamaのローカル実行を検討

#### 3. Claude APIが使えない

- ブラウザから直接使用不可（CORS制限）
- バックエンドプロキシの実装が必要
- 代替としてGeminiまたはOllamaを使用

#### 4. Ollamaが接続できない

- `ollama serve`が実行されているか確認
- ポート11434が使用可能か確認
- ファイアウォール設定を確認

## セキュリティ上の注意

1. **`.env`ファイルをGitにコミットしない**
   - `.gitignore`に含まれていることを確認
2. **APIキーを定期的に更新**
   - 3ヶ月ごとの更新を推奨
3. **本番環境では環境変数を使用**
   - ハードコーディングは避ける
4. **最小権限の原則**
   - 必要最小限の権限のみ付与

### 本番環境でのキー取り扱いポリシー（推奨）

- すべての本番キーはホスティングプラットフォームの「Environment Variables」で管理（例: Vercel Project Settings）。
- `VITE_` で始まるキーはフロントに埋め込まれユーザーから可視化され得るため、可能な限りサーバープロキシ経由に置換。
- プレビュー/本番はスコープ分離（Preview/Production）し、キーは環境ごとに分割管理。
- ローテーションは90日以下の周期、漏えい時は即時失効＋再デプロイ。
- ログにはトークンを出力しない（マスク/削除）。
- アクセス範囲・クォータは最小限に設定し、不要な権限は付与しない。

## 推奨設定

### 開発環境

```env
VITE_GEMINI_API_KEY=your_dev_key
VITE_OLLAMA_MODEL=llama3.2:3b
VITE_DEBUG_MODE=true
```

### 本番環境

```env
VITE_GEMINI_API_KEY=your_prod_key
VITE_OPENAI_API_KEY=your_prod_key
VITE_DEBUG_MODE=false
```

## サポート

問題が解決しない場合は、以下を確認してください：

1. コンソールログのエラーメッセージ
2. ネットワークタブでのAPIレスポンス
3. `.env`ファイルの設定内容（APIキーは隠して）

詳細なログを有効にする場合：

```javascript
// src/services/ai/QuadrantClassificationService.ts
ENV.DEBUG_MODE = true;
```
