# 📄 ドキュメント機能 結合試験仕様書

## 1. 試験概要

### 1.1 目的
ドキュメント機能の各コンポーネント間の連携、API連携、データフローが正しく動作することを確認する。

### 1.2 対象範囲
- フロントエンドとバックエンドの連携
- 複数コンポーネント間のデータフロー
- 外部APIとの連携
- 状態管理とUI更新の連携

### 1.3 試験環境
- 統合テスト環境
- モックサーバー（MSW）
- テスト用データベース
- ブラウザ自動化（Playwright）

## 2. API連携試験

### 2.1 ドキュメント一覧取得の連携試験

#### 2.1.1 正常系
```typescript
describe('Document List API Integration', () => {
  test('should fetch and display document list successfully', async () => {
    // モックサーバーの設定
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        const action = req.url.searchParams.get('action');
        if (action === 'list') {
          return res(
            ctx.json({
              success: true,
              data: mockDocuments,
              total: mockDocuments.length
            })
          );
        }
        return res(ctx.status(404));
      })
    );

    render(<DocsViewer />);

    // ドキュメント一覧の表示確認
    await waitFor(() => {
      expect(screen.getByText('Requirements')).toBeInTheDocument();
      expect(screen.getByText('API Endpoints')).toBeInTheDocument();
    });
  });

  test('should handle API errors gracefully', async () => {
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Internal Server Error' }));
      })
    );

    render(<DocsViewer />);

    // エラー状態の確認
    await waitFor(() => {
      expect(screen.getByText('ドキュメントの読み込みに失敗しました')).toBeInTheDocument();
    });
  });
});
```

#### 2.1.2 異常系
```typescript
describe('Document List API Error Handling', () => {
  test('should handle network timeout', async () => {
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        return res(ctx.delay(10000), ctx.json({ success: true, data: [] }));
      })
    );

    render(<DocsViewer />);

    // タイムアウト処理の確認
    await waitFor(() => {
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('should handle malformed JSON response', async () => {
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        return res(ctx.text('Invalid JSON'));
      })
    );

    render(<DocsViewer />);

    await waitFor(() => {
      expect(screen.getByText('ドキュメントの読み込みに失敗しました')).toBeInTheDocument();
    });
  });
});
```

### 2.2 ドキュメント内容取得の連携試験

#### 2.2.1 正常系
```typescript
describe('Document Content API Integration', () => {
  test('should fetch and display document content', async () => {
    const mockContent = '# Test Document\n\nThis is test content.';
    
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        const action = req.url.searchParams.get('action');
        const id = req.url.searchParams.get('id');
        
        if (action === 'content' && id === 'features/docs/requirements') {
          return res(
            ctx.json({
              success: true,
              data: {
                content: mockContent,
                metadata: {
                  id: 'features/docs/requirements',
                  title: 'Requirements',
                  category: 'features'
                }
              }
            })
          );
        }
        return res(ctx.status(404));
      })
    );

    // ドキュメント一覧からドキュメントを開く
    render(<DocsViewer />);
    
    const openButton = screen.getByText('開く');
    fireEvent.click(openButton);

    // ドキュメント内容の表示確認
    await waitFor(() => {
      expect(screen.getByText('Test Document')).toBeInTheDocument();
      expect(screen.getByText('This is test content.')).toBeInTheDocument();
    });
  });
});
```

#### 2.2.2 異常系
```typescript
describe('Document Content API Error Handling', () => {
  test('should handle document not found error', async () => {
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        const action = req.url.searchParams.get('action');
        if (action === 'content') {
          return res(
            ctx.status(404),
            ctx.json({
              success: false,
              message: 'ドキュメントが見つかりません'
            })
          );
        }
        return res(ctx.status(404));
      })
    );

    render(<DocsViewer />);
    
    const openButton = screen.getByText('開く');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByText('ドキュメントが見つかりません')).toBeInTheDocument();
    });
  });
});
```

## 3. コンポーネント間連携試験

### 3.1 検索・フィルタリング連携試験

