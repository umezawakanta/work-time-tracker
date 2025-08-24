# 認証システム セットアップガイド

## 📋 概要

Work Time Trackerアプリケーションの認証システムは、以下の複数の認証プロバイダーに対応しています：

- **✅ Custom JWT認証** (デフォルト実装済み)
- **✅ Firebase Authentication** (実装済み)
- **⚙️ Supabase Authentication** (設定ガイドあり)

## 🚀 現在の実装状況

### ✅ 完成済み機能

1. **ユーザー認証フロー**

   - ログイン/ログアウト機能
   - ユーザー登録機能
   - パスワードリセット機能
   - メール確認機能

2. **セキュリティ機能**

   - JWT トークン管理 (アクセス + リフレッシュトークン)
   - 認証状態の永続化 (localStorage)
   - 自動トークンリフレッシュ
   - セッション管理とタイムアウト

3. **UI/UX**
   - 保護されたルート (PrivateRoute)
   - 管理者ルート (AdminRoute)
   - 美しい認証画面
   - エラーハンドリング
   - ローディング状態

## 🔧 認証プロバイダー設定

### 1. Custom JWT認証 (推奨・実装済み)

#### 特徴

- 自前のサーバーでトークンを管理
- 完全にカスタマイズ可能
- 実装済みで即座に利用可能

#### 使用方法

```typescript
// そのまま使用可能 - 追加設定不要
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { login, logout, user, isAuthenticated } = useAuth();
  // ...
}
```

### 2. Firebase Authentication

#### セットアップ手順

1. **Firebase プロジェクト作成**

   ```bash
   npm install firebase
   ```

2. **環境変数設定** (`.env`)

   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

3. **アプリケーション切り替え**
   - `src/main.tsx` で `App.firebase.tsx` を使用
   ```typescript
   import App from './App.firebase.tsx'; // Firebase版を使用
   ```

#### 対応機能

- ✅ Google OAuth
- ✅ メール/パスワード認証
- ✅ パスワードリセット
- ✅ メール確認

### 3. Supabase Authentication

#### セットアップ手順

1. **Supabase クライアント インストール**

   ```bash
   npm install @supabase/supabase-js
   ```

2. **環境変数設定** (`.env`)

   ```env
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Supabase AuthContext 作成**
   ```typescript
   // src/context/SupabaseAuthContext.tsx を作成
   // (必要に応じてFirebaseAuthContextを参考に実装)
   ```

#### 対応機能

- ✅ Google OAuth
- ✅ メール/パスワード認証
- ✅ パスワードリセット
- ✅ Row Level Security (RLS)

## 📁 ファイル構成

```
src/
├── context/
│   ├── AuthContext.tsx          # Custom JWT認証
│   ├── FirebaseAuthContext.tsx  # Firebase認証
│   └── (SupabaseAuthContext.tsx) # Supabase認証 (要作成)
├── services/
│   ├── api/
│   │   └── authApi.ts          # Custom JWT API
│   └── auth/
│       ├── AuthService.ts      # Firebase認証サービス
│       ├── TokenManager.ts     # JWT トークン管理
│       └── (SupabaseAuthService.ts) # Supabase認証 (要作成)
├── pages/
│   ├── Login.tsx              # ログインページ
│   ├── Register.tsx           # 登録ページ
│   ├── ForgotPassword.tsx     # パスワードリセット
│   ├── ResetPassword.tsx      # パスワード変更
│   └── EmailVerification.tsx  # メール確認
├── components/
│   ├── PrivateRoute.tsx       # 認証必須ルート
│   └── admin/
│       └── AdminRoute.tsx     # 管理者専用ルート
└── hooks/
    └── useAuth.ts             # 認証フック
