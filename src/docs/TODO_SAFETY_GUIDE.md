# TODO Safety Guide

このガイドでは、アプリケーション全体でTodoアイテムを安全に操作するためのベストプラクティスを説明します。

## 🚨 よくある問題

### `Cannot read properties of undefined (reading '_id')` エラー

このエラーは以下の状況で発生します：

1. **Redux配列にundefinedが含まれている**
2. **型の不整合（Todo vs TodoItem）**
3. **APIからの不正なデータ**
4. **配列操作での不十分な検証**

## 🛠️ 解決策

### 1. 安全なユーティリティ関数の使用

```typescript
import { filterValidTodos, findTodoById, isValidTodoItem } from '@/utils/todoSafety';

// ❌ 危険な方法
const todo = todos.find((t) => t._id === targetId);
todo.task; // undefinedエラーの可能性

// ✅ 安全な方法
const todo = findTodoById(todos, targetId);
if (todo) {
  console.log(todo.task); // 安全
}
```

### 2. 配列操作での事前フィルタリング

```typescript
// ❌ 危険な方法
todos.map((todo) => ({
  id: todo._id,
  title: todo.task,
}));

// ✅ 安全な方法
import { filterValidTodos } from '@/utils/todoSafety';

filterValidTodos(todos).map((todo) => ({
  id: todo._id,
  title: todo.task,
}));
```

### 3. カスタムフックの使用

```typescript
import { useSafeTodoOperations } from '@/hooks/useSafeTodoOperations';

const MyComponent = () => {
  const { handleToggleComplete, handleDeleteTodo, getSafeTodo } = useSafeTodoOperations();

  const onToggle = (todoId: string) => {
    // 内部でエラーハンドリングと安全性チェックが行われる
    handleToggleComplete(todoId);
  };

  const onDelete = (todo: any) => {
    // TodoオブジェクトでもIDでも安全に処理
    handleDeleteTodo(todo);
  };

  return (
    <div>
      {/* コンポーネントの内容 */}
    </div>
  );
};
```

## 📋 チェックリスト

### コンポーネント作成時

- [ ] `todos.find()` には必ず `todos.find(t => t && t._id === id)` のように使用
- [ ] `todos.map()` の前に `filterValidTodos()` でフィルタリング
- [ ] `useSafeTodoOperations` フックの使用を検討
- [ ] 型定義は `TodoItem` を使用（ローカルの `Todo` 型は避ける）

### Redux操作時

- [ ] `fetchTodos.fulfilled` で重複排除とバリデーション
- [ ] `addTodo.fulfilled` で既存チェック
- [ ] エラーハンドリングの実装

### API連携時

- [ ] レスポンスデータのバリデーション
- [ ] 不正なデータの除外
- [ ] フォールバック値の設定

## 🔧 実装例

### 安全なTodoリストコンポーネント

```typescript
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { filterValidTodos } from '@/utils/todoSafety';
import { useSafeTodoOperations } from '@/hooks/useSafeTodoOperations';

const SafeTodoList: React.FC = () => {
  const rawTodos = useSelector((state: RootState) => state.todo.items);
  const { handleToggleComplete, handleDeleteTodo } = useSafeTodoOperations();

  // 安全にフィルタリング
  const validTodos = filterValidTodos(rawTodos);
  const pendingTodos = validTodos.filter(todo => !todo.completed);

  return (
    <div>
      {pendingTodos.map(todo => (
        <div key={todo._id} className="todo-item">
          <span>{todo.task}</span>
          <button onClick={() => handleToggleComplete(todo._id)}>
            完了
          </button>
          <button onClick={() => handleDeleteTodo(todo._id)}>
            削除
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 安全な検索機能

```typescript
import { findTodoById, filterValidTodos } from '@/utils/todoSafety';

const handleTaskClick = (taskId: string) => {
  const todo = findTodoById(todos, taskId);

  if (todo) {
    // 安全にプロパティアクセス
    setSelectedTask(todo);
    setEditForm({
      title: todo.task,
      description: todo.note || '',
      priority: todo.priority,
    });
  } else {
    toast.error('タスクが見つかりません');
  }
};
```

## ⚠️ 注意事項

1. **直接的なプロパティアクセスを避ける**

   ```typescript
   // ❌ 避ける
   const taskTitle = todo._id;

   // ✅ 推奨
   const taskTitle = getSafeTodoId(todo);
   ```

2. **型ガードを活用する**

   ```typescript
   if (isValidTodoItem(todo)) {
     // この中では安全にアクセス可能
     console.log(todo._id, todo.task);
   }
   ```

3. **デバッグ時の診断**

   ```typescript
   import { diagnoseTodoArray } from '@/utils/todoSafety';

   // 問題のあるTodo配列の診断
   diagnoseTodoArray(todos, 'MyComponent');
   ```

## 🔄 マイグレーション

既存のコンポーネントを安全にマイグレーションする手順：

1. **依存関係の追加**

   ```typescript
   import { filterValidTodos, useSafeTodoOperations } from '@/utils/todoSafety';
   ```

2. **配列操作の置換**

   ```typescript
   // Before
   const incompleteTasks = todos.filter((todo) => !todo.completed);

   // After
   const incompleteTasks = filterValidTodos(todos).filter((todo) => !todo.completed);
   ```

3. **操作関数の置換**

   ```typescript
   // Before
   const handleToggle = async (todoId: string) => {
     await dispatch(updateTodoItem({ _id: todoId, updates: { completed: true } }));
   };

   // After
   const { handleToggleComplete } = useSafeTodoOperations();
   ```

これらのガイドラインに従うことで、Todo関連のエラーを大幅に削減できます。
