# AI プロバイダー設定ガイド

## 概要

Work Time Trackerの4象限マトリックス機能では、タスク分析にGemini AIまたはClaude AIを選択して使用できます。

## 対応AIプロバイダー

### 1. Google Gemini AI

- **モデル**: Gemini 2.0 Flash
- **特徴**: 高速レスポンス、無料枠あり
- **無料枠**: 1分間に60リクエスト、1日1500リクエスト

### 2. Anthropic Claude AI

- **モデル**: Claude 3 Haiku
- **特徴**: 高精度、コスト効率的
- **料金**: 従量課金制（無料枠なし）

## セットアップ手順

### 1. Gemini API キーの取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. APIキーをコピー

### 2. Claude API キーの取得

1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウントを作成またはログイン
3. 「API Keys」セクションに移動
4. 「Create Key」をクリック
5. APIキーをコピー

### 3. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の内容を追加：

```bash
# Gemini API Key (必須)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Claude API Key (オプション)
VITE_CLAUDE_API_KEY=your_claude_api_key_here
```

### 4. 自動設定スクリプト

#### Windows

```batch
scripts\setup-ai-providers.bat
```

#### Mac/Linux

```bash
chmod +x scripts/setup-ai-providers.sh
./scripts/setup-ai-providers.sh
```

## アプリケーションでの使用方法

### AIプロバイダーの切り替え

1. タスク管理センターの「4象限」タブを開く
2. 右上のAIプロバイダー選択ドロップダウンをクリック
3. 使用したいAIプロバイダーを選択
4. 「再分析」ボタンをクリックして新しいプロバイダーで分析を実行

### UIでの表示

- **✨ Google Gemini**: Gemini AIを使用
- **🤖 Anthropic Claude**: Claude AIを使用
- **(未設定)**: APIキーが設定されていないプロバイダー

## 機能比較

| 機能           | Gemini             | Claude   |
| -------------- | ------------------ | -------- |
| 無料枠         | あり               | なし     |
| レスポンス速度 | 高速               | 中速     |
| 分析精度       | 高                 | 非常に高 |
| 日本語対応     | 優秀               | 優秀     |
| レート制限     | 60/分              | 50/分    |
| コスト         | 無料枠後は従量課金 | 従量課金 |

## トラブルシューティング

### APIキーが認識されない

1. `.env`ファイルが正しい場所にあるか確認
2. キーの前後に余分なスペースがないか確認
3. アプリケーションを再起動

### レート制限エラー

1. 分析するタスク数を減らす
2. キャッシュ機能を活用
3. 異なるプロバイダーに切り替える

### 分析が失敗する

1. APIキーの有効性を確認
2. インターネット接続を確認
3. ブラウザコンソールでエラーを確認

## セキュリティに関する注意

- APIキーを公開リポジトリにコミットしない
- `.gitignore`に`.env`ファイルが含まれていることを確認
- 本番環境では環境変数を安全に管理

## キャッシュ機能

- 一度分析したタスクはキャッシュされ、再分析時に高速表示
- プロバイダー間でキャッシュは共有される
- ゴミ箱アイコンでキャッシュをクリア可能

## 推奨設定

### 開発環境

- **推奨**: Gemini（無料枠があるため）
- 高精度が必要な場合はClaude

### 本番環境

- **大量タスク**: Gemini（コスト効率）
- **高精度要求**: Claude（精度重視）

## API料金の目安

### Gemini

- 無料枠: 1日1500リクエストまで無料
- 超過分: $0.00025/1000文字

### Claude (Haiku)

- 入力: $0.25/100万トークン
- 出力: $1.25/100万トークン
- 平均的なタスク分析: 約$0.0002/タスク

## 今後の対応予定

- OpenAI GPT-4対応
- Mistral AI対応
- ローカルLLM対応（Ollama経由）

---

最終更新: 2025年1月17日
