#!/bin/bash

# 🗄️ MongoDB認証切り替えスクリプト
# Work Time Tracker MongoDB Authentication Switch

echo "🗄️ MongoDB + JWT認証システムに切り替え中..."

# Step 1: 現在のFirebase版をバックアップ
echo "📦 現在のApp.tsxをバックアップ中..."
if [ -f "src/App.tsx" ]; then
    mv src/App.tsx src/App.firebase.backup.tsx
    echo "✅ src/App.tsx → src/App.firebase.backup.tsx"
fi

# Step 2: MongoDB版をアクティブ化
echo "🚀 MongoDB版アプリをアクティブ化中..."
if [ -f "src/App.mongodb.tsx" ]; then
    cp src/App.mongodb.tsx src/App.tsx
    echo "✅ src/App.mongodb.tsx → src/App.tsx"
else
    echo "❌ エラー: src/App.mongodb.tsx が見つかりません"
    exit 1
fi

# Step 3: 環境変数確認
echo "🔧 MongoDB環境変数を確認中..."
if [ -z "$REACT_APP_API_URL" ]; then
    echo "⚠️  警告: REACT_APP_API_URL が設定されていません"
    echo "📝 .env.local ファイルに以下を追加してください:"
    echo ""
    echo "REACT_APP_API_URL=http://localhost:3001"
    echo "MONGODB_URI=mongodb://localhost:27017/worktime-tracker"
    echo "JWT_SECRET=your_jwt_secret_key"
    echo ""
else
    echo "✅ MongoDB環境変数が設定されています"
fi

echo "🎉 MongoDB + JWT認証への切り替え完了！"
echo ""
echo "📋 MongoDB認証の特徴:"
echo "✅ 完全カスタム制御"
echo "✅ 管理者権限システム完備"
echo "✅ 高性能セッション管理"
echo "✅ 企業レベル品質"
echo ""
echo "🔙 Firebase認証に戻すには:"
echo "   bash scripts/switch-to-firebase.sh"