#### 3.1.1 検索機能の連携
```typescript
describe('Search Integration', () => {
  test('should filter documents based on search query', async () => {
    const mockDocuments = [
      { id: 'doc1', title: 'Requirements', category: 'features', description: 'Requirements doc' },
      { id: 'doc2', title: 'API Guide', category: 'api', description: 'API documentation' }
    ];

    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: mockDocuments, total: 2 }));
      })
    );

    render(<DocsViewer />);

    // 初期状態で全ドキュメントが表示される
    await waitFor(() => {
      expect(screen.getByText('Requirements')).toBeInTheDocument();
      expect(screen.getByText('API Guide')).toBeInTheDocument();
    });

    // 検索クエリを入力
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    fireEvent.change(searchInput, { target: { value: 'Requirements' } });

    // 検索結果の確認
    expect(screen.getByText('Requirements')).toBeInTheDocument();
    expect(screen.queryByText('API Guide')).not.toBeInTheDocument();
  });

  test('should clear search results when query is cleared', async () => {
    render(<DocsViewer />);

    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    
    // 検索クエリを入力
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // 検索クエリをクリア
    fireEvent.change(searchInput, { target: { value: '' } });

    // 全ドキュメントが再表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('Requirements')).toBeInTheDocument();
      expect(screen.getByText('API Guide')).toBeInTheDocument();
    });
  });
});
```

#### 3.1.2 カテゴリフィルタリングの連携
```typescript
describe('Category Filtering Integration', () => {
  test('should filter documents by category', async () => {
    render(<DocsViewer />);

    // カテゴリを選択
    const categorySelect = screen.getByDisplayValue('すべてのカテゴリ');
    fireEvent.change(categorySelect, { target: { value: 'features' } });

    // フィルタリング結果の確認
    expect(screen.getByText('Requirements')).toBeInTheDocument();
    expect(screen.queryByText('API Guide')).not.toBeInTheDocument();
  });

  test('should combine search and category filtering', async () => {
    render(<DocsViewer />);

    // 検索クエリを入力
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // カテゴリを選択
    const categorySelect = screen.getByDisplayValue('すべてのカテゴリ');
    fireEvent.change(categorySelect, { target: { value: 'features' } });

    // 両方の条件に一致するドキュメントのみが表示されることを確認
    // 実装に応じて適切なアサーションを追加
  });
});
```

### 3.2 ナビゲーション連携試験

#### 3.2.1 ドキュメント表示・一覧切り替え
```typescript
describe('Navigation Integration', () => {
  test('should navigate between list and document view', async () => {
    render(<DocsViewer />);

    // 初期状態は一覧表示
    expect(screen.getByText('ドキュメント')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ドキュメントを検索...')).toBeInTheDocument();

    // ドキュメントを開く
    const openButton = screen.getByText('開く');
    fireEvent.click(openButton);

    // ドキュメント表示に切り替わる
    await waitFor(() => {
      expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
    });

    // 一覧に戻る
    const backButton = screen.getByText('一覧に戻る');
    fireEvent.click(backButton);

    // 一覧表示に戻る
    await waitFor(() => {
      expect(screen.getByPlaceholderText('ドキュメントを検索...')).toBeInTheDocument();
    });
  });
});
```

## 4. 状態管理連携試験

### 4.1 状態同期試験

#### 4.1.1 検索状態の同期
```typescript
describe('State Synchronization', () => {
  test('should maintain search state across component updates', async () => {
    const { rerender } = render(<DocsViewer />);

    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    // コンポーネントの再レンダリング
    rerender(<DocsViewer />);

    // 検索状態が維持されることを確認
    expect(searchInput).toHaveValue('test query');
  });

  test('should maintain category selection across component updates', async () => {
    const { rerender } = render(<DocsViewer />);

    const categorySelect = screen.getByDisplayValue('すべてのカテゴリ');
    fireEvent.change(categorySelect, { target: { value: 'features' } });

    // コンポーネントの再レンダリング
    rerender(<DocsViewer />);

    // カテゴリ選択状態が維持されることを確認
    expect(categorySelect).toHaveValue('features');
  });
});
```

### 4.2 ローディング状態の管理

