# Gemini API 最適化とレート制限対策

## 2025年1月16日 更新

### 問題の詳細

- 複数の`useEffect`が同時に実行され、APIを重複呼び出し
- 27件のタスクが同時に分析されてレート制限（429エラー）に到達
- 初回ロード時に複数回分析が実行される

### 実施した対策

#### 1. 重複実行の防止

```typescript
// 分析中フラグを追加
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [hasInitialized, setHasInitialized] = useState(false);

// useCallbackで最適化
const runAnalysis = useCallback(
  async () => {
    if (isAnalyzing) {
      console.log('⏳ 分析が既に実行中です...');
      return;
    }
    // ...
  },
  [
    /* deps */
  ]
);
```

#### 2. useEffectの統合

- 初回実行と更新を1つの`useEffect`に統合
- 重複した分析実行を防止

#### 3. より厳格なレート制限

```javascript
const RATE_LIMIT = {
  requestsPerMinute: 10, // 10リクエスト/分（より保守的）
  retryDelay: 3000, // 3秒待機
  maxRetries: 3, // 最大3回リトライ
  batchSize: 1, // 1つずつ処理
  maxTasksPerAnalysis: 15, // 最大15タスク
  initialDelay: 1000, // 初回1秒待機
};
```

#### 4. 順次処理の改善

- タスクを1つずつ処理（並列処理を避ける）
- 各タスク間に1秒の待機時間
- 初回リクエスト前に1秒待機

#### 5. ユーザーフィードバックの改善

- タスク数制限の明確な通知
- 分析中の状態表示
- 再分析ボタンの状態管理

### パフォーマンスへの影響

#### 処理時間の目安

- 15タスク: 約15-20秒
- 10タスク: 約10-15秒
- 5タスク: 約5-8秒

#### トレードオフ

- **処理速度**: 遅くなったがAPIエラーを回避
- **安定性**: 大幅に向上
- **UX**: フィードバックで進捗が分かりやすくなった

### ベストプラクティス

#### 開発時の推奨設定

```typescript
// UnifiedTaskPage.tsx
<EisenhowerMatrix
  tasks={todos}
  showAnalytics={true}
  autoRefresh={false}      // 自動更新OFF
  refreshInterval={10}      // 10分間隔（使用時のみ）
/>
```

#### タスク管理のコツ

1. **重要なタスクを優先**: 最初の15件に重要なタスクを配置
2. **定期的なクリーンアップ**: 完了したタスクは削除
3. **手動更新**: 必要な時のみ「再分析」ボタンを使用

### エラー対処法

#### 429エラーが続く場合

1. ブラウザをリロード
2. 5分程度待機
3. タスク数を10件以下に減らす
4. キャッシュをクリア:
   ```javascript
   QuadrantClassificationService.getInstance().clearCache();
   ```

### 将来の改善案

1. **バックエンド処理**
   - サーバーサイドでAPI呼び出しを管理
   - キューシステムの実装

2. **プログレッシブ分析**
   - 優先度の高いタスクから順次分析
   - 結果を段階的に表示

3. **オフライン対応**
   - IndexedDBでの結果永続化
   - オフライン時はキャッシュのみ使用

4. **有料プラン移行**
   - Gemini Pro APIの有料プラン
   - レート制限の大幅緩和

---

最終更新: 2025年1月16日
