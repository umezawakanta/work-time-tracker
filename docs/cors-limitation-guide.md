# CORS制限とAIプロバイダーガイド

## 概要

ブラウザのセキュリティポリシー（CORS: Cross-Origin Resource Sharing）により、一部のAI APIは直接ブラウザから呼び出すことができません。

## 各プロバイダーのCORS対応状況

| プロバイダー | ブラウザ直接呼び出し | 対応方法                       |
| ------------ | -------------------- | ------------------------------ |
| **Gemini**   | ✅ 可能              | 直接使用可能                   |
| **Claude**   | ❌ 不可              | バックエンドサーバー経由で使用 |
| **OpenAI**   | ✅ 可能              | 直接使用可能（レート制限注意） |
| **Ollama**   | ✅ 可能              | ローカル実行のため問題なし     |

## Claudeを使用する場合

### 問題

Claude (Anthropic) APIはCORSヘッダーを提供していないため、ブラウザから直接呼び出すとエラーが発生します：

```
Access to XMLHttpRequest at 'https://api.anthropic.com/v1/messages' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

### 解決方法

#### 1. バックエンドサーバー経由で使用（推奨）

既存のバックエンドサーバー（`server-simple.ts`）にはAnthropicのプロキシエンドポイントが実装されています：

- エンドポイント: `http://localhost:3001/api/ai/anthropic`
- バックエンド経由でClaudeを使用する場合は、このエンドポイントを利用してください

#### 2. 代替プロバイダーを使用

以下のプロバイダーはブラウザから直接使用可能です：

- **Gemini**: Google AIの高性能モデル
- **OpenAI GPT-4**: 高精度だがコスト高
- **Ollama**: ローカル実行で無料・プライバシー保護

## レート制限への対処

### Gemini APIのレート制限

Gemini APIは無料枠でも使用できますが、レート制限があります：

- 1分あたり5リクエストに制限
- リトライ遅延: 5秒
- 最大リトライ回数: 3回

### 自動フォールバック機能

レート制限に達した場合、システムは自動的に以下の優先順位で別のプロバイダーに切り替えます：

1. **Gemini** (デフォルト)
2. **OpenAI** (精度重視)
3. **Ollama** (ローカル実行)
4. ~~**Claude**~~ (ブラウザでは使用不可)

### 手動での対処方法

1. **プロバイダーを切り替える**: ドロップダウンから別のAIプロバイダーを選択
2. **少し待つ**: レート制限は時間経過で解除されます（通常1分）
3. **キャッシュを活用**: 同じタスクの再分析は避ける
4. **タスク数を減らす**: 一度に分析するタスク数を制限

## 推奨設定

### ブラウザ使用時

```javascript
// 推奨プロバイダー優先順位
1. Gemini   - バランスが良い
2. Ollama   - ローカル実行で制限なし
3. OpenAI   - 高精度だがコスト注意
```

### 開発環境での設定

`.env`ファイルに以下を設定：

```env
# Gemini (推奨)
VITE_GEMINI_API_KEY=your_gemini_api_key

# OpenAI (オプション)
VITE_OPENAI_API_KEY=your_openai_api_key

# Claude (バックエンド経由でのみ使用)
VITE_ANTHROPIC_API_KEY=your_claude_api_key

# Ollama (ローカル実行)
VITE_OLLAMA_MODEL=llama3.2:3b
```

## トラブルシューティング

### CORSエラーが発生する場合

1. Claudeを選択していないか確認
2. 別のプロバイダーに切り替える
3. ブラウザのコンソールでエラーメッセージを確認

### レート制限エラーが頻発する場合

1. 自動フォールバックを有効にする
2. タスク数を減らす（優先度フィルター使用）
3. 分析間隔を空ける
4. Ollamaなどのローカルモデルを検討

### Ollamaが接続できない場合

1. Ollamaサーバーが起動しているか確認：`ollama serve`
2. ポート11434が開いているか確認
3. モデルがダウンロードされているか確認：`ollama list`

## 関連ドキュメント

- [AIプロバイダー設定ガイド](./ai-provider-setup.md)
- [自動フォールバックガイド](./auto-fallback-guide.md)
- [Ollama設定ガイド](./ollama-setup-guide.md)