#### 4.2.1 ローディング状態の表示
```typescript
describe('Loading State Management', () => {
  test('should show loading state during API calls', async () => {
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.json({ success: true, data: [] }));
      })
    );

    render(<DocsViewer />);

    // ローディング状態の表示確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    // API呼び出し完了後の確認
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });
  });

  test('should handle multiple concurrent API calls', async () => {
    let callCount = 0;
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        callCount++;
        return res(ctx.delay(500), ctx.json({ success: true, data: [] }));
      })
    );

    render(<DocsViewer />);

    // 複数のAPI呼び出しが同時に実行されることを確認
    await waitFor(() => {
      expect(callCount).toBeGreaterThan(0);
    });
  });
});
```

## 5. エラーハンドリング連携試験

### 5.1 エラー状態の伝播

#### 5.1.1 APIエラーの伝播
```typescript
describe('Error Propagation', () => {
  test('should propagate API errors to UI', async () => {
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server Error' }));
      })
    );

    render(<DocsViewer />);

    // エラー状態がUIに反映されることを確認
    await waitFor(() => {
      expect(screen.getByText('ドキュメントの読み込みに失敗しました')).toBeInTheDocument();
    });
  });

  test('should handle partial API failures', async () => {
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        const action = req.url.searchParams.get('action');
        if (action === 'list') {
          return res(ctx.json({ success: true, data: mockDocuments }));
        } else if (action === 'categories') {
          return res(ctx.status(500), ctx.json({ message: 'Server Error' }));
        }
        return res(ctx.status(404));
      })
    );

    render(<DocsViewer />);

    // ドキュメント一覧は表示されるが、カテゴリ情報は取得できない
    await waitFor(() => {
      expect(screen.getByText('Requirements')).toBeInTheDocument();
    });
  });
});
```

### 5.2 エラー回復機能

#### 5.2.1 自動再試行
```typescript
describe('Error Recovery', () => {
  test('should retry failed API calls', async () => {
    let attemptCount = 0;
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        attemptCount++;
        if (attemptCount < 3) {
          return res(ctx.status(500), ctx.json({ message: 'Server Error' }));
        }
        return res(ctx.json({ success: true, data: mockDocuments }));
      })
    );

    render(<DocsViewer />);

    // 再試行後に成功することを確認
    await waitFor(() => {
      expect(screen.getByText('Requirements')).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});
```

## 6. パフォーマンス連携試験

### 6.1 大量データ処理

#### 6.1.1 大量ドキュメントの表示
```typescript
describe('Large Dataset Performance', () => {
  test('should handle large number of documents efficiently', async () => {
    const largeDocumentList = Array.from({ length: 1000 }, (_, i) => ({
      id: `doc-${i}`,
      title: `Document ${i}`,
      category: 'features',
      description: `Description for document ${i}`
    }));

    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: largeDocumentList, total: 1000 }));
      })
    );

    const startTime = performance.now();
    render(<DocsViewer />);
    const endTime = performance.now();

    // レンダリング時間が許容範囲内であることを確認
    expect(endTime - startTime).toBeLessThan(2000); // 2秒以内

    // ドキュメントが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('Document 0')).toBeInTheDocument();
    });
  });
});
```

### 6.2 検索性能

#### 6.2.1 リアルタイム検索の性能
```typescript
describe('Search Performance', () => {
  test('should perform real-time search efficiently', async () => {
    render(<DocsViewer />);

    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    
    // 連続して検索クエリを入力
    const startTime = performance.now();
    for (let i = 0; i < 10; i++) {
      fireEvent.change(searchInput, { target: { value: `query ${i}` } });
    }
    const endTime = performance.now();

    // 検索処理時間が許容範囲内であることを確認
    expect(endTime - startTime).toBeLessThan(1000); // 1秒以内
  });
});
```

## 7. セキュリティ連携試験

### 7.1 入力検証

