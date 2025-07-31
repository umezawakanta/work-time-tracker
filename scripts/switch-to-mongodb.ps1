# 🗄️ MongoDB認証切り替えスクリプト (Windows PowerShell)
# Work Time Tracker MongoDB Authentication Switch

Write-Host "🗄️ MongoDB + JWT認証システムに切り替え中..." -ForegroundColor Yellow

# Step 1: 現在のFirebase版をバックアップ
Write-Host "📦 現在のApp.tsxをバックアップ中..." -ForegroundColor Cyan
if (Test-Path "src/App.tsx") {
    Move-Item "src/App.tsx" "src/App.firebase.backup.tsx" -Force
    Write-Host "✅ src/App.tsx → src/App.firebase.backup.tsx" -ForegroundColor Green
}

# Step 2: MongoDB版をアクティブ化
Write-Host "🚀 MongoDB版アプリをアクティブ化中..." -ForegroundColor Cyan
if (Test-Path "src/App.mongodb.tsx") {
    Copy-Item "src/App.mongodb.tsx" "src/App.tsx" -Force
    Write-Host "✅ src/App.mongodb.tsx → src/App.tsx" -ForegroundColor Green
} else {
    Write-Host "❌ エラー: src/App.mongodb.tsx が見つかりません" -ForegroundColor Red
    exit 1
}

# Step 3: 環境変数確認
Write-Host "🔧 MongoDB環境変数を確認中..." -ForegroundColor Cyan
if (-not $env:REACT_APP_API_URL) {
    Write-Host "⚠️  警告: REACT_APP_API_URL が設定されていません" -ForegroundColor Yellow
    Write-Host "📝 .env.local ファイルに以下を追加してください:" -ForegroundColor White
    Write-Host ""
    Write-Host "REACT_APP_API_URL=http://localhost:3001"
    Write-Host "MONGODB_URI=mongodb://localhost:27017/worktime-tracker"
    Write-Host "JWT_SECRET=your_jwt_secret_key"
    Write-Host ""
} else {
    Write-Host "✅ MongoDB環境変数が設定されています" -ForegroundColor Green
}

Write-Host "🎉 MongoDB + JWT認証への切り替え完了！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 MongoDB認証の特徴:"
Write-Host "✅ 完全カスタム制御"
Write-Host "✅ 管理者権限システム完備"
Write-Host "✅ 高性能セッション管理"
Write-Host "✅ 企業レベル品質"
Write-Host ""
Write-Host "🔙 Firebase認証に戻すには:"
Write-Host "   PowerShell scripts/switch-to-firebase.ps1"