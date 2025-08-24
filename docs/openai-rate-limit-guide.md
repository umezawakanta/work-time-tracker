# OpenAI GPT-4 レート制限対策ガイド

## 問題の概要

OpenAI APIは特に無料トライアルやTier 1アカウントの場合、非常に厳しいレート制限があります：

- **RPM (Requests Per Minute)**: 3-10リクエスト/分
- **TPM (Tokens Per Minute)**: 10,000-40,000トークン/分
- **RPD (Requests Per Day)**: 100-200リクエスト/日（無料アカウント）

## 実装された対策

### 1. プロバイダー別レート制限設定

```typescript
const RATE_LIMIT = {
  openai: {
    requestsPerMinute: 3, // 非常に保守的な制限
    retryDelay: 5000, // 5秒の初期リトライ遅延
    maxRetries: 5, // より多くのリトライ回数
    maxTasksPerAnalysis: 5, // 最大5タスクまで
    initialDelay: 2000, // 2秒の初期待機
  },
  // Gemini, Claudeは従来通り
};
```

### 2. リトライメカニズム

- **指数バックオフ**: リトライごとに待機時間を2倍に増加
  - 1回目: 5秒
  - 2回目: 10秒
  - 3回目: 20秒
  - 4回目: 40秒
  - 5回目: 80秒

### 3. タスク数の制限

- **OpenAI**: 最大5タスク/分析
- **Gemini/Claude**: 最大15タスク/分析

### 4. キャッシュの活用

- 一度分析したタスクは永続キャッシュに保存
- プロバイダー間でキャッシュ共有
- API呼び出しを最大90%削減

## ユーザーへの推奨事項

### 開発環境での使用

1. **Geminiを優先使用**
   - 無料枠: 1日1500リクエスト
   - 高速レスポンス
   - レート制限が緩い

2. **OpenAIは限定的に使用**
   - 重要なタスクのみ
   - 少数のタスクで検証
   - 精度比較のために使用

### 本番環境での使用

1. **OpenAI Tierアップグレード**

   ```
   Tier 1: 3 RPM, $5支払い必要
   Tier 2: 50 RPM, $50支払い必要
   Tier 3: 500 RPM, $100支払い必要
   Tier 4: 5000 RPM, $250支払い必要
   ```

2. **代替案の検討**
   - 大量タスク: Gemini
   - バランス: Claude
   - 高精度少数: GPT-4

## エラーの対処法

### 429エラーが発生した場合

1. **即座の対処**
   - プロバイダーをGeminiに切り替え
   - キャッシュをクリアしない（既存の分析結果を活用）
   - タスク数を減らして再試行

2. **長期的な対処**
   - OpenAI Dashboardで使用量を確認
   - Tierアップグレードを検討
   - 月次予算制限を設定

### よくあるエラーメッセージ

```
POST https://api.openai.com/v1/chat/completions 429 (Too Many Requests)
```

**意味**: レート制限に達した
**対処**: 自動リトライが動作するまで待つ、またはプロバイダー変更

```
402 Payment Required
```

**意味**: クレジット不足
**対処**: OpenAI Dashboardで支払い方法を更新

## パフォーマンス最適化

### 1. バッチ処理の回避

OpenAIでは同時処理を避け、順次処理：

```typescript
// ❌ 避けるべき
await Promise.all(tasks.map(classify));

// ✅ 推奨
for (const task of tasks) {
  await classify(task);
  await sleep(2000); // 2秒待機
}
```

### 2. キャッシュヒット率の向上

- タスク内容が変わらない限りキャッシュを活用
- 不要なキャッシュクリアを避ける

### 3. タスクの優先順位付け

重要なタスクのみOpenAIで分析：

```javascript
const importantTasks = tasks.filter((t) => t.priority === 'high');
const regularTasks = tasks.filter((t) => t.priority !== 'high');

// 重要タスク → GPT-4
// 通常タスク → Gemini
```

## モニタリング

### OpenAI Dashboard

1. [OpenAI Platform](https://platform.openai.com/usage)にアクセス
2. 使用量を確認：
   - Daily usage
   - Monthly usage
   - Rate limit status

### アプリケーション内

- コンソールログで確認：
  - キャッシュヒット率
  - リトライ回数
  - API呼び出し数

## コスト管理

### 月間コスト目安（OpenAI）

| タスク数/月 | コスト | 備考       |
| ----------- | ------ | ---------- |
| 100         | $1.50  | テスト利用 |
| 500         | $7.50  | 小規模利用 |
| 1000        | $15.00 | 中規模利用 |
| 5000        | $75.00 | 大規模利用 |

### コスト削減のヒント

1. **キャッシュを最大活用**
2. **Geminiとの併用**
3. **タスクの事前フィルタリング**
4. **月次予算アラートの設定**

## まとめ

OpenAI GPT-4は最高精度のAI分析を提供しますが、レート制限とコストに注意が必要です。開発・テストはGeminiで行い、本番環境では用途に応じてプロバイダーを使い分けることを推奨します。

---

最終更新: 2025年1月17日