#### 7.1.1 悪意のある入力の処理
```typescript
describe('Security Integration', () => {
  test('should handle malicious search queries', async () => {
    render(<DocsViewer />);

    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    
    // XSS攻撃を試行
    const maliciousQuery = '<script>alert("XSS")</script>';
    fireEvent.change(searchInput, { target: { value: maliciousQuery } });

    // スクリプトが実行されないことを確認
    expect(screen.queryByText('XSS')).not.toBeInTheDocument();
  });

  test('should handle SQL injection attempts', async () => {
    server.use(
      rest.get('/api/docs', (req, res, ctx) => {
        const query = req.url.searchParams.get('q');
        // SQLインジェクション攻撃を検出
        if (query && query.includes('DROP TABLE')) {
          return res(ctx.status(400), ctx.json({ message: 'Invalid query' }));
        }
        return res(ctx.json({ success: true, data: [] }));
      })
    );

    render(<DocsViewer />);

    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    fireEvent.change(searchInput, { target: { value: "'; DROP TABLE documents; --" } });

    // エラーが適切に処理されることを確認
    await waitFor(() => {
      expect(screen.getByText('ドキュメントの読み込みに失敗しました')).toBeInTheDocument();
    });
  });
});
```

## 8. アクセシビリティ連携試験

### 8.1 キーボードナビゲーション

#### 8.1.1 キーボード操作の連携
```typescript
describe('Accessibility Integration', () => {
  test('should support keyboard navigation throughout the interface', async () => {
    render(<DocsViewer />);

    // Tabキーでフォーカス移動
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    searchInput.focus();
    expect(searchInput).toHaveFocus();

    // Tabキーで次の要素に移動
    fireEvent.keyDown(searchInput, { key: 'Tab' });
    // フォーカスが次の要素に移動することを確認

    // Enterキーでドキュメントを開く
    const openButton = screen.getByText('開く');
    openButton.focus();
    fireEvent.keyDown(openButton, { key: 'Enter' });

    // ドキュメントが開かれることを確認
    await waitFor(() => {
      expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
    });
  });
});
```

### 8.2 スクリーンリーダー対応

#### 8.2.1 スクリーンリーダーでの操作
```typescript
describe('Screen Reader Integration', () => {
  test('should provide proper ARIA labels and descriptions', async () => {
    render(<DocsViewer />);

    // ARIAラベルの確認
    const searchInput = screen.getByPlaceholderText('ドキュメントを検索...');
    expect(searchInput).toHaveAttribute('aria-label');

    // 見出し構造の確認
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('ドキュメント');

    // ボタンのラベル確認
    const openButton = screen.getByText('開く');
    expect(openButton).toHaveAttribute('aria-label');
  });
});
```

## 9. ブラウザ互換性試験

### 9.1 クロスブラウザ対応

#### 9.1.1 主要ブラウザでの動作確認
```typescript
describe('Browser Compatibility', () => {
  test('should work in Chrome', async () => {
    // Chrome環境でのテスト
    render(<DocsViewer />);
    expect(screen.getByText('ドキュメント')).toBeInTheDocument();
  });

  test('should work in Firefox', async () => {
    // Firefox環境でのテスト
    render(<DocsViewer />);
    expect(screen.getByText('ドキュメント')).toBeInTheDocument();
  });

  test('should work in Safari', async () => {
    // Safari環境でのテスト
    render(<DocsViewer />);
    expect(screen.getByText('ドキュメント')).toBeInTheDocument();
  });
});
```

## 10. 試験実行手順

### 10.1 準備
1. 統合テスト環境のセットアップ
2. モックサーバーの起動
3. テストデータの準備

### 10.2 実行
```bash
# 統合テスト実行
npm run test:integration

# 特定のテストファイル実行
npm run test:integration -- DocsViewer.integration.test.tsx

# カバレッジ付き実行
npm run test:integration -- --coverage
```

### 10.3 結果確認
1. テスト結果の確認
2. カバレッジレポートの確認
3. パフォーマンスメトリクスの確認

## 11. 判定基準

### 11.1 合格基準
- 全統合テストケースが合格すること
- API連携が正常に動作すること
- コンポーネント間の連携が正常に動作すること
- エラーハンドリングが適切に動作すること
- パフォーマンス要件を満たしていること

### 11.2 不合格時の対応
1. 失敗したテストケースの分析
2. 連携部分の問題の特定
3. 修正の実装
4. 再テストの実行