```

## 🛠️ 使用方法

### 基本的な認証フック

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginComponent() {
  const {
    login,
    logout,
    register,
    resetPassword,
    user,
    isAuthenticated,
    loading
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // ログイン成功
    } catch (error) {
      // エラーハンドリング
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome, {user?.name}!</div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 保護されたルート

```typescript
import PrivateRoute from '@/components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
```

### 管理者専用ルート

```typescript
import AdminRoute from '@/components/admin/AdminRoute';

function App() {
  return (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
```

## 🔒 セキュリティ機能

### トークン管理

- **アクセストークン**: 1時間の有効期限
- **リフレッシュトークン**: 7日間の有効期限 (Remember Me: 30日)
- **自動リフレッシュ**: 期限5分前に自動更新
- **セキュアストレージ**: localStorage + 暗号化

### セッション管理

- **アクティビティ監視**: マウス/キーボード操作を監視
- **非アクティブ警告**: 25分後に警告表示
- **自動ログアウト**: 30分非アクティブでセッション終了
- **Remember Me**: ログイン状態の永続化

### その他のセキュリティ

- **CSRF保護**: トークンベース認証
- **XSS対策**: Content Security Policy
- **レート制限**: ログイン試行回数制限
- **入力検証**: フロントエンド + バックエンド検証

## 🎨 カスタマイズ

### テーマの変更

```typescript
// Tailwind CSSクラスを変更
const loginPageTheme = {
  background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
  card: 'shadow-lg border-0',
  button: 'bg-blue-600 hover:bg-blue-700',
};
```

### エラーメッセージのカスタマイズ

```typescript
// src/services/api/authApi.ts
const errorMessages = {
  'Invalid credentials': 'メールアドレスまたはパスワードが正しくありません',
  'User not found': 'ユーザーが見つかりません',
  // 他のメッセージ...
};
```

### 追加の認証プロバイダー

```typescript
// 新しいプロバイダーを追加する場合
// 1. サービスクラスを作成
// 2. コンテキストを作成
// 3. フックを作成
// 4. App.tsxでプロバイダーを切り替え
```

## 🧪 テスト

### ユニットテスト

```bash
npm test src/services/auth/
npm test src/context/AuthContext.test.tsx
```

### E2Eテスト

```bash
npm run test:e2e
# または
npx playwright test tests/auth/
```

## 📈 監視とログ

### ログ出力

```typescript
import { logger } from '@/utils/logger';

// 認証成功
logger.info('Auth', 'User logged in', { userId: user.id });

// 認証失敗
logger.error('Auth', 'Login failed', { email, error });
```

### メトリクス

- ログイン成功率
- パスワードリセット要求数
- セッション継続時間
- エラー発生率

## 🚨 トラブルシューティング

### よくある問題

1. **トークンが保存されない**

   - LocalStorageが無効になっていないか確認
   - ブラウザのセキュリティ設定を確認

2. **Firebase認証が動作しない**

   - APIキーが正しく設定されているか確認
   - Firebase Console で認証方法が有効になっているか確認

3. **Supabase接続エラー**

   - プロジェクトURLとANONキーが正しいか確認
   - RLSポリシーが適切に設定されているか確認

4. **CORS エラー**
   - バックエンドのCORS設定を確認
   - 開発サーバーのプロキシ設定を確認

### デバッグ方法

```typescript
// 認証状態のデバッグ
import { getAuthDebugInfo } from '@/services/api/authApi';

console.log('Auth Debug Info:', getAuthDebugInfo());

// TokenManagerのデバッグ
import { tokenManager } from '@/services/auth/TokenManager';

console.log('Token Debug Info:', tokenManager.getDebugInfo());
```

## 📞 サポート

認証システムに関する質問や問題がある場合：

1. このドキュメントを確認
2. コードのコメントを確認
3. 開発チームに問い合わせ

---

## 🎉 認証システム完成！

このガイドに従うことで、堅牢で使いやすい認証システムが完成します。セキュリティを最優先に設計されており、様々な認証プロバイダーに対応しています。

**Happy Coding! 🚀**
