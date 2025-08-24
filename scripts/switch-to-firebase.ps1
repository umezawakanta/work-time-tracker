# 🔥 Firebase認証切り替えスクリプト (Windows PowerShell)
# Work Time Tracker Firebase Authentication Switch

Write-Host "🔥 Firebase認証システムに切り替え中..." -ForegroundColor Yellow

# Step 1: 現在のアプリをバックアップ
Write-Host "📦 現在のApp.tsxをバックアップ中..." -ForegroundColor Cyan
if (Test-Path "src/App.tsx") {
    Move-Item "src/App.tsx" "src/App.mongodb.tsx" -Force
    Write-Host "✅ src/App.tsx → src/App.mongodb.tsx" -ForegroundColor Green
}

# Step 2: Firebase版をアクティブ化
Write-Host "🚀 Firebase版アプリをアクティブ化中..." -ForegroundColor Cyan
if (Test-Path "src/App.firebase.tsx") {
    Copy-Item "src/App.firebase.tsx" "src/App.tsx" -Force
    Write-Host "✅ src/App.firebase.tsx → src/App.tsx" -ForegroundColor Green
}
else {
    Write-Host "❌ エラー: src/App.firebase.tsx が見つかりません" -ForegroundColor Red
    exit 1
}

# Step 3: 環境変数確認
Write-Host "🔧 Firebase環境変数を確認中..." -ForegroundColor Cyan
if (-not $env:REACT_APP_FIREBASE_API_KEY) {
    Write-Host "⚠️  警告: REACT_APP_FIREBASE_API_KEY が設定されていません" -ForegroundColor Yellow
    Write-Host "📝 .env.local ファイルに以下を追加してください:" -ForegroundColor White
    Write-Host ""
    Write-Host "REACT_APP_FIREBASE_API_KEY=your_api_key"
    Write-Host "REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com"
    Write-Host "REACT_APP_FIREBASE_PROJECT_ID=your_project_id"
    Write-Host "REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com"
    Write-Host "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789"
    Write-Host "REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123"
    Write-Host ""
}
else {
    Write-Host "✅ Firebase環境変数が設定されています" -ForegroundColor Green
}

# Step 4: 依存関係確認
Write-Host "📦 Firebase依存関係を確認中..." -ForegroundColor Cyan
try {
    $npmList = npm list firebase 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 Firebase SDKをインストール中..." -ForegroundColor Yellow
        npm install firebase
    }
}
catch {
    Write-Host "❌ npm が見つかりません" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Firebase認証への切り替え完了！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 次のステップ:"
Write-Host "1. Firebase Console でプロジェクト作成"
Write-Host "2. Authentication を有効化"
Write-Host "3. Email/Password と Google 認証を有効化"
Write-Host "4. 環境変数を .env.local に設定"
Write-Host "5. npm start でアプリを起動"
Write-Host ""
Write-Host "🔙 MongoDB認証に戻すには:"
Write-Host "   PowerShell scripts/switch-to-mongodb.ps1"