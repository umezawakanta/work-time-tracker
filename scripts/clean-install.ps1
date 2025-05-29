# クリーンインストールスクリプト

Write-Host "🧹 クリーンインストールを開始します..." -ForegroundColor Yellow

# Node.jsバージョン確認
$nodeVersion = node --version
Write-Host "Node.js バージョン: $nodeVersion" -ForegroundColor Cyan

if ($nodeVersion -match "v(\d+)\.") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -lt 20) {
        Write-Host "❌ Node.js v20以上が必要です。現在: $nodeVersion" -ForegroundColor Red
        Write-Host "https://nodejs.org/ から最新版をインストールしてください" -ForegroundColor Yellow
        exit 1
    }
}

# 既存のファイルを削除
Write-Host "📦 既存のファイルを削除中..." -ForegroundColor Yellow

# node_modulesの削除を試みる
if (Test-Path "node_modules") {
    try {
        # まずは通常の削除を試す
        Remove-Item "node_modules" -Recurse -Force -ErrorAction Stop
    }
    catch {
        Write-Host "⚠️  通常の削除に失敗。代替方法を試します..." -ForegroundColor Yellow
        
        # cmdを使用した削除
        $result = cmd /c "rmdir /s /q node_modules 2>&1"
        
        if (Test-Path "node_modules") {
            Write-Host "❌ node_modulesの削除に失敗しました。手動で削除してください。" -ForegroundColor Red
            exit 1
        }
    }
}

# その他のファイルを削除
$filesToRemove = @(
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    ".pnpm-store",
    "dist",
    ".next"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ $file を削除しました" -ForegroundColor Green
    }
}

# pnpmのキャッシュをクリア
Write-Host "🧹 pnpmキャッシュをクリア中..." -ForegroundColor Yellow
pnpm store prune

# pnpmで依存関係をインストール
Write-Host "📦 pnpmで依存関係をインストール中..." -ForegroundColor Cyan
pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ インストール完了！" -ForegroundColor Green
    Write-Host ""
    Write-Host "次のコマンドで開発を開始できます:" -ForegroundColor Yellow
    Write-Host "  pnpm run dev" -ForegroundColor Cyan
}
else {
    Write-Host "❌ インストールに失敗しました" -ForegroundColor Red
}