# ハイブリッドAI分析機能 実装ドキュメント

## 概要

複数のAIプロバイダー（Gemini、Claude、OpenAI、Ollama）を統合し、タスク分析の精度と可用性を向上させる機能を実装しました。

## 実装内容

### 1. ハイブリッドAI分析機能

- **場所**: `src/services/ai/QuadrantClassificationService.ts`
- **メソッド**: `hybridClassifyTask()`
- **機能**:
  - 複数のAIプロバイダーに並列でタスク分析を依頼
  - 結果を投票システムで統合し、最適な分類を決定
  - 各AIの結果を重み付けして平均化

### 2. 自動フォールバック機能

- **認証エラー（401）対応**:
  - APIキーが無効な場合、自動的に別のプロバイダーに切り替え
  - エラーログを出力し、ユーザーに通知

- **レート制限（429）対応**:
  - レート制限に達した場合、自動的に別のプロバイダーに切り替え
  - 段階的なリトライと待機時間の調整

### 3. プロバイダー優先順位

```javascript
const priorityOrder = ['gemini', 'openai', 'ollama', 'claude'];
```

- ブラウザ環境ではClaude APIを除外（CORS制限のため）

## API設定と制限

### レート制限設定

| プロバイダー | リクエスト/分 | リトライ遅延 | 最大タスク数 |
| ------------ | ------------- | ------------ | ------------ |
| Gemini       | 5             | 5秒          | 10           |
| Claude       | 10            | 3秒          | 20           |
| OpenAI       | 2             | 15秒         | 3            |
| Ollama       | 60            | 1秒          | 50           |

### 必要な環境変数

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ANTHROPIC_API_KEY=your_claude_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_OLLAMA_MODEL=llama3.2:3b
```

## Premium ユーザー設定

- **対象ユーザー**: `kanta13jp@gmail.com`
- **設定場所**: `src/components/dailyToDoReminder/controls/usePremiumFeatures.ts`
- **有効期限**: 2025年12月31日まで
- **機能**: すべてのPremium機能へのアクセス

## 既知の問題と対処

### 1. API認証エラー

- **問題**: OpenAI APIキーが無効
- **対処**: 自動的にGeminiまたはOllamaにフォールバック

### 2. CORS制限

- **問題**: Claude APIはブラウザから直接呼び出せない
- **対処**: ブラウザ環境では自動的に除外

### 3. レート制限

- **問題**: 無料プランでのAPI制限
- **対処**:
  - リクエスト間隔の自動調整
  - キャッシュの活用
  - 自動プロバイダー切り替え

## 使用方法

### 通常の分析

```typescript
const service = QuadrantClassificationService.getInstance();
const result = await service.classifyTask(task);
```

### ハイブリッド分析

```typescript
const service = QuadrantClassificationService.getInstance();
const result = await service.hybridClassifyTask(task);
```

### バッチ分析（ハイブリッドモード）

```typescript
const service = QuadrantClassificationService.getInstance();
const results = await service.classifyTasks(tasks, true); // true = ハイブリッドモード
```

## パフォーマンス最適化

### キャッシュシステム

- タスクの内容ベースでキャッシュ
- 最大100件まで保持
- ローカルストレージに永続化

### バッチ処理

- 複数タスクを効率的に処理
- レート制限を考慮した段階的処理
- キャッシュヒット率の表示

## テスト失敗について

現在199件のテストが失敗していますが、これは主にUIコンポーネントのスタイリング変更によるものです：

### 主な原因

- `bg-background` → `bg-white`
- `bg-muted` → `bg-gray-200`
- テーマベースのクラス → 明示的な色指定

### 修正方法

1. テストファイルのクラス名期待値を更新
2. または、コンポーネントをテーマベースのクラスに戻す

## 今後の改善案

1. **バックエンドプロキシの実装**
   - Claude APIのCORS問題を解決
   - APIキーをサーバー側で管理

2. **カスタムモデルの選択**
   - ユーザーが使用するAIモデルを選択可能に
   - コスト/精度のバランスを調整

3. **分析結果の学習**
   - ユーザーのフィードバックを収集
   - 分析精度の継続的改善

4. **エラー通知の改善**
   - トースト通知での詳細なエラー表示
   - リトライボタンの追加
