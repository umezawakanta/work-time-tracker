#!/bin/bash

# 🔥 Firebase認証切り替えスクリプト
# Work Time Tracker Firebase Authentication Switch

echo "🔥 Firebase認証システムに切り替え中..."

# Step 1: 現在のアプリをバックアップ
echo "📦 現在のApp.tsxをバックアップ中..."
if [ -f "src/App.tsx" ]; then
    mv src/App.tsx src/App.mongodb.tsx
    echo "✅ src/App.tsx → src/App.mongodb.tsx"
fi

# Step 2: Firebase版をアクティブ化
echo "🚀 Firebase版アプリをアクティブ化中..."
if [ -f "src/App.firebase.tsx" ]; then
    cp src/App.firebase.tsx src/App.tsx
    echo "✅ src/App.firebase.tsx → src/App.tsx"
else
    echo "❌ エラー: src/App.firebase.tsx が見つかりません"
    exit 1
fi

# Step 3: 環境変数確認
echo "🔧 Firebase環境変数を確認中..."
if [ -z "$REACT_APP_FIREBASE_API_KEY" ]; then
    echo "⚠️  警告: REACT_APP_FIREBASE_API_KEY が設定されていません"
    echo "📝 .env.local ファイルに以下を追加してください:"
    echo ""
    echo "REACT_APP_FIREBASE_API_KEY=your_api_key"
    echo "REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com"
    echo "REACT_APP_FIREBASE_PROJECT_ID=your_project_id"
    echo "REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com"
    echo "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789"
    echo "REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123"
    echo ""
else
    echo "✅ Firebase環境変数が設定されています"
fi

# Step 4: 依存関係確認
echo "📦 Firebase依存関係を確認中..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm が見つかりません"
    exit 1
fi

# Firebase SDKインストール確認
if ! npm list firebase &> /dev/null; then
    echo "📦 Firebase SDKをインストール中..."
    npm install firebase
fi

echo "🎉 Firebase認証への切り替え完了！"
echo ""
echo "📋 次のステップ:"
echo "1. Firebase Console でプロジェクト作成"
echo "2. Authentication を有効化"
echo "3. Email/Password と Google 認証を有効化"
echo "4. 環境変数を .env.local に設定"
echo "5. npm start でアプリを起動"
echo ""
echo "🔙 MongoDB認証に戻すには:"
echo "   bash scripts/switch-to-mongodb.sh